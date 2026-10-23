# Migrations

ตาม schema ของทีม 10 ตาราง ใช้ชื่อตารางแบบ Laravel เช่น User เป็น users

- เดิม 10 ไฟล์: เพิ่มฟิลด์ users และสร้างตารางใหม่ 9 ตาราง
- เพิ่ม 2026_10_23_000001_use_username_for_users_table.php: เติม username ที่ว่างจาก name แล้วเอา name ออก
- เพิ่ม 2026_10_23_000002_align_rating_foreign_keys_with_schema.php: เปลี่ยน FK ของ Rating ให้ชี้ orders และ products แยกกันตามภาพ
- คงฟิลด์ Login/ยืนยันอีเมล/2FA ของ Laravel ตามขอบเขตที่ตกลง ไม่แก้ฟีเจอร์ส่วนนี้
- ไม่แก้ migration เก่าที่แชร์แล้ว ใช้ไฟล์ใหม่ปรับฐานข้อมูลเดิม

คีย์ผสมตามแบบ: user_addresses, ratings, order_product, cart_product, wishlist_product
ตะกร้า/Wishlist ใช้ user_id เป็น PK ส่วน orders อ้างที่อยู่ด้วยคู่ user_id + address_name
ชื่อ ราคา และรูปใน order_product เป็นข้อมูลตอนซื้อ

รายละเอียดที่ภาพไม่ระบุ: ชนิดข้อมูล ค่าเริ่มต้น กฎลบ คะแนน 1–5 และจำนวนอย่างน้อย 1
โค้ดใช้ status เริ่ม pending และ product_order เป็นลำดับเริ่ม 1 รอทีมยืนยันความหมาย

23 ต.ค. 2026: ตรวจฟิลด์ทั้ง 10 ตาราง FK ของ Rating ย้ายชื่อเดิม และ rollback ผ่านใน DB แยก
ทั้งโปรเจกต์ผ่าน 87 tests / 568 assertions และ PHPStan ผ่าน

รันบน DB ตาม .env หลังเปิด Docker Desktop:

```bash
./vendor/bin/sail up -d
./vendor/bin/sail artisan migrate
```

ถ้า rollback ตัวปรับ FK Rating ต้องมีคู่ order_id/product_id ใน order_product ครบก่อน
ทดสอบ rollback เฉพาะ DB แยก เพราะบาง migration ลบตารางและข้อมูล
