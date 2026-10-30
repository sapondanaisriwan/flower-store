<?php

namespace App\Http\Controllers;

use App\Http\Requests\Addresses\SaveAddressRequest;
use App\Models\UserAddress;
use App\Support\CustomerAddress;
use App\Support\CustomerCart;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class UserAddressController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        // อ่านเฉพาะที่อยู่ที่ยังใช้งานของคนที่ล็อกอิน
        $addresses = UserAddress::where('user_id', $request->user()->id)
            ->where('is_active', true)
            ->orderBy('address_name')
            ->get();

        return response()->json(['addresses' => $addresses]);
    }

    public function store(SaveAddressRequest $request): JsonResponse|RedirectResponse
    {
        // รับเฉพาะฟิลด์ที่ตรวจแล้ว ไม่รับ user_id จากฟอร์ม
        $data = $request->validated();
        $data['user_id'] = $request->user()->id;
        $data['is_active'] = true;

        $address = DB::transaction(function () use ($data) {
            CustomerCart::lockOwner($data['user_id']);

            return CustomerAddress::create($data['user_id'], $data);
        }, 3);

        if ($request->wantsJson() && ! $request->header('X-Inertia')) {
            return response()->json(['address' => $address], 201);
        }

        return back();
    }

    public function update(SaveAddressRequest $request, string $addressName): JsonResponse|RedirectResponse
    {
        $data = $request->validated();
        DB::transaction(function () use ($request, $addressName, $data): void {
            $userId = $request->user()->id;
            CustomerCart::lockOwner($userId);
            $query = UserAddress::where('user_id', $userId)->where('address_name', $addressName)->where('is_active', true);
            abort_unless($query->exists(), 404);
            if ($data['address_name'] !== $addressName && UserAddress::where('user_id', $userId)->where('address_name', $data['address_name'])->exists()) {
                throw ValidationException::withMessages(['address_name' => 'ชื่อนี้เคยถูกใช้แล้ว กรุณาเลือกชื่ออื่นเพื่อรักษาประวัติคำสั่งซื้อ']);
            }
            $query->update($data);
        }, 3);

        if ($request->wantsJson() && ! $request->header('X-Inertia')) {
            return response()->json(['address' => array_merge($data, ['address_name' => $data['address_name'] ?? $addressName])]);
        }

        return back();
    }

    public function destroy(Request $request, string $addressName): JsonResponse|RedirectResponse
    {
        // ปิดใช้งานแทนการลบ เพื่อเก็บที่อยู่ที่ออเดอร์เก่าอ้างอิง
        $updated = DB::transaction(function () use ($request, $addressName) {
            CustomerCart::lockOwner($request->user()->id);

            return UserAddress::where('user_id', $request->user()->id)
                ->where('address_name', $addressName)->where('is_active', true)
                ->update(['is_active' => false]);
        }, 3);

        abort_unless($updated > 0, 404);

        if ($request->wantsJson() && ! $request->header('X-Inertia')) {
            return response()->json(['message' => 'ปิดใช้งานที่อยู่แล้ว']);
        }

        return back();
    }
}
