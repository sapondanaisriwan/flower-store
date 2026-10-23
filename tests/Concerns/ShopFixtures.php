<?php

namespace Tests\Concerns;

use App\Models\User;
use Illuminate\Support\Facades\DB;

trait ShopFixtures
{
    /** @param array<string, mixed> $attributes */
    // สร้างสินค้าทดสอบ เปลี่ยนราคา/สต็อกได้ผ่าน attributes
    private function product(array $attributes = []): int
    {
        return DB::table('products')->insertGetId([
            'name' => 'ช่อชมพู', 'price' => '590.25', 'stock' => 5, 'color' => 'pink',
            'description' => 'ดอกไม้', 'picture_path' => 'products/test.jpg', 'is_deleted' => false,
            'created_at' => now(), 'updated_at' => now(), ...$attributes,
        ]);
    }

    // ใส่รายการตะกร้าทดสอบให้เจ้าของที่ระบุ
    private function cartLine(User $user, int $product, int $quantity): void
    {
        DB::table('carts')->insertOrIgnore(['user_id' => $user->id]);
        DB::table('cart_product')->insert([
            'cart_user_id' => $user->id, 'product_id' => $product, 'quantity' => $quantity,
            'added_at' => now(), 'updated_at' => now(),
        ]);
    }

    /** @return array<string, mixed> */
    // ข้อมูลผู้รับตัวอย่างสำหรับทดสอบเพิ่มที่อยู่และ Checkout
    private function delivery(): array
    {
        return [
            'use_saved_address' => false, 'address_name' => 'บ้าน', 'recipient_name' => 'Green',
            'phone_number' => '0812345678', 'address_line' => '123', 'subdistrict' => 'บางรัก',
            'district' => 'บางรัก', 'province' => 'กรุงเทพมหานคร', 'postal_code' => '10500',
        ];
    }

    // สร้างที่อยู่เดิม จะตั้งให้ปิดใช้งานเพื่อทดสอบก็ได้
    private function savedAddress(User $user, bool $active = true): void
    {
        $data = $this->delivery();
        unset($data['use_saved_address']);
        DB::table('user_addresses')->insert([
            ...$data, 'user_id' => $user->id, 'is_active' => $active, 'created_at' => now(), 'updated_at' => now(),
        ]);
    }

    // สร้างออเดอร์ตัวอย่างพร้อมที่อยู่ ไม่ใช่คำสั่งซื้อจริงของลูกค้า
    private function order(User $user): int
    {
        $this->savedAddress($user);

        return DB::table('orders')->insertGetId([
            'user_id' => $user->id, 'address_name' => 'บ้าน', 'address' => 'ที่อยู่ตอนซื้อ',
            'status' => 'pending', 'total_price' => '590.25', 'created_at' => now(), 'updated_at' => now(),
        ]);
    }
}
