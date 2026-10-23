import { useSyncExternalStore } from 'react';
import { demoOrders } from '@/data/orders';
const eventName = 'flower-order-rating-change';
function subscribe(callback: () => void) {
    window.addEventListener('storage', callback);
    window.addEventListener(eventName, callback);
    return () => {
        window.removeEventListener('storage', callback);
        window.removeEventListener(eventName, callback);
    };
}
function parse(raw: string): Record<string, number> {
    try {
        const data: unknown = JSON.parse(raw);
        if (!data || typeof data !== 'object' || Array.isArray(data)) return {};
        return Object.fromEntries(
            Object.entries(data).filter(
                ([key, value]) =>
                    typeof value === 'number' &&
                    Number.isInteger(value) &&
                    value >= 1 &&
                    value <= 5 &&
                    demoOrders.some(
                        (order) =>
                            order.status === 'delivered' &&
                            order.items.some(
                                (item) => key === order.id + ':' + item.id,
                            ),
                    ),
            ),
        );
    } catch {
        return {};
    }
}
export function useOrderRatings(userId?: number) {
    const key = userId ? 'flower-shop:demo-ratings:v1:' + userId : null;
    const read = () => {
        try {
            return key ? (window.localStorage.getItem(key) ?? '{}') : '{}';
        } catch {
            return '{}';
        }
    };
    const raw = useSyncExternalStore(subscribe, read, () => '{}');
    return {
        ratings: parse(raw),
        save(this: void, orderId: string, productId: number, rating: number) {
            const ratingKey = orderId + ':' + productId;
            if (
                !key ||
                !parse(JSON.stringify({ [ratingKey]: rating }))[ratingKey]
            )
                return false;
            try {
                window.localStorage.setItem(
                    key,
                    JSON.stringify({ ...parse(read()), [ratingKey]: rating }),
                );
                window.dispatchEvent(new Event(eventName));
                return true;
            } catch {
                return false;
            }
        },
    };
}
