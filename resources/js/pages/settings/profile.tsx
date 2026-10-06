import { Head, Link, useForm, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    Check,
    Flower2,
    Heart,
    LoaderCircle,
    LogOut,
    Package,
    ShieldCheck,
    UserRound,
} from 'lucide-react';
import DeleteUser from '@/components/delete-user';
import InputError from '@/components/input-error';
import { StoreFooter, StoreHeader } from '@/components/store/store-chrome';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { logout } from '@/routes';
import { edit, update } from '@/routes/profile';
import { send } from '@/routes/verification';
import '../../../css/homepage.css';

export default function Profile({
    mustVerifyEmail,
    status,
}: {
    mustVerifyEmail: boolean;
    status?: string;
}) {
    const { auth } = usePage().props;
    const form = useForm({ name: auth.user.name, email: auth.user.email });
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
                                {auth.user.name}
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
                                                    errors.name
                                                        ? 'name'
                                                        : 'email',
                                                )
                                                ?.focus(),
                                    });
                                }}
                                className="space-y-6"
                            >
                                <div className="grid gap-6 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">
                                            ชื่อที่แสดง{' '}
                                            <span aria-hidden="true">*</span>
                                        </Label>
                                        <Input
                                            id="name"
                                            name="name"
                                            value={form.data.name}
                                            onChange={(event) =>
                                                form.setData(
                                                    'name',
                                                    event.target.value,
                                                )
                                            }
                                            required
                                            maxLength={255}
                                            autoComplete="name"
                                            disabled={form.processing}
                                            aria-invalid={!!form.errors.name}
                                            aria-describedby={
                                                form.errors.name
                                                    ? 'name-error'
                                                    : undefined
                                            }
                                            className={inputStyle}
                                        />
                                        <InputError
                                            id="name-error"
                                            message={form.errors.name}
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
                                            onChange={(event) =>
                                                form.setData(
                                                    'email',
                                                    event.target.value,
                                                )
                                            }
                                            required
                                            maxLength={255}
                                            autoComplete="email"
                                            disabled={form.processing}
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
                        {/* <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-[var(--rose-soft)] p-6">
                            <div className="flex gap-3">
                                <ShieldCheck
                                    size={23}
                                    className="shrink-0 text-[var(--accent)]"
                                />
                                <div>
                                    <h2 className="font-bold">
                                        ดูแลบัญชีให้ปลอดภัย
                                    </h2>
                                    <p className="mt-2 text-xs leading-6 text-[var(--muted)]">
                                        จัดการรหัสผ่านและวิธีเข้าสู่ระบบของคุณ
                                    </p>
                                </div>
                            </div>
                            <Link
                                href="/settings/security"
                                className="flower-text-link text-sm"
                            >
                                ตั้งค่าความปลอดภัย <ArrowRight size={16} />
                            </Link>
                        </section> */}
                        {/* <details className="rounded-2xl border border-[var(--border)] p-5 sm:p-6">
                            <summary className="cursor-pointer text-sm text-[var(--muted)]">
                                จัดการการลบบัญชี
                            </summary>
                            <div className="mt-6">
                                <DeleteUser />
                            </div>
                        </details> */}
                    </div>
                </div>
            </main>
            <StoreFooter />
        </div>
    );
}
