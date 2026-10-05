<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::inertia('/', 'welcome')->name('home');
Route::inertia('/products', 'products')->name('products');
Route::get('/products/{product}', function (string $product) {
    abort_unless(in_array($product, array_map('strval', range(1, 9)), true), 404);

    return Inertia::render('product-detail', ['productId' => (int) $product]);
})->whereNumber('product')->name('products.show');

Route::middleware(['auth'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
    Route::get('/cart', function (Request $request) {
        abort_if($request->user()?->getAttribute('role') === 'admin', 403);

        return Inertia::render('cart');
    })->name('cart');
    Route::get('/checkout', function (Request $request) {
        abort_if($request->user()?->getAttribute('role') === 'admin', 403);

        return Inertia::render('checkout');
    })->name('checkout');
});

require __DIR__.'/settings.php';
