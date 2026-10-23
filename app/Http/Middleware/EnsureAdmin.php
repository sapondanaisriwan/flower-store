<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureAdmin
{
    /**
     * ตรวจสอบว่าผู้ใช้ล็อกอินและมีสิทธิ์เป็น admin ที่ไม่ถูกแบน
     */
    public function handle(Request $request, Closure $next): Response
    {
        abort_unless(
            $request->user() !== null &&
            $request->user()->role === 'admin' &&
            ! $request->user()->is_banned,
            403,
            'เข้าถึงได้เฉพาะผู้ดูแลระบบ (Admin) เท่านั้น'
        );

        return $next($request);
    }
}
