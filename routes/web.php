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
Route::inertia('/admin', 'admin')->name('admin');
Route::get('/admin/users', function () {
    return Inertia::render('admin', ['initialTab' => 'users']);
})->name('admin.users');
Route::get('/admin/products', function () {
    return Inertia::render('admin', ['initialTab' => 'products']);
})->name('admin.products');
Route::get('/admin/products/{product}/edit', function (string $product) {
    return Inertia::render('admin', [
        'initialTab' => 'products',
        'initialEditId' => (int) $product,
    ]);
})->whereNumber('product')->name('admin.products.edit');

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
