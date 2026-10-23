# Controller ฝั่ง User

## 1. Profile — แก้ชื่อและอีเมล

ใช้ Controller เดิม รับและบันทึก username ตาม schema
เปลี่ยนอีเมลแล้วล้างสถานะยืนยันอีเมล รับเฉพาะข้อมูลของคนที่ล็อกอิน

**ไฟล์เพิ่ม:**

- database/migrations/2026_10_23_000001_use_username_for_users_table.php — เติม username ที่ว่างจาก name เดิม แล้วเอา name ออก ย้อนกลับได้
- tests/Feature/UsernameMigrationTest.php — ตรวจย้ายชื่อเดิม rollback และฟิลด์ทั้ง 10 ตารางเทียบ schema

**ไฟล์แก้:**

- app/Http/Controllers/Settings/ProfileController.php — ปรับ update() และเพิ่มคอมเมนต์
- app/Http/Requests/Settings/ProfileUpdateRequest.php — เพิ่มคำอธิบาย กฎตรวจข้อมูลใช้ของเดิม
- app/Models/User.php — เปลี่ยน Fillable จาก name เป็น username
- tests/Feature/Settings/ProfileUpdateTest.php — ตรวจ username ข้อมูลผิด อีเมลซ้ำ และแอบเปลี่ยนบัญชี/role
- app/Concerns/ProfileValidationRules.php และ app/Actions/Fortify/CreateNewUser.php — ตรวจและบันทึก username ตอนสมัคร
- database/factories/UserFactory.php และ database/seeders/DatabaseSeeder.php — ใช้ username
- resources/js/pages/auth/register.tsx และ pages/settings/profile.tsx — ฟอร์มส่ง username
- resources/js/types/auth.ts, components/user-info.tsx, components/app-header.tsx และ components/store/store-chrome.tsx — แสดงชื่อจาก username (path ต่อจาก resources/js/)
- tests/Feature/Auth/RegistrationTest.php — ตรวจสมัครด้วย username และรหัสผ่านถูก hash

สมัครสมาชิกใช้ username แล้ว ส่วนการลบบัญชีที่มีประวัติซื้อยังต้องทำต่อ

## 2. ที่อยู่ — ดู เพิ่ม แก้ และปิดใช้งาน

เลือกที่อยู่ด้วย user_id + address_name ของตัวเอง
ปิดด้วย is_active แทนลบจริง ส่งผลกลับเป็น JSON
ชื่อที่อยู่ห้ามซ้ำในบัญชี รวมชื่อที่ปิดไปแล้ว

**ไฟล์เพิ่ม:**

- app/Http/Controllers/UserAddressController.php — index ดู, store เพิ่ม, update แก้, destroy ปิดที่อยู่
- app/Http/Requests/Addresses/SaveAddressRequest.php — ตรวจข้อมูลครบ ชื่อไม่ซ้ำ เบอร์โทร 9–10 หลักเริ่ม 0 และไปรษณีย์ 5 หลัก
- tests/Feature/UserAddressTest.php — ตรวจการจัดการที่อยู่ สิทธิ์ และที่อยู่ที่ออเดอร์อ้างอิง

**ไฟล์แก้:**

- routes/web.php — เพิ่ม GET/POST /addresses และ PATCH/DELETE /addresses/{addressName}

ส่ง address_name, recipient_name, phone_number, address_line, subdistrict,
district, province, postal_code ชื่อที่อยู่ใน URL ใช้ encodeURIComponent
ฟอร์มที่อยู่ใน Checkout เชื่อมในหัวข้อ 6

## 3. Wishlist — สินค้าที่สนใจ

เปลี่ยนจาก localStorage เป็น MySQL เพิ่มซ้ำไม่สร้างแถวซ้ำ
สินค้าหมดบันทึกได้ แต่สินค้าที่ is_deleted เพิ่มไม่ได้และไม่แสดง

**ไฟล์เพิ่ม:**

- app/Http/Controllers/WishlistController.php — ดูสินค้าพร้อมคะแนนเฉลี่ย เพิ่มและลบเฉพาะของตัวเอง
- app/Http/Requests/Wishlist/StoreWishlistRequest.php — ตรวจ product_id ว่ามีจริงและไม่ปิดขาย

**ไฟล์แก้:**

