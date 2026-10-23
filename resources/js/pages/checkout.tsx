import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    ArrowRight,
    Check,
    QrCode,
    ShoppingBag,
    Truck,
    MapPin,
    ChevronDown,
    Minus,
    Plus,
} from 'lucide-react';
import { useState } from 'react';
import { StoreFooter, StoreHeader } from '@/components/store/store-chrome';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    type CartProduct,
    type DeliveryAddress,
    productImage,
} from '@/types/shop';
import { useCart } from '@/hooks/use-cart';
import '../../css/homepage.css';

type Delivery = {
    address_name: string;
    name: string;
    phone: string;
    street: string;
    subdistrict: string;
    district: string;
    province: string;
    postal: string;
};
const blank: Delivery = {
    address_name: '',
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
        key: 'address_name',
        label: 'ชื่อที่อยู่ เช่น บ้าน หรือที่ทำงาน',
        placeholder: 'ชื่อที่อยู่',
        autoComplete: 'off',
    },
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
function toDelivery(address: DeliveryAddress): Delivery {
    return {
        address_name: address.address_name,
        name: address.recipient_name,
        phone: address.phone_number,
        street: address.address_line,
        subdistrict: address.subdistrict,
        district: address.district,
        province: address.province,
        postal: address.postal_code,
    };
}

