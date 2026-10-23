<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Seed ดอกไม้ 9 รายการเริ่มต้นเข้าร้าน
        $this->call(ProductSeeder::class);
        $this->call(ColorSeeder::class);

        // 2. สร้างบัญชี Admin เริ่มต้นสำหรับเข้าจัดการระบบ
        User::firstOrCreate(
            ['email' => 'admin@flowerstore.com'],
            [
                'username' => 'Shop Admin',
                'role' => 'admin',
                'is_banned' => false,
                'password' => bcrypt('password'),
                'email_verified_at' => now(),
            ]
        );

        // 3. สร้างบัญชีลูกค้าทดสอบ
        User::firstOrCreate(
            ['email' => 'customer@flowerstore.com'],
            [
                'username' => 'Test Customer',
                'role' => 'customer',
                'is_banned' => false,
                'password' => bcrypt('password'),
                'email_verified_at' => now(),
            ]
        );
    }
}
