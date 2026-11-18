# inblack-b — ซื้อ รอ หรือไม่ซื้อ: 5 เกมจากข้อมูลจริง

INBLACK GAMING โจทย์ B (4★): เว็บแนะนำ 5 เกมว่าควร **ซื้อ / รอ / ไม่ซื้อ** จากข้อมูลจริงของ [CheapShark](https://apidocs.cheapshark.com/) และ [Frankfurter](https://frankfurter.dev/) — ทุกตัวเลขบนเว็บชี้กลับไปที่ไฟล์ดิบ + JSON Pointer ได้

- **เว็บ:** https://suratt028.github.io/inblack-b/ — `/` (5 เกม + คำแนะนำ + เวลาอัปเดต), `/game.html?id=GAME_ID` (ราคาบาทแต่ละร้าน, ลิงก์ผ่าน CheapShark, คะแนน, กราฟราคา, เหตุผล), `/evidence.html` (หลักฐานทุกข้ออ้าง, ข้อมูลที่มีปัญหา, สิ่งที่ถูกตีกลับ)
- **MCP server (Streamable HTTP) ที่ `http://localhost:3000/mcp`:**

```bash
npm ci
```

```bash
npm run mcp
```

tools: `compare_game_prices`, `explain_verdict` (อ่านจาก `data/raw/` เท่านั้น ไม่เรียก API) · ลงทะเบียนใน Claude Code ไว้แล้วที่ `.mcp.json` (ชื่อ `inblack-deals`)

## ไฟล์สำคัญ

| ไฟล์ | คืออะไร |
|---|---|
| [`METRICS.md`](METRICS.md) | สูตร 3 ปัจจัย (ส่วนลด 40 + ใกล้ราคาต่ำสุด 35 + รีวิว Steam 25) พร้อมเหตุผลและจุดอ่อน |
| [`data/raw/YYYY-MM-DD/`](data/raw/) | response ดิบจาก API วันละ 1 รอบ ≤ 30 คำขอ + `_manifest.json` (URL, status, เวลา, sha256) |
| [`data/brief.json`](data/brief.json) | สรุป 5 เกมโดย sub-agent `deal-analyst` — ทุก claim มี `source.file` + `source.pointer` |
| [`REVIEW.md`](REVIEW.md), [`WRONG_CASES.md`](WRONG_CASES.md), [`data/review.json`](data/review.json) | ผลตรวจอิสระของ sub-agent `evidence-reviewer`: สิ่งที่ตีกลับ และ 2 เคสที่สูตรตอบผิด |
| [`DECISIONS.md`](DECISIONS.md) | จุดที่ผู้ใช้ไม่เชื่อ agent ตรวจอย่างไร และเปลี่ยนเป็นอะไร |
| [`AGENT_SETUP.md`](AGENT_SETUP.md) | เครื่องมือ AI และตำแหน่งของ sub-agent, skill, plugin, tools, MCP, API |
| [`AGENT_LOG/`](AGENT_LOG/) | ประวัติการสั่ง AI และ log การใช้งานจริง |

## คำสั่ง

| คำสั่ง | ทำอะไร |
|---|---|
| `npm test` | เทสต์ทั้งหมด (node:test) |
| `npm run fetch` | เก็บข้อมูลดิบรอบของวันนี้ (Asia/Bangkok) — ปฏิเสธรอบที่ 2 ของวันเดียวกัน, หยุดเมื่อเจอ HTTP 429 ตาม Retry-After |
| `npm run verify` | ตรวจทุก claim ใน `data/brief.json` กับไฟล์ดิบ |
| `npm run build:site` | สร้าง `site/data/site-data.json` จากไฟล์ดิบ (เปิดดูในเครื่อง: เสิร์ฟโฟลเดอร์ `site/` ด้วย static server ใดก็ได้) |
| `npm run mcp` | เปิด MCP server ที่ `http://localhost:3000/mcp` |

เว็บ deploy ด้วย GitHub Actions ([`.github/workflows/pages.yml`](.github/workflows/pages.yml)): `npm test` → `npm run verify` → secret scan → สร้างข้อมูลเว็บจากไฟล์ดิบ → GitHub Pages

## กติกา API ที่ทำตาม

- ส่ง `User-Agent: inblack-b/1.0` ทุกคำขอ · ลิงก์ร้านใช้ `https://www.cheapshark.com/redirect?dealID=...` เท่านั้น ไม่มี affiliate ของตัวเอง
- ถ้าได้ HTTP 429 หยุดทันทีและบันทึก Retry-After — รันก่อนเวลานั้นจะถูกปฏิเสธ
- ไม่มี API key หรือรหัสผ่านใน repo และ log (ทั้งสอง API ไม่ต้องใช้ key)
