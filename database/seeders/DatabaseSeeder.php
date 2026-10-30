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

        // 2. สร้างบัญชี Admin เริ่มต้นสำหรับเข้าจัดการระบบ
        User::firstOrCreate(
            ['email' => 'admin@gmail.com'],
            [
                'username' => 'Shop Admin',
                'role' => 'admin',
                'is_banned' => false,
                'password' => bcrypt('password'),
                'email_verified_at' => now(),
            ]
        );

        // 3. สร้างบัญชีลูกค้าทดสอบ 10 คน (customer1 - customer10)
        for ($i = 1; $i <= 10; $i++) {
            User::firstOrCreate(
                ['email' => "customer{$i}@gmail.com"],
                [
                    'username' => "Customer {$i}",
                    'role' => 'customer',
                    'is_banned' => false,
                    'password' => bcrypt('password'),
                    'email_verified_at' => now(),
                ]
            );
        }
    }
}