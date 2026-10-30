import { router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'sonner';

export function useWishlist() {
    const { wishlistIds } = usePage().props;
    const [pending, setPending] = useState(false);

    function save(productId: number, remove: boolean) {
        if (pending) return;
        setPending(true);

        // รอให้ backend บันทึกสำเร็จก่อนแสดงข้อความและเปลี่ยนสถานะหัวใจ
        const options = {
            preserveScroll: true,
            onSuccess: () =>
                toast.success(
                    remove ? 'นำออกจากรายการโปรดแล้ว' : 'บันทึกไว้ในรายการโปรดแล้ว',
                ),
            onError: () => toast.error('บันทึกไม่ได้ สินค้าอาจไม่พร้อมขาย กรุณาลองใหม่'),
            onFinish: () => setPending(false),
        };

        if (remove) router.delete(`/wishlist/${productId}`, options);
        else router.post('/wishlist', { product_id: productId }, options);
    }

    return {
        count: wishlistIds.length,
        pending,
        has: (id: number) => wishlistIds.includes(id),
        remove: (id: number) => save(id, true),
        toggle: (id: number) => save(id, wishlistIds.includes(id)),
    };
}
