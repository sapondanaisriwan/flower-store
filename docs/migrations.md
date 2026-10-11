# Migration ร้านดอกไม้

เพิ่ม 10 ไฟล์ตาม schema: แก้ users และสร้างตารางใหม่ 9 ตาราง
ยังไม่ได้ทำ Model หรือ Controller

## สิ่งที่เพิ่ม

- users: เพิ่ม role, username, is_banned โดยเก็บ name เดิมไว้
- products: ข้อมูลสินค้า ราคา สต็อก และรูป
- user_addresses: ที่อยู่และข้อมูลผู้รับ
- carts / cart_product: ตะกร้าและสินค้าในตะกร้า
- wishlists / wishlist_product: สินค้าที่สนใจ
- orders / order_product: คำสั่งซื้อและรายการสินค้า
- ratings: คะแนน 1–5 ดาวต่อรายการซื้อ

กำหนดคีย์และความสัมพันธ์ ป้องกันรายการซ้ำ และจำนวนสินค้าต่ำกว่า 1
ชื่อ ราคา และรูปสินค้าในออเดอร์เก็บข้อมูลตอนซื้อ

## ผลทดสอบ

ทดสอบในฐานข้อมูลแยกบน Docker Sail วันที่ 11 ต.ค. 2026:

- migrate → rollback ทั้ง 10 ไฟล์ → migrate กลับ ผ่าน
- ตรวจ foreign keys, CHECK และรูปแบบ PHP ผ่าน

ยังไม่ได้ทดสอบการคัดลอกชื่อผู้ใช้เดิมหรือระบบซื้อขาย
ไม่ได้รัน migrations บนฐานข้อมูลร้าน

## วิธีรัน

เปิด Docker Desktop แล้วรัน:

```bash
./vendor/bin/sail up -d
./vendor/bin/sail artisan migrate --pretend
./vendor/bin/sail artisan migrate
```

คำสั่ง migrate ใช้ฐานข้อมูลที่ตั้งไว้ใน .env
ถ้าจะทดสอบ rollback ให้ใช้ฐานข้อมูลแยก เพราะ rollback จะลบตารางและข้อมูลที่ย้อนกลับ
