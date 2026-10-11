<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ratings', function (Blueprint $table) {
            $table->unsignedBigInteger('order_id');
            $table->unsignedBigInteger('product_id');
            $table->unsignedTinyInteger('rating');
            $table->timestamps();
            // หนึ่งรายการสินค้าในออเดอร์มีคะแนนได้ไม่เกินหนึ่งรายการ
            $table->primary(['order_id', 'product_id']);
            // ให้คะแนนได้เฉพาะคู่ order/product ที่มีในรายการซื้อจริง; backend ยังต้องตรวจผู้ซื้อและสถานะจัดส่ง
            $table->foreign(['order_id', 'product_id'])
                ->references(['order_id', 'product_id'])->on('order_product')
                ->restrictOnDelete();
        });

        // บังคับคะแนนเฉพาะ 1–5 ดาวในฐานข้อมูล MySQL
        DB::statement('ALTER TABLE ratings ADD CONSTRAINT ratings_score_check CHECK (rating BETWEEN 1 AND 5)');
    }

    public function down(): void
    {
        Schema::dropIfExists('ratings');
    }
};
