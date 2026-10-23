<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $request->user(),
            ],
            // ส่งรหัสสินค้าที่บันทึกไว้ ให้ปุ่มหัวใจทุกหน้ารู้สถานะเดียวกัน
            'wishlistIds' => fn () => $request->user()?->role === 'customer' && ! $request->user()->is_banned
                ? DB::table('wishlist_product')->join('products', 'products.id', '=', 'wishlist_product.product_id')
                    ->where('wishlist_user_id', $request->user()->id)->where('products.is_deleted', false)
                    ->pluck('product_id')->all()
                : [],
            'cartLines' => fn () => $request->user()?->role === 'customer' && ! $request->user()->is_banned
                ? DB::table('cart_product')->where('cart_user_id', $request->user()->id)
                    ->select('product_id as id', 'quantity')->orderBy('product_id')->get()
                : [],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
        ];
    }
}
