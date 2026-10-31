<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RatingSeeder extends Seeder
{
    /**
     * จำนวนรีวิวของแต่ละดาว [5★, 4★, 3★, 2★, 1★] ต่อสินค้า (รวม 20 ต่อสินค้า)
     * เฉลี่ยของแต่ละสินค้าต่างกันเล็กน้อยให้ดูเป็นธรรมชาติ
     */
    private const PROFILES = [
        1 => [11, 6, 2, 1, 0], // 4.35
        2 => [10, 6, 3, 1, 0], // 4.25
        3 => [12, 5, 2, 1, 0], // 4.40
        4 => [9,  7, 3, 0, 1], // 4.15
        5 => [8,  7, 3, 1, 1], // 4.00
        6 => [10, 5, 3, 1, 1], // 4.10
        7 => [13, 5, 1, 1, 0], // 4.50
        8 => [8,  6, 4, 2, 0], // 4.00
        9 => [11, 5, 3, 1, 0], // 4.30
    ];

    public function run(): void
    {
        mt_srand(2027);

        // รายการสินค้าในออเดอร์ที่จัดส่งแล้วเท่านั้น
        $items = DB::table('order_product')
            ->join('orders', 'orders.id', '=', 'order_product.order_id')
            ->where('orders.status', 'DELIVERED')
            ->orderBy('order_product.order_id')
            ->get([
                'order_product.order_id',
                'order_product.product_id',
                'orders.created_at as order_created_at',
            ])
            ->groupBy('product_id');

        foreach ($items as $productId => $rows) {
            $profile = self::PROFILES[$productId] ?? [10, 6, 2, 1, 1];

            // สร้าง pool ของดาวตาม profile แล้วสับลำดับ
            $pool = [];
            foreach ([5, 4, 3, 2, 1] as $i => $star) {
                $pool = array_merge($pool, array_fill(0, $profile[$i], $star));
            }
            shuffle($pool);

            foreach ($rows as $i => $row) {
                if (!isset($pool[$i])) {
                    break;
                }

                // วันที่รีวิว = หลังสั่งซื้อ 1-7 วัน (ไม่เกินปัจจุบัน)
                $reviewedAt = \Illuminate\Support\Carbon::parse($row->order_created_at)
                    ->addDays(mt_rand(1, 7))
                    ->addMinutes(mt_rand(0, 1439));
                if ($reviewedAt->isFuture()) {
                    $reviewedAt = now();
                }

                DB::table('ratings')->updateOrInsert(
                    [
                        'order_id'   => $row->order_id,
                        'product_id' => $row->product_id,
                    ],
                    [
                        'rating'     => $pool[$i],
                        'created_at' => $reviewedAt,
                        'updated_at' => $reviewedAt,
                    ]
                );
            }
        }
    }
}