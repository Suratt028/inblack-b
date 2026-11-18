#!/usr/bin/env node
'use strict';
// MCP server: official SDK, Streamable HTTP (stateless) at http://localhost:3000/mcp.
// Tools: compare_game_prices, explain_verdict. One JSON log line per tool call (stderr, and $MCP_LOG_FILE if set).
const { McpServer } = require('@modelcontextprotocol/sdk/server/mcp.js');
const { StreamableHTTPServerTransport } = require('@modelcontextprotocol/sdk/server/streamableHttp.js');
const { createMcpExpressApp } = require('@modelcontextprotocol/sdk/server/express.js');
const { CallToolRequestSchema } = require('@modelcontextprotocol/sdk/types.js');
const { summarizeArgs, logLine } = require('./tools/common');
const pkg = require('../package.json');

const TOOLS = [require('./tools/compare_game_prices'), require('./tools/explain_verdict')];

// Wrap the tools/call handler so every call logs exactly one line, including unknown tools and schema errors.
function logToolCalls(lowLevel) {
  const orig = lowLevel.setRequestHandler.bind(lowLevel);
  lowLevel.setRequestHandler = (schema, handler) => {
    if (schema !== CallToolRequestSchema) return orig(schema, handler);
    return orig(schema, async (request, extra) => {
      const t0 = Date.now();
      const base = () => ({ tool: request.params && request.params.name, args: summarizeArgs(request.params && request.params.arguments), duration_ms: Date.now() - t0 });
      try {
        const result = await handler(request, extra);
        if (result && result.isError) {
          const t = Array.isArray(result.content) && result.content[0] && result.content[0].text;
          logLine({ ...base(), ok: false, error: typeof t === 'string' ? t : 'tool error' });
        } else logLine({ ...base(), ok: true });
        return result;
      } catch (e) {
        logLine({ ...base(), ok: false, error: e && e.message ? e.message : String(e) });
        throw e;
      }
    });
  };
}

function createMcpServer() {
  const server = new McpServer({ name: 'inblack-b', version: pkg.version });
  logToolCalls(server.server);
  for (const t of TOOLS) server.registerTool(t.name, t.config, t.handler);
  return server;
}

const jsonRpcError = (res, status, code, message) => res.status(status).json({ jsonrpc: '2.0', error: { code, message }, id: null });

function createApp(host) {
  const app = createMcpExpressApp({ host });
  app.post('/mcp', async (req, res) => {
    const server = createMcpServer();
    const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
    res.on('close', () => { transport.close(); server.close(); });
    try {
      await server.connect(transport);
      await transport.handleRequest(req, res, req.body);
    } catch (e) {
      logLine({ event: 'http_error', ok: false, error: e.message });
      if (!res.headersSent) jsonRpcError(res, 500, -32603, 'Internal server error');
    }
  });
  const notAllowed = (req, res) => jsonRpcError(res, 405, -32000, 'Method not allowed (stateless server: use POST /mcp)');
  app.get('/mcp', notAllowed);
  app.delete('/mcp', notAllowed);
  return app;
}

// Start listening; resolves {port, url, close()}. port 0 = random free port.
function startServer({ port = 3000, host = '127.0.0.1' } = {}) {
  const app = createApp(host);
  return new Promise((resolve, reject) => {
    const http = app.listen(port, host);
    http.once('error', reject);
    http.once('listening', () => {
      const p = http.address().port;
      resolve({
        port: p, url: `http://localhost:${p}/mcp`, http,
        close: () => new Promise((r) => { if (http.closeAllConnections) http.closeAllConnections(); http.close(() => r()); }),
      });
    });
  });
}

if (require.main === module) {
  const port = process.env.PORT !== undefined ? Number(process.env.PORT) : 3000;
  if (!Number.isInteger(port) || port < 0 || port > 65535) { process.stderr.write(`invalid PORT ${process.env.PORT}\n`); process.exit(2); }
  startServer({ port }).then(({ url }) => logLine({ event: 'listening', url, tools: TOOLS.map((t) => t.name) }))
    .catch((e) => { process.stderr.write(`failed to start: ${e.message}\n`); process.exit(1); });
}

module.exports = { createMcpServer, createApp, startServer, TOOLS };
