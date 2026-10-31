<?php

namespace Database\Seeders;

use App\Models\UserAddress;
use Illuminate\Database\Seeder;

class UserAddressSeeder extends Seeder
{
    public function run(): void
    {
        $addresses = [
            // user_id => [address_name, address_line, subdistrict, postal_code]
            1  => ['Home',   '123 Nimman Road',          'Suthep',       '50200'],
            2  => ['Condo',  '99 Huay Kaew Road',        'Chang Phueak', '50300'],
            3  => ['Office', '88 Suthep Road',           'Suthep',       '50200'],
            4  => ['Home',   '45 Chang Klan Road',       'Chang Khlan',  '50100'],
            5  => ['Home',   '12 Tha Phae Road',         'Wat Ket',      '50000'],
            6  => ['Condo',  '7 Canal Road',             'Suthep',       '50200'],
            7  => ['Home',   '56 Super Highway Road',    'Fa Ham',       '50000'],
            8  => ['Office', '201 Mahidol Road',         'Hai Ya',       '50100'],
            9  => ['Home',   '33 Sirimangkalajarn Road', 'Suthep',       '50200'],
            10 => ['Condo',  '18 Nimman Soi 9',          'Suthep',       '50200'],
            11 => ['Home',   '64 Chotana Road',          'Chang Phueak', '50300'],
        ];

        foreach ($addresses as $userId => [$name, $line, $subdistrict, $postal]) {
            $row = [
                'user_id'        => $userId,
                'address_name'   => $name,
                'recipient_name' => $userId === 1 ? 'Gam' : 'Customer ' . ($userId - 1),
                'address_line'   => $line,
                'subdistrict'    => $subdistrict,
                'district'       => 'Mueang Chiang Mai',
                'province'       => 'Chiang Mai',
                'postal_code'    => $postal,
                'phone_number'   => '08' . str_pad((string) (10000000 + $userId * 1111111), 8, '0', STR_PAD_LEFT),
                'is_active'      => true,
                'created_at'     => now(),
                'updated_at'     => now(),
            ];

            UserAddress::query()->upsert(
                [$row],
                ['user_id', 'address_name'],
                ['recipient_name', 'address_line', 'subdistrict', 'district', 'province', 'postal_code', 'phone_number', 'is_active', 'updated_at']
            );
        }
    }
}