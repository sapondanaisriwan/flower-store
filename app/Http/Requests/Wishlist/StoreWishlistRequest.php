<?php

namespace App\Http\Requests\Wishlist;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreWishlistRequest extends FormRequest
{
    /** @return array<string, mixed> */
    public function rules(): array
    {
        // สินค้าหมดยังบันทึกไว้ได้ แต่สินค้าที่ปิดขายแล้วเพิ่มไม่ได้
        return [
            'product_id' => ['required', 'integer', Rule::exists('products', 'id')->where('is_deleted', false)],
        ];
    }
}
