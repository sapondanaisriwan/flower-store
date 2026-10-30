import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    ArrowRight,
    Check,
    Package,
    Truck,
    MapPin,
    CreditCard,
} from 'lucide-react';
import { StoreFooter, StoreHeader } from '@/components/store/store-chrome';
import {
    PurchasedOrderItems as OrderItems,
    PurchasedOrderStatus as OrderStatus,
} from '@/components/store/purchased-order-items';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { type CustomerOrder, type PurchasedProduct, money } from '@/types/shop';
import { orderDate } from '@/data/orders';
import '../../css/homepage.css';
const primary =
    'rounded-full bg-[var(--accent)] px-6 text-[var(--on-accent)] hover:bg-[var(--accent-hover)]';
type OrderRecord = CustomerOrder & { items?: PurchasedProduct[] };
type OrderPage = {
    orders: {
        data: OrderRecord[];
        prev_page_url: string | null;
        next_page_url: string | null;
        current_page: number;
    } | null;
    order: CustomerOrder | null;
    items: PurchasedProduct[];
    selectedStatus: string;
    statusCounts: Record<string, number>;
};
const statusGroup = (status: string) =>
    ['delivered', 'success'].includes(status)
        ? 'delivered'
        : ['processing', 'shipping', 'shipped', 'delivery'].includes(status)
          ? 'shipping'
          : ['cancelled', 'canceled'].includes(status)
            ? 'cancelled'
            : status;
const orderTotal = (order: CustomerOrder) => Number(order.total_price);

