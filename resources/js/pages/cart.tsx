import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    ArrowRight,
    Flower2,
    Minus,
    Plus,
    ShoppingBag,
    Trash2,
    Truck,
} from 'lucide-react';
import { useState } from 'react';
import { StoreFooter, StoreHeader } from '@/components/store/store-chrome';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { catalog } from '@/data/catalog';
import { useCart } from '@/hooks/use-cart';
import '../../css/homepage.css';

export default function Cart() {
    const { auth } = usePage().props;
    const cart = useCart(auth.user?.id);
    const [removeId, setRemoveId] = useState<number | null>(null);
    const [error, setError] = useState('');
    const items = cart.lines.flatMap((line) => {
        const product = catalog.find((item) => item.id === line.id);
        return product ? [{ ...product, quantity: line.quantity }] : [];
    });
    const total = items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
    );
    const unavailable = items.some(
        (item) => item.stock === 0 || item.quantity < 1,
    );
    const money = (value: number) => `฿${value.toLocaleString('th-TH')}`;
    const primary =
        'h-12 rounded-full bg-[var(--accent)] px-6 text-[var(--on-accent)] hover:bg-[var(--accent-hover)]';
    const update = (id: number, quantity: number) =>
        setError(
            cart.update(id, quantity)
                ? ''
                : 'ไม่สามารถบันทึกจำนวนได้ กรุณาตรวจสอบพื้นที่จัดเก็บของเบราว์เซอร์',
        );
    return (
        <div className="flower-home">
            <Head title="ตะกร้าสินค้า — My Flower Shop" />
            <StoreHeader current="cart" />
            <main className="flower-container min-h-[60vh] py-8 md:py-12">
                <nav
                    aria-label="เส้นทางหน้า"
                    className="mb-7 flex gap-2 text-xs text-[var(--muted)]"
                >
                    <Link href="/">หน้าแรก</Link>
                    <span>/</span>
                    <span aria-current="page">ตะกร้าสินค้า</span>
                </nav>
                <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <p className="flower-eyebrow">
                            A LITTLE CLOSER TO HAPPINESS
                        </p>
                        <h1 className="mt-2 text-3xl font-bold md:text-4xl">
                            ช่อที่คุณเลือกไว้
                        </h1>
                        <p
                            className="mt-3 text-sm text-[var(--muted)]"
                            role="status"
                        >
                            {items.length} รายการ · {cart.count} ช่อ
                        </p>
                    </div>
                    <Link className="flower-text-link" href="/products">
                        <ArrowLeft size={16} /> เลือกซื้อสินค้าต่อ
                    </Link>
                </div>
                <p className="mb-6 rounded-lg bg-[var(--rose-soft)] px-4 py-3 text-xs leading-6 text-[var(--muted)]">
                    ตะกร้าทดลองสำหรับข้อมูลสินค้าตัวอย่าง บันทึกเฉพาะบัญชีนี้ในเบราว์เซอร์ที่ใช้อยู่
                    ยังไม่เปิดรับคำสั่งซื้อ
                </p>
                {error && (
                    <p role="alert" className="mb-4 text-sm text-red-700">
                        {error}
                    </p>
                )}
                {items.length === 0 ? (
                    <section className="flex flex-col items-center rounded-2xl border border-[var(--border)] px-5 py-16 text-center">
                        <span className="mb-6 grid size-20 place-items-center rounded-full bg-[var(--rose)] text-[var(--accent)]">
                            <ShoppingBag size={32} strokeWidth={1.3} />
                        </span>
                        <h2 className="text-2xl">ยังไม่มีช่อดอกไม้ในตะกร้า</h2>
                        <p className="mt-3 mb-7 text-sm text-[var(--muted)]">
                            เริ่มจากช่อที่คุณชอบ แล้วส่งความรู้สึกดี ๆ ให้คนสำคัญ
                        </p>
                        <Button asChild className={primary}>
                            <Link href="/products">
                                เลือกช่อดอกไม้ <ArrowRight size={17} />
                            </Link>
                        </Button>
                    </section>
                ) : (
                    <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
                        <section
                            aria-label="รายการสินค้าในตะกร้า"
                            className="min-w-0"
                        >
                            <div className="hidden grid-cols-[1fr_140px_110px] gap-4 border-b border-[var(--border)] pb-4 text-xs text-[var(--muted)] md:grid">
                                <span>สินค้า</span>
                                <span className="text-center">จำนวน</span>
                                <span className="text-right">ราคารวม</span>
                            </div>
                            {items.map((item) => (
                                <article
                                    key={item.id}
                                    className="grid grid-cols-[88px_minmax(0,1fr)] items-center gap-4 border-b border-[var(--border)] py-6 md:grid-cols-[100px_minmax(0,1fr)_140px_110px]"
                                >
                                    <Link href={`/products/${item.id}`}>
                                        <img
                                            className="aspect-[4/5] w-full rounded-lg object-cover"
                                            style={{
                                                objectPosition: item.position,
                                            }}
                                            src="/images/homepage/bouquets.png"
                                            alt={item.thai}
                                        />
                                    </Link>
                                    <div className="min-w-0">
                                        <Link href={`/products/${item.id}`}>
                                            <h2 className="text-base md:text-lg">
                                                {item.name}
                                            </h2>
                                            <p className="mt-1 text-xs text-[var(--muted)]">
                                                {item.thai}
                                            </p>
                                        </Link>
                                        <p className="mt-2 text-sm">
                                            {money(item.price)}{' '}
                                            <span className="text-xs text-[var(--muted)]">
                                                / ช่อ
                                            </span>
                                        </p>
                                        <p className="mt-1 text-xs text-[var(--muted)]">
                                            {item.stock
                                                ? `คงเหลือ ${item.stock} ช่อ`
                                                : 'สินค้าหมด กรุณาลบออกก่อนดำเนินการต่อ'}
                                        </p>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="mt-1 h-9 px-0 text-xs text-[var(--muted)] hover:bg-transparent hover:text-red-700"
                                            aria-label={`ลบ ${item.name}`}
                                            onClick={() => setRemoveId(item.id)}
                                        >
                                            <Trash2 size={13} /> ลบสินค้า
                                        </Button>
                                    </div>
                                    <div className="col-start-2 flex w-fit items-center rounded-lg border border-[var(--border)] md:col-start-auto md:justify-self-center">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="size-10"
                                            aria-label={`ลดจำนวน ${item.name}`}
                                            disabled={
                                                item.quantity <= 1 ||
                                                !item.stock
                                            }
                                            onClick={() =>
                                                update(
                                                    item.id,
                                                    item.quantity - 1,
                                                )
                                            }
                                        >
                                            <Minus size={15} />
                                        </Button>
                                        <output
                                            aria-label={`จำนวน ${item.name}`}
                                            className="min-w-8 text-center text-sm"
                                            aria-live="polite"
                                        >
                                            {item.quantity}
                                        </output>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="size-10"
                                            aria-label={`เพิ่มจำนวน ${item.name}`}
                                            disabled={
                                                item.quantity >= item.stock
                                            }
                                            onClick={() =>
                                                update(
                                                    item.id,
                                                    item.quantity + 1,
                                                )
                                            }
                                        >
                                            <Plus size={15} />
                                        </Button>
                                    </div>
                                    <strong className="col-start-2 text-lg text-[var(--accent)] md:col-start-auto md:text-right">
                                        {money(item.price * item.quantity)}
                                    </strong>
                                </article>
                            ))}
                        </section>
                        <aside
                            className="rounded-2xl border border-[var(--border)] bg-[var(--rose-soft)] p-6 lg:sticky lg:top-6"
                            aria-label="สรุปคำสั่งซื้อ"
                        >
                            <h2 className="mb-6 text-xl font-bold">
                                สรุปคำสั่งซื้อ
                            </h2>
                            <dl className="space-y-4 text-sm">
                                <div className="flex justify-between gap-3">
                                    <dt>ราคาสินค้า ({cart.count} ช่อ)</dt>
                                    <dd>{money(total)}</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt>ค่าจัดส่ง</dt>
                                    <dd className="text-[var(--accent)]">ฟรี</dd>
                                </div>
                                <div className="flex justify-between border-t border-[var(--border)] pt-5">
                                    <dt className="font-bold">ยอดรวมทั้งหมด</dt>
                                    <dd
                                        className="text-2xl font-bold text-[var(--accent)]"
                                        aria-live="polite"
                                    >
                                        {money(total)}
                                    </dd>
                                </div>
                            </dl>
                            <Button
                                className={`${primary} mt-6 w-full`}
                                disabled={unavailable}
                                onClick={() => router.visit('/checkout')}
                            >
                                ดำเนินการสั่งซื้อ <ArrowRight size={17} />
                            </Button>
                            {unavailable && (
                                <p className="mt-3 text-xs text-red-700">
                                    กรุณาลบสินค้าที่หมดออกจากตะกร้า
                                </p>
                            )}
                            <p className="mt-3 text-center text-xs text-[var(--muted)]">
                                ไปกรอกข้อมูลจัดส่งและทดลอง Checkout
                            </p>
                            <div className="mt-6 flex items-center gap-3 border-t border-[var(--border)] pt-5 text-[var(--accent)]">
                                <Truck size={21} />
                                <span className="text-xs">
                                    จัดส่งฟรีทุกคำสั่งซื้อ ทั่วประเทศ
                                </span>
                            </div>
                        </aside>
                    </div>
                )}
                <div className="mt-12 flex items-center justify-center gap-2 text-xs text-[var(--muted)]">
                    <Flower2 size={18} /> ทุกช่อที่เลือก มีความรู้สึกดี ๆ อยู่ข้างใน
                </div>
            </main>
            <StoreFooter />
            <Dialog
                open={removeId !== null}
                onOpenChange={(open) => {
                    if (!open) setRemoveId(null);
                }}
            >
                <DialogContent className="flower-dialog">
                    <DialogHeader>
                        <DialogTitle>ลบสินค้าจากตะกร้า?</DialogTitle>
                        <DialogDescription>
                            นำ{' '}
                            {catalog.find((item) => item.id === removeId)?.name}{' '}
                            ออกจากตะกร้า คุณสามารถกลับมาเพิ่มใหม่ได้
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end gap-3">
                        <Button
                            variant="outline"
                            onClick={() => setRemoveId(null)}
                        >
                            เก็บไว้ก่อน
                        </Button>
                        <Button
                            className={primary}
                            onClick={() => {
                                if (removeId !== null)
                                    setError(
                                        cart.remove(removeId)
                                            ? ''
                                            : 'ไม่สามารถบันทึกตะกร้าได้ กรุณาลองอีกครั้ง',
                                    );
                                setRemoveId(null);
                            }}
                        >
                            ลบสินค้า
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
