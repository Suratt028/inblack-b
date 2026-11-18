# rejected-work — งานที่ถูกตีกลับ
_บันทึกเฉพาะเหตุการณ์จริง_

## 2026-11-18 — ขั้น 1–2 ตีกลับโดย code-reviewer (รอบ 1)
- ปัญหา: `scripts/verify-claims.js` `checkClaim` เช็กแค่ว่า "มีตัวเลขอย่างน้อยหนึ่งตัว" ใน `statement_th` ตรงกับ `value` → ตัวเลขแต่งเพิ่มในประโยคเดียวกันหลุดได้ ผู้ตรวจทดลองกับไฟล์จริง `data/raw/2026-11-18/game-202350.json` `/deals/0/price`: "ราคา 59.99 ลด 99%" ได้ `ok: true`
- แก้: ทุกตัวเลขใน `statement_th` ต้องตรงกับ `value` ของ claim ที่ผ่านในเกมเดียวกัน ไม่งั้นตีกลับ claim นั้น + เทสต์ `a statement with one backed and one unbacked number is rejected`
