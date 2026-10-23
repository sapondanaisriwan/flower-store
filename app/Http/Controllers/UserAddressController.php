<?php

namespace App\Http\Controllers;

use App\Http\Requests\Addresses\SaveAddressRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class UserAddressController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        // อ่านเฉพาะที่อยู่ที่ยังใช้งานของคนที่ล็อกอิน
        $addresses = DB::table('user_addresses')
            ->where('user_id', $request->user()->id)
            ->where('is_active', true)
            ->orderBy('address_name')->get();

        return response()->json(['addresses' => $addresses]);
    }

    public function store(SaveAddressRequest $request): JsonResponse
    {
        // รับเฉพาะฟิลด์ที่ตรวจแล้ว ไม่รับ user_id จากฟอร์ม
        $address = $request->validated();
        $address['user_id'] = $request->user()->id;
        $address['is_active'] = true;
        $address['created_at'] = now();
        $address['updated_at'] = now();
        DB::table('user_addresses')->insert($address);

        return response()->json(['address' => $address], 201);
    }

    public function update(SaveAddressRequest $request, string $addressName): JsonResponse
    {
        // ตารางนี้ใช้คีย์ผสม จึงต้องเลือกทั้ง user_id และชื่อที่อยู่ทุกครั้ง
        $query = DB::table('user_addresses')
            ->where('user_id', $request->user()->id)->where('address_name', $addressName)
            ->where('is_active', true);
        abort_unless($query->exists(), 404);

        $address = $request->validated();
        $address['updated_at'] = now();
        $query->update($address);

        return response()->json(['address' => $address]);
    }

    public function destroy(Request $request, string $addressName): JsonResponse
    {
        // ปิดใช้งานแทนการลบ เพื่อเก็บที่อยู่ที่ออเดอร์เก่าอ้างอิง
        $updated = DB::table('user_addresses')
            ->where('user_id', $request->user()->id)->where('address_name', $addressName)
            ->where('is_active', true)
            ->update(['is_active' => false, 'updated_at' => now()]);
        abort_unless($updated > 0, 404);

        return response()->json(['message' => 'ปิดใช้งานที่อยู่แล้ว']);
    }
}
