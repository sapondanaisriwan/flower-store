<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // กำหนดบทบาทจริง 2 แบบ โดยผู้ใช้ใหม่เป็นลูกค้า; การตรวจสิทธิ์ต้องทำใน backend ด้วย
            $table->enum('role', ['customer', 'admin'])->default('customer');
            // ยอมให้ว่างเพื่อรองรับระบบสมาชิกเดิมที่ยังบันทึก name
            $table->string('username')->nullable();
            $table->boolean('is_banned')->default(false);
        });

        // คัดลอกชื่อของผู้ใช้เดิมมาเป็น username โดยยังคงคอลัมน์ name ไว้
        DB::table('users')->update(['username' => DB::raw('name')]);
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // rollback เฉพาะฟิลด์ร้านค้าที่เพิ่ม ไม่ลบตารางผู้ใช้เดิม
            $table->dropColumn(['role', 'username', 'is_banned']);
        });
    }
};
