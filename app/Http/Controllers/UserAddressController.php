<?php

namespace App\Http\Controllers;

use App\Http\Requests\Addresses\SaveAddressRequest;
use App\Models\UserAddress;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

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

        $address = UserAddress::updateOrCreate(
            ['user_id' => $data['user_id'], 'address_name' => $data['address_name']],
            $data
        );

        if ($request->wantsJson() && ! $request->header('X-Inertia')) {
            return response()->json(['address' => $address], 201);
        }

        return back();
    }

    public function update(SaveAddressRequest $request, string $addressName): JsonResponse|RedirectResponse
    {
        // ตารางนี้ใช้คีย์ผสม จึงต้องเลือกทั้ง user_id และชื่อที่อยู่ทุกครั้ง
        $query = UserAddress::where('user_id', $request->user()->id)
            ->where('address_name', $addressName)
            ->where('is_active', true);

        abort_unless($query->exists(), 404);

        $data = $request->validated();

        if (isset($data['address_name']) && $data['address_name'] !== $addressName) {
            UserAddress::where('user_id', $request->user()->id)
                ->where('address_name', $data['address_name'])
                ->where('is_active', false)
                ->delete();
        }

        $query->update($data);

        if ($request->wantsJson() && ! $request->header('X-Inertia')) {
            return response()->json(['address' => array_merge($data, ['address_name' => $data['address_name'] ?? $addressName])]);
        }

        return back();
    }

    public function destroy(Request $request, string $addressName): JsonResponse|RedirectResponse
    {
        // ปิดใช้งานแทนการลบ เพื่อเก็บที่อยู่ที่ออเดอร์เก่าอ้างอิง
        $updated = UserAddress::where('user_id', $request->user()->id)
            ->where('address_name', $addressName)
            ->where('is_active', true)
            ->update(['is_active' => false]);

        abort_unless($updated > 0, 404);

        if ($request->wantsJson() && ! $request->header('X-Inertia')) {
            return response()->json(['message' => 'ปิดใช้งานที่อยู่แล้ว']);
        }

        return back();
    }
}
