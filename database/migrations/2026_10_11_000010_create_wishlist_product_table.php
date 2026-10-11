<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('wishlist_product', function (Blueprint $table) {
            // อ้างอิง PK user_id ของ Wishlist; ลบชุด Wishlist แล้วลบรายการภายในด้วย
            $table->foreignId('wishlist_user_id')->constrained('wishlists', 'user_id')->cascadeOnDelete();
            // เก็บรหัสสินค้าโดยไม่มีจำนวน; ห้ามลบสินค้าจริงที่รายการนี้อ้างอิง
            $table->foreignId('product_id')->constrained('products')->restrictOnDelete();
            $table->timestamp('added_at')->useCurrent();
            // ผู้ใช้คนเดียวกันบันทึกสินค้าเดิมใน Wishlist ซ้ำไม่ได้
            $table->primary(['wishlist_user_id', 'product_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('wishlist_product');
    }
};
