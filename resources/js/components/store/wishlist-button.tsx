import { Link, usePage } from '@inertiajs/react';
import { Heart } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { useWishlist } from '@/hooks/use-wishlist';
import { login } from '@/routes';
export function WishlistButton({
    productId,
    name,
    className = 'flower-heart',
}: {
    productId: number;
    name: string;
    className?: string;
}) {
    const { auth } = usePage().props;
    const wishlist = useWishlist(auth.user?.id);
    const [signIn, setSignIn] = useState(false);
    const saved = wishlist.has(productId);
    if (auth.user?.role === 'admin') return null;
    return (
        <>
            <button
                type="button"
                className={className}
                aria-label={`${saved ? 'ลบ' : 'บันทึก'} ${name} ${saved ? 'ออกจาก' : 'ลง'}รายการโปรด`}
                aria-pressed={saved}
                onClick={() => {
                    if (!auth.user) {
                        setSignIn(true);
                        return;
                    }
                    if (wishlist.toggle(productId))
                        toast.success(
                            saved
                                ? 'นำออกจากรายการโปรดแล้ว'
                                : 'บันทึกไว้ในรายการโปรดแล้ว',
                        );
                    else toast.error('บันทึกไม่ได้ กรุณาตรวจสอบพื้นที่จัดเก็บเบราว์เซอร์');
                }}
            >
                <Heart size={18} fill={saved ? 'currentColor' : 'none'} />
            </button>
            <Dialog open={signIn} onOpenChange={setSignIn}>
                <DialogContent className="flower-dialog">
                    <DialogHeader>
                        <DialogTitle>เก็บช่อที่ชอบไว้ด้วยกัน</DialogTitle>
                        <DialogDescription>
                            เข้าสู่ระบบเพื่อบันทึกสินค้าในรายการโปรดของคุณ
                        </DialogDescription>
                    </DialogHeader>
                    <Button
                        asChild
                        className="bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)]"
                    >
                        <Link href={login()}>เข้าสู่ระบบ</Link>
                    </Button>
                </DialogContent>
            </Dialog>
        </>
    );
}
