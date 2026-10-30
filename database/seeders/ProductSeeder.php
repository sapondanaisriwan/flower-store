<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $products = [
            [
                'id' => 1,
                'name' => 'Peachy Morning',
                'description' => 'ช่อกุหลาบโทนพีช ผสมผสานดอกไม้โทนอบอุ่น สร้างความสดใสในทุกเช้าวันใหม่',
                'price' => '690.00',
                'stock' => 8,
                'color' => 'โรสพิงค์',
                'picture_path' => '/images/products/flower1.jpg',
                'is_deleted' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 2,
                'name' => 'Ivory Whisper',
                'description' => 'ช่อกุหลาบสีขาวครีม บริสุทธิ์และสง่างาม สื่อถึงความรักที่มั่นคงและจริงใจ',
                'price' => '590.00',
                'stock' => 5,
                'color' => 'ขาวครีม',
                'picture_path' => '/images/products/flower2.jpg',
                'is_deleted' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 3,
                'name' => 'A Little Romance',
                'description' => 'ช่อดอกไม้ชมพูโรแมนติก คัดสรรกลีบดอกไม้อ่อนหวานเพื่อคนพิเศษของคุณ',
                'price' => '790.00',
                'stock' => 4,
                'color' => 'โรสพิงค์',
                'picture_path' => '/images/products/flower3.jpg',
                'is_deleted' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 4,
                'name' => 'Forever Yours',
                'description' => 'ช่อกุหลาบสีแดงไวน์ ลึกซึ้งและน่าหลงใหล สำหรับช่วงเวลาสุดพิเศษที่น่าจดจำ',
                'price' => '890.00',
                'stock' => 10,
                'color' => 'แดงไวน์',
                'picture_path' => '/images/products/flower4.jpg',
                'is_deleted' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 5,
                'name' => 'Soft Embrace',
                'description' => 'ช่อกุหลาบขาวละมุน เรียบง่ายแต่เปี่ยมด้วยความอ่อนโยนและความหมายดีๆ',
                'price' => '490.00',
                'stock' => 12,
                'color' => 'ขาวครีม',
                'picture_path' => '/images/products/flower5.jpg',
                'is_deleted' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 6,
                'name' => 'Blushing Day',
                'description' => 'ช่อกุหลาบชมพูหวาน สื่อถึงความรักอันแสนสดชื่นและรอยยิ้มที่มีให้กันเสมอ',
                'price' => '990.00',
                'stock' => 6,
                'color' => 'โรสพิงค์',
                'picture_path' => '/images/products/flower6.jpg',
                'is_deleted' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 7,
                'name' => 'Love Letter',
                'description' => 'ช่อกุหลาบแดงแทนใจ บรรจงจัดด้วยกุหลาบแดงคัดพิเศษ เพื่อคำบอกรักที่ไม่ต้องเอ่ย',
                'price' => '1290.00',
                'stock' => 6,
                'color' => 'แดงไวน์',
                'picture_path' => '/images/products/flower7.jpg',
                'is_deleted' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 8,
                'name' => 'Little Happiness',
                'description' => 'ช่อดอกไม้พีชแสนอบอุ่น เติมเต็มความสุขเล็กๆ ในชีวิตประจำวันด้วยสีสันสดใส',
                'price' => '390.00',
                'stock' => 10,
                'color' => 'โรสพิงค์',
                'picture_path' => '/images/products/flower8.jpg',
                'is_deleted' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 9,
                'name' => 'Simply White',
                'description' => 'ช่อดอกไม้ขาวเรียบหรู ผสมผสานดอกไม้นานาพันธุ์สีขาวครีม เหมาะกับทุกโอกาสสำคัญ',
                'price' => '1090.00',
                'stock' => 5,
                'color' => 'ขาวครีม',
                'picture_path' => '/images/products/flower9.jpg',
                'is_deleted' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        $colors = [
            'โรสพิงค์' => '#dca3b2',
            'ขาวครีม' => '#fff9e9',
            'แดงไวน์' => '#9a3b50',
            'ม่วงลาเวนเดอร์' => '#a78bbd',
            'เหลืองพาสเทล' => '#e6c871',
            'เขียวเซจ' => '#6b8f71',
            'ฟ้าพาสเทล' => '#779fbd',
            'ส้มพีช' => '#d99866',
        ];

        foreach ($colors as $name => $hexCode) {
            DB::table('colors')->updateOrInsert(
                ['name' => $name],
                ['hex_code' => $hexCode]
            );
        }

        foreach ($products as $product) {
            $colorName = $product['color'];
            unset($product['color']);

            DB::table('products')->updateOrInsert(['id' => $product['id']], $product);

            DB::table('color_product')->updateOrInsert([
                'color_name' => $colorName,
                'product_id' => $product['id'],
            ]);
        }
    }
}
