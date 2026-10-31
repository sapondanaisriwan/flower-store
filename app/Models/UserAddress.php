<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $user_id
 * @property string $address_name
 * @property string $recipient_name
 * @property string $address_line
 * @property string $subdistrict
 * @property string $district
 * @property string $province
 * @property string $postal_code
 * @property string $phone_number
 * @property bool $is_active
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
class UserAddress extends Model
{
    use HasFactory;

    protected $table = 'user_addresses';

    public $incrementing = false;

    /**
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'address_name',
        'recipient_name',
        'address_line',
        'subdistrict',
        'district',
        'province',
        'postal_code',
        'phone_number',
        'is_active',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    /**
     * บัญชีผู้ใช้ที่เป็นเจ้าของที่อยู่นี้
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }
}
