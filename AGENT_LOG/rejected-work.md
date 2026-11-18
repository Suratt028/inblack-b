# rejected-work — งานที่ถูกตีกลับ
_บันทึกเฉพาะเหตุการณ์จริง_

## 2026-11-18 — ขั้น 1–2 ตีกลับโดย code-reviewer (รอบ 1)
- ปัญหา: `scripts/verify-claims.js` `checkClaim` เช็กแค่ว่า "มีตัวเลขอย่างน้อยหนึ่งตัว" ใน `statement_th` ตรงกับ `value` → ตัวเลขแต่งเพิ่มในประโยคเดียวกันหลุดได้ ผู้ตรวจทดลองกับไฟล์จริง `data/raw/2026-11-18/game-202350.json` `/deals/0/price`: "ราคา 59.99 ลด 99%" ได้ `ok: true`
- แก้: ทุกตัวเลขใน `statement_th` ต้องตรงกับ `value` ของ claim ที่ผ่านในเกมเดียวกัน ไม่งั้นตีกลับ claim นั้น + เทสต์ `a statement with one backed and one unbacked number is rejected`

## 2026-11-18 — ขั้น 3 `data/brief.json` (deal-analyst) ตีกลับโดย evidence-reviewer (ขั้น 4 รอบ 1)
- ใช้ skill `verify-deal-claim`: claim ตัวเลข 35/35 ตรงไฟล์ดิบ, verdict 5/5 ตรงสูตร — แต่ **`summary_th` 4 ใน 5 เกมตีความเกินข้อมูล** (สคริปต์ตรวจไม่ได้ ผู้ตรวจอ่านเอง):
  - Cyberpunk 2077: "ดีลที่ถูกที่สุดคือ Humble Store" — จริง ๆ 3 ร้านราคาเท่ากัน 59.99 และ CheapShark เองชี้ Steam
  - Hades: "มีขายที่ Steam ร้านเดียว" (จริง ๆ คือร้านเดียวที่ CheapShark ติดตาม) และอธิบาย skip ด้วยเหตุผลของ wait ("ควรรอโปร")
  - Stardew Valley: "ถูกที่สุดคือ GOG" (เสมอกับ Steam) และ "ราคาเก่ามาก" ไม่มี claim วันที่รองรับ
  - Baldur's Gate 3: "ถูกที่สุดคือ GOG" (เสมอกับ Steam), "ไม่ห่างจากตอนนี้มาก" ผิด (ต่ำสุดถูกกว่า 30%), "รอโปรรอบหน้า" เดาเอง
- ร่างที่ถูกตีกลับเก็บไว้ที่ `data/brief.rejected-1.json` · ผลตรวจเต็ม `AGENT_LOG/runs/step4-evidence-review-1.md` · ส่งกลับให้ deal-analyst แก้

## 2026-11-18 — ขั้น 5 (MCP + plugin) ตีกลับโดย code-reviewer (รอบ 1)
- `.claude/settings.json` มี path เต็มของเครื่อง (มีชื่อผู้ใช้ Windows) ใน marketplace — จะหลุดขึ้น repo สาธารณะ และใช้กับเครื่องอื่นไม่ได้ → เปลี่ยนเป็น `./`
- `guard-raw.js` ซ่อน path แค่แบบ `C:\Users\...` แต่ Bash ของเครื่องนี้คือ Git Bash (`/c/Users/<ชื่อ>/...`) → ชื่อผู้ใช้จะหลุดลง `AGENT_LOG/hook-events.md` → เพิ่ม `redact()` ครอบ Windows / Git Bash / POSIX + เทสต์
- allow-list เช็กแค่ต้นคำสั่ง: `npm run fetch && rm -rf data/raw/2026-11-18` ผ่าน → อนุญาตเฉพาะคำสั่ง fetch ล้วน ๆ + เทสต์

## 2026-11-19 — แก้ข้อค้างจากรีวิว (raw-guard) ตีกลับโดย code-reviewer (รอบ 1)
- regex ใหม่ของ prefix (`env FOO=1 rm` ฯลฯ) กำกวม: token อย่าง `x=1` เป็นได้ทั้ง "ค่าของ option" และ "assignment" → backtrack แบบ 2^n ผู้ตรวจวัด n=22 ใช้ 325 ms, n=1000 ไม่จบ → hook จะค้างเกิน timeout 20 วินาทีแล้วปล่อยคำสั่งผ่าน (fail open)
- แก้: ค่าของ option ห้ามมี `=`, ค่า assignment แยกตามตัวแรก (`"`/`'`/อื่น) ให้แต่ละ token parse ได้ทางเดียว · เทสต์ input ยาว 2000 token ทุกรูปแบบต้องจบใน 1 วินาที (วัดจริง ≤ 4 ms)
