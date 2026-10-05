import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    ArrowRight,
    Check,
    CircleCheck,
    QrCode,
    ShoppingBag,
    Truck,
    UserRound,
} from 'lucide-react';
import { useState, useSyncExternalStore } from 'react';
import { StoreFooter, StoreHeader } from '@/components/store/store-chrome';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { catalog } from '@/data/catalog';
import { useCart } from '@/hooks/use-cart';
import '../../css/homepage.css';

type Delivery = {
    name: string;
    phone: string;
    street: string;
    subdistrict: string;
    district: string;
    province: string;
    postal: string;
};
const blank: Delivery = {
    name: '',
    phone: '',
    street: '',
    subdistrict: '',
    district: '',
    province: '',
    postal: '',
};
const fields: {
    key: keyof Delivery;
    label: string;
    placeholder: string;
    autoComplete: string;
}[] = [
    {
        key: 'name',
        label: 'ชื่อ–นามสกุลผู้รับ',
        placeholder: 'ชื่อและนามสกุล',
        autoComplete: 'name',
    },
    {
        key: 'phone',
        label: 'เบอร์โทรศัพท์',
        placeholder: '0812345678',
        autoComplete: 'tel',
    },
    {
        key: 'street',
        label: 'บ้านเลขที่ หมู่บ้าน อาคาร ซอย ถนน',
        placeholder: 'รายละเอียดที่อยู่จัดส่ง',
        autoComplete: 'address-line1',
    },
    {
        key: 'subdistrict',
        label: 'ตำบล / แขวง',
        placeholder: 'ตำบลหรือแขวง',
        autoComplete: 'address-level3',
    },
    {
        key: 'district',
        label: 'อำเภอ / เขต',
        placeholder: 'อำเภอหรือเขต',
        autoComplete: 'address-level2',
    },
    {
        key: 'province',
        label: 'จังหวัด',
        placeholder: 'จังหวัด',
        autoComplete: 'address-level1',
    },
    {
        key: 'postal',
        label: 'รหัสไปรษณีย์',
        placeholder: 'รหัสไปรษณีย์ 5 หลัก',
        autoComplete: 'postal-code',
    },
];
function subscribe(callback: () => void) {
    window.addEventListener('storage', callback);
    window.addEventListener('flower-delivery-change', callback);
    return () => {
        window.removeEventListener('storage', callback);
        window.removeEventListener('flower-delivery-change', callback);
    };
}
function parseSaved(raw: string): Delivery[] {
    try {
        const value: unknown = JSON.parse(raw);
        return Array.isArray(value)
            ? value
                  .filter(
                      (item): item is Delivery =>
                          typeof item === 'object' &&
                          item !== null &&
                          fields.every(
                              (field) => typeof item[field.key] === 'string',
                          ),
                  )
                  .slice(0, 5)
            : [];
    } catch {
        return [];
    }
}
export default function Checkout() {
    const { auth } = usePage().props;
    const cart = useCart(auth.user?.id);
    const key = `flower-shop:delivery:v1:${auth.user?.id}`;
    const raw = useSyncExternalStore(
        subscribe,
        () => {
            try {
                return window.localStorage.getItem(key) ?? '[]';
            } catch {
                return '[]';
            }
        },
        () => '[]',
    );
    const saved = parseSaved(raw);
    const [delivery, setDelivery] = useState<Delivery>(blank);
    const [saveAddress, setSaveAddress] = useState(false);
    const [touched, setTouched] = useState<
        Partial<Record<keyof Delivery, boolean>>
    >({});
    const [completed, setCompleted] = useState(false);
    const [storageError, setStorageError] = useState('');
    const [receipt, setReceipt] = useState<{
        delivery: Delivery;
        total: number;
        count: number;
    } | null>(null);
    const items = cart.lines.flatMap((line) => {
        const product = catalog.find((item) => item.id === line.id);
        return product ? [{ ...product, quantity: line.quantity }] : [];
    });
    const total = items.reduce(
        (sum, item) => sum + item.quantity * item.price,
        0,
    );
    const errors: Partial<Record<keyof Delivery, string>> = {};
    for (const field of fields)
        if (!delivery[field.key].trim())
            errors[field.key] = `กรุณากรอก${field.label}`;
    if (
        delivery.phone &&
        !/^0\d{8,9}$/.test(delivery.phone.replace(/[\s-]/g, ''))
    )
        errors.phone = 'กรุณากรอกเบอร์โทรศัพท์ไทย 9–10 หลัก เริ่มต้นด้วย 0';
    if (delivery.postal && !/^[1-9]\d{4}$/.test(delivery.postal))
        errors.postal = 'กรุณากรอกรหัสไปรษณีย์ 5 หลัก';
    const validCart =
        items.length > 0 &&
        items.every((item) => item.quantity > 0 && item.quantity <= item.stock);
    const valid = Object.keys(errors).length === 0 && validCart;
    const primary =
        'h-12 rounded-full bg-[var(--accent)] px-6 text-[var(--on-accent)] hover:bg-[var(--accent-hover)]';
    const money = (value: number) => `฿${value.toLocaleString('th-TH')}`;
    const submit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!valid || completed) return;
        const clean = Object.fromEntries(
            Object.entries(delivery).map(([name, value]) => [
                name,
                value.trim(),
            ]),
        ) as Delivery;
        setStorageError('');
        if (saveAddress) {
            try {
                const existing = parseSaved(
                    window.localStorage.getItem(key) ?? '[]',
                );
                const next = [
                    clean,
                    ...existing.filter(
                        (item) =>
                            JSON.stringify(item) !== JSON.stringify(clean),
                    ),
                ].slice(0, 5);
                window.localStorage.setItem(key, JSON.stringify(next));
                window.dispatchEvent(new Event('flower-delivery-change'));
            } catch {
                setStorageError(
                    'บันทึกที่อยู่ไม่ได้ กรุณาลองใหม่ หรือยกเลิกตัวเลือกบันทึกที่อยู่เพื่อทดลองต่อ',
                );
                return;
            }
        }
        setReceipt({ delivery: clean, total, count: cart.count });
        setCompleted(true);
    };
    return (
        <div className="flower-home">
            <Head title="Checkout — My Flower Shop" />
            <StoreHeader current="cart" />
            <main className="flower-container min-h-[65vh] py-8 md:py-12">
                <nav
                    aria-label="ขั้นตอนสั่งซื้อ"
                    className="mb-8 flex flex-wrap items-center gap-3 text-xs text-[var(--muted)]"
                >
                    <Link href="/cart">01 ตะกร้าสินค้า</Link>
                    <ArrowRight size={13} />
                    <span
                        className="text-[var(--accent)]"
                        aria-current={!completed ? 'step' : undefined}
                    >
                        02 ข้อมูลจัดส่ง
                    </span>
                    <ArrowRight size={13} />
                    <span aria-current={completed ? 'step' : undefined}>
                        03 ยืนยันการทดลอง
                    </span>
                </nav>
                {completed && receipt ? (
                    <section className="mx-auto max-w-xl rounded-2xl border border-[var(--border)] bg-[var(--rose-soft)] p-7 text-center md:p-10">
                        <CircleCheck
                            className="mx-auto mb-5 text-[var(--accent)]"
                            size={48}
                            strokeWidth={1.3}
                        />
                        <h1 className="text-2xl font-bold">
                            ทดลอง Checkout สำเร็จ
                        </h1>
                        <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
                            ยังไม่มีการชำระเงินหรือสร้างคำสั่งซื้อจริง
                            <br />
                            สินค้าของคุณยังอยู่ในตะกร้า
                        </p>
                        <dl className="my-6 space-y-3 rounded-xl bg-[var(--cream)] p-5 text-left text-sm">
                            <div className="flex justify-between gap-4">
                                <dt>ผู้รับ</dt>
                                <dd>{receipt.delivery.name}</dd>
                            </div>
                            <div className="flex justify-between gap-4">
                                <dt>จำนวน</dt>
                                <dd>{receipt.count} ช่อ</dd>
                            </div>
                            <div className="flex justify-between gap-4">
                                <dt>ยอดรวมตัวอย่าง</dt>
                                <dd className="font-bold text-[var(--accent)]">
                                    {money(receipt.total)}
                                </dd>
                            </div>
                        </dl>
                        <Button asChild className={primary}>
                            <Link href="/cart">
                                กลับไปที่ตะกร้า <ArrowRight size={17} />
                            </Link>
                        </Button>
                    </section>
                ) : items.length === 0 ? (
                    <section className="py-16 text-center">
                        <ShoppingBag
                            size={42}
                            className="mx-auto mb-5 text-[var(--accent)]"
                        />
                        <h1 className="text-2xl">เลือกช่อดอกไม้ก่อนชำระเงิน</h1>
                        <p className="mt-3 mb-6 text-sm text-[var(--muted)]">
                            ยังไม่มีสินค้าในตะกร้าของคุณ
                        </p>
                        <Button asChild className={primary}>
                            <Link href="/products">
                                เลือกซื้อสินค้า <ArrowRight size={17} />
                            </Link>
                        </Button>
                    </section>
                ) : (
                    <>
                        <div className="mb-7">
                            <p className="flower-eyebrow">
                                SEND A LITTLE HAPPINESS
                            </p>
                            <h1 className="mt-2 text-3xl font-bold md:text-4xl">
                                ส่งความรู้สึกดี ๆ ถึงคนพิเศษ
                            </h1>
                            <p className="mt-3 text-sm text-[var(--muted)]">
                                กรอกข้อมูลผู้รับและตรวจสอบช่อดอกไม้ที่คุณเลือก
                            </p>
                        </div>
                        <p className="mb-7 rounded-lg bg-[var(--rose-soft)] p-4 text-sm leading-6">
                            โหมดทดลอง · ยังไม่เปิดรับชำระเงินจริง ไม่มี QR สำหรับโอนเงิน
                            และยังไม่สร้างคำสั่งซื้อ
                        </p>
                        <form
                            onSubmit={submit}
                            noValidate
                            className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_360px]"
                        >
                            <div className="min-w-0 space-y-6">
                                <section className="rounded-2xl border border-[var(--border)] p-5 md:p-7">
                                    <h2 className="mb-5 flex items-center gap-3 text-xl font-bold">
                                        <UserRound
                                            size={21}
                                            className="text-[var(--accent)]"
                                        />{' '}
                                        ผู้รับและที่อยู่จัดส่ง
                                    </h2>
                                    {saved.length > 0 && (
                                        <div className="mb-6 space-y-2">
                                            <Label htmlFor="saved-delivery">
                                                ข้อมูลที่บันทึกไว้ในเบราว์เซอร์นี้
                                            </Label>
                                            <select
                                                id="saved-delivery"
                                                defaultValue=""
                                                className="h-12 w-full rounded-md border border-[var(--border)] bg-[var(--cream)] px-3 text-sm"
                                                onChange={(event) => {
                                                    setDelivery(
                                                        event.target.value ===
                                                            ''
                                                            ? { ...blank }
                                                            : {
                                                                  ...saved[
                                                                      Number(
                                                                          event
                                                                              .target
                                                                              .value,
                                                                      )
                                                                  ],
                                                              },
                                                    );
                                                    setTouched({});
                                                }}
                                            >
                                                <option value="">
                                                    เพิ่มผู้รับและที่อยู่ใหม่
                                                </option>
                                                {saved.map((item, index) => (
                                                    <option
                                                        key={`${index}-${item.name}`}
                                                        value={index}
                                                    >
                                                        {item.name} ·{' '}
                                                        {item.street} ·{' '}
                                                        {item.province}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
                                    <div className="grid gap-5 sm:grid-cols-2">
                                        {fields.map((field) => (
                                            <div
                                                className={`space-y-2 ${field.key === 'street' ? 'sm:col-span-2' : ''}`}
                                                key={field.key}
                                            >
                                                <Label
                                                    htmlFor={`delivery-${field.key}`}
                                                    className="text-sm"
                                                >
                                                    {field.label}{' '}
                                                    <span
                                                        aria-hidden="true"
                                                        className="text-[var(--accent)]"
                                                    >
                                                        *
                                                    </span>
                                                </Label>
                                                <Input
                                                    id={`delivery-${field.key}`}
                                                    required
                                                    autoComplete={
                                                        field.autoComplete
                                                    }
                                                    type={
                                                        field.key === 'phone'
                                                            ? 'tel'
                                                            : 'text'
                                                    }
                                                    inputMode={
                                                        field.key === 'postal'
                                                            ? 'numeric'
                                                            : undefined
                                                    }
                                                    maxLength={
                                                        field.key === 'postal'
                                                            ? 5
                                                            : field.key ===
                                                                'phone'
                                                              ? 20
                                                              : 200
                                                    }
                                                    value={delivery[field.key]}
                                                    placeholder={
                                                        field.placeholder
                                                    }
                                                    onChange={(event) =>
                                                        setDelivery(
                                                            (current) => ({
                                                                ...current,
                                                                [field.key]:
                                                                    event.target
                                                                        .value,
                                                            }),
                                                        )
                                                    }
                                                    onBlur={() =>
                                                        setTouched(
                                                            (current) => ({
                                                                ...current,
                                                                [field.key]: true,
                                                            }),
                                                        )
                                                    }
                                                    aria-invalid={Boolean(
                                                        touched[field.key] &&
                                                        errors[field.key],
                                                    )}
                                                    aria-describedby={
                                                        touched[field.key] &&
                                                        errors[field.key]
                                                            ? `error-${field.key}`
                                                            : undefined
                                                    }
                                                    className="h-12 border-[var(--border)] bg-[var(--cream)] text-[var(--ink)] placeholder:text-[var(--muted)] dark:bg-[var(--cream)]"
                                                />
                                                {touched[field.key] &&
                                                    errors[field.key] && (
                                                        <p
                                                            id={`error-${field.key}`}
                                                            className="text-xs text-red-700"
                                                        >
                                                            {errors[field.key]}
                                                        </p>
                                                    )}
                                            </div>
                                        ))}
                                    </div>
                                    <label className="mt-6 flex cursor-pointer items-start gap-3 text-sm">
                                        <Checkbox
                                            checked={saveAddress}
                                            onCheckedChange={(checked) =>
                                                setSaveAddress(checked === true)
                                            }
                                            className="mt-1 border-[var(--muted)] data-[state=checked]:border-[var(--accent)] data-[state=checked]:bg-[var(--accent)] data-[state=checked]:text-white"
                                        />
                                        <span>
                                            บันทึกผู้รับและที่อยู่นี้ไว้ใช้ครั้งถัดไป
                                            <small className="mt-1 block text-xs text-[var(--muted)]">
                                                เก็บแยกตามบัญชี เฉพาะเบราว์เซอร์นี้
                                                สูงสุด 5 รายการ
                                            </small>
                                        </span>
                                    </label>
                                </section>
                                <section className="rounded-2xl border border-[var(--border)] p-5 md:p-7">
                                    <h2 className="mb-5 flex items-center gap-3 text-xl font-bold">
                                        <QrCode
                                            size={21}
                                            className="text-[var(--accent)]"
                                        />{' '}
                                        วิธีชำระเงิน
                                    </h2>
                                    <div className="flex items-center justify-between rounded-lg bg-[var(--rose-soft)] p-4">
                                        <div>
                                            <p className="text-sm font-bold">
                                                สแกนจ่ายด้วย QR Code
                                            </p>
                                            <p className="mt-1 text-xs text-[var(--muted)]">
                                                ช่องทางชำระเงินของร้าน
                                            </p>
                                        </div>
                                        <Check
                                            size={19}
                                            className="text-[var(--accent)]"
                                        />
                                    </div>
                                    <div className="mt-5 flex flex-col items-center rounded-xl border border-dashed border-[var(--border)] px-5 py-7 text-center">
                                        <QrCode
                                            size={50}
                                            strokeWidth={1}
                                            className="mb-3 text-[var(--muted)]"
                                            aria-hidden="true"
                                        />
                                        <p className="font-bold">
                                            QR ชำระเงินจริงยังไม่พร้อม
                                        </p>
                                        <p className="mt-2 max-w-sm text-xs leading-6 text-[var(--muted)]">
                                            เมื่อเชื่อมต่อระบบชำระเงินแล้ว จะแสดง QR
                                            สำหรับยอดคำสั่งซื้อที่นี่
                                            ขณะนี้สามารถทดลองตรวจสอบข้อมูลได้เท่านั้น
                                        </p>
                                    </div>
                                </section>
                                <Link href="/cart" className="flower-text-link">
                                    <ArrowLeft size={16} /> กลับไปแก้ไขตะกร้า
                                </Link>
                            </div>
                            <aside className="rounded-2xl border border-[var(--border)] bg-[var(--rose-soft)] p-5 md:p-6 lg:sticky lg:top-6">
                                <h2 className="mb-5 text-xl font-bold">
                                    ช่อที่คุณเลือก
                                </h2>
                                <ul className="space-y-4">
                                    {items.map((item) => (
                                        <li
                                            key={item.id}
                                            className="flex items-start gap-3"
                                        >
                                            <Link
                                                href={`/products/${item.id}`}
                                                className="shrink-0"
                                            >
                                                <img
                                                    className="h-20 w-16 rounded-lg object-cover"
                                                    src="/images/homepage/bouquets.png"
                                                    alt={item.thai}
                                                    style={{
                                                        objectPosition:
                                                            item.position,
                                                    }}
                                                />
                                            </Link>
                                            <div className="min-w-0 flex-1">
                                                <Link
                                                    className="text-sm"
                                                    href={`/products/${item.id}`}
                                                >
                                                    {item.name}
                                                </Link>
                                                <p className="mt-1 text-xs text-[var(--muted)]">
                                                    {money(item.price)} ×{' '}
                                                    {item.quantity} ช่อ
                                                </p>
                                                <p className="mt-2 text-sm font-bold text-[var(--accent)]">
                                                    {money(
                                                        item.price *
                                                            item.quantity,
                                                    )}
                                                </p>
                                                {item.quantity === 0 && (
                                                    <p className="text-xs text-red-700">
                                                        สินค้าหมด กรุณาแก้ไขตะกร้า
                                                    </p>
                                                )}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                                <dl className="mt-6 space-y-4 border-t border-[var(--border)] pt-5 text-sm">
                                    <div className="flex justify-between">
                                        <dt>รวมสินค้า ({cart.count} ช่อ)</dt>
                                        <dd>{money(total)}</dd>
                                    </div>
                                    <div className="flex justify-between">
                                        <dt>ค่าจัดส่ง</dt>
                                        <dd className="text-[var(--accent)]">
                                            ฟรี
                                        </dd>
                                    </div>
                                    <div className="flex justify-between border-t border-[var(--border)] pt-5">
                                        <dt className="font-bold">
                                            ยอดรวมทั้งหมด
                                        </dt>
                                        <dd
                                            className="text-2xl font-bold text-[var(--accent)]"
                                            aria-live="polite"
                                        >
                                            {money(total)}
                                        </dd>
                                    </div>
                                </dl>
                                {storageError && (
                                    <p
                                        role="alert"
                                        className="mt-4 text-xs text-red-700"
                                    >
                                        {storageError}
                                    </p>
                                )}
                                <Button
                                    type="submit"
                                    className={`${primary} mt-6 w-full`}
                                    disabled={!valid}
                                >
                                    ยืนยันข้อมูล (ทดลอง) <ArrowRight size={17} />
                                </Button>
                                <p
                                    className="mt-3 text-center text-xs leading-6 text-[var(--muted)]"
                                    role="status"
                                >
                                    {!validCart
                                        ? 'กรุณาแก้ไขสินค้าที่หมดในตะกร้า'
                                        : !valid
                                          ? 'กรอกข้อมูลที่จำเป็นให้ครบเพื่อดำเนินการต่อ'
                                          : 'ไม่มีการเรียกเก็บเงินหรือสร้างคำสั่งซื้อจริง'}
                                </p>
                                <div className="mt-5 flex items-center gap-3 border-t border-[var(--border)] pt-5 text-xs text-[var(--accent)]">
                                    <Truck size={20} /> ส่งฟรีทุกคำสั่งซื้อ ทั่วประเทศ
                                </div>
                            </aside>
                        </form>
                    </>
                )}
            </main>
            <StoreFooter />
        </div>
    );
}
