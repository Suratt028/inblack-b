'use strict';
// MCP server end-to-end over Streamable HTTP with the official SDK client: initialize, ping, tools/list, tools/call.
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { Client } = require('@modelcontextprotocol/sdk/client/index.js');
const { StreamableHTTPClientTransport } = require('@modelcontextprotocol/sdk/client/streamableHttp.js');
const { startServer } = require('../mcp/server');
const { getPointer } = require('../scripts/lib/pointer');
const { analyzeDay } = require('../scripts/lib/metrics');
const { ROOT } = require('../scripts/lib/raw');

let srv, client;
const latest = analyzeDay();
const at = (s) => getPointer(JSON.parse(fs.readFileSync(path.join(ROOT, s.file), 'utf8')), s.pointer).value;

before(async () => {
  srv = await startServer({ port: 0 });
  client = new Client({ name: 'mcp-test', version: '0.0.0' });
  await client.connect(new StreamableHTTPClientTransport(new URL(srv.url)));
});
after(async () => { if (client) await client.close(); if (srv) await srv.close(); });

test('initialize: server info and tools capability', () => {
  assert.equal(client.getServerVersion().name, 'inblack-b');
  assert.ok(client.getServerCapabilities().tools);
});

test('ping', async () => { assert.deepEqual(await client.ping(), {}); });

test('tools/list: exactly compare_game_prices and explain_verdict, with schemas', async () => {
  const { tools } = await client.listTools();
  assert.deepEqual(tools.map((t) => t.name).sort(), ['compare_game_prices', 'explain_verdict']);
  for (const t of tools) {
    assert.equal(t.inputSchema.type, 'object');
    assert.ok(t.inputSchema.required.includes('game'));
    assert.equal(t.outputSchema.type, 'object');
  }
});

test('compare_game_prices: every store, cheapest first, THB = USD x rate, numbers trace to raw', async () => {
  for (const g of latest.games) {
    const r = await client.callTool({ name: 'compare_game_prices', arguments: { game: g.game_id } });
    assert.ok(!r.isError, JSON.stringify(r.content));
    const d = r.structuredContent;
    assert.equal(d.day, latest.day);
    assert.equal(d.stores.length, g.stores.length);
    for (let k = 1; k < d.stores.length; k++) assert.ok(d.stores[k - 1].price_usd <= d.stores[k].price_usd);
    assert.equal(Number(at(d.fx.source)), d.fx.usd_thb);
    for (const s of d.stores) {
      const deal = at(s.source);
      assert.equal(Number(deal.price), s.price_usd);
      assert.equal(s.price_thb, Math.round((s.price_usd * d.fx.usd_thb + Number.EPSILON) * 100) / 100);
      assert.ok(s.link.startsWith('https://www.cheapshark.com/redirect?dealID='));
    }
    assert.equal(Number(at(d.all_time_low.source)), d.all_time_low.usd);
  }
});

test('explain_verdict: same score/verdict as METRICS.md, inputs trace to raw; title lookup works', async () => {
  for (const g of latest.games) {
    const r = await client.callTool({ name: 'explain_verdict', arguments: { game: g.game_id } });
    assert.ok(!r.isError, JSON.stringify(r.content));
    const d = r.structuredContent;
    assert.equal(d.score, g.score);
    assert.equal(d.verdict, g.verdict);
    assert.equal(Math.round((d.factors.F1.points + d.factors.F2.points + d.factors.F3.points) * 100) / 100, d.score);
    for (const v of Object.values(d.inputs)) assert.equal(Number(at(v.source)), v.value);
  }
  const t = await client.callTool({ name: 'explain_verdict', arguments: { game: latest.games[1].title.slice(0, 4).toLowerCase() } });
  assert.equal(t.structuredContent.game_id, latest.games[1].game_id);
});

test('errors: unknown game and unknown day are tool errors, not crashes', async () => {
  const a = await client.callTool({ name: 'compare_game_prices', arguments: { game: 'no-such-game' } });
  assert.equal(a.isError, true);
  assert.match(a.content[0].text, /unknown game/);
  const b = await client.callTool({ name: 'explain_verdict', arguments: { game: latest.games[0].game_id, date: '1999-01-01' } });
  assert.equal(b.isError, true);
  assert.match(b.content[0].text, /no complete raw round/);
});
