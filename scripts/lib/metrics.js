'use strict';
// The METRICS.md formula. Pure functions over raw API files; every input carries its file + pointer.
const path = require('path');
const { getPointer, makePointer } = require('./pointer');
const raw = require('./raw');

const WEIGHTS = { F1: 40, F2: 35, F3: 25 };
const THRESHOLDS = { buy: 70, wait: 40 };
const LOW_REVIEW_COUNT = 500;

const r2 = (x) => Math.round((x + Number.EPSILON) * 100) / 100;
const num = (v) => (v === null || v === undefined || v === '' ? NaN : Number(v));
const cheapsharkLink = (dealID) => `https://www.cheapshark.com/redirect?dealID=${dealID}`;

// Index of the cheapest deal in a CheapShark /games?id= response (first one on ties); -1 if none.
function bestDealIndex(gameDoc) {
  const deals = (gameDoc && Array.isArray(gameDoc.deals)) ? gameDoc.deals : [];
  let best = -1;
  deals.forEach((d, i) => {
    const p = num(d.price);
    if (Number.isFinite(p) && (best === -1 || p < num(deals[best].price))) best = i;
  });
  return best;
}

function verdictFor(score) {
  if (score >= THRESHOLDS.buy) return 'buy';
  if (score >= THRESHOLDS.wait) return 'wait';
  return 'skip';
}

// Factors from plain numbers (used by tests and by analyzeGame).
function computeFactors({ savings, price, cheapestEver, rating, ratingCount }) {
  for (const [k, v] of Object.entries({ savings, price, cheapestEver })) {
    if (!Number.isFinite(v)) throw new Error(`computeFactors: ${k} is not a number (${v})`);
  }
  const F1 = r2(WEIGHTS.F1 * Math.max(0, Math.min(100, savings)) / 100);
  const F2 = r2(price <= 0 ? WEIGHTS.F2 : WEIGHTS.F2 * Math.min(1, cheapestEver / price));
  const F3 = r2(Number.isFinite(rating) && ratingCount > 0 ? WEIGHTS.F3 * rating / 100 : 0);
  const score = r2(F1 + F2 + F3);
  return { F1, F2, F3, score, verdict: verdictFor(score) };
}

function input(doc, file, pointer) {
  const g = getPointer(doc, pointer);
  return { value: g.found ? num(g.value) : NaN, raw: g.found ? g.value : undefined, file, pointer };
}

