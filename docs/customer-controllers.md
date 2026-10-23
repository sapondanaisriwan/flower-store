# Controller ฝั่ง User รอบแรก

ทำ 3 ส่วน: Profile, ที่อยู่ และ Wishlist

- Profile ใช้ของเดิม แก้ชื่อแล้วบันทึก name กับ username ให้ตรงกัน
- ที่อยู่ดู เพิ่ม แก้ และปิดใช้งานได้เฉพาะของตัวเอง
- Wishlist อ่าน/เขียนฐานข้อมูลแล้ว ปุ่มหัวใจไม่ใช้ localStorage
- ที่อยู่กับ Wishlist ใช้ได้เฉพาะ customer ที่ไม่ถูกแบน

## ที่อยู่

เส้นทางนี้ส่งกลับ JSON สำหรับให้หน้า Checkout เรียกใช้ภายหลัง
ต้องล็อกอิน และถ้าส่งจาก browser ต้องส่ง CSRF token ตามระบบ Laravel

| Method | URL | งาน |
|---|---|---|
| GET | /addresses | ดูที่อยู่ที่ยังใช้งาน |
| POST | /addresses | เพิ่มที่อยู่ |
| PATCH | /addresses/{addressName} | แก้ที่อยู่ |
| DELETE | /addresses/{addressName} | ปิดใช้งาน ไม่ลบแถว |

POST/PATCH ส่ง address_name, recipient_name, address_line, subdistrict,
district, province, postal_code, phone_number
ใช้ชื่อฟิลด์ตาม DB; ชื่อที่อยู่ใน URL ต้อง encodeURIComponent ก่อน
ชื่อที่อยู่ห้ามซ้ำในบัญชีเดิม รวมถึงชื่อที่เคยปิดใช้งานแล้ว

## Wishlist

GET /wishlist เปิดหน้าเดิม โดยรับ items จากฐานข้อมูล
POST /wishlist ส่ง product_id เพื่อเพิ่ม
DELETE /wishlist/{product} เพื่อลบ

เพิ่มซ้ำไม่สร้างแถวซ้ำ สินค้าหมดบันทึกได้ แต่สินค้าที่ is_deleted เพิ่มไม่ได้และไม่แสดง
หน้าอื่นได้ wishlistIds จาก Inertia เพื่อแสดงหัวใจ
ยังไม่ย้ายรายการเก่าจาก localStorage เข้าฐานข้อมูล

## งานที่ยังไม่รวม

- หน้า Checkout และ Cart ยังเป็นของทดลองเดิม
- ฟอร์มที่อยู่ใน Checkout ยังไม่ได้เรียก endpoints ใหม่
- หน้าเลือกสินค้า/รายละเอียดสินค้ายังใช้ catalog ตัวอย่าง ต้องเชื่อม ProductController ต่อ
  รหัสสินค้าในหน้าเหล่านั้นต้องมีจริงใน DB จึงกด Wishlist ได้
- ไม่เพิ่มข้อมูลสินค้าตัวอย่างลงฐานข้อมูลร้านในรอบนี้
- การลบบัญชีใช้โค้ดเดิม ยังต้องตกลงกรณีมีที่อยู่หรือออเดอร์อ้างอิง

## ผลทดสอบ 23 ต.ค. 2026

รันบนฐานข้อมูลแยก flower_profile_check_20261023
PHPUnit ผ่าน 68 tests / 355 assertions รวมกรณีแก้ข้อมูลข้ามบัญชี
อีเมล/ชื่อที่อยู่ซ้ำ สินค้าถูกลบ บัญชี admin/แบน และการเปลี่ยนชื่อที่อยู่ที่ออเดอร์อ้างอิง
PHPStan, Pint, TypeScript และ production build ผ่าน
ไม่ได้เพิ่มข้อมูลหรือรัน migrations บนฐานข้อมูลร้าน
