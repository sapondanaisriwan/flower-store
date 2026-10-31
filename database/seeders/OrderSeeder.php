<?php

namespace Database\Seeders;

use App\Models\Order;
use App\Models\OrderProduct;
use App\Models\Product;
use App\Models\UserAddress;
use Illuminate\Database\Seeder;

class OrderSeeder extends Seeder
{
    private const DELIVERED_ORDERS = 60; // 60 ออเดอร์ x 3 ชิ้น = 180 รายการ
    private const ITEMS_PER_ORDER  = 3;
    private const PENDING_ORDERS   = 5;

    public function run(): void
    {
        mt_srand(2026); // ให้ผลลัพธ์เหมือนเดิมทุกครั้ง

        $products   = Product::orderBy('id')->get()->keyBy('id');
        $productIds = $products->keys()->values()->all();
        $count      = count($productIds);

        // ลำดับสินค้าวนเป็นรอบ ทำให้ทุกสินค้าถูกซื้อจำนวนเท่ากัน
        // และ 3 ชิ้นติดกัน (ในออเดอร์เดียว) จะไม่ซ้ำกันเสมอ
        $sequence = [];
        $total = self::DELIVERED_ORDERS * self::ITEMS_PER_ORDER;
        for ($i = 0; $i < $total; $i++) {
            $sequence[] = $productIds[$i % $count];
        }

        $orders = [];

        // ออเดอร์ที่จัดส่งแล้ว (ใช้รีวิวได้) ผู้ใช้ id 2-11
        for ($k = 0; $k < self::DELIVERED_ORDERS; $k++) {
            $items = [];
            foreach (array_slice($sequence, $k * self::ITEMS_PER_ORDER, self::ITEMS_PER_ORDER) as $pid) {
                $items[] = ['product_id' => $pid, 'quantity' => mt_rand(1, 10) <= 8 ? 1 : 2];
            }

            $orders[] = [
                'id'         => $k + 1,
                'user_id'    => 2 + ($k % 10),
                'status'     => 'delivered',
                'items'      => $items,
                'created_at' => now()->subDays(90 - (int) ($k * 1.4))->subHours(mt_rand(0, 23)),
            ];
        }

        // ออเดอร์ที่ยังรอดำเนินการ (ยังไม่มีรีวิว)
        for ($p = 0; $p < self::PENDING_ORDERS; $p++) {
            $orders[] = [
                'id'         => self::DELIVERED_ORDERS + $p + 1,
                'user_id'    => 2 + $p,
                'status'     => 'pending',
                'items'      => [[
                    'product_id' => $productIds[mt_rand(0, $count - 1)],
                    'quantity'   => 1,
                ]],
                'created_at' => now()->subHours(mt_rand(1, 48)),
            ];
        }

        foreach ($orders as $orderData) {
            $address = UserAddress::where('user_id', $orderData['user_id'])
                ->where('is_active', true)
                ->first();

            if (! $address) {
                throw new \Exception("Address for user {$orderData['user_id']} not found");
            }

            $totalPrice = 0;
            foreach ($orderData['items'] as $item) {
                $product = $products->get($item['product_id']);
                if (! $product) {
                    throw new \Exception("Product ID {$item['product_id']} not found");
                }
                $totalPrice += $product->price * $item['quantity'];
            }

            $order = Order::firstOrNew(['id' => $orderData['id']]);
            $order->fill([
                'user_id'      => $orderData['user_id'],
                'status'       => $orderData['status'],
                'total_price'  => $totalPrice,
                'address_name' => $address->address_name,
                'address'      => "{$address->address_line}, {$address->subdistrict}, {$address->district}, {$address->province} {$address->postal_code}",
            ]);
            $order->created_at = $orderData['created_at'];
            $order->updated_at = $orderData['created_at'];
            $order->save();

            foreach ($orderData['items'] as $index => $item) {
                $product = $products->get($item['product_id']);

                OrderProduct::query()->upsert(
                    [[
                        'order_id'       => $order->id,
                        'product_id'     => $item['product_id'],
                        'product_name'   => $product->name,
                        'purchase_price' => $product->price,
                        'quantity'       => $item['quantity'],
                        'picture_path'   => $product->picture_path,
                        'product_order'  => $index + 1,
                    ]],
                    ['order_id', 'product_id'],
                    ['product_name', 'purchase_price', 'quantity', 'picture_path', 'product_order']
                );
            }
        }
    }
}