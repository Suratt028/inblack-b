'use strict';
// METRICS.md formula + JSON Pointer + raw-data integrity (committed rounds are untouched, <= 30 requests, UA).
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { getPointer, makePointer } = require('../scripts/lib/pointer');
const { computeFactors, verdictFor, bestDealIndex, analyzeDay } = require('../scripts/lib/metrics');
const { RAW_DIR, listDays, readManifest } = require('../scripts/lib/raw');

test('JSON Pointer: arrays, escapes, missing', () => {
  const doc = { deals: [{ price: '1.5' }], 'a/b': { '~x': 7 } };
  assert.deepEqual(getPointer(doc, '/deals/0/price'), { found: true, value: '1.5' });
  assert.equal(getPointer(doc, '/a~1b/~0x').value, 7);
  assert.equal(getPointer(doc, '/deals/1').found, false);
  assert.equal(getPointer(doc, '/deals/01').found, false);
  assert.equal(getPointer(doc, 'deals').found, false);
  assert.equal(makePointer('a/b', 0, '~x'), '/a~1b/0/~0x');
});

test('formula: weights, caps and thresholds from METRICS.md', () => {
  // p.7 example: 87.04% off, ATL ratio 0.857, rating 68 -> 34.82 + 30 + 17 = 81.82 buy
  const f = computeFactors({ savings: 87.04, price: 7, cheapestEver: 6, rating: 68, ratingCount: 1000 });
  assert.deepEqual(f, { F1: 34.82, F2: 30, F3: 17, score: 81.82, verdict: 'buy' });
  // ATL above current price is capped at 35; free game gets 35
  assert.equal(computeFactors({ savings: 0, price: 10, cheapestEver: 12, rating: 0, ratingCount: 1 }).F2, 35);
  assert.equal(computeFactors({ savings: 100, price: 0, cheapestEver: 0, rating: 0, ratingCount: 1 }).F2, 35);
  // no reviews -> F3 = 0
  assert.equal(computeFactors({ savings: 0, price: 10, cheapestEver: 5, rating: 90, ratingCount: 0 }).F3, 0);
  assert.equal(verdictFor(70), 'buy');
  assert.equal(verdictFor(69.99), 'wait');
  assert.equal(verdictFor(40), 'wait');
  assert.equal(verdictFor(39.99), 'skip');
});

test('bestDealIndex: cheapest numeric price, first on ties, -1 when empty', () => {
  assert.equal(bestDealIndex({ deals: [{ price: '9.99' }, { price: '10.00' }, { price: '9.99' }] }), 0);
  assert.equal(bestDealIndex({ deals: [{ price: '10.00' }, { price: '2.50' }] }), 1);
  assert.equal(bestDealIndex({ deals: [] }), -1);
});

const days = listDays();

test('raw rounds: at least one complete day, <= 30 requests, UA names the app, files unchanged (sha256)', () => {
  assert.ok(days.length >= 1, 'no complete raw round in data/raw/');
  for (const d of days) {
    const m = readManifest(d);
    assert.equal(m.day, d);
    assert.ok(m.request_count <= 30, `${d}: ${m.request_count} requests`);
    assert.equal(m.requests.length, m.request_count);
    assert.match(m.user_agent, /^inblack-b\//);
    for (const r of m.requests.filter((x) => x.file)) {
      const body = fs.readFileSync(path.join(RAW_DIR, d, r.file));
      assert.equal(crypto.createHash('sha256').update(body).digest('hex'), r.sha256, `${d}/${r.file} changed after fetch`);
    }
  }
});

test('analyzeDay on real data: 5 games, each input resolves to the raw value at its pointer', () => {
  for (const d of days) {
    const res = analyzeDay(d);
    assert.equal(res.games.length, 5);
    for (const g of res.games) {
      for (const [k, inp] of Object.entries(g.inputs)) {
        const doc = JSON.parse(fs.readFileSync(path.join(RAW_DIR, '..', '..', inp.file), 'utf8'));
        assert.equal(getPointer(doc, inp.pointer).value, inp.raw, `${g.game_id} ${k}`);
      }
      const f = computeFactors({ savings: g.inputs.savings.value, price: g.inputs.price.value, cheapestEver: g.inputs.cheapestEver.value, rating: g.inputs.rating.value, ratingCount: g.inputs.ratingCount.value });
      assert.equal(g.score, f.score);
      assert.ok(g.stores.every((s) => s.link.startsWith('https://www.cheapshark.com/redirect?dealID=')));
    }
  }
});
