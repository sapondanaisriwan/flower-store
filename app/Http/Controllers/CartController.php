<?php

namespace App\Http\Controllers;

use App\Http\Requests\Cart\CartItemRequest;
use App\Models\Cart;
use App\Models\CartProduct;
use App\Models\Product;
use App\Support\CustomerCart;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class CartController extends Controller
{
    // เปิดหน้าตะกร้า พร้อมรายการสินค้าของบัญชีที่ล็อกอิน
    public function index(Request $request): Response
    {
        return Inertia::render('cart', ['items' => CustomerCart::items($request->user()->id)]);
    }

    // เพิ่มสินค้า: ส่ง true เพื่อบวกจำนวนกับรายการเดิมถ้ามี
    public function store(CartItemRequest $request): RedirectResponse
    {
        $this->saveItem($request, (int) $request->validated('product_id'), true);

        return back();
    }

    // แก้จำนวน: ส่ง false เพื่อใช้จำนวนใหม่แทนของเดิม
    public function update(CartItemRequest $request, int $product): RedirectResponse
    {
        $this->saveItem($request, $product, false);

        return back();
    }

    // ใช้ร่วมกันระหว่างเพิ่มและแก้จำนวน จะได้ตรวจสต็อกด้วยกฎเดียวกัน
    private function saveItem(CartItemRequest $request, int $productId, bool $adding): void
    {
        // ทำทุกขั้นตอนใน transaction ถ้าผิดพลาดจะไม่บันทึกค้างไว้ครึ่งเดียว
        DB::transaction(function () use ($request, $productId, $adding): void {
            $userId = $request->user()->id;
            CustomerCart::lockOwner($userId);
            $product = Product::where('id', $productId)->lockForUpdate()->first();
            if (! $product || $product->is_deleted) {
                throw ValidationException::withMessages(['cart' => 'สินค้าไม่พร้อมขาย']);
            }

            $line = CartProduct::where('cart_user_id', $userId)->where('product_id', $productId)->first();
            // ถ้าเป็นการแก้ ต้องมีรายการนี้ในตะกร้าของตัวเองก่อน ไม่พบตอบ 404
            abort_if(! $adding && ! $line, 404);
            // เพิ่มสินค้าเดิมให้บวกจำนวน แต่แก้จำนวนให้ใช้ค่าใหม่แทน
            $quantity = (int) $request->validated('quantity');
            if ($adding) {
                $quantity += (int) ($line->quantity ?? 0);
            }
            if ($quantity > $product->stock || $quantity > 1000000) {
                throw ValidationException::withMessages(['quantity' => 'จำนวนเกินสินค้าคงเหลือ']);
            }

            // สร้างตะกร้าถ้ายังไม่มี ถ้ามีแล้วข้ามไป ไม่สร้างซ้ำ
            Cart::firstOrCreate(['user_id' => $userId]);
            if ($line) {
                CartProduct::where('cart_user_id', $userId)
                    ->where('product_id', $productId)
                    ->update(['quantity' => $quantity, 'updated_at' => now()]);
            } else {
                CartProduct::create([
                    'cart_user_id' => $userId,
                    'product_id' => $productId,
                    'quantity' => $quantity,
                    'added_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }, 3);
    }

    // ลบเฉพาะรายการในตะกร้าของตัวเอง ไม่ลบสินค้าในร้าน
    public function destroy(Request $request, int $product): RedirectResponse
    {
        DB::transaction(function () use ($request, $product): void {
            CustomerCart::lockOwner($request->user()->id);
            CartProduct::where('cart_user_id', $request->user()->id)->where('product_id', $product)->delete();
        }, 3);

        return back();
    }
}
