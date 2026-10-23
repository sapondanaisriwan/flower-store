<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $cart_user_id
 * @property int $product_id
 * @property int $quantity
 * @property Carbon|null $added_at
 * @property Carbon|null $updated_at
 */
class CartProduct extends Model
{
    use HasFactory;

    protected $table = 'cart_product';

    public $incrementing = false;

    public $timestamps = false;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'cart_user_id',
        'product_id',
        'quantity',
        'added_at',
        'updated_at',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'cart_user_id' => 'integer',
            'product_id' => 'integer',
            'quantity' => 'integer',
            'added_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    /**
     * ตะกร้าที่บรรจุสินค้านี้
     */
    public function cart(): BelongsTo
    {
        return $this->belongsTo(Cart::class, 'cart_user_id', 'user_id');
    }

    /**
     * ผู้ใช้เจ้าของตะกร้า
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'cart_user_id', 'id');
    }

    /**
     * ข้อมูลสินค้า
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class, 'product_id', 'id');
    }
}
