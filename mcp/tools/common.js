'use strict';
// Shared helpers for the MCP tools: resolve a game + day from the committed raw data (no network calls).
const fs = require('fs');
const path = require('path');
const z = require('zod');
const raw = require('../../scripts/lib/raw');
const { analyzeGame } = require('../../scripts/lib/metrics');

class ToolInputError extends Error {}
const bad = (msg) => { throw new ToolInputError(msg); };

const gameInput = {
  game: z.string().min(1).describe('CheapShark gameID (e.g. "196149") or part of the game title (e.g. "hades")'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().describe('Raw-data day YYYY-MM-DD (default: latest collected day)'),
};
const sourceOut = z.object({ file: z.string(), pointer: z.string() });

// Returns { day, entry, analysis } for the requested game and day.
function resolveGame({ game, date }, { root = raw.ROOT } = {}) {
  const rawDir = path.join(root, 'data', 'raw');
  const days = raw.listDays(rawDir);
  if (!days.length) bad('no collected raw data in data/raw/');
  const day = date || days[days.length - 1];
  if (!days.includes(day)) bad(`no complete raw round for ${day}; available: ${days.join(', ')}`);
  const m = raw.readManifest(day, rawDir);
  const q = String(game).trim().toLowerCase();
  let entry = m.games.find((g) => String(g.gameID) === q);
  if (!entry) {
    const hits = m.games.filter((g) => g.title.toLowerCase().includes(q));
    if (hits.length > 1) bad(`"${game}" matches several games: ${hits.map((h) => `${h.title} (${h.gameID})`).join(', ')}`);
    entry = hits[0];
  }
  if (!entry) bad(`unknown game "${game}"; known: ${m.games.map((g) => `${g.title} (${g.gameID})`).join(', ')}`);
  return { day, days, entry, analysis: analyzeGame(day, entry, { root }) };
}

function readBrief(root = raw.ROOT) {
  const f = path.join(root, 'data', 'brief.json');
  try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch { return null; }
}

const src = (inp) => ({ file: inp.file, pointer: inp.pointer });

function summarizeArgs(args) {
  const s = {};
  for (const [k, v] of Object.entries(args || {})) s[k] = typeof v === 'string' ? v.slice(0, 80) : typeof v;
  return s;
}

// One JSON line per tool call on stderr; also appended to $MCP_LOG_FILE when set (used for AGENT_LOG evidence).
function logLine(obj) {
  const line = JSON.stringify({ ts: new Date().toISOString(), ...obj }) + '\n';
  process.stderr.write(line);
  if (process.env.MCP_LOG_FILE) { try { fs.appendFileSync(process.env.MCP_LOG_FILE, line); } catch { /* never break a call for logging */ } }
}

function wrap(compute) {
  return async (args) => {
    try {
      const { data, text } = await compute(args);
      return { structuredContent: data, content: [{ type: 'text', text: text + '\n' + JSON.stringify(data) }] };
    } catch (e) {
      const msg = e instanceof ToolInputError ? `invalid input: ${e.message}` : `error: ${e.message}`;
      return { isError: true, content: [{ type: 'text', text: msg }] };
    }
  };
}

module.exports = { z, ToolInputError, bad, gameInput, sourceOut, resolveGame, readBrief, src, summarizeArgs, logLine, wrap };
