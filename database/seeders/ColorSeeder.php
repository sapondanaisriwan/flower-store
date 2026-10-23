<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ColorSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $colors = [
            ['name' => 'Orange',     'hex_code' => '#EE8A43'],
            ['name' => 'Yellow',     'hex_code' => '#F3EA3A'],
            ['name' => 'Purple',     'hex_code' => '#B065E0'],
            ['name' => 'Red',        'hex_code' => '#DC2626'],
            ['name' => 'White',      'hex_code' => '#FFFFFF'],
            ['name' => 'Blue',       'hex_code' => '#52C5F4'],
            ['name' => 'Pink',       'hex_code' => '#DA9FA8'],
        ];

        foreach ($colors as $color) {
            // TODO: change this to color model instead
            DB::table('colors')->updateOrInsert(['name' => $color['name']], $color);
        }
    }
}
