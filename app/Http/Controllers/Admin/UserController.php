<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    /**
     * แสดงรายการบัญชีผู้ใช้ทั้งหมด พร้อมจำนวนออเดอร์ที่สั่ง
     */
    public function index(Request $request): Response
    {
        try {
            $users = User::withCount('orders')
                ->select(
                    'id',
                    'username',
                    'username as name',
                    'email',
                    'role',
                    'is_banned',
                    'created_at'
                )
                ->orderByDesc('id')
                ->get();
        } catch (\Throwable) {
            $users = collect();
        }

        return Inertia::render('admin', [
            'initialTab' => 'users',
            'dbUsers' => $users,
        ]);
    }

    /**
     * สลับสถานะการระงับการใช้งานบัญชี (แบน / ปลดแบน)
     */
    public function toggleBan(Request $request, int $user): RedirectResponse
    {
        abort_if(
            $request->user()->id === $user,
            400,
            'ไม่สามารถแบนหรือระงับสิทธิ์บัญชีของตนเองได้'
        );

        $target = User::findOrFail($user);

        $newBanned = ! $target->is_banned;
        $target->update([
            'is_banned' => $newBanned,
        ]);

        $msg = $newBanned ? 'ระงับการใช้งานบัญชี (แบน) เรียบร้อยแล้ว' : 'ปลดการระงับบัญชี (ปลดแบน) เรียบร้อยแล้ว';
        Inertia::flash('toast', ['type' => 'success', 'message' => $msg]);

        return back();
    }

    /**
     * เปลี่ยนบทบาทของบัญชีผู้ใช้ (Customer / Admin)
     */
    public function updateRole(Request $request, int $user): RedirectResponse
    {
        abort_if(
            $request->user()->id === $user,
            400,
            'ไม่สามารถเปลี่ยนบทบาท (Role) ของบัญชีตนเองได้'
        );

        $validated = $request->validate([
            'role' => ['required', 'string', Rule::in(['customer', 'admin'])],
        ]);

        $target = User::findOrFail($user);
        $target->update([
            'role' => $validated['role'],
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => "เปลี่ยนบทบาทเป็น {$validated['role']} เรียบร้อยแล้ว"]);

        return back();
    }
}
