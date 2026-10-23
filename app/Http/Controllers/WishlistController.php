<?php

namespace App\Http\Controllers;

use App\Http\Requests\Wishlist\StoreWishlistRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class WishlistController extends Controller
{
    public function index(Request $request): Response
    {
        $ratings = DB::table('ratings')->selectRaw('product_id, AVG(rating) as average_rating, COUNT(*) as rating_count')->groupBy('product_id');

        // อ่านสินค้าใน Wishlist ของตัวเอง พร้อมคะแนนเฉลี่ยจากฐานข้อมูล
        $items = DB::table('wishlist_product')
            ->join('products', 'products.id', '=', 'wishlist_product.product_id')
            ->leftJoinSub($ratings, 'scores', 'scores.product_id', '=', 'products.id')
            ->where('wishlist_user_id', $request->user()->id)
            ->where('products.is_deleted', false)
            ->select('products.*', 'scores.average_rating', 'scores.rating_count')
            ->orderByDesc('wishlist_product.added_at')->orderBy('products.id')->get();

        return Inertia::render('wishlist', ['items' => $items]);
    }

    public function store(StoreWishlistRequest $request): RedirectResponse
    {
        $userId = $request->user()->id;
        $productId = $request->validated('product_id');

        DB::transaction(function () use ($userId, $productId): void {
            // สร้างชุด Wishlist ถ้ายังไม่มี; ส่งซ้ำก็ไม่เพิ่มแถวซ้ำ
            DB::table('wishlists')->insertOrIgnore(['user_id' => $userId]);
            DB::table('wishlist_product')->insertOrIgnore([
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
        DB::table('wishlist_product')->where('wishlist_user_id', $request->user()->id)
            ->where('product_id', $product)->delete();

        return back();
    }
}
