import { useCart } from '@/hooks/use-cart';
import { Link, router, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    Flower2,
    Heart,
    Menu,
    Search,
    ShoppingBag,
    Truck,
    UserRound,
    X,
} from 'lucide-react';
import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { dashboard, login, register } from '@/routes';

export function StoreHeader({
    current = 'home',
}: {
    current?: 'home' | 'products' | 'cart' | 'wishlist' | 'orders' | 'profile';
}) {
    const { auth } = usePage().props;
    const cart = useCart(auth.user?.id);
    const [query, setQuery] = useState('');
    const [menu, setMenu] = useState(false);
    const [notice, setNotice] = useState<string | null>(null);
    return (
        <>
            <div className="flower-announcement">
                <Truck size={15} /> ส่งความรู้สึกดี ๆ พร้อมส่งฟรีทั่วประเทศ{' '}
                <span>EVERY BOUQUET, WITH LOVE</span>
            </div>
            <header className="flower-header">
                <div className="flower-header-main flower-container">
                    <Link
                        className="flower-brand"
                        href="/"
                        aria-label="My Flower Shop หน้าแรก"
                    >
                        <Flower2 size={33} strokeWidth={1.25} />
                        <span>
                            MY FLOWER
                            <span className="flower-brand-bottom">
                                SHOP <i>·</i> made to last
                            </span>
                        </span>
                    </Link>
                    <form
                        className="flower-search"
                        role="search"
                        onSubmit={(event) => {
                            event.preventDefault();
                            router.get(
                                '/products',
                                query.trim() ? { q: query.trim() } : {},
                            );
                        }}
                    >
                        <Search size={19} />
                        <input
                            aria-label="ค้นหาช่อดอกไม้"
                            placeholder="วันนี้กำลังมองหาช่อแบบไหน?"
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                        />
                        <button type="submit" aria-label="ค้นหา">
                            <ArrowRight size={18} />
                        </button>
                    </form>
                    <div className="flower-account-actions">
                        <Link
                            className="flower-account"
                            href={
                                auth.user
                                    ? auth.user.role === 'admin'
                                        ? dashboard()
                                        : '/settings/profile'
                                    : login()
                            }
                        >
                            <UserRound size={20} />
                            <span>{auth.user?.name ?? 'เข้าสู่ระบบ'}</span>
                        </Link>
                        {auth.user?.role !== 'admin' && (
                            <>
                                <Link
                                    className="flower-icon"
                                    href="/wishlist"
                                    aria-label="รายการโปรด"
                                >
                                    <Heart size={21} />
                                </Link>
                                <Link
                                    className="flower-icon relative"
                                    href="/cart"
                                    aria-label={`ตะกร้าสินค้า ${cart.count} ช่อ`}
                                >
                                    <ShoppingBag size={21} />
                                    {cart.count > 0 && (
                                        <span className="absolute -top-1 -right-2 grid min-w-4 place-items-center rounded-full bg-[var(--accent)] px-1 text-[10px] text-[var(--on-accent)]">
                                            {cart.count}
                                        </span>
                                    )}
                                </Link>
                            </>
                        )}
                        <button
                            className="flower-icon flower-menu"
                            aria-label="เปิดเมนู"
                            aria-expanded={menu}
                            onClick={() => setMenu(!menu)}
                        >
                            {menu ? <X /> : <Menu />}
                        </button>
                    </div>
                </div>
                <nav
                    className={`flower-nav ${menu ? 'is-open' : ''}`}
                    aria-label="เมนูหลัก"
                >
                    <Link
                        href="/"
                        className={current === 'home' ? 'active' : ''}
                        aria-current={current === 'home' ? 'page' : undefined}
                    >
                        หน้าแรก
                    </Link>
                    <Link
                        href="/products"
                        className={current === 'products' ? 'active' : ''}
                        aria-current={
                            current === 'products' ? 'page' : undefined
                        }
                    >
                        เลือกซื้อช่อดอกไม้
                    </Link>
                    {auth.user && auth.user.role !== 'admin' && (
                        <Link
                            href="/orders"
                            className={current === 'orders' ? 'active' : ''}
                            aria-current={
                                current === 'orders' ? 'page' : undefined
                            }
                        >
                            ประวัติคำสั่งซื้อ
                        </Link>
                    )}
                    {/* <a href="/#our-story">ความพิเศษของเรา</a> */}
                    {/* <a href="/#delivery">การจัดส่ง</a> */}
                    {auth.user && (
                        <Link
                            href={
                                auth.user.role === 'admin'
                                    ? dashboard()
                                    : '/settings/profile'
                            }
                            className={current === 'profile' ? 'active' : ''}
                            aria-current={
                                current === 'profile' ? 'page' : undefined
                            }
                        >
                            {auth.user.role === 'admin'
                                ? 'จัดการร้านค้า'
                                : 'บัญชีของฉัน'}
                        </Link>
                    )}
                </nav>
            </header>
            <Dialog
                open={notice !== null}
                onOpenChange={(open) => {
                    if (!open) setNotice(null);
                }}
            >
                <DialogContent className="flower-dialog">
                    <DialogHeader>
                        <DialogTitle>{notice}</DialogTitle>
                        <DialogDescription>
                            {auth.user
                                ? 'ส่วนนี้จะพร้อมใช้งานเมื่อเชื่อมต่อระบบร้านค้า'
                                : 'เข้าสู่ระบบเพื่อบันทึกช่อที่ชอบและเริ่มเลือกซื้อสินค้า'}
                        </DialogDescription>
                    </DialogHeader>
                    {!auth.user && (
                        <div className="flower-dialog-links">
                            <Link className="flower-cta" href={login()}>
                                เข้าสู่ระบบ <ArrowRight size={18} />
                            </Link>
                            <Link
                                className="flower-text-link"
                                href={register()}
                            >
                                สมัครสมาชิก
                            </Link>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
export function StoreFooter() {
    const { auth } = usePage().props;
    return (
        <footer className="flower-footer">
            <div className="flower-container">
                <Link className="flower-brand" href="/">
                    <Flower2 size={28} strokeWidth={1.25} />
                    <span>
                        MY FLOWER
                        <span className="flower-brand-bottom">
                            SHOP <i>·</i> made to last
                        </span>
                    </span>
                </Link>
                <p>ช่อดอกไม้ปลอมสำเร็จรูป · ส่งฟรีทั่วประเทศ</p>
                <div>
                    <Link href="/products">เลือกซื้อสินค้า</Link>
                    <Link
                        href={
                            auth.user
                                ? auth.user.role === 'admin'
                                    ? dashboard()
                                    : '/settings/profile'
                                : login()
                        }
                    >
                        บัญชีของฉัน
                    </Link>
                </div>
            </div>
            <div className="flower-footer-bottom">
                © {new Date().getFullYear()} My Flower Shop{' '}
                <span>Made with a little love.</span>
            </div>
        </footer>
    );
}
