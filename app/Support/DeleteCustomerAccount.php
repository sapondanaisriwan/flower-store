<?php

namespace App\Support;

use App\Models\User;
use App\Models\UserAddress;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

final class DeleteCustomerAccount
{
    public static function delete(int $userId, string $errorKey): void
    {
        DB::transaction(function () use ($userId, $errorKey): void {
            $user = User::where('id', $userId)->lockForUpdate()->firstOrFail();
            if ($user->orders()->exists()) {
                throw ValidationException::withMessages([$errorKey => 'ไม่สามารถลบบัญชีที่มีประวัติคำสั่งซื้อได้ กรุณาติดต่อร้านเพื่อระงับบัญชี']);
            }
            UserAddress::where('user_id', $userId)->delete();
            $user->delete();
        }, 3);
    }
}
