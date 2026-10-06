import { Link, usePage } from '@inertiajs/react';
import { Check, Star, Truck } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { type DemoOrder, money } from '@/data/orders';
import { useOrderRatings } from '@/hooks/use-order-ratings';
export function OrderStatus({ status }: { status: DemoOrder['status'] }) {
    return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--rose-soft)] px-3 py-1.5 text-xs text-[var(--accent)]">
            {status === 'delivered' ? <Check size={14} /> : <Truck size={14} />}
            {status === 'delivered' ? 'จัดส่งสำเร็จ' : 'ระหว่างจัดส่ง'}
        </span>
    );
}
function Rating({
    saved,
    name,
    onSave,
}: {
    saved: number;
    name: string;
    onSave: (rating: number) => boolean;
}) {
    const [editing, setEditing] = useState(false);
    const [value, setValue] = useState(saved);
    return (
        <div className="mt-3">
            {!saved || editing ? (
                <form
                    className="flex flex-wrap items-end gap-2"
                    onSubmit={(event) => {
                        event.preventDefault();
                        if (onSave(value)) {
                            setEditing(false);
                            toast.success('บันทึกคะแนนทดลองแล้ว');
                        } else toast.error('บันทึกไม่ได้ กรุณาลองใหม่');
                    }}
                >
                    <fieldset className="flex gap-1">
                        <legend className="mb-1 text-xs text-[var(--muted)]">
                            ให้คะแนน {name}
                        </legend>
                        {[1, 2, 3, 4, 5].map((star) => (
                            <label
                                key={star}
                                className="cursor-pointer rounded-full p-1.5 text-[var(--accent)] hover:bg-[var(--rose-soft)]"
                            >
                                <input
                                    type="radio"
                                    name="rating"
                                    value={star}
                                    checked={value === star}
                                    onChange={() => setValue(star)}
                                    className="peer sr-only"
                                    aria-label={star + ' ดาว'}
                                />
                                <Star
                                    size={20}
                                    fill={
                                        star <= value ? 'currentColor' : 'none'
                                    }
                                    className="rounded-sm peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4"
                                />
                            </label>
                        ))}
                    </fieldset>
                    <Button
                        type="submit"
                        disabled={!value}
                        size="sm"
                        className="rounded-full bg-[var(--accent)] text-[var(--on-accent)] hover:bg-[var(--accent-hover)]"
                    >
                        บันทึก
                    </Button>
                    {saved > 0 && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                setValue(saved);
                                setEditing(false);
                            }}
                        >
                            ยกเลิก
                        </Button>
                    )}
                </form>
            ) : (
                <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--accent)]">
                    <span
                        className="flex gap-1"
                        aria-label={'ให้คะแนนแล้ว ' + saved + ' จาก 5 ดาว'}
                    >
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                                key={star}
                                size={15}
                                aria-hidden="true"
                                fill={star <= saved ? 'currentColor' : 'none'}
                            />
                        ))}
                    </span>
                    <span>ให้คะแนนแล้ว</span>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-xs underline"
                        onClick={() => {
                            setValue(saved);
                            setEditing(true);
                        }}
                    >
                        แก้ไข
                    </Button>
                </div>
            )}
        </div>
    );
}
export function OrderItems({ order }: { order: DemoOrder }) {
    const { auth } = usePage().props;
    const { ratings, save } = useOrderRatings(auth.user?.id);
    return (
        <div className="divide-y divide-[var(--border)]">
            {order.items.map((item) => (
                <div key={item.id} className="flex gap-4 py-5 sm:gap-5">
                    <Link
                        href={'/products/' + item.id}
                        className="h-28 w-20 shrink-0 overflow-hidden rounded-lg bg-[var(--rose-soft)] sm:h-32 sm:w-28"
                    >
                        <img
                            src="/images/homepage/bouquets.png"
                            alt={item.thai}
                            style={{ objectPosition: item.position }}
                            className="h-full w-full object-cover"
                            loading="lazy"
                        />
                    </Link>
                    <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap justify-between gap-2">
                            <div>
                                <Link
                                    href={'/products/' + item.id}
                                    className="font-bold hover:underline"
                                >
                                    {item.name}
                                </Link>
                                <p className="mt-1 text-xs text-[var(--muted)]">
                                    {item.thai}
                                </p>
                            </div>
                            <p className="font-bold text-[var(--accent)]">
                                {money(item.price * item.quantity)}
                            </p>
                        </div>
                        <p className="mt-2 text-xs text-[var(--muted)]">
                            {money(item.price)} / ช่อ · จำนวน {item.quantity} ช่อ
                        </p>
                        {order.status === 'delivered' ? (
                            <Rating
                                name={item.name}
                                saved={ratings[order.id + ':' + item.id] ?? 0}
                                onSave={(value) =>
                                    save(order.id, item.id, value)
                                }
                            />
                        ) : (
                            <p className="mt-4 text-xs text-[var(--muted)]">
                                ให้คะแนนได้เมื่อจัดส่งสำเร็จ
                            </p>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
