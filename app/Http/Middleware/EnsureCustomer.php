<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureCustomer
{
    public function handle(Request $request, Closure $next): Response
    {
        // ต้องล็อกอินก่อน และห้ามใช้บัญชี admin หรือบัญชีที่ถูกแบน
        abort_unless($request->user()?->role === 'customer' && ! $request->user()->is_banned, 403);

        return $next($request);
    }
}
