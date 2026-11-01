import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    Check,
    Edit3,
    Flower2,
    Heart,
    Loader2,
    LoaderCircle,
    LogOut,
    MapPin,
    Package,
    Plus,
    ShieldCheck,
    Trash2,
    UserRound,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import DeleteUser from '@/components/delete-user';
import InputError from '@/components/input-error';
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
import { logout } from '@/routes';
import { edit, update } from '@/routes/profile';
import { send } from '@/routes/verification';
import { type DeliveryAddress } from '@/types/shop';
import '../../../css/homepage.css';

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

export default function Profile({
    mustVerifyEmail,
    status,
    addresses: initialAddresses = [],
}: {
    mustVerifyEmail: boolean;
    status?: string;
    addresses?: DeliveryAddress[];
}) {
    const { auth } = usePage().props;
    const form = useForm({
        username: auth.user.username,
        email: auth.user.email,
    });

    const [addressList, setAddressList] =
        useState<DeliveryAddress[]>(initialAddresses);

    useEffect(() => {
        setAddressList(initialAddresses);
    }, [initialAddresses]);

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
    const primary =
        'h-11 rounded-full bg-[var(--accent)] px-6 text-[var(--on-accent)] hover:bg-[var(--accent-hover)]';
    const inputStyle =
        'h-12 rounded-xl border-[var(--border)] bg-[var(--cream)] text-[var(--ink)] shadow-none focus-visible:border-[var(--accent)] focus-visible:ring-[var(--accent)]/20 dark:bg-[var(--cream)]';
    return (
        <div className="flower-home">
            <Head title="บัญชีของฉัน — My Flower Shop" />
            <StoreHeader current="profile" />
            <main className="flower-container min-h-[65vh] py-8 md:py-12">
                <nav
                    aria-label="เส้นทางหน้า"
                    className="mb-7 flex gap-2 text-xs text-[var(--muted)]"
                >
                    <Link href="/">หน้าแรก</Link>
                    <span>/</span>
                    <span aria-current="page">บัญชีของฉัน</span>
                </nav>
                <div className="mb-8">
                    <p className="flower-eyebrow">
                        A LITTLE SPACE, JUST FOR YOU
                    </p>
                    <h1 className="mt-2 text-3xl font-bold md:text-4xl">
                        บัญชีของฉัน
                    </h1>
                    <p className="mt-3 text-sm text-[var(--muted)]">
                        ดูแลข้อมูลของคุณ แล้วให้เราดูแลทุกช่อแห่งความสุข
                    </p>
                </div>
                <div className="grid items-start gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
                    <aside className="overflow-hidden rounded-2xl border border-[var(--border)]">
                        <div className="bg-[var(--rose-soft)] p-6">
                            <Flower2
                                size={32}
                                strokeWidth={1.3}
                                className="mb-4 text-[var(--accent)]"
                            />
                            <p className="text-xs text-[var(--muted)]">
                                ยินดีต้อนรับกลับมา
                            </p>
                            <h2 className="mt-2 text-xl font-bold break-words">
                                {auth.user.username}
                            </h2>
                            <p className="mt-2 text-xs leading-6 break-all text-[var(--muted)]">
                                {auth.user.email}
                            </p>
                        </div>
                        <nav aria-label="เมนูบัญชี" className="space-y-2 p-3">
                            <Link
                                href={edit()}
                                aria-current="page"
                                className="flex items-center gap-3 rounded-xl bg-[var(--rose-soft)] px-4 py-3 text-sm font-bold text-[var(--accent)]"
                            >
                                <UserRound size={18} /> ข้อมูลส่วนตัว
                            </Link>
                            {auth.user.role !== 'admin' && (
                                <>
                                    <Link
                                        href="/orders"
                                        className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm hover:bg-[var(--rose-soft)]"
                                    >
                                        <Package size={18} /> ประวัติคำสั่งซื้อ
                                    </Link>
                                    <Link
                                        href="/wishlist"
                                        className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm hover:bg-[var(--rose-soft)]"
                                    >
                                        <Heart size={18} /> รายการโปรด
                                    </Link>
                                </>
                            )}
                            {/* <Link
                                href="/settings/security"
                                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm hover:bg-[var(--rose-soft)]"
                            >
                                <ShieldCheck size={18} /> ความปลอดภัย
                            </Link> */}
                            <div className="border-t border-[var(--border)] pt-2">
                                <Link
                                    href={logout()}
                                    as="button"
                                    className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm text-[var(--muted)] hover:bg-[var(--rose-soft)]"
                                >
                                    <LogOut size={18} /> ออกจากระบบ
                                </Link>
                            </div>
                        </nav>
                    </aside>
                    <div className="min-w-0 space-y-6">
                        <section className="rounded-2xl border border-[var(--border)] p-5 sm:p-8">
                            <div className="mb-7 border-b border-[var(--border)] pb-5">
                                <h2 className="text-xl font-bold">ข้อมูลส่วนตัว</h2>
                                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                                    อัปเดตชื่อและอีเมลที่ใช้กับบัญชีของคุณ
                                </p>
                            </div>
                            <form
                                onSubmit={(event) => {
                                    event.preventDefault();
                                    form.patch(update().url, {
                                        preserveScroll: true,
                                        onSuccess: () => form.setDefaults(),
                                        onError: (errors) =>
                                            document
                                                .getElementById(
                                                    errors.username
                                                        ? 'username'
                                                        : 'email',
                                                )
                                                ?.focus(),
                                    });
                                }}
                                className="space-y-6"
                            >
                                <div className="grid gap-6 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="username">
                                            ชื่อที่แสดง{' '}
                                            <span aria-hidden="true">*</span>
                                        </Label>
                                        <Input
                                            id="username"
                                            name="username"
                                            value={form.data.username}
                                            onChange={(event) =>
                                                form.setData(
                                                    'username',
                                                    event.target.value,
                                                )
                                            }
                                            required
                                            maxLength={255}
                                            autoComplete="username"
                                            disabled={form.processing}
                                            aria-invalid={
                                                !!form.errors.username
                                            }
                                            aria-describedby={
                                                form.errors.username
                                                    ? 'username-error'
                                                    : undefined
                                            }
                                            className={inputStyle}
                                        />
                                        <InputError
                                            id="username-error"
                                            message={form.errors.username}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">
                                            อีเมล{' '}
                                            <span aria-hidden="true">*</span>
                                        </Label>
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            value={form.data.email}
                                            // disabled={form.processing}
                                            onChange={(event) =>
                                                form.setData(
                                                    'email',
                                                    event.target.value,
                                                )
                                            }
                                            required
                                            maxLength={255}
                                            autoComplete="email"
                                            disabled={true}
                                            aria-invalid={!!form.errors.email}
                                            aria-describedby={
                                                form.errors.email
                                                    ? 'email-error'
                                                    : 'email-hint'
                                            }
                                            className={inputStyle}
                                        />
                                        <InputError
                                            id="email-error"
                                            message={form.errors.email}
                                        />
                                        <p
                                            id="email-hint"
                                            className="text-xs leading-6 text-[var(--muted)]"
                                        >
                                            ใช้อีเมลนี้สำหรับเข้าสู่ระบบ
                                        </p>
                                    </div>
                                </div>
                                {mustVerifyEmail &&
                                    auth.user.email_verified_at === null && (
                                        <div className="rounded-xl bg-[var(--rose-soft)] p-4 text-sm leading-7">
                                            <p>อีเมลของคุณยังไม่ได้รับการยืนยัน</p>
                                            <Link
                                                href={send()}
                                                as="button"
                                                className="font-bold text-[var(--accent)] underline"
                                            >
                                                ส่งอีเมลยืนยันอีกครั้ง
                                            </Link>
                                            {status ===
                                                'verification-link-sent' && (
                                                <p
                                                    role="status"
                                                    className="mt-2 text-[var(--accent)]"
                                                >
                                                    ส่งลิงก์ยืนยันแล้ว
                                                    กรุณาตรวจสอบกล่องจดหมาย
                                                </p>
                                            )}
                                        </div>
                                    )}
                                <div className="flex flex-wrap items-center gap-3 border-t border-[var(--border)] pt-6">
                                    <Button
                                        type="submit"
                                        className={primary}
                                        disabled={
                                            form.processing || !form.isDirty
                                        }
                                        data-test="update-profile-button"
                                    >
                                        {form.processing && (
                                            <LoaderCircle
                                                size={16}
                                                className="animate-spin"
                                            />
                                        )}
                                        {form.processing
                                            ? 'กำลังบันทึก…'
                                            : 'บันทึกการเปลี่ยนแปลง'}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        className="h-11 rounded-full text-[var(--muted)] hover:bg-[var(--rose-soft)]"
                                        disabled={
                                            form.processing || !form.isDirty
                                        }
                                        onClick={() => {
                                            form.reset();
                                            form.clearErrors();
                                        }}
                                    >
                                        ยกเลิก
                                    </Button>
                                    {form.recentlySuccessful && (
                                        <p
                                            role="status"
                                            className="flex items-center gap-1.5 text-sm text-[var(--accent)]"
                                        >
                                            <Check size={16} /> บันทึกข้อมูลแล้ว
                                        </p>
                                    )}
                                </div>
                            </form>
                        </section>

                        {auth.user.role !== 'admin' && (
                            <section className="rounded-2xl border border-[var(--border)] p-5 sm:p-8">
                                <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] pb-5">
                                    <div>
                                        <h2 className="flex items-center gap-2.5 text-xl font-bold">
                                            <MapPin
                                                size={21}
                                                className="text-[var(--accent)]"
                                            />
                                            ที่อยู่จัดส่งของฉัน (
                                            {addressList.length})
                                        </h2>
                                        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                                            จัดการที่อยู่สำหรับจัดส่งดอกไม้ของคุณ
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
                                    <div className="my-2 rounded-2xl border border-dashed border-[var(--border)] bg-white/50 p-8 text-center">
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
                                        {addressList.map((addr) => (
                                            <div
                                                key={addr.address_name}
                                                className="relative flex flex-col justify-between rounded-2xl border border-[var(--border)] bg-white/60 p-4 text-left transition-all duration-200 hover:border-[var(--accent)]/40 hover:bg-white"
                                            >
                                                <div>
                                                    <div className="mb-2 flex items-center justify-between gap-2">
                                                        <span className="inline-flex items-center rounded-full bg-[var(--rose)] px-2.5 py-0.5 text-xs font-bold text-[var(--accent)]">
                                                            {addr.address_name}
                                                        </span>
                                                    </div>

                                                    <div className="text-sm font-bold text-[var(--ink)]">
                                                        {addr.recipient_name}
                                                        <span className="ml-2 text-xs font-normal text-[var(--muted)]">
                                                            {addr.phone_number}
                                                        </span>
                                                    </div>

                                                    <p className="mt-1.5 text-xs leading-relaxed text-[var(--muted)]">
                                                        {addr.address_line} ต.
                                                        {addr.subdistrict} อ.
                                                        {addr.district} จ.
                                                        {addr.province}{' '}
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
                                        ))}

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
                            </section>
                        )}
                    </div>
                </div>
            </main>

            {/* MODAL DIALOG: Add / Edit Address */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="flower-dialog max-h-[90vh] overflow-y-auto sm:max-w-xl">
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

                    <form
                        onSubmit={handleSaveAddress}
                        className="mt-4 space-y-4"
                    >
                        <div className="space-y-1.5">
                            <Label
                                htmlFor="modal-address_name"
                                className="text-xs font-semibold"
                            >
                                ชื่อที่อยู่{' '}
                                <span className="text-[var(--accent)]">*</span>
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
                                <p className="text-xs font-medium text-red-600">
                                    {modalErrors.address_name}
                                </p>
                            )}
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-1.5">
                                <Label
                                    htmlFor="modal-recipient_name"
                                    className="text-xs font-semibold"
                                >
                                    ชื่อ–นามสกุลผู้รับ{' '}
                                    <span className="text-[var(--accent)]">
                                        *
                                    </span>
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
                                    <p className="text-xs font-medium text-red-600">
                                        {modalErrors.recipient_name}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <Label
                                    htmlFor="modal-phone_number"
                                    className="text-xs font-semibold"
                                >
                                    เบอร์โทรศัพท์{' '}
                                    <span className="text-[var(--accent)]">
                                        *
                                    </span>
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
                                    <p className="text-xs font-medium text-red-600">
                                        {modalErrors.phone_number}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label
                                htmlFor="modal-address_line"
                                className="text-xs font-semibold"
                            >
                                รายละเอียดที่อยู่ (บ้านเลขที่ หมู่ อาคาร ซอย
                                ถนน){' '}
                                <span className="text-[var(--accent)]">*</span>
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
                                <p className="text-xs font-medium text-red-600">
                                    {modalErrors.address_line}
                                </p>
                            )}
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-1.5">
                                <Label
                                    htmlFor="modal-subdistrict"
                                    className="text-xs font-semibold"
                                >
                                    ตำบล / แขวง{' '}
                                    <span className="text-[var(--accent)]">
                                        *
                                    </span>
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
                                    <p className="text-xs font-medium text-red-600">
                                        {modalErrors.subdistrict}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <Label
                                    htmlFor="modal-district"
                                    className="text-xs font-semibold"
                                >
                                    อำเภอ / เขต{' '}
                                    <span className="text-[var(--accent)]">
                                        *
                                    </span>
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
                                    <p className="text-xs font-medium text-red-600">
                                        {modalErrors.district}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-1.5">
                                <Label
                                    htmlFor="modal-province"
                                    className="text-xs font-semibold"
                                >
                                    จังหวัด{' '}
                                    <span className="text-[var(--accent)]">
                                        *
                                    </span>
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
                                    <p className="text-xs font-medium text-red-600">
                                        {modalErrors.province}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <Label
                                    htmlFor="modal-postal_code"
                                    className="text-xs font-semibold"
                                >
                                    รหัสไปรษณีย์{' '}
                                    <span className="text-[var(--accent)]">
                                        *
                                    </span>
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
                                    <p className="text-xs font-medium text-red-600">
                                        {modalErrors.postal_code}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="mt-6 flex items-center justify-end gap-3 border-t border-[var(--border)] pt-4">
                            <Button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="h-10 gap-1.5 rounded-full bg-[var(--accent)] px-6 text-xs text-white hover:bg-[var(--accent-hover)]"
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
                                        <Loader2
                                            size={14}
                                            className="animate-spin"
                                        />
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
