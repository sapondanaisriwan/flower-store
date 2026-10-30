<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\ProfileDeleteRequest;
use App\Http\Requests\Settings\ProfileUpdateRequest;
use App\Support\DeleteCustomerAccount;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * เปิดหน้าโปรไฟล์ของคนที่ล็อกอินอยู่
     */
    public function edit(Request $request): Response
    {
        // ส่งข้อมูลไปแสดงที่ resources/js/pages/settings/profile.tsx
        return Inertia::render('settings/profile', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * บันทึกชื่อและอีเมลที่แก้จากหน้าโปรไฟล์
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        // ใช้บัญชีที่ล็อกอินอยู่ ไม่รับรหัสผู้ใช้จากฟอร์มมาเลือกบัญชี
        $user = $request->user();

        // Request ตรวจชื่อและอีเมลก่อนเข้ามาตรงนี้ รับเฉพาะข้อมูลที่ผ่านการตรวจ
        $user->fill($request->validated());

        // isDirty เช็กว่าอีเมลเปลี่ยนจากเดิมไหม ถ้าเปลี่ยนต้องยืนยันอีเมลใหม่
        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }

        // บันทึกข้อมูลที่แก้ลงตาราง users
        $user->save();

        // ฝากข้อความสำเร็จไว้ให้หน้าเว็บแสดง
        Inertia::flash('toast', ['type' => 'success', 'message' => __('Profile updated.')]);

        // กลับหน้าโปรไฟล์หลังบันทึกเสร็จ
        return to_route('profile.edit');
    }

    /**
     * ลบบัญชีตามโค้ดเดิม ส่วนนี้ยังไม่ได้ปรับเรื่องประวัติการซื้อ
     */
    public function destroy(ProfileDeleteRequest $request): RedirectResponse
    {
        $user = $request->user();

        DeleteCustomerAccount::delete($user->id, 'password');

        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
