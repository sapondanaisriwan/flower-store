<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property string $color_name
 * @property int $product_id
 */
class ColorProduct extends Model
{
    use HasFactory;

    protected $table = 'color_product';

    public $incrementing = false;

    public $timestamps = false;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'color_name',
        'product_id',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'product_id' => 'integer',
        ];
    }

    /**
     * ข้อมูลสี
     */
    public function color(): BelongsTo
    {
        return $this->belongsTo(Color::class, 'color_name', 'name');
    }

    /**
     * ข้อมูลสินค้า
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class, 'product_id', 'id');
    }
}