export default function Orders({
    orders: page,
    order: selected,
    items,
    selectedStatus,
    statusCounts,
}: OrderPage) {
    const order = selected
        ? {
              ...selected,
              date: selected.created_at,
              items,
              status: statusGroup(selected.status),
          }
        : null;
    const orders = (page?.data ?? []).map((record) => ({
        ...record,
        date: record.created_at,
        items: record.items ?? [],
        status: statusGroup(record.status),
    }));
    const stage =
        !order || order.status === 'cancelled'
            ? -1
            : order.status === 'delivered'
              ? 2
              : order.status === 'shipping'
                ? 1
                : 0;
    let delivery: Record<string, unknown> = {};
    if (order) {
        try {
            const value: unknown = JSON.parse(order.address);
            if (value && typeof value === 'object' && !Array.isArray(value))
                delivery = value as Record<string, unknown>;
        } catch {
            /* รองรับข้อความที่อยู่เดิม */
        }
    }
    const recipient = [delivery.recipient_name, delivery.phone_number]
        .filter((field) => typeof field === 'string')
        .join(' · ');
    const address =
        ['address_line', 'subdistrict', 'district', 'province', 'postal_code']
            .map((key) => delivery[key])
            .filter((field) => typeof field === 'string')
            .join(' ') || order?.address;
    return (
        <div className="flower-home">
            <Head
                title={
                    order
                        ? 'รายละเอียดคำสั่งซื้อ — My Flower Shop'
                        : 'ประวัติคำสั่งซื้อ — My Flower Shop'
                }
            />
            <StoreHeader current="orders" />
            <main className="flower-container min-h-[65vh] py-8 md:py-12">
                <nav
                    aria-label="เส้นทางหน้า"
                    className="mb-7 flex flex-wrap gap-2 text-xs text-[var(--muted)]"
                >
                    <Link href="/">หน้าแรก</Link>
                    <span>/</span>
                    <Link href="/orders">ประวัติคำสั่งซื้อ</Link>
                    {order && (
                        <>
                            <span>/</span>
                            <span aria-current="page">{order.id}</span>
                        </>
                    )}
                </nav>
                <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <p className="flower-eyebrow">
                            EVERY ORDER, A LITTLE HAPPINESS
                        </p>
                        <h1 className="mt-2 text-3xl font-bold md:text-4xl">
                            {order ? 'รายละเอียดคำสั่งซื้อ' : 'ช่อดอกไม้ที่เคยส่งความสุข'}
                        </h1>
                        <p className="mt-3 text-sm text-[var(--muted)]">
                            {order
                                ? 'ติดตามการเดินทางของช่อดอกไม้ และความรู้สึกดี ๆ ของคุณ'
                                : 'ติดตามคำสั่งซื้อและช่อที่คุณเลือกไว้'}
                        </p>
                    </div>
                    <Link href="/products" className="flower-text-link">
                        เลือกชมทุกช่อ <ArrowRight size={16} />
                    </Link>
                </div>
                {order ? (
                    <>
                        <Link
                            href="/orders"
                            className="mb-6 inline-flex items-center gap-2 text-sm text-[var(--accent)]"
                        >
                            <ArrowLeft size={16} /> กลับไปประวัติคำสั่งซื้อ
                        </Link>
                        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
                            <div className="space-y-6">
                                <section className="rounded-2xl border border-[var(--border)] p-5 sm:p-7">
                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                        <div>
                                            <h2 className="text-xl font-bold">
                                                {order.id}
                                            </h2>
                                            <p className="mt-2 text-xs text-[var(--muted)]">
                                                สั่งซื้อเมื่อ {orderDate(order.date)}
                                            </p>
                                        </div>
                                        <OrderStatus status={order.status} />
                                    </div>
                                    <ol
                                        aria-label="สถานะคำสั่งซื้อ"
                                        className="my-7 grid grid-cols-3 gap-2 rounded-xl bg-[var(--rose-soft)] px-3 py-5"
                                    >
                                        {[
                                            {
                                                label: 'รับคำสั่งซื้อ',
                                                icon: Package,
                                            },
                                            {
                                                label: 'ระหว่างจัดส่ง',
                                                icon: Truck,
                                            },
                                            { label: 'จัดส่งสำเร็จ', icon: Check },
                                        ].map((step, index) => (
                                            <li
                                                key={step.label}
                                                aria-current={
                                                    stage === index
                                                        ? 'step'
                                                        : undefined
                                                }
                                                className={
                                                    'flex flex-col items-center gap-2 text-center text-xs ' +
                                                    (index > stage
                                                        ? 'text-[var(--muted)]'
                                                        : 'text-[var(--accent)]')
                                                }
                                            >
                                                <span
                                                    className={
                                                        'grid size-10 place-items-center rounded-full ' +
                                                        (index > stage
                                                            ? 'border border-[var(--border)]'
                                                            : 'bg-[var(--accent)] text-[var(--on-accent)]')
                                                    }
                                                >
                                                    <step.icon size={18} />
                                                </span>
                                                {step.label}
                                            </li>
                                        ))}
                                    </ol>
                                    <h3 className="font-bold">รายการสินค้า</h3>
                                    <OrderItems
                                        items={order.items}
                                        orderId={order.id}
                                        status={order.status}
                                    />
                                </section>
                                <section className="rounded-2xl border border-[var(--border)] p-5 sm:p-7">
                                    <h2 className="mb-4 flex items-center gap-2 font-bold">
                                        <MapPin
                                            size={19}
                                            className="text-[var(--accent)]"
                                        />{' '}
                                        ที่อยู่จัดส่ง
                                    </h2>
                                    <p className="text-sm leading-7">
                                        {recipient}
                                        <br />
                                        {address}
                                    </p>
                                </section>
                            </div>
                            <aside className="rounded-2xl bg-[var(--rose-soft)] p-6 lg:sticky lg:top-6">
                                <h2 className="text-xl font-bold">สรุปคำสั่งซื้อ</h2>
                                <dl className="mt-6 space-y-4 text-sm">
                                    <div className="flex justify-between">
                                        <dt>ราคาสินค้า</dt>
                                        <dd>{money(orderTotal(order))}</dd>
                                    </div>
                                    <div className="flex justify-between">
                                        <dt>ค่าจัดส่ง</dt>
                                        <dd className="text-[var(--accent)]">
                                            ฟรี
                                        </dd>
                                    </div>
                                    <div className="flex justify-between border-t border-[var(--border)] pt-5 text-lg font-bold">
                                        <dt>ยอดรวม</dt>
                                        <dd className="text-[var(--accent)]">
                                            {money(orderTotal(order))}
                                        </dd>
                                    </div>
                                </dl>
                                <div className="mt-6 border-t border-[var(--border)] pt-5">
                                    <p className="flex items-center gap-2 text-sm">
                                        <CreditCard size={18} /> ช่องทางชำระเงิน
                                        QR Code
                                    </p>
                                    <p className="mt-2 text-xs leading-6 text-[var(--muted)]">
                                        ยังไม่เปิดรับชำระเงินจริง และยังไม่มีเลขติดตามพัสดุ
                                    </p>
                                </div>
                            </aside>
                        </div>
                    </>
                ) : (
                    <Tabs
                        value={selectedStatus}
                        onValueChange={(status) =>
                            router.get(
                                '/orders',
                                { status },
                                { preserveScroll: true },
                            )
                        }
                    >
                        <TabsList className="mb-6 h-auto w-full justify-start gap-1 overflow-x-auto rounded-none border-b border-[var(--border)] bg-transparent p-0 pb-3 group-data-[orientation=horizontal]/tabs:h-auto">
                            {[
                                { id: 'all', label: 'ทั้งหมด' },
                                { id: 'pending', label: 'รอจัดส่ง' },
                                { id: 'shipping', label: 'ระหว่างจัดส่ง' },
                                { id: 'delivered', label: 'สำเร็จ' },
                                { id: 'cancelled', label: 'ยกเลิก' },
                            ].map((tab) => (
                                <TabsTrigger
                                    key={tab.id}
                                    value={tab.id}
                                    className="h-auto flex-none rounded-full px-4 py-2 text-[var(--muted)] data-[state=active]:bg-[var(--accent)] data-[state=active]:text-[var(--on-accent)] dark:text-[var(--muted)] dark:data-[state=active]:bg-[var(--accent)] dark:data-[state=active]:text-[var(--on-accent)]"
                                >
                                    {tab.label} ({statusCounts[tab.id] ?? 0})
                                </TabsTrigger>
                            ))}
                        </TabsList>
                        {[
                            'all',
                            'pending',
                            'shipping',
                            'delivered',
                            'cancelled',
                        ].map((tab) => (
                            <TabsContent
                                key={tab}
                                value={tab}
                                className="space-y-6"
                            >
                                {orders.filter(
                                    (item) =>
                                        tab === 'all' || item.status === tab,
                                ).length ? (
                                    orders
                                        .filter(
                                            (item) =>
                                                tab === 'all' ||
                                                item.status === tab,
                                        )
                                        .map((item) => (
                                            <article
                                                key={item.id}
                                                className="overflow-hidden rounded-2xl border border-[var(--border)]"
                                            >
                                                <header className="flex flex-wrap items-center justify-between gap-4 bg-[var(--rose-soft)] px-5 py-4 sm:px-7">
                                                    <div>
                                                        <h2 className="font-bold">
                                                            {item.id}
                                                        </h2>
                                                        <p className="mt-1 text-xs text-[var(--muted)]">
                                                            สั่งซื้อเมื่อ{' '}
                                                            {orderDate(
                                                                item.date,
                                                            )}
                                                        </p>
                                                    </div>
                                                    <OrderStatus
                                                        status={item.status}
                                                    />
                                                </header>
                                                <div className="px-5 sm:px-7">
                                                    <OrderItems
                                                        items={item.items}
                                                        orderId={item.id}
                                                        status={item.status}
                                                    />
                                                    <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-[var(--border)] py-5">
                                                        <p className="text-sm">
                                                            ยอดรวม{' '}
                                                            <strong className="ml-2 text-xl text-[var(--accent)]">
                                                                {money(
                                                                    orderTotal(
                                                                        item,
                                                                    ),
                                                                )}
                                                            </strong>
                                                            <span className="ml-2 text-xs text-[var(--muted)]">
                                                                จัดส่งฟรี
                                                            </span>
                                                        </p>
                                                        <Button
                                                            asChild
                                                            className={primary}
                                                        >
                                                            <Link
                                                                href={
                                                                    '/orders/' +
                                                                    item.id
                                                                }
                                                            >
                                                                ดูรายละเอียด{' '}
                                                                <ArrowRight
                                                                    size={16}
                                                                />
                                                            </Link>
                                                        </Button>
                                                    </footer>
                                                </div>
                                            </article>
                                        ))
                                ) : (
                                    <section className="flex flex-col items-center rounded-2xl border border-[var(--border)] px-5 py-16 text-center">
                                        <span className="mb-5 grid size-20 place-items-center rounded-full bg-[var(--rose)] text-[var(--accent)]">
                                            <Package
                                                size={34}
                                                strokeWidth={1.3}
                                            />
                                        </span>
                                        <h2 className="text-2xl">
                                            ยังไม่มีคำสั่งซื้อ
                                            {tab === 'pending'
                                                ? 'ที่รอจัดส่ง'
                                                : tab === 'cancelled'
                                                  ? 'ที่ยกเลิก'
                                                  : tab === 'shipping'
                                                    ? 'ระหว่างจัดส่ง'
                                                    : tab === 'delivered'
                                                      ? 'ที่สำเร็จ'
                                                      : ''}
                                        </h2>
                                        <p className="mt-3 mb-7 text-sm text-[var(--muted)]">
                                            เมื่อมีคำสั่งซื้อ คุณจะติดตามรายละเอียดได้ที่นี่
                                        </p>
                                        <Button asChild className={primary}>
                                            <Link href="/products">
                                                เลือกช่อดอกไม้{' '}
                                                <ArrowRight size={16} />
                                            </Link>
                                        </Button>
                                    </section>
                                )}
                            </TabsContent>
                        ))}
                        <nav
                            aria-label="หน้าประวัติคำสั่งซื้อ"
                            className="mt-6 flex items-center gap-5 text-sm text-[var(--accent)]"
                        >
                            {page?.prev_page_url && (
                                <Link href={page.prev_page_url}>ก่อนหน้า</Link>
                            )}
                            <span>หน้า {page?.current_page ?? 1}</span>
                            {page?.next_page_url && (
                                <Link href={page.next_page_url}>ถัดไป</Link>
                            )}
                        </nav>
                    </Tabs>
                )}
            </main>
            <StoreFooter />
        </div>
    );
}
