#!/usr/bin/env node
'use strict';
// One raw-data round per calendar day (Asia/Bangkok): CheapShark + Frankfurter responses saved byte-for-byte
// to data/raw/YYYY-MM-DD/, with _manifest.json (url, status, sha256, time of every request).
// Rules (brief p.6 + p.13): <= 30 requests per round, User-Agent naming the app, stop on HTTP 429 and honour
// Retry-After (a re-run before that time is refused; after it the round resumes and the same 30-request budget applies).
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { bestDealIndex } = require('./lib/metrics');
const { RAW_DIR } = require('./lib/raw');

const USER_AGENT = 'inblack-b/1.0';
const MAX_REQUESTS = 30;
const CHEAPSHARK = 'https://www.cheapshark.com/api/1.0';
const FX_URL = 'https://api.frankfurter.dev/v1/latest?base=USD&symbols=THB';
const CONFIG = path.resolve(__dirname, '..', 'config', 'games.json');

class StopRound extends Error {
  constructor(message, code) { super(message); this.code = code; }
}

// YYYY-MM-DD in Asia/Bangkok (UTC+7, no DST).
function bangkokDay(now) {
  return new Date(now.getTime() + 7 * 3600 * 1000).toISOString().slice(0, 10);
}

// Retry-After is either delta-seconds or an HTTP date. Returns seconds (>= 0) or null.
function parseRetryAfter(value, now) {
  if (value === null || value === undefined || value === '') return null;
  if (/^\d+$/.test(String(value).trim())) return Number(value);
  const t = Date.parse(value);
  return Number.isNaN(t) ? null : Math.max(0, Math.ceil((t - now.getTime()) / 1000));
}

