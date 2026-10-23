<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function index(Request $request): Response
    {
        $users = DB::table('users')
            ->leftJoin('orders', 'orders.user_id', '=', 'users.id')
            ->select(
                'users.id',
                'users.username',
                'users.username as name',
                'users.email',
                'users.role',
                'users.is_banned',
                'users.created_at',
                DB::raw('COUNT(orders.id) as orders_count')
            )
            ->groupBy(
                'users.id',
                'users.username',
                'users.email',
                'users.role',
                'users.is_banned',
                'users.created_at'
            )
            ->orderByDesc('users.id')
            ->get();

        return Inertia::render('admin', [
            'initialTab' => 'users',
            'dbUsers' => $users,
        ]);
    }


    public function toggleBan(Request $request, int $user): RedirectResponse
    {
        abort_if(
            $request->user()->id === $user,
            400,
            'ไม่สามารถแบนหรือระงับสิทธิ์บัญชีของตนเองได้'
        );

        $target = DB::table('users')->where('id', $user)->first();
        abort_unless($target !== null, 404);

        $newBanned = ! (bool) $target->is_banned;

        DB::table('users')->where('id', $user)->update([
            'is_banned' => $newBanned,
            'updated_at' => now(),
        ]);

        $msg = $newBanned ? 'ระงับการใช้งานบัญชี (แบน) เรียบร้อยแล้ว' : 'ปลดการระงับบัญชี (ปลดแบน) เรียบร้อยแล้ว';
        Inertia::flash('toast', ['type' => 'success', 'message' => $msg]);

        return back();
    }


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

        $target = DB::table('users')->where('id', $user)->first();
        abort_unless($target !== null, 404);

        DB::table('users')->where('id', $user)->update([
            'role' => $validated['role'],
            'updated_at' => now(),
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => "เปลี่ยนบทบาทเป็น {$validated['role']} เรียบร้อยแล้ว"]);

        return back();
    }
}
