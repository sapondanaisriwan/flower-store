<?php

namespace App\Http\Requests\Cart;

use Illuminate\Foundation\Http\FormRequest;

class CartItemRequest extends FormRequest
{
    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            // POST รับรหัสสินค้าจากฟอร์ม ส่วน PATCH ใช้รหัสจาก URL และไม่รับช่องนี้
            'product_id' => [$this->isMethod('post') ? 'required' : 'exclude', 'integer', 'min:1'],
            'quantity' => ['required', 'integer', 'min:1', 'max:1000000'],
        ];
    }
}
