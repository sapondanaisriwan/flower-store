<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('colors', function (Blueprint $table) {
            // ใช้ name เป็น Primary Key ตาม ER Diagram (name ขีดเส้นใต้)
            $table->string('name', 100)->primary();
            $table->string('hex_code', 20);
        });

        Schema::create('color_product', function (Blueprint $table) {
            // ความสัมพันธ์ N:M (features_in) ระหว่าง Color และ Product
            $table->string('color_name', 100);
            $table->foreignId('product_id')->constrained('products')->cascadeOnDelete();

            $table->foreign('color_name')
                ->references('name')
                ->on('colors')
                ->cascadeOnUpdate()
                ->restrictOnDelete();

            $table->primary(['color_name', 'product_id']);
        });

        // ย้ายข้อมูลสีเดิมจาก products.color เข้าตาราง colors และ color_product ก่อนลบคอลัมน์
        if (Schema::hasColumn('products', 'color')) {
            $defaultHexMap = [
                'pink' => '#dca3b2',
                'white' => '#fff9e9',
                'red' => '#9a3b50',
                'purple' => '#a78bbd',
                'yellow' => '#e6c871',
                'green' => '#6b8f71',
                'blue' => '#779fbd',
                'orange' => '#d99866',
            ];

            $rows = DB::table('products')
                ->select('id', 'color')
                ->whereNotNull('color')
                ->where('color', '<>', '')
                ->get();

            foreach ($rows as $row) {
                $colorName = trim((string) $row->color);
                if ($colorName === '') {
                    continue;
                }

                $lower = strtolower($colorName);
                $hexCode = $defaultHexMap[$lower]
                    ?? (preg_match('/^#[0-9a-f]{3}([0-9a-f]{3})?$/i', $colorName) ? $colorName : '#dbc3ca');

                DB::table('colors')->insertOrIgnore([
                    'name' => $colorName,
                    'hex_code' => $hexCode,
                ]);

                DB::table('color_product')->insertOrIgnore([
                    'color_name' => $colorName,
                    'product_id' => $row->id,
                ]);
            }

            Schema::table('products', function (Blueprint $table) {
                $table->dropColumn('color');
            });
        }
    }

    public function down(): void
    {
        if (! Schema::hasColumn('products', 'color')) {
            Schema::table('products', function (Blueprint $table) {
                $table->string('color')->default('')->after('stock');
            });
        }

        if (Schema::hasTable('color_product')) {
            $links = DB::table('color_product')
                ->orderBy('color_name')
                ->get()
                ->groupBy('product_id');

            foreach ($links as $productId => $items) {
                $firstColor = $items->first()?->color_name ?? '';
                DB::table('products')
                    ->where('id', $productId)
                    ->update(['color' => $firstColor]);
            }
        }

        Schema::dropIfExists('color_product');
        Schema::dropIfExists('colors');
    }
};

