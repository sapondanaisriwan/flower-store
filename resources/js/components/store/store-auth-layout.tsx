import { Link } from '@inertiajs/react';
import { ArrowLeft, Flower2, Heart, Sparkles } from 'lucide-react';
import type { ReactNode } from 'react';
import '../../../css/homepage.css';
import '../../../css/store-auth.css';

export function StoreAuthLayout({
    children,
    register = false,
}: {
    children: ReactNode;
    register?: boolean;
}) {
    return (
        <div className="flower-home store-auth">
            <div className="store-auth-frame">
                <aside className="store-auth-story" aria-label="My Flower Shop">
                    <img
                        src="/images/homepage/bouquets.png"
                        alt="ช่อดอกไม้โทนชมพูและครีม ห่อด้วยกระดาษและริบบิ้น"
                        className="store-auth-image"
                        fetchPriority="high"
                    />
                    <div className="store-auth-shade" />
                    <Link href="/" className="store-auth-brand">
                        <Flower2 size={30} strokeWidth={1.3} />
                        <span>
                            MY FLOWER SHOP
                            <small>made to last, made with love</small>
                        </span>
                    </Link>
                    <div className="store-auth-story-copy">
                        <span className="store-auth-tag">
                            <Sparkles size={14} /> LITTLE THINGS, LASTING
                            FEELINGS
                        </span>
                        <h2>
                            ความรู้สึกดี ๆ<br />
                            ที่อยู่ได้นานกว่าเดิม
                        </h2>
                        <p>
                            เก็บช่อที่ชอบ ส่งต่อความรู้สึกที่ใช่
                            <br />
                            ให้ทุกวันมีเรื่องเล็ก ๆ ที่ทำให้ยิ้มได้
                        </p>
                        <div className="store-auth-note">
                            <span>
                                <Heart size={17} strokeWidth={1.5} />
                            </span>
                            ช่อดอกไม้ปลอมสำเร็จรูป ด้วยความใส่ใจในทุกช่อ
                        </div>
                    </div>
                    <span className="store-auth-caption">
                        A BOUQUET OF EVERYDAY JOY
                    </span>
                </aside>
                <main className="store-auth-main">
                    <Link href="/" className="store-auth-back">
                        <ArrowLeft size={16} /> กลับไปเลือกชมดอกไม้
                    </Link>
                    <div className="store-auth-form">
                        <div className="store-auth-heading">
                            <span className="store-auth-flower">
                                <Flower2 size={27} strokeWidth={1.3} />
                            </span>
                            <p className="flower-eyebrow">
                                {register
                                    ? 'LET SOMETHING LOVELY BEGIN'
                                    : 'WELCOME BACK, FLOWER LOVER'}
                            </p>
                            <h1>
                                {register
                                    ? 'เริ่มต้นเรื่องราวดี ๆ'
                                    : 'ดีใจที่ได้พบคุณอีกครั้ง'}
                            </h1>
                            <p>
                                {register
                                    ? 'สร้างบัญชี แล้วเก็บช่อที่ชอบไว้ใกล้ตัวคุณ'
                                    : 'เข้าสู่ระบบ แล้วกลับมาหาช่อที่ทำให้คุณยิ้ม'}
                            </p>
                        </div>
                        {children}
                    </div>
                    <p className="store-auth-footer">
                        MY FLOWER SHOP <span>·</span> Made with a little love.
                    </p>
                </main>
            </div>
        </div>
    );
}
