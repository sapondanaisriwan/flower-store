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
            ->where('user_id', $this->user()->id)
            ->where('is_active', true);

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

    /** @return array<string, string> */
    public function messages(): array
    {
        return [
            'address_name.required' => 'กรุณากรอกชื่อที่อยู่ เช่น บ้าน หรือ ที่ทำงาน',
            'address_name.unique' => 'มีที่อยู่ที่ใช้ชื่อนี้อยู่แล้ว กรุณาใช้ชื่ออื่น',
            'recipient_name.required' => 'กรุณากรอกชื่อ-นามสกุลผู้รับ',
            'address_line.required' => 'กรุณากรอกรายละเอียดที่อยู่ (บ้านเลขที่ ถนน ซอย)',
            'subdistrict.required' => 'กรุณากรอกตำบล / แขวง',
            'district.required' => 'กรุณากรอกอำเภอ / เขต',
            'province.required' => 'กรุณากรอกจังหวัด',
            'postal_code.required' => 'กรุณากรอกรหัสไปรษณีย์',
            'postal_code.regex' => 'รหัสไปรษณีย์ต้องเป็นตัวเลข 5 หลัก',
            'phone_number.required' => 'กรุณากรอกเบอร์โทรศัพท์',
            'phone_number.regex' => 'เบอร์โทรศัพท์ต้องขึ้นต้นด้วย 0 และมีความยาว 9-10 หลัก',
        ];
    }
}
