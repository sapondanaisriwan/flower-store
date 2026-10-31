<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    /**
     * หน้ารายการสินค้าทั้งหมด (User-facing)
     */
    public function home(): Response
    {
        return Inertia::render('welcome', ['dbProducts' => Product::withRatingStats()->where('products.is_deleted', false)->orderByDesc('products.id')->limit(8)->get()]);
    }

    public function index(): Response
    {
        $products = Product::withRatingStats()
            ->where('products.is_deleted', false)
            ->orderBy('products.id', 'asc')
            ->get();

        return Inertia::render('products', ['dbProducts' => $products]);
    }

    /**
     * หน้ารายละเอียดสินค้า (User-facing)
     */
    public function show(int $product): Response
    {
        // ใช้ firstOrFail() จะโยน 404 ให้อัตโนมัติถ้าไม่เจอสินค้า
        $productModel = Product::withRatingStats()
            ->where('products.id', $product)
            ->where('products.is_deleted', false)
            ->firstOrFail();

        return Inertia::render('product-detail', [
            'productId' => $product,
            'dbProduct' => $productModel,
            'relatedProducts' => Product::withRatingStats()->where('products.is_deleted', false)->where('products.id', '<>', $product)->orderByDesc('products.id')->limit(3)->get(),
        ]);
    }
}
