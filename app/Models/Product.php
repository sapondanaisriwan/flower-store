<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

/**
 * @property int $id
 * @property string $name
 * @property float $price
 * @property int $stock
 * @property string|null $color
 * @property string $description
 * @property string $picture_path
 * @property bool $is_deleted
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
class Product extends Model
{
    use HasFactory;

    protected $table = 'products';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'price',
        'stock',
        'description',
        'picture_path',
        'is_deleted',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'stock' => 'integer',
            'is_deleted' => 'boolean',
        ];
    }

    /**
     * ดึงคะแนนการรีวิวของสินค้า
     */
    public function ratings(): HasMany
    {
        return $this->hasMany(Rating::class, 'product_id', 'id');
    }

    /**
     * รายการในคำสั่งซื้อที่อ้างอิงถึงสินค้านี้
     */
    public function orderProducts(): HasMany
    {
        return $this->hasMany(OrderProduct::class, 'product_id', 'id');
    }

    /**
     * คำสั่งซื้อที่ซื้อสินค้านี้
     */
    public function orders(): BelongsToMany
    {
        return $this->belongsToMany(Order::class, 'order_product', 'product_id', 'order_id')
            ->withPivot(['product_name', 'purchase_price', 'quantity', 'picture_path', 'product_order']);
    }

    /**
     * รายการในตะกร้าของลูกค้า
     */
    public function cartProducts(): HasMany
    {
        return $this->hasMany(CartProduct::class, 'product_id', 'id');
    }

    /**
     * รายการใน Wishlist ของลูกค้า
     */
    public function wishlistProducts(): HasMany
    {
        return $this->hasMany(WishlistProduct::class, 'product_id', 'id');
    }

    /**
     * รายการเชื่อมโยงสีของสินค้านี้ (features_in)
     */
    public function colorProducts(): HasMany
    {
        return $this->hasMany(ColorProduct::class, 'product_id', 'id');
    }

    /**
     * สีทั้งหมดของสินค้านี้
     */
    public function colors(): BelongsToMany
    {
        return $this->belongsToMany(Color::class, 'color_product', 'product_id', 'color_name', 'id', 'name');
    }

    /**
     * บันทึกสีของสินค้าลงตาราง colors และ color_product
     *
     * @param  string|list<string>  $colors
     */
    public function syncColors(string|array $colors, ?string $hexCode = null): void
    {
        $names = is_array($colors) ? $colors : explode(',', $colors);
        $cleanNames = array_values(array_unique(array_filter(array_map('trim', $names), fn (string $n) => $n !== '')));

        ColorProduct::where('product_id', $this->id)->delete();

        foreach ($cleanNames as $name) {
            Color::firstOrCreate(
                ['name' => $name],
                ['hex_code' => $hexCode ?: Color::defaultHexFor($name)]
            );

            ColorProduct::firstOrCreate([
                'color_name' => $name,
                'product_id' => $this->id,
            ]);
        }
    }

    /**
     * Scope สำหรับโหลดสินค้าพร้อมคะแนนเฉลี่ยและจำนวนรีวิว
     */
    public function scopeWithRatingStats($query)
    {
        $ratings = Rating::query()
            ->selectRaw('product_id, AVG(rating) as average_rating, COUNT(*) as rating_count')
            ->groupBy('product_id');

        $productColors = ColorProduct::query()
            ->selectRaw('product_id, MIN(color_name) as primary_color')
            ->groupBy('product_id');

        return $query->with('colors')
            ->leftJoinSub($ratings, 'scores', 'scores.product_id', '=', 'products.id')
            ->leftJoinSub($productColors, 'product_colors', 'product_colors.product_id', '=', 'products.id')
            ->select(
                'products.id',
                'products.name',
                'products.description',
                'products.price',
                'products.stock',
                DB::raw('product_colors.primary_color as color'),
                'products.picture_path',
                'products.is_deleted',
                'products.created_at',
                'products.updated_at',
                DB::raw('COALESCE(scores.average_rating, 0) as rating'),
                DB::raw('COALESCE(scores.rating_count, 0) as rating_count')
            );
    }

    /**
     * ดึงรายชื่อสีทั้งหมดที่มีอยู่ในระบบ
     */
    public static function getDistinctColors(): Collection
    {
        return Color::query()
            ->orderBy('name')
            ->pluck('name')
            ->values();
    }

    /**
     * ดึงข้อมูลสีทั้งหมดพร้อมรหัสสี (name, hex_code)
     */
    public static function getColorCatalog(): Collection
    {
        return Color::query()
            ->orderBy('name')
            ->get(['name', 'hex_code'])
            ->values();
    }
}
