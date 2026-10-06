import { Form, Head, Link } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import PasskeyVerify from '@/components/passkey-verify';
import { StoreAuthLayout } from '@/components/store/store-auth-layout';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';

type Props = { status?: string; canResetPassword: boolean };
export default function Login({ status, canResetPassword }: Props) {
    return (
        <StoreAuthLayout>
            <Head title="เข้าสู่ระบบ — My Flower Shop" />
            {status && (
                <div
                    role="status"
                    className="mb-5 rounded-xl bg-[var(--rose-soft)] p-4 text-sm text-[var(--accent)]"
                >
                    {status}
                </div>
            )}
            {/* <div className="auth-passkey">
                <PasskeyVerify
                    label="เข้าสู่ระบบด้วย Passkey"
                    loadingLabel="กำลังยืนยันตัวตน…"
                    separator="หรือใช้อีเมลของคุณ"
                />
            </div> */}
            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                disableWhileProcessing
                className="space-y-5"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-2">
                            <Label htmlFor="email">อีเมล</Label>
                            <Input
                                id="email"
                                type="email"
                                name="email"
                                required
                                autoComplete="email"
                                placeholder="you@example.com"
                                className="auth-input"
                                aria-invalid={!!errors.email}
                                aria-describedby={
                                    errors.email ? 'email-error' : undefined
                                }
                            />
                            <InputError
                                id="email-error"
                                message={errors.email}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password">รหัสผ่าน</Label>
                            <PasswordInput
                                id="password"
                                name="password"
                                required
                                autoComplete="current-password"
                                placeholder="กรอกรหัสผ่านของคุณ"
                                className="auth-input"
                                aria-invalid={!!errors.password}
                                aria-describedby={
                                    errors.password
                                        ? 'password-error'
                                        : undefined
                                }
                            />
                            <InputError
                                id="password-error"
                                message={errors.password}
                            />
                        </div>
                        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                            <div className="flex items-center gap-2.5">
                                <Checkbox
                                    id="remember"
                                    name="remember"
                                    className="border-[var(--border)] data-[state=checked]:border-[var(--accent)] data-[state=checked]:bg-[var(--accent)] data-[state=checked]:text-white"
                                />
                                <Label
                                    htmlFor="remember"
                                    className="text-xs font-normal text-[var(--muted)]"
                                >
                                    จดจำการเข้าสู่ระบบ
                                </Label>
                            </div>
                            {canResetPassword && (
                                <Link
                                    href={request()}
                                    className="auth-link text-xs"
                                >
                                    ลืมรหัสผ่าน?
                                </Link>
                            )}
                        </div>
                        <Button
                            type="submit"
                            className="auth-submit mt-2"
                            disabled={processing}
                            data-test="login-button"
                        >
                            {processing ? <Spinner /> : null}
                            {processing ? 'กำลังเข้าสู่ระบบ…' : 'เข้าสู่ระบบ'}
                            {!processing && <ArrowRight size={17} />}
                        </Button>
                        <p className="pt-2 text-center text-sm text-[var(--muted)]">
                            ยังไม่มีบัญชี?{' '}
                            <Link href={register()} className="auth-link ml-1">
                                สมัครสมาชิก
                            </Link>
                        </p>
                    </>
                )}
            </Form>
        </StoreAuthLayout>
    );
}
