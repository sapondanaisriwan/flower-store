<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $order_id
 * @property int $product_id
 * @property int $rating
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
class Rating extends Model
{
    use HasFactory;

    protected $table = 'ratings';

    public $incrementing = false;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'order_id',
        'product_id',
        'rating',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'rating' => 'integer',
        ];
    }

    /**
     * สินค้าที่ได้รับคะแนนรีวิว
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class, 'product_id', 'id');
    }

    /**
     * คำสั่งซื้อที่ให้คะแนน
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class, 'order_id', 'id');
    }
}
