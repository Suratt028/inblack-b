'use strict';
// Site numbers recomputed independently from the raw files (no scripts/lib code) must equal site-data.json,
// and the 3 pages exist and read only data/site-data.json.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { buildSiteData } = require('../scripts/build-site-data');

const ROOT = path.resolve(__dirname, '..');
const RAW = path.join(ROOT, 'data', 'raw');
const read = (...p) => JSON.parse(fs.readFileSync(path.join(RAW, ...p), 'utf8'));
const r2 = (x) => Math.round((x + Number.EPSILON) * 100) / 100;
const site = buildSiteData();

test('site data: latest day, update time and day list come from the manifests', () => {
  const days = fs.readdirSync(RAW).filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d) && read(d, '_manifest.json').complete).sort();
  assert.deepEqual(site.days, days);
  assert.equal(site.latest_day, days[days.length - 1]);
  assert.equal(site.updated_at, read(site.latest_day, '_manifest.json').finished_at);
});

test('every game: score, verdict, factor points and THB prices equal an independent recomputation from raw', () => {
  const day = site.latest_day;
  const m = read(day, '_manifest.json');
  const rate = Number(read(day, 'fx-usd-thb.json').rates.THB);
  assert.equal(site.games.length, 5);
  for (const e of m.games) {
    const g = site.games.find((x) => x.game_id === String(e.gameID));
    assert.ok(g, e.gameID);
    const doc = read(day, e.files.game);
    const deal = read(day, e.files.deal);
    const best = doc.deals.reduce((b, d, i) => (Number(d.price) < Number(doc.deals[b].price) ? i : b), 0);
    const price = Number(doc.deals[best].price);
    const F1 = r2(40 * Math.min(100, Math.max(0, Number(doc.deals[best].savings))) / 100);
    const F2 = r2(price <= 0 ? 35 : 35 * Math.min(1, Number(doc.cheapestPriceEver.price) / price));
    const F3 = r2(Number(deal.gameInfo.steamRatingCount) > 0 ? 25 * Number(deal.gameInfo.steamRatingPercent) / 100 : 0);
    const score = r2(F1 + F2 + F3);
    assert.deepEqual(g.factors, { F1, F2, F3 }, g.title);
    assert.equal(g.score, score, g.title);
    assert.equal(g.verdict, score >= 70 ? 'buy' : score >= 40 ? 'wait' : 'skip', g.title);
    assert.equal(g.priceTHB, r2(price * rate));
    assert.equal(g.stores.length, doc.deals.length);
    for (const s of g.stores) {
      const d = doc.deals.find((x) => x.dealID === s.dealID);
      assert.equal(s.thb, r2(Number(d.price) * rate));
      assert.equal(s.link, `https://www.cheapshark.com/redirect?dealID=${d.dealID}`);
    }
    assert.equal(g.history.length, site.days.length);
  }
});

test('claims on the site are the verified brief claims (100% match) and the review rounds are included', () => {
  assert.equal(site.verification.ok, true, site.verification.issues.join('\n'));
  assert.equal(site.verification.matchPct, 100);
  const brief = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'brief.json'), 'utf8'));
  assert.equal(site.verification.claims, brief.reduce((n, g) => n + g.claims.length, 0));
  assert.ok(site.review && site.review.rounds.length >= 1);
});

test('3 pages exist, load only data/site-data.json, link stores only via CheapShark', () => {
  for (const p of ['index.html', 'game.html', 'evidence.html']) {
    const html = fs.readFileSync(path.join(ROOT, 'site', p), 'utf8');
    assert.match(html, /assets\/common\.js/);
    assert.doesNotMatch(html, /https?:\/\/(?!www\.cheapshark\.com|github\.com\/Suratt028\/inblack-b|frankfurter\.dev)[a-z0-9.-]+\.[a-z]{2,}\//i, `${p}: unexpected external link`);
  }
  const common = fs.readFileSync(path.join(ROOT, 'site', 'assets', 'common.js'), 'utf8');
  assert.match(common, /fetch\('data\/site-data\.json'/);
});
