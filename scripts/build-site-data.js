#!/usr/bin/env node
'use strict';
// Build site/data/site-data.json from data/raw/** + data/brief.json + data/review.json.
// Every number on the site comes from this file, and every number here is recomputed from the raw files.
// Usage: node scripts/build-site-data.js [--out site/data/site-data.json]
const fs = require('fs');
const path = require('path');
const { ROOT, listDays, readManifest } = require('./lib/raw');
const { analyzeDay, WEIGHTS, THRESHOLDS } = require('./lib/metrics');
const { verifyBrief } = require('./verify-claims');

const src = (x) => ({ file: x.file, pointer: x.pointer });

function buildSiteData({ root = ROOT } = {}) {
  const days = listDays(path.join(root, 'data', 'raw'));
  if (!days.length) throw new Error('no collected raw data');
  const perDay = days.map((d) => analyzeDay(d, { root }));
  const latest = perDay[perDay.length - 1];
  const briefFile = path.join(root, 'data', 'brief.json');
  const brief = fs.existsSync(briefFile) ? JSON.parse(fs.readFileSync(briefFile, 'utf8')) : [];
  const check = verifyBrief(brief, { root });

  const games = latest.games.map((g) => {
    const b = brief.find((x) => x && x.game_id === g.game_id) || null;
    return {
      game_id: g.game_id, title: g.title, titleSource: g.titleSource, steamAppID: g.steamAppID, thumb: g.thumb,
      verdict: g.verdict, score: g.score, factors: g.factors,
      inputs: Object.fromEntries(Object.entries(g.inputs).map(([k, v]) => [k, { value: v.value, raw: v.raw, ...src(v) }])),
      fxDate: g.fxDate, fxDateSource: g.fxDateSource,
      priceTHB: g.priceTHB, retailTHB: g.retailTHB, cheapestEverTHB: g.cheapestEverTHB, bestLink: g.bestLink,
      stores: g.stores, problems: g.problems,
      history: perDay.map((d) => {
        const h = d.games.find((x) => x.game_id === g.game_id);
        return h ? { day: d.day, price: h.inputs.price.value, priceTHB: h.priceTHB, retail: h.inputs.retailPrice.value, score: h.score, verdict: h.verdict, source: src(h.inputs.price) } : { day: d.day, missing: true };
      }),
      summary_th: b ? b.summary_th : null,
      claims: check.claims.filter((c) => c.game_id === g.game_id),
    };
  });

  const reviewFile = path.join(root, 'data', 'review.json');
  const review = fs.existsSync(reviewFile) ? JSON.parse(fs.readFileSync(reviewFile, 'utf8')) : null;
  const rounds = days.map((d) => {
    const m = readManifest(d, path.join(root, 'data', 'raw'));
    return { day: d, request_count: m.request_count, user_agent: m.user_agent, started_at: m.started_at, finished_at: m.finished_at };
  });

  return {
    updated_at: latest.fetched_at, latest_day: latest.day, days,
    formula: { weights: WEIGHTS, thresholds: THRESHOLDS },
    games,
    verification: { ok: check.ok, matchPct: check.matchPct, claims: check.claims.length, issues: check.issues },
    review, rounds,
  };
}

module.exports = { buildSiteData };

if (require.main === module) {
  const i = process.argv.indexOf('--out');
  const out = path.resolve(i > 0 ? process.argv[i + 1] : path.join(ROOT, 'site', 'data', 'site-data.json'));
  const data = buildSiteData();
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, JSON.stringify(data, null, 1) + '\n');
  console.log(`wrote ${path.relative(process.cwd(), out)}: ${data.games.length} games, days ${data.days.join(', ')}, claims ${data.verification.claims} (${data.verification.matchPct}% match)`);
}
