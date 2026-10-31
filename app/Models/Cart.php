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
class Cart extends Model
{
    use HasFactory;

    protected $table = 'carts';

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
     * เจ้าของตะกร้า
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }

    /**
     * รายการแถวสินค้าในตะกร้า
     */
    public function cartProducts(): HasMany
    {
        return $this->hasMany(CartProduct::class, 'cart_user_id', 'user_id');
    }

    /**
     * รายการสินค้าในตะกร้า
     */
    public function products(): BelongsToMany
    {
        return $this->belongsToMany(Product::class, 'cart_product', 'cart_user_id', 'product_id')
            ->withPivot(['quantity', 'added_at', 'updated_at']);
    }
}
