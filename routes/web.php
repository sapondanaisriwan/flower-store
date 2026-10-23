<?php

use App\Http\Controllers\CartController;
use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\UserAddressController;
use App\Http\Controllers\WishlistController;
use App\Http\Middleware\EnsureCustomer;
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

Route::inertia('dashboard', 'dashboard')->middleware('auth')->name('dashboard');

// งานฝั่งลูกค้า ต้องล็อกอินและไม่ถูกแบน
Route::middleware(['auth', EnsureCustomer::class])->group(function () {
    Route::get('/cart', [CartController::class, 'index'])->name('cart');
    Route::post('/cart', [CartController::class, 'store'])->name('cart.store');
    Route::patch('/cart/{product}', [CartController::class, 'update'])->whereNumber('product')->name('cart.update');
    Route::delete('/cart/{product}', [CartController::class, 'destroy'])->whereNumber('product')->name('cart.destroy');
    Route::get('/checkout', [CheckoutController::class, 'index'])->name('checkout');
    Route::post('/checkout', [CheckoutController::class, 'store'])->name('checkout.store');
    Route::get('/orders', [OrderController::class, 'index'])->name('orders');
    Route::get('/orders/{order}', [OrderController::class, 'show'])->whereNumber('order')->name('orders.show');

    Route::get('/addresses', [UserAddressController::class, 'index'])->name('addresses.index');
    Route::post('/addresses', [UserAddressController::class, 'store'])->name('addresses.store');
    Route::patch('/addresses/{addressName}', [UserAddressController::class, 'update'])->name('addresses.update');
    Route::delete('/addresses/{addressName}', [UserAddressController::class, 'destroy'])->name('addresses.destroy');

    Route::get('/wishlist', [WishlistController::class, 'index'])->name('wishlist');
    Route::post('/wishlist', [WishlistController::class, 'store'])->name('wishlist.store');
    Route::delete('/wishlist/{product}', [WishlistController::class, 'destroy'])->whereNumber('product')->name('wishlist.destroy');
});

require __DIR__.'/settings.php';
