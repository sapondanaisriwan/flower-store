<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_addresses', function (Blueprint $table) {
            // ผูกที่อยู่กับเจ้าของบัญชี และห้ามลบบัญชีขณะที่ยังมีที่อยู่อ้างอิง
            $table->foreignId('user_id')->constrained('users')->restrictOnDelete();
            $table->string('address_name', 100);
            $table->string('recipient_name');
            $table->text('address_line');
            $table->string('subdistrict');
            $table->string('district');
            $table->string('province');
            // เก็บรหัสไปรษณีย์และเบอร์โทรเป็นข้อความเพื่อรักษาเลขศูนย์นำหน้า
            $table->string('postal_code', 5);
            $table->string('phone_number', 20);
            // ปิดใช้งานที่อยู่ได้โดยเก็บข้อมูลเดิมไว้ให้คำสั่งซื้ออ้างอิง
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            // ชื่อที่อยู่ห้ามซ้ำภายในบัญชีเดียวกัน แต่ต่างบัญชีใช้ชื่อเดียวกันได้
            $table->primary(['user_id', 'address_name']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_addresses');
    }
};
