<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Carbon;
use Laravel\Fortify\Contracts\PasskeyUser;
use Laravel\Fortify\PasskeyAuthenticatable;
use Laravel\Fortify\TwoFactorAuthenticatable;

/**
 * @property int $id
 * @property string $role
 * @property bool $is_banned
 * @property string $username
 * @property string $email
 * @property Carbon|null $email_verified_at
 * @property string $password
 * @property string|null $two_factor_secret
 * @property string|null $two_factor_recovery_codes
 * @property Carbon|null $two_factor_confirmed_at
 * @property string|null $remember_token
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['username', 'email', 'password', 'role', 'is_banned'])]
#[Hidden(['password', 'two_factor_secret', 'two_factor_recovery_codes', 'remember_token'])]
class User extends Authenticatable implements MustVerifyEmail, PasskeyUser
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable, PasskeyAuthenticatable, TwoFactorAuthenticatable;

    // ให้บัญชีที่เพิ่งสร้างมีค่าเดียวกับค่าเริ่มต้นในฐานข้อมูลทันที
    /** @var array<string, mixed> */
    protected $attributes = [
        'role' => 'customer',
        'is_banned' => false,
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_banned' => 'boolean',
            'two_factor_confirmed_at' => 'datetime',
        ];
    }

    /**
     * คำสั่งซื้อทั้งหมดของผู้ใช้นี้
     */
    public function orders(): HasMany
    {
        return $this->hasMany(Order::class, 'user_id', 'id');
    }

    /**
     * ที่อยู่จัดส่งทั้งหมดของผู้ใช้นี้
     */
    public function addresses(): HasMany
    {
        return $this->hasMany(UserAddress::class, 'user_id', 'id');
    }

    /**
     * ตะกร้าสินค้าของผู้ใช้นี้
     */
    public function cart(): HasOne
    {
        return $this->hasOne(Cart::class, 'user_id', 'id');
    }

    /**
     * รายการสินค้าในตะกร้าของผู้ใช้นี้
     */
    public function cartProducts(): HasMany
    {
        return $this->hasMany(CartProduct::class, 'cart_user_id', 'id');
    }

    /**
     * Wishlist ของผู้ใช้นี้
     */
    public function wishlist(): HasOne
    {
        return $this->hasOne(Wishlist::class, 'user_id', 'id');
    }

    /**
     * รายการสินค้าใน Wishlist ของผู้ใช้นี้
     */
    public function wishlistProducts(): HasMany
    {
        return $this->hasMany(WishlistProduct::class, 'wishlist_user_id', 'id');
    }
}
