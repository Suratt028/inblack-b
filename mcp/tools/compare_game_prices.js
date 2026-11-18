'use strict';
// compare_game_prices: every store's current price for one game in USD and THB, cheapest first,
// with CheapShark redirect links and the raw file + pointer behind every number.
const { z, gameInput, sourceOut, resolveGame, src, wrap } = require('./common');

const storeOut = z.object({
  store: z.string(), store_active: z.boolean(), price_usd: z.number(), retail_usd: z.number(), savings_pct: z.number(),
  price_thb: z.number(), link: z.string(), source: sourceOut,
});

module.exports = {
  name: 'compare_game_prices',
  config: {
    title: 'Compare game prices',
    description: 'Compare current store prices for one of the 5 tracked games from the collected raw CheapShark data: USD and THB price per store (cheapest first), savings, CheapShark redirect link, all-time low, and the raw file + JSON pointer for every number. Reads data/raw only; no network calls.',
    inputSchema: gameInput,
    outputSchema: {
      day: z.string(), game_id: z.string(), title: z.string(), available_days: z.array(z.string()),
      fx: z.object({ usd_thb: z.number(), rate_date: z.string(), source: sourceOut }),
      stores: z.array(storeOut),
      cheapest: storeOut,
      all_time_low: z.object({ usd: z.number(), thb: z.number(), date: z.string(), source: sourceOut }),
    },
  },
  handler: wrap(async (args) => {
    const { day, days, analysis: a } = resolveGame(args);
    const stores = a.stores.map((s) => ({
      store: s.storeName, store_active: s.storeActive, price_usd: s.price, retail_usd: s.retailPrice, savings_pct: s.savings,
      price_thb: s.thb, link: s.link, source: s.source,
    })).sort((x, y) => x.price_usd - y.price_usd);
    const data = {
      day, game_id: a.game_id, title: a.title, available_days: days,
      fx: { usd_thb: a.inputs.fx.value, rate_date: a.fxDate, source: src(a.inputs.fx) },
      stores,
      cheapest: stores[0],
      all_time_low: {
        usd: a.inputs.cheapestEver.value, thb: a.cheapestEverTHB,
        date: new Date(a.inputs.cheapestEverDate.value * 1000).toISOString().slice(0, 10), source: src(a.inputs.cheapestEver),
      },
    };
    const lines = stores.map((s) => `- ${s.store}: $${s.price_usd} = ${s.price_thb} THB (−${s.savings_pct}%) ${s.link}`);
    const text = `${a.title} (${a.game_id}) on ${day}, 1 USD = ${data.fx.usd_thb} THB\n${lines.join('\n')}\nAll-time low: $${data.all_time_low.usd} (${data.all_time_low.thb} THB) on ${data.all_time_low.date}`;
    return { data, text };
  }),
};
