<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('ratings', function (Blueprint $table) {
            // ตามภาพ: order_id ชี้ไป orders และ product_id ชี้ไป products แยกกัน
            $table->foreign('order_id')->references('id')->on('orders')->restrictOnDelete();
            $table->foreign('product_id')->references('id')->on('products')->restrictOnDelete();
            $table->dropForeign(['order_id', 'product_id']);
        });
    }

    public function down(): void
    {
        Schema::table('ratings', function (Blueprint $table) {
            // คืน FK เดิมก่อนถอดตัวใหม่ ถ้ามีคู่ที่ไม่อยู่ใน order_product จะ rollback ไม่ได้
            $table->foreign(['order_id', 'product_id'])
                ->references(['order_id', 'product_id'])->on('order_product')->restrictOnDelete();
            $table->dropForeign(['order_id']);
            $table->dropForeign(['product_id']);
        });
    }
};
