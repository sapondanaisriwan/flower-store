<?php

namespace App\Http\Requests\Checkout;

use App\Http\Requests\Addresses\SaveAddressRequest;
use Illuminate\Validation\Rule;

class CheckoutRequest extends SaveAddressRequest
{
    /** @return array<string, mixed> */
    public function rules(): array
    {
        if ($this->boolean('use_saved_address')) {
            // เลือกที่อยู่เดิมได้เฉพาะของตัวเองที่ยังใช้งาน
            return [
                'use_saved_address' => ['required', 'boolean'],
                'address_name' => ['required', 'string', 'max:100', Rule::exists('user_addresses', 'address_name')
                    ->where('user_id', $this->user()->id)->where('is_active', true)],
            ];
        }

        // ถ้าเพิ่มที่อยู่ใหม่ ใช้กฎทุกช่องจาก SaveAddressRequest ไม่ต้องเขียนซ้ำ
        return ['use_saved_address' => ['required', 'boolean'], ...parent::rules()];
    }
}
