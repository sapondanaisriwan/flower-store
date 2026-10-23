import { WishlistButton } from '@/components/store/wishlist-button';
import { catalog } from '@/data/catalog';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    ChevronLeft,
    ChevronRight,
    Flower2,
    Search,
    SlidersHorizontal,
    Star,
    X,
} from 'lucide-react';
import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { StoreFooter, StoreHeader } from '@/components/store/store-chrome';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { login } from '@/routes';
import '../../css/homepage.css';
import '../../css/products.css';

const colors = [
    { value: 'pink', label: 'ชมพู & พีช', hex: '#dca3b2' },
    { value: 'white', label: 'ขาวครีม', hex: '#fff9e9' },
    { value: 'red', label: 'แดงไวน์', hex: '#9a3b50' },
];
const prices = [
    { value: 'all', label: 'ทุกราคา', min: 0, max: Infinity },
    { value: 'under500', label: 'ต่ำกว่า ฿500', min: 0, max: 499 },
    { value: '500to999', label: '฿500 – ฿999', min: 500, max: 999 },
    { value: '1000plus', label: '฿1,000 ขึ้นไป', min: 1000, max: Infinity },
];
const PAGE_SIZE = 6;

export default function Products() {
    const { auth } = usePage().props;
    const { url } = usePage();
    const initialQuery =
        new URL(url, 'http://localhost').searchParams.get('q') ?? '';
    return (
        <ProductsContent
            key={initialQuery}
            initialQuery={initialQuery}
            isAdmin={auth.user?.role === 'admin'}
            loggedIn={Boolean(auth.user)}
        />
    );
}
function ProductsContent({
    initialQuery,
    isAdmin,
    loggedIn,
}: {
    initialQuery: string;
    isAdmin: boolean;
    loggedIn: boolean;
}) {
    const [query, setQuery] = useState(initialQuery);
    const [chosenColors, setChosenColors] = useState<string[]>([]);
    const [price, setPrice] = useState('all');
    const [rating, setRating] = useState('0');
    const [sort, setSort] = useState('recommended');
    const [page, setPage] = useState(1);
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [wishlistOpen, setWishlistOpen] = useState(false);
    const range = prices.find((item) => item.value === price) ?? prices[0];
    const filtered = catalog
        .filter(
            (item) =>
                `${item.name} ${item.thai}`
                    .toLowerCase()
                    .includes(query.trim().toLowerCase()) &&
                (!chosenColors.length || chosenColors.includes(item.color)) &&
                item.price >= range.min &&
                item.price <= range.max &&
                item.rating >= Number(rating),
        )
        .sort((a, b) =>
            sort === 'price-asc'
                ? a.price - b.price
                : sort === 'price-desc'
                  ? b.price - a.price
                  : sort === 'rating'
                    ? b.rating - a.rating
                    : a.id - b.id,
        );
    const pages = Math.ceil(filtered.length / PAGE_SIZE);
    const currentPage = Math.min(page, Math.max(1, pages));
    const shown = filtered.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE,
    );
    const activeCount =
        chosenColors.length + Number(price !== 'all') + Number(rating !== '0');
    const reset = () => {
        setQuery('');
        setChosenColors([]);
        setPrice('all');
        setRating('0');
        setPage(1);
    };
    const toggleColor = (color: string) => {
        setChosenColors((values) =>
            values.includes(color)
                ? values.filter((value) => value !== color)
                : [...values, color],
        );
        setPage(1);
    };
    const filters = (
        <div className="catalog-filter-content min-w-0">
            <div className="flex min-w-0 items-center justify-between gap-3 border-b border-[var(--border)] pb-4">
                <h2 className="text-base font-bold">ตัวกรองสินค้า</h2>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={reset}
                    className="shrink-0 text-xs text-[var(--muted)] hover:bg-[var(--rose-soft)]"
                >
                    ล้างทั้งหมด
                </Button>
            </div>
            <fieldset className="min-w-0 border-b border-[var(--border)] py-5">
                <legend className="sr-only">สีดอกไม้</legend>
                <p aria-hidden="true" className="mb-3 text-sm font-bold">
                    สีดอกไม้
                </p>
                <div className="grid min-w-0 gap-1">
                    {colors.map((color) => (
                        <label
                            key={color.value}
                            className="flex min-h-11 min-w-0 cursor-pointer items-center gap-3 rounded-md px-1 text-sm hover:bg-[var(--rose-soft)]"
                        >
                            <span
                                aria-hidden="true"
                                className="size-[18px] shrink-0 rounded-full border border-[#ba9ea6]"
                                style={{ backgroundColor: color.hex }}
                            />
                            <span className="min-w-0 flex-1">
                                {color.label}
                            </span>
                            <Checkbox
                                checked={chosenColors.includes(color.value)}
                                onCheckedChange={() => toggleColor(color.value)}
                                className="catalog-checkbox"
                            />
                        </label>
                    ))}
                </div>
            </fieldset>
            <fieldset className="min-w-0 border-b border-[var(--border)] py-5">
                <legend className="sr-only">ช่วงราคา</legend>
                <p aria-hidden="true" className="mb-3 text-sm font-bold">
                    ช่วงราคา
                </p>
                <div className="grid min-w-0 gap-1">
                    {prices.map((item) => (
                        <label
                            key={item.value}
                            className="flex min-h-11 min-w-0 cursor-pointer items-center gap-3 rounded-md px-1 text-sm hover:bg-[var(--rose-soft)]"
                        >
                            <span className="min-w-0 flex-1">{item.label}</span>
                            <input
                                className="catalog-radio size-4 shrink-0"
                                type="radio"
                                name={filtersOpen ? 'mobile-price' : 'price'}
                                value={item.value}
                                checked={price === item.value}
                                onChange={() => {
                                    setPrice(item.value);
                                    setPage(1);
                                }}
                            />
                        </label>
                    ))}
                </div>
            </fieldset>
            <fieldset className="min-w-0 border-b border-[var(--border)] py-5">
                <legend className="sr-only">คะแนนสินค้า</legend>
                <p aria-hidden="true" className="mb-3 text-sm font-bold">
                    คะแนนสินค้า
                </p>
                <div className="grid min-w-0 gap-1">
                    {[
                        { value: '0', label: 'ทุกคะแนน' },
                        { value: '1', label: '1 ดาวขึ้นไป' },
                        { value: '2', label: '2 ดาวขึ้นไป' },
                        { value: '3', label: '3 ดาวขึ้นไป' },
                        { value: '4', label: '4 ดาวขึ้นไป' },
                        { value: '5', label: '5 ดาว' },
                    ].map((item) => (
                        <label
                            key={item.value}
                            className="flex min-h-11 min-w-0 cursor-pointer items-center gap-3 rounded-md px-1 text-sm hover:bg-[var(--rose-soft)]"
                        >
                            <span className="flex min-w-0 flex-1 items-center gap-1">
                                {item.value !== '0' && (
                                    <Star
                                        className="shrink-0 text-[var(--accent)]"
                                        size={14}
                                    />
                                )}
                                {item.label}
                            </span>
                            <input
                                className="catalog-radio size-4 shrink-0"
                                type="radio"
                                name={filtersOpen ? 'mobile-rating' : 'rating'}
                                value={item.value}
                                checked={rating === item.value}
                                onChange={() => {
                                    setRating(item.value);
                                    setPage(1);
                                }}
                            />
                        </label>
                    ))}
                </div>
            </fieldset>
            <div className="catalog-filter-note">
                <Flower2 size={24} />
                <p>
                    ช่อเล็ก ๆ<br />
                    ความรู้สึกที่ยิ่งใหญ่
                </p>
                <small>จัดส่งฟรีทั่วประเทศ</small>
            </div>
        </div>
    );
    const turnPage = (next: number) => {
        setPage(next);
        document.getElementById('catalog-results')?.scrollIntoView({
            behavior: window.matchMedia('(prefers-reduced-motion: reduce)')
                .matches
                ? 'instant'
                : 'smooth',
            block: 'start',
        });
    };
    return (
        <div className="flower-home">
            <Head title="ช่อดอกไม้ทั้งหมด — My Flower Shop">
                <meta
                    name="description"
                    content="เลือกช่อดอกไม้ปลอมสำเร็จรูป ค้นหาตามชื่อ สี ราคา และคะแนน พร้อมจัดส่งฟรีทั่วประเทศ"
                />
            </Head>
            <StoreHeader current="products" />
            <main>
                <section className="catalog-intro">
                    <div className="flower-container">
                        <nav
                            aria-label="เส้นทางหน้า"
                            className="catalog-breadcrumb"
                        >
                            <Link href="/">หน้าแรก</Link>
                            <ChevronRight size={12} />
                            <span aria-current="page">ช่อดอกไม้ทั้งหมด</span>
                        </nav>
                        <p className="flower-eyebrow">
                            FLOWERS FOR EVERY FEELING
                        </p>
                        <h1>ทุกช่อ มีความหมาย</h1>
                        <p>ค้นหาช่อดอกไม้ที่แทนความรู้สึกของคุณได้ดีที่สุด</p>
                        <Flower2
                            className="catalog-intro-flower"
                            size={125}
                            strokeWidth={0.6}
                        />
                    </div>
                </section>
                <div className="flower-container catalog-layout">
                    <aside className="catalog-sidebar" aria-label="ตัวกรองสินค้า">
                        {!filtersOpen && filters}
                    </aside>
                    <section
                        className="catalog-results"
                        id="catalog-results"
                        aria-label="รายการสินค้า"
                    >
                        <div className="catalog-toolbar">
                            <div>
                                <h2>ช่อดอกไม้ทั้งหมด</h2>
                                <p role="status" aria-live="polite">
                                    พบ {filtered.length} รายการ
                                    {filtered.length > 0 &&
                                        ` · แสดง ${(currentPage - 1) * PAGE_SIZE + 1}–${Math.min(currentPage * PAGE_SIZE, filtered.length)}`}
                                </p>
                            </div>
                            <label className="catalog-sort">
                                เรียงตาม
                                <select
                                    value={sort}
                                    onChange={(event) => {
                                        setSort(event.target.value);
                                        setPage(1);
                                    }}
                                >
                                    <option value="recommended">
                                        สินค้าแนะนำ
                                    </option>
                                    <option value="price-asc">
                                        ราคา: ต่ำไปสูง
                                    </option>
                                    <option value="price-desc">
                                        ราคา: สูงไปต่ำ
                                    </option>
                                    <option value="rating">คะแนนสูงสุด</option>
                                </select>
                            </label>
                        </div>
                        <div className="catalog-search-row">
                            <label className="catalog-search">
                                <Search size={18} />
                                <input
                                    aria-label="ค้นหาในรายการสินค้า"
                                    placeholder="ค้นหาชื่อดอกไม้หรือช่อที่ชอบ"
                                    value={query}
                                    onChange={(event) => {
                                        setQuery(event.target.value);
                                        setPage(1);
                                    }}
                                />
                                {query && (
                                    <button
                                        aria-label="ล้างคำค้นหา"
                                        onClick={() => {
                                            setQuery('');
                                            setPage(1);
                                        }}
                                    >
                                        <X size={16} />
                                    </button>
                                )}
                            </label>
                            <button
                                className="catalog-mobile-filter"
                                onClick={() => setFiltersOpen(true)}
                            >
                                <SlidersHorizontal size={18} /> ตัวกรอง{' '}
                                {activeCount > 0 && `(${activeCount})`}
                            </button>
                        </div>
                        {activeCount > 0 && (
                            <div className="catalog-chips">
                                {chosenColors.map((color) => (
                                    <button
                                        key={color}
                                        onClick={() => toggleColor(color)}
                                        aria-label={`ลบตัวกรอง ${colors.find((item) => item.value === color)?.label}`}
                                    >
                                        {
                                            colors.find(
                                                (item) => item.value === color,
                                            )?.label
                                        }
                                        <X size={13} />
                                    </button>
                                ))}
                                {price !== 'all' && (
                                    <button
                                        onClick={() => {
                                            setPrice('all');
                                            setPage(1);
                                        }}
                                    >
                                        {range.label}
                                        <X size={13} />
                                    </button>
                                )}
                                {rating !== '0' && (
                                    <button
                                        onClick={() => {
                                            setRating('0');
                                            setPage(1);
                                        }}
                                    >
                                        {rating}{' '}
                                        {rating === '5' ? 'ดาว' : 'ดาวขึ้นไป'}
                                        <X size={13} />
                                    </button>
                                )}
                            </div>
                        )}
                        <p className="catalog-demo">
                            คอลเลกชันตัวอย่าง · ภาพ ราคา คะแนน
                            และสต็อกใช้เพื่อแสดงหน้าร้าน
                        </p>
                        <div className="catalog-grid">
                            {shown.map((item) => (
                                <article
                                    className="flower-product"
                                    key={item.id}
                                >
                                    <div className="flower-product-image">
                                        <button
                                            className="flower-product-open"
                                            onClick={() =>
                                                router.visit(
                                                    `/products/${item.id}`,
                                                )
                                            }
                                            aria-label={`ดูรายละเอียด ${item.thai}`}
                                        >
                                            <img
                                                src="/images/homepage/bouquets.png"
                                                alt={item.thai}
                                                style={{
                                                    objectPosition:
                                                        item.position,
                                                }}
                                                loading="lazy"
                                            />
                                            <span className="flower-product-overlay">
                                                ดูรายละเอียด{' '}
                                                <ArrowRight size={16} />
                                            </span>
                                        </button>
                                        {!isAdmin && (
                                            <WishlistButton
                                                productId={item.id}
                                                name={item.thai}
                                            />
                                        )}
                                        {item.stock === 0 && (
                                            <span className="catalog-stock">
                                                สินค้าหมด
                                            </span>
                                        )}
                                    </div>
                                    <div className="catalog-product-meta">
                                        <span>
                                            FL{String(item.id).padStart(3, '0')}
                                        </span>
                                        <span className="catalog-rating">
                                            {item.count ? (
                                                <>
                                                    <Star
                                                        size={13}
                                                        fill="currentColor"
                                                    />{' '}
                                                    {item.rating.toFixed(1)}{' '}
                                                    <small>
                                                        ({item.count})
                                                    </small>
                                                </>
                                            ) : (
                                                'ยังไม่มีคะแนน'
                                            )}
                                        </span>
                                    </div>
                                    <button
                                        className="catalog-product-name"
                                        onClick={() =>
                                            router.visit(`/products/${item.id}`)
                                        }
                                    >
                                        <h3>{item.name}</h3>
                                        <p>{item.thai}</p>
                                    </button>
                                    <div className="catalog-price">
                                        ฿{item.price.toLocaleString('th-TH')}
                                        <small>ส่งฟรี</small>
                                    </div>
                                </article>
                            ))}
                        </div>
                        {filtered.length === 0 && (
                            <div className="flower-empty">
                                <Flower2 size={38} />
                                <h3>ยังไม่พบช่อที่ตรงใจ</h3>
                                <p>
                                    ลองเปลี่ยนคำค้นหาหรือลดตัวกรอง แล้วค้นหาช่อโปรดอีกครั้ง
                                </p>
                                <button className="flower-cta" onClick={reset}>
                                    ดูสินค้าทั้งหมด <ArrowRight size={18} />
                                </button>
                            </div>
                        )}
                        {pages > 1 && (
                            <nav
                                className="catalog-pagination"
                                aria-label="หน้ารายการสินค้า"
                            >
                                <button
                                    disabled={currentPage === 1}
                                    onClick={() => turnPage(currentPage - 1)}
                                    aria-label="หน้าก่อนหน้า"
                                >
                                    <ChevronLeft size={17} />
                                </button>
                                {Array.from(
                                    { length: pages },
                                    (_, index) => index + 1,
                                ).map((number) => (
                                    <button
                                        key={number}
                                        aria-current={
                                            number === currentPage
                                                ? 'page'
                                                : undefined
                                        }
                                        onClick={() => turnPage(number)}
                                    >
                                        {number}
                                    </button>
                                ))}
                                <button
                                    disabled={currentPage === pages}
                                    onClick={() => turnPage(currentPage + 1)}
                                    aria-label="หน้าถัดไป"
                                >
                                    <ChevronRight size={17} />
                                </button>
                            </nav>
                        )}
                    </section>
                </div>
            </main>
            <StoreFooter />
            <Dialog open={filtersOpen} onOpenChange={setFiltersOpen}>
                <DialogContent className="flower-dialog catalog-filter-dialog">
                    <DialogHeader>
                        <DialogTitle>เลือกช่อในแบบคุณ</DialogTitle>
                        <DialogDescription>
                            ปรับสี ราคา และคะแนนที่ต้องการ
                        </DialogDescription>
                    </DialogHeader>
                    {filtersOpen && filters}
                    <button
                        className="flower-cta"
                        onClick={() => setFiltersOpen(false)}
                    >
                        ดู {filtered.length} รายการ <ArrowRight size={18} />
                    </button>
                </DialogContent>
            </Dialog>

            <Dialog open={wishlistOpen} onOpenChange={setWishlistOpen}>
                <DialogContent className="flower-dialog">
                    <DialogHeader>
                        <DialogTitle>เก็บช่อที่ชอบไว้ด้วยกัน</DialogTitle>
                        <DialogDescription>
                            {loggedIn
                                ? 'รายการโปรดจะพร้อมใช้งานเมื่อเชื่อมต่อระบบร้านค้า'
                                : 'เข้าสู่ระบบเพื่อใช้งานรายการโปรด'}
                        </DialogDescription>
                    </DialogHeader>
                    {!loggedIn && (
                        <Link className="flower-cta" href={login()}>
                            เข้าสู่ระบบ <ArrowRight size={18} />
                        </Link>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
