<?php

use App\Http\Controllers\UserAddressController;
use App\Http\Controllers\WishlistController;
use App\Http\Middleware\EnsureCustomer;
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
    Route::get('/orders', function (Request $request) {
        abort_if($request->user()?->getAttribute('role') === 'admin', 403);

        return Inertia::render('orders');
    })->name('orders');
    Route::get('/orders/{order}', function (Request $request, string $order) {
        abort_if($request->user()?->getAttribute('role') === 'admin', 403);
        abort_unless(in_array($order, ['DEMO-260406', 'DEMO-260402'], true), 404);

        return Inertia::render('orders', ['orderId' => $order]);
    })->name('orders.show');
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

// แยกเส้นทางของที่อยู่และ Wishlist ให้ใช้ได้เฉพาะลูกค้าที่ไม่ถูกแบน
Route::middleware(['auth', EnsureCustomer::class])->group(function () {
    Route::get('/addresses', [UserAddressController::class, 'index'])->name('addresses.index');
    Route::post('/addresses', [UserAddressController::class, 'store'])->name('addresses.store');
    Route::patch('/addresses/{addressName}', [UserAddressController::class, 'update'])->name('addresses.update');
    Route::delete('/addresses/{addressName}', [UserAddressController::class, 'destroy'])->name('addresses.destroy');

    Route::get('/wishlist', [WishlistController::class, 'index'])->name('wishlist');
    Route::post('/wishlist', [WishlistController::class, 'store'])->name('wishlist.store');
    Route::delete('/wishlist/{product}', [WishlistController::class, 'destroy'])->whereNumber('product')->name('wishlist.destroy');
});

require __DIR__.'/settings.php';
