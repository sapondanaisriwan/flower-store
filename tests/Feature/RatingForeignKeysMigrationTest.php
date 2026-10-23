<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Tests\Concerns\ShopFixtures;
use Tests\TestCase;

class RatingForeignKeysMigrationTest extends TestCase
{
    // สร้างและย้อนตารางสำหรับแต่ละ test ต้องใช้ DB ทดสอบแยกจากร้าน
    use DatabaseMigrations, ShopFixtures;

    // ตรวจว่า FK ของ Rating ชี้ orders และ products แยกกันตามภาพ
    public function test_rating_references_orders_and_products_as_designed(): void
    {
        $keys = collect(Schema::getForeignKeys('ratings'));
        $this->assertCount(2, $keys);
        $this->assertSame(['order_id'], $keys->firstWhere('foreign_table', 'orders')['columns']);
        $this->assertSame(['product_id'], $keys->firstWhere('foreign_table', 'products')['columns']);
        $this->assertNull($keys->firstWhere('foreign_table', 'order_product'));
    }

    // ลองย้อน FK แล้วรันกลับ คะแนนเดิมต้องยังอยู่
    public function test_rating_migration_can_rollback_and_migrate_without_losing_scores(): void
    {
        $user = User::factory()->create();
        $order = $this->order($user);
        $product = $this->product();
        DB::table('order_product')->insert([
            'order_id' => $order, 'product_id' => $product, 'product_name' => 'ช่อชมพู',
            'purchase_price' => '590.25', 'quantity' => 1, 'picture_path' => 'products/test.jpg', 'product_order' => 1,
        ]);
        DB::table('ratings')->insert([
            'order_id' => $order, 'product_id' => $product, 'rating' => 5, 'created_at' => now(), 'updated_at' => now(),
        ]);

        $migration = require database_path('migrations/2026_10_23_000002_align_rating_foreign_keys_with_schema.php');
        $migration->down();
        $keys = Schema::getForeignKeys('ratings');
        $this->assertCount(1, $keys);
        $this->assertSame('order_product', $keys[0]['foreign_table']);
        $migration->up();
        $this->assertDatabaseHas('ratings', ['order_id' => $order, 'product_id' => $product, 'rating' => 5]);
        $this->assertCount(2, Schema::getForeignKeys('ratings'));
    }
}
