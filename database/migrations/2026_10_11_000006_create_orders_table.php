<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            // เริ่มที่ pending; ใช้ข้อความเพราะทีมยังไม่ได้ตกลงสถานะทั้งหมด
            $table->string('status', 30)->default('pending');
            // ยอดรวมต้องคำนวณจากราคาและจำนวนฝั่ง backend ตอน Checkout
            $table->decimal('total_price', 12, 2)->unsigned();
            $table->timestamps();
            // ห้ามลบผู้ใช้ที่มีประวัติคำสั่งซื้ออ้างอิง
            $table->foreignId('user_id')->constrained('users')->restrictOnDelete();
            $table->string('address_name', 100);
            // เก็บสำเนาข้อมูลจัดส่งตอนสั่งซื้อ เพื่อไม่ให้เปลี่ยนตามการแก้ที่อยู่ภายหลัง
            $table->text('address');
            // อ้างอิงทั้งเจ้าของและชื่อที่อยู่ ป้องกันการผูกออเดอร์กับที่อยู่ของคนอื่น
            $table->foreign(['user_id', 'address_name'])
                ->references(['user_id', 'address_name'])->on('user_addresses')
                // ห้ามลบที่อยู่ที่ถูกใช้งาน; เปลี่ยนคีย์ที่อยู่แล้วอัปเดต FK โดยไม่เปลี่ยนสำเนา address
                ->restrictOnDelete()->cascadeOnUpdate();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
