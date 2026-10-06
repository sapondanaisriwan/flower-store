import { Form, Head, Link } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { StoreAuthLayout } from '@/components/store/store-auth-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { login } from '@/routes';
import { store } from '@/routes/register';

type Props = { passwordRules: string };
export default function Register({ passwordRules }: Props) {
    return (
        <StoreAuthLayout register>
            <Head title="สมัครสมาชิก — My Flower Shop" />
            <Form
                {...store.form()}
                resetOnSuccess={['password', 'password_confirmation']}
                disableWhileProcessing
                className="space-y-5"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-2">
                            <Label htmlFor="name">ชื่อที่แสดง</Label>
                            <Input
                                id="name"
                                name="name"
                                required
                                maxLength={255}
                                autoComplete="name"
                                placeholder="อยากให้เราเรียกคุณว่าอะไร"
                                className="auth-input"
                                aria-invalid={!!errors.name}
                                aria-describedby={
                                    errors.name ? 'name-error' : undefined
                                }
                            />
                            <InputError id="name-error" message={errors.name} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email">อีเมล</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                required
                                maxLength={255}
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
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="grid content-start gap-2">
                                <Label htmlFor="password">รหัสผ่าน</Label>
                                <PasswordInput
                                    id="password"
                                    name="password"
                                    required
                                    autoComplete="new-password"
                                    placeholder="สร้างรหัสผ่าน"
                                    passwordrules={passwordRules}
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
                            <div className="grid content-start gap-2">
                                <Label htmlFor="password_confirmation">
                                    ยืนยันรหัสผ่าน
                                </Label>
                                <PasswordInput
                                    id="password_confirmation"
                                    name="password_confirmation"
                                    required
                                    autoComplete="new-password"
                                    placeholder="กรอกอีกครั้ง"
                                    passwordrules={passwordRules}
                                    className="auth-input"
                                    aria-invalid={
                                        !!errors.password_confirmation
                                    }
                                    aria-describedby={
                                        errors.password_confirmation
                                            ? 'confirmation-error'
                                            : undefined
                                    }
                                />
                                <InputError
                                    id="confirmation-error"
                                    message={errors.password_confirmation}
                                />
                            </div>
                        </div>
                        <Button
                            type="submit"
                            className="auth-submit mt-2"
                            disabled={processing}
                            data-test="register-user-button"
                        >
                            {processing && <Spinner />}
                            {processing ? 'กำลังสร้างบัญชี…' : 'สร้างบัญชีของฉัน'}
                            {!processing && <ArrowRight size={17} />}
                        </Button>
                        <p className="pt-2 text-center text-sm text-[var(--muted)]">
                            มีบัญชีอยู่แล้ว?{' '}
                            <Link href={login()} className="auth-link ml-1">
                                เข้าสู่ระบบ
                            </Link>
                        </p>
                    </>
                )}
            </Form>
        </StoreAuthLayout>
    );
}
