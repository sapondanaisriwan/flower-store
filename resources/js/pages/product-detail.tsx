import { WishlistButton } from '@/components/store/wishlist-button';
import { useCart } from '@/hooks/use-cart';
import { toast } from 'sonner';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    ArrowRight,
    Check,
    Minus,
    Plus,
    ShoppingBag,
    Star,
    Truck,
    ZoomIn,
} from 'lucide-react';
import { useState } from 'react';
import { StoreFooter, StoreHeader } from '@/components/store/store-chrome';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { catalog, type CatalogProduct } from '@/data/catalog';
import { login, register } from '@/routes';
import '../../css/homepage.css';

export default function ProductDetail({ productId }: { productId: number }) {
    const product = catalog.find((item) => item.id === productId);
    if (!product)
        return (
            <div className="flower-home">
                <Head title="ไม่พบสินค้า" />
                <StoreHeader current="products" />
                <main className="flower-container py-24 text-center">
                    <h1 className="mb-6 text-3xl">ไม่พบช่อดอกไม้นี้</h1>
                    <Link className="flower-cta" href="/products">
                        กลับไปเลือกสินค้า
                    </Link>
                </main>
                <StoreFooter />
            </div>
        );
    return <ProductView key={product.id} product={product} />;
}
function ProductView({ product }: { product: CatalogProduct }) {
    const { auth } = usePage().props;
    const cart = useCart(auth.user?.id);
    const [quantity, setQuantity] = useState(product.stock ? '1' : '0');
    const [zoom, setZoom] = useState(false);
    const [action, setAction] = useState<string | null>(null);
    const amount = Number(quantity);
    const validQuantity =
        quantity.trim() !== '' &&
        Number.isInteger(amount) &&
        amount >= 1 &&
        amount <= product.stock;
    const isAdmin = auth.user?.role === 'admin';
    const color = { pink: 'ชมพู & พีช', white: 'ขาวครีม', red: 'แดงไวน์' }[
        product.color
    ];
    const related = catalog
        .filter((item) => item.id !== product.id)
        .slice(0, 3);
    const primary =
        'h-12 rounded-full bg-[var(--accent)] px-6 text-[var(--on-accent)] hover:bg-[var(--accent-hover)]';
    const changeQuantity = (delta: number) =>
        setQuantity(
            String(
                Math.min(
                    product.stock,
                    Math.max(
                        1,
                        (Number.isFinite(amount) ? Math.trunc(amount) : 1) +
                            delta,
                    ),
                ),
            ),
        );
    return (
        <div className="flower-home">
            <Head title={`${product.name} — My Flower Shop`}>
                <meta
                    name="description"
                    content={`${product.thai} ช่อดอกไม้ปลอมสำเร็จรูป ราคา ${product.price} บาท จัดส่งฟรีทั่วประเทศ`}
                />
            </Head>
            <StoreHeader current="products" />
            <main className="flower-container py-6 md:py-9">
                <nav
                    aria-label="เส้นทางหน้า"
                    className="mb-7 flex flex-wrap items-center gap-2 text-xs text-[var(--muted)]"
                >
                    <Link href="/">หน้าแรก</Link>
                    <span>/</span>
                    <Link href="/products">ช่อดอกไม้ทั้งหมด</Link>
                    <span>/</span>
                    <span aria-current="page" className="text-[var(--ink)]">
                        {product.name}
                    </span>
                </nav>
                <div className="grid min-w-0 gap-8 lg:grid-cols-2 lg:gap-16">
                    <section aria-label="ภาพสินค้า" className="min-w-0">
                        <button
                            onClick={() => setZoom(true)}
                            aria-label={`ขยายภาพ ${product.thai}`}
                            className="group relative block aspect-[4/5] w-full overflow-hidden rounded-xl bg-[var(--rose-soft)]"
                        >
                            <img
                                src="/images/homepage/bouquets.png"
                                alt={product.thai}
                                style={{ objectPosition: product.position }}
                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none"
                                fetchPriority="high"
                            />
                            <span className="absolute top-4 left-4 rounded-full bg-[var(--cream)] px-3 py-1 text-xs">
                                ช่อดอกไม้ปลอม
                            </span>
                            <span className="absolute right-4 bottom-4 flex items-center gap-2 rounded-full bg-[var(--cream)] px-3 py-2 text-xs">
                                <ZoomIn size={16} /> ขยายภาพ
                            </span>
                        </button>
                        <p className="mt-3 text-xs leading-relaxed text-[var(--muted)]">
                            ภาพประกอบตัวอย่าง · สินค้า ราคา คะแนน
                            และสต็อกในหน้านี้เป็นข้อมูลสาธิต
                        </p>
                    </section>
                    <section
                        aria-labelledby="product-title"
                        className="min-w-0 py-2"
                    >
                        <p className="flower-eyebrow">
                            A LITTLE BOUQUET. A LOT OF LOVE.
                        </p>
                        <p className="mt-5 text-xs text-[var(--muted)]">
                            รหัสสินค้า FL{String(product.id).padStart(3, '0')}
                        </p>
                        <h1
                            id="product-title"
                            className="mt-2 text-3xl leading-tight font-bold md:text-4xl"
                        >
                            {product.name}
                        </h1>
                        <p className="mt-3 text-lg text-[var(--muted)]">
                            {product.thai}
                        </p>
                        <a
                            href="#product-rating"
                            className="mt-4 inline-flex items-center gap-2 text-sm text-[var(--accent)]"
                        >
                            <Star
                                size={17}
                                fill={product.count ? 'currentColor' : 'none'}
                            />
                            {product.count
                                ? `${product.rating.toFixed(1)} / 5 · ${product.count} คนให้คะแนน`
                                : 'ยังไม่มีคะแนน'}
                        </a>
                        <div className="my-6 flex items-baseline gap-3">
                            <strong className="text-3xl text-[var(--accent)]">
                                ฿{product.price.toLocaleString('th-TH')}
                            </strong>
                            <span className="text-sm text-[var(--muted)]">
                                ต่อช่อ
                            </span>
                        </div>
                        <p className="border-t border-[var(--border)] pt-6 text-sm leading-8 text-[var(--muted)]">
                            {product.thai} จัดเป็นช่อสำเร็จรูปสำหรับมอบให้คนสำคัญ
                            หรือเติมความสดใสให้มุมโปรดของคุณ เก็บความรู้สึกดี ๆ
                            ไว้ได้นานด้วยดอกไม้ปลอมที่ไม่ต้องรดน้ำ
                        </p>
                        <dl className="my-6 grid grid-cols-[100px_1fr] gap-y-3 text-sm">
                            <dt className="text-[var(--muted)]">โทนสี</dt>
                            <dd>{color}</dd>
                            <dt className="text-[var(--muted)]">ประเภท</dt>
                            <dd>ช่อดอกไม้ปลอมสำเร็จรูป</dd>
                            <dt className="text-[var(--muted)]">สินค้าคงเหลือ</dt>
                            <dd className="flex items-center gap-1 text-[var(--accent)]">
                                {product.stock > 0 && <Check size={15} />}
                                {product.stock > 0
                                    ? `${product.stock} ช่อ`
                                    : 'สินค้าหมดชั่วคราว'}
                            </dd>
                        </dl>
                        {!isAdmin ? (
                            <div className="border-t border-[var(--border)] pt-6">
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <label
                                        htmlFor="quantity"
                                        className="text-sm"
                                    >
                                        จำนวน
                                    </label>
                                    <div className="flex items-center gap-1 rounded-lg border border-[var(--border)] p-1">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            disabled={
                                                !product.stock || amount <= 1
                                            }
                                            onClick={() => changeQuantity(-1)}
                                            aria-label="ลดจำนวน"
                                        >
                                            <Minus size={16} />
                                        </Button>
                                        <Input
                                            id="quantity"
                                            type="number"
                                            inputMode="numeric"
                                            min={product.stock ? 1 : 0}
                                            max={product.stock}
                                            step={1}
                                            disabled={!product.stock}
                                            value={quantity}
                                            aria-invalid={
                                                product.stock > 0 &&
                                                !validQuantity
                                            }
                                            aria-describedby="quantity-help"
                                            onChange={(event) =>
                                                setQuantity(event.target.value)
                                            }
                                            className="h-10 w-16 border-0 bg-transparent text-center text-[var(--ink)] shadow-none dark:bg-transparent"
                                        />
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            disabled={
                                                !product.stock ||
                                                amount >= product.stock
                                            }
                                            onClick={() => changeQuantity(1)}
                                            aria-label="เพิ่มจำนวน"
                                        >
                                            <Plus size={16} />
                                        </Button>
                                    </div>
                                </div>
                                <p
                                    id="quantity-help"
                                    className="mt-2 text-xs text-[var(--muted)]"
                                    role="status"
                                >
                                    {!product.stock
                                        ? 'ขณะนี้ยังไม่สามารถสั่งซื้อสินค้านี้ได้'
                                        : !validQuantity
                                          ? `กรุณาเลือกจำนวนเต็มตั้งแต่ 1–${product.stock} ช่อ`
                                          : `รวม ฿${(amount * product.price).toLocaleString('th-TH')} · จัดส่งฟรี`}
                                </p>
                                <div className="mt-5 grid grid-cols-[1fr_auto] gap-3">
                                    <Button
                                        className={primary}
                                        disabled={
                                            !validQuantity || !product.stock
                                        }
                                        onClick={() => {
                                            if (!auth.user) {
                                                setAction('เพิ่มลงตะกร้า');
                                                return;
                                            }
                                            if (isAdmin || !validQuantity)
                                                return;
                                            const result = cart.add(
                                                product.id,
                                                amount,
                                            );
                                            if (result === 'ok')
                                                toast.success(
                                                    'เพิ่มลงตะกร้าทดลองแล้ว',
                                                    {
                                                        description:
                                                            'บันทึกในเบราว์เซอร์นี้ ยังไม่มีการสั่งซื้อ',
                                                    },
                                                );
                                            else
                                                toast.error(
                                                    result === 'stock'
                                                        ? 'จำนวนรวมในตะกร้าเกินสินค้าคงเหลือ'
                                                        : 'บันทึกไม่ได้ กรุณาตรวจสอบพื้นที่จัดเก็บเบราว์เซอร์',
                                                );
                                        }}
                                    >
                                        <ShoppingBag size={18} /> เพิ่มลงตะกร้า
                                    </Button>
                                    <WishlistButton
                                        productId={product.id}
                                        name={product.thai}
                                        className="grid h-12 w-12 place-items-center rounded-full border border-[var(--border)] text-[var(--accent)] hover:bg-[var(--rose-soft)]"
                                    />
                                </div>
                                <p className="mt-3 text-xs text-[var(--muted)]">
                                    {auth.user
                                        ? 'ตะกร้าทดลองบันทึกในเบราว์เซอร์ ยังไม่เปิดรับคำสั่งซื้อ'
                                        : 'เข้าสู่ระบบเพื่อเพิ่มสินค้าในตะกร้าหรือรายการโปรด'}
                                </p>
                            </div>
                        ) : (
                            <p className="rounded-lg bg-[var(--rose-soft)] p-4 text-sm">
                                บัญชีผู้ดูแลร้านดูรายละเอียดสินค้าได้
                                แต่ไม่สามารถสั่งซื้อหรือให้คะแนน
                            </p>
                        )}
                        <div className="mt-6 flex items-center gap-3 rounded-lg bg-[var(--rose-soft)] p-4">
                            <Truck
                                size={23}
                                className="shrink-0 text-[var(--accent)]"
                            />
                            <div>
                                <p className="text-sm">ส่งฟรีทั่วประเทศ</p>
                                <p className="text-xs text-[var(--muted)]">
                                    ทุกช่อ ทุกคำสั่งซื้อ
                                </p>
                            </div>
                        </div>
                        <Link
                            href="/products"
                            className="flower-text-link mt-5"
                        >
                            <ArrowLeft size={16} /> กลับไปเลือกสินค้า
                        </Link>
                    </section>
                </div>
                <div className="my-12 grid gap-8 border-y border-[var(--border)] py-8 md:grid-cols-2 md:gap-16">
                    <section>
                        <h2 className="mb-4 text-xl font-bold">
                            รายละเอียดและการดูแล
                        </h2>
                        <p className="text-sm leading-8 text-[var(--muted)]">
                            ช่อดอกไม้ปลอมสำเร็จรูป ไม่ต้องรดน้ำ แนะนำให้วางในที่แห้ง
                            หลีกเลี่ยงแสงแดดจัดและความชื้น ใช้แปรงขนนุ่มปัดฝุ่นเบา ๆ
                            เพื่อดูแลความสวยงามของช่อดอกไม้
                        </p>
                    </section>
                    <section id="product-rating" className="scroll-mt-6">
                        <h2 className="mb-4 text-xl font-bold">คะแนนสินค้า</h2>
                        <div className="flex items-center gap-4">
                            <Star
                                size={32}
                                className="text-[var(--accent)]"
                                fill={product.count ? 'currentColor' : 'none'}
                            />
                            <div>
                                <strong className="text-3xl">
                                    {product.count
                                        ? product.rating.toFixed(1)
                                        : '—'}
                                </strong>
                                <span className="ml-2 text-sm text-[var(--muted)]">
                                    / 5
                                </span>
                                <p className="mt-1 text-xs text-[var(--muted)]">
                                    {product.count
                                        ? `จากผู้ให้คะแนน ${product.count} คน · คะแนนตัวอย่าง`
                                        : 'ยังไม่มีผู้ให้คะแนนสินค้านี้'}
                                </p>
                            </div>
                        </div>
                        <p className="mt-5 text-xs leading-6 text-[var(--muted)]">
                            ลูกค้าให้ดาวได้เมื่อคำสั่งซื้อจัดส่งแล้ว ผ่านหน้าประวัติคำสั่งซื้อ
                            โดยไม่มีข้อความรีวิว
                        </p>
                    </section>
                </div>
                <section className="pb-12">
                    <div className="mb-6 flex items-center justify-between gap-4">
                        <h2 className="text-xl font-bold">อีกช่อที่คุณอาจชอบ</h2>
                        <Link href="/products" className="flower-text-link">
                            ดูทั้งหมด <ArrowRight size={16} />
                        </Link>
                    </div>
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6">
                        {related.map((item) => (
                            <Link
                                key={item.id}
                                href={`/products/${item.id}`}
                                className="group min-w-0"
                            >
                                <div className="aspect-[4/3] overflow-hidden rounded-lg bg-[var(--rose-soft)]">
                                    <img
                                        loading="lazy"
                                        src="/images/homepage/bouquets.png"
                                        alt={item.thai}
                                        style={{
                                            objectPosition: item.position,
                                        }}
                                        className="h-full w-full object-cover transition-transform group-hover:scale-105 motion-reduce:transition-none"
                                    />
                                </div>
                                <h3 className="mt-3 text-sm md:text-base">
                                    {item.name}
                                </h3>
                                <p className="text-xs text-[var(--muted)]">
                                    {item.thai}
                                </p>
                                <p className="mt-2 font-bold text-[var(--accent)]">
                                    ฿{item.price.toLocaleString('th-TH')}
                                </p>
                            </Link>
                        ))}
                    </div>
                </section>
            </main>
            <StoreFooter />
            <Dialog open={zoom} onOpenChange={setZoom}>
                <DialogContent className="flower-dialog sm:max-w-4xl">
                    <DialogHeader>
                        <DialogTitle>{product.name}</DialogTitle>
                        <DialogDescription>ภาพประกอบสินค้า</DialogDescription>
                    </DialogHeader>
                    <img
                        src="/images/homepage/bouquets.png"
                        alt={product.thai}
                        className="max-h-[70dvh] w-full rounded-md object-contain"
                    />
                </DialogContent>
            </Dialog>
            <Dialog
                open={action !== null}
                onOpenChange={(open) => {
                    if (!open) setAction(null);
                }}
            >
                <DialogContent className="flower-dialog">
                    <DialogHeader>
                        <DialogTitle>
                            {auth.user
                                ? 'กำลังเตรียมร้านให้พร้อม'
                                : 'เข้าสู่ระบบเพื่อเลือกช่อที่ชอบ'}
                        </DialogTitle>
                        <DialogDescription>
                            {auth.user
                                ? `ยังไม่สามารถ${action}ได้ เนื่องจากยังไม่ได้เชื่อมต่อระบบร้านค้า ไม่มีการบันทึกหรือสั่งซื้อสินค้า`
                                : `กรุณาเข้าสู่ระบบเพื่อ${action}`}
                        </DialogDescription>
                    </DialogHeader>
                    {!auth.user && (
                        <div className="flex flex-wrap items-center gap-4">
                            <Button asChild className={primary}>
                                <Link href={login()}>
                                    เข้าสู่ระบบ <ArrowRight size={17} />
                                </Link>
                            </Button>
                            <Link
                                href={register()}
                                className="flower-text-link"
                            >
                                สมัครสมาชิก
                            </Link>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
