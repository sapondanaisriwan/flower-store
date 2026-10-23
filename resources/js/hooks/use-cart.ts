import { router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'sonner';

export function useCart() {
    const { cartLines } = usePage().props;
    const [pending, setPending] = useState(false);

    function send(
        method: 'post' | 'patch' | 'delete',
        id: number,
        quantity?: number,
    ) {
        if (pending) return;
        setPending(true);
        const options = {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('บันทึกตะกร้าแล้ว');
            },
            onError: (errors: Record<string, string>) => {
                toast.error(Object.values(errors)[0] ?? 'บันทึกตะกร้าไม่ได้');
            },
            onFinish: () => setPending(false),
        };
        if (method === 'post')
            router.post('/cart', { product_id: id, quantity }, options);
        else if (method === 'patch')
            router.patch(`/cart/${id}`, { quantity }, options);
        else router.delete(`/cart/${id}`, options);
    }

    return {
        lines: cartLines,
        count: cartLines.reduce((sum, line) => sum + line.quantity, 0),
        pending,
        add: (id: number, quantity: number) => send('post', id, quantity),
        update: (id: number, quantity: number) => send('patch', id, quantity),
        remove: (id: number) => send('delete', id),
    };
}
