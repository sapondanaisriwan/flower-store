<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('wishlists', function (Blueprint $table) {
            // ใช้ user_id เป็นทั้ง PK และ FK: ผู้ใช้มี Wishlist ได้ไม่เกินหนึ่งชุด; ลบผู้ใช้แล้วลบชุดนี้ด้วย
            $table->foreignId('user_id')->primary()->constrained('users')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('wishlists');
    }
};
