import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    ArrowRight,
    Check,
    ChevronDown,
    Edit3,
    Loader2,
    MapPin,
    Minus,
    Plus,
    QrCode,
    ShoppingBag,
    Trash2,
    Truck,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { StoreFooter, StoreHeader } from '@/components/store/store-chrome';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCart } from '@/hooks/use-cart';
import {
    type CartProduct,
    type DeliveryAddress,
    productImage,
} from '@/types/shop';
import '../../css/homepage.css';

const emptyAddressForm: DeliveryAddress = {
    address_name: '',
    recipient_name: '',
    phone_number: '',
    address_line: '',
    subdistrict: '',
    district: '',
    province: '',
    postal_code: '',
};

export default function Checkout({
    items: cartItems,
    addresses: initialAddresses = [],
}: {
    items: CartProduct[];
    addresses: DeliveryAddress[];
}) {
    const cart = useCart();
    const [addressList, setAddressList] =
        useState<DeliveryAddress[]>(initialAddresses);
    const [selectedAddressName, setSelectedAddressName] = useState<
        string | null
    >(() =>
        initialAddresses.length > 0 ? initialAddresses[0].address_name : null,
    );
    const [addressOpen, setAddressOpen] = useState(true);

    // Sync state when props change
    useEffect(() => {
        setAddressList(initialAddresses);
    }, [initialAddresses]);

    // Keep selectedAddressName valid if the list changes
    useEffect(() => {
        if (addressList.length > 0) {
            const exists = addressList.some(
                (a) => a.address_name === selectedAddressName,
            );
            if (!exists) {
                setSelectedAddressName(addressList[0].address_name);
            }
        } else {
            setSelectedAddressName(null);
        }
    }, [addressList, selectedAddressName]);

    const activeAddress =
        addressList.find((a) => a.address_name === selectedAddressName) ??
        (addressList.length > 0 ? addressList[0] : null);

    // Address Modal (Add / Edit) State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
    const [editingOriginalName, setEditingOriginalName] = useState<
        string | null
    >(null);
    const [modalData, setModalData] =
        useState<DeliveryAddress>(emptyAddressForm);
    const [modalErrors, setModalErrors] = useState<Record<string, string>>({});
    const [isSubmittingAddress, setIsSubmittingAddress] = useState(false);

    const openAddModal = () => {
        setModalMode('add');
        setEditingOriginalName(null);
        setModalData({ ...emptyAddressForm });
        setModalErrors({});
        setIsModalOpen(true);
    };

    const openEditModal = (addr: DeliveryAddress, e?: React.MouseEvent) => {
        e?.stopPropagation();
        setModalMode('edit');
        setEditingOriginalName(addr.address_name);
        setModalData({ ...addr });
        setModalErrors({});
        setIsModalOpen(true);
    };

    const handleDeleteAddress = (
        addressName: string,
        e?: React.MouseEvent,
    ) => {
        e?.stopPropagation();
        if (
            !window.confirm(
                `คุณต้องการลบที่อยู่ "${addressName}" หรือไม่?`,
            )
        ) {
            return;
        }

        router.delete(`/addresses/${encodeURIComponent(addressName)}`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(`ลบที่อยู่ "${addressName}" แล้ว`);
                setAddressList((prev) =>
                    prev.filter((a) => a.address_name !== addressName),
                );
            },
            onError: () => {
                toast.error('ไม่สามารถลบที่อยู่นี้ได้');
            },
        });
    };

    const handleSaveAddress = (e: React.FormEvent) => {
        e.preventDefault();
        const errors: Record<string, string> = {};

        if (!modalData.address_name.trim()) {
            errors.address_name = 'กรุณากรอกชื่อที่อยู่ เช่น บ้าน หรือ ที่ทำงาน';
        } else if (
            modalMode === 'add' &&
            addressList.some(
                (a) =>
                    a.address_name.toLowerCase() ===
                    modalData.address_name.trim().toLowerCase(),
            )
        ) {
            errors.address_name =
                'มีที่อยู่ที่ใช้ชื่อนี้อยู่แล้ว กรุณาตั้งชื่ออื่น';
        } else if (
            modalMode === 'edit' &&
            editingOriginalName &&
            modalData.address_name.trim().toLowerCase() !==
                editingOriginalName.toLowerCase() &&
            addressList.some(
                (a) =>
                    a.address_name.toLowerCase() ===
                    modalData.address_name.trim().toLowerCase(),
            )
        ) {
            errors.address_name =
                'มีที่อยู่ที่ใช้ชื่อนี้อยู่แล้ว กรุณาตั้งชื่ออื่น';
        }

        if (!modalData.recipient_name.trim()) {
            errors.recipient_name = 'กรุณากรอกชื่อ–นามสกุลผู้รับ';
        }

        const cleanedPhone = modalData.phone_number.replace(/[\s-]/g, '');
        if (!cleanedPhone) {
            errors.phone_number = 'กรุณากรอกเบอร์โทรศัพท์';
        } else if (!/^0\d{8,9}$/.test(cleanedPhone)) {
            errors.phone_number =
                'เบอร์โทรศัพท์ต้องขึ้นต้นด้วย 0 และมีความยาว 9–10 หลัก';
        }

        if (!modalData.address_line.trim()) {
            errors.address_line =
                'กรุณากรอกรายละเอียดที่อยู่ (บ้านเลขที่ หมู่ ซอย ถนน)';
        }

        if (!modalData.subdistrict.trim()) {
            errors.subdistrict = 'กรุณากรอกตำบล / แขวง';
        }

        if (!modalData.district.trim()) {
            errors.district = 'กรุณากรอกอำเภอ / เขต';
        }

        if (!modalData.province.trim()) {
            errors.province = 'กรุณากรอกจังหวัด';
        }

        const cleanedPostal = modalData.postal_code.trim();
        if (!cleanedPostal) {
            errors.postal_code = 'กรุณากรอกรหัสไปรษณีย์';
        } else if (!/^[1-9]\d{4}$/.test(cleanedPostal)) {
            errors.postal_code = 'รหัสไปรษณีย์ต้องเป็นตัวเลข 5 หลัก';
        }

        setModalErrors(errors);
        if (Object.keys(errors).length > 0) return;

        setIsSubmittingAddress(true);

        const payload: DeliveryAddress = {
            address_name: modalData.address_name.trim(),
            recipient_name: modalData.recipient_name.trim(),
            phone_number: cleanedPhone,
            address_line: modalData.address_line.trim(),
            subdistrict: modalData.subdistrict.trim(),
            district: modalData.district.trim(),
            province: modalData.province.trim(),
            postal_code: cleanedPostal,
        };

        if (modalMode === 'add') {
            router.post('/addresses', payload, {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success('บันทึกที่อยู่เรียบร้อยแล้ว');
                    setIsModalOpen(false);
                    setSelectedAddressName(payload.address_name);
                    setAddressList((prev) => {
                        const filtered = prev.filter(
                            (a) => a.address_name !== payload.address_name,
                        );
                        return [...filtered, payload];
                    });
                },
                onError: (serverErrors) => {
                    setModalErrors(serverErrors);
                    toast.error('กรุณาตรวจสอบข้อมูลที่กรอก');
                },
                onFinish: () => setIsSubmittingAddress(false),
            });
        } else if (modalMode === 'edit' && editingOriginalName) {
            router.patch(
                `/addresses/${encodeURIComponent(editingOriginalName)}`,
                payload,
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        toast.success('แก้ไขที่อยู่เรียบร้อยแล้ว');
                        setIsModalOpen(false);
                        setSelectedAddressName(payload.address_name);
                        setAddressList((prev) =>
                            prev.map((a) =>
                                a.address_name === editingOriginalName
                                    ? payload
                                    : a,
                            ),
                        );
                    },
                    onError: (serverErrors) => {
                        setModalErrors(serverErrors);
                        toast.error('กรุณาตรวจสอบข้อมูลที่กรอก');
                    },
                    onFinish: () => setIsSubmittingAddress(false),
                },
            );
        }
    };

    // Checkout Order Form
    const form = useForm({
        use_saved_address: true,
        address_name: '',
        recipient_name: '',
        phone_number: '',
        address_line: '',
        subdistrict: '',
        district: '',
        province: '',
        postal_code: '',
    });

    const items = cartItems.map((item) => ({
        ...item,
        price: Number(item.price),
        thai: item.description,
    }));

    const total = items.reduce(
        (sum, item) => sum + item.quantity * item.price,
        0,
    );

    const validCart =
        items.length > 0 &&
        items.every(
            (item) =>
                !item.is_deleted &&
                item.quantity > 0 &&
                item.quantity <= item.stock,
        );

    const canSubmit =
        validCart &&
        activeAddress !== null &&
        !form.processing &&
        !cart.pending;

    const primary =
        'h-12 rounded-full bg-[var(--accent)] px-6 text-[var(--on-accent)] hover:bg-[var(--accent-hover)] transition-all';
    const money = (value: number) => `฿${value.toLocaleString('th-TH')}`;

    const submit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!activeAddress) {
            setAddressOpen(true);
            toast.error('กรุณาเลือกหรือเพิ่มที่อยู่จัดส่งก่อนยืนยันคำสั่งซื้อ');
            return;
        }

        if (!canSubmit) return;

        form.transform(() => ({
            use_saved_address: true,
            address_name: activeAddress.address_name,
            recipient_name: activeAddress.recipient_name,
            phone_number: activeAddress.phone_number,
            address_line: activeAddress.address_line,
            subdistrict: activeAddress.subdistrict,
            district: activeAddress.district,
            province: activeAddress.province,
            postal_code: activeAddress.postal_code,
        }));

        form.post('/checkout', {
            onError: () => setAddressOpen(true),
        });
    };

    const serverOrderError =
        form.errors.address_name ||
        (form.errors as Record<string, string | undefined>).cart;

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
                    <span className="text-[var(--accent)] font-semibold" aria-current="step">
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
                        <h1 className="text-2xl font-bold">เลือกช่อดอกไม้ก่อนชำระเงิน</h1>
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
                                เลือกหรือเพิ่มที่อยู่จัดส่ง และตรวจสอบช่อดอกไม้ที่คุณเลือก
                            </p>
                        </div>

                        <p className="mb-7 rounded-xl bg-[var(--rose-soft)] p-4 text-sm leading-6 text-[var(--ink)]">
                            ยังไม่เปิดรับชำระเงินจริง · ยืนยันแล้วจะสร้างคำสั่งซื้อและตัดสต็อก
                            โดยยังไม่ถือว่าตรวจรับเงินแล้ว
                        </p>

                        <form
                            onSubmit={submit}
                            noValidate
                            className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.6fr)_minmax(320px,1fr)] lg:gap-10"
                        >
                            <div className="min-w-0 space-y-6">
                                {/* SECTION: Collapsible Address Picker */}
                                <Collapsible
                                    open={addressOpen}
                                    onOpenChange={setAddressOpen}
                                    className="rounded-3xl border border-[var(--border)] bg-[var(--cream)] p-5 md:p-7 shadow-xs"
                                >
                                    <CollapsibleTrigger asChild>
                                        <button
                                            type="button"
                                            className="flex w-full items-start gap-3.5 text-left transition-opacity hover:opacity-90"
                                        >
                                            <div className="grid size-10 shrink-0 place-items-center rounded-full bg-[var(--rose)] text-[var(--accent)]">
                                                <MapPin size={22} />
                                            </div>
                                            <span className="min-w-0 flex-1">
                                                <span className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                                                    {activeAddress ? (
                                                        <>
                                                            <span className="inline-flex items-center rounded-full bg-[var(--rose)] px-2.5 py-0.5 text-xs font-bold text-[var(--accent)]">
                                                                {activeAddress.address_name}
                                                            </span>
                                                            <span className="text-lg font-bold text-[var(--ink)]">
                                                                {activeAddress.recipient_name}
                                                            </span>
                                                            <span className="text-sm text-[var(--muted)]">
                                                                ({activeAddress.phone_number})
                                                            </span>
                                                        </>
                                                    ) : (
                                                        <span className="text-lg font-bold text-[var(--ink)]">
                                                            เลือกหรือเพิ่มที่อยู่จัดส่ง
                                                        </span>
                                                    )}
                                                </span>
                                                <span className="mt-1 block text-sm leading-6 break-words text-[var(--muted)]">
                                                    {activeAddress
                                                        ? `${activeAddress.address_line} ต.${activeAddress.subdistrict} อ.${activeAddress.district} จ.${activeAddress.province} ${activeAddress.postal_code}`
                                                        : 'ยังไม่มีที่อยู่จัดส่ง กรุณากดเพื่อเลือกหรือเพิ่มที่อยู่ใหม่'}
                                                </span>
                                                {!addressOpen && !activeAddress && (
                                                    <span className="mt-2 block text-xs font-semibold text-red-600">
                                                        กรุณาเลือกหรือเพิ่มที่อยู่จัดส่ง
                                                    </span>
                                                )}
                                            </span>
                                            <ChevronDown
                                                size={22}
                                                className={`mt-1 shrink-0 text-[var(--muted)] transition-transform duration-200 ${
                                                    addressOpen ? 'rotate-180' : ''
                                                }`}
                                            />
                                        </button>
                                    </CollapsibleTrigger>

                                    <CollapsibleContent className="mt-6 border-t border-[var(--border)] pt-6">
                                        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                                            <div>
                                                <h3 className="text-base font-bold text-[var(--ink)]">
                                                    ที่อยู่จัดส่งที่บันทึกไว้ ({addressList.length})
                                                </h3>
                                                <p className="text-xs text-[var(--muted)]">
                                                    คลิกเลือกที่อยู่จัดส่งที่ต้องการ หรือแก้ไขข้อมูลในรายการ
                                                </p>
                                            </div>
                                            <Button
                                                type="button"
                                                size="sm"
                                                onClick={openAddModal}
                                                className="h-9 gap-1.5 rounded-full bg-[var(--accent)] px-4 text-xs text-white hover:bg-[var(--accent-hover)]"
                                            >
                                                <Plus size={15} />
                                                เพิ่มที่อยู่ใหม่
                                            </Button>
                                        </div>

                                        {addressList.length === 0 ? (
                                            <div className="my-6 rounded-2xl border border-dashed border-[var(--border)] bg-white/50 p-8 text-center">
                                                <MapPin
                                                    size={36}
                                                    className="mx-auto mb-3 text-[var(--muted)]"
                                                />
                                                <p className="text-sm font-semibold text-[var(--ink)]">
                                                    ยังไม่มีที่อยู่ที่บันทึกไว้
                                                </p>
                                                <p className="mt-1 text-xs text-[var(--muted)]">
                                                    เพิ่มที่อยู่สำหรับจัดส่งดอกไม้ของคุณได้ทันที
                                                </p>
                                                <Button
                                                    type="button"
                                                    onClick={openAddModal}
                                                    className="mt-4 gap-1.5 rounded-full bg-[var(--accent)] px-5 text-xs text-white hover:bg-[var(--accent-hover)]"
                                                >
                                                    <Plus size={14} /> เพิ่มที่อยู่แรกของคุณ
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="grid gap-3.5 sm:grid-cols-2">
                                                {addressList.map((addr) => {
                                                    const isSelected =
                                                        selectedAddressName ===
                                                        addr.address_name;
                                                    return (
                                                        <div
                                                            key={addr.address_name}
                                                            onClick={() =>
                                                                setSelectedAddressName(
                                                                    addr.address_name,
                                                                )
                                                            }
                                                            className={`relative flex flex-col justify-between rounded-2xl border p-4 text-left cursor-pointer transition-all duration-200 ${
                                                                isSelected
                                                                    ? 'border-[var(--accent)] bg-white shadow-xs ring-2 ring-[var(--accent)]/15'
                                                                    : 'border-[var(--border)] bg-white/60 hover:border-[var(--accent)]/40 hover:bg-white'
                                                            }`}
                                                        >
                                                            <div>
                                                                <div className="mb-2 flex items-center justify-between gap-2">
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="inline-flex items-center rounded-full bg-[var(--rose)] px-2.5 py-0.5 text-xs font-bold text-[var(--accent)]">
                                                                            {addr.address_name}
                                                                        </span>
                                                                        {isSelected && (
                                                                            <span className="text-[11px] font-semibold text-[var(--accent)]">
                                                                                (กำลังเลือก)
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    <div
                                                                        className={`grid size-5 place-items-center rounded-full transition-all ${
                                                                            isSelected
                                                                                ? 'bg-[var(--accent)] text-white'
                                                                                : 'border border-[var(--border)] bg-white'
                                                                        }`}
                                                                    >
                                                                        {isSelected && (
                                                                            <Check
                                                                                size={12}
                                                                                strokeWidth={3}
                                                                            />
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                <div className="text-sm font-bold text-[var(--ink)]">
                                                                    {addr.recipient_name}
                                                                    <span className="ml-2 font-normal text-xs text-[var(--muted)]">
                                                                        {addr.phone_number}
                                                                    </span>
                                                                </div>

                                                                <p className="mt-1.5 text-xs leading-relaxed text-[var(--muted)]">
                                                                    {addr.address_line}{' '}
                                                                    ต.{addr.subdistrict}{' '}
                                                                    อ.{addr.district}{' '}
                                                                    จ.{addr.province}{' '}
                                                                    {addr.postal_code}
                                                                </p>
                                                            </div>

                                                            <div className="mt-4 flex items-center justify-end gap-2 border-t border-[var(--border)]/60 pt-3">
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="h-8 gap-1 rounded-full px-3 text-xs text-[var(--muted)] hover:bg-[var(--rose-soft)] hover:text-[var(--ink)]"
                                                                    onClick={(e) =>
                                                                        openEditModal(
                                                                            addr,
                                                                            e,
                                                                        )
                                                                    }
                                                                >
                                                                    <Edit3 size={13} />
                                                                    แก้ไข
                                                                </Button>
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="h-8 gap-1 rounded-full px-3 text-xs text-red-500 hover:bg-red-50 hover:text-red-700"
                                                                    onClick={(e) =>
                                                                        handleDeleteAddress(
                                                                            addr.address_name,
                                                                            e,
                                                                        )
                                                                    }
                                                                >
                                                                    <Trash2 size={13} />
                                                                    ลบ
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    );
                                                })}

                                                {/* Add Address Card Button */}
                                                <button
                                                    type="button"
                                                    onClick={openAddModal}
                                                    className="flex min-h-[140px] flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[var(--border)] bg-white/40 p-4 text-[var(--accent)] transition-all hover:border-[var(--accent)] hover:bg-white"
                                                >
                                                    <div className="grid size-9 place-items-center rounded-full bg-[var(--rose-soft)]">
                                                        <Plus size={18} />
                                                    </div>
                                                    <span className="text-sm font-semibold">
                                                        + เพิ่มที่อยู่ใหม่
                                                    </span>
                                                    <span className="text-xs text-[var(--muted)]">
                                                        บันทึกที่อยู่จัดส่งเพิ่มเติม
                                                    </span>
                                                </button>
                                            </div>
                                        )}

                                        {activeAddress && (
                                            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] pt-4">
                                                <p className="text-xs text-[var(--muted)]">
                                                    เลือกที่อยู่นี้สำหรับคำสั่งซื้อนี้
                                                </p>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    className="rounded-full border-[var(--border)] bg-[var(--cream)] text-[var(--accent)] hover:bg-[var(--rose)]"
                                                    onClick={() =>
                                                        setAddressOpen(false)
                                                    }
                                                >
                                                    ใช้ที่อยู่นี้ <Check size={16} />
                                                </Button>
                                            </div>
                                        )}
                                    </CollapsibleContent>
                                </Collapsible>

                                {/* SECTION: Order Items Summary */}
                                <section
                                    className="rounded-3xl border border-[var(--border)] bg-[var(--cream)] p-4 md:p-6 shadow-xs"
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
                                                className="grid grid-cols-[80px_minmax(0,1fr)] gap-4 rounded-2xl bg-white/70 p-3 sm:grid-cols-[110px_minmax(0,1fr)] sm:p-4 border border-[var(--border)]/50"
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
                                                        className="text-base font-bold text-[var(--ink)] hover:text-[var(--accent)]"
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
                                                        <div className="flex items-center rounded-lg border border-[var(--border)] bg-white">
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
                                                        <p className="mt-2 text-xs text-red-700 font-medium">
                                                            สินค้าไม่พร้อมขายหรือจำนวนเกินสต็อก
                                                            กรุณากลับไปแก้ไขตะกร้า
                                                        </p>
                                                    )}
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </section>

                                <Link href="/cart" className="flower-text-link inline-flex items-center gap-2">
                                    <ArrowLeft size={16} /> กลับไปแก้ไขตะกร้า
                                </Link>
                            </div>

                            {/* SECTION: Checkout Sidebar / Cost Summary */}
                            <aside className="min-w-0 rounded-3xl border border-[var(--border)] bg-[var(--rose-soft)] p-5 md:p-6 lg:sticky lg:top-6 shadow-xs">
                                <h2 className="mb-5 text-xl font-bold text-[var(--ink)]">
                                    สรุปค่าใช้จ่าย
                                </h2>

                                <dl className="mt-6 space-y-4 border-t border-[var(--border)] pt-5 text-sm">
                                    <div className="flex justify-between">
                                        <dt className="text-[var(--muted)]">
                                            รวมสินค้า ({cart.count} ช่อ)
                                        </dt>
                                        <dd className="font-semibold text-[var(--ink)]">
                                            {money(total)}
                                        </dd>
                                    </div>
                                    <div className="flex justify-between">
                                        <dt className="text-[var(--muted)]">ค่าจัดส่ง</dt>
                                        <dd className="font-semibold text-[var(--accent)]">
                                            ฟรี
                                        </dd>
                                    </div>
                                    <div className="flex justify-between border-t border-[var(--border)] pt-5">
                                        <dt className="font-bold text-base text-[var(--ink)]">
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
    <h2 className="mb-5 flex items-center gap-3 text-xl font-bold text-[var(--ink)]">
        <QrCode
            size={21}
            className="text-[var(--accent)]"
        />
        วิธีชำระเงิน
    </h2>

    <div className="flex items-center justify-between rounded-xl border border-[var(--border)]/60 bg-white/70 p-4">
        <div>
            <p className="text-sm font-bold text-[var(--ink)]">
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

    <div className="mt-5 flex flex-col items-center rounded-2xl border border-dashed border-[var(--border)] bg-white/40 px-5 py-4 text-center">
        <img
            src="/images/qrcode/qrcode.jpg"
            alt="BloomyShop Payment QR Code"
            className="mb-3 h-[200px] w-[200px] object-contain"
        />

        <p className="text-sm font-bold text-[var(--ink)]">
            BloomyShop
        </p>

        <p className="mt-1 text-xs text-[var(--muted)]">
            สแกนเพื่อชำระเงิน
        </p>
    </div>
</section>


                                {serverOrderError && (
                                    <p
                                        role="alert"
                                        className="mt-4 text-xs font-semibold text-red-600"
                                    >
                                        {serverOrderError}
                                    </p>
                                )}

                                <Button
                                    type="submit"
                                    className={`${primary} mt-6 w-full gap-2`}
                                    disabled={!canSubmit}
                                >
                                    {form.processing ? (
                                        <>
                                            <Loader2 size={16} className="animate-spin" />
                                            กำลังบันทึกคำสั่งซื้อ...
                                        </>
                                    ) : (
                                        <>
                                            ยืนยันคำสั่งซื้อ <ArrowRight size={17} />
                                        </>
                                    )}
                                </Button>

                                <p
                                    className="mt-3 text-center text-xs leading-6 text-[var(--muted)]"
                                    role="status"
                                >
                                    {!validCart
                                        ? 'กรุณาแก้ไขสินค้าที่หมดในตะกร้า'
                                        : !activeAddress
                                          ? 'กรุณาเลือกหรือเพิ่มที่อยู่จัดส่ง'
                                          : 'ยืนยันแล้วจะสร้างคำสั่งซื้อและตัดสต็อก'}
                                </p>

                                <div className="mt-5 flex items-center gap-3 border-t border-[var(--border)] pt-5 text-xs text-[var(--accent)] font-medium">
                                    <Truck size={20} /> ส่งฟรีทุกคำสั่งซื้อ ทั่วประเทศ
                                </div>
                            </aside>
                        </form>
                    </>
                )}
            </main>

            {/* MODAL DIALOG: Add / Edit Address */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="flower-dialog sm:max-w-xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold">
                            {modalMode === 'add'
                                ? 'เพิ่มที่อยู่จัดส่งใหม่'
                                : `แก้ไขที่อยู่: ${editingOriginalName}`}
                        </DialogTitle>
                        <DialogDescription className="text-xs text-[var(--muted)]">
                            กรอกรายละเอียดที่อยู่จัดส่งให้ครบถ้วนเพื่อใช้สำหรับส่งดอกไม้
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSaveAddress} className="mt-4 space-y-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="modal-address_name" className="text-xs font-semibold">
                                ชื่อที่อยู่ <span className="text-[var(--accent)]">*</span>
                            </Label>
                            <Input
                                id="modal-address_name"
                                placeholder="เช่น บ้าน, คอนโด, ที่ทำงาน"
                                value={modalData.address_name}
                                onChange={(e) =>
                                    setModalData((prev) => ({
                                        ...prev,
                                        address_name: e.target.value,
                                    }))
                                }
                                className="h-11 border-[var(--border)] bg-white text-sm"
                            />
                            {modalErrors.address_name && (
                                <p className="text-xs text-red-600 font-medium">
                                    {modalErrors.address_name}
                                </p>
                            )}
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-1.5">
                                <Label htmlFor="modal-recipient_name" className="text-xs font-semibold">
                                    ชื่อ–นามสกุลผู้รับ <span className="text-[var(--accent)]">*</span>
                                </Label>
                                <Input
                                    id="modal-recipient_name"
                                    placeholder="ชื่อและนามสกุล"
                                    value={modalData.recipient_name}
                                    onChange={(e) =>
                                        setModalData((prev) => ({
                                            ...prev,
                                            recipient_name: e.target.value,
                                        }))
                                    }
                                    className="h-11 border-[var(--border)] bg-white text-sm"
                                />
                                {modalErrors.recipient_name && (
                                    <p className="text-xs text-red-600 font-medium">
                                        {modalErrors.recipient_name}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="modal-phone_number" className="text-xs font-semibold">
                                    เบอร์โทรศัพท์ <span className="text-[var(--accent)]">*</span>
                                </Label>
                                <Input
                                    id="modal-phone_number"
                                    placeholder="0812345678"
                                    type="tel"
                                    maxLength={15}
                                    value={modalData.phone_number}
                                    onChange={(e) =>
                                        setModalData((prev) => ({
                                            ...prev,
                                            phone_number: e.target.value,
                                        }))
                                    }
                                    className="h-11 border-[var(--border)] bg-white text-sm"
                                />
                                {modalErrors.phone_number && (
                                    <p className="text-xs text-red-600 font-medium">
                                        {modalErrors.phone_number}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="modal-address_line" className="text-xs font-semibold">
                                รายละเอียดที่อยู่ (บ้านเลขที่ หมู่ อาคาร ซอย ถนน) <span className="text-[var(--accent)]">*</span>
                            </Label>
                            <Input
                                id="modal-address_line"
                                placeholder="บ้านเลขที่ ซอย ถนน รายละเอียดเพิ่มเติม"
                                value={modalData.address_line}
                                onChange={(e) =>
                                    setModalData((prev) => ({
                                        ...prev,
                                        address_line: e.target.value,
                                    }))
                                }
                                className="h-11 border-[var(--border)] bg-white text-sm"
                            />
                            {modalErrors.address_line && (
                                <p className="text-xs text-red-600 font-medium">
                                    {modalErrors.address_line}
                                </p>
                            )}
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-1.5">
                                <Label htmlFor="modal-subdistrict" className="text-xs font-semibold">
                                    ตำบล / แขวง <span className="text-[var(--accent)]">*</span>
                                </Label>
                                <Input
                                    id="modal-subdistrict"
                                    placeholder="ตำบล หรือ แขวง"
                                    value={modalData.subdistrict}
                                    onChange={(e) =>
                                        setModalData((prev) => ({
                                            ...prev,
                                            subdistrict: e.target.value,
                                        }))
                                    }
                                    className="h-11 border-[var(--border)] bg-white text-sm"
                                />
                                {modalErrors.subdistrict && (
                                    <p className="text-xs text-red-600 font-medium">
                                        {modalErrors.subdistrict}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="modal-district" className="text-xs font-semibold">
                                    อำเภอ / เขต <span className="text-[var(--accent)]">*</span>
                                </Label>
                                <Input
                                    id="modal-district"
                                    placeholder="อำเภอ หรือ เขต"
                                    value={modalData.district}
                                    onChange={(e) =>
                                        setModalData((prev) => ({
                                            ...prev,
                                            district: e.target.value,
                                        }))
                                    }
                                    className="h-11 border-[var(--border)] bg-white text-sm"
                                />
                                {modalErrors.district && (
                                    <p className="text-xs text-red-600 font-medium">
                                        {modalErrors.district}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-1.5">
                                <Label htmlFor="modal-province" className="text-xs font-semibold">
                                    จังหวัด <span className="text-[var(--accent)]">*</span>
                                </Label>
                                <Input
                                    id="modal-province"
                                    placeholder="จังหวัด"
                                    value={modalData.province}
                                    onChange={(e) =>
                                        setModalData((prev) => ({
                                            ...prev,
                                            province: e.target.value,
                                        }))
                                    }
                                    className="h-11 border-[var(--border)] bg-white text-sm"
                                />
                                {modalErrors.province && (
                                    <p className="text-xs text-red-600 font-medium">
                                        {modalErrors.province}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="modal-postal_code" className="text-xs font-semibold">
                                    รหัสไปรษณีย์ <span className="text-[var(--accent)]">*</span>
                                </Label>
                                <Input
                                    id="modal-postal_code"
                                    placeholder="รหัสไปรษณีย์ 5 หลัก"
                                    maxLength={5}
                                    inputMode="numeric"
                                    value={modalData.postal_code}
                                    onChange={(e) =>
                                        setModalData((prev) => ({
                                            ...prev,
                                            postal_code: e.target.value,
                                        }))
                                    }
                                    className="h-11 border-[var(--border)] bg-white text-sm"
                                />
                                {modalErrors.postal_code && (
                                    <p className="text-xs text-red-600 font-medium">
                                        {modalErrors.postal_code}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="mt-6 flex items-center justify-end gap-3 border-t border-[var(--border)] pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsModalOpen(false)}
                                className="h-10 rounded-full px-5 text-xs text-[var(--muted)] hover:bg-neutral-100"
                            >
                                ยกเลิก
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSubmittingAddress}
                                className="h-10 gap-1.5 rounded-full bg-[var(--accent)] px-6 text-xs text-white hover:bg-[var(--accent-hover)]"
                            >
                                {isSubmittingAddress ? (
                                    <>
                                        <Loader2 size={14} className="animate-spin" />
                                        กำลังบันทึก...
                                    </>
                                ) : (
                                    'บันทึกที่อยู่'
                                )}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            <StoreFooter />
        </div>
    );
}
