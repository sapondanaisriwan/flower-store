import { useState } from 'react';
import { Button } from '@/components/ui/button';
import InputError from '@/components/input-error';
import { Link, useForm } from '@inertiajs/react';
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

export function PurchasedOrderItems({
    items,
    orderId,
    status,
}: {
    items: PurchasedProduct[];
    orderId: number;
    status: string;
}) {
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
                        {['delivered', 'success'].includes(status) ? (
                            <PurchaseRating
                                key={String(item.rating)}
                                orderId={orderId}
                                item={item}
                            />
                        ) : (
                            <p className="mt-3 text-xs text-[var(--muted)]">
                                ให้คะแนนได้เมื่อจัดส่งสำเร็จ
                            </p>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}

function PurchaseRating({
    orderId,
    item,
}: {
    orderId: number;
    item: PurchasedProduct;
}) {
    const [editing, setEditing] = useState(item.rating == null);
    const form = useForm({ rating: item.rating ?? 0 });
    if (!editing)
        return (
            <div className="mt-3 flex items-center gap-2 text-[var(--accent)]">
                <span
                    aria-label={item.rating + ' จาก 5 ดาว'}
                    className="flex gap-1"
                >
                    {[1, 2, 3, 4, 5].map((value) => (
                        <Star
                            key={value}
                            size={16}
                            fill={
                                value <= (item.rating ?? 0)
                                    ? 'currentColor'
                                    : 'none'
                            }
                        />
                    ))}
                </span>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditing(true)}
                >
                    แก้ไขคะแนน
                </Button>
            </div>
        );
    return (
        <form
            className="mt-3 space-y-2"
            onSubmit={(event) => {
                event.preventDefault();
                form.put(
                    '/orders/' +
                        orderId +
                        '/products/' +
                        item.product_id +
                        '/rating',
                    {
                        preserveScroll: true,
                        onSuccess: () => setEditing(false),
                    },
                );
            }}
        >
            <fieldset disabled={form.processing}>
                <legend className="text-xs text-[var(--muted)]">
                    ให้คะแนน {item.product_name}
                </legend>
                <div className="flex flex-wrap items-center gap-1">
                    {[1, 2, 3, 4, 5].map((value) => (
                        <label
                            key={value}
                            className="cursor-pointer p-2 text-[var(--accent)]"
                        >
                            <input
                                type="radio"
                                name="rating"
                                value={value}
                                checked={form.data.rating === value}
                                onChange={() => form.setData('rating', value)}
                                className="peer sr-only"
                                aria-label={value + ' ดาว'}
                            />
                            <Star
                                size={20}
                                fill={
                                    value <= form.data.rating
                                        ? 'currentColor'
                                        : 'none'
                                }
                                className="peer-focus-visible:outline-2"
                            />
                        </label>
                    ))}
                    <Button
                        type="submit"
                        size="sm"
                        disabled={!form.data.rating || form.processing}
                        className="rounded-full bg-[var(--accent)] text-white"
                    >
                        {form.processing ? 'กำลังบันทึก…' : 'บันทึก'}
                    </Button>
                    {item.rating != null && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                form.reset();
                                form.clearErrors();
                                setEditing(false);
                            }}
                        >
                            ยกเลิก
                        </Button>
                    )}
                </div>
            </fieldset>
            <InputError message={form.errors.rating} />
        </form>
    );
}
