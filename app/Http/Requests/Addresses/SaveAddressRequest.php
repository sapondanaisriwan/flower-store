<?php

namespace App\Http\Requests\Addresses;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SaveAddressRequest extends FormRequest
{
    /** @return array<string, mixed> */
    public function rules(): array
    {
        // ตอนแก้ไข ยอมให้ใช้ชื่อที่อยู่เดิมได้ แต่ห้ามเปลี่ยนเป็นชื่อที่มีอยู่แล้ว
        $uniqueName = Rule::unique('user_addresses', 'address_name')
            ->where('user_id', $this->user()->id);

        if ($this->isMethod('patch')) {
            $uniqueName->whereNot('address_name', $this->route('addressName'));
        }

        return [
            'address_name' => ['required', 'string', 'max:100', $uniqueName],
            'recipient_name' => ['required', 'string', 'max:255'],
            'address_line' => ['required', 'string', 'max:2000'],
            'subdistrict' => ['required', 'string', 'max:255'],
            'district' => ['required', 'string', 'max:255'],
            'province' => ['required', 'string', 'max:255'],
            'postal_code' => ['required', 'string', 'regex:/^[1-9][0-9]{4}$/'],
            'phone_number' => ['required', 'string', 'regex:/^0[0-9]{8,9}$/'],
        ];
    }
}
