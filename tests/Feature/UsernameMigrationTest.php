<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class UsernameMigrationTest extends TestCase
{
    // สร้างและย้อนตารางสำหรับแต่ละ test ต้องใช้ DB ทดสอบแยกจากร้าน
    use DatabaseMigrations;

    // จำลองผู้ใช้เก่าที่ username ว่าง ย้ายชื่อแล้วลองย้อนกลับ ข้อมูลต้องไม่หาย
    public function test_existing_names_are_preserved_when_switching_to_username_and_rolling_back(): void
    {
        $migration = require database_path('migrations/2026_10_23_000001_use_username_for_users_table.php');
        $migration->down();

        DB::table('users')->insert([
            ['name' => 'Green', 'username' => null, 'email' => 'green@example.com', 'password' => 'hashed-value'],
            ['name' => 'Old Name', 'username' => 'Existing Username', 'email' => 'existing@example.com', 'password' => 'hashed-value'],
            ['name' => 'Empty Username', 'username' => '', 'email' => 'empty@example.com', 'password' => 'hashed-value'],
        ]);
        $migration->up();

        $this->assertFalse(Schema::hasColumn('users', 'name'));
        $this->assertDatabaseHas('users', ['username' => 'Green', 'email' => 'green@example.com']);
        $this->assertDatabaseHas('users', ['username' => 'Existing Username', 'email' => 'existing@example.com']);
        $this->assertDatabaseHas('users', ['username' => 'Empty Username', 'email' => 'empty@example.com']);

        $migration->down();
        $this->assertDatabaseHas('users', ['name' => 'Green', 'username' => 'Green']);
        $this->assertDatabaseHas('users', ['name' => 'Existing Username', 'username' => 'Existing Username']);
        $migration->up();
        $this->assertDatabaseCount('users', 3);
    }

    // เทียบชื่อคอลัมน์จริงทั้ง 10 ตารางกับ schema ของทีม
    public function test_shop_tables_match_the_designed_fields(): void
    {
        $tables = [
            'products' => ['id', 'name', 'price', 'stock', 'description', 'picture_path', 'is_deleted', 'created_at', 'updated_at'],
            'colors' => ['name', 'hex_code'],
            'color_product' => ['color_name', 'product_id'],
            'user_addresses' => ['user_id', 'address_name', 'recipient_name', 'address_line', 'subdistrict', 'district', 'province', 'postal_code', 'phone_number', 'is_active', 'created_at', 'updated_at'],
            'carts' => ['user_id'],
            'wishlists' => ['user_id'],
            'orders' => ['id', 'status', 'total_price', 'created_at', 'updated_at', 'user_id', 'address_name', 'address'],
            'ratings' => ['order_id', 'product_id', 'rating', 'created_at', 'updated_at'],
            'order_product' => ['order_id', 'product_id', 'product_name', 'purchase_price', 'quantity', 'picture_path', 'product_order'],
            'cart_product' => ['cart_user_id', 'product_id', 'quantity', 'added_at', 'updated_at'],
            'wishlist_product' => ['wishlist_user_id', 'product_id', 'added_at'],
        ];
        foreach ($tables as $table => $fields) {
            $this->assertEqualsCanonicalizing($fields, Schema::getColumnListing($table), $table);
        }
        // ฟิลด์สมาชิกตามแบบครบ และไม่มี name; คงฟิลด์ auth ที่ Laravel ใช้ไว้
        $this->assertTrue(Schema::hasColumns('users', ['id', 'role', 'username', 'email', 'password', 'is_banned', 'created_at', 'updated_at']));
        $this->assertFalse(Schema::hasColumn('users', 'name'));
    }
}
