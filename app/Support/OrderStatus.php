<?php

namespace App\Support;

final class OrderStatus
{
    public const GROUPS = [
        'pending' => ['pending'],
        'shipping' => ['processing', 'shipping', 'shipped', 'delivery'],
        'delivered' => ['delivered', 'success'],
        'cancelled' => ['cancelled', 'canceled'],
    ];

    public static function normalize(string $status): string
    {
        foreach (self::GROUPS as $group => $values) {
            if (in_array($status, $values, true)) {
                return $group;
            }
        }

        return $status;
    }
}
