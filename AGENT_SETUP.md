# AGENT_SETUP — เครื่องมือ AI และตำแหน่งของแต่ละส่วน (โจทย์ B)

## สรุป

| ส่วน | ตำแหน่ง | หมายเหตุ |
|---|---|---|
| **เครื่องมือ AI** | Claude Code (desktop app) + Claude Code CLI แบบ headless (`claude -p`) สำหรับรัน sub-agent / skill / plugin / MCP ให้เห็นใน log | model: Claude Opus 5.5 |
| **Sub-agent** (2 ตามโจทย์ + 2 ประตูตรวจ) | [`.claude/agents/deal-analyst.md`](.claude/agents/deal-analyst.md) (ขั้น 3: เขียน `data/brief.json`), [`.claude/agents/evidence-reviewer.md`](.claude/agents/evidence-reviewer.md) (ขั้น 4: ตรวจอิสระ เขียน `REVIEW.md`, `WRONG_CASES.md`, `data/review.json`) · ประตูก่อนคอมมิท: [`code-reviewer.md`](.claude/agents/code-reviewer.md) (อ่านอย่างเดียว), [`committer.md`](.claude/agents/committer.md) | |
| **Skill** | [`.claude/skills/verify-deal-claim/SKILL.md`](.claude/skills/verify-deal-claim/SKILL.md) | ใช้ [`scripts/verify-claims.js`](scripts/verify-claims.js) + MCP tools |
| **Plugin** | [`plugins/raw-guard/`](plugins/raw-guard/) — `.claude-plugin/plugin.json`, `hooks/hooks.json`, `hooks/guard-raw.js` (PreToolUse: บล็อกการแก้/ลบ `data/raw/`) · marketplace [`.claude-plugin/marketplace.json`](.claude-plugin/marketplace.json) · เปิดใช้ใน [`.claude/settings.json`](.claude/settings.json) | |
| **MCP server** | [`mcp/server.js`](mcp/server.js) — official `@modelcontextprotocol/sdk`, Streamable HTTP, `http://localhost:3000/mcp` (`npm run mcp`) · ลงทะเบียนใน [`.mcp.json`](.mcp.json) ชื่อ `inblack-deals` · เทสต์ [`test/mcp.test.js`](test/mcp.test.js) (initialize, ping, tools/list, tools/call) | |
| **Tools** (MCP) | [`mcp/tools/compare_game_prices.js`](mcp/tools/compare_game_prices.js), [`mcp/tools/explain_verdict.js`](mcp/tools/explain_verdict.js) (ส่วนกลาง [`mcp/tools/common.js`](mcp/tools/common.js)) | |
| **API** | CheapShark `https://www.cheapshark.com/api/1.0/` (`/stores`, `/games?steamAppID=`, `/games?id=`, `/deals?id=`) และ Frankfurter `https://api.frankfurter.dev/v1/latest?base=USD&symbols=THB` — เรียกใน [`scripts/fetch-raw.js`](scripts/fetch-raw.js) เท่านั้น · ไม่ต้องใช้ key | |
| **Log** | [`AGENT_LOG/`](AGENT_LOG/) | ข้อ 6 |

## 1. สิ่งที่ต้องมี

Node.js 20 ขึ้นไป · Git · Claude Code ที่ล็อกอินแล้ว · clone repo แล้ว `npm ci` และเปิด Claude Code ที่ root ของ repo

## 2. Sub-agent

Claude Code โหลด `.claude/agents/*.md` เองเมื่อเปิดเซสชันใน repo · เรียกโดยบอกชื่อ เช่น "use the deal-analyst sub-agent to …"

| agent | เขียนได้ | ใช้เมื่อ |
|---|---|---|
| `deal-analyst` | `data/brief.json` | มีข้อมูลดิบวันใหม่ / ต้องแก้ตามที่ถูกตีกลับ |
| `evidence-reviewer` | `REVIEW.md`, `WRONG_CASES.md`, `data/review.json` | ตรวจอิสระหลัง analyst ทุกครั้ง |
| `code-reviewer` | — (อ่านอย่างเดียว) | ประตูก่อนคอมมิททุกขั้น ตอบ `VERDICT: PASS/FAIL` |
| `committer` | git commit | หลังได้ PASS เท่านั้น · push เมื่อผู้ใช้สั่ง |

