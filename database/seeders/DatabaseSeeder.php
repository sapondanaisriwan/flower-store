<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
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

        // 2. สร้างลูกค้าทดสอบ 10 คน (id 2 - 11)
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

        // 3. Seed ข้อมูลร้าน (ลำดับสำคัญ: สี -> สินค้า -> ที่อยู่ -> ออเดอร์ -> เรทติ้ง)
        $this->call([
            ColorSeeder::class,
            ProductSeeder::class,
            UserAddressSeeder::class,
            OrderSeeder::class,
            RatingSeeder::class,
        ]);
    }
}