import { Head, Link } from '@inertiajs/react';
import { ArrowRight, Heart, Star, Trash2 } from 'lucide-react';
import { StoreFooter, StoreHeader } from '@/components/store/store-chrome';
import { Button } from '@/components/ui/button';
import { useWishlist } from '@/hooks/use-wishlist';
import '../../css/homepage.css';
type WishlistItem = {
    id: number;
    name: string;
    description: string;
    price: string;
    stock: number;
    picture_path: string;
    average_rating: string | null;
    rating_count: number | null;
};

export default function Wishlist({ items }: { items: WishlistItem[] }) {
    const wishlist = useWishlist();
    const primary =
        'h-11 rounded-full bg-[var(--accent)] text-[var(--on-accent)] hover:bg-[var(--accent-hover)]';
    return (
        <div className="flower-home">
            <Head title="รายการโปรด — My Flower Shop" />
            <StoreHeader current="wishlist" />
            <main className="flower-container min-h-[65vh] py-8 md:py-12">
                <nav
                    aria-label="เส้นทางหน้า"
                    className="mb-7 flex gap-2 text-xs text-[var(--muted)]"
                >
                    <Link href="/">หน้าแรก</Link>
                    <span>/</span>
                    <span aria-current="page">รายการโปรด</span>
                </nav>
                <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <p className="flower-eyebrow">
                            SAVED WITH A LITTLE LOVE
                        </p>
                        <h1 className="mt-2 text-3xl font-bold md:text-4xl">
                            ช่อโปรดที่เก็บไว้ในใจ
                        </h1>
                        <p
                            role="status"
                            className="mt-3 text-sm text-[var(--muted)]"
                        >
                            {items.length} ช่อที่คุณชอบ พร้อมกลับมาเลือกได้เสมอ
                        </p>
                    </div>
                    <Link href="/products" className="flower-text-link">
                        เลือกชมทุกช่อ <ArrowRight size={16} />
                    </Link>
                </div>
                {items.length === 0 ? (
                    <section className="flex flex-col items-center rounded-2xl border border-[var(--border)] px-5 py-16 text-center">
                        <span className="mb-5 grid size-20 place-items-center rounded-full bg-[var(--rose)] text-[var(--accent)]">
                            <Heart size={34} strokeWidth={1.3} />
                        </span>
                        <h2 className="text-2xl">ยังไม่มีช่อโปรด</h2>
                        <p className="mt-3 mb-7 text-sm text-[var(--muted)]">
                            กดหัวใจบนช่อดอกไม้ที่ชอบ แล้วกลับมาเลือกได้ที่นี่
                        </p>
                        <Button asChild className={`${primary} px-7`}>
                            <Link href="/products">
                                ค้นหาช่อที่ใช่ <ArrowRight size={17} />
                            </Link>
                        </Button>
                    </section>
                ) : (
                    <div className="grid grid-cols-1 gap-7 min-[380px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {items.map((item) => (
                            <article key={item.id} className="min-w-0">
                                <Link
                                    href={`/products/${item.id}`}
                                    className="group relative block aspect-[4/5] overflow-hidden rounded-xl bg-[var(--rose-soft)]"
                                >
                                    <img
                                        src={
                                            item.picture_path.startsWith('/')
                                                ? item.picture_path
                                                : `/storage/${item.picture_path}`
                                        }
                                        alt={item.name}
                                        loading="lazy"
                                        className="h-full w-full object-cover transition-transform group-hover:scale-105 motion-reduce:transition-none"
                                    />
                                    {!item.stock && (
                                        <span className="absolute bottom-3 left-3 rounded-full bg-[var(--cream)] px-3 py-1 text-xs">
                                            สินค้าหมด
                                        </span>
                                    )}
                                </Link>
                                <div className="mt-4 flex items-center justify-between gap-2">
                                    <span className="text-xs text-[var(--muted)]">
                                        FL{String(item.id).padStart(3, '0')}
                                    </span>
                                    <span className="flex items-center gap-1 text-xs text-[var(--accent)]">
                                        <Star
                                            size={12}
                                            fill={
                                                item.rating_count
                                                    ? 'currentColor'
                                                    : 'none'
                                            }
                                        />
                                        {item.rating_count
                                            ? `${Number(item.average_rating ?? 0).toFixed(1)} (${item.rating_count})`
                                            : 'ยังไม่มีคะแนน'}
                                    </span>
                                </div>
                                <Link href={`/products/${item.id}`}>
                                    <h2 className="mt-2 text-base">
                                        {item.name}
                                    </h2>
                                    <p className="mt-1 text-xs text-[var(--muted)]">
                                        {item.description}
                                    </p>
                                </Link>
                                <p className="mt-3 text-lg font-bold text-[var(--accent)]">
                                    ฿
                                    {Number(item.price).toLocaleString('th-TH')}
                                </p>
                                <Button
                                    asChild
                                    className={`${primary} mt-4 w-full`}
                                >
                                    <Link href={`/products/${item.id}`}>
                                        ดูสินค้า
                                    </Link>
                                </Button>
                                <Button
                                    variant="ghost"
                                    className="mt-1 w-full text-xs text-[var(--muted)] hover:bg-[var(--rose-soft)]"
                                    aria-label={`ลบ ${item.name} ออกจากรายการโปรด`}
                                    disabled={wishlist.pending}
                                    onClick={() => wishlist.remove(item.id)}
                                >
                                    <Trash2 size={14} /> ลบออกจากรายการโปรด
                                </Button>
                            </article>
                        ))}
                    </div>
                )}
            </main>
            <StoreFooter />
        </div>
    );
}
