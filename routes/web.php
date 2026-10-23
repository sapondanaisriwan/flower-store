<?php

use App\Http\Controllers\Admin\OrderController as AdminOrderController;
use App\Http\Controllers\Admin\ProductController as AdminProductController;
use App\Http\Controllers\Admin\UserController as AdminUserController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\UserAddressController;
use App\Http\Controllers\WishlistController;
use App\Http\Middleware\EnsureAdmin;
use App\Http\Middleware\EnsureCustomer;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::inertia('/', 'welcome')->name('home');
Route::inertia('/products', 'products')->name('products');
Route::get('/products/{product}', function (string $product) {
    abort_unless(in_array($product, array_map('strval', range(1, 9)), true), 404);

    return Inertia::render('product-detail', ['productId' => (int) $product]);
})->whereNumber('product')->name('products.show');
// งานฝั่งผู้ดูแลระบบ (Admin)
Route::middleware(['auth', EnsureAdmin::class])->prefix('admin')->name('admin.')->group(function () {
    // หน้าหลัก Admin (เริ่มต้นที่หน้าสินค้า)
    Route::get('/', [AdminProductController::class, 'index'])->name('index');

    // จัดการสินค้า: ดู / เพิ่ม / แก้ / ปิดขาย / สต็อก / ลบ
    Route::get('/products', [AdminProductController::class, 'index'])->name('products');
    Route::post('/products', [AdminProductController::class, 'store'])->name('products.store');
    Route::get('/products/{product}/edit', [AdminProductController::class, 'edit'])->whereNumber('product')->name('products.edit');
    Route::match(['patch', 'post'], '/products/{product}', [AdminProductController::class, 'update'])->whereNumber('product')->name('products.update');
    Route::patch('/products/{product}/toggle', [AdminProductController::class, 'toggleSell'])->whereNumber('product')->name('products.toggle');
    Route::patch('/products/{product}/stock', [AdminProductController::class, 'updateStock'])->whereNumber('product')->name('products.stock');
    Route::delete('/products/{product}', [AdminProductController::class, 'destroy'])->whereNumber('product')->name('products.destroy');

    // จัดการออเดอร์: ดูทุกออเดอร์ / ยอมรับ / ยกเลิก / เปลี่ยนสถานะ
    Route::get('/orders', [AdminOrderController::class, 'index'])->name('orders');
    Route::get('/orders/{order}', [AdminOrderController::class, 'show'])->whereNumber('order')->name('orders.show');
    Route::patch('/orders/{order}/status', [AdminOrderController::class, 'updateStatus'])->whereNumber('order')->name('orders.status');

    // จัดการสมาชิก: ดูสมาชิก / แบน / เปลี่ยน role
    Route::get('/users', [AdminUserController::class, 'index'])->name('users');
    Route::patch('/users/{user}/ban', [AdminUserController::class, 'toggleBan'])->whereNumber('user')->name('users.ban');
    Route::patch('/users/{user}/role', [AdminUserController::class, 'updateRole'])->whereNumber('user')->name('users.role');
});
Route::redirect('/admin', '/admin/products');

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
