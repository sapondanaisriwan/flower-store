<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $user_id
 */
class Wishlist extends Model
{
    use HasFactory;

    protected $table = 'wishlists';

    protected $primaryKey = 'user_id';

    public $incrementing = false;

    public $timestamps = false;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
    ];

    /**
     * เจ้าของ Wishlist
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }

    /**
     * รายการใน Wishlist
     */
    public function wishlistProducts(): HasMany
    {
        return $this->hasMany(WishlistProduct::class, 'wishlist_user_id', 'user_id');
    }

    /**
     * สินค้าทั้งหมดใน Wishlist
     */
    public function products(): BelongsToMany
    {
        return $this->belongsToMany(Product::class, 'wishlist_product', 'wishlist_user_id', 'product_id')
            ->withPivot(['added_at']);
    }
}
