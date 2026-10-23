<?php

namespace App\Support;

use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use stdClass;

class CustomerCart
{
    /** @return Collection<int, stdClass> */
    // Cart และ Checkout ใช้คำค้นเดียวกัน อ่านข้อมูลสินค้าจริงกับจำนวนที่เลือก
    public static function items(int $userId): Collection
    {
        // เก็บสินค้าที่หมดหรือปิดขายไว้ให้ลูกค้าเห็นและลบออกเอง
        return DB::table('cart_product')->join('products', 'products.id', '=', 'cart_product.product_id')
            ->where('cart_user_id', $userId)
            ->select('products.*', 'cart_product.quantity')
            ->orderBy('products.id')->get();
    }

    // ต้องเรียกภายใน transaction เพื่อให้ lock ค้างจนบันทึกหรือย้อนกลับเสร็จ
    public static function lockOwner(int $userId): void
    {
        // ให้การแก้ตะกร้าและ Checkout ของบัญชีเดียวกันทำทีละคำขอ
        DB::table('users')->where('id', $userId)->lockForUpdate()->first();
    }
}
