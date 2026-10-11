<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('order_product', function (Blueprint $table) {
            // เก็บความสัมพันธ์กับออเดอร์และสินค้า โดยห้ามลบข้อมูลที่รายการซื้ออ้างอิง
            $table->foreignId('order_id')->constrained('orders')->restrictOnDelete();
            $table->foreignId('product_id')->constrained('products')->restrictOnDelete();
            // ชื่อ ราคา และรูปเป็นสำเนาตอนซื้อ ไม่เปลี่ยนตามข้อมูลสินค้าปัจจุบัน
            $table->string('product_name');
            $table->decimal('purchase_price', 12, 2)->unsigned();
            $table->unsignedInteger('quantity');
            $table->string('picture_path');
            // ลำดับการแสดงสินค้าภายในออเดอร์ ไม่ใช่รหัสสินค้า
            $table->unsignedInteger('product_order');
            // สินค้าแต่ละชนิดมีได้หนึ่งแถวต่อออเดอร์ จำนวนที่ซื้อเก็บใน quantity
            $table->primary(['order_id', 'product_id']);
            // ห้ามสองรายการมีลำดับเดียวกันภายในออเดอร์
            $table->unique(['order_id', 'product_order']);
        });

        // บังคับในฐานข้อมูลว่าจำนวนที่ซื้ออย่างน้อย 1 ชิ้น
        DB::statement('ALTER TABLE order_product ADD CONSTRAINT order_product_quantity_check CHECK (quantity >= 1)');
    }

    public function down(): void
    {
        Schema::dropIfExists('order_product');
    }
};
