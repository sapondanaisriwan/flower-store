<?php

namespace App\Support;

use App\Models\UserAddress;
use Illuminate\Validation\ValidationException;

final class CustomerAddress
{
    // Caller holds the user's row lock inside a transaction.
    public static function create(int $userId, array $data): UserAddress
    {
        $query = UserAddress::where('user_id', $userId)->where('address_name', $data['address_name']);
        $existing = (clone $query)->first();
        if ($existing?->is_active) {
            throw ValidationException::withMessages(['address_name' => 'มีชื่อที่อยู่นี้อยู่แล้ว กรุณาใช้ชื่ออื่น']);
        }
        $values = [...$data, 'user_id' => $userId, 'is_active' => true, 'updated_at' => now()];
        if ($existing) {
            $query->update($values);
        } else {
            UserAddress::create($values);
        }

        return $query->firstOrFail();
    }
}