- routes/web.php — GET/POST /wishlist และ DELETE /wishlist/{product}; เพิ่มส่ง product_id
- app/Http/Middleware/HandleInertiaRequests.php — ส่ง wishlistIds ให้ปุ่มหัวใจทุกหน้า
- resources/js/types/global.d.ts — เพิ่มชนิด wishlistIds
- resources/js/hooks/use-wishlist.ts — ส่ง POST/DELETE และแจ้งผลหลัง server ตอบ
- resources/js/components/store/wishlist-button.tsx — ใช้ hook ใหม่ ปิดปุ่มระหว่างส่ง
- resources/js/pages/wishlist.tsx — รับสินค้า/ราคา/รูป/คะแนนจาก DB ปุ่มตะกร้าทดลองเปลี่ยนเป็นดูสินค้า
- tests/Feature/WishlistTest.php — ตรวจรายการซ้ำ สิทธิ์ สินค้าปิดขาย และข้อมูลแยกบัญชี

ยังไม่ย้าย Wishlist เก่าจาก localStorage

## 4. Cart — ตะกร้าสินค้า

อ่าน/เขียน MySQL ตรวจจำนวนเป็นจำนวนเต็ม 1–1,000,000 และไม่เกินสต็อก
เพิ่มสินค้าเดิมจะบวกจำนวน ส่วนแก้จำนวนใช้ค่าใหม่แทน ยังไม่ตัดสต็อกตอนเพิ่มตะกร้า

**ไฟล์เพิ่ม:**

- app/Http/Controllers/CartController.php — ดู เพิ่ม แก้จำนวน และลบเฉพาะของตัวเอง
- app/Http/Requests/Cart/CartItemRequest.php — ตรวจ product_id และ quantity
- app/Support/CustomerCart.php — อ่านสินค้าจริงในตะกร้า และล็อกบัญชีก่อนแก้ตะกร้า/Checkout
- resources/js/types/shop.ts — ชนิดข้อมูลและฟังก์ชันแสดงราคา/รูป ใช้ร่วมกับ Orders และ Checkout
- tests/Concerns/ShopFixtures.php — สร้างข้อมูลทดสอบร่วมของ Cart, Orders และ Checkout

**ไฟล์แก้:**

- routes/web.php — GET/POST /cart และ PATCH/DELETE /cart/{product}
- app/Http/Middleware/HandleInertiaRequests.php — ส่ง cartLines ให้ทุกหน้า
- resources/js/types/global.d.ts — เพิ่มชนิด cartLines
- resources/js/hooks/use-cart.ts — ใช้ POST/PATCH/DELETE แทน localStorage
- resources/js/pages/cart.tsx — แสดงข้อมูลจริง ปรับจำนวน ลบ และไป Checkout
- resources/js/pages/product-detail.tsx — ใช้การเพิ่มตะกร้าแบบใหม่
- resources/js/components/store/store-chrome.tsx — แสดงจำนวนในตะกร้าจาก backend
- tests/Feature/CartTest.php — ตรวจจำนวนเกินสต็อก เพิ่มซ้ำ สินค้าปิดขาย และสิทธิ์

ยังไม่ย้ายตะกร้าเก่าจาก localStorage

## 5. Orders — ประวัติและรายละเอียดคำสั่งซื้อ

ดูเฉพาะของตัวเอง แบ่งครั้งละ 10 ออเดอร์
รายละเอียดใช้ชื่อ/ราคา/รูปและที่อยู่ตอนซื้อ ไม่เปลี่ยนตามข้อมูลปัจจุบัน

**ไฟล์เพิ่ม:**

- resources/js/components/store/purchased-order-items.tsx — แสดงสินค้า/คะแนนจาก DB ด้วยหน้าตาการ์ดเดิม ไม่แก้ฟอร์ม Rating ทดลองของเพื่อน
- app/Http/Controllers/OrderController.php — index แสดงประวัติ/กรองสถานะก่อนแบ่งหน้า, show แสดงรายละเอียด

**ไฟล์แก้:**

- routes/web.php — GET /orders และ GET /orders/{order} ใช้เลข id แทน DEMO
- resources/js/pages/orders.tsx — คืน layout แท็บ/การ์ด/สรุปของเพื่อน ใช้ข้อมูลจริง กรองสถานะและแบ่งหน้า
- tests/Feature/OrdersTest.php — ตรวจเปิดออเดอร์ตัวเอง/คนอื่น รหัสที่ไม่มี สิทธิ์ และแบ่งหน้า

ใช้ชนิดข้อมูลและฟังก์ชันแสดงสถานะใน resources/js/types/shop.ts ร่วมกับหัวข้อ 4
Rating จริงและการเปลี่ยนสถานะต้องเชื่อมกับงานเพื่อน

## 6. Checkout — ยืนยันคำสั่งซื้อ

