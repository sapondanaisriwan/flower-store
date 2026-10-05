import { useSyncExternalStore } from 'react';
import { catalog } from '@/data/catalog';

type CartLine = { id: number; quantity: number };
const eventName = 'flower-cart-change';
function subscribe(callback: () => void) {
    window.addEventListener('storage', callback);
    window.addEventListener(eventName, callback);
    return () => {
        window.removeEventListener('storage', callback);
        window.removeEventListener(eventName, callback);
    };
}
function normalize(raw: string): CartLine[] {
    try {
        const parsed: unknown = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];
        const result = new Map<number, number>();
        for (const value of parsed) {
            if (
                !value ||
                typeof value !== 'object' ||
                !('id' in value) ||
                !('quantity' in value)
            )
                continue;
            const product = catalog.find((item) => item.id === value.id);
            if (
                !product ||
                typeof value.quantity !== 'number' ||
                !Number.isInteger(value.quantity) ||
                value.quantity < 1
            )
                continue;
            result.set(
                product.id,
                Math.min(
                    product.stock,
                    (result.get(product.id) ?? 0) + value.quantity,
                ),
            );
        }
        return [...result].map(([id, quantity]) => ({ id, quantity }));
    } catch {
        return [];
    }
}
export function useCart(userId?: number) {
    const key = userId ? `flower-shop:cart:v1:${userId}` : null;
    const read = () => {
        try {
            return key ? (window.localStorage.getItem(key) ?? '[]') : '[]';
        } catch {
            return '[]';
        }
    };
    const raw = useSyncExternalStore(subscribe, read, () => '[]');
    const lines = normalize(raw);
    const write = (items: CartLine[]) => {
        if (!key) return false;
        try {
            window.localStorage.setItem(key, JSON.stringify(items));
            window.dispatchEvent(new Event(eventName));
            return true;
        } catch {
            return false;
        }
    };
    return {
        lines,
        count: lines.reduce((total, line) => total + line.quantity, 0),
        add(id: number, quantity: number): 'ok' | 'stock' | 'storage' {
            const product = catalog.find((item) => item.id === id);
            const current = normalize(read());
            const existing = current.find((item) => item.id === id);
            if (
                !product ||
                !Number.isInteger(quantity) ||
                quantity < 1 ||
                (existing?.quantity ?? 0) + quantity > product.stock
            )
                return 'stock';
            const next = existing
                ? current.map((line) =>
                      line.id === id
                          ? { ...line, quantity: line.quantity + quantity }
                          : line,
                  )
                : [...current, { id, quantity }];
            return write(next) ? 'ok' : 'storage';
        },
        update(id: number, quantity: number) {
            const product = catalog.find((item) => item.id === id);
            if (
                !product ||
                !Number.isInteger(quantity) ||
                quantity < 1 ||
                quantity > product.stock
            )
                return false;
            return write(
                normalize(read()).map((line) =>
                    line.id === id ? { ...line, quantity } : line,
                ),
            );
        },
        remove(id: number) {
            return write(normalize(read()).filter((line) => line.id !== id));
        },
    };
}
