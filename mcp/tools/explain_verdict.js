'use strict';
// explain_verdict: the METRICS.md breakdown (F1 discount, F2 near all-time low, F3 Steam rating) for one game,
// the score, the verdict and the thresholds, each input with its raw file + pointer, plus known data problems
// and the matching data/brief.json entry (if any).
const { z, gameInput, sourceOut, resolveGame, readBrief, src, wrap } = require('./common');
const { WEIGHTS, THRESHOLDS } = require('../../scripts/lib/metrics');

const factorOut = z.object({ points: z.number(), max: z.number(), formula: z.string() });
const inputOut = z.object({ value: z.number(), source: sourceOut });

module.exports = {
  name: 'explain_verdict',
  config: {
    title: 'Explain verdict',
    description: 'Explain why one of the 5 tracked games is buy / wait / skip under METRICS.md: the three factor scores (F1 discount, F2 closeness to all-time low, F3 Steam rating) with formulas, total score, thresholds, every input value with its raw file + JSON pointer, data problems, and the brief.json summary for that game. Reads committed data only.',
    inputSchema: gameInput,
    outputSchema: {
      day: z.string(), game_id: z.string(), title: z.string(),
      verdict: z.enum(['buy', 'wait', 'skip']), score: z.number(),
      thresholds: z.object({ buy: z.number(), wait: z.number() }),
      factors: z.object({ F1: factorOut, F2: factorOut, F3: factorOut }),
      inputs: z.object({ price_usd: inputOut, savings_pct: inputOut, retail_usd: inputOut, all_time_low_usd: inputOut, steam_rating_pct: inputOut, steam_rating_count: inputOut }),
      problems: z.array(z.object({ kind: z.string(), detail: z.string(), file: z.string(), pointer: z.string() })),
      brief: z.object({ verdict: z.string(), summary_th: z.string(), claims: z.number() }).nullable(),
    },
  },
  handler: wrap(async (args) => {
    const { day, analysis: a } = resolveGame(args);
    const i = a.inputs;
    const inp = (x) => ({ value: x.value, source: src(x) });
    const brief = readBrief();
    const b = Array.isArray(brief) ? brief.find((g) => g && g.game_id === a.game_id) : null;
    const data = {
      day, game_id: a.game_id, title: a.title, verdict: a.verdict, score: a.score, thresholds: { ...THRESHOLDS },
      factors: {
        F1: { points: a.factors.F1, max: WEIGHTS.F1, formula: `40 × savings / 100 = 40 × ${i.savings.value} / 100` },
        F2: { points: a.factors.F2, max: WEIGHTS.F2, formula: `35 × min(1, all-time low / price) = 35 × min(1, ${i.cheapestEver.value} / ${i.price.value})` },
        F3: { points: a.factors.F3, max: WEIGHTS.F3, formula: `25 × steamRatingPercent / 100 = 25 × ${i.rating.value} / 100` },
      },
      inputs: {
        price_usd: inp(i.price), savings_pct: inp(i.savings), retail_usd: inp(i.retailPrice),
        all_time_low_usd: inp(i.cheapestEver), steam_rating_pct: inp(i.rating), steam_rating_count: inp(i.ratingCount),
      },
      problems: a.problems,
      brief: b ? { verdict: b.verdict, summary_th: b.summary_th, claims: Array.isArray(b.claims) ? b.claims.length : 0 } : null,
    };
    const text = `${a.title} (${a.game_id}) on ${day}: ${a.verdict.toUpperCase()} ${a.score}/100 ` +
      `(F1 ${a.factors.F1}/40 + F2 ${a.factors.F2}/35 + F3 ${a.factors.F3}/25; buy >= ${THRESHOLDS.buy}, wait >= ${THRESHOLDS.wait})` +
      (a.problems.length ? `\nData problems: ${a.problems.map((p) => p.kind).join(', ')}` : '');
    return { data, text };
  }),
};
