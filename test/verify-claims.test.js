'use strict';
// verify-claims.js: accepts exact raw values, rejects wrong values, bad pointers, unbacked numbers, wrong verdicts.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { verifyBrief, checkClaim, numbersIn } = require('../scripts/verify-claims');
const { ROOT, listDays, readManifest } = require('../scripts/lib/raw');
const { analyzeGame } = require('../scripts/lib/metrics');

const day = listDays().slice(-1)[0];
const m = readManifest(day);

// A minimal correct brief built from the formula output (independent of data/brief.json).
function goodBrief() {
  return m.games.map((e) => {
    const a = analyzeGame(day, e);
    const c = (st, inp) => ({ statement_th: `${st} ${Number(inp.raw)}`, value: Number(inp.raw), source: { file: inp.file, pointer: inp.pointer } });
    return {
      game_id: String(e.gameID), verdict: a.verdict,
      summary_th: `${a.title} ราคา ${Number(a.inputs.price.raw)} USD`,
      claims: [c('ราคาตอนนี้ (USD)', a.inputs.price), c('รีวิวบวก %', a.inputs.rating)],
    };
  });
}

test('a statement with one backed and one unbacked number is rejected', () => {
  const b = goodBrief();
  b[0].claims[0].statement_th += ' ลด 99%';
  const r = verifyBrief(b);
  assert.equal(r.ok, false);
  assert.match(r.issues.join('\n'), /\[0\] .*claim 0: statement_th number\(s\) 99 have no matching claim/);
  assert.equal(r.claims.find((c) => c.game_id === b[0].game_id && c.index === 0).ok, false);
});

test('dates in text must come from a claimed Unix time or the raw day', () => {
  const b = goodBrief();
  const e = m.games[0];
  const a = analyzeGame(day, e);
  const ts = Number(a.inputs.cheapestEverDate.raw);
  const iso = new Date(ts * 1000).toISOString().slice(0, 10);
  b[0].claims.push({ statement_th: `วันที่ราคาต่ำสุด (Unix time ${ts})`, value: ts, source: { file: a.inputs.cheapestEverDate.file, pointer: a.inputs.cheapestEverDate.pointer } });
  b[0].summary_th += ` ต่ำสุดเมื่อ ${iso} ข้อมูลวันที่ ${day}`;
  assert.deepEqual(verifyBrief(b).issues, []);
  b[1].summary_th += ' ต่ำสุดเมื่อ 2001-01-01';
  assert.match(verifyBrief(b).issues.join('\n'), /\[1\].*summary_th date 2001-01-01 has no matching claim/);
});

test('numbersIn: commas, decimals, ignores dates, given title and labels like F1', () => {
  assert.deepEqual(numbersIn('ลด 87.04% จาก 1,299 บาท'), [87.04, 1299]);
  assert.deepEqual(numbersIn('F1 ได้ 12 ลด87% x64 -5'), [12, 87, -5]);
  assert.deepEqual(numbersIn('ข้อมูล 2026-11-18 ราคา 5'), [5]);
  assert.deepEqual(numbersIn("Baldur's Gate 3 ราคา 59.99", ["Baldur's Gate 3"]), [59.99]);
});

test('a brief built from the raw data passes', () => {
  const r = verifyBrief(goodBrief());
  assert.deepEqual(r.issues, []);
  assert.equal(r.matchPct, 100);
});

test('rejects: wrong value, missing pointer, file outside data/raw, unbacked summary number, wrong verdict', () => {
  const b = goodBrief();
  b[0].claims[0].value += 1;
  b[1].claims[0].source.pointer = '/deals/99/price';
  b[2].claims[0].source.file = 'package.json';
  b[3].summary_th += ' ถูกลง 50%';
  b[4].verdict = b[4].verdict === 'buy' ? 'skip' : 'buy';
  const r = verifyBrief(b);
  assert.equal(r.ok, false);
  const txt = r.issues.join('\n');
  assert.match(txt, /\[0\].*value .* != raw/);
  assert.match(txt, /\[1\].*pointer \/deals\/99\/price not found/);
  assert.match(txt, /\[2\].*cannot read package\.json|\[2\].*not a raw data file/);
  assert.match(txt, /\[3\].*summary_th number 50 has no matching claim/);
  assert.match(txt, /\[4\].*METRICS\.md gives/);
  assert.equal(r.matchPct, 70); // 7 of 10 claims match
});

test('checkClaim: statement number must equal value; non-numeric target rejected', () => {
  const e = m.games[0];
  const file = `data/raw/${day}/${e.files.game}`;
  assert.equal(checkClaim({ statement_th: 'ชื่อ', value: 1, source: { file, pointer: '/info/title' } }, ROOT).ok, false);
  const a = analyzeGame(day, e);
  const bad = { statement_th: 'ราคา 1.00', value: Number(a.inputs.price.raw), source: { file, pointer: a.inputs.price.pointer } };
  assert.match(checkClaim(bad, ROOT).reason, /statement_th shows/);
});

test('data/brief.json (when present) passes verification', { skip: !fs.existsSync(path.join(ROOT, 'data', 'brief.json')) }, () => {
  const r = verifyBrief(JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'brief.json'), 'utf8')));
  assert.deepEqual(r.issues, []);
});