async function runRound({
  fetchImpl = globalThis.fetch, rawDir = RAW_DIR, now = () => new Date(),
  config = JSON.parse(fs.readFileSync(CONFIG, 'utf8')), delayMs = 1200, log = (s) => process.stdout.write(s + '\n'),
} = {}) {
  const startedAt = now();
  const day = bangkokDay(startedAt);
  const dir = path.join(rawDir, day);
  const manifestFile = path.join(dir, '_manifest.json');
  let m = fs.existsSync(manifestFile) ? JSON.parse(fs.readFileSync(manifestFile, 'utf8')) : null;

  if (m && m.complete) throw new StopRound(`round for ${day} already complete (one round per day)`, 'DONE');
  if (m && m.stopped && m.stopped.not_before && Date.parse(m.stopped.not_before) > startedAt.getTime()) {
    throw new StopRound(`stopped by HTTP 429; Retry-After says not before ${m.stopped.not_before}`, 'RETRY_AFTER');
  }
  fs.mkdirSync(dir, { recursive: true });
  if (!m) {
    m = {
      day, user_agent: USER_AGENT, max_requests: MAX_REQUESTS, started_at: startedAt.toISOString(), finished_at: null,
      complete: false, request_count: 0, requests: [], files: { stores: 'stores.json', fx: 'fx-usd-thb.json' }, games: [],
    };
  }
  delete m.stopped;
  const save = () => fs.writeFileSync(manifestFile, JSON.stringify(m, null, 2) + '\n');
  const have = (file) => m.requests.some((r) => r.file === file && r.status === 200);
  const readSaved = (file) => JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
  let lastCall = 0;

  async function get(url, file) {
    if (have(file)) return readSaved(file);
    if (m.request_count >= MAX_REQUESTS) throw new StopRound(`request budget of ${MAX_REQUESTS} reached`, 'BUDGET');
    const wait = lastCall ? lastCall + delayMs - Date.now() : 0;
    if (wait > 0) await new Promise((r) => setTimeout(r, wait));
    m.request_count += 1;
    const at = now();
    lastCall = Date.now();
    const res = await fetchImpl(url, { headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' } });
    const rec = { n: m.request_count, url, status: res.status, fetched_at: at.toISOString() };
    if (res.status === 429) {
      const ra = parseRetryAfter(res.headers.get('retry-after'), at);
      const secs = ra === null ? 60 : ra;
      rec.retry_after = res.headers.get('retry-after');
      m.requests.push(rec);
      m.stopped = { reason: 'HTTP 429', retry_after_s: secs, not_before: new Date(at.getTime() + secs * 1000).toISOString() };
      save();
      throw new StopRound(`HTTP 429 from ${url}; stopping, retry after ${secs}s (${m.stopped.not_before})`, 'RETRY_AFTER');
    }
    const buf = Buffer.from(await res.arrayBuffer()); // byte-for-byte copy of the response body
    const body = buf.toString('utf8');
    if (res.status !== 200) {
      m.requests.push(rec);
      save();
      throw new StopRound(`HTTP ${res.status} from ${url}`, 'HTTP');
    }
    let parsed;
    try { parsed = JSON.parse(body); } catch { m.requests.push(rec); save(); throw new StopRound(`non-JSON body from ${url}`, 'HTTP'); }
    fs.writeFileSync(path.join(dir, file), buf);
    Object.assign(rec, { file, bytes: buf.length, sha256: crypto.createHash('sha256').update(buf).digest('hex') });
    m.requests.push(rec);
    save();
    log(`#${rec.n} ${res.status} ${url} -> ${file}`);
    return parsed;
  }

  await get(`${CHEAPSHARK}/stores`, m.files.stores);
  await get(FX_URL, m.files.fx);
  for (const g of config.games) {
    let entry = m.games.find((x) => x.steamAppID === g.steamAppID);
    if (!entry) {
      const lookupFile = `lookup-${g.steamAppID}.json`;
      let list = await get(`${CHEAPSHARK}/games?steamAppID=${encodeURIComponent(g.steamAppID)}`, lookupFile);
      let match = Array.isArray(list) ? list.find((x) => String(x.steamAppID) === g.steamAppID) : null;
      let usedFile = lookupFile;
      if (!match) { // fallback: exact title search
        usedFile = `lookup-${g.steamAppID}-title.json`;
        list = await get(`${CHEAPSHARK}/games?title=${encodeURIComponent(g.title)}&exact=1`, usedFile);
        match = Array.isArray(list) ? (list.find((x) => String(x.steamAppID) === g.steamAppID) || list[0]) : null;
      }
      if (!match) throw new StopRound(`no CheapShark game for steamAppID ${g.steamAppID}`, 'DATA');
      entry = { steamAppID: g.steamAppID, title: g.title, gameID: String(match.gameID), files: { lookup: usedFile } };
      m.games.push(entry);
      save();
    }
    entry.files.game = `game-${entry.gameID}.json`;
    const gameDoc = await get(`${CHEAPSHARK}/games?id=${encodeURIComponent(entry.gameID)}`, entry.files.game);
    const i = bestDealIndex(gameDoc);
    if (i < 0) throw new StopRound(`game ${entry.gameID} has no deals`, 'DATA');
    entry.bestDealIndex = i;
    entry.dealID = gameDoc.deals[i].dealID; // already URL-encoded by CheapShark
    entry.files.deal = `deal-${entry.gameID}.json`;
    await get(`${CHEAPSHARK}/deals?id=${entry.dealID}`, entry.files.deal);
    save();
  }
  m.complete = true;
  m.finished_at = now().toISOString();
  save();
  log(`round ${day} complete: ${m.request_count} requests`);
  return m;
}

module.exports = { runRound, bangkokDay, parseRetryAfter, StopRound, USER_AGENT, MAX_REQUESTS, FX_URL };

if (require.main === module) {
  runRound().catch((e) => {
    process.stderr.write(`fetch-raw: ${e.message}\n`);
    process.exit(e instanceof StopRound && e.code === 'DONE' ? 0 : e.code === 'RETRY_AFTER' ? 3 : 1);
  });
}
