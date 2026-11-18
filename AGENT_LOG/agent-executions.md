# agent-executions — agent ที่ถูกเรียก
_บันทึกเฉพาะเหตุการณ์จริง · เวลาเป็น UTC+7_

| เวลา | Agent | งาน | ผล |
|---|---|---|---|
| 2026-11-18 13:2x | Lead (เซสชันหลัก, Claude Code desktop) | ขั้น 1: METRICS.md, โครง repo, sub-agent 4 ตัว | เสร็จ |
| 2026-11-18 13:37 | Lead | ขั้น 2: `node scripts/fetch-raw.js` รอบวันที่ 2026-11-18 | 17 คำขอ, HTTP 200 ทั้งหมด — ดู api-requests.md |
| 2026-11-18 13:5x | code-reviewer (อ่านอย่างเดียว) | ประตูขั้น 1–2 รอบ 1 | **FAIL** — `verify-claims.js` ยอมให้ตัวเลขที่ไม่มีหลักฐานผ่านถ้าใน statement มีตัวเลขอื่นที่ตรง (ทดลองกับข้อมูลจริง: "ราคา 59.99 ลด 99%" ผ่าน) → แก้ + เพิ่มเทสต์; แก้ข้อเสนอแนะ 4 ข้อ (คำใน METRICS.md, ค่าไม่ใช่ตัวเลขต้องหยุด, ตัวเลขติดตัวอักษรเช่น F1, เขียนไฟล์ดิบแบบ byte ตรง) |
| 2026-11-18 14:0x | code-reviewer | ประตูขั้น 1–2 รอบ 2 | **PASS** — npm test 16/16 (+1 skip: ยังไม่มี brief.json) |
| 2026-11-18 14:1x | headless Claude Code (`claude -p`) → **deal-analyst** (sub-agent ของโปรเจกต์) | ขั้น 3: เขียน `data/brief.json` | 5 เกม, 35 claim, `verify-claims.js` PASS 100% · ร่างแรกเขียน "1 ดอลลาร์ = 33.84 บาท" ตัวตรวจจับเลข 1 ที่ไม่มี claim → analyst แก้ข้อความเอง · รายละเอียด `runs/step3-deal-analyst.md` |
| 2026-11-18 14:2x | code-reviewer | ประตูขั้น 3 | **PASS** — npm test 18/18, verify 35/35 · ผู้ตรวจเขียนสคริปต์อ่านไฟล์ดิบเองตรวจทุก claim · ข้อสังเกตเรื่องถ้อยคำใน summary_th ส่งต่อให้ขั้น 4 |
| 2026-11-18 14:3x | headless `claude -p` → **evidence-reviewer** + skill **verify-deal-claim** | ขั้น 4 รอบ 1 | ครั้งแรกหยุดกลางคันเพราะโควตา 5 ชั่วโมงของบัญชีหมด (ยังไม่ได้เขียนไฟล์) |
| 2026-11-18 19:48 | headless `claude -p` → **evidence-reviewer** + skill **verify-deal-claim** | ขั้น 4 รอบ 1 (รันใหม่) | **REJECTED: 4** — claim 35/35 ตรง แต่ `summary_th` 4 เกมตีความเกินข้อมูล · เขียน REVIEW.md, WRONG_CASES.md (Stardew Valley, Hades) · `runs/step4-evidence-review-1.md` |
| 2026-11-18 19:5x | headless `claude -p` → **deal-analyst** แล้ว **evidence-reviewer** + skill | ขั้น 4: แก้ + ตรวจรอบ 2 | analyst แก้ 4 เกม (35 → 50 claim) · reviewer รอบ 2 ACCEPT ไม่มีตีกลับ · เขียน `data/review.json` · `runs/step4-fix-and-review-2.md` |
| 2026-11-18 20:0x | Lead | ขั้น 4 | ตามข้อเสนอของ reviewer: `verify-claims.js` ตรวจวันที่ YYYY-MM-DD ในข้อความด้วย (ต้องมาจาก claim Unix time หรือวันของข้อมูลดิบ) + เทสต์ · metrics เพิ่ม problem `price-tie` |
| 2026-11-18 20:1x | code-reviewer | ประตูขั้น 4 | **PASS** — npm test 19/19, verify 50/50 · ผู้ตรวจอ่าน file+pointer ใน WRONG_CASES/review.json เองทุกตัว |
| 2026-11-18 20:04 | headless `claude -p` (MCP `inblack-deals` + skill **verify-deal-claim**) | ขั้น 5: ตรวจข้ออ้างของผู้ใช้ด้วย MCP | เรียก explain_verdict ×5, compare_game_prices ×1 · ตีกลับ "Cities: Skylines II ควรซื้อที่สุด" · `runs/step5-skill-mcp.md`, `mcp-calls.md` |
| 2026-11-18 20:05 | headless `claude -p` (plugin **raw-guard** โหลดอยู่) | ขั้น 5: ผู้ใช้ขอแก้คะแนน Hades ในไฟล์ดิบเป็น 99 | agent ปฏิเสธเองตาม CLAUDE.md โดยไม่ลองแก้ → hook ไม่ได้ทำงาน · `runs/step5-plugin-refused.md` |
| 2026-11-18 20:06 | headless `claude -p` (plugin **raw-guard**) | ขั้น 5: ทดสอบ guard (บอก agent ตรง ๆ ว่าเป็นการทดสอบ) | Edit และ `sed -i` ถูก **บล็อกจริง** ทั้งคู่, sha256 ไฟล์ไม่เปลี่ยน · `hook-events.md`, `runs/step5-plugin-blocked.md` · พบว่า hook เขียน path เต็มของเครื่องลง log → แก้ให้เขียน path แบบ relative + เทสต์ |
| 2026-11-18 20:2x | code-reviewer | ประตูขั้น 5 รอบ 1 | **FAIL** — (1) `.claude/settings.json` มี path เต็มของเครื่อง (คำสั่ง `claude plugin marketplace add` เขียนให้เอง) (2) hook ไม่ซ่อน path แบบ Git Bash `/c/Users/...` ใน log (3) คำสั่งที่ต่อท้าย `npm run fetch && rm ...` หลุด allow-list → แก้ทั้ง 3 + ลด false positive (`2>/dev/null`, `grep copy`) + เทสต์ |
| 2026-11-18 20:3x | code-reviewer | ประตูขั้น 5 รอบ 2 | **PASS** — npm test 29/29 · ทั้ง 3 ข้อแก้แล้ว (ผู้ตรวจลองคำสั่งเองทุกกรณี) |
| 2026-11-18 20:4x | Lead | ขั้น 6: เว็บ 3 หน้า (`site/`), `scripts/build-site-data.js`, workflow Pages, README, AGENT_SETUP | เปิดดูในเครื่อง (localhost) ครบ 3 หน้า, มือถือ 375px ไม่มี scroll แนวนอน · เทสต์ `test/site-data.test.js` คำนวณใหม่จากไฟล์ดิบแบบไม่ใช้โค้ดใน `scripts/lib` แล้วเทียบกับข้อมูลเว็บ · raw-guard: ปิดช่อง `  rm` (ช่องว่างนำหน้า), `time/env rm`, `find -delete` ตามข้อเสนอของผู้ตรวจขั้น 5 |
| 2026-11-18 20:5x | code-reviewer | ประตูขั้น 6 | **PASS** — npm test 33/33, build:site 50/50, ตรวจ XSS/ลิงก์/workflow แล้ว · ข้อเสนอแนะ (raw-guard `env FOO=1 rm`, `find -exec cat`, encode dealID) เก็บไว้รอบอัปเดตวันที่ 2 |
| 2026-11-18 21:0x | code-reviewer | ประตูก่อน push (merge Initial commit ของ GitHub) | **PASS** — สแกนประวัติทั้งหมด 16 คอมมิท: มีแค่ surat/noreply, ไม่มีข้อมูลส่วนตัว/secret · clone ใหม่ `npm ci && npm test` 33/33 |
| 2026-11-18 21:2x | code-reviewer | ประตู DECISIONS.md รอบ 1 | **FAIL** — คำพูดของ Baldur's Gate 3 ไม่ตรงต้นฉบับคำต่อคำ → แก้ให้ตรง `data/brief.rejected-1.json` + ปรับความแม่นยำ 4 จุด (คำพูดผลตรวจ, ใครเขียนสคริปต์, เหตุการณ์โจทย์ A, ไม่ใส่ชื่อผู้คอมมิท) |
| 2026-11-18 21:3x | code-reviewer | ประตู DECISIONS.md รอบ 2 | **PASS** — ทุก commit/ตัวเลข/คำพูดที่อ้างตรงกับต้นฉบับ · npm test 33/33 |
