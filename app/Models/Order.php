<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $user_id
 * @property string $status
 * @property float $total_price
 * @property string $address_name
 * @property string $address
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
class Order extends Model
{
    use HasFactory;

    protected $table = 'orders';

    /**
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'status',
        'total_price',
        'address_name',
        'address',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'total_price' => 'decimal:2',
        ];
    }

    /**
     * เจ้าของคำสั่งซื้อ
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }

    /**
     * รายการสินค้าในคำสั่งซื้อ
     */
    public function orderProducts(): HasMany
    {
        return $this->hasMany(OrderProduct::class, 'order_id', 'id');
    }

    /**
     * สินค้าทั้งหมดในคำสั่งซื้อผ่านตาราง Pivot
     */
    public function products(): BelongsToMany
    {
        return $this->belongsToMany(Product::class, 'order_product', 'order_id', 'product_id')
            ->withPivot(['product_name', 'purchase_price', 'quantity', 'picture_path', 'product_order']);
    }

    /**
     * Scope โหลดข้อมูลผู้สั่งซื้อพร้อมบทบาท
     */
    public function scopeWithCustomer($query)
    {
        return $query->leftJoin('users', 'users.id', '=', 'orders.user_id')
            ->select(
                'orders.id',
                'orders.user_id',
                'orders.status',
                'orders.total_price',
                'orders.address_name',
                'orders.address',
                'orders.created_at',
                'orders.updated_at',
                'users.username as customer_name',
                'users.email as customer_email',
                'users.role as customer_role'
            );
    }

    /**
     * นับจำนวนออเดอร์ในแต่ละกลุ่มสถานะ
     *
     * @param array<string, list<string>> $groups
     * @return array<string, int>
     */
    public static function getStatusCounts(array $groups): array
    {
        $counts = ['all' => static::count()];
        foreach ($groups as $key => $statuses) {
            $counts[$key] = static::whereIn('status', $statuses)->count();
        }
        return $counts;
    }
}
