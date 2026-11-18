#!/usr/bin/env node
'use strict';
// Verify data/brief.json against data/raw/**: format, every claim value equals the raw value at file + pointer
// (rounded to 2 dp), every number written in summary_th / statement_th is backed by a claim of the same game,
// and every verdict equals the METRICS.md formula. Used by the verify-deal-claim skill.
// Usage: node scripts/verify-claims.js [brief.json] [--json]
const fs = require('fs');
const path = require('path');
const { getPointer } = require('./lib/pointer');
const { ROOT, loadRawFile } = require('./lib/raw');
const { analyzeGame, r2 } = require('./lib/metrics');
const raw = require('./lib/raw');

const VERDICTS = ['buy', 'wait', 'skip'];

// Numbers written in Thai/English text: 1,234.56 / 87% / 33.84. Ignores digits inside YYYY-MM-DD dates.
// `ignore`: strings (e.g. the game title "Baldur's Gate 3") removed before extracting numbers.
function numbersIn(text, ignore = []) {
  let t = String(text || '');
  for (const s of ignore) if (s) t = t.split(s).join(' ');
  t = t.replace(/\b\d{4}-\d{2}-\d{2}\b/g, ' ');
  // digits glued to Latin letters (F1, x64, USD5) are labels, not numbers; a leading minus is kept
  return (t.match(/(?<![A-Za-z\d.,])-?\d[\d,]*(?:\.\d+)?(?![A-Za-z\d])/g) || []).map((s) => Number(s.replace(/,/g, '')));
}

function checkClaim(claim, root, ignore = []) {
  const out = { ok: false, reason: '', actual: undefined };
  if (!claim || typeof claim !== 'object') return { ...out, reason: 'claim is not an object' };
  if (typeof claim.statement_th !== 'string' || !claim.statement_th.trim()) return { ...out, reason: 'missing statement_th' };
  if (typeof claim.value !== 'number' || !Number.isFinite(claim.value)) return { ...out, reason: 'value is not a number' };
  const src = claim.source;
  if (!src || typeof src.file !== 'string' || typeof src.pointer !== 'string') return { ...out, reason: 'missing source.file / source.pointer' };
  let doc;
  try { doc = loadRawFile(src.file, root); } catch (e) { return { ...out, reason: `cannot read ${src.file}: ${e.code || e.message}` }; }
  const g = getPointer(doc, src.pointer);
  if (!g.found) return { ...out, reason: `pointer ${src.pointer} not found in ${src.file}` };
  const actual = Number(g.value);
  if (g.value === null || g.value === '' || typeof g.value === 'object' || !Number.isFinite(actual)) return { ...out, actual: g.value, reason: `value at pointer is not a number (${JSON.stringify(g.value)})` };
  if (r2(actual) !== r2(claim.value)) return { ...out, actual: g.value, reason: `value ${claim.value} != raw ${g.value}` };
  const stated = numbersIn(claim.statement_th, ignore);
  if (stated.length && !stated.some((n) => r2(n) === r2(claim.value))) return { ...out, actual: g.value, reason: `statement_th shows ${stated.join(', ')} but value is ${claim.value}` };
  return { ok: true, reason: 'matches raw', actual: g.value };
}

function verifyBrief(brief, { root = ROOT } = {}) {
  const issues = [];
  const claims = [];
  if (!Array.isArray(brief)) return { ok: false, issues: ['brief.json must be an array'], claims, matchPct: 0 };
  const days = raw.listDays(path.join(root, 'data', 'raw'));
  const latest = days[days.length - 1];
  const manifest = latest ? raw.readManifest(latest, path.join(root, 'data', 'raw')) : null;
  if (brief.length !== 5) issues.push(`expected 5 games, got ${brief.length}`);
  const seen = new Set();
  brief.forEach((g, gi) => {
    const at = `[${gi}] game ${g && g.game_id}`;
    if (!g || typeof g.game_id !== 'string') { issues.push(`${at}: game_id must be a string`); return; }
    if (seen.has(g.game_id)) issues.push(`${at}: duplicate game_id`);
    seen.add(g.game_id);
    if (!VERDICTS.includes(g.verdict)) issues.push(`${at}: verdict must be buy|wait|skip`);
    if (typeof g.summary_th !== 'string' || !g.summary_th.trim()) issues.push(`${at}: missing summary_th`);
    if (!Array.isArray(g.claims) || g.claims.length === 0) { issues.push(`${at}: no claims`); return; }
    const entry = manifest && manifest.games.find((x) => String(x.gameID) === g.game_id);
    const a = entry ? analyzeGame(latest, entry, { root }) : null;
    const ignore = a ? [a.title, entry.title] : [];
    const values = [];
    g.claims.forEach((c, ci) => {
      const r = checkClaim(c, root, ignore);
      claims.push({ game_id: g.game_id, index: ci, statement_th: c && c.statement_th, value: c && c.value, source: c && c.source, ...r });
      if (!r.ok) issues.push(`${at} claim ${ci}: ${r.reason}`);
      else values.push(r2(c.value));
      if (r.ok && manifest && !String(c.source.file).startsWith('data/raw/')) issues.push(`${at} claim ${ci}: source outside data/raw`);
    });
    // every number in a statement must be backed by a claim of the same game (not only its own value)
    for (const c of claims.filter((x) => x.game_id === g.game_id && x.ok)) {
      const extra = numbersIn(c.statement_th, ignore).filter((n) => !values.includes(r2(n)));
      if (extra.length) {
        c.ok = false;
        c.reason = `statement_th number(s) ${extra.join(', ')} have no matching claim`;
        issues.push(`${at} claim ${c.index}: ${c.reason}`);
      }
    }
    for (const n of numbersIn(g.summary_th, ignore)) {
      if (!values.includes(r2(n))) issues.push(`${at}: summary_th number ${n} has no matching claim`);
    }
    if (!a) issues.push(`${at}: not in latest raw round ${latest || '(none)'}`);
    else {
      if (a.verdict !== g.verdict) issues.push(`${at}: verdict ${g.verdict} but METRICS.md gives ${a.verdict} (score ${a.score})`);
    }
  });
  const okClaims = claims.filter((c) => c.ok).length;
  return { ok: issues.length === 0, issues, claims, matchPct: claims.length ? r2(okClaims / claims.length * 100) : 0, day: latest };
}

module.exports = { verifyBrief, checkClaim, numbersIn };

if (require.main === module) {
  const args = process.argv.slice(2);
  const file = args.find((a) => !a.startsWith('--')) || path.join(ROOT, 'data', 'brief.json');
  const res = verifyBrief(JSON.parse(fs.readFileSync(file, 'utf8')));
  if (args.includes('--json')) process.stdout.write(JSON.stringify(res, null, 2) + '\n');
  else {
    for (const c of res.claims) console.log(`${c.ok ? 'ACCEPT' : 'REJECT'}  ${c.game_id}#${c.index}  ${c.value}  ${c.source && c.source.file}#${c.source && c.source.pointer}  ${c.ok ? '' : c.reason}`);
    for (const i of res.issues) console.log(`ISSUE  ${i}`);
    console.log(`claims ${res.claims.length}, matched ${res.matchPct}% , issues ${res.issues.length} -> ${res.ok ? 'PASS' : 'FAIL'}`);
  }
  process.exit(res.ok ? 0 : 1);
}
