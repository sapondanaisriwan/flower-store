<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cart_product', function (Blueprint $table) {
            // อ้างอิง PK user_id ของตะกร้า; เมื่อลบตะกร้าให้ลบรายการภายในด้วย
            $table->foreignId('cart_user_id')->constrained('carts', 'user_id')->cascadeOnDelete();
            // ห้ามลบสินค้าจริงที่ยังถูกอ้างอิง ให้ใช้ is_deleted เพื่อปิดสินค้า
            $table->foreignId('product_id')->constrained('products')->restrictOnDelete();
            $table->unsignedInteger('quantity');
            $table->timestamp('added_at')->useCurrent();
            // ค่าเริ่มต้นคือเวลาสร้างแถว; application ต้องอัปเดตเวลานี้เองเมื่อแก้จำนวน
            $table->timestamp('updated_at')->useCurrent();
            // ป้องกันสินค้าชนิดเดิมซ้ำในตะกร้าเดียวกัน ให้เพิ่ม quantity แทน
            $table->primary(['cart_user_id', 'product_id']);
        });

        // จำนวนต้องอย่างน้อย 1; การตรวจไม่เกินสต็อกต้องทำใน backend เพิ่มเติม
        DB::statement('ALTER TABLE cart_product ADD CONSTRAINT cart_product_quantity_check CHECK (quantity >= 1)');
    }

    public function down(): void
    {
        Schema::dropIfExists('cart_product');
    }
};
