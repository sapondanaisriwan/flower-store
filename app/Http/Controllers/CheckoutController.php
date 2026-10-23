<?php

namespace App\Http\Controllers;

use App\Http\Requests\Checkout\CheckoutRequest;
use App\Models\CartProduct;
use App\Models\Order;
use App\Models\OrderProduct;
use App\Models\Product;
use App\Models\UserAddress;
use App\Support\CustomerCart;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class CheckoutController extends Controller
{
    // ส่งสินค้าในตะกร้าและที่อยู่ที่ยังใช้งานไปแสดงในฟอร์มเดิม
    public function index(Request $request): Response
    {
        return Inertia::render('checkout', [
            'items' => CustomerCart::items($request->user()->id),
            'addresses' => UserAddress::where('user_id', $request->user()->id)
                ->where('is_active', true)
                ->orderBy('address_name')
                ->get(),
        ]);
    }

    // รับคำสั่งซื้อหลัง Request ตรวจที่อยู่แล้ว
    public function store(CheckoutRequest $request): RedirectResponse
    {
        // สร้างออเดอร์ ตัดสต็อก และล้างตะกร้าด้วยกัน ถ้าขั้นไหนล้มเหลวให้ย้อนทั้งหมด
        $orderId = DB::transaction(function () use ($request): int {
            $userId = $request->user()->id;
            CustomerCart::lockOwner($userId);
            $lines = CartProduct::where('cart_user_id', $userId)->orderBy('product_id')->get();
            if ($lines->isEmpty()) {
                throw ValidationException::withMessages(['cart' => 'ไม่มีสินค้าในตะกร้า หรือสั่งซื้อรายการนี้แล้ว']);
            }

            // ล็อกสินค้าตามรหัสลำดับเดียวกัน ป้องกันหลายบัญชีซื้อสต็อกชิ้นสุดท้ายพร้อมกัน
            $products = Product::whereIn('id', $lines->pluck('product_id'))
                ->orderBy('id')
                ->lockForUpdate()
                ->get()
                ->keyBy('id');

            $totalCents = 0;
            foreach ($lines as $line) {
                $product = $products->get($line->product_id);
                if (! $product || $product->is_deleted || $line->quantity < 1 || $line->quantity > 1000000 || $line->quantity > $product->stock) {
                    throw ValidationException::withMessages(['cart' => 'สินค้าบางรายการไม่พร้อมขายหรือสต็อกไม่พอ กรุณาแก้ตะกร้า']);
                }
                // ราคาใน DB มีทศนิยม 2 ตำแหน่ง แปลงเป็นสตางค์ก่อนคูณ ไม่ใช้ float คำนวณเงิน
                $totalCents += (int) str_replace('.', '', (string) $product->price) * $line->quantity;
                // decimal(12,2) เก็บเงินได้สูงสุด 9999999999.99 บาท จึงตรวจยอดก่อนบันทึก
                if ($totalCents > 999999999999) {
                    throw ValidationException::withMessages(['cart' => 'ยอดสั่งซื้อเกินจำนวนที่ระบบรองรับ']);
                }
            }

            $data = $request->validated();
            if ($request->boolean('use_saved_address')) {
                $address = UserAddress::where('user_id', $userId)
                    ->where('address_name', $data['address_name'])
                    ->where('is_active', true)
                    ->lockForUpdate()
                    ->first();

                if (! $address) {
                    throw ValidationException::withMessages(['address_name' => 'ที่อยู่นี้ใช้งานไม่ได้แล้ว']);
                }
                $delivery = $address->toArray();
            } else {
                unset($data['use_saved_address']);
                // สร้างที่อยู่ใน transaction เดียวกัน ถ้าสั่งซื้อไม่ผ่านจะไม่เหลือที่อยู่ค้าง
                $delivery = [...$data, 'user_id' => $userId, 'is_active' => true];
                UserAddress::create($delivery);
            }

            // เลือกเฉพาะข้อมูลผู้รับ/ที่อยู่มาเก็บสำเนา ไม่เปลี่ยนตามการแก้ที่อยู่ภายหลัง
            $snapshot = array_intersect_key($delivery, array_flip([
                'recipient_name', 'phone_number', 'address_line', 'subdistrict', 'district', 'province', 'postal_code',
            ]));

            $order = Order::create([
                'user_id' => $userId,
                'status' => 'pending',
                'total_price' => sprintf('%d.%02d', intdiv($totalCents, 100), $totalCents % 100),
                'address_name' => $delivery['address_name'],
                'address' => json_encode($snapshot, JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR),
            ]);

            $orderId = $order->id;

            // แต่ละรายการเก็บชื่อ ราคา รูปตอนซื้อ และลำดับเริ่ม 1
            foreach ($lines as $index => $line) {
                $product = $products->get($line->product_id);
                OrderProduct::create([
                    'order_id' => $orderId,
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'purchase_price' => $product->price,
                    'quantity' => $line->quantity,
                    'picture_path' => $product->picture_path,
                    'product_order' => $index + 1,
                ]);
                $product->decrement('stock', $line->quantity);
            }
            // ล้างตะกร้าหลังบันทึกครบแล้ว คนอื่นไม่ได้รับผลกระทบ
            CartProduct::where('cart_user_id', $userId)->delete();

            return $orderId;
        }, 3);

        // ยืนยันออเดอร์เท่านั้น ยังไม่มีการตรวจการโอนเงินจริง
        return to_route('orders.show', ['order' => $orderId]);
    }
}
