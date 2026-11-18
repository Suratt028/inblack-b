# ขั้น 5 — skill verify-deal-claim + MCP tools (inblack-deals)

_สรุปจาก transcript จริง (stream-json) ของ headless Claude Code · path เครื่องถูกย่อเป็น `~`_

```
claude -p "Use the verify-deal-claim skill to check this claim from a user: 'Hades is 98% positive on Steam, costs 24.99 USD (about 845 THB) and Cities: Skylines II is the best buy of the five'. Use the inblack-deals MCP tools compare_game_prices and explain_verdict for the numbers. Report ACCEPT/REJECT per part with file + pointer. Do not edit files." --mcp-config .mcp.json --output-format stream-json --verbose --allowedTools Skill Read Grep Glob "Bash(node *)" mcp__inblack-deals__compare_game_prices mcp__inblack-deals__explain_verdict
```

- session: `aa80fc50-55ae-49c1-a579-7661cc3a1ce9` · model: claude-opus-5-5
- project sub-agents loaded: deal-analyst, evidence-reviewer, code-reviewer, committer
- project plugin loaded: raw-guard
- project MCP server: inblack-deals (connected)
- project skill available: verify-deal-claim

| # | ใคร | tool | input (ย่อ) |
|---|---|---|---|
| 1 | main | Skill | `{"skill":"verify-deal-claim"}` |
| 2 | main | ToolSearch | `{"query":"select:mcp__inblack-deals__compare_game_prices,mcp__inblack-deals__explain_verdict","max_results":2}` |
| 3 | main | mcp__inblack-deals__explain_verdict | `{"game":"hades"}` |
| 4 | main | mcp__inblack-deals__compare_game_prices | `{"game":"hades"}` |
| 5 | main | mcp__inblack-deals__explain_verdict | `{"game":"cities"}` |
| 6 | main | Read | `{"file_path":"~\\inblack-b\\config\\games.json"}` |
| 7 | main | mcp__inblack-deals__explain_verdict | `{"game":"cyberpunk"}` |
| 8 | main | mcp__inblack-deals__explain_verdict | `{"game":"stardew"}` |
| 9 | main | mcp__inblack-deals__explain_verdict | `{"game":"baldur"}` |
| 10 | main | Bash | `{"command":"node -e \"const {getPointer}=require('./scripts/lib/pointer');const r=f=>require('./data/raw/2026-11-18/'+f);console.log(JSON.stringify([getPointer(r('deal-196149.json'),'/gameInfo/steamRatingPercent'),getPoi` |

**ผล:** success · 12 turns · 32 s

> I checked the user's claim against raw data for **2026-11-18**: **2 parts ACCEPT, 1 part REJECT (with a note on the THB part)**. Both MCP tools agreed with a direct read of the raw files. No files were edited.
> 
> | # | Part of the claim | Raw value (file#pointer) | Result | Why |
> |---|---|---|---|---|
> | 1 | Hades is 98% positive on Steam | `"98"` — `data/raw/2026-11-18/deal-196149.json#/gameInfo/steamRatingPercent` | **ACCEPT** | 98 = 98. It's based on 143406 reviews (`#/gameInfo/steamRatingCount`). |
> | 2a | Hades costs 24.99 USD | `"24.99"` — `data/raw/2026-11-18/game-196149.json#/deals/0/price` | **ACCEPT** | Steam is the only store with a deal, and it's at full price: 0% off (`#/deals/0/savings`), normal price 24.99 (`#/deals/0/retailPrice`). |
> | 2b | about 845 THB | rate `33.84` — `data/raw/2026-11-18/fx-usd-thb.json#/rates/THB` | **ACCEPT, with a note** | 24.99 × 33.84 = 845.66, so "about 845" holds (rounding to the nearest baht would give 846). This number is calculated, not read from a raw file, so it must not be stored as a raw claim. The rate is dated `2026-11-17` (`#/date`), one day before the data was collected. |
> | 3 | Cities: Skylines II is the best buy of the five | verdict **wait**, score 57.26 — inputs from `data/raw/2026-11-18/game-264418.json` and `deal-264418.json` | **REJECT** | It goes further than the data. None of the five games is a "buy" under `METRICS.md` (buy needs a score of 70 or more). Cities does have the highest score, but its verdict is "wait". |
> 
> **How Cities scores** (`explain_verdict`):
> - **Discount (max 40):** 30.006% off (`game-264418.json#/deals/0/savings`) gives 12.
> - **Closeness to all-time low (max 35):** low 30.75 (`#/cheapestPriceEver/price`) against today's 34.99 (`#/deals/0/price`) gives 30.76.
> - **Steam rating (max 25):** 58% (`deal-264418.json#/gameInfo/steamRatingPercent`) gives 14.5.
> - **Total:** 57.26.
> 
> **All five ranked by score:**
> 1. Cities: Skylines II 57.26 (wait)
> 2. Baldur's Gate 3 48.5 (wait)
> 3. Stardew Valley 38.49 (skip)
> 4. Hades 33.24 (skip)
> 5. Cyberpunk 2077 32.75 (skip)
> 
> An accurate version of part 3 would be: "Cities: Skylines II has the highest score of the five, but its verdict is wait, not buy. It also has the weakest Steam rating of the five, at 58%."
> 
> **Problems in the data:**
> - The exchange rate is one day older than the data.
> - The two CheapShark endpoints give different dates for each game's all-time low. The prices themselves match, so the scores don't change.
> 
> **Total: 3 of 4 parts accepted (75%).**
