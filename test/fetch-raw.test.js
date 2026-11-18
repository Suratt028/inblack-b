'use strict';
// fetch-raw.js with a mock fetch: request budget, User-Agent, 429 + Retry-After, one round per day, byte-exact files.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const { runRound, bangkokDay, parseRetryAfter, USER_AGENT, MAX_REQUESTS } = require('../scripts/fetch-raw');

const CONFIG = { games: [{ steamAppID: '10', title: 'Game Ten' }, { steamAppID: '20', title: 'Game Twenty' }] };
const NOW = new Date('2026-11-18T03:00:00Z'); // 10:00 in Bangkok

function mockApi({ status429At = null, retryAfter = '120' } = {}) {
  const calls = [];
  const fetchImpl = async (url, opts) => {
    calls.push({ url, ua: opts.headers['User-Agent'] });
    const n = calls.length;
    if (status429At === n) return { status: 429, headers: { get: (h) => (h === 'retry-after' ? retryAfter : null) }, arrayBuffer: async () => new ArrayBuffer(0) };
    let body;
    if (url.endsWith('/stores')) body = [{ storeID: '1', storeName: 'Steam', isActive: 1 }];
    else if (url.includes('frankfurter')) body = { amount: 1, base: 'USD', date: '2026-11-18', rates: { THB: 32.5 } };
    else if (url.includes('steamAppID=')) { const id = url.split('steamAppID=')[1]; body = [{ gameID: `g${id}`, steamAppID: id }]; }
    else if (url.includes('games?id=')) body = { info: { title: 'x' }, cheapestPriceEver: { price: '5.00', date: 1 }, deals: [{ storeID: '1', dealID: 'B', price: '9.00', retailPrice: '10.00', savings: '10.0' }, { storeID: '1', dealID: 'A%3D', price: '6.00', retailPrice: '10.00', savings: '40.0' }] };
    else if (url.includes('deals?id=')) body = { gameInfo: { steamRatingPercent: '90', steamRatingCount: '1000', salePrice: '6.00' } };
    else return { status: 404, headers: { get: () => null }, arrayBuffer: async () => new TextEncoder().encode('nope').buffer };
    const text = JSON.stringify(body, null, 1);
    return { status: 200, headers: { get: () => null }, arrayBuffer: async () => new TextEncoder().encode(text).buffer };
  };
  return { calls, fetchImpl };
}

const tmpRaw = () => fs.mkdtempSync(path.join(os.tmpdir(), 'raw-'));
const opts = (rawDir, api, extra = {}) => ({ rawDir, fetchImpl: api.fetchImpl, config: CONFIG, now: () => NOW, delayMs: 0, log: () => {}, ...extra });

test('bangkokDay uses UTC+7', () => {
  assert.equal(bangkokDay(new Date('2026-11-18T16:59:00Z')), '2026-11-18');
  assert.equal(bangkokDay(new Date('2026-11-18T17:00:00Z')), '2026-11-19');
});

test('parseRetryAfter: seconds and HTTP date', () => {
  assert.equal(parseRetryAfter('30', NOW), 30);
  assert.equal(parseRetryAfter(new Date(NOW.getTime() + 90000).toUTCString(), NOW), 90);
  assert.equal(parseRetryAfter(null, NOW), null);
});

test('full round: UA on every request, <= 30 requests, byte-exact files, cheapest deal fetched', async () => {
  const raw = tmpRaw();
  const api = mockApi();
  const m = await runRound(opts(raw, api));
  assert.equal(m.complete, true);
  assert.equal(m.day, '2026-11-18');
  assert.equal(api.calls.length, 2 + 3 * CONFIG.games.length);
  assert.ok(api.calls.length <= MAX_REQUESTS);
  assert.ok(api.calls.every((c) => c.ua === USER_AGENT));
  assert.ok(api.calls.some((c) => c.url.endsWith('deals?id=A%3D')), 'fetches the cheapest deal, dealID not re-encoded');
  for (const r of m.requests) {
    const body = fs.readFileSync(path.join(raw, m.day, r.file), 'utf8');
    assert.equal(crypto.createHash('sha256').update(body).digest('hex'), r.sha256);
  }
  assert.equal(m.games[0].gameID, 'g10');
  assert.equal(m.games[0].bestDealIndex, 1);
});

test('second round on the same day is refused without any request', async () => {
  const raw = tmpRaw();
  await runRound(opts(raw, mockApi()));
  const api2 = mockApi();
  await assert.rejects(runRound(opts(raw, api2)), (e) => e.code === 'DONE');
  assert.equal(api2.calls.length, 0);
});

test('HTTP 429 stops the round, records Retry-After, refuses early re-run, resumes after it', async () => {
  const raw = tmpRaw();
  const api = mockApi({ status429At: 3, retryAfter: '120' });
  await assert.rejects(runRound(opts(raw, api)), (e) => e.code === 'RETRY_AFTER');
  assert.equal(api.calls.length, 3, 'no request after the 429');
  const m = JSON.parse(fs.readFileSync(path.join(raw, '2026-11-18', '_manifest.json'), 'utf8'));
  assert.equal(m.complete, false);
  assert.equal(m.stopped.retry_after_s, 120);

  const early = mockApi();
  await assert.rejects(runRound(opts(raw, early, { now: () => new Date(NOW.getTime() + 60000) })), (e) => e.code === 'RETRY_AFTER');
  assert.equal(early.calls.length, 0);

  const later = mockApi();
  const m2 = await runRound(opts(raw, later, { now: () => new Date(NOW.getTime() + 121000) }));
  assert.equal(m2.complete, true);
  assert.equal(later.calls.length, 2 + 3 * CONFIG.games.length - 2, 'already-saved files are not fetched again');
  assert.equal(m2.request_count, 3 + later.calls.length, 'the 429 request counts against the budget');
  assert.equal(m2.stopped, undefined);
});

test('budget: never sends more than 30 requests in a round', async () => {
  const raw = tmpRaw();
  const many = { games: Array.from({ length: 12 }, (_, k) => ({ steamAppID: String(100 + k), title: `G${k}` })) };
  const api = mockApi();
  await assert.rejects(runRound(opts(raw, api, { config: many })), (e) => e.code === 'BUDGET');
  assert.equal(api.calls.length, MAX_REQUESTS);
});
