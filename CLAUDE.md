# CLAUDE.md — inblack-b (INBLACK GAMING, Project B)

## Overview
Site that recommends **buy / wait / skip** for 5 games from real CheapShark + Frankfurter data. Every number must trace back to a raw API file + JSON Pointer.

## Architecture
- `config/games.json` — the 5 games (Steam app IDs).
- `scripts/fetch-raw.js` — one fetch round per calendar day (Asia/Bangkok), ≤ 30 requests, writes `data/raw/YYYY-MM-DD/` + `_manifest.json`. Stops on HTTP 429 and honours Retry-After.
- `scripts/lib/metrics.js` — the formula in `METRICS.md`. `scripts/verify-claims.js` — checks `data/brief.json` against raw files. `scripts/build-site-data.js` — `site/data/site-data.json`.
- `mcp/server.js` — MCP (official SDK, Streamable HTTP, `http://localhost:3000/mcp`), tools `compare_game_prices`, `explain_verdict`.
- `.claude/agents/` (`deal-analyst`, `evidence-reviewer` + gate `code-reviewer`, `committer`), `.claude/skills/verify-deal-claim/`, `plugins/raw-guard/` (blocks edits to `data/raw/`).
- `site/` — `index.html`, `game.html`, `evidence.html`; deployed by `.github/workflows/pages.yml`.

## Rules
- The formula is `METRICS.md`. Never change it silently.
- `data/raw/**` is immutable after a round: only `scripts/fetch-raw.js` writes there.
- Every claim in `data/brief.json` has `value` equal (2 dp) to the number at `source.file` + `source.pointer`; every number in `summary_th` / `statement_th` must be backed by a claim.
- CheapShark: send `User-Agent: inblack-b/1.0`; link to stores only via `https://www.cheapshark.com/redirect?dealID=...` (no own affiliate); on 429 stop and honour Retry-After.

## Commands
- `npm test` — all tests (node:test)
- `npm run fetch` — today's raw round (refuses a second round on the same day)
- `npm run verify` — verify `data/brief.json`
- `npm run build:site` — build site data
- `npm run mcp` — start MCP server on :3000

## Security
Public repo. No API keys, tokens, passwords, personal names or e-mails in any file, commit or log. CheapShark and Frankfurter need no key. Actions use `GITHUB_TOKEN` only.

## Commit gate (every step)
1. Never commit while `npm test` fails.
2. After each step: sub-agent `code-reviewer` (read-only) must return `VERDICT: PASS`, max 3 fix rounds, then ask the user.
3. Only then sub-agent `committer` commits (Conventional Commits, `Step:` + `Reviewed-by: code-reviewer (PASS)` lines). Push only when the user says so.
4. `DECISIONS.md` is written / approved by the user only.
