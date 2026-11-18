---
name: verify-deal-claim
description: Verify game-deal claims against the raw CheapShark/Frankfurter files in data/raw/ — each claim's value must equal the number at its file + JSON pointer, every number in the text must be backed by a claim, and the verdict must follow METRICS.md. Use when checking data/brief.json, reviewing a claim such as "Hades is 98% positive on Steam", or before publishing numbers on the site.
---

# verify-deal-claim

ตรวจข้ออ้างเรื่องดีลเกมกับข้อมูลดิบ ห้ามเชื่อตัวเลขที่ไม่มีไฟล์ + pointer รองรับ

## ขั้นตอน

1. **ตรวจทั้งไฟล์ด้วยสคริปต์** (ตัดสินด้วยผลนี้ ไม่ใช่ด้วยความรู้สึก):
   ```bash
   node scripts/verify-claims.js data/brief.json
   ```
   ได้แต่ละ claim เป็น `ACCEPT` / `REJECT` + เหตุผล, รายการ `ISSUE` และ % ที่ตรง (`--json` สำหรับผลแบบโครงสร้าง)
2. **ตรวจข้ออ้างเดี่ยว** (เช่น ข้อความจากผู้ใช้หรือบนเว็บ): หาไฟล์ใน `data/raw/<วัน>/` แล้วอ่านค่าที่ pointer
   ```bash
   node -e "const {getPointer}=require('./scripts/lib/pointer');const d=require('./data/raw/<วัน>/<ไฟล์>.json');console.log(getPointer(d,'<pointer>'))"
   ```
   หรือเรียก MCP tool `explain_verdict` / `compare_game_prices` ซึ่งคืนค่าพร้อม file + pointer
3. **ตีกลับ (REJECT)** เมื่อ:
   - ไม่มี `source.file` / `source.pointer` หรือไฟล์ไม่ได้อยู่ใต้ `data/raw/`
   - ค่าที่ pointer ไม่ใช่ตัวเลข หรือไม่เท่ากับ `value` เมื่อปัด 2 ตำแหน่ง
   - ตัวเลขใน `statement_th` ไม่ตรงกับ `value` หรือใน `summary_th` มีตัวเลขที่ไม่มี claim รองรับ
   - ข้อความตีความเกินข้อมูล (เช่น "ถูกที่สุดในตลาด" แต่ข้อมูลมีแค่ร้านที่ CheapShark ติดตาม, "ราคาจะลดอีก" ซึ่งข้อมูลไม่ได้บอก)
   - ตัวเลขที่คำนวณเอง (ราคาบาท, คะแนนรวม) ถูกใส่เป็น claim ราวกับเป็นค่าดิบ
   - verdict ไม่ตรงกับสูตร `METRICS.md`
4. **รายงาน** เป็นตาราง: claim, value, file#pointer, ค่าจริง, ACCEPT/REJECT, เหตุผล และสรุป `matched X/Y (Z%)` · ห้ามแก้ `data/raw/**` เพื่อให้ตัวเลขตรง
