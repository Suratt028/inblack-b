# ขั้น 4 — evidence-reviewer ตรวจอิสระ (รอบ 1: ตีกลับ 4)

_สรุปจาก transcript จริง (stream-json) ของ headless Claude Code · path เครื่องถูกย่อเป็น `~`_

```
claude -p "Step 4 (independent review): use the evidence-reviewer sub-agent to review data/brief.json against data/raw/ — it must use the verify-deal-claim skill, reject anything without evidence, find 2 cases where the METRICS.md formula gives the wrong answer from the real collected data, and write REVIEW.md and WRONG_CASES.md. Do not write or edit any file yourself; only delegate and then report its result, including what it rejected." --output-format stream-json --verbose --allowedTools Agent Skill Read Grep Glob Write "Bash(node *)" "Bash(npm run verify)" "Bash(npm test)"
```

- session: `088d0ead-43aa-4e5e-8c11-01a470845082` · model: claude-opus-5-5
- project sub-agents loaded: deal-analyst, evidence-reviewer, code-reviewer, committer
- project plugin loaded: —
- project MCP server: —
- project skill available: verify-deal-claim

| # | ใคร | tool | input (ย่อ) |
|---|---|---|---|
| 1 | main | Agent | `{"description":"Step 4 evidence review","subagent_type":"evidence-reviewer","run_in_background":false,"prompt":"Step 4 (independent review) of the inblack-b project (~\\inblack-b). Follow CLAUDE.md.\n\nTask:\n1. Invoke t` |
| 2 | sub-agent | Skill | `{"skill":"verify-deal-claim"}` |
| 3 | sub-agent | Bash | `{"command":"node scripts/verify-claims.js data/brief.json; echo EXIT=$?; echo ----; npm run verify 2>&1; echo EXIT=$?; ls -R data/raw config; cat METRICS.md","description":"Run claim verification and list raw files"}` |
| 4 | sub-agent | Bash | `{"command":"node scripts/verify-claims.js data/brief.json 2>&1","description":"Run claim verification script"}` |
| 5 | sub-agent | Bash | `{"command":"npm run verify 2>&1","description":"Run npm verify"}` |
| 6 | sub-agent | Bash | `{"command":"ls -laR data/raw config && cat METRICS.md","description":"List raw files and show METRICS.md"}` |
| 7 | sub-agent | Bash | `{"command":"cat data/brief.json; echo; for f in data/raw/2026-11-18/*.json; do echo \"=== $f\"; cat \"$f\"; echo; done; cat config/games.json","description":"Show brief, raw files, and games config"}` |
| 8 | sub-agent | Read | `{"file_path":"~\\inblack-b\\data\\brief.json"}` |
| 9 | sub-agent | Bash | `{"command":"cd ~/inblack-b/data/raw/2026-11-18 && head -c 100000 deal-*.json game-*.json fx-usd-thb.json lookup-*.json","description":"Print raw deal, game, fx, lookup files"}` |
| 10 | sub-agent | Read | `{"file_path":"~\\inblack-b\\config\\games.json"}` |
| 11 | sub-agent | Bash | `{"command":"node -e \"\nconst s=require('./data/raw/2026-11-18/stores.json');for(const id of ['1','2','3','7','11','15','23','27'])console.log(JSON.stringify(s.find(x=>x.storeID===id)&&{id,name:s.find(x=>x.storeID===id).` |
| 12 | sub-agent | Bash | `{"command":"node -e \"\nconst m=require('./scripts/lib/metrics.js');console.log(m.WEIGHTS,m.THRESHOLDS,m.LOW_REVIEW_COUNT);\nconst r=m.analyzeDay('data/raw/2026-11-18');console.log(JSON.stringify(r,null,1).slice(0,6000))` |
| 13 | sub-agent | Read | `{"file_path":"~\\inblack-b\\scripts\\lib\\metrics.js"}` |
| 14 | sub-agent | Bash | `{"command":"node scripts/lib/metrics.js 2026-11-18 2>&1","description":"Compute formula results for day"}` |
| 15 | sub-agent | Read | `{"file_path":"~\\inblack-b\\scripts\\verify-claims.js"}` |
| 16 | sub-agent | Bash | `{"command":"node -e \"\nconst {getPointer}=require('./scripts/lib/pointer');const b=require('./data/brief.json');const names={202350:'Cyberpunk 2077',196149:'Hades',150036:'Stardew Valley',202278:\\\"Baldur's Gate 3\\\",` |
| 17 | sub-agent | Bash | `{"command":"node -e \"const s=require('./data/raw/2026-11-18/stores.json');for(const id of ['1','7','11'])console.log(id,s.findIndex(x=>x.storeID===id))\"","description":"Find store indices in stores.json"}` |
| 18 | sub-agent | Write | `{"file_path":"~\\inblack-b\\REVIEW.md","content":"REJECTED: 4\n\n# REVIEW — การตรวจอิสระของ `data/brief.json` (รอบข้อมูล 2026-11-18)\n\nผู้ตรวจ: evidence-reviewer (อิสระ ไม่ได้เขียน brief และไม่ได้ตั้งสูตร) · วิธีตรวจ: s` |
| 19 | sub-agent | Write | `{"file_path":"~\\inblack-b\\WRONG_CASES.md","content":"# WRONG_CASES — 2 เคสที่สูตร METRICS.md ให้คำตอบผิด (จากข้อมูลจริงรอบ 2026-11-18)\n\nทุกค่าด้านล่างอ่านจากไฟล์ใต้ `data/raw/2026-11-18/` และคำนวณด้วย `node scripts/l` |

**ผล:** success · 2 turns · 261 s

> The evidence-reviewer sub-agent finished Step 4 and wrote `REVIEW.md` and `WRONG_CASES.md` at the repo root. It used the `verify-deal-claim` skill. I didn't write or edit any file, and nothing has been committed.
> 
> **Result:** all 35 numeric claims pass, and so do the 5 verdicts. It rejected the `summary_th` text for 4 of the 5 games, because that text says more than the data shows. `npm run verify` reported `claims 35, matched 100%, issues 0 -> PASS`, but that script can't catch over-interpretation, so all 4 rejections came from the agent reading the summaries itself.
> 
> - **Claims:** every value matches its file and JSON Pointer, and none is a computed number posing as a raw one.
> - **Verdicts:** recomputing METRICS.md gives the same 5 answers as the brief:
> 
>   | Game | Verdict | Score |
>   |---|---|---|
>   | Cyberpunk 2077 | skip | 32.75 |
>   | Hades | skip | 33.24 |
>   | Stardew Valley | skip | 38.49 |
>   | Baldur's Gate 3 | wait | 48.50 |
>   | Cities: Skylines II | wait | 57.26 |
> 
> - **Raw files:** all 17 returned HTTP 200 and match the sha256 hashes in `_manifest.json`, so none has been changed.
> 
> **What it rejected (all in `summary_th`):**
> 1. **Cyberpunk 2077:** says "cheapest deal is Humble Store", but Humble, GOG and Steam are tied at 59.99, and CheapShark's own `cheapestDealID` points to Steam. No claim backs the store name.
> 2. **Hades:**
>    - "Only sold on Steam" is too broad: it's only the single store CheapShark tracks.
>    - It explains a `skip` verdict with a reason for waiting ("better to wait for a sale"), which also implies another sale is coming.
> 3. **Stardew Valley:**
>    - "Cheapest is GOG", but GOG and Steam are tied at 14.99.
>    - "Very old price" is true (the lowest price is from 2019-12-26), but no claim backs that date.
> 4. **Baldur's Gate 3:**
>    - "Cheapest is GOG", but it's tied with Steam at 59.99.
>    - "Not far from the current price" is wrong: the all-time low of 41.99 was 30% cheaper.
>    - "Wait for the next sale" is a guess the data doesn't support.
> 
> The fix: deal-analyst needs to rewrite these 4 summaries to mention the tied stores, say "stores CheapShark tracks", add a claim for the all-time-low date and remove the guesses. The agent also suggested, without rejecting anything over it, that claims should record which day's exchange rate they use.
> 
> **Problems in the raw data it noted:**
> - The exchange-rate file is dated 2026-11-17, although the round was collected on 2026-11-18.
> - For 4 games, the two CheapShark endpoints give the same all-time-low price but different dates (for Hades, 2025-09-17 vs 2026-09-25).
> - When stores tie on price, the formula picks the first one listed (Humble for Cyberpunk), while CheapShark picks Steam. That doesn't change the score, but the store name and link on the site would differ from CheapShark's.
> 
> **Two cases where the formula gives the wrong answer (real data):**
> 1. **Stardew Valley → skip (38.49), should be at least wait.** The score is pulled down by an all-time low of 5.99 from almost 7 years ago (2019-12-26), even though the game has 98% positive reviews out of 397,481 and costs only $14.99 at full price. Meanwhile Cities: Skylines II, at 58% positive (Mixed), gets wait.
> 2. **Hades → skip (33.24), should be wait.** It was 75% off within the past 2 to 14 months (the two endpoints disagree on the date). That's the strongest sign to wait for a sale, but in the formula a deep past discount pushes the score towards skip. Any full-price game with 98% reviews flips to skip once it has ever been more than about 55.7% off. Cyberpunk (once 70% off, 32.75) hits the same problem.
> 
> `WRONG_CASES.md` marks which parts go beyond the data, such as whether a discount will come back.
> 
> The commit gate still applies before Step 4 can be committed: `code-reviewer` has to return PASS, then `committer` commits. Separately, the 4 rejected summaries need another deal-analyst pass. Tell me which you want to do next.
