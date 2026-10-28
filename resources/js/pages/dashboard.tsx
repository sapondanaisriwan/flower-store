import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowRight, Flower2, Heart, Home, Package, ShoppingBag, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Dashboard() {
    const { auth } = usePage().props;
    const user = auth?.user;
    const displayName =
        typeof user?.name === 'string' && user.name.trim() !== ''
            ? user.name
            : (user?.username ?? 'คุณลูกค้า');

    const quickLinks = [
        {
            title: 'เลือกซื้อดอกไม้',
            desc: 'ดูแคตตาล็อกช่อดอกไม้ปลอมพรีเมียมทั้งหมด',
            href: '/products',
            icon: Flower2,
            action: 'เลือกซื้อสินค้า',
            color: 'text-pink-600 dark:text-pink-400',
            bg: 'bg-pink-50 dark:bg-pink-950/40',
        },
        {
            title: 'ประวัติคำสั่งซื้อ',
            desc: 'ตรวจสอบสถานะการจัดส่งและรายการที่เคยสั่งซื้อ',
            href: '/orders',
            icon: Package,
            action: 'ดูออเดอร์ของฉัน',
            color: 'text-amber-600 dark:text-amber-400',
            bg: 'bg-amber-50 dark:bg-amber-950/40',
        },
        {
            title: 'รายการโปรด',
            desc: 'รายการช่อดอกไม้ที่คุณบันทึกไว้ใน Wishlist',
            href: '/wishlist',
            icon: Heart,
            action: 'ดูสิ่งที่บันทึกไว้',
            color: 'text-rose-600 dark:text-rose-400',
            bg: 'bg-rose-50 dark:bg-rose-950/40',
        },
        {
            title: 'ตะกร้าสินค้า',
            desc: 'ดูรายการสินค้าในตะกร้าและดำเนินการสั่งซื้อ',
            href: '/cart',
            icon: ShoppingBag,
            action: 'ไปที่ตะกร้า',
            color: 'text-emerald-600 dark:text-emerald-400',
            bg: 'bg-emerald-50 dark:bg-emerald-950/40',
        },
        {
            title: 'ข้อมูลส่วนตัว',
            desc: 'จัดการข้อมูลบัญชี ที่อยู่จัดส่ง และรหัสผ่าน',
            href: '/settings/profile',
            icon: User,
            action: 'แก้ไขข้อมูล',
            color: 'text-blue-600 dark:text-blue-400',
            bg: 'bg-blue-50 dark:bg-blue-950/40',
        },
        {
            title: 'หน้าแรกของร้าน',
            desc: 'กลับไปยังหน้าหลัก My Flower Shop',
            href: '/',
            icon: Home,
            action: 'ไปที่หน้าร้าน',
            color: 'text-purple-600 dark:text-purple-400',
            bg: 'bg-purple-50 dark:bg-purple-950/40',
        },
    ];

    return (
        <>
            <Head title="User Dashboard" />
            <div className="flex flex-1 flex-col gap-6 p-6 md:p-8">
                {/* Welcome Card */}
                <div className="flex flex-col gap-2 rounded-2xl border border-sidebar-border/70 bg-gradient-to-r from-pink-50/70 via-white to-amber-50/50 p-6 md:p-8 dark:from-neutral-900 dark:via-neutral-900 dark:to-neutral-800">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        User Dashboard
                    </span>
                    <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                        ยินดีต้อนรับ, {displayName} 🌸
                    </h1>
                    <p className="text-sm text-muted-foreground md:text-base">
                        เข้าสู่ระบบในฐานะลูกค้า คุณสามารถเลือกซื้อสินค้า ตรวจสอบออเดอร์ และจัดการบัญชีของคุณได้จากเมนูด้านล่างนี้
                    </p>
                    <div className="mt-2 flex flex-wrap gap-3">
                        <Button asChild size="sm" className="rounded-full">
                            <Link href="/products">
                                <Flower2 className="mr-1.5 size-4" />
                                เลือกซื้อสินค้าเลย
                            </Link>
                        </Button>
                        <Button asChild variant="outline" size="sm" className="rounded-full">
                            <Link href="/">
                                <Home className="mr-1.5 size-4" />
                                ไปหน้าร้าน
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Quick Navigation Cards */}
                <div>
                    <h2 className="mb-4 text-base font-semibold text-foreground">
                        เมนูและบริการด่วน (Quick Navigation)
                    </h2>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {quickLinks.map((item) => {
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className="group flex flex-col justify-between rounded-xl border border-sidebar-border/70 bg-card p-5 transition-all hover:border-[var(--accent)] hover:shadow-xs"
                                >
                                    <div>
                                        <div className={`mb-3 inline-flex size-10 items-center justify-center rounded-lg ${item.bg} ${item.color}`}>
                                            <Icon className="size-5" />
                                        </div>
                                        <h3 className="text-base font-semibold group-hover:text-[var(--accent)]">
                                            {item.title}
                                        </h3>
                                        <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                                            {item.desc}
                                        </p>
                                    </div>
                                    <div className="mt-4 flex items-center gap-1 text-xs font-medium text-[var(--accent)]">
                                        <span>{item.action}</span>
                                        <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'User Dashboard',
            href: '/dashboard/user',
        },
    ],
};
