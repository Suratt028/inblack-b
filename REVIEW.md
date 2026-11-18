สถานะล่าสุด: **รอบ 4 (2026-11-19) = ACCEPT (REJECTED: 0)** R3-1 (summary_th ของ 264418 Cities: Skylines II) แก้แล้ว รายละเอียดอยู่ที่หัวข้อ "Round 4 (2026-11-19)" ท้ายไฟล์ · ผลของรอบ 1-3 ด้านล่างไม่ได้แก้ไข

> หัวข้อ "Round 1" ด้านล่างเก็บไว้เป็นประวัติ ไม่ได้แก้ไขเนื้อหา (brief ของรอบนั้นคือ `data/brief.rejected-1.json`) บรรทัด `REJECTED: 4` ข้างล่างเป็นผลของรอบ 1

---

# Round 1 (ประวัติ, brief = `data/brief.rejected-1.json`)

REJECTED: 4

# REVIEW — การตรวจอิสระของ `data/brief.json` (รอบข้อมูล 2026-11-18)

ผู้ตรวจ: evidence-reviewer (อิสระ ไม่ได้เขียน brief และไม่ได้ตั้งสูตร) · วิธีตรวจ: skill `verify-deal-claim` + ตรวจด้วยตนเอง
ข้อมูลดิบ: `data/raw/2026-11-18/` (17 requests, ทุกไฟล์ HTTP 200, `complete: true`, sha256 ของทุกไฟล์ตรงกับ `_manifest.json`)

## ต้องแก้อะไร (สรุปสำหรับ deal-analyst)

claim ตัวเลขทั้ง 35 ข้อถูกต้อง และ verdict ทั้ง 5 ตรงกับสูตร แต่ `summary_th` ของ 4 เกมตีความเกินข้อมูล จึงตีกลับ:

1. **202350 Cyberpunk 2077**: เลิกเขียนว่า "ดีลที่ถูกที่สุดคือ Humble Store" เพราะ 3 ร้านราคาเท่ากัน ให้เขียนว่าราคาเท่ากันทุกร้านที่ CheapShark ติดตาม (Humble Store, GOG, Steam)
2. **196149 Hades**: เลิกเขียนว่า "มีขายที่ Steam ร้านเดียว" ให้เขียนว่ามีเพียงร้านเดียวในบรรดาร้านที่ CheapShark ติดตาม และแก้ประโยค "ควรรอโปรมากกว่า... จึงได้ผลว่าไม่ซื้อ" ที่อธิบาย verdict `skip` ด้วยเหตุผลของ `wait` (ขัดกันเอง และบอกเป็นนัยว่าจะมีโปรอีก)
3. **150036 Stardew Valley**: เลิกเขียนว่า "ดีลที่ถูกที่สุดคือ GOG" (GOG กับ Steam ราคาเท่ากัน) และถ้ายังจะเขียนว่า "เป็นราคาที่เก่ามาก" ต้องเพิ่ม claim วันที่ `/cheapestPriceEver/date` (= 1577335021 คือ 2019-12-26) มารองรับ
4. **202278 Baldur's Gate 3**: เลิกเขียนว่า "ดีลที่ถูกที่สุดคือ GOG" (GOG กับ Steam ราคาเท่ากัน), ลบคำว่า "รอโปรรอบหน้า" (ข้อมูลไม่ได้บอกว่าจะมีโปรอีก) และแก้คำว่า "ไม่ห่างจากตอนนี้มาก" เพราะราคาต่ำสุดที่เคยมีต่ำกว่าราคาตอนนี้ 30%

ข้อเสนอเพิ่ม (ไม่ได้ตีกลับ): ใน claim อัตราแลกเปลี่ยน ให้ระบุวันที่ของอัตรา (`fx-usd-thb.json#/date` = `"2026-11-17"`) ด้วย

## ผล `npm run verify` (และ `node scripts/verify-claims.js data/brief.json`)

```
ACCEPT  202350#0 ... ACCEPT  264418#6   (ทั้ง 35 บรรทัดเป็น ACCEPT)
claims 35, matched 100% , issues 0 -> PASS
```

สคริปต์ตรวจเฉพาะสิ่งที่ตรวจด้วยเครื่องได้ คือค่าเทียบกับ pointer, ตัวเลขในข้อความ และ verdict เทียบกับสูตร
สคริปต์ตรวจ "การตีความเกินข้อมูล" ไม่ได้ ข้อที่ตีกลับทั้ง 4 ข้อด้านล่างจึงมาจากการตรวจด้วยตนเองทั้งหมด

## 1. ตาราง claim ทั้งหมด (file อยู่ใต้ `data/raw/2026-11-18/`)

| # | game | statement_th | value | file | pointer | ค่าจริงในไฟล์ | ผล | เหตุผล |
|---|---|---|---|---|---|---|---|---|
| 1 | 202350 Cyberpunk 2077 | ส่วนลดของดีลที่ถูกที่สุดคือ 0% | 0 | `game-202350.json` | `/deals/0/savings` | `"0.000000"` | ACCEPT | ตรง (2 ตำแหน่ง) |
| 2 | 202350 Cyberpunk 2077 | ราคาตอนนี้ (ดีลที่ถูกที่สุด) 59.99 ดอลลาร์ | 59.99 | `game-202350.json` | `/deals/0/price` | `"59.99"` | ACCEPT | ตรง, deals/0 คือดีลที่สูตรเลือก (เสมอกัน เอาตัวแรก) |
| 3 | 202350 Cyberpunk 2077 | ราคาปกติ 59.99 ดอลลาร์ | 59.99 | `game-202350.json` | `/deals/0/retailPrice` | `"59.99"` | ACCEPT | ตรง |
| 4 | 202350 Cyberpunk 2077 | ราคาต่ำสุดที่เคยมี 17.99 ดอลลาร์ | 17.99 | `game-202350.json` | `/cheapestPriceEver/price` | `"17.99"` | ACCEPT | ตรง |
| 5 | 202350 Cyberpunk 2077 | คะแนนรีวิว Steam เป็นบวก 89% | 89 | `deal-202350.json` | `/gameInfo/steamRatingPercent` | `"89"` | ACCEPT | ตรง |
| 6 | 202350 Cyberpunk 2077 | จำนวนรีวิว Steam 403071 รีวิว | 403071 | `deal-202350.json` | `/gameInfo/steamRatingCount` | `"403071"` | ACCEPT | ตรง |
| 7 | 202350 Cyberpunk 2077 | อัตราแลกเปลี่ยน 33.84 บาทต่อดอลลาร์ | 33.84 | `fx-usd-thb.json` | `/rates/THB` | `33.84` | ACCEPT | ตรง (อัตราของวันที่ 2026-11-17 ดูหัวข้อ 4) |
| 8 | 196149 Hades | ส่วนลดของดีลที่ถูกที่สุดคือ 0% | 0 | `game-196149.json` | `/deals/0/savings` | `"0.000000"` | ACCEPT | ตรง |
| 9 | 196149 Hades | ราคาตอนนี้ (ดีลที่ถูกที่สุด) 24.99 ดอลลาร์ | 24.99 | `game-196149.json` | `/deals/0/price` | `"24.99"` | ACCEPT | ตรง (มีดีลเดียว) |
| 10 | 196149 Hades | ราคาปกติ 24.99 ดอลลาร์ | 24.99 | `game-196149.json` | `/deals/0/retailPrice` | `"24.99"` | ACCEPT | ตรง |
| 11 | 196149 Hades | ราคาต่ำสุดที่เคยมี 6.24 ดอลลาร์ | 6.24 | `game-196149.json` | `/cheapestPriceEver/price` | `"6.24"` | ACCEPT | ตรง |
| 12 | 196149 Hades | คะแนนรีวิว Steam เป็นบวก 98% | 98 | `deal-196149.json` | `/gameInfo/steamRatingPercent` | `"98"` | ACCEPT | ตรง |
| 13 | 196149 Hades | จำนวนรีวิว Steam 143406 รีวิว | 143406 | `deal-196149.json` | `/gameInfo/steamRatingCount` | `"143406"` | ACCEPT | ตรง |
| 14 | 196149 Hades | อัตราแลกเปลี่ยน 33.84 บาทต่อดอลลาร์ | 33.84 | `fx-usd-thb.json` | `/rates/THB` | `33.84` | ACCEPT | ตรง |
| 15 | 150036 Stardew Valley | ส่วนลดของดีลที่ถูกที่สุดคือ 0% | 0 | `game-150036.json` | `/deals/0/savings` | `"0.000000"` | ACCEPT | ตรง |
| 16 | 150036 Stardew Valley | ราคาตอนนี้ (ดีลที่ถูกที่สุด) 14.99 ดอลลาร์ | 14.99 | `game-150036.json` | `/deals/0/price` | `"14.99"` | ACCEPT | ตรง (เสมอกับ deals/1) |
| 17 | 150036 Stardew Valley | ราคาปกติ 14.99 ดอลลาร์ | 14.99 | `game-150036.json` | `/deals/0/retailPrice` | `"14.99"` | ACCEPT | ตรง |
| 18 | 150036 Stardew Valley | ราคาต่ำสุดที่เคยมี 5.99 ดอลลาร์ | 5.99 | `game-150036.json` | `/cheapestPriceEver/price` | `"5.99"` | ACCEPT | ตรง |
| 19 | 150036 Stardew Valley | คะแนนรีวิว Steam เป็นบวก 98% | 98 | `deal-150036.json` | `/gameInfo/steamRatingPercent` | `"98"` | ACCEPT | ตรง |
| 20 | 150036 Stardew Valley | จำนวนรีวิว Steam 397481 รีวิว | 397481 | `deal-150036.json` | `/gameInfo/steamRatingCount` | `"397481"` | ACCEPT | ตรง |
| 21 | 150036 Stardew Valley | อัตราแลกเปลี่ยน 33.84 บาทต่อดอลลาร์ | 33.84 | `fx-usd-thb.json` | `/rates/THB` | `33.84` | ACCEPT | ตรง |
| 22 | 202278 Baldur's Gate 3 | ส่วนลดของดีลที่ถูกที่สุดคือ 0% | 0 | `game-202278.json` | `/deals/0/savings` | `"0.000000"` | ACCEPT | ตรง |
| 23 | 202278 Baldur's Gate 3 | ราคาตอนนี้ (ดีลที่ถูกที่สุด) 59.99 ดอลลาร์ | 59.99 | `game-202278.json` | `/deals/0/price` | `"59.99"` | ACCEPT | ตรง (เสมอกับ deals/1) |
| 24 | 202278 Baldur's Gate 3 | ราคาปกติ 59.99 ดอลลาร์ | 59.99 | `game-202278.json` | `/deals/0/retailPrice` | `"59.99"` | ACCEPT | ตรง |
| 25 | 202278 Baldur's Gate 3 | ราคาต่ำสุดที่เคยมี 41.99 ดอลลาร์ | 41.99 | `game-202278.json` | `/cheapestPriceEver/price` | `"41.99"` | ACCEPT | ตรง |
| 26 | 202278 Baldur's Gate 3 | คะแนนรีวิว Steam เป็นบวก 96% | 96 | `deal-202278.json` | `/gameInfo/steamRatingPercent` | `"96"` | ACCEPT | ตรง |
| 27 | 202278 Baldur's Gate 3 | จำนวนรีวิว Steam 452525 รีวิว | 452525 | `deal-202278.json` | `/gameInfo/steamRatingCount` | `"452525"` | ACCEPT | ตรง |
| 28 | 202278 Baldur's Gate 3 | อัตราแลกเปลี่ยน 33.84 บาทต่อดอลลาร์ | 33.84 | `fx-usd-thb.json` | `/rates/THB` | `33.84` | ACCEPT | ตรง |
| 29 | 264418 Cities: Skylines II | ส่วนลดของดีลที่ถูกที่สุดคือ 30.01% | 30.01 | `game-264418.json` | `/deals/0/savings` | `"30.006001"` | ACCEPT | ปัด 2 ตำแหน่ง = 30.01 ตรง และสอดคล้องกับ 1 − 34.99/49.99 = 30.006% |
| 30 | 264418 Cities: Skylines II | ราคาตอนนี้ (ดีลที่ถูกที่สุด) 34.99 ดอลลาร์ | 34.99 | `game-264418.json` | `/deals/0/price` | `"34.99"` | ACCEPT | ตรง, ต่ำสุดใน 6 ดีล |
| 31 | 264418 Cities: Skylines II | ราคาปกติ 49.99 ดอลลาร์ | 49.99 | `game-264418.json` | `/deals/0/retailPrice` | `"49.99"` | ACCEPT | ตรง |
| 32 | 264418 Cities: Skylines II | ราคาต่ำสุดที่เคยมี 30.75 ดอลลาร์ | 30.75 | `game-264418.json` | `/cheapestPriceEver/price` | `"30.75"` | ACCEPT | ตรง |
| 33 | 264418 Cities: Skylines II | คะแนนรีวิว Steam เป็นบวก 58% | 58 | `deal-264418.json` | `/gameInfo/steamRatingPercent` | `"58"` | ACCEPT | ตรง |
| 34 | 264418 Cities: Skylines II | จำนวนรีวิว Steam 35239 รีวิว | 35239 | `deal-264418.json` | `/gameInfo/steamRatingCount` | `"35239"` | ACCEPT | ตรง |
| 35 | 264418 Cities: Skylines II | อัตราแลกเปลี่ยน 33.84 บาทต่อดอลลาร์ | 33.84 | `fx-usd-thb.json` | `/rates/THB` | `33.84` | ACCEPT | ตรง |

ไม่มี claim ไหนที่เป็นค่าที่คำนวณเอง (ราคาบาท, คะแนน) แล้วใส่มาเหมือนเป็นค่าดิบ ทุก claim ชี้ไปที่ค่าดิบจริง

## 2. verdict เทียบกับสูตร METRICS.md

คำนวณใหม่ด้วย `node scripts/lib/metrics.js 2026-11-18` และคิดมือซ้ำอีกรอบ:

