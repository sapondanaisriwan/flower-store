<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property string $name
 * @property string $hex_code
 */
class Color extends Model
{
    use HasFactory;

    protected $table = 'colors';

    protected $primaryKey = 'name';

    protected $keyType = 'string';

    public $incrementing = false;

    public $timestamps = false;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'hex_code',
    ];

    /**
     * รายการเชื่อมโยงสีกับสินค้า (features_in)
     */
    public function colorProducts(): HasMany
    {
        return $this->hasMany(ColorProduct::class, 'color_name', 'name');
    }

    /**
     * สินค้าที่มีสีนี้
     */
    public function products(): BelongsToMany
    {
        return $this->belongsToMany(Product::class, 'color_product', 'color_name', 'product_id', 'name', 'id');
    }

    /**
     * คืนค่า hex_code มาตรฐานจากชื่อสี
     */
    public static function defaultHexFor(string $name): string
    {
        $map = [
            'pink' => '#dca3b2',
            'white' => '#fff9e9',
            'red' => '#9a3b50',
            'purple' => '#a78bbd',
            'yellow' => '#e6c871',
            'green' => '#6b8f71',
            'blue' => '#779fbd',
            'orange' => '#d99866',
        ];

        $clean = strtolower(trim($name));

        if (isset($map[$clean])) {
            return $map[$clean];
        }

        if (preg_match('/^#[0-9a-f]{3}([0-9a-f]{3})?$/i', $clean)) {
            return $clean;
        }

        return '#dbc3ca';
    }
}