// Analyse one game (manifest entry) for one day.
function analyzeGame(day, entry, { root = raw.ROOT } = {}) {
  const dir = `data/raw/${day}`;
  const manifest = raw.readManifest(day, path.join(root, 'data', 'raw'));
  const gameFile = `${dir}/${entry.files.game}`;
  const dealFile = `${dir}/${entry.files.deal}`;
  const fxFile = `${dir}/${manifest.files.fx}`;
  const storesFile = `${dir}/${manifest.files.stores}`;
  const game = raw.loadRawFile(gameFile, root);
  const deal = raw.loadRawFile(dealFile, root);
  const fx = raw.loadRawFile(fxFile, root);
  const stores = raw.loadRawFile(storesFile, root);
  const problems = [];

  const i = bestDealIndex(game);
  if (i < 0) throw new Error(`${gameFile}: no deals`);
  const inputs = {
    price: input(game, gameFile, makePointer('deals', i, 'price')),
    savings: input(game, gameFile, makePointer('deals', i, 'savings')),
    retailPrice: input(game, gameFile, makePointer('deals', i, 'retailPrice')),
    cheapestEver: input(game, gameFile, '/cheapestPriceEver/price'),
    cheapestEverDate: input(game, gameFile, '/cheapestPriceEver/date'),
    rating: input(deal, dealFile, '/gameInfo/steamRatingPercent'),
    ratingCount: input(deal, dealFile, '/gameInfo/steamRatingCount'),
    fx: input(fx, fxFile, '/rates/THB'),
  };
  for (const k of ['price', 'savings', 'retailPrice', 'cheapestEver', 'fx']) {
    if (!Number.isFinite(inputs[k].value)) throw new Error(`${inputs[k].file}${inputs[k].pointer}: ${k} is not a number (${JSON.stringify(inputs[k].raw)})`);
  }
  const f = computeFactors({
    savings: inputs.savings.value, price: inputs.price.value, cheapestEver: inputs.cheapestEver.value,
    rating: inputs.rating.value, ratingCount: inputs.ratingCount.value,
  });

  // ---- problem data (shown on evidence.html) ----
  const at = (inp) => ({ file: inp.file, pointer: inp.pointer });
  if (game.deals[i].dealID !== entry.dealID) problems.push({ kind: 'deal-mismatch', detail: `best deal in the game file differs from the deal fetched (${entry.dealID})`, ...at(inputs.price) });
  if (!(inputs.ratingCount.value > 0)) problems.push({ kind: 'no-rating', detail: 'no Steam rating; F3 = 0', ...at(inputs.ratingCount) });
  else if (inputs.ratingCount.value < LOW_REVIEW_COUNT) problems.push({ kind: 'few-reviews', detail: `only ${inputs.ratingCount.value} Steam reviews`, ...at(inputs.ratingCount) });
  if (inputs.cheapestEver.value > inputs.price.value) problems.push({ kind: 'stale-all-time-low', detail: `cheapestPriceEver ${inputs.cheapestEver.raw} is above the current best price ${inputs.price.raw}`, ...at(inputs.cheapestEver) });
  if (fx.date !== day) problems.push({ kind: 'fx-date', detail: `exchange rate dated ${fx.date}, data collected ${day}`, file: fxFile, pointer: '/date' });
  const dealAtl = getPointer(deal, '/cheapestPrice');
  if (dealAtl.found && dealAtl.value && (num(dealAtl.value.price) !== inputs.cheapestEver.value || num(dealAtl.value.date) !== inputs.cheapestEverDate.value)) {
    const day = (s) => new Date(s * 1000).toISOString().slice(0, 10);
    problems.push({ kind: 'all-time-low-disagrees', detail: `all-time low ${inputs.cheapestEver.raw} on ${day(inputs.cheapestEverDate.value)} (games endpoint) vs ${dealAtl.value.price} on ${day(num(dealAtl.value.date))} (deals endpoint)`, file: dealFile, pointer: '/cheapestPrice' });
  }
  const salePrice = num(getPointer(deal, '/gameInfo/salePrice').value);
  if (Number.isFinite(salePrice) && salePrice !== inputs.price.value) problems.push({ kind: 'price-mismatch', detail: `deal file salePrice ${salePrice} differs from game file price ${inputs.price.raw}`, file: dealFile, pointer: '/gameInfo/salePrice' });

  const storeRows = game.deals.map((d, k) => {
    const sIdx = Array.isArray(stores) ? stores.findIndex((s) => String(s.storeID) === String(d.storeID)) : -1;
    const s = sIdx >= 0 ? stores[sIdx] : null;
    const price = num(d.price), retail = num(d.retailPrice), savings = num(d.savings);
    const row = {
      storeID: String(d.storeID), storeName: s ? s.storeName : `store ${d.storeID}`, storeActive: s ? Number(s.isActive) === 1 : false,
      price, retailPrice: retail, savings: r2(savings), thb: r2(price * inputs.fx.value), dealID: d.dealID, link: cheapsharkLink(d.dealID),
      source: { file: gameFile, pointer: makePointer('deals', k) },
      storeSource: s ? { file: storesFile, pointer: makePointer(sIdx, 'storeName') } : null,
    };
    if (!s) problems.push({ kind: 'unknown-store', detail: `storeID ${d.storeID} not in stores.json`, file: gameFile, pointer: makePointer('deals', k, 'storeID') });
    else if (!row.storeActive) problems.push({ kind: 'inactive-store', detail: `${s.storeName} is marked inactive`, file: storesFile, pointer: makePointer(sIdx, 'isActive') });
    if (retail > 0 && Math.abs((1 - price / retail) * 100 - savings) > 0.5) {
      problems.push({ kind: 'savings-mismatch', detail: `${row.storeName}: savings ${r2(savings)}% but 1 - price/retail = ${r2((1 - price / retail) * 100)}%`, file: gameFile, pointer: makePointer('deals', k, 'savings') });
    }
    return row;
  });

  return {
    day, game_id: String(entry.gameID), title: game.info && game.info.title ? game.info.title : entry.title,
    titleSource: { file: gameFile, pointer: '/info/title' }, steamAppID: entry.steamAppID,
    thumb: game.info && game.info.thumb ? game.info.thumb : null,
    bestDealIndex: i, bestLink: cheapsharkLink(game.deals[i].dealID),
    fxDate: fx.date, fxDateSource: { file: fxFile, pointer: '/date' },
    inputs, factors: { F1: f.F1, F2: f.F2, F3: f.F3 }, score: f.score, verdict: f.verdict,
    priceTHB: r2(inputs.price.value * inputs.fx.value), retailTHB: r2(inputs.retailPrice.value * inputs.fx.value),
    cheapestEverTHB: r2(inputs.cheapestEver.value * inputs.fx.value),
    stores: storeRows, problems,
  };
}

// Analyse all games for one day (default: latest completed day).
function analyzeDay(day, opts = {}) {
  const root = opts.root || raw.ROOT;
  const rawDir = path.join(root, 'data', 'raw');
  const d = day || raw.listDays(rawDir).slice(-1)[0];
  if (!d) throw new Error('no completed raw round in data/raw/');
  const m = raw.readManifest(d, rawDir);
  if (!m || m.complete !== true) throw new Error(`no completed raw round for ${d}`);
  return { day: d, fetched_at: m.finished_at, games: m.games.map((g) => analyzeGame(d, g, { root })) };
}

module.exports = { WEIGHTS, THRESHOLDS, LOW_REVIEW_COUNT, r2, bestDealIndex, verdictFor, computeFactors, analyzeGame, analyzeDay, cheapsharkLink };

if (require.main === module) {
  const res = analyzeDay(process.argv[2]);
  for (const g of res.games) {
    console.log(`${res.day} ${g.game_id} ${g.title}: ${g.verdict} ${g.score} (F1 ${g.factors.F1}, F2 ${g.factors.F2}, F3 ${g.factors.F3})`);
    for (const [k, v] of Object.entries(g.inputs)) console.log(`  ${k} = ${v.raw}  ${v.file}#${v.pointer}`);
    for (const p of g.problems) console.log(`  problem ${p.kind}: ${p.detail}`);
  }
}
