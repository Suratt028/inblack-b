# ขั้น 5 — ทดสอบ plugin raw-guard: Edit และ sed -i ถูกบล็อก

_สรุปจาก transcript จริง (stream-json) ของ headless Claude Code · path เครื่องถูกย่อเป็น `~`_

```
claude -p "Guard test (this is a test of the raw-guard plugin, not a real data change): try to change /gameInfo/steamRatingPercent from \"98\" to \"99\" in data/raw/2026-11-18/deal-196149.json, first with the Edit tool, then with a sed -i command. Report exactly what happened to each attempt and whether the file changed." --output-format stream-json --verbose --allowedTools Read Edit Write Grep Glob "Bash(sed *)" "Bash(node *)" "Bash(git diff*)"
```

- session: `c645733a-0260-4f66-9296-90ebe4992aa2` · model: claude-opus-5-5
- project sub-agents loaded: deal-analyst, evidence-reviewer, code-reviewer, committer
- project plugin loaded: raw-guard
- project MCP server: inblack-deals (connected)
- project skill available: verify-deal-claim

| # | ใคร | tool | input (ย่อ) |
|---|---|---|---|
| 1 | main | Bash | `{"command":"sha256sum data/raw/2026-11-18/deal-196149.json && git status --short data/raw/ && grep -o '\"steamRatingPercent\":\"[^\"]*\"' data/raw/2026-11-18/deal-196149.json","description":"Record baseline hash and curr` |
| 2 | main | Read | `{"file_path":"~\\inblack-b\\data\\raw\\2026-11-18\\deal-196149.json"}` |
| 3 | main | Edit | `{"replace_all":false,"file_path":"~\\inblack-b\\data\\raw\\2026-11-18\\deal-196149.json","old_string":"\"steamRatingPercent\":\"98\"","new_string":"\"steamRatingPercent\":\"99\""}` |
| | ← hook | (tool_result) | `PreToolUse:Edit hook error: [node "~\inblack-b\plugins\raw-guard/hooks/guard-raw.js"]: Blocked by raw-guard: Edit on ~\inblack-b\data\raw\2026-11-18\deal-196149.json: data/raw/ is immutable raw API evidence. Raw data may only be written by `npm run fetch`. If ` |
| 4 | main | Bash | `{"command":"sed -i 's/\"steamRatingPercent\":\"98\"/\"steamRatingPercent\":\"99\"/' data/raw/2026-11-18/deal-196149.json","description":"Try changing the rating value with sed (guard test)"}` |
| | ← hook | (tool_result) | `PreToolUse:Bash hook error: [node "~\inblack-b\plugins\raw-guard/hooks/guard-raw.js"]: Blocked by raw-guard: Bash command may modify data/raw/ (immutable raw API evidence): sed -i 's/"steamRatingPercent":"98"/"steamRatingPercent":"99"/' data/raw/2026-11-18/dea` |
| 5 | main | Bash | `{"command":"sha256sum data/raw/2026-11-18/deal-196149.json && grep -o '\"steamRatingPercent\":\"[^\"]*\"' data/raw/2026-11-18/deal-196149.json && git status --short data/raw/ && git diff --stat -- data/raw/","description` |

**ผล:** success · 6 turns · 27 s

> The raw-guard plugin blocked both attempts, and the file did not change.
> 
> | Attempt | Result |
> |---|---|
> | **Edit tool** (`"steamRatingPercent":"98"` → `"99"`) | **Blocked** before it ran, by raw-guard's `PreToolUse:Edit` hook (`plugins/raw-guard/hooks/guard-raw.js`). The message was: *"Blocked by raw-guard: Edit on …\deal-196149.json: data/raw/ is immutable raw API evidence. Raw data may only be written by `npm run fetch`…"* |
> | **`sed -i`** through Bash | **Blocked** before it ran, by the same script's `PreToolUse:Bash` hook. The message was: *"Blocked by raw-guard: Bash command may modify data/raw/ (immutable raw API evidence): sed -i '…' data/raw/2026-11-18/deal-196149.json…"* |
> 
> **Did the file change? No.**
> - The SHA-256 is `3d8fccf8…7250364` both before and after the two attempts.
> - `/gameInfo/steamRatingPercent` is still `"98"`.
> - `git status` and `git diff` show no changes under `data/raw/`.
> 
> Nothing needs to be committed or cleaned up.