| game | F1 = 40×savings/100 | F2 = 35×min(1, ATL/price) | F3 = 25×rating/100 | score | สูตรให้ | brief | ผล |
|---|---|---|---|---|---|---|---|
| 202350 Cyberpunk 2077 | 0 | 35×17.99/59.99 = 10.50 | 22.25 | 32.75 | skip | skip | ACCEPT |
| 196149 Hades | 0 | 35×6.24/24.99 = 8.74 | 24.50 | 33.24 | skip | skip | ACCEPT |
| 150036 Stardew Valley | 0 | 35×5.99/14.99 = 13.99 | 24.50 | 38.49 | skip | skip | ACCEPT |
| 202278 Baldur's Gate 3 | 0 | 35×41.99/59.99 = 24.50 | 24.00 | 48.50 | wait | wait | ACCEPT |
| 264418 Cities: Skylines II | 12.00 | 35×30.75/34.99 = 30.76 | 14.50 | 57.26 | wait | wait | ACCEPT |

## 3. ตรวจ summary_th (ตัวเลข + การตีความ)

ตัวเลขทุกตัวใน `summary_th` มี claim ของเกมเดียวกันรองรับ (ตัวเลขในชื่อเกม เช่น "2077" ในชื่อ Cyberpunk 2077 และ "3" ในชื่อ Baldur's Gate 3 เป็นชื่อเกมจาก `/info/title` ไม่ใช่ตัวเลขข้อมูล)
ตีกลับ 4 ข้อจากการตีความเกินข้อมูล ดังนี้

| game | ข้อความ | ผล | เหตุผล + หลักฐาน |
|---|---|---|---|
| 202350 Cyberpunk 2077 | "ดีลที่ถูกที่สุดคือ Humble Store ราคา 59.99" | **REJECT** | ไม่มีดีลไหนถูกที่สุดเพียงดีลเดียว: `game-202350.json#/deals/0/price` = `"59.99"` (storeID 11 = Humble Store, `stores.json#/10/storeName`), `#/deals/1/price` = `"59.99"` (storeID 7 = GOG, `stores.json#/6/storeName`), `#/deals/2/price` = `"59.99"` (storeID 1 = Steam, `stores.json#/0/storeName`) ราคาเท่ากันทั้ง 3 ร้าน ส่วน `lookup-1091500.json#/0/cheapestDealID` ของ CheapShark เองชี้ไปที่ดีลของ Steam (`ezTZ...`) ไม่ใช่ Humble นอกจากนี้ชื่อร้านก็ไม่มี claim รองรับ |
| 196149 Hades | "มีขายที่ Steam ร้านเดียวในรอบนี้" | **REJECT** | `game-196149.json#/deals` มี 1 แถว (storeID 1) แต่นั่นหมายถึงร้านเดียว *ในบรรดาร้านที่ CheapShark ติดตาม* เท่านั้น ข้อมูลไม่ได้บอกว่าเกมนี้ขายแค่ที่ Steam (เข้าข่าย "ตีความเกินข้อมูล" แบบเดียวกับ "ถูกที่สุดในตลาด") |
| 196149 Hades | "ตามสูตรควรรอโปรมากกว่าซื้อราคาเต็มตอนนี้ จึงได้ผลว่าไม่ซื้อ" | **REJECT** | ประโยคขัดกับ verdict เอง ตาม METRICS.md "รอ" คือ `wait` แต่ verdict คือ `skip` (score 33.24 < 40) ข้อความใช้เหตุผลของ `wait` มาอธิบาย `skip` และบอกเป็นนัยว่าจะมีโปรอีก ซึ่งข้อมูลไม่ได้บอก (ดู WRONG_CASES.md เคส 2 ว่าข้อนี้ชี้ให้เห็นจุดบกพร่องของสูตรด้วย) |
| 150036 Stardew Valley | "ดีลที่ถูกที่สุดคือ GOG ราคา 14.99" | **REJECT** | `game-150036.json#/deals/0/price` = `"14.99"` (GOG) และ `#/deals/1/price` = `"14.99"` (Steam) ราคาเท่ากัน สูตรเลือก GOG เพราะกติกา "เสมอกันเอาตัวแรก" ไม่ใช่เพราะ GOG ถูกกว่า |
| 150036 Stardew Valley | "(เป็นราคาที่เก่ามาก)" | (หมายเหตุ รวมอยู่ในข้อที่ตีกลับข้างบน) | ข้อมูลรองรับจริง: `game-150036.json#/cheapestPriceEver/date` = `1577335021` (2019-12-26) และ `deal-150036.json#/cheapestPrice/date` ตรงกัน แต่ไม่มี claim ไหนอ้างถึงวันที่นี้ ต้องเพิ่ม claim |
| 202278 Baldur's Gate 3 | "ดีลที่ถูกที่สุดคือ GOG ราคา 59.99" | **REJECT** | `game-202278.json#/deals/0/price` = `"59.99"` (GOG) และ `#/deals/1/price` = `"59.99"` (Steam) ราคาเท่ากัน |
| 202278 Baldur's Gate 3 | "ราคาต่ำสุดที่เคยมีคือ 41.99 ไม่ห่างจากตอนนี้มาก" | (รวมอยู่ในข้อที่ตีกลับ) | 41.99 / 59.99 = 0.70 คือเคยถูกกว่านี้ 30% (18 ดอลลาร์) ขณะที่ summary ของ Cities: Skylines II เรียกส่วนต่าง 12% ว่า "ใกล้" และของ Cyberpunk เรียกส่วนต่าง 70% ว่า "ถูกกว่ามาก" การใช้คำจึงไม่สม่ำเสมอ และ 30% ไม่ใช่ "ไม่ห่างมาก" |
| 202278 Baldur's Gate 3 | "ตามสูตรแนะนำให้รอโปรรอบหน้า" | (รวมอยู่ในข้อที่ตีกลับ) | สูตรให้แค่ `wait` ข้อมูลไม่มีรอบโปรถัดไป (METRICS.md จุดอ่อนข้อ 5) "โปรรอบหน้า" เป็นการคาดการณ์ |
| 264418 Cities: Skylines II | ทั้งข้อความ | ACCEPT | Steam (storeID 1, `stores.json#/0/storeName`) เป็นดีลที่ถูกที่สุดเพียงดีลเดียว (34.99 < 41.44 < ...) ตัวเลขทุกตัวมี claim รองรับ "รีวิวปนกัน" ตรงกับ `deal-264418.json#/gameInfo/steamRatingText` = `"Mixed"` ส่วน "ใกล้ราคาต่ำสุด" สมเหตุสมผล (30.75/34.99 = 0.88) |

## 4. ข้อมูลดิบที่มีปัญหา

| # | ปัญหา | file + pointer | ค่าจริง | ผลกระทบ |
|---|---|---|---|---|
| D1 | อัตราแลกเปลี่ยนเป็นของคนละวัน | `fx-usd-thb.json#/date` | `"2026-11-17"` (เก็บข้อมูลวันที่ 2026-11-18 เวลา 06:37 UTC ซึ่งก่อนที่ ECB จะประกาศอัตราของวันนั้น) | ราคาบาททุกตัวใช้อัตราของวันก่อน ไม่กระทบคะแนน แต่ต้องแสดงวันที่ของอัตราบนเว็บ และควรใส่ไว้ใน claim อัตราแลกเปลี่ยน |
| D2 | วันที่ของราคาต่ำสุดที่เคยมี ไม่ตรงกันระหว่าง 2 endpoint (ราคาตรงกัน) | `game-202350.json#/cheapestPriceEver/date` เทียบกับ `deal-202350.json#/cheapestPrice/date` | 1781701951 (2026-06-17) เทียบกับ 1793203309 (2026-10-28) | ระบุ "อายุ" ของราคาต่ำสุดให้แน่นอนไม่ได้ |
| D2 | (เหมือนกัน) | `game-196149.json#/cheapestPriceEver/date` เทียบกับ `deal-196149.json#/cheapestPrice/date` | 1758129350 (2025-09-17) เทียบกับ 1790360064 (2026-09-25) | ต่างกันมากกว่า 1 ปี |
| D2 | (เหมือนกัน) | `game-202278.json#/cheapestPriceEver/date` เทียบกับ `deal-202278.json#/cheapestPrice/date` | 1785410905 (2026-07-30) เทียบกับ 1793198014 (2026-10-28) | |
| D2 | (เหมือนกัน) | `game-264418.json#/cheapestPriceEver/date` เทียบกับ `deal-264418.json#/cheapestPrice/date` | 1773951898 (2026-03-19) เทียบกับ 1789641314 (2026-09-17) | |
| D3 | "ดีลที่ถูกที่สุด" ที่สูตรเลือกไม่ตรงกับที่ CheapShark เลือก (ราคาเสมอกัน) | `game-202350.json#/deals/0/dealID` (Humble) เทียบกับ `lookup-1091500.json#/0/cheapestDealID` (Steam) | `nL0Ha1...` เทียบกับ `ezTZN4...` | ไม่กระทบคะแนน (ราคา/ส่วนลดเท่ากัน) แต่ทำให้ลิงก์ร้านและชื่อร้านที่แสดงต่างจาก CheapShark |
| D4 | ราคาเสมอกันหลายร้าน | `game-202350.json#/deals` (3 ร้าน), `game-150036.json#/deals` (2), `game-202278.json#/deals` (2) | ทุกแถว price = retailPrice | ที่มาของข้อที่ตีกลับเรื่อง "ดีลที่ถูกที่สุดคือร้าน X" |

สิ่งที่ตรวจแล้วไม่พบปัญหา:
- ร้านปิด: ทุก storeID ที่ใช้ (1, 2, 3, 7, 11, 15, 23, 27) มี `isActive` = 1 ใน `stores.json`
- ส่วนลดไม่ตรงกับราคา: ทุกแถวมี |(1 − price/retail)×100 − savings| < 0.5 เช่น Cities deals/1: 1 − 41.44/49.99 = 17.10% ตรงกับ `"17.103421"`
- `salePrice` ใน deal-*.json ตรงกับราคาใน game-*.json ทั้ง 5 เกม
- จำนวนรีวิว Steam ทุกเกมมากกว่า 500 (ไม่มีปัญหาเกมรีวิวน้อย)
- sha256 ของทั้ง 17 ไฟล์ตรงกับ `_manifest.json` (ไฟล์ดิบไม่ถูกแก้)

## 5. สรุปอัตราที่ตรง

| รายการ | ผ่าน / ทั้งหมด | % |
|---|---|---|
| claim (value = ค่าที่ file + pointer, 2 ตำแหน่ง) | 35 / 35 | 100% |
| ตัวเลขใน statement_th / summary_th มี claim รองรับ | 5 / 5 เกม | 100% |
| verdict ตรงกับ METRICS.md | 5 / 5 | 100% |
| summary_th ไม่ตีความเกินข้อมูล | 1 / 5 | 20% |
| **รวมทุกรายการที่ตัดสิน (35 claim + 5 summary)** | **36 / 40** | **90%** |

**ผลรวม: REJECTED (4)** brief ห้ามเผยแพร่จนกว่าจะแก้ `summary_th` ของ 202350, 196149, 150036, 202278 ตามหัวข้อ "ต้องแก้อะไร" แล้วตรวจซ้ำ

เคสที่สูตรให้คำตอบผิดจากข้อมูลจริง: ดู [`WRONG_CASES.md`](WRONG_CASES.md)


---

# Round 2 (brief = `data/brief.json`, ข้อมูลดิบ `data/raw/2026-11-18/`, ตรวจวันที่ 2026-11-18)

ผู้ตรวจ: evidence-reviewer (อิสระ) · วิธีตรวจ: skill `verify-deal-claim` (`node scripts/verify-claims.js data/brief.json`) + อ่านค่าทุก pointer ซ้ำด้วย `scripts/lib/pointer.js` + ตรวจข้อความด้วยตนเอง
ไม่ได้เชื่อคำบอกของ deal-analyst ทุกข้อด้านล่างตรวจจากไฟล์ดิบเอง

## R2.0 ผลจากเครื่องมือ (รันเอง)

`npm run verify` (ตัด 48 บรรทัด ACCEPT ตรงกลาง ทั้ง 50 บรรทัดเป็น ACCEPT)
```
ACCEPT  202350#0  0  data/raw/2026-11-18/game-202350.json#/deals/0/savings
...
ACCEPT  264418#7  33.84  data/raw/2026-11-18/fx-usd-thb.json#/rates/THB
claims 50, matched 100% , issues 0 -> PASS
```

`npm test`
```
ℹ tests 18
ℹ suites 0
ℹ pass 18
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
```

ไฟล์ดิบไม่ถูกแก้: `git status data/raw` สะอาด และ test "raw rounds ... files unchanged (sha256)" ผ่าน
สูตรไม่ได้ถูกเปลี่ยน: diff ที่ยังไม่ commit ของ `scripts/lib/metrics.js` เพิ่มแค่การแจ้งปัญหา `price-tie` (บรรทัด 86-87) ไม่ได้แตะ F1/F2/F3 หรือเกณฑ์ตัดสิน

## R2.1 สถานะของข้อที่ตีกลับในรอบ 1

| # | game | สิ่งที่ตีกลับในรอบ 1 | รอบ 2 | หลักฐาน |
|---|---|---|---|---|
| 1 | 202350 Cyberpunk 2077 | "ดีลที่ถูกที่สุดคือ Humble Store" ทั้งที่ 3 ร้านราคาเท่ากัน | **แก้แล้ว** | summary_th เขียนว่า "Humble Store, GOG และ Steam ราคาเท่ากันที่ 59.99 ดอลลาร์" มี claim รองรับครบ: `game-202350.json#/deals/0/price` = `"59.99"` + `/deals/0/storeID` = `"11"` (`stores.json#/10/storeName` = Humble Store), `/deals/1/price` = `"59.99"` + `/deals/1/storeID` = `"7"` (`stores.json#/6` = GOG), `/deals/2/price` = `"59.99"` + `/deals/2/storeID` = `"1"` (`stores.json#/0` = Steam) `game-202350.json#/deals` มี 3 แถว ไม่มีร้านอื่นที่ถูกกว่าหรือเท่ากันที่ตกหล่น และระบุ "ในบรรดาร้านที่ CheapShark ติดตาม" แล้ว |
| 2 | 196149 Hades | "มีขายที่ Steam ร้านเดียว" และ "ควรรอโปร... จึงได้ผลว่าไม่ซื้อ" | **แก้แล้ว** | ตอนนี้เขียนว่า "ในบรรดาร้านที่ CheapShark ติดตาม Hades มีดีลอยู่เพียงร้านเดียวคือ Steam" ตรงกับ `game-196149.json#/deals` ที่มี 1 แถว (`/deals/0/storeID` = `"1"`) ประโยค "ควรรอโปร" ถูกลบ เหลือ "คะแนนตามสูตรจึงต่ำกว่าเกณฑ์ของ "รอ" และอยู่ในช่วง "ไม่ซื้อ" (skip)" ซึ่งสอดคล้องกับ score 33.24 < 40 และไม่ได้คาดการณ์โปร |
| 3 | 150036 Stardew Valley | "ดีลที่ถูกที่สุดคือ GOG" (เสมอกับ Steam) และ "เป็นราคาที่เก่ามาก" ไม่มี claim วันที่ | **แก้แล้ว** | "GOG และ Steam ราคาเท่ากันที่ 14.99 ดอลลาร์": `game-150036.json#/deals/0/price` = `"14.99"` (storeID `"7"`) และ `/deals/1/price` = `"14.99"` (storeID `"1"`) `/deals` มี 2 แถว คำว่า "เก่ามาก" ถูกแทนด้วยวันที่จริง "2019-12-26" ซึ่งมี claim 2 ข้อ: `game-150036.json#/cheapestPriceEver/date` = `1577335021` และ `deal-150036.json#/cheapestPrice/date` = `1577335021` (ดู R2.3 เรื่องการแปลงวันที่) |
| 4 | 202278 Baldur's Gate 3 | "ดีลที่ถูกที่สุดคือ GOG", "รอโปรรอบหน้า", "ไม่ห่างจากตอนนี้มาก" | **แก้แล้ว** | "GOG และ Steam ราคาเท่ากันที่ 59.99": `game-202278.json#/deals/0/price` = `"59.99"` (storeID `"7"`), `/deals/1/price` = `"59.99"` (storeID `"1"`) `/deals` มี 2 แถว คำว่า "รอโปรรอบหน้า" ถูกลบ และเพิ่มว่า "ข้อมูลรอบนี้ไม่ได้บอกว่าราคาจะลดลงหรือไม่ หรือเมื่อไร" คำว่า "ไม่ห่างมาก" แก้เป็น "ต่ำกว่าราคาตอนนี้อย่างชัดเจน" ตรงกับ 41.99/59.99 = 0.70 (`/cheapestPriceEver/price` = `"41.99"`) |

ข้อเสนอเพิ่มเติมจากรอบ 1 (ไม่ได้ตีกลับ) เรื่องใส่วันที่ของอัตราแลกเปลี่ยน: **ไม่ได้ทำ** analyst ให้เหตุผลว่า `fx-usd-thb.json#/date` เป็น string (`"2026-11-17"`) ทำ claim ตัวเลขไม่ได้ ยอมรับได้ เพราะ summary_th ทั้ง 5 เกมไม่ได้พูดถึงราคาบาทหรืออัตราแลกเปลี่ยนเลย แต่ปัญหา D1 ยังอยู่ หน้าเว็บที่แสดงราคาบาทต้องแสดงวันที่ของอัตราด้วย

## R2.2 ตาราง claim ทั้งหมด (50 ข้อ, file อยู่ใต้ `data/raw/2026-11-18/`)

ค่าจริงอ่านจากไฟล์ด้วย `getPointer` ทีละข้อ ผลตรงกับสคริปต์ verify ทุกข้อ

| # | game | field | statement_th | value | file | pointer | ค่าจริงในไฟล์ | ผล |
|---|---|---|---|---|---|---|---|---|
| 1 | 202350 Cyberpunk 2077 | claims[0] | ส่วนลดของดีลที่ราคาต่ำสุดในบรรดาร้านที่ CheapShark ติดตามคือ 0% | 0 | `game-202350.json` | `/deals/0/savings` | `"0.000000"` | ACCEPT |
| 2 | 202350 Cyberpunk 2077 | claims[1] | ราคาตอนนี้ (ราคาต่ำสุดในบรรดาร้านที่ CheapShark ติดตาม) 59.99 ดอลลาร์ ที่ Humble Store | 59.99 | `game-202350.json` | `/deals/0/price` | `"59.99"` | ACCEPT |
| 3 | 202350 Cyberpunk 2077 | claims[2] | ดีลแถวแรกเป็นของร้าน storeID 11 (Humble Store) | 11 | `game-202350.json` | `/deals/0/storeID` | `"11"` | ACCEPT |
| 4 | 202350 Cyberpunk 2077 | claims[3] | ราคาที่ GOG ก็เท่ากันที่ 59.99 ดอลลาร์ | 59.99 | `game-202350.json` | `/deals/1/price` | `"59.99"` | ACCEPT |
| 5 | 202350 Cyberpunk 2077 | claims[4] | ดีลแถวที่สองเป็นของร้าน storeID 7 (GOG) | 7 | `game-202350.json` | `/deals/1/storeID` | `"7"` | ACCEPT |
| 6 | 202350 Cyberpunk 2077 | claims[5] | ราคาที่ Steam ก็เท่ากันที่ 59.99 ดอลลาร์ | 59.99 | `game-202350.json` | `/deals/2/price` | `"59.99"` | ACCEPT |
| 7 | 202350 Cyberpunk 2077 | claims[6] | ดีลแถวที่สามเป็นของร้าน storeID 1 (Steam) | 1 | `game-202350.json` | `/deals/2/storeID` | `"1"` | ACCEPT |
| 8 | 202350 Cyberpunk 2077 | claims[7] | ราคาปกติ 59.99 ดอลลาร์ | 59.99 | `game-202350.json` | `/deals/0/retailPrice` | `"59.99"` | ACCEPT |
| 9 | 202350 Cyberpunk 2077 | claims[8] | ราคาต่ำสุดที่ CheapShark เคยบันทึก 17.99 ดอลลาร์ | 17.99 | `game-202350.json` | `/cheapestPriceEver/price` | `"17.99"` | ACCEPT |
| 10 | 202350 Cyberpunk 2077 | claims[9] | คะแนนรีวิว Steam เป็นบวก 89% | 89 | `deal-202350.json` | `/gameInfo/steamRatingPercent` | `"89"` | ACCEPT |
| 11 | 202350 Cyberpunk 2077 | claims[10] | จำนวนรีวิว Steam 403071 รีวิว | 403071 | `deal-202350.json` | `/gameInfo/steamRatingCount` | `"403071"` | ACCEPT |
| 12 | 202350 Cyberpunk 2077 | claims[11] | อัตราแลกเปลี่ยน 33.84 บาทต่อดอลลาร์ | 33.84 | `fx-usd-thb.json` | `/rates/THB` | `33.84` | ACCEPT |
| 13 | 196149 Hades | claims[0] | ส่วนลดของดีลที่ราคาต่ำสุดในบรรดาร้านที่ CheapShark ติดตามคือ 0% | 0 | `game-196149.json` | `/deals/0/savings` | `"0.000000"` | ACCEPT |
| 14 | 196149 Hades | claims[1] | ราคาตอนนี้ (ดีลเดียวในบรรดาร้านที่ CheapShark ติดตาม) 24.99 ดอลลาร์ | 24.99 | `game-196149.json` | `/deals/0/price` | `"24.99"` | ACCEPT |
| 15 | 196149 Hades | claims[2] | ดีลนี้เป็นของร้าน storeID 1 (Steam) | 1 | `game-196149.json` | `/deals/0/storeID` | `"1"` | ACCEPT |
| 16 | 196149 Hades | claims[3] | ราคาปกติ 24.99 ดอลลาร์ | 24.99 | `game-196149.json` | `/deals/0/retailPrice` | `"24.99"` | ACCEPT |
| 17 | 196149 Hades | claims[4] | ราคาต่ำสุดที่ CheapShark เคยบันทึก 6.24 ดอลลาร์ | 6.24 | `game-196149.json` | `/cheapestPriceEver/price` | `"6.24"` | ACCEPT |
| 18 | 196149 Hades | claims[5] | คะแนนรีวิว Steam เป็นบวก 98% | 98 | `deal-196149.json` | `/gameInfo/steamRatingPercent` | `"98"` | ACCEPT |
| 19 | 196149 Hades | claims[6] | จำนวนรีวิว Steam 143406 รีวิว | 143406 | `deal-196149.json` | `/gameInfo/steamRatingCount` | `"143406"` | ACCEPT |
| 20 | 196149 Hades | claims[7] | อัตราแลกเปลี่ยน 33.84 บาทต่อดอลลาร์ | 33.84 | `fx-usd-thb.json` | `/rates/THB` | `33.84` | ACCEPT |
| 21 | 150036 Stardew Valley | claims[0] | ส่วนลดของดีลที่ราคาต่ำสุดในบรรดาร้านที่ CheapShark ติดตามคือ 0% | 0 | `game-150036.json` | `/deals/0/savings` | `"0.000000"` | ACCEPT |
| 22 | 150036 Stardew Valley | claims[1] | ราคาตอนนี้ (ราคาต่ำสุดในบรรดาร้านที่ CheapShark ติดตาม) 14.99 ดอลลาร์ ที่ GOG | 14.99 | `game-150036.json` | `/deals/0/price` | `"14.99"` | ACCEPT |
| 23 | 150036 Stardew Valley | claims[2] | ดีลแถวแรกเป็นของร้าน storeID 7 (GOG) | 7 | `game-150036.json` | `/deals/0/storeID` | `"7"` | ACCEPT |
| 24 | 150036 Stardew Valley | claims[3] | ราคาที่ Steam ก็เท่ากันที่ 14.99 ดอลลาร์ | 14.99 | `game-150036.json` | `/deals/1/price` | `"14.99"` | ACCEPT |
| 25 | 150036 Stardew Valley | claims[4] | ดีลแถวที่สองเป็นของร้าน storeID 1 (Steam) | 1 | `game-150036.json` | `/deals/1/storeID` | `"1"` | ACCEPT |
| 26 | 150036 Stardew Valley | claims[5] | ราคาปกติ 14.99 ดอลลาร์ | 14.99 | `game-150036.json` | `/deals/0/retailPrice` | `"14.99"` | ACCEPT |
| 27 | 150036 Stardew Valley | claims[6] | ราคาต่ำสุดที่ CheapShark เคยบันทึก 5.99 ดอลลาร์ | 5.99 | `game-150036.json` | `/cheapestPriceEver/price` | `"5.99"` | ACCEPT |
| 28 | 150036 Stardew Valley | claims[7] | วันที่ของราคาต่ำสุดที่เคยบันทึก (Unix time 1577335021 คือ 2019-12-26) จาก endpoint games | 1577335021 | `game-150036.json` | `/cheapestPriceEver/date` | `1577335021` | ACCEPT |
| 29 | 150036 Stardew Valley | claims[8] | วันที่ของราคาต่ำสุดจาก endpoint deals ตรงกัน (Unix time 1577335021 คือ 2019-12-26) | 1577335021 | `deal-150036.json` | `/cheapestPrice/date` | `1577335021` | ACCEPT |
| 30 | 150036 Stardew Valley | claims[9] | คะแนนรีวิว Steam เป็นบวก 98% | 98 | `deal-150036.json` | `/gameInfo/steamRatingPercent` | `"98"` | ACCEPT |
| 31 | 150036 Stardew Valley | claims[10] | จำนวนรีวิว Steam 397481 รีวิว | 397481 | `deal-150036.json` | `/gameInfo/steamRatingCount` | `"397481"` | ACCEPT |
| 32 | 150036 Stardew Valley | claims[11] | อัตราแลกเปลี่ยน 33.84 บาทต่อดอลลาร์ | 33.84 | `fx-usd-thb.json` | `/rates/THB` | `33.84` | ACCEPT |
| 33 | 202278 Baldur's Gate 3 | claims[0] | ส่วนลดของดีลที่ราคาต่ำสุดในบรรดาร้านที่ CheapShark ติดตามคือ 0% | 0 | `game-202278.json` | `/deals/0/savings` | `"0.000000"` | ACCEPT |
| 34 | 202278 Baldur's Gate 3 | claims[1] | ราคาตอนนี้ (ราคาต่ำสุดในบรรดาร้านที่ CheapShark ติดตาม) 59.99 ดอลลาร์ ที่ GOG | 59.99 | `game-202278.json` | `/deals/0/price` | `"59.99"` | ACCEPT |
| 35 | 202278 Baldur's Gate 3 | claims[2] | ดีลแถวแรกเป็นของร้าน storeID 7 (GOG) | 7 | `game-202278.json` | `/deals/0/storeID` | `"7"` | ACCEPT |
| 36 | 202278 Baldur's Gate 3 | claims[3] | ราคาที่ Steam ก็เท่ากันที่ 59.99 ดอลลาร์ | 59.99 | `game-202278.json` | `/deals/1/price` | `"59.99"` | ACCEPT |
| 37 | 202278 Baldur's Gate 3 | claims[4] | ดีลแถวที่สองเป็นของร้าน storeID 1 (Steam) | 1 | `game-202278.json` | `/deals/1/storeID` | `"1"` | ACCEPT |
| 38 | 202278 Baldur's Gate 3 | claims[5] | ราคาปกติ 59.99 ดอลลาร์ | 59.99 | `game-202278.json` | `/deals/0/retailPrice` | `"59.99"` | ACCEPT |
| 39 | 202278 Baldur's Gate 3 | claims[6] | ราคาต่ำสุดที่ CheapShark เคยบันทึก 41.99 ดอลลาร์ | 41.99 | `game-202278.json` | `/cheapestPriceEver/price` | `"41.99"` | ACCEPT |
| 40 | 202278 Baldur's Gate 3 | claims[7] | คะแนนรีวิว Steam เป็นบวก 96% | 96 | `deal-202278.json` | `/gameInfo/steamRatingPercent` | `"96"` | ACCEPT |
| 41 | 202278 Baldur's Gate 3 | claims[8] | จำนวนรีวิว Steam 452525 รีวิว | 452525 | `deal-202278.json` | `/gameInfo/steamRatingCount` | `"452525"` | ACCEPT |
| 42 | 202278 Baldur's Gate 3 | claims[9] | อัตราแลกเปลี่ยน 33.84 บาทต่อดอลลาร์ | 33.84 | `fx-usd-thb.json` | `/rates/THB` | `33.84` | ACCEPT |
| 43 | 264418 Cities: Skylines II | claims[0] | ส่วนลดของดีลที่ราคาต่ำสุดในบรรดาร้านที่ CheapShark ติดตามคือ 30.01% | 30.01 | `game-264418.json` | `/deals/0/savings` | `"30.006001"` | ACCEPT |
| 44 | 264418 Cities: Skylines II | claims[1] | ราคาตอนนี้ (ราคาต่ำสุดในบรรดาร้านที่ CheapShark ติดตาม) 34.99 ดอลลาร์ | 34.99 | `game-264418.json` | `/deals/0/price` | `"34.99"` | ACCEPT |
| 45 | 264418 Cities: Skylines II | claims[2] | ดีลที่ราคาต่ำสุดเป็นของร้าน storeID 1 (Steam) | 1 | `game-264418.json` | `/deals/0/storeID` | `"1"` | ACCEPT |
| 46 | 264418 Cities: Skylines II | claims[3] | ราคาปกติ 49.99 ดอลลาร์ | 49.99 | `game-264418.json` | `/deals/0/retailPrice` | `"49.99"` | ACCEPT |
| 47 | 264418 Cities: Skylines II | claims[4] | ราคาต่ำสุดที่ CheapShark เคยบันทึก 30.75 ดอลลาร์ | 30.75 | `game-264418.json` | `/cheapestPriceEver/price` | `"30.75"` | ACCEPT |
| 48 | 264418 Cities: Skylines II | claims[5] | คะแนนรีวิว Steam เป็นบวก 58% | 58 | `deal-264418.json` | `/gameInfo/steamRatingPercent` | `"58"` | ACCEPT |
| 49 | 264418 Cities: Skylines II | claims[6] | จำนวนรีวิว Steam 35239 รีวิว | 35239 | `deal-264418.json` | `/gameInfo/steamRatingCount` | `"35239"` | ACCEPT |
| 50 | 264418 Cities: Skylines II | claims[7] | อัตราแลกเปลี่ยน 33.84 บาทต่อดอลลาร์ | 33.84 | `fx-usd-thb.json` | `/rates/THB` | `33.84` | ACCEPT |

เหตุผลของทุกข้อ: ค่าที่ pointer เป็นตัวเลข และเท่ากับ `value` เมื่อปัด 2 ตำแหน่ง (เช่น `"30.006001"` ปัดได้ 30.01) ตัวเลขใน statement_th ตรงกับ `value` ไม่มี claim ไหนเป็นค่าที่คำนวณเอง (ราคาบาท, คะแนน)
ข้อ 28-29 เป็น Unix time ตัวเลขดิบจากไฟล์ ไม่ใช่ค่าที่คำนวณ ส่วนข้อความ "คือ 2019-12-26" ในสองข้อนี้ตรวจด้วยมือที่ R2.3

## R2.3 วันที่ 2019-12-26 (Stardew Valley)

- `1577335021` วินาที = **2019-12-26T04:37:01Z** (UTC) = **2019-12-26 11:37:01** ตามเวลา Asia/Bangkok (UTC+7) ซึ่งเป็นเขตเวลาที่โปรเจกต์ใช้ (`bangkokDay`)
- ข้อความไม่ได้ระบุเขตเวลา แต่ได้วันเดียวกันทั้ง UTC และเวลาไทย จึงไม่กำกวม: **ถูกต้อง**
- ทั้งสอง endpoint ให้ค่าเดียวกัน (`game-150036.json#/cheapestPriceEver/date` และ `deal-150036.json#/cheapestPrice/date` = `1577335021`) เกมนี้จึงไม่มีปัญหา D2
- ข้อจำกัดของเครื่องมือ: `numbersIn` ใน `scripts/verify-claims.js` ข้ามวันที่ในข้อความ (`numbersIn('เมื่อ 2019-12-26 ราคา 5.99')` ได้ `[5.99]`) สคริปต์จึงตรวจวันที่ไม่ได้ ถ้าเขียนวันที่ผิดก็ยังขึ้น PASS ข้อนี้จึงตรวจด้วยมือ (ดูข้อเสนอ N3)

## R2.4 verdict เทียบกับสูตร METRICS.md

คำนวณใหม่ด้วย `node scripts/lib/metrics.js 2026-11-18` ได้ค่าเดียวกับรอบ 1 (ข้อมูลดิบชุดเดิม สูตรเดิม)

| game | F1 | F2 | F3 | score | สูตรให้ | brief | ผล |
|---|---|---|---|---|---|---|---|
| 202350 Cyberpunk 2077 | 0 | 10.50 | 22.25 | 32.75 | skip | skip | ACCEPT |
| 196149 Hades | 0 | 8.74 | 24.50 | 33.24 | skip | skip | ACCEPT |
| 150036 Stardew Valley | 0 | 13.99 | 24.50 | 38.49 | skip | skip | ACCEPT |
| 202278 Baldur's Gate 3 | 0 | 24.50 | 24.00 | 48.50 | wait | wait | ACCEPT |
| 264418 Cities: Skylines II | 12.00 | 30.76 | 14.50 | 57.26 | wait | wait | ACCEPT |

## R2.5 ตรวจ summary_th (ตัวเลข + การตีความ)

| game | ตัวเลข/วันที่ในข้อความ | มี claim รองรับ | การตีความ | ผล |
|---|---|---|---|---|
| 202350 Cyberpunk 2077 | 0%, 59.99 (x3), 17.99, 89%, 403071 | ครบ (claims[0], [1], [3], [5], [7], [8], [9], [10]) | ร้านที่ราคาเท่ากันระบุครบ 3 ร้าน, จำกัดขอบเขตว่า "ในบรรดาร้านที่ CheapShark ติดตาม", "ต่ำกว่าราคาตอนนี้มาก" สมเหตุสมผล (17.99/59.99 = 0.30), ไม่คาดการณ์อนาคต | ACCEPT |
| 196149 Hades | 0%, 24.99 (x2), 6.24, 98%, 143406 | ครบ | "ดีลเพียงร้านเดียว" จำกัดขอบเขตแล้ว, เหตุผลของ skip ไม่ขัดกับ verdict แล้ว | ACCEPT |
| 150036 Stardew Valley | 0%, 14.99 (x2), 5.99, 2019-12-26, 98%, 397481 | ครบ (วันที่: claims[7], [8]) | ระบุว่า GOG กับ Steam ราคาเท่ากัน, ใช้วันที่จริงแทน "เก่ามาก" | ACCEPT |
| 202278 Baldur's Gate 3 | 0%, 59.99 (x2), 41.99, 96%, 452525 | ครบ | ระบุว่าราคาเท่ากัน, บอกชัดว่าข้อมูลไม่ได้บอกว่าจะลดราคาเมื่อไร, "ยังไม่คุ้มพอจะซื้อ" เป็นคำอธิบายของ wait ตามเกณฑ์ (40 ≤ 48.50 < 70) ไม่ได้อ้างข้อมูลใหม่ | ACCEPT |
| 264418 Cities: Skylines II | 30.01%, 34.99, 49.99, 30.75, 58%, 35239 | ครบ | Steam เป็นดีลที่ถูกที่สุดเพียงดีลเดียว (34.99 < 41.44 = `/deals/1/price`), "รีวิวปนกัน" ตรงกับ `deal-264418.json#/gameInfo/steamRatingText` = `"Mixed"` | ACCEPT |

ตัวเลข "2077" และ "3" เป็นส่วนของชื่อเกม (`/info/title`) ไม่ใช่ตัวเลขข้อมูล

## R2.6 ข้อสังเกตใหม่ (ไม่ตีกลับ)

| # | ข้อสังเกต | หลักฐาน | เหตุที่ไม่ตีกลับ / ข้อเสนอ |
|---|---|---|---|
| N1 | claims[1] ของ 202350, 150036, 202278 ยังเขียนชื่อร้านเดียว เช่น "ราคาต่ำสุด... 59.99 ดอลลาร์ ที่ Humble Store" | `game-202350.json#/deals/0/storeID` = `"11"` | ข้อความเป็นจริง (ร้านนั้นอยู่ในกลุ่มราคาต่ำสุด) ไม่ได้อ้างว่าถูกที่สุดเพียงร้านเดียว และ claim ถัดไปกับ summary_th บอกว่าเท่ากันหลายร้าน ถ้าจะให้ชัดขึ้นควรเขียนว่า "หนึ่งในร้านที่ราคาต่ำสุด" |
| N2 | ชื่อร้านไม่มี claim ชี้ไปที่ `stores.json` (claim ชี้แค่ storeID) | `stores.json#/0/storeName` = Steam, `#/6` = GOG, `#/10` = Humble Store ทั้งหมด `isActive` = 1 | ชื่อร้านไม่ใช่ตัวเลข กฎกำหนดเฉพาะตัวเลข ผู้ตรวจเทียบ storeID กับชื่อแล้วถูกต้องทุกข้อ |
| N3 | `verify-claims.js` ข้ามวันที่ในข้อความ | `numbersIn` (test "numbersIn: ... ignores dates") | วันที่ในรอบนี้ถูกต้อง (R2.3) เสนอให้เจ้าของเครื่องมือเพิ่มการตรวจว่าวันที่ในข้อความต้องตรงกับ claim ที่เป็น Unix time (แปลงเป็น Asia/Bangkok) |
| N4 | D1 อัตราแลกเปลี่ยนเป็นของวันที่ 2026-11-17 ยังไม่ได้อยู่ใน brief | `fx-usd-thb.json#/date` = `"2026-11-17"` | summary_th ไม่ได้ใช้อัตรานี้ แต่หน้าเว็บที่แสดงราคาบาทต้องแสดงวันที่ของอัตรา |
| N5 | WRONG_CASES.md เคส 2 ยกข้อความ Hades "ควรรอโปรมากกว่า... จึงได้ผลว่าไม่ซื้อ" ที่ตอนนี้อยู่แค่ใน `data/brief.rejected-1.json` | `data/brief.rejected-1.json` (196149 summary_th) | ไม่ได้ขัดกับข้อมูลดิบ จึงไม่ได้แก้ WRONG_CASES.md (ตามที่สั่ง) อ่านเป็นการอ้างถึง draft รอบ 1 |

ปัญหาข้อมูลดิบ D1-D4 ของรอบ 1 ยังเหมือนเดิม (ข้อมูลดิบชุดเดิม ไม่มีรอบใหม่) ตรวจซ้ำแล้วไม่พบปัญหาใหม่: ร้านทุกร้านที่ใช้มี `isActive` = 1, ส่วนลดตรงกับราคา, ไฟล์ดิบไม่ถูกแก้

## R2.7 สรุปอัตราที่ตรง (รอบ 2)

| รายการ | ผ่าน / ทั้งหมด | % |
|---|---|---|
| claim (value = ค่าที่ file + pointer, 2 ตำแหน่ง) | 50 / 50 | 100% |
| ตัวเลขและวันที่ใน statement_th / summary_th มี claim รองรับ | 5 / 5 เกม | 100% |
| verdict ตรงกับ METRICS.md | 5 / 5 | 100% |
| summary_th ไม่ตีความเกินข้อมูล | 5 / 5 | 100% |
| ข้อที่ตีกลับในรอบ 1 แก้แล้ว | 4 / 4 | 100% |
| **รวมทุกรายการที่ตัดสิน (50 claim + 5 summary)** | **55 / 55** | **100%** |

## ผลรวมรอบ 2: **ACCEPT (REJECTED: 0)**

ข้อที่ตีกลับทั้ง 4 ข้อของรอบ 1 แก้แล้วโดยมีหลักฐานจากไฟล์ดิบ ไม่พบข้อที่ต้องตีกลับใหม่ `data/brief.json` ผ่านการตรวจอิสระและเผยแพร่ได้ ข้อสังเกต N1-N5 เป็นข้อเสนอ ไม่ได้ขวางการเผยแพร่

เคสที่สูตรให้คำตอบผิด: [`WRONG_CASES.md`](WRONG_CASES.md) (รอบ 2 ไม่ได้แก้ไฟล์นี้)


---

# Round 3 (2026-11-19)

brief = `data/brief.json` (ฉบับที่ยังไม่ commit) · ข้อมูลดิบ `data/raw/2026-11-19/` (เทียบประวัติกับ `data/raw/2026-11-18/`) · ตรวจวันที่ 2026-11-19
ผู้ตรวจ: evidence-reviewer (อิสระ) · วิธีตรวจ: skill `verify-deal-claim` (`npm run verify`) + อ่านค่าทุก pointer ซ้ำด้วย `scripts/lib/pointer.js` + `node scripts/lib/metrics.js 2026-11-19` + ตรวจข้อความด้วยตนเอง

REJECTED: 1

## ต้องแก้อะไร (สรุปสำหรับ deal-analyst)

claim ทั้ง 66 ข้อตรงกับไฟล์ดิบ และ verdict ทั้ง 5 ตรงกับสูตร แต่ `summary_th` ของ 1 เกมอ้างเหตุผลผิดจากสูตร จึงตีกลับ:

1. **264418 Cities: Skylines II**: ประโยค "แต่รีวิว Steam อยู่ระดับปนกัน (58% ...) คะแนนตามสูตรจึงอยู่ในช่วง "รอ" (wait) ยังไม่ถึงเกณฑ์ "ซื้อ"" บอกว่ารีวิวปนกันเป็นเหตุที่ไม่ถึง `buy` ซึ่งผิดตามสูตร: F1 + F2 = 12.00 + 30.76 = 42.76 ต่อให้รีวิว 100% (F3 = 25) ก็ได้แค่ 67.76 < 70 ยังเป็น `wait` อยู่ดี สิ่งที่กันไม่ให้ถึง `buy` คือส่วนลด 30.01% (ด้วยราคาต่ำสุดและรีวิวเท่าเดิม ต้องลดอย่างน้อยราว 61.85% จึงจะถึง 70) ให้ลบคำว่า "จึง" ที่โยงกับรีวิว หรือเขียนเหตุผลที่ตรงกับสูตร เช่น "ส่วนลด 30.01% ยังไม่พอให้คะแนนถึงเกณฑ์ ซื้อ แม้รีวิวจะดีกว่านี้" (ตัวเลขทุกตัวต้องมี claim รองรับเหมือนเดิม)

หมายเหตุความรับผิดชอบของผู้ตรวจ: ประโยคเดียวกันนี้ (คนละจำนวนรีวิว) อยู่ใน brief รอบ 2 และรอบ 2 ให้ ACCEPT (R2.5) ถือว่ารอบ 2 ตรวจพลาด ไม่ได้แก้ผลรอบ 2 ย้อนหลัง แต่บันทึกไว้ที่นี่

## R3.0 ผลจากเครื่องมือ (รันเอง)

`npm run verify` (ตัด 64 บรรทัด ACCEPT ตรงกลาง ทั้ง 66 บรรทัดเป็น ACCEPT, ไม่มีบรรทัด ISSUE)
```
> inblack-b@0.1.0 verify
> node scripts/verify-claims.js

ACCEPT  202350#0  0  data/raw/2026-11-19/game-202350.json#/deals/0/savings
...
ACCEPT  264418#11  33.84  data/raw/2026-11-18/fx-usd-thb.json#/rates/THB
claims 66, matched 100% , issues 0 -> PASS
```

`npm test`: tests 34, pass 34, fail 0

ไฟล์ดิบไม่ถูกแก้: sha256 ของทั้ง 17 ไฟล์ใน `data/raw/2026-11-19/` ตรงกับ `_manifest.json#/requests/*/sha256` (ตรวจเอง, mismatch 0) · `_manifest.json#/complete` = `true`, `#/request_count` = 17, ทุก request HTTP 200, `#/user_agent` = `"inblack-b/1.0"`

สคริปต์ PASS ไม่ได้แปลว่า brief ผ่าน: สคริปต์ตรวจค่า/ตัวเลข/วันที่/verdict ได้ แต่ตรวจ "เหตุผลที่อ้างถึงสูตร" ไม่ได้ ข้อที่ตีกลับในรอบนี้มาจากการตรวจด้วยตนเอง

## R3.1 ตาราง claim ทั้งหมด (66 ข้อ)

claim 50 ข้อชี้ไปที่ `data/raw/2026-11-19/` ส่วนอีก 16 ข้อชี้ไปที่ `data/raw/2026-11-18/` โดยตั้งใจ ทุกข้อขึ้นต้นด้วย "รอบก่อน (2026-11-18)" และใช้รองรับประโยคเทียบกับรอบก่อนใน summary_th (ราคา, จำนวนรีวิว, อัตราแลกเปลี่ยน และส่วนลดของ Cities) จึงยอมรับ
อัตราแลกเปลี่ยน `fx-usd-thb.json#/rates/THB` = `33.975` ปัด 2 ตำแหน่ง (ครึ่งปัดขึ้น) ได้ 33.98 ตรงกับ value

| # | game | field | statement_th | value | file | pointer | ค่าจริงในไฟล์ | ผล | เหตุผล |
|---|---|---|---|---|---|---|---|---|---|
| 1 | 202350 Cyberpunk 2077 | claims[0] | ส่วนลดของดีลที่ราคาต่ำสุดในบรรดาร้านที่ CheapShark ติดตามคือ 0% | 0 | `data/raw/2026-11-19/game-202350.json` | `/deals/0/savings` | `"0.000000"` | ACCEPT | ตรง |
| 2 | 202350 Cyberpunk 2077 | claims[1] | ราคาตอนนี้ (ราคาต่ำสุดในบรรดาร้านที่ CheapShark ติดตาม) 59.99 ดอลลาร์ ที่ Humble Store | 59.99 | `data/raw/2026-11-19/game-202350.json` | `/deals/0/price` | `"59.99"` | ACCEPT | ตรง |
| 3 | 202350 Cyberpunk 2077 | claims[2] | ดีลแถวแรกเป็นของร้าน storeID 11 (Humble Store) | 11 | `data/raw/2026-11-19/game-202350.json` | `/deals/0/storeID` | `"11"` | ACCEPT | ตรง |
| 4 | 202350 Cyberpunk 2077 | claims[3] | ราคาที่ GOG ก็เท่ากันที่ 59.99 ดอลลาร์ | 59.99 | `data/raw/2026-11-19/game-202350.json` | `/deals/1/price` | `"59.99"` | ACCEPT | ตรง |
| 5 | 202350 Cyberpunk 2077 | claims[4] | ดีลแถวที่สองเป็นของร้าน storeID 7 (GOG) | 7 | `data/raw/2026-11-19/game-202350.json` | `/deals/1/storeID` | `"7"` | ACCEPT | ตรง |
| 6 | 202350 Cyberpunk 2077 | claims[5] | ราคาที่ Steam ก็เท่ากันที่ 59.99 ดอลลาร์ | 59.99 | `data/raw/2026-11-19/game-202350.json` | `/deals/2/price` | `"59.99"` | ACCEPT | ตรง |
| 7 | 202350 Cyberpunk 2077 | claims[6] | ดีลแถวที่สามเป็นของร้าน storeID 1 (Steam) | 1 | `data/raw/2026-11-19/game-202350.json` | `/deals/2/storeID` | `"1"` | ACCEPT | ตรง |
| 8 | 202350 Cyberpunk 2077 | claims[7] | ราคาปกติ 59.99 ดอลลาร์ | 59.99 | `data/raw/2026-11-19/game-202350.json` | `/deals/0/retailPrice` | `"59.99"` | ACCEPT | ตรง |
| 9 | 202350 Cyberpunk 2077 | claims[8] | ราคาต่ำสุดที่ CheapShark เคยบันทึก 17.99 ดอลลาร์ | 17.99 | `data/raw/2026-11-19/game-202350.json` | `/cheapestPriceEver/price` | `"17.99"` | ACCEPT | ตรง |
| 10 | 202350 Cyberpunk 2077 | claims[9] | คะแนนรีวิว Steam เป็นบวก 89% | 89 | `data/raw/2026-11-19/deal-202350.json` | `/gameInfo/steamRatingPercent` | `"89"` | ACCEPT | ตรง |
| 11 | 202350 Cyberpunk 2077 | claims[10] | จำนวนรีวิว Steam 403105 รีวิว (รอบ 2026-11-19) | 403105 | `data/raw/2026-11-19/deal-202350.json` | `/gameInfo/steamRatingCount` | `"403105"` | ACCEPT | ตรง |
| 12 | 202350 Cyberpunk 2077 | claims[11] | อัตราแลกเปลี่ยน 33.98 บาทต่อดอลลาร์ (รอบ 2026-11-19) | 33.98 | `data/raw/2026-11-19/fx-usd-thb.json` | `/rates/THB` | `33.975` | ACCEPT | ตรง |
| 13 | 202350 Cyberpunk 2077 | claims[12] | รอบก่อน (2026-11-18) ราคาต่ำสุดตอนนั้นคือ 59.99 ดอลลาร์ | 59.99 | `data/raw/2026-11-18/game-202350.json` | `/deals/0/price` | `"59.99"` | ACCEPT | ตรง · วันก่อนหน้า (เทียบประวัติกับรอบ 2026-11-18 ตามที่ข้อความระบุ) |
| 14 | 202350 Cyberpunk 2077 | claims[13] | รอบก่อน (2026-11-18) จำนวนรีวิว Steam 403071 รีวิว | 403071 | `data/raw/2026-11-18/deal-202350.json` | `/gameInfo/steamRatingCount` | `"403071"` | ACCEPT | ตรง · วันก่อนหน้า (เทียบประวัติกับรอบ 2026-11-18 ตามที่ข้อความระบุ) |
| 15 | 202350 Cyberpunk 2077 | claims[14] | รอบก่อน (2026-11-18) อัตราแลกเปลี่ยน 33.84 บาทต่อดอลลาร์ | 33.84 | `data/raw/2026-11-18/fx-usd-thb.json` | `/rates/THB` | `33.84` | ACCEPT | ตรง · วันก่อนหน้า (เทียบประวัติกับรอบ 2026-11-18 ตามที่ข้อความระบุ) |
| 16 | 196149 Hades | claims[0] | ส่วนลดของดีลที่ราคาต่ำสุดในบรรดาร้านที่ CheapShark ติดตามคือ 0% | 0 | `data/raw/2026-11-19/game-196149.json` | `/deals/0/savings` | `"0.000000"` | ACCEPT | ตรง |
| 17 | 196149 Hades | claims[1] | ราคาตอนนี้ (ดีลเดียวในบรรดาร้านที่ CheapShark ติดตาม) 24.99 ดอลลาร์ | 24.99 | `data/raw/2026-11-19/game-196149.json` | `/deals/0/price` | `"24.99"` | ACCEPT | ตรง |
| 18 | 196149 Hades | claims[2] | ดีลนี้เป็นของร้าน storeID 1 (Steam) | 1 | `data/raw/2026-11-19/game-196149.json` | `/deals/0/storeID` | `"1"` | ACCEPT | ตรง |
| 19 | 196149 Hades | claims[3] | ราคาปกติ 24.99 ดอลลาร์ | 24.99 | `data/raw/2026-11-19/game-196149.json` | `/deals/0/retailPrice` | `"24.99"` | ACCEPT | ตรง |
| 20 | 196149 Hades | claims[4] | ราคาต่ำสุดที่ CheapShark เคยบันทึก 6.24 ดอลลาร์ | 6.24 | `data/raw/2026-11-19/game-196149.json` | `/cheapestPriceEver/price` | `"6.24"` | ACCEPT | ตรง |
| 21 | 196149 Hades | claims[5] | คะแนนรีวิว Steam เป็นบวก 98% | 98 | `data/raw/2026-11-19/deal-196149.json` | `/gameInfo/steamRatingPercent` | `"98"` | ACCEPT | ตรง |
| 22 | 196149 Hades | claims[6] | จำนวนรีวิว Steam 143405 รีวิว (รอบ 2026-11-19) | 143405 | `data/raw/2026-11-19/deal-196149.json` | `/gameInfo/steamRatingCount` | `"143405"` | ACCEPT | ตรง |
| 23 | 196149 Hades | claims[7] | อัตราแลกเปลี่ยน 33.98 บาทต่อดอลลาร์ (รอบ 2026-11-19) | 33.98 | `data/raw/2026-11-19/fx-usd-thb.json` | `/rates/THB` | `33.975` | ACCEPT | ตรง |
| 24 | 196149 Hades | claims[8] | รอบก่อน (2026-11-18) ราคาตอนนั้น 24.99 ดอลลาร์ | 24.99 | `data/raw/2026-11-18/game-196149.json` | `/deals/0/price` | `"24.99"` | ACCEPT | ตรง · วันก่อนหน้า (เทียบประวัติกับรอบ 2026-11-18 ตามที่ข้อความระบุ) |
| 25 | 196149 Hades | claims[9] | รอบก่อน (2026-11-18) จำนวนรีวิว Steam 143406 รีวิว | 143406 | `data/raw/2026-11-18/deal-196149.json` | `/gameInfo/steamRatingCount` | `"143406"` | ACCEPT | ตรง · วันก่อนหน้า (เทียบประวัติกับรอบ 2026-11-18 ตามที่ข้อความระบุ) |
| 26 | 196149 Hades | claims[10] | รอบก่อน (2026-11-18) อัตราแลกเปลี่ยน 33.84 บาทต่อดอลลาร์ | 33.84 | `data/raw/2026-11-18/fx-usd-thb.json` | `/rates/THB` | `33.84` | ACCEPT | ตรง · วันก่อนหน้า (เทียบประวัติกับรอบ 2026-11-18 ตามที่ข้อความระบุ) |
| 27 | 150036 Stardew Valley | claims[0] | ส่วนลดของดีลที่ราคาต่ำสุดในบรรดาร้านที่ CheapShark ติดตามคือ 0% | 0 | `data/raw/2026-11-19/game-150036.json` | `/deals/0/savings` | `"0.000000"` | ACCEPT | ตรง |
| 28 | 150036 Stardew Valley | claims[1] | ราคาตอนนี้ (ราคาต่ำสุดในบรรดาร้านที่ CheapShark ติดตาม) 14.99 ดอลลาร์ ที่ GOG | 14.99 | `data/raw/2026-11-19/game-150036.json` | `/deals/0/price` | `"14.99"` | ACCEPT | ตรง |
| 29 | 150036 Stardew Valley | claims[2] | ดีลแถวแรกเป็นของร้าน storeID 7 (GOG) | 7 | `data/raw/2026-11-19/game-150036.json` | `/deals/0/storeID` | `"7"` | ACCEPT | ตรง |
| 30 | 150036 Stardew Valley | claims[3] | ราคาที่ Steam ก็เท่ากันที่ 14.99 ดอลลาร์ | 14.99 | `data/raw/2026-11-19/game-150036.json` | `/deals/1/price` | `"14.99"` | ACCEPT | ตรง |
| 31 | 150036 Stardew Valley | claims[4] | ดีลแถวที่สองเป็นของร้าน storeID 1 (Steam) | 1 | `data/raw/2026-11-19/game-150036.json` | `/deals/1/storeID` | `"1"` | ACCEPT | ตรง |
| 32 | 150036 Stardew Valley | claims[5] | ราคาปกติ 14.99 ดอลลาร์ | 14.99 | `data/raw/2026-11-19/game-150036.json` | `/deals/0/retailPrice` | `"14.99"` | ACCEPT | ตรง |
| 33 | 150036 Stardew Valley | claims[6] | ราคาต่ำสุดที่ CheapShark เคยบันทึก 5.99 ดอลลาร์ | 5.99 | `data/raw/2026-11-19/game-150036.json` | `/cheapestPriceEver/price` | `"5.99"` | ACCEPT | ตรง |
| 34 | 150036 Stardew Valley | claims[7] | วันที่ของราคาต่ำสุดที่เคยบันทึก (Unix time 1577335021 คือ 2019-12-26) จาก endpoint games | 1577335021 | `data/raw/2026-11-19/game-150036.json` | `/cheapestPriceEver/date` | `1577335021` | ACCEPT | ตรง |
| 35 | 150036 Stardew Valley | claims[8] | วันที่ของราคาต่ำสุดจาก endpoint deals ตรงกัน (Unix time 1577335021 คือ 2019-12-26) | 1577335021 | `data/raw/2026-11-19/deal-150036.json` | `/cheapestPrice/date` | `1577335021` | ACCEPT | ตรง |
| 36 | 150036 Stardew Valley | claims[9] | คะแนนรีวิว Steam เป็นบวก 98% | 98 | `data/raw/2026-11-19/deal-150036.json` | `/gameInfo/steamRatingPercent` | `"98"` | ACCEPT | ตรง |
| 37 | 150036 Stardew Valley | claims[10] | จำนวนรีวิว Steam 397486 รีวิว (รอบ 2026-11-19) | 397486 | `data/raw/2026-11-19/deal-150036.json` | `/gameInfo/steamRatingCount` | `"397486"` | ACCEPT | ตรง |
| 38 | 150036 Stardew Valley | claims[11] | อัตราแลกเปลี่ยน 33.98 บาทต่อดอลลาร์ (รอบ 2026-11-19) | 33.98 | `data/raw/2026-11-19/fx-usd-thb.json` | `/rates/THB` | `33.975` | ACCEPT | ตรง |
| 39 | 150036 Stardew Valley | claims[12] | รอบก่อน (2026-11-18) ราคาต่ำสุดตอนนั้น 14.99 ดอลลาร์ | 14.99 | `data/raw/2026-11-18/game-150036.json` | `/deals/0/price` | `"14.99"` | ACCEPT | ตรง · วันก่อนหน้า (เทียบประวัติกับรอบ 2026-11-18 ตามที่ข้อความระบุ) |
| 40 | 150036 Stardew Valley | claims[13] | รอบก่อน (2026-11-18) จำนวนรีวิว Steam 397481 รีวิว | 397481 | `data/raw/2026-11-18/deal-150036.json` | `/gameInfo/steamRatingCount` | `"397481"` | ACCEPT | ตรง · วันก่อนหน้า (เทียบประวัติกับรอบ 2026-11-18 ตามที่ข้อความระบุ) |
| 41 | 150036 Stardew Valley | claims[14] | รอบก่อน (2026-11-18) อัตราแลกเปลี่ยน 33.84 บาทต่อดอลลาร์ | 33.84 | `data/raw/2026-11-18/fx-usd-thb.json` | `/rates/THB` | `33.84` | ACCEPT | ตรง · วันก่อนหน้า (เทียบประวัติกับรอบ 2026-11-18 ตามที่ข้อความระบุ) |
| 42 | 202278 Baldur's Gate 3 | claims[0] | ส่วนลดของดีลที่ราคาต่ำสุดในบรรดาร้านที่ CheapShark ติดตามคือ 0% | 0 | `data/raw/2026-11-19/game-202278.json` | `/deals/0/savings` | `"0.000000"` | ACCEPT | ตรง |
| 43 | 202278 Baldur's Gate 3 | claims[1] | ราคาตอนนี้ (ราคาต่ำสุดในบรรดาร้านที่ CheapShark ติดตาม) 59.99 ดอลลาร์ ที่ GOG | 59.99 | `data/raw/2026-11-19/game-202278.json` | `/deals/0/price` | `"59.99"` | ACCEPT | ตรง |
| 44 | 202278 Baldur's Gate 3 | claims[2] | ดีลแถวแรกเป็นของร้าน storeID 7 (GOG) | 7 | `data/raw/2026-11-19/game-202278.json` | `/deals/0/storeID` | `"7"` | ACCEPT | ตรง |
| 45 | 202278 Baldur's Gate 3 | claims[3] | ราคาที่ Steam ก็เท่ากันที่ 59.99 ดอลลาร์ | 59.99 | `data/raw/2026-11-19/game-202278.json` | `/deals/1/price` | `"59.99"` | ACCEPT | ตรง |
| 46 | 202278 Baldur's Gate 3 | claims[4] | ดีลแถวที่สองเป็นของร้าน storeID 1 (Steam) | 1 | `data/raw/2026-11-19/game-202278.json` | `/deals/1/storeID` | `"1"` | ACCEPT | ตรง |
| 47 | 202278 Baldur's Gate 3 | claims[5] | ราคาปกติ 59.99 ดอลลาร์ | 59.99 | `data/raw/2026-11-19/game-202278.json` | `/deals/0/retailPrice` | `"59.99"` | ACCEPT | ตรง |
| 48 | 202278 Baldur's Gate 3 | claims[6] | ราคาต่ำสุดที่ CheapShark เคยบันทึก 41.99 ดอลลาร์ | 41.99 | `data/raw/2026-11-19/game-202278.json` | `/cheapestPriceEver/price` | `"41.99"` | ACCEPT | ตรง |
| 49 | 202278 Baldur's Gate 3 | claims[7] | คะแนนรีวิว Steam เป็นบวก 96% | 96 | `data/raw/2026-11-19/deal-202278.json` | `/gameInfo/steamRatingPercent` | `"96"` | ACCEPT | ตรง |
| 50 | 202278 Baldur's Gate 3 | claims[8] | จำนวนรีวิว Steam 452530 รีวิว (รอบ 2026-11-19) | 452530 | `data/raw/2026-11-19/deal-202278.json` | `/gameInfo/steamRatingCount` | `"452530"` | ACCEPT | ตรง |
| 51 | 202278 Baldur's Gate 3 | claims[9] | อัตราแลกเปลี่ยน 33.98 บาทต่อดอลลาร์ (รอบ 2026-11-19) | 33.98 | `data/raw/2026-11-19/fx-usd-thb.json` | `/rates/THB` | `33.975` | ACCEPT | ตรง |
| 52 | 202278 Baldur's Gate 3 | claims[10] | รอบก่อน (2026-11-18) ราคาต่ำสุดตอนนั้น 59.99 ดอลลาร์ | 59.99 | `data/raw/2026-11-18/game-202278.json` | `/deals/0/price` | `"59.99"` | ACCEPT | ตรง · วันก่อนหน้า (เทียบประวัติกับรอบ 2026-11-18 ตามที่ข้อความระบุ) |
| 53 | 202278 Baldur's Gate 3 | claims[11] | รอบก่อน (2026-11-18) จำนวนรีวิว Steam 452525 รีวิว | 452525 | `data/raw/2026-11-18/deal-202278.json` | `/gameInfo/steamRatingCount` | `"452525"` | ACCEPT | ตรง · วันก่อนหน้า (เทียบประวัติกับรอบ 2026-11-18 ตามที่ข้อความระบุ) |
| 54 | 202278 Baldur's Gate 3 | claims[12] | รอบก่อน (2026-11-18) อัตราแลกเปลี่ยน 33.84 บาทต่อดอลลาร์ | 33.84 | `data/raw/2026-11-18/fx-usd-thb.json` | `/rates/THB` | `33.84` | ACCEPT | ตรง · วันก่อนหน้า (เทียบประวัติกับรอบ 2026-11-18 ตามที่ข้อความระบุ) |
| 55 | 264418 Cities: Skylines II | claims[0] | ส่วนลดของดีลที่ราคาต่ำสุดในบรรดาร้านที่ CheapShark ติดตามคือ 30.01% | 30.01 | `data/raw/2026-11-19/game-264418.json` | `/deals/0/savings` | `"30.006001"` | ACCEPT | ตรง |
| 56 | 264418 Cities: Skylines II | claims[1] | ราคาตอนนี้ (ราคาต่ำสุดในบรรดาร้านที่ CheapShark ติดตาม) 34.99 ดอลลาร์ | 34.99 | `data/raw/2026-11-19/game-264418.json` | `/deals/0/price` | `"34.99"` | ACCEPT | ตรง |
| 57 | 264418 Cities: Skylines II | claims[2] | ดีลที่ราคาต่ำสุดเป็นของร้าน storeID 1 (Steam) | 1 | `data/raw/2026-11-19/game-264418.json` | `/deals/0/storeID` | `"1"` | ACCEPT | ตรง |
| 58 | 264418 Cities: Skylines II | claims[3] | ราคาปกติ 49.99 ดอลลาร์ | 49.99 | `data/raw/2026-11-19/game-264418.json` | `/deals/0/retailPrice` | `"49.99"` | ACCEPT | ตรง |
| 59 | 264418 Cities: Skylines II | claims[4] | ราคาต่ำสุดที่ CheapShark เคยบันทึก 30.75 ดอลลาร์ | 30.75 | `data/raw/2026-11-19/game-264418.json` | `/cheapestPriceEver/price` | `"30.75"` | ACCEPT | ตรง |
| 60 | 264418 Cities: Skylines II | claims[5] | คะแนนรีวิว Steam เป็นบวก 58% | 58 | `data/raw/2026-11-19/deal-264418.json` | `/gameInfo/steamRatingPercent` | `"58"` | ACCEPT | ตรง |
| 61 | 264418 Cities: Skylines II | claims[6] | จำนวนรีวิว Steam 35250 รีวิว (รอบ 2026-11-19) | 35250 | `data/raw/2026-11-19/deal-264418.json` | `/gameInfo/steamRatingCount` | `"35250"` | ACCEPT | ตรง |
| 62 | 264418 Cities: Skylines II | claims[7] | อัตราแลกเปลี่ยน 33.98 บาทต่อดอลลาร์ (รอบ 2026-11-19) | 33.98 | `data/raw/2026-11-19/fx-usd-thb.json` | `/rates/THB` | `33.975` | ACCEPT | ตรง |
| 63 | 264418 Cities: Skylines II | claims[8] | รอบก่อน (2026-11-18) ราคาต่ำสุดตอนนั้น 34.99 ดอลลาร์ | 34.99 | `data/raw/2026-11-18/game-264418.json` | `/deals/0/price` | `"34.99"` | ACCEPT | ตรง · วันก่อนหน้า (เทียบประวัติกับรอบ 2026-11-18 ตามที่ข้อความระบุ) |
| 64 | 264418 Cities: Skylines II | claims[9] | รอบก่อน (2026-11-18) ส่วนลด 30.01% | 30.01 | `data/raw/2026-11-18/game-264418.json` | `/deals/0/savings` | `"30.006001"` | ACCEPT | ตรง · วันก่อนหน้า (เทียบประวัติกับรอบ 2026-11-18 ตามที่ข้อความระบุ) |
| 65 | 264418 Cities: Skylines II | claims[10] | รอบก่อน (2026-11-18) จำนวนรีวิว Steam 35239 รีวิว | 35239 | `data/raw/2026-11-18/deal-264418.json` | `/gameInfo/steamRatingCount` | `"35239"` | ACCEPT | ตรง · วันก่อนหน้า (เทียบประวัติกับรอบ 2026-11-18 ตามที่ข้อความระบุ) |
| 66 | 264418 Cities: Skylines II | claims[11] | รอบก่อน (2026-11-18) อัตราแลกเปลี่ยน 33.84 บาทต่อดอลลาร์ | 33.84 | `data/raw/2026-11-18/fx-usd-thb.json` | `/rates/THB` | `33.84` | ACCEPT | ตรง · วันก่อนหน้า (เทียบประวัติกับรอบ 2026-11-18 ตามที่ข้อความระบุ) |

ไม่มี claim ไหนเป็นค่าที่คำนวณเอง (ราคาบาท, คะแนน) ทุก claim ชี้ไปที่ค่าดิบ ตัวเลขใน statement_th ของทุกข้อตรงกับ value ของตัวเอง (Unix time 1577335021 = 2019-12-26T04:37:01Z = 2019-12-26 11:37 Asia/Bangkok วันเดียวกันทั้งสองเขตเวลา)

## R3.2 verdict เทียบกับสูตร METRICS.md

`node scripts/lib/metrics.js 2026-11-19` และคิดมือซ้ำ (ไฟล์ `game-*.json` ของ 2026-11-19 เหมือนของ 2026-11-18 ทุกไบต์ และคะแนนรีวิว % ไม่เปลี่ยน คะแนนจึงเท่ารอบ 2)

| game | F1 = 40×savings/100 | F2 = 35×min(1, ATL/price) | F3 = 25×rating/100 | score | สูตรให้ | brief | ผล |
|---|---|---|---|---|---|---|---|
| 202350 Cyberpunk 2077 | 0 (`game-202350.json#/deals/0/savings` = `"0.000000"`) | 35×17.99/59.99 = 10.50 | 25×89/100 = 22.25 | 32.75 | skip | skip | ACCEPT |
| 196149 Hades | 0 | 35×6.24/24.99 = 8.74 | 24.50 | 33.24 | skip | skip | ACCEPT |
| 150036 Stardew Valley | 0 | 35×5.99/14.99 = 13.99 | 24.50 | 38.49 | skip | skip | ACCEPT |
| 202278 Baldur's Gate 3 | 0 | 35×41.99/59.99 = 24.50 | 24.00 | 48.50 | wait | wait | ACCEPT |
| 264418 Cities: Skylines II | 40×30.006001/100 = 12.00 | 35×30.75/34.99 = 30.76 | 14.50 | 57.26 | wait | wait | ACCEPT |

## R3.3 ตรวจ summary_th (ตัวเลข + การตีความ)

ตัวเลขทุกตัวและวันที่ทุกวันใน summary_th มี claim ของเกมเดียวกันรองรับ ("2077" และ "3" เป็นชื่อเกมจาก `/info/title`)
ตรวจเพิ่มว่าประโยค "...จึงอยู่ในช่วง X" อ้างเหตุผลที่สูตรรองรับจริงหรือไม่ โดยคำนวณคะแนนสูงสุดที่เป็นไปได้ถ้าปัจจัยที่ไม่ได้ถูกอ้างเป็นเหตุได้เต็ม:

| game | ตัวเลข/วันที่ในข้อความ | การตีความ | ผล |
|---|---|---|---|
| 202350 Cyberpunk 2077 | 2026-11-19, 0%, 59.99 (x4), 2026-11-18, 17.99, 89%, 403105, 403071 | "ไม่เปลี่ยนจากรอบ 2026-11-18" = `data/raw/2026-11-18/game-202350.json#/deals/0/price` = `"59.99"` · เหตุของ skip คือไม่มีส่วนลดและห่างจากราคาต่ำสุด: F1 + F2 = 10.50 ต่อให้ F3 = 25 ก็ได้ 35.50 < 40 เหตุผลถูก · "ต่ำกว่าราคาตอนนี้มาก" 17.99/59.99 = 0.30 สมเหตุสมผล · ไม่มีส่วนลดทุกร้าน: `/deals/0..2/savings` = `"0.000000"` ทั้ง 3 แถว | ACCEPT |
| 196149 Hades | 2026-11-19, 0%, 24.99 (x3), 2026-11-18, 6.24, 98%, 143405, 143406 | ดีลเดียวในบรรดาร้านที่ CheapShark ติดตาม (`game-196149.json#/deals` 1 แถว) · F1 + F2 = 8.74 + 25 = 33.74 < 40 เหตุผลถูก · จำนวนรีวิวลดลง 1 (143406 → 143405) ข้อความแค่วางสองค่าเทียบกัน ไม่ได้ตีความ | ACCEPT |
| 150036 Stardew Valley | 2026-11-19, 0%, 14.99 (x3), 2026-11-18, 5.99, 2019-12-26, 98%, 397486, 397481 | GOG กับ Steam ราคาเท่ากัน (`/deals/0/price`, `/deals/1/price` = `"14.99"`) · วันที่ 2019-12-26 มี claims[7], [8] · F1 + F2 = 13.99 + 25 = 38.99 < 40 เหตุผลถูก | ACCEPT |
| 202278 Baldur's Gate 3 | 2026-11-19, 0%, 59.99 (x3), 2026-11-18, 41.99, 96%, 452530, 452525 | "ต่ำกว่าราคาตอนนี้อย่างชัดเจน" 41.99/59.99 = 0.70 · "ราคาตอนนี้ยังไม่คุ้มพอจะซื้อ": F1 + F2 = 24.50 ต่อให้ F3 = 25 ก็ได้ 49.50 < 70 สิ่งที่กันไม่ให้ถึง buy คือราคาจริง · บอกชัดว่าข้อมูลไม่ได้บอกว่าจะลดราคาหรือไม่ เมื่อไร | ACCEPT |
| 264418 Cities: Skylines II | 2026-11-19, 30.01%, 34.99 (x2), 49.99, 2026-11-18, 30.75, 58%, 35250, 35239 | ตัวเลขครบ, Steam ถูกที่สุดเพียงร้านเดียว (34.99 < `/deals/1/price` = `"41.44"`), "ปนกัน" ตรงกับ `deal-264418.json#/gameInfo/steamRatingText` = `"Mixed"` **แต่** "แต่รีวิว Steam อยู่ระดับปนกัน (58% ...) คะแนนตามสูตรจึงอยู่ในช่วง รอ ยังไม่ถึงเกณฑ์ ซื้อ" ผิด: F1 + F2 = 42.76 ต่อให้ F3 = 25 ก็ได้ 67.76 < 70 รีวิวไม่ใช่เหตุที่ไม่ถึง buy เหตุคือส่วนลด 30.01% · คำว่า "ใกล้ราคาต่ำสุด" (30.75/34.99 = 0.88) ยอมรับได้ | **REJECT** |

### รายการที่ตีกลับ (รอบ 3)

| # | game | field | ข้อความ | เหตุผล | หลักฐาน (file + pointer) |
|---|---|---|---|---|---|
| R3-1 | 264418 Cities: Skylines II | summary_th | "แต่รีวิว Steam อยู่ระดับปนกัน (58% จาก 35250 รีวิว เทียบกับ 35239 รีวิวในรอบก่อน) คะแนนตามสูตรจึงอยู่ในช่วง "รอ" (wait) ยังไม่ถึงเกณฑ์ "ซื้อ"" | อ้างความเป็นเหตุผลที่สูตรไม่รองรับ: F1 = 40×30.006001/100 = 12.00, F2 = 35×30.75/34.99 = 30.76 รวม 42.76 ถ้า steamRatingPercent = 100 จะได้ F3 = 25 รวม 67.76 ยังต่ำกว่า 70 ดังนั้นรีวิว 58% ไม่ใช่เหตุที่ไม่ถึง `buy` เหตุคือส่วนลด (ต้องประมาณ 61.85% ขึ้นไปจึงถึง 70 เมื่อค่าอื่นเท่าเดิม) | `data/raw/2026-11-19/game-264418.json#/deals/0/savings` (`"30.006001"`), `#/deals/0/price` (`"34.99"`), `#/cheapestPriceEver/price` (`"30.75"`), `data/raw/2026-11-19/deal-264418.json#/gameInfo/steamRatingPercent` (`"58"`) |

## R3.4 ข้อมูลดิบที่มีปัญหา (2026-11-19)

| # | ปัญหา | file + pointer | ค่าจริง | ผลกระทบ |
|---|---|---|---|---|
| D1 | อัตราแลกเปลี่ยนเป็นของคนละวัน (ยังอยู่) | `data/raw/2026-11-19/fx-usd-thb.json#/date` | `"2026-11-18"` (เก็บข้อมูล 2026-11-18T18:43Z = 2026-11-19 01:43 เวลาไทย ก่อน ECB ประกาศอัตราของวันที่ 19) · รอบก่อน `data/raw/2026-11-18/fx-usd-thb.json#/date` = `"2026-11-17"` | claim อัตราแลกเปลี่ยนเขียนว่า "(รอบ 2026-11-19)" ถูกในแง่รอบที่เก็บ แต่ไม่ใช่อัตราของวันที่ 19 หน้าเว็บต้องแสดงวันที่ของอัตรา ไม่กระทบคะแนน |
| D2 | วันที่ราคาต่ำสุดไม่ตรงกันระหว่าง 2 endpoint (ยังอยู่) | `game-202350.json#/cheapestPriceEver/date` เทียบกับ `deal-202350.json#/cheapestPrice/date` (2026-11-19) | 1781701951 (2026-06-17) เทียบกับ 1793203309 (2026-10-28) | เหมือนรอบ 2; Hades 2025-09-17 vs 2026-09-25, BG3 2026-07-30 vs 2026-10-28, Cities 2026-03-19 vs 2026-09-17 · Stardew ตรงกัน (2019-12-26) |
| D3 | ดีลที่สูตรเลือกไม่ตรงกับที่ CheapShark เลือก (ยังอยู่) | `game-202350.json#/deals/0/dealID` เทียบกับ `lookup-1091500.json#/0/cheapestDealID` | `nL0Ha1...` (Humble) เทียบกับ `ezTZN4...` (Steam) | ไม่กระทบคะแนน |
| D4 | ราคาเสมอกันหลายร้าน (ยังอยู่) | `game-202350.json#/deals` (3), `game-150036.json#/deals` (2), `game-202278.json#/deals` (2) | price = retailPrice ทุกแถว | summary_th ระบุราคาเท่ากันครบแล้ว |
| D5 (ใหม่) | "รอบ 2026-11-18" กับ "รอบ 2026-11-19" ห่างกันแค่ประมาณ 12 ชั่วโมง | `data/raw/2026-11-18/_manifest.json#/started_at` = `"2026-11-18T06:37:08.847Z"` เทียบกับ `data/raw/2026-11-19/_manifest.json#/started_at` = `"2026-11-18T18:43:28.494Z"` | ห่าง 12 ชม. 6 นาที (ถูกกติกาวันตามเวลาไทย) ไฟล์ `game-*.json`, `lookup-*.json`, `stores.json` ทั้ง 11 ไฟล์เหมือนรอบก่อนทุกไบต์ ต่างกันแค่ `deal-*.json` (จำนวนรีวิว) และ `fx-usd-thb.json` | ข้อความ "ราคาไม่เปลี่ยนจากรอบ 2026-11-18" เป็นจริงตามตัวอักษร แต่ไม่ควรอ่านว่า "ราคานิ่งมา 1 วันเต็ม" ไม่ตีกลับ เสนอให้หน้าเว็บแสดงเวลาที่เก็บข้อมูลด้วย |
| D6 (ใหม่) | จำนวนรีวิว Steam ลดลง | `data/raw/2026-11-18/deal-196149.json#/gameInfo/steamRatingCount` = `"143406"` เทียบกับ `data/raw/2026-11-19/deal-196149.json#/gameInfo/steamRatingCount` = `"143405"` | ลดลง 1 | จำนวนรีวิวไม่ใช่ตัวนับที่เพิ่มอย่างเดียว ไม่กระทบสูตร (F3 ใช้แค่ %) |

ตรวจแล้วไม่พบปัญหา: ร้านทุกร้านที่ใช้ (1, 2, 3, 7, 11, 15, 23, 27) มี `isActive` = 1 ใน `data/raw/2026-11-19/stores.json` · ส่วนลดตรงกับราคาทุกแถว (เช่น Cities `/deals/0`: 1 − 34.99/49.99 = 30.006% = `"30.006001"`) · `salePrice` ใน `deal-*.json` ตรงกับราคาใน `game-*.json` ทั้ง 5 เกม · `deal-*.json#/gameInfo/storeID` ตรงกับ `game-*.json#/deals/0/storeID` ทั้ง 5 เกม

## R3.5 WRONG_CASES.md เทียบกับ 2026-11-19

| เคส | ผลบน 2026-11-19 | การตัดสิน |
|---|---|---|
| 1 Stardew Valley (150036) | ค่าเดิมทุกตัว: `game-150036.json#/deals/0/price` = `"14.99"`, `#/cheapestPriceEver/price` = `"5.99"`, `#/cheapestPriceEver/date` = `1577335021` (2019-12-26), `deal-150036.json#/gameInfo/steamRatingPercent` = `"98"`, `#/gameInfo/steamRatingCount` = `"397486"` สูตรยังให้ skip 38.49 | **คงไว้** อัปเดต file + pointer เป็น `data/raw/2026-11-19/` |
| 2 Hades (196149) | ค่าเดิม: `game-196149.json#/deals/0/price` = `"24.99"`, `#/cheapestPriceEver/price` = `"6.24"`, วันที่ 2025-09-17 (games) / 2026-09-25 (deals), `deal-196149.json#/gameInfo/steamRatingPercent` = `"98"`, `#/gameInfo/steamRatingCount` = `"143405"` สูตรยังให้ skip 33.24 | **คงไว้** อัปเดต file + pointer เป็น `data/raw/2026-11-19/` |

## R3.6 สรุปอัตราที่ตรง (รอบ 3)

| รายการ | ผ่าน / ทั้งหมด | % |
|---|---|---|
| claim (value = ค่าที่ file + pointer, 2 ตำแหน่ง) | 66 / 66 | 100% |
| claim ชี้ไปที่ 2026-11-19 หรือเป็นการเทียบประวัติที่ระบุชัด | 66 / 66 (50 + 16) | 100% |
| ตัวเลขและวันที่ใน statement_th / summary_th มี claim รองรับ | 5 / 5 เกม | 100% |
| verdict ตรงกับ METRICS.md | 5 / 5 | 100% |
| summary_th ไม่ตีความเกินข้อมูล / เหตุผลตรงกับสูตร | 4 / 5 | 80% |
| **รวมทุกรายการที่ตัดสิน (66 claim + 5 summary)** | **70 / 71** | **98.59%** |

## ผลรวมรอบ 3: **REJECTED (1)**

`data/brief.json` ยังเผยแพร่ไม่ได้จนกว่าจะแก้ summary_th ของ 264418 ตาม R3-1 แล้วตรวจซ้ำ (รอบ 4) ตัวเลข claim และ verdict ทั้งหมดถูกต้อง ไม่ต้องแก้

เคสที่สูตรให้คำตอบผิด: [`WRONG_CASES.md`](WRONG_CASES.md) (รอบ 3 คงทั้ง 2 เคส อัปเดต pointer เป็น 2026-11-19)


---

# Round 4 (2026-11-19)

brief = `data/brief.json` (ฉบับที่ยังไม่ commit, mtime 2026-11-19 01:56:50 +0700) · ข้อมูลดิบ `data/raw/2026-11-19/` (เทียบประวัติกับ `data/raw/2026-11-18/`) · ตรวจวันที่ 2026-11-19
ผู้ตรวจ: evidence-reviewer (อิสระ) · วิธีตรวจ: skill `verify-deal-claim` (`node scripts/verify-claims.js data/brief.json`) + `analyzeDay('2026-11-19')` ใน `scripts/lib/metrics.js` รันเอง + `computeFactors()` แบบเปลี่ยนคะแนนรีวิว (0 / 58 / 100) + สคริปต์ดึงตัวเลขทุกตัวจาก summary_th มาเทียบกับ value ของ claim + อ่านข้อความเอง
ไม่ได้เชื่อคำสรุปของข้อความใหม่ที่ผู้สั่งงานส่งมา ทุกข้อด้านล่างคำนวณจากไฟล์ดิบเอง

REJECTED: 0

## R4.0 ผลจากเครื่องมือ (รันเอง)

`node scripts/verify-claims.js data/brief.json` ได้ 66 บรรทัด ACCEPT ไม่มีบรรทัด ISSUE บรรทัดสุดท้าย:
```
claims 66, matched 100% , issues 0 -> PASS
```
ไฟล์ดิบไม่ถูกแก้: sha256 ของทั้ง 17 ไฟล์ใน `data/raw/2026-11-19/` ตรงกับ `_manifest.json#/requests/*/sha256` (ตรวจเอง, mismatch 0) ทุก request ได้ HTTP 200

## R4.1 สถานะของ R3-1 (264418 Cities: Skylines II)

ข้อความใหม่ใน `data/brief.json` (264418 summary_th): "...ตามสูตร ส่วนลดกับความใกล้ราคาต่ำสุดรวมกันก็ทำให้คะแนนอยู่ในช่วง "รอ" (wait) แล้วโดยไม่ต้องนับรีวิว แต่ส่วนลด 30.01% ยังไม่พอให้คะแนนถึงเกณฑ์ "ซื้อ" ต่อให้รีวิว Steam ได้คะแนนเต็มก็ตาม รีวิว Steam ตอนนี้อยู่ระดับปนกัน (58% จาก 35250 รีวิว เทียบกับ 35239 รีวิวในรอบก่อน) ซึ่งไม่ได้เปลี่ยนผล "รอ""

ตรวจแต่ละข้ออ้างเชิงเหตุผลด้วย `computeFactors()` (input จาก file + pointer):

| ข้ออ้างในข้อความ | การคำนวณ | ผล |
|---|---|---|
| ส่วนลด + ความใกล้ราคาต่ำสุด ทำให้อยู่ในช่วง "รอ" แล้วโดยไม่นับรีวิว | F1 = 40 × 30.006001/100 = 12.00 (`data/raw/2026-11-19/game-264418.json#/deals/0/savings` = `"30.006001"`), F2 = 35 × 30.75/34.99 = 30.76 (`#/cheapestPriceEver/price` = `"30.75"`, `#/deals/0/price` = `"34.99"`), F3 = 0 ได้ `{score: 42.76, verdict: 'wait'}` ≥ 40 | ACCEPT |
| ส่วนลด 30.01% ไม่พอถึง "ซื้อ" ต่อให้รีวิวเต็ม | rating = 100 ได้ F3 = 25, `{score: 67.76, verdict: 'wait'}` < 70 | ACCEPT |
| รีวิว 58% ไม่ได้เปลี่ยนผล "รอ" | rating = 58 (`data/raw/2026-11-19/deal-264418.json#/gameInfo/steamRatingPercent` = `"58"`) ได้ F3 = 14.50, score 57.26 = `wait` · F3 ใด ๆ ในช่วง 0-25 ให้ score 42.76-67.76 ซึ่งเป็น `wait` ทั้งหมด | ACCEPT |
| "ระดับปนกัน" | `deal-264418.json#/gameInfo/steamRatingText` = `"Mixed"` | ACCEPT |

ข้อสังเกต (ไม่ตีกลับ): "ส่วนลด 30.01% ยังไม่พอ" ชี้ส่วนลดเป็นตัวแปรที่ขาด ถ้าส่วนลดมากขึ้น ราคาจะลดลงและ F2 จะสูงขึ้นด้วย แต่ที่ส่วนลด 30.01% ตามที่เขียน คะแนนสูงสุดที่เป็นไปได้คือ 67.76 จริง จึงไม่ผิด ข้อความไม่ได้ใส่ตัวเลขที่คำนวณเอง (12.00, 30.76, 42.76, 67.76) ลงใน summary_th ซึ่งถูกต้อง เพราะค่าเหล่านี้ไม่มี claim ค่าดิบรองรับ

**R3-1: แก้แล้ว (resolved)**

## R4.2 ตาราง claim ทั้งหมด (66 ข้อ)

claims ทั้ง 66 ข้อ (statement_th, value, file, pointer) ตรงกับที่ตาราง R3.1 บันทึกไว้ทุกข้อ จึงอ้างตาราง R3.1 (แถว 1-66) แทนการคัดลอกซ้ำ ค่าจริงในไฟล์อ่านใหม่ในรอบนี้ทั้งหมดด้วย `verify-claims.js` และได้ผลเดียวกัน:

| game | claims | file + pointer + ค่าจริง | ผล |
|---|---|---|---|
| 202350 Cyberpunk 2077 | 15 (claims[0]-[14]) | ตาม R3.1 แถว 1-15 | 15 ACCEPT |
| 196149 Hades | 11 (claims[0]-[10]) | ตาม R3.1 แถว 16-26 | 11 ACCEPT |
| 150036 Stardew Valley | 15 (claims[0]-[14]) | ตาม R3.1 แถว 27-41 | 15 ACCEPT |
| 202278 Baldur's Gate 3 | 13 (claims[0]-[12]) | ตาม R3.1 แถว 42-54 | 13 ACCEPT |
| 264418 Cities: Skylines II | 12 (claims[0]-[11]) | ตาม R3.1 แถว 55-66 | 12 ACCEPT |

ค่าที่ต้องปัดเศษ: `game-264418.json#/deals/0/savings` = `"30.006001"` ได้ 30.01 · `fx-usd-thb.json#/rates/THB` = `33.975` ได้ 33.98 · ไม่มี claim ไหนเป็นค่าที่คำนวณเอง (ราคาบาท, คะแนน)

## R4.3 verdict เทียบกับสูตร METRICS.md (รัน `analyzeDay('2026-11-19')` เอง)

| game | F1 | F2 | F3 | score | สูตรให้ | brief | ผล |
|---|---|---|---|---|---|---|---|
| 202350 Cyberpunk 2077 | 0 | 10.50 | 22.25 | 32.75 | skip | skip | ACCEPT |
| 196149 Hades | 0 | 8.74 | 24.50 | 33.24 | skip | skip | ACCEPT |
| 150036 Stardew Valley | 0 | 13.99 | 24.50 | 38.49 | skip | skip | ACCEPT |
| 202278 Baldur's Gate 3 | 0 | 24.50 | 24.00 | 48.50 | wait | wait | ACCEPT |
| 264418 Cities: Skylines II | 12.00 | 30.76 | 14.50 | 57.26 | wait | wait | ACCEPT |

## R4.4 ตรวจ summary_th ทั้ง 5 เกม (ตัวเลข + เหตุผลที่อ้างถึงสูตร)

ดึงตัวเลข/วันที่ทุกตัวจาก summary_th ด้วยสคริปต์ แล้วเทียบกับ value ของ claim ในเกมเดียวกัน (2 ตำแหน่ง) และวันที่กับ statement_th: ตัวที่ไม่มี claim มีแค่ "2077" (202350) และ "3" (202278) ซึ่งเป็นชื่อเกมจาก `game-*.json#/info/title`

| game | ตัวเลขที่ไม่มี claim | ข้ออ้างเชิงเหตุผล (ตรวจด้วยคะแนนสูงสุดที่เป็นไปได้) | ผล |
|---|---|---|---|
| 202350 Cyberpunk 2077 | ไม่มี (นอกจากชื่อเกม) | "ไม่มีส่วนลดและราคาห่างจากราคาต่ำสุด ... จึงอยู่ในช่วง ไม่ซื้อ": F1 + F2 = 10.50 ถ้า F3 = 25 ได้ 35.50 < 40 · ไม่มีส่วนลดทุกร้าน (`/deals/0..2/savings` = `"0.000000"`) | ACCEPT |
| 196149 Hades | ไม่มี | ดีลเดียว (`game-196149.json#/deals` มี 1 แถว) · F1 + F2 = 8.74 ถ้า F3 = 25 ได้ 33.74 < 40 | ACCEPT |
| 150036 Stardew Valley | ไม่มี | วันที่ 2019-12-26 มี claims[7], [8] รองรับ (1577335021 = 2019-12-26T04:37:01Z) · F1 + F2 = 13.99 ถ้า F3 = 25 ได้ 38.99 < 40 | ACCEPT |
| 202278 Baldur's Gate 3 | ไม่มี (นอกจากชื่อเกม) | "ยังไม่คุ้มพอจะซื้อ": F1 + F2 = 24.50 ถ้า F3 = 25 ได้ 49.50 < 70 และ score จริง 48.50 ≥ 40 · บอกชัดว่าข้อมูลไม่ได้บอกว่าจะลดราคาหรือไม่/เมื่อไร | ACCEPT |
| 264418 Cities: Skylines II | ไม่มี | ดู R4.1 · Steam เป็นร้านที่ถูกที่สุดร้านเดียว (34.99 < `/deals/1/price` = `"41.44"`) | ACCEPT |

ไม่พบคำตีความเกินข้อมูล ("ถูกที่สุดในตลาด", "ราคาจะลด") ทุกข้อความจำกัดขอบเขตว่า "ในบรรดาร้านที่ CheapShark ติดตาม"

## R4.5 ไฟล์ร่างที่ถูกตีกลับของรอบ 3 ไม่ได้ถูกเก็บไว้

ตามคำสั่งผู้ใช้ `data/review.json` รอบ 3 เปลี่ยน `brief_file` เป็น `"data/brief.rejected-2.json"` แต่ผู้ตรวจตรวจเองแล้วพบว่า **ไฟล์นี้ไม่ได้เก็บร่างที่ถูกตีกลับ**:

- `cmp data/brief.json data/brief.rejected-2.json` ได้ `IDENTICAL` (22572 ไบต์ทั้งคู่)
- mtime: `data/brief.json` = 2026-11-19 01:56:50 +0700, `data/brief.rejected-2.json` = 2026-11-19 02:03:47 +0700 คือไฟล์ "rejected-2" ถูกสร้างหลังจาก brief.json ถูกเขียนใหม่แล้ว จึงเป็นสำเนาของฉบับที่แก้แล้ว (ฉบับที่รอบ 4 ตรวจ)
- ข้อความที่ถูกตีกลับในรอบ 3 ("...35239 รีวิวในรอบก่อน) คะแนนตามสูตรจึงอยู่ในช่วง "รอ" (wait) ยังไม่ถึงเกณฑ์ "ซื้อ"") ไม่มีอยู่ใน `data/brief.rejected-2.json` ค้นทั้ง repo (ยกเว้น node_modules) พบเฉพาะในคำอ้างของ `REVIEW.md` R3-1 และ `data/review.json#/rounds/2/rejected/0/text` ส่วน `git show HEAD:data/brief.json` มีประโยคแบบเดียวกันแต่เป็นฉบับรอบ 2 ("58% จาก 35239 รีวิว") ไม่ใช่ร่างของรอบ 3

ผลคือหลักฐานร่างที่ถูกตีกลับในรอบ 3 เหลือแค่คำอ้างบางส่วนใน REVIEW.md / review.json บันทึกหมายเหตุนี้ไว้ที่ `data/review.json#/rounds/2/brief_file_note` (ฟิลด์ใหม่; `scripts/build-site-data.js` ส่ง review.json ต่อทั้งก้อน และ test ตรวจแค่ว่ามี `rounds` จึงรับฟิลด์เพิ่มได้) ผู้ตรวจไม่ได้แก้หรือสร้างไฟล์ brief ใด ๆ

## R4.6 ข้อมูลดิบที่มีปัญหา และ WRONG_CASES.md

ข้อมูลดิบชุดเดียวกับรอบ 3 ปัญหา D1-D6 ใน R3.4 ยังอยู่ทั้งหมด (`analyzeDay` รายงาน `fx-date` ทั้ง 5 เกม: `data/raw/2026-11-19/fx-usd-thb.json#/date` = `"2026-11-18"`, `all-time-low-disagrees` 4 เกม, `price-tie` 3 เกม) ไม่พบปัญหาใหม่: ร้าน 1, 7, 11 มี `isActive` = 1, ไม่มี `savings-mismatch`, `deal-*.json#/gameInfo/salePrice` ตรงกับราคาใน `game-*.json` ทั้ง 5 เกม

WRONG_CASES.md: **ไม่แก้** เคส 1 Stardew Valley ยังได้ skip 38.49 และเคส 2 Hades ยังได้ skip 33.24 บน 2026-11-19 (ค่าตรงกับที่ไฟล์เขียนไว้ทุกตัว) และไม่พบเคสใหม่ที่สูตรตอบผิด

## R4.7 สรุปอัตราที่ตรง (รอบ 4)

| รายการ | ผ่าน / ทั้งหมด | % |
|---|---|---|
| claim (value = ค่าที่ file + pointer, 2 ตำแหน่ง) | 66 / 66 | 100% |
| ตัวเลขและวันที่ใน statement_th / summary_th มี claim รองรับ | 5 / 5 เกม | 100% |
| verdict ตรงกับ METRICS.md | 5 / 5 | 100% |
| summary_th ไม่ตีความเกินข้อมูล / เหตุผลตรงกับสูตร | 5 / 5 | 100% |
| ข้อที่ตีกลับในรอบ 3 แก้แล้ว | 1 / 1 | 100% |
| **รวมทุกรายการที่ตัดสิน (66 claim + 5 summary)** | **71 / 71** | **100%** |

## ผลรวมรอบ 4: **ACCEPT (REJECTED: 0)**

R3-1 แก้แล้วโดยเหตุผลตรงกับสูตร claim และ verdict ทั้งหมดถูกต้อง `data/brief.json` เผยแพร่ได้ เรื่องที่ไม่ใช่ปัญหาของ brief แต่ผู้ใช้ควรตัดสินใจ: `data/brief.rejected-2.json` ไม่ใช่ร่างที่ถูกตีกลับ (R4.5) ควรเก็บต่อ ลบ หรือเปลี่ยนชื่อ

เคสที่สูตรให้คำตอบผิด: [`WRONG_CASES.md`](WRONG_CASES.md) (รอบ 4 ไม่ได้แก้ไฟล์นี้)

---

## หมายเหตุจาก Lead หลังรอบ 4 (เรื่อง R4.5)

`data/brief.rejected-2.json` ถูกสร้างใหม่จาก transcript จริงของ deal-analyst (การเขียน `data/brief.json` ครั้งสุดท้ายในรันวันที่ 2 ซึ่งเป็นฉบับที่รอบ 3 ตรวจ) ตอนนี้ไฟล์นี้คือร่างที่ถูกตีกลับจริง: มีประโยค "...แต่รีวิว Steam อยู่ระดับปนกัน (58% ...) คะแนนตามสูตรจึงอยู่ในช่วง "รอ"" และ claim 66/66 ตรงไฟล์ดิบ · ข้อความของผู้ตรวจในรอบ 4 ด้านบนคงไว้ตามที่ตรวจเจอตอนนั้น
