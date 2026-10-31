<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $wishlist_user_id
 * @property int $product_id
 * @property Carbon|null $added_at
 */
class WishlistProduct extends Model
{
    use HasFactory;

    protected $table = 'wishlist_product';

    public $incrementing = false;

    public $timestamps = false;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'wishlist_user_id',
        'product_id',
        'added_at',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'wishlist_user_id' => 'integer',
            'product_id' => 'integer',
            'added_at' => 'datetime',
        ];
    }

    /**
     * ชุด Wishlist ที่เป็นเจ้าของ
     */
    public function wishlist(): BelongsTo
    {
        return $this->belongsTo(Wishlist::class, 'wishlist_user_id', 'user_id');
    }

    /**
     * ผู้ใช้ที่เป็นเจ้าของ
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'wishlist_user_id', 'id');
    }

    /**
     * ข้อมูลสินค้า
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class, 'product_id', 'id');
    }
}
