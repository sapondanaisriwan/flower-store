<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $order_id
 * @property int $product_id
 * @property string $product_name
 * @property float $purchase_price
 * @property int $quantity
 * @property string $picture_path
 * @property int $product_order
 */
class OrderProduct extends Model
{
    use HasFactory;

    protected $table = 'order_product';

    public $timestamps = false;

    public $incrementing = false;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'order_id',
        'product_id',
        'product_name',
        'purchase_price',
        'quantity',
        'picture_path',
        'product_order',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'purchase_price' => 'decimal:2',
            'quantity' => 'integer',
            'product_order' => 'integer',
        ];
    }

    /**
     * คำสั่งซื้อที่รายการนี้สังกัด
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class, 'order_id', 'id');
    }

    /**
     * สินค้าเดิมที่สั่งซื้อ
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class, 'product_id', 'id');
    }
}
