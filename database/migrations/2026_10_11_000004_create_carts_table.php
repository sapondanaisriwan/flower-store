<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('carts', function (Blueprint $table) {
            // ใช้ user_id เป็นทั้ง PK และ FK: ผู้ใช้มีตะกร้าได้ไม่เกินหนึ่งใบ; ลบผู้ใช้แล้วลบตะกร้าด้วย
            $table->foreignId('user_id')->primary()->constrained('users')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('carts');
    }
};
