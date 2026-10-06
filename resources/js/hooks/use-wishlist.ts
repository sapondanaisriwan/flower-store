import { useSyncExternalStore } from 'react';
import { catalog } from '@/data/catalog';
const eventName = 'flower-wishlist-change';
function subscribe(callback: () => void) {
    window.addEventListener('storage', callback);
    window.addEventListener(eventName, callback);
    return () => {
        window.removeEventListener('storage', callback);
        window.removeEventListener(eventName, callback);
    };
}
function parse(raw: string): number[] {
    try {
        const value: unknown = JSON.parse(raw);
        return Array.isArray(value)
            ? [
                  ...new Set(
                      value.filter(
                          (id): id is number =>
                              typeof id === 'number' &&
                              catalog.some((item) => item.id === id),
                      ),
                  ),
              ]
            : [];
    } catch {
        return [];
    }
}
export function useWishlist(userId?: number) {
    const key = userId ? `flower-shop:wishlist:v1:${userId}` : null;
    const read = () => {
        try {
            return key ? (window.localStorage.getItem(key) ?? '[]') : '[]';
        } catch {
            return '[]';
        }
    };
    const raw = useSyncExternalStore(subscribe, read, () => '[]');
    const ids = parse(raw);
    function write(next: number[]) {
        if (!key) return false;
        try {
            window.localStorage.setItem(key, JSON.stringify(next));
            window.dispatchEvent(new Event(eventName));
            return true;
        } catch {
            return false;
        }
    }
    return {
        ids,
        has: (id: number) => ids.includes(id),
        remove: (id: number) =>
            write(parse(read()).filter((value) => value !== id)),
        toggle(id: number) {
            if (!catalog.some((item) => item.id === id)) return false;
            const current = parse(read());
            return write(
                current.includes(id)
                    ? current.filter((value) => value !== id)
                    : [...current, id],
            );
        },
    };
}