export default function Checkout({
    items: cartItems,
    addresses,
}: {
    items: CartProduct[];
    addresses: DeliveryAddress[];
}) {
    const cart = useCart();
    const saved = addresses.map(toDelivery);
    const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
    const [delivery, setDelivery] = useState<Delivery>(blank);
    const [addressOpen, setAddressOpen] = useState(true);
    const [touched, setTouched] = useState<
        Partial<Record<keyof Delivery, boolean>>
    >({});
    const form = useForm({
        use_saved_address: false,
        address_name: '',
        recipient_name: '',
        phone_number: '',
        address_line: '',
        subdistrict: '',
        district: '',
        province: '',
        postal_code: '',
    });
    // แปลงข้อมูลจาก DB ให้การ์ดสินค้าเดิมแสดงได้ โดยไม่เปลี่ยน layout
    const items = cartItems.map((item) => ({
        ...item,
        price: Number(item.price),
        thai: item.description,
    }));
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
    const serverFields = {
        address_name: 'address_name',
        name: 'recipient_name',
        phone: 'phone_number',
        street: 'address_line',
        subdistrict: 'subdistrict',
        district: 'district',
        province: 'province',
        postal: 'postal_code',
    } as const;
    for (const field of fields) {
        const message = form.errors[serverFields[field.key]];
        if (message) errors[field.key] = message;
    }
    const validCart =
        items.length > 0 &&
        items.every(
            (item) =>
                !item.is_deleted &&
                item.quantity > 0 &&
                item.quantity <= item.stock,
        );
    const valid =
        fields.every((field) => delivery[field.key].trim()) &&
        validCart &&
        /^0\d{8,9}$/.test(delivery.phone.replace(/[\s-]/g, '')) &&
        /^[1-9]\d{4}$/.test(delivery.postal);
    const primary =
        'h-12 rounded-full bg-[var(--accent)] px-6 text-[var(--on-accent)] hover:bg-[var(--accent-hover)]';
    const money = (value: number) => `฿${value.toLocaleString('th-TH')}`;
    const submit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setTouched(
            Object.fromEntries(fields.map((field) => [field.key, true])),
        );
        if (!valid || form.processing || cart.pending) return;
        form.transform(() => ({
            use_saved_address: selectedAddress !== null,
            address_name: delivery.address_name.trim(),
            recipient_name: delivery.name.trim(),
            phone_number: delivery.phone.replace(/[\s-]/g, ''),
            address_line: delivery.street.trim(),
            subdistrict: delivery.subdistrict.trim(),
            district: delivery.district.trim(),
            province: delivery.province.trim(),
            postal_code: delivery.postal.trim(),
        }));
        form.post('/checkout', { onError: () => setAddressOpen(true) });
    };
    const storageError = Object.entries(form.errors)
        .filter(
            ([key]) =>
                !Object.values(serverFields).some((field) => field === key),
        )
        .map(([, message]) => message)
        .join(' ');
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
                    <span className="text-[var(--accent)]" aria-current="step">
                        02 ข้อมูลจัดส่ง
                    </span>
                    <ArrowRight size={13} />
                    <span>03 ยืนยันคำสั่งซื้อ</span>
                </nav>
                {items.length === 0 ? (
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
                            ยังไม่เปิดรับชำระเงินจริง · ยืนยันแล้วจะสร้างคำสั่งซื้อและตัดสต็อก
                            โดยยังไม่ถือว่าตรวจรับเงินแล้ว
                        </p>
                        <form
                            onSubmit={submit}
                            noValidate
                            className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.6fr)_minmax(320px,1fr)] lg:gap-10"
                        >
                            <div className="min-w-0 space-y-6">
                                <Collapsible
                                    open={addressOpen}
                                    onOpenChange={setAddressOpen}
                                    className="rounded-3xl border border-[var(--border)] bg-[var(--cream)] p-5 md:p-7"
                                >
                                    <CollapsibleTrigger asChild>
                                        <button
                                            type="button"
                                            className="flex w-full items-start gap-3 text-left"
                                        >
                                            <MapPin
                                                className="mt-1 shrink-0 text-[var(--accent)]"
                                                size={24}
                                            />
                                            <span className="min-w-0 flex-1">
                                                <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                                                    <span className="text-lg font-bold">
                                                        {delivery.name.trim() ||
                                                            'เพิ่มผู้รับและที่อยู่จัดส่ง'}
                                                    </span>
                                                    {delivery.phone && (
                                                        <span className="text-sm text-[var(--muted)]">
                                                            ({delivery.phone})
                                                        </span>
                                                    )}
                                                </span>
                                                <span className="mt-1 block text-sm leading-6 break-words text-[var(--muted)]">
                                                    {delivery.street
                                                        ? [
                                                              delivery.street,
                                                              delivery.subdistrict,
                                                              delivery.district,
                                                              delivery.province,
                                                              delivery.postal,
                                                          ]
                                                              .filter(Boolean)
                                                              .join(' ')
                                                        : 'กรอกข้อมูลใหม่ หรือเลือกจากที่อยู่ที่บันทึกไว้'}
                                                </span>
                                                {!addressOpen &&
                                                    Object.keys(errors).length >
                                                        0 && (
                                                        <span className="mt-2 block text-xs text-red-700">
                                                            ข้อมูลยังไม่ครบ
                                                            กดเพื่อแก้ไข
                                                        </span>
                                                    )}
                                            </span>
                                            <ChevronDown
                                                size={21}
                                                className={`mt-1 shrink-0 transition-transform motion-reduce:transition-none ${addressOpen ? 'rotate-180' : ''}`}
                                            />
                                        </button>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent className="mt-6 border-t border-[var(--border)] pt-6">
                                        {' '}
                                        {saved.length > 0 && (
                                            <div className="mb-6 space-y-2">
                                                <Label htmlFor="saved-delivery">
                                                    ที่อยู่ที่บันทึกไว้
                                                </Label>
                                                <select
                                                    id="saved-delivery"
                                                    value={
                                                        selectedAddress ?? ''
                                                    }
                                                    className="h-12 w-full rounded-md border border-[var(--border)] bg-[var(--cream)] px-3 text-sm"
                                                    onChange={(event) => {
                                                        const selected =
                                                            saved.find(
                                                                (item) =>
                                                                    item.address_name ===
                                                                    event.target
                                                                        .value,
                                                            );
                                                        setSelectedAddress(
                                                            selected?.address_name ??
                                                                null,
                                                        );
                                                        setDelivery(
                                                            selected ?? {
                                                                ...blank,
                                                            },
                                                        );
                                                        setTouched({});
                                                        form.clearErrors();
                                                    }}
                                                >
                                                    <option value="">
                                                        เพิ่มผู้รับและที่อยู่ใหม่
                                                    </option>
                                                    {saved.map((item) => (
                                                        <option
                                                            key={
                                                                item.address_name
                                                            }
                                                            value={
                                                                item.address_name
                                                            }
                                                        >
                                                            {item.address_name}{' '}
                                                            · {item.name} ·{' '}
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
                                                        readOnly={
                                                            selectedAddress !==
                                                            null
                                                        }
                                                        autoComplete={
                                                            field.autoComplete
                                                        }
                                                        type={
                                                            field.key ===
                                                            'phone'
                                                                ? 'tel'
                                                                : 'text'
                                                        }
                                                        inputMode={
                                                            field.key ===
                                                            'postal'
                                                                ? 'numeric'
                                                                : undefined
                                                        }
                                                        maxLength={
                                                            field.key ===
                                                            'postal'
                                                                ? 5
                                                                : field.key ===
                                                                    'phone'
                                                                  ? 20
                                                                  : 200
                                                        }
                                                        value={
                                                            delivery[field.key]
                                                        }
                                                        placeholder={
                                                            field.placeholder
                                                        }
                                                        onChange={(event) => {
                                                            form.clearErrors(
                                                                serverFields[
                                                                    field.key
                                                                ],
                                                            );
                                                            setDelivery(
                                                                (current) => ({
                                                                    ...current,
                                                                    [field.key]:
                                                                        event
                                                                            .target
                                                                            .value,
                                                                }),
                                                            );
                                                        }}
                                                        onBlur={() =>
                                                            setTouched(
                                                                (current) => ({
                                                                    ...current,
                                                                    [field.key]: true,
                                                                }),
                                                            )
                                                        }
                                                        aria-invalid={Boolean(
                                                            touched[
                                                                field.key
                                                            ] &&
                                                            errors[field.key],
                                                        )}
                                                        aria-describedby={
                                                            touched[
                                                                field.key
                                                            ] &&
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
                                                                {
                                                                    errors[
                                                                        field
                                                                            .key
                                                                    ]
                                                                }
                                                            </p>
                                                        )}
                                                </div>
                                            ))}
                                        </div>
                                        <p className="mt-6 text-sm text-[var(--muted)]">
                                            {selectedAddress
                                                ? 'ใช้ข้อมูลจากที่อยู่ที่บันทึกไว้'
                                                : 'ที่อยู่ใหม่นี้จะบันทึกไว้สำหรับครั้งถัดไป'}
                                        </p>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            disabled={
                                                Object.keys(errors).length > 0
                                            }
                                            className="mt-5 rounded-full border-[var(--border)] bg-[var(--cream)] text-[var(--accent)] hover:bg-[var(--rose)]"
                                            onClick={() =>
                                                setAddressOpen(false)
                                            }
                                        >
                                            ใช้ที่อยู่นี้ <Check size={16} />
                                        </Button>
                                    </CollapsibleContent>
                                </Collapsible>

                                <section
                                    className="rounded-3xl border border-[var(--border)] bg-[var(--cream)] p-4 md:p-6"
                                    aria-labelledby="order-summary-title"
                                >
                                    <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
                                        <h2
                                            id="order-summary-title"
                                            className="flex items-center gap-3 text-xl font-bold"
                                        >
                                            <ShoppingBag
                                                size={23}
                                                className="text-[var(--accent)]"
                                            />{' '}
                                            สรุปรายการสินค้า
                                        </h2>
                                        <span className="text-xs text-[var(--muted)]">
                                            {items.length} รายการ · {cart.count}{' '}
                                            ช่อ
                                        </span>
                                    </div>
                                    <ul
                                        className="space-y-3 lg:max-h-[520px] lg:overflow-y-auto lg:pr-2"
                                        aria-label="สินค้าในคำสั่งซื้อ"
                                    >
                                        {items.map((item) => (
                                            <li
                                                key={item.id}
                                                className="grid grid-cols-[80px_minmax(0,1fr)] gap-4 rounded-2xl bg-[var(--cream)] p-3 sm:grid-cols-[110px_minmax(0,1fr)] sm:p-4"
                                            >
                                                <Link
                                                    href={`/products/${item.id}`}
                                                >
                                                    <img
                                                        className="aspect-[4/5] w-full rounded-xl object-cover"
                                                        src={productImage(
                                                            item.picture_path,
                                                        )}
                                                        alt={item.thai}
                                                    />
                                                </Link>
                                                <div className="min-w-0">
                                                    <Link
                                                        href={`/products/${item.id}`}
                                                        className="text-base font-bold"
                                                    >
                                                        {item.name}
                                                    </Link>
                                                    <p className="mt-1 text-xs text-[var(--muted)]">
                                                        {item.thai}
                                                    </p>
                                                    <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                                                        <div>
                                                            <p className="text-xl font-bold text-[var(--accent)]">
                                                                {money(
                                                                    item.price *
                                                                        item.quantity,
                                                                )}
                                                            </p>
                                                            <p className="text-xs text-[var(--muted)]">
                                                                {money(
                                                                    item.price,
                                                                )}{' '}
                                                                / ช่อ
                                                            </p>
                                                        </div>
                                                        <div className="flex items-center rounded-lg border border-[var(--border)]">
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="icon"
                                                                className="size-9"
                                                                aria-label={`ลดจำนวน ${item.name}`}
                                                                disabled={
                                                                    form.processing ||
                                                                    cart.pending ||
                                                                    !!item.is_deleted ||
                                                                    item.quantity <=
                                                                        1
                                                                }
                                                                onClick={() =>
                                                                    cart.update(
                                                                        item.id,
                                                                        item.quantity -
                                                                            1,
                                                                    )
                                                                }
                                                            >
                                                                <Minus
                                                                    size={14}
                                                                />
                                                            </Button>
                                                            <output
                                                                className="min-w-7 text-center text-sm"
                                                                aria-label={`จำนวน ${item.name}`}
                                                                aria-live="polite"
                                                            >
                                                                {item.quantity}
                                                            </output>
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="icon"
                                                                className="size-9"
                                                                aria-label={`เพิ่มจำนวน ${item.name}`}
                                                                disabled={
                                                                    form.processing ||
                                                                    cart.pending ||
                                                                    !!item.is_deleted ||
                                                                    item.quantity >=
                                                                        item.stock
                                                                }
                                                                onClick={() =>
                                                                    cart.update(
                                                                        item.id,
                                                                        item.quantity +
                                                                            1,
                                                                    )
                                                                }
                                                            >
                                                                <Plus
                                                                    size={14}
                                                                />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                    {(!!item.is_deleted ||
                                                        item.quantity >
                                                            item.stock ||
                                                        item.stock === 0) && (
                                                        <p className="mt-2 text-xs text-red-700">
                                                            สินค้าไม่พร้อมขายหรือจำนวนเกินสต็อก
                                                            กรุณากลับไปแก้ไขตะกร้า
                                                        </p>
                                                    )}
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </section>
                                <Link href="/cart" className="flower-text-link">
                                    <ArrowLeft size={16} /> กลับไปแก้ไขตะกร้า
                                </Link>
                            </div>
                            <aside className="min-w-0 rounded-2xl border border-[var(--border)] bg-[var(--rose-soft)] p-5 md:p-6 lg:sticky lg:top-6">
                                <h2 className="mb-5 text-xl font-bold">
                                    สรุปค่าใช้จ่าย
                                </h2>

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
                                <section className="mt-8 border-t border-[var(--border)] pt-6">
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
                                            สำหรับยอดคำสั่งซื้อที่นี่ ยืนยันคำสั่งซื้อได้
                                            แต่ยังไม่ถือว่าชำระเงินแล้ว
                                        </p>
                                    </div>
                                </section>
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
                                    disabled={
                                        !valid ||
                                        form.processing ||
                                        cart.pending
                                    }
                                >
                                    {form.processing
                                        ? 'กำลังบันทึก...'
                                        : 'ยืนยันคำสั่งซื้อ'}{' '}
                                    <ArrowRight size={17} />
                                </Button>
                                <p
                                    className="mt-3 text-center text-xs leading-6 text-[var(--muted)]"
                                    role="status"
                                >
                                    {!validCart
                                        ? 'กรุณาแก้ไขสินค้าที่หมดในตะกร้า'
                                        : !valid
                                          ? 'กรอกข้อมูลที่จำเป็นให้ครบเพื่อดำเนินการต่อ'
                                          : 'ยืนยันแล้วจะสร้างคำสั่งซื้อและตัดสต็อก'}
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