ล็อกบัญชี → อ่านตะกร้า → ล็อกสินค้าเรียง id → ตรวจสต็อก → คำนวณราคาจาก DB
→ เก็บข้อมูลตอนซื้อ → ตัดสต็อก → ล้างตะกร้า → เปิดออเดอร์

ทำใน transaction เดียวกัน ผิดพลาดย้อนทั้งหมด คำนวณเงินเป็นสตางค์ก่อนรวม
ส่งตะกร้าเดิมซ้ำหลังสำเร็จไม่สร้างออเดอร์เพิ่ม เพราะตะกร้าว่างแล้ว
สถานะเริ่ม pending และ product_order เริ่ม 1 ยังรอทีมยืนยันข้อตกลงนี้

**ไฟล์เพิ่ม:**

- app/Http/Controllers/CheckoutController.php — เปิดหน้าและบันทึกคำสั่งซื้อตามขั้นตอนข้างบน
- app/Http/Requests/Checkout/CheckoutRequest.php — ใช้กฎ SaveAddressRequest ร่วมกัน และตรวจที่อยู่เดิมว่าเป็นของตัวเองที่ยังใช้งาน

**ไฟล์แก้:**

- routes/web.php — GET/POST /checkout
- resources/js/pages/checkout.tsx — คืน layout เดิม: ที่อยู่พับได้ การ์ดสินค้า ปุ่มจำนวน และกล่องสรุป เลือกที่อยู่จาก DB/เพิ่มใหม่แล้วส่งคำสั่งซื้อจริง
- tests/Feature/CheckoutTest.php — ตรวจยอดจริง ข้อมูลตอนซื้อ สต็อกไม่พอ ส่งซ้ำ และสิทธิ์

POST ส่ง use_saved_address และ address_name
ถ้า use_saved_address เป็น false ต้องส่งข้อมูลที่อยู่ครบตามหัวข้อ 2 และจะบันทึกที่อยู่ใหม่ด้วย
ใช้ CustomerCart.php และ types/shop.ts ร่วมกับหัวข้อ 4

ยังไม่มี QR/ตรวจเงินจริง กดยืนยันสร้างออเดอร์และตัดสต็อก แต่ไม่ถือว่าตรวจเงินแล้ว
การยกเลิก/คืนสต็อกต้องเชื่อมกับงาน Admin

## ไฟล์สิทธิ์ที่ใช้ร่วมกัน

**เพิ่ม:** app/Http/Middleware/EnsureCustomer.php — กัน admin และบัญชีแบน
ใช้กับที่อยู่ Wishlist Cart Orders Checkout ส่วน Profile ใช้ middleware เดิม

**แก้:** app/Models/User.php — ตั้งค่าเริ่มต้น role/ban และอ่าน is_banned เป็น boolean

ทั้ง 6 ส่วนใช้ DB::table() กับตารางเดิม ยกเว้น Profile ที่ใช้ User Model เดิม
ไม่มี Model ใหม่ เพิ่ม migration เปลี่ยน name เป็น username และปรับ FK Rating ตามภาพ
FK Rating ชี้ orders/products แยกกัน คนทำ RatingController ต้องตรวจรายการซื้อและผู้ซื้อเอง

ไฟล์ migration/test ที่เพิ่มตาม schema:

- database/migrations/2026_10_23_000002_align_rating_foreign_keys_with_schema.php — ปรับ FK Rating ตามภาพ
- tests/Feature/RatingForeignKeysMigrationTest.php — ตรวจ FK และย้อน/รันกลับโดยคะแนนยังอยู่
- tests/Feature/UsernameMigrationTest.php — ตรวจชื่อเดิมไม่หาย และฟิลด์ทั้ง 10 ตารางตรงแบบ

ในหน้า Checkout ตัวแปร delivery.name คือชื่อผู้รับ ไม่ใช่ชื่อบัญชี
ก่อนส่งจะเปลี่ยนเป็น recipient_name ตาม schema ส่วนบัญชีใช้ username
หน้าสินค้ายังใช้ catalog ตัวอย่าง ต้องเชื่อม ProductController ให้ตรงกับ DB ก่อนใช้งานจริง

## ผลทดสอบ

23 ต.ค. 2026 ใน DB แยก: ทั้งโปรเจกต์ผ่าน 87 tests / 568 assertions
PHPStan, TypeScript และ build ผ่าน จัดรูปแบบ PHP/TS แล้ว
ยังไม่ได้ทดสอบยิงคำขอพร้อมกันจริง ไม่มีการเพิ่มสินค้าตัวอย่างบน DB ร้าน
