import { Link } from '@inertiajs/react';
import { Check, Star, Truck } from 'lucide-react';
import {
    type PurchasedProduct,
    money,
    orderStatus,
    productImage,
} from '@/types/shop';

// ใช้หน้าตาการ์ดเดิมกับข้อมูลตอนซื้อ ไม่แตะฟอร์ม Rating ทดลองของเพื่อน
export function PurchasedOrderStatus({ status }: { status: string }) {
    return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--rose-soft)] px-3 py-1.5 text-xs text-[var(--accent)]">
            {['delivered', 'success'].includes(status) ? (
                <Check size={14} />
            ) : (
                <Truck size={14} />
            )}
            {orderStatus(status)}
        </span>
    );
}

export function PurchasedOrderItems({ items }: { items: PurchasedProduct[] }) {
    return (
        <div className="divide-y divide-[var(--border)]">
            {items.map((item) => (
                <div key={item.product_id} className="flex gap-4 py-5 sm:gap-5">
                    <Link
                        href={`/products/${item.product_id}`}
                        className="h-28 w-20 shrink-0 overflow-hidden rounded-lg bg-[var(--rose-soft)] sm:h-32 sm:w-28"
                    >
                        <img
                            src={productImage(item.picture_path)}
                            alt={item.product_name}
                            className="h-full w-full object-cover"
                            loading="lazy"
                        />
                    </Link>
                    <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap justify-between gap-2">
                            <Link
                                href={`/products/${item.product_id}`}
                                className="font-bold hover:underline"
                            >
                                {item.product_name}
                            </Link>
                            <p className="font-bold text-[var(--accent)]">
                                {money(
                                    Number(item.purchase_price) * item.quantity,
                                )}
                            </p>
                        </div>
                        <p className="mt-2 text-xs text-[var(--muted)]">
                            {money(item.purchase_price)} / ช่อ · จำนวน{' '}
                            {item.quantity} ช่อ
                        </p>
                        {item.rating != null && (
                            <span
                                className="mt-3 flex gap-1 text-[var(--accent)]"
                                aria-label={`คะแนน ${item.rating} จาก 5 ดาว`}
                            >
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                        key={star}
                                        size={15}
                                        fill={
                                            star <= item.rating!
                                                ? 'currentColor'
                                                : 'none'
                                        }
                                    />
                                ))}
                            </span>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
