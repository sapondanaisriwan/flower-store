import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    ArrowDown,
    ArrowRight,
    Flower2,
    Heart,
    Package,
    Truck,
} from 'lucide-react';
import { useState } from 'react';
import { StoreFooter, StoreHeader } from '@/components/store/store-chrome';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { login, register } from '@/routes';
import '../../css/homepage.css';

const products = [
    {
        id: 1,
        name: 'Peachy Morning',
        thai: 'ช่อกุหลาบโทนพีช',
        price: 690,
        color: 'pink',
        image: '/images/homepage/bouquets.png',
        position: '74% 50%',
    },
    {
        id: 2,
        name: 'Ivory Whisper',
        thai: 'ช่อกุหลาบสีขาวครีม',
        price: 590,
        color: 'white',
        image: '/images/homepage/bouquets.png',
        position: '95% 60%',
    },
    {
        id: 3,
        name: 'A Little Romance',
        thai: 'ช่อดอกไม้โทนโรแมนติก',
        price: 790,
        color: 'pink',
        image: '/images/homepage/bouquets.png',
        position: '65% 35%',
    },
    {
        id: 4,
        name: 'Forever Yours',
        thai: 'ช่อกุหลาบสีแดงไวน์',
        price: 890,
        color: 'red',
        image: '/images/homepage/bouquets.png',
        position: '85% 80%',
    },
];
export default function Welcome() {
    const { auth } = usePage().props;
    const [filter, setFilter] = useState('all');
    const [notice, setNotice] = useState<string | null>(null);
    const isAdmin = auth.user?.role === 'admin';
    const visible = products.filter(
        (product) => filter === 'all' || product.color === filter,
    );
    return (
        <div className="flower-home">
            <Head title="My Flower Shop — ช่อดอกไม้แทนความรู้สึกดี ๆ">
                <meta
                    name="description"
                    content="ช่อดอกไม้ปลอมสำเร็จรูป สำหรับทุกความรู้สึกดี ๆ เลือกช่อที่ใช่และจัดส่งฟรีทั่วประเทศ"
                />
            </Head>
            <StoreHeader />
            <main id="home">
                <section className="flower-hero" aria-labelledby="hero-title">
                    <img
                        className="flower-hero-image"
                        src="/images/homepage/bouquets.png"
                        alt="ช่อดอกไม้โทนชมพูและครีม ห่อด้วยกระดาษและริบบิ้นอย่างประณีต"
                        fetchPriority="high"
                    />
                    <div className="flower-hero-shade" />
                    <div className="flower-container flower-hero-content">
                        <p className="flower-eyebrow">
                            <span /> LITTLE FLOWERS. LASTING FEELINGS.
                        </p>
                        <p className="flower-hero-intro">
                            ให้ทุกวัน มีความหมายมากกว่าเดิม
                        </p>
                        <h1 id="hero-title">
                            ช่อดอกไม้
                            <br />
                            แทนความรู้สึก<span>ดี ๆ</span>
                        </h1>
                        <p className="flower-hero-description">
                            ช่อดอกไม้ปลอมที่เก็บความสวยงามไว้ได้นาน
                            <br />
                            เพื่อคนสำคัญ หรือเป็นของขวัญให้ตัวคุณเอง
                        </p>
                        <Link className="flower-cta" href="/products">
                            เลือกช่อที่ใช่สำหรับคุณ <ArrowRight size={20} />
                        </Link>
                        <div className="flower-hero-note">
                            <span /> ไม่ต้องรอโอกาสพิเศษ ก็ส่งความรักได้
                        </div>
                    </div>
                    <a
                        className="flower-scroll"
                        href="#collection"
                        aria-label="เลื่อนดูสินค้า"
                    >
                        <ArrowDown size={18} />
                    </a>
                    <div className="flower-hero-caption">
                        Thoughtfully arranged.
                        <br />
                        <i>Beautifully kept.</i>
                    </div>
                </section>
                <section
                    className="flower-benefits flower-container"
                    id="delivery"
                    aria-label="บริการของเรา"
                >
                    <div>
                        <Truck />
                        <span>
                            <strong>ส่งฟรีทั่วประเทศ</strong>
                            <small>ทุกช่อ ทุกคำสั่งซื้อ</small>
                        </span>
                    </div>
                    <div>
                        <Flower2 />
                        <span>
                            <strong>ความสวยงามที่อยู่ได้นาน</strong>
                            <small>ช่อดอกไม้ปลอมสำเร็จรูป</small>
                        </span>
                    </div>
                    <div>
                        <Package />
                        <span>
                            <strong>เลือกช่อที่เป็นคุณ</strong>
                            <small>หลากสี หลายความรู้สึก</small>
                        </span>
                    </div>
                </section>
                <section
                    className="flower-collection flower-container"
                    id="collection"
                    aria-labelledby="collection-title"
                >
                    <div className="flower-section-heading">
                        <div>
                            <p className="flower-eyebrow">
                                HANDPICKED FOR YOUR HAPPY MOMENTS
                            </p>
                            <h2 id="collection-title">ช่อโปรด สำหรับคนพิเศษ</h2>
                            <p>ความรู้สึกดี ๆ เริ่มต้นจากดอกไม้สักช่อ</p>
                        </div>
                        <Link href="/products" className="flower-text-link">
                            ดูทุกช่อ <ArrowRight size={17} />
                        </Link>
                    </div>
                    <div
                        className="flower-filters"
                        role="group"
                        aria-label="กรองตามสี"
                    >
                        {[
                            { id: 'all', label: 'ทุกช่อ' },
                            { id: 'pink', label: 'ชมพู & พีช' },
                            { id: 'white', label: 'ขาวละมุน' },
                            { id: 'red', label: 'แดงโรแมนติก' },
                        ].map((item) => (
                            <button
                                key={item.id}
                                aria-pressed={filter === item.id}
                                className={filter === item.id ? 'selected' : ''}
                                onClick={() => setFilter(item.id)}
                            >
                                {item.label}
                            </button>
                        ))}
                        <span className="flower-preview-label">
                            คอลเลกชันตัวอย่าง
                        </span>
                    </div>
                    <div className="flower-product-grid">
                        {visible.map((product) => (
                            <article
                                className="flower-product"
                                key={product.id}
                            >
                                <div className="flower-product-image">
                                    <button
                                        className="flower-product-open"
                                        aria-label={`ดู ${product.thai}`}
                                        onClick={() =>
                                            router.visit(
                                                `/products/${product.id}`,
                                            )
                                        }
                                    >
                                        <img
                                            src={product.image}
                                            alt={product.thai}
                                            style={{
                                                objectPosition:
                                                    product.position,
                                            }}
                                            loading="lazy"
                                        />
                                        <span className="flower-product-overlay">
                                            ดูรายละเอียด <ArrowRight size={17} />
                                        </span>
                                    </button>
                                    {!isAdmin && (
                                        <button
                                            className="flower-heart"
                                            aria-label={`บันทึก ${product.thai}`}
                                            onClick={() =>
                                                setNotice(
                                                    auth.user
                                                        ? 'รายการโปรดจะพร้อมใช้งานเมื่อเชื่อมต่อระบบร้านค้า'
                                                        : 'เข้าสู่ระบบเพื่อใช้งานรายการโปรด',
                                                )
                                            }
                                        >
                                            <Heart size={18} />
                                        </button>
                                    )}
                                    <span className="flower-product-tag">
                                        ช่อดอกไม้ปลอม
                                    </span>
                                </div>
                                <div className="flower-product-info">
                                    <button
                                        onClick={() =>
                                            router.visit(
                                                `/products/${product.id}`,
                                            )
                                        }
                                    >
                                        <h3>{product.name}</h3>
                                        <p>{product.thai}</p>
                                    </button>
                                    <span className="flower-price">
                                        ฿{product.price.toLocaleString()}
                                    </span>
                                </div>
                                <p className="flower-unrated">ยังไม่มีคะแนน</p>
                            </article>
                        ))}
                    </div>
                </section>
                <section
                    className="flower-story flower-container"
                    id="our-story"
                >
                    <div className="flower-story-photo">
                        <img
                            src="/images/homepage/bouquets.png"
                            alt="รายละเอียดช่อดอกไม้และริบบิ้นโทนอ่อน"
                            loading="lazy"
                        />
                    </div>
                    <div className="flower-story-copy">
                        <p className="flower-eyebrow">MORE THAN JUST FLOWERS</p>
                        <h2>
                            บางความรู้สึก
                            <br />
                            สวยงามเกินกว่าจะโรยรา
                        </h2>
                        <p>
                            ไม่ว่าจะเป็นคำขอบคุณ คำยินดี หรือคำว่ารัก
                            <br />
                            ให้ช่อดอกไม้เป็นตัวแทนความรู้สึกของคุณ
                            <br />
                            และเก็บช่วงเวลาดี ๆ ไว้ให้นานขึ้น
                        </p>
                        <Link className="flower-text-link" href="/products">
                            ค้นหาช่อที่แทนใจคุณ <ArrowRight size={18} />
                        </Link>
                    </div>
                </section>
                <section className="flower-bottom-note">
                    <Flower2 size={22} strokeWidth={1.25} />
                    <p>A little bouquet. A lot of love.</p>
                    <span>เพราะความรู้สึกดี ๆ มอบให้กันได้ทุกวัน</span>
                </section>
            </main>
            <StoreFooter />

            <Dialog
                open={notice !== null}
                onOpenChange={(open) => {
                    if (!open) setNotice(null);
                }}
            >
                <DialogContent className="flower-dialog">
                    <DialogHeader>
                        <DialogTitle>
                            {auth.user
                                ? 'กำลังเตรียมร้านให้พร้อม'
                                : 'เก็บช่อที่ชอบไว้ด้วยกัน'}
                        </DialogTitle>
                        <DialogDescription>{notice}</DialogDescription>
                    </DialogHeader>
                    {!auth.user && (
                        <div className="flower-dialog-links">
                            <Link className="flower-cta" href={login()}>
                                เข้าสู่ระบบ <ArrowRight size={18} />
                            </Link>
                            <Link
                                className="flower-text-link"
                                href={register()}
                            >
                                สมัครสมาชิก
                            </Link>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