## 3. Skill `verify-deal-claim`

Claude Code โหลดเองจาก `.claude/skills/` · ตรวจ claim กับไฟล์ดิบ (ค่า = ไฟล์ + pointer, ตัวเลข/วันที่ในข้อความต้องมี claim, verdict ตรงสูตร) แล้วตอบ ACCEPT/REJECT

## 4. Plugin `raw-guard`

`.claude/settings.json` ประกาศ marketplace ในเครื่อง (path `./`) และเปิด `raw-guard@inblack-b` ไว้ · ถ้า Claude Code ยังไม่เห็น plugin ให้รันที่ root ของ repo:

```bash
claude plugin marketplace add ./ --scope project
```

```bash
claude plugin install raw-guard@inblack-b --scope project
```

ตรวจด้วย `claude plugin list` (ต้องเห็น `raw-guard@inblack-b` · `✔ enabled`) · ถ้าคำสั่งแรกเขียน path เต็มของเครื่องลง `.claude/settings.json` ให้เปลี่ยนกลับเป็น `./` ก่อนคอมมิท (เกิดขึ้นจริง — ดู `AGENT_LOG/rejected-work.md`)

hook ทำงานก่อนทุก Write/Edit/MultiEdit/NotebookEdit/Bash/PowerShell: ถ้าจะแก้ไฟล์ใน `data/raw/` → exit 2 พร้อมเหตุผล (Claude Code ยกเลิกคำสั่งนั้น) และเขียนบันทึกลง `AGENT_LOG/hook-events.md` · อนุญาตเฉพาะ `npm run fetch` / `node scripts/fetch-raw.js` แบบไม่ต่อคำสั่งอื่น

## 5. MCP server

```bash
npm run mcp
```

`claude mcp list` จะเห็น `inblack-deals` (ครั้งแรกต้องอนุมัติ project MCP server ใน Claude Code แบบ interactive; โหมด headless ใช้ `claude -p … --mcp-config .mcp.json`) · ตั้ง `MCP_LOG_FILE=<ไฟล์>` เพื่อเก็บ log ทุกการเรียก tool เป็น JSON lines

| tool | input | ได้อะไร |
|---|---|---|
| `compare_game_prices` | `game` (gameID หรือบางส่วนของชื่อ), `date` (ไม่บังคับ) | ราคาทุกร้าน USD + บาท เรียงถูกสุดก่อน, ลิงก์ CheapShark, ราคาต่ำสุดที่เคยมี — ทุกค่ามี file + pointer |
| `explain_verdict` | `game`, `date` | คะแนน F1/F2/F3 + สูตร, verdict, เกณฑ์, ค่าที่ใช้ทุกตัวพร้อม file + pointer, ข้อมูลที่มีปัญหา, สรุปจาก brief |

## 6. Log (`AGENT_LOG/`)

| ไฟล์ | เนื้อหา |
|---|---|
| `prompts.md` | คำสั่งที่ผู้ใช้ให้ AI |
| `agent-executions.md` | ทุกครั้งที่เรียก agent / ประตูตรวจ พร้อมผล |
| `api-requests.md` | รอบการเรียก API จริง (รายละเอียดเต็มใน `data/raw/<วัน>/_manifest.json`) |
| `rejected-work.md` | งานที่ถูกตีกลับ (ทั้งจาก evidence-reviewer และ code-reviewer) |
| `hook-events.md` | บันทึกที่ plugin `raw-guard` เขียนเองเมื่อบล็อก |
| `mcp-calls.md`, `mcp-calls.jsonl` | การเรียก MCP tool จริง (log ของ server) |
| `runs/*.md` | สรุปจาก transcript จริงของ headless Claude Code แต่ละครั้ง (tool ที่เรียก, sub-agent, skill, hook, ผล) |

ห้ามมี token, รหัสผ่าน หรือข้อมูลส่วนตัวใน log · path ของเครื่องถูกย่อเป็น `~`
