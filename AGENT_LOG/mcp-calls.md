# mcp-calls — การเรียก MCP tool จริง
_server `inblack-deals` (`npm run mcp`, http://localhost:3000/mcp) เขียน log หนึ่งบรรทัด JSON ต่อการเรียก tool · ไฟล์ดิบของ log: [`mcp-calls.jsonl`](mcp-calls.jsonl) (เปิด server ด้วย `MCP_LOG_FILE`)_

| เวลา (UTC) | ผู้เรียก | tool | args | ผล |
|---|---|---|---|---|
| 2026-11-18 13:04:26 | headless Claude Code (session `aa80fc50…`) ระหว่างใช้ skill `verify-deal-claim` | explain_verdict | `{"game":"hades"}` | ok (6 ms) |
| 2026-11-18 13:04:27 | 〃 | compare_game_prices | `{"game":"hades"}` | ok |
| 2026-11-18 13:04:27 | 〃 | explain_verdict | `{"game":"cities"}` | ok |
| 2026-11-18 13:04:32 | 〃 | explain_verdict | cyberpunk, stardew, baldur | ok ×3 |

ผล (รับ 3 จาก 4 ส่วน): agent ตอบ ACCEPT "Hades 98% / 24.99 USD", ACCEPT พร้อมหมายเหตุ "≈845 บาท" (เป็นค่าคำนวณ ไม่ใช่ค่าดิบ, อัตราเป็นของ 2026-11-17) และ **REJECT** "Cities: Skylines II คือเกมที่ควรซื้อที่สุด" (ไม่มีเกมไหนได้ buy) — รายละเอียด [`runs/step5-skill-mcp.md`](runs/step5-skill-mcp.md)
