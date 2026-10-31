<?php

namespace App\Http\Controllers;

use App\Http\Requests\Wishlist\StoreWishlistRequest;
use App\Models\ColorProduct;
use App\Models\Rating;
use App\Models\Wishlist;
use App\Models\WishlistProduct;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class WishlistController extends Controller
{
    public function index(Request $request): Response
    {
        $ratings = Rating::selectRaw('product_id, AVG(rating) as average_rating, COUNT(*) as rating_count')->groupBy('product_id');
        $productColors = ColorProduct::selectRaw('product_id, MIN(color_name) as primary_color')->groupBy('product_id');

        // อ่านสินค้าใน Wishlist ของตัวเอง พร้อมคะแนนเฉลี่ยจากฐานข้อมูล
        $items = WishlistProduct::where('wishlist_user_id', $request->user()->id)
            ->join('products', 'products.id', '=', 'wishlist_product.product_id')
            ->leftJoinSub($ratings, 'scores', 'scores.product_id', '=', 'products.id')
            ->leftJoinSub($productColors, 'product_colors', 'product_colors.product_id', '=', 'products.id')
            ->where('products.is_deleted', false)
            ->select('products.*', DB::raw('product_colors.primary_color as color'), 'scores.average_rating', 'scores.rating_count')
            ->orderByDesc('wishlist_product.added_at')
            ->orderBy('products.id')
            ->get();

        return Inertia::render('wishlist', ['items' => $items]);
    }

    public function store(StoreWishlistRequest $request): RedirectResponse
    {
        $userId = $request->user()->id;
        $productId = $request->validated('product_id');

        DB::transaction(function () use ($userId, $productId): void {
            // สร้างชุด Wishlist ถ้ายังไม่มี; ส่งซ้ำก็ไม่เพิ่มแถวซ้ำ
            Wishlist::insertOrIgnore(['user_id' => $userId]);
            WishlistProduct::insertOrIgnore([
                'wishlist_user_id' => $userId,
                'product_id' => $productId,
                'added_at' => now(),
            ]);
        });

        return back();
    }

    public function destroy(Request $request, int $product): RedirectResponse
    {
        // ลบได้เฉพาะของตัวเอง ถึงส่ง user_id ของคนอื่นมาก็ไม่ใช้
        WishlistProduct::where('wishlist_user_id', $request->user()->id)
            ->where('product_id', $product)
            ->delete();

        return back();
    }
}
