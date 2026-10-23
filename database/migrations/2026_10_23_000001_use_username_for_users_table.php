<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // เติม username ที่ยังว่างจากชื่อเดิมก่อนเอา name ออก ไม่เขียนทับ username ที่มีอยู่แล้ว
        DB::table('users')->whereNull('username')->orWhere('username', '')
            ->update(['username' => DB::raw('name')]);

        Schema::table('users', function (Blueprint $table) {
            $table->string('username')->nullable(false)->change();
            $table->dropColumn('name');
        });
    }

    public function down(): void
    {
        // คืน name และข้อมูลชื่อ เพื่อให้ย้อนกลับไปใช้โค้ดเดิมได้
        Schema::table('users', function (Blueprint $table) {
            $table->string('name')->nullable();
            $table->string('username')->nullable()->change();
        });

        DB::table('users')->update(['name' => DB::raw('username')]);

        Schema::table('users', function (Blueprint $table) {
            $table->string('name')->nullable(false)->change();
        });
    }
};
