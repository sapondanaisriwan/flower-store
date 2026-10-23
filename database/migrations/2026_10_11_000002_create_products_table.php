<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            // เก็บราคาแบบทศนิยม 2 ตำแหน่งเพื่อหลีกเลี่ยงความคลาดเคลื่อนของ float
            $table->decimal('price', 12, 2)->unsigned();
            $table->unsignedInteger('stock')->default(0);
            $table->text('description');
            // เก็บตำแหน่งไฟล์รูปภาพ ไม่เก็บไฟล์ภาพลงในคอลัมน์นี้
            $table->string('picture_path');
            // ทำเครื่องหมายลบตาม schema เพื่อเก็บสินค้าไว้ให้ประวัติคำสั่งซื้ออ้างอิง
            $table->boolean('is_deleted')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
