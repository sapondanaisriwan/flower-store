import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    Ban,
    Check,
    CheckCircle2,
    Clock,
    DollarSign,
    Edit3,
    Eye,
    Filter,
    Flower2,
    Layers,
    Mail,
    Minus,
    Package,
    Plus,
    RotateCcw,
    Save,
    Search,
    ShieldAlert,
    ShieldCheck,
    ShoppingBag,
    Star,
    Tag,
    Trash2,
    Truck,
    Unlock,
    Upload,
    UserCheck,
    UserRound,
    Users,
    X,
} from 'lucide-react';
import React, { useState } from 'react';
import '../../css/homepage.css';

interface OrderItem {
    id: number;
    name: string;
    variant: string;
    price: number;
    quantity: number;
    image: string;
    position?: string;
}

interface Order {
    id: string;
    date: string;
    total: number;
    status: 'delivery' | 'success';
    items: OrderItem[];
}

interface UserAccount {
    id: number;
    name: string;
    email: string;
    status: 'active' | 'blocked';
    joined: string;
    ordersCount: number;
}

interface ProductItem {
    id: number;
    name: string;
    description?: string;
    thai?: string;
    price: number;
    color: string;
    size: 'S' | 'M' | 'L';
    rating: number;
    stock: number;
    position?: string;
    image: string;
}

const initialOrders: Order[] = [
    {
        id: 'ORD-2026-0402',
        date: 'Ordered on April 2, 2026, at 11:11 AM',
        total: 1998,
        status: 'delivery',
        items: [
            {
                id: 1,
                name: 'Peachy Morning Bouquet',
                variant: 'Color Green · Size M',
                price: 999,
                quantity: 1,
                image: '/images/homepage/bouquets.png',
                position: '74% 50%',
            },
            {
                id: 2,
                name: 'Ivory Whisper Roses',
                variant: 'Color Green · Size M',
                price: 999,
                quantity: 1,
                image: '/images/homepage/bouquets.png',
                position: '95% 60%',
            },
        ],
    },
    {
        id: 'ORD-2026-0404',
        date: 'Ordered on April 4, 2026, at 11:11 AM',
        total: 999,
        status: 'success',
        items: [
            {
                id: 3,
                name: 'A Little Romance Arrangement',
                variant: 'Color Green · Size M',
                price: 999,
                quantity: 1,
                image: '/images/homepage/bouquets.png',
                position: '65% 35%',
            },
            {
                id: 4,
                name: 'Forever Yours Special Edition',
                variant: 'Color Green · Size M',
                price: 999,
                quantity: 1,
                image: '/images/homepage/bouquets.png',
                position: '85% 80%',
            },
        ],
    },
];

const initialUsers: UserAccount[] = [
    {
        id: 1,
        name: 'Myname lastname',
        email: 'eieiei@email.com',
        status: 'active',
        joined: 'March 14, 2026',
        ordersCount: 4,
    },
    {
        id: 2,
        name: 'Ploy Pailin Srisuk',
        email: 'eieiei@email.com',
        status: 'active',
        joined: 'March 20, 2026',
        ordersCount: 2,
    },
    {
        id: 3,
        name: 'Nattawut Somchai',
        email: 'eieiei@email.com',
        status: 'active',
        joined: 'March 28, 2026',
        ordersCount: 1,
    },
    {
        id: 4,
        name: 'Chanya Wongsuwan',
        email: 'eieiei@email.com',
        status: 'active',
        joined: 'April 01, 2026',
        ordersCount: 5,
    },
    {
        id: 5,
        name: 'Thanatorn Prasert',
        email: 'eieiei@email.com',
        status: 'active',
        joined: 'April 03, 2026',
        ordersCount: 3,
    },
    {
        id: 6,
        name: 'Akarin Chaiwong',
        email: 'eieiei@email.com',
        status: 'blocked',
        joined: 'January 18, 2026',
        ordersCount: 0,
    },
];

const initialProducts: ProductItem[] = [
    {
        id: 1,
        name: 'Peachy Morning',
        description: 'ช่อกุหลาบโทนพีช ผสมผสานกลิ่นอายความอบอุ่นและสดใส เหมาะสำหรับทุกโอกาสสำคัญ',
        thai: 'ช่อกุหลาบโทนพีช',
        price: 999,
        color: 'red',
        size: 'M',
        rating: 4.5,
        stock: 8,
        position: '74% 50%',
        image: '/images/homepage/bouquets.png',
    },
    {
        id: 2,
        name: 'Ivory Whisper',
        description: 'ช่อกุหลาบสีขาวครีม บริสุทธิ์ เรียบหรู ประณีตด้วยริบบิ้นผ้าซาตินคุณภาพพรีเมียม',
        thai: 'ช่อกุหลาบสีขาวครีม',
        price: 999,
        color: 'green',
        size: 'S',
        rating: 4.5,
        stock: 5,
        position: '50% 90%',
        image: '/images/homepage/bouquets.png',
    },
    {
        id: 3,
        name: 'A Little Romance',
        description: 'ช่อดอกไม้ชมพูหวานละมุน สื่อถึงความรักและความห่วงใยที่ยืนยาวอย่างงดงาม',
        thai: 'ช่อดอกไม้ชมพูโรแมนติก',
        price: 999,
        color: 'blue',
        size: 'L',
        rating: 4.5,
        stock: 12,
        position: '70% 20%',
        image: '/images/homepage/bouquets.png',
    },
    {
        id: 4,
        name: 'Forever Yours',
        description: 'ช่อกุหลาบแดงเข้มคลาสสิก แทนความรู้สึกจากหัวใจ มอบความประทับใจไม่รู้ลืม',
        thai: 'ช่อกุหลาบแดงหรูหรา',
        price: 999,
        color: 'red',
        size: 'M',
        rating: 4.5,
        stock: 6,
        position: '100% 80%',
        image: '/images/homepage/bouquets.png',
    },
    {
        id: 5,
        name: 'Sunlit Meadow',
        description: 'ช่อดอกไม้วันสดใส ผสมดอกไม้หลากสีสัน เติมพลังบวกให้ทุกเช้าวันใหม่',
        thai: 'ช่อดอกไม้วันสดใส',
        price: 999,
        color: 'green',
        size: 'M',
        rating: 4.5,
        stock: 10,
        position: '48% 85%',
        image: '/images/homepage/bouquets.png',
    },
];

export default function AdminPage({
    initialTab = 'products',
    initialEditId,
}: {
    initialTab?: 'orders' | 'users' | 'products';
    initialEditId?: number;
}) {
    const [activeNav, setActiveNav] = useState<'orders' | 'users' | 'products'>(initialTab);
    const [orders, setOrders] = useState<Order[]>(initialOrders);
    const [users, setUsers] = useState<UserAccount[]>(initialUsers);
    const [products, setProducts] = useState<ProductItem[]>(initialProducts);

    // Editing State (From Wireframe Edit Product Page)
    const [editingProduct, setEditingProduct] = useState<ProductItem | null>(() => {
        if (initialEditId) {
            return initialProducts.find((p) => p.id === initialEditId) || initialProducts[0];
        }
        return null;
    });

    // Form fields for editing
    const [editName, setEditName] = useState(editingProduct?.name || '');
    const [editPrice, setEditPrice] = useState(editingProduct?.price || 999);
    const [editDesc, setEditDesc] = useState(
        editingProduct?.description || 'descriptions descriptions \ndescriptions'
    );
    const [editColor, setEditColor] = useState<string>(editingProduct?.color || 'red');
    const [editSize, setEditSize] = useState<'S' | 'M' | 'L'>(editingProduct?.size || 'M');
    const [editStock, setEditStock] = useState<number>(editingProduct?.stock || 1);
    const [showSaveToast, setShowSaveToast] = useState(false);

    // Global Search
    const [searchQuery, setSearchQuery] = useState('');

    // Orders Filter State
    const [orderStatusFilter, setOrderStatusFilter] = useState<'all' | 'delivery' | 'success'>('all');

    // Users Filter State
    const [userStatusFilter, setUserStatusFilter] = useState<'all' | 'active' | 'blocked'>('all');

    // Products Filter State
    const [selectedColors, setSelectedColors] = useState<string[]>([]);
    const [selectedCostRanges, setSelectedCostRanges] = useState<string[]>([]);
    const [selectedRatings, setSelectedRatings] = useState<number[]>([]);

    // Modal Add Product State
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newProductName, setNewProductName] = useState('');
    const [newProductPrice, setNewProductPrice] = useState('999');
    const [newProductColor, setNewProductColor] = useState('red');
    const [newProductStock, setNewProductStock] = useState('10');

    // Start editing a product
    const handleStartEdit = (product: ProductItem) => {
        setEditingProduct(product);
        setEditName(product.name);
        setEditPrice(product.price);
        setEditDesc(product.description || 'descriptions descriptions \ndescriptions');
        setEditColor(product.color || 'red');
        setEditSize(product.size || 'M');
        setEditStock(product.stock || 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Save edited product
    const handleSaveEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingProduct) return;

        setProducts((prev) =>
            prev.map((p) =>
                p.id === editingProduct.id
                    ? {
                          ...p,
                          name: editName,
                          price: editPrice,
                          description: editDesc,
                          color: editColor,
                          size: editSize,
                          stock: editStock,
                      }
                    : p
            )
        );

        setShowSaveToast(true);
        setTimeout(() => setShowSaveToast(false), 3000);
    };

    // Toggle Order Status
    const handleConfirmSuccess = (orderId: string) => {
        setOrders((prev) =>
            prev.map((order) =>
                order.id === orderId ? { ...order, status: 'success' } : order
            )
        );
    };

    // Toggle User Block Status
    const handleToggleUserBlock = (userId: number) => {
        setUsers((prev) =>
            prev.map((user) => {
                if (user.id === userId) {
                    return {
                        ...user,
                        status: user.status === 'active' ? 'blocked' : 'active',
                    };
                }
                return user;
            })
        );
    };

    // Delete Product
    const handleDeleteProduct = (productId: number) => {
        setProducts((prev) => prev.filter((p) => p.id !== productId));
        if (editingProduct?.id === productId) {
            setEditingProduct(null);
        }
    };

    // Add Product Submit
    const handleAddProduct = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newProductName.trim()) return;

        const newId = Date.now();
        const created: ProductItem = {
            id: newId,
            name: newProductName.trim(),
            description: 'ช่อดอกไม้สดใหม่ บรรจงจัดด้วยความประณีต',
            thai: 'ช่อดอกไม้คอลเลกชันใหม่',
            price: Number(newProductPrice) || 999,
            color: newProductColor,
            size: 'M',
            rating: 5.0,
            stock: Number(newProductStock) || 10,
            image: '/images/homepage/bouquets.png',
            position: '50% 50%',
        };

        setProducts([created, ...products]);
        setNewProductName('');
        setNewProductPrice('999');
        setIsAddModalOpen(false);
    };

    // Color Filter Toggle
    const toggleColorFilter = (color: string) => {
        setSelectedColors((prev) =>
            prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
        );
    };

    // Cost Filter Toggle
    const toggleCostRange = (range: string) => {
        setSelectedCostRanges((prev) =>
            prev.includes(range) ? prev.filter((r) => r !== range) : [...prev, range]
        );
    };

    // Rating Filter Toggle
    const toggleRatingFilter = (rating: number) => {
        setSelectedRatings((prev) =>
            prev.includes(rating) ? prev.filter((r) => r !== rating) : [...prev, rating]
        );
    };

    const resetProductFilters = () => {
        setSelectedColors([]);
        setSelectedCostRanges([]);
        setSelectedRatings([]);
        setSearchQuery('');
    };

    // Filtered Products
    const filteredProducts = products.filter((p) => {
        const matchesSearch =
            searchQuery.trim() === '' ||
            p.name.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesColor =
            selectedColors.length === 0 || selectedColors.includes(p.color);

        const matchesCost =
            selectedCostRanges.length === 0 ||
            selectedCostRanges.some((range) => {
                if (range === '0-100') return p.price <= 100;
                if (range === '100-200') return p.price > 100 && p.price <= 200;
                if (range === '200-300') return p.price > 200 && p.price <= 300;
                if (range === '500-1000') return p.price >= 500 && p.price <= 1000;
                return true;
            });

        const matchesRating =
            selectedRatings.length === 0 ||
            selectedRatings.some((r) => Math.floor(p.rating) === r);

        return matchesSearch && matchesColor && matchesCost && matchesRating;
    });

    // Filtered Users
    const filteredUsers = users.filter((u) => {
        const matchesStatus =
            userStatusFilter === 'all' || u.status === userStatusFilter;
        const matchesSearch =
            searchQuery.trim() === '' ||
            u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.email.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    // Filtered Orders
    const filteredOrders = orders.filter((o) => {
        const matchesStatus =
            orderStatusFilter === 'all' || o.status === orderStatusFilter;
        const matchesSearch =
            searchQuery.trim() === '' ||
            o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            o.date.toLowerCase().includes(searchQuery.toLowerCase()) ||
            o.items.some((item) =>
                item.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
        return matchesStatus && matchesSearch;
    });

    const activeUsersCount = users.filter((u) => u.status === 'active').length;
    const blockedUsersCount = users.filter((u) => u.status === 'blocked').length;
    const deliveryOrdersCount = orders.filter((o) => o.status === 'delivery').length;
    const successOrdersCount = orders.filter((o) => o.status === 'success').length;

    // Related / Other products for the bottom section of Edit Page (Wireframe: 3 cards at bottom)
    const otherProducts = products.filter((p) => p.id !== editingProduct?.id).slice(0, 3);

    return (
        <div className="flower-home min-h-screen bg-[var(--cream)] text-[var(--ink)] antialiased">
            <Head
                title={
                    editingProduct
                        ? `Edit: ${editingProduct.name} — My Flower Shop Admin`
                        : activeNav === 'products'
                        ? 'Admin Products Management — My Flower Shop'
                        : activeNav === 'users'
                        ? 'Admin User Management — My Flower Shop'
                        : 'Admin Order Management — My Flower Shop'
                }
            />

            {/* Announcement Banner */}
            <div className="flower-announcement">
                <ShieldCheck size={15} /> Admin Control Center
                <span>FLOWER SHOP MANAGEMENT CONSOLE</span>
            </div>

            {/* Top Navigation Bar */}
            <header className="sticky top-0 z-30 border-b border-[var(--border)]/70 bg-[var(--cream)]/95 backdrop-blur-md">
                <div className="flower-container flex h-24 items-center justify-between gap-6">
                    {/* Brand */}
                    <Link
                        href="/"
                        className="flower-brand group transition-transform duration-200 hover:scale-[1.02]"
                        title="Return to Main Store"
                    >
                        <Flower2
                            size={34}
                            strokeWidth={1.3}
                            className="text-[var(--accent)] transition-transform duration-300 group-hover:rotate-12"
                        />
                        <span className="flex flex-col">
                            <span className="font-bold tracking-tight">MY FLOWER SHOP</span>
                            <span className="flower-brand-bottom text-xs tracking-widest text-[var(--muted)]">
                                ADMIN <i>·</i> portal
                            </span>
                        </span>
                    </Link>

                    {/* Search Bar */}
                    <div className="relative mx-4 flex max-w-md flex-1 items-center">
                        <div className="relative w-full">
                            <input
                                type="text"
                                placeholder={
                                    activeNav === 'products'
                                        ? 'Search bouquet catalog...'
                                        : activeNav === 'users'
                                        ? 'Search users by name or email...'
                                        : 'Search orders, items, date...'
                                }
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="h-12 w-full rounded-full border border-[var(--border)] bg-white px-5 pr-14 text-sm text-[var(--ink)] placeholder:text-[var(--muted)] transition-all focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 focus:outline-none"
                            />
                            <button
                                type="button"
                                aria-label="Search"
                                className="absolute right-1.5 top-1.5 grid size-9 place-items-center rounded-full bg-[var(--accent)] text-white transition-all hover:bg-[var(--accent-hover)] active:scale-95"
                            >
                                <Search size={18} strokeWidth={2} />
                            </button>
                        </div>
                    </div>

                    {/* Admin User Profile */}
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-3 rounded-full border border-[var(--border)] bg-white/80 py-1.5 pr-4 pl-2 shadow-xs backdrop-blur-xs">
                            <div className="grid size-9 place-items-center rounded-full bg-[var(--rose)] text-[var(--accent)]">
                                <UserRound size={18} strokeWidth={2} />
                            </div>
                            <div className="text-left">
                                <span className="block text-sm font-bold text-[var(--ink)]">
                                    Admin
                                </span>
                                <span className="block text-[10px] tracking-wider text-[var(--muted)] uppercase">
                                    Store Manager
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Subnavigation Bar (Order History | User | Products) */}
                <div className="border-t border-[var(--border)]/60 bg-[var(--rose-soft)]/50">
                    <div className="flower-container flex items-center gap-3 py-2.5">
                        {/* Order History Tab */}
                        <button
                            type="button"
                            onClick={() => {
                                setEditingProduct(null);
                                setActiveNav('orders');
                                setSearchQuery('');
                            }}
                            className={`flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition-all ${
                                activeNav === 'orders' && !editingProduct
                                    ? 'bg-[var(--accent)] text-white shadow-xs'
                                    : 'text-[var(--muted)] hover:bg-white/60 hover:text-[var(--ink)]'
                            }`}
                        >
                            <Package size={16} />
                            Order History
                        </button>

                        {/* User Tab */}
                        <button
                            type="button"
                            onClick={() => {
                                setEditingProduct(null);
                                setActiveNav('users');
                                setSearchQuery('');
                            }}
                            className={`flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition-all ${
                                activeNav === 'users'
                                    ? 'bg-[var(--accent)] text-white shadow-xs'
                                    : 'text-[var(--muted)] hover:bg-white/60 hover:text-[var(--ink)]'
                            }`}
                        >
                            <Users size={16} />
                            User
                        </button>

                        {/* Products Tab */}
                        <button
                            type="button"
                            onClick={() => {
                                setEditingProduct(null);
                                setActiveNav('products');
                                setSearchQuery('');
                            }}
                            className={`flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition-all ${
                                activeNav === 'products'
                                    ? 'bg-[var(--accent)] text-white shadow-xs'
                                    : 'text-[var(--muted)] hover:bg-white/60 hover:text-[var(--ink)]'
                            }`}
                        >
                            <ShoppingBag size={16} />
                            Products
                        </button>
                    </div>
                </div>
            </header>

            {/* ========================================================= */}
            {/* VIEW: EDIT PRODUCT PAGE (From Wireframe Snippet)          */}
            {/* ========================================================= */}
            {editingProduct && activeNav === 'products' ? (
                <main className="flower-container py-8 md:py-12">
                    {/* Top Back and Notification */}
                    <div className="mb-6 flex items-center justify-between">
                        <button
                            type="button"
                            onClick={() => setEditingProduct(null)}
                            className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-white px-4 py-2 text-xs font-semibold text-[var(--ink)] shadow-2xs transition-all hover:bg-[var(--rose-soft)]"
                        >
                            <ArrowLeft size={14} /> Back to Products Catalog
                        </button>

                        {showSaveToast && (
                            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-xs font-semibold text-emerald-800 shadow-xs animate-in fade-in duration-300">
                                <CheckCircle2 size={16} className="text-emerald-600" />
                                Product updated successfully!
                            </div>
                        )}
                    </div>

                    {/* Main Edit Product Card */}
                    <form
                        onSubmit={handleSaveEdit}
                        className="overflow-hidden rounded-3xl border border-[var(--border)] bg-white shadow-sm"
                    >
                        <div className="grid grid-cols-1 gap-8 p-6 lg:grid-cols-[515px_1fr] lg:p-12">
                            {/* LEFT: Product Image Box (515 x 621 in wireframe) */}
                            <div className="flex flex-col items-center">
                                <div className="relative aspect-5/6 w-full max-w-[515px] overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--rose-soft)] shadow-xs">
                                    <img
                                        src={editingProduct.image}
                                        alt={editName}
                                        className="size-full object-cover"
                                        style={{
                                            objectPosition: editingProduct.position || 'center',
                                        }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity hover:opacity-100 flex items-end justify-center p-6">
                                        <button
                                            type="button"
                                            className="inline-flex items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-xs font-bold text-[var(--ink)] shadow-md backdrop-blur-xs"
                                        >
                                            <Upload size={14} /> Replace Photo
                                        </button>
                                    </div>
                                </div>
                                <span className="mt-3 text-xs tracking-wider text-[var(--muted)] uppercase">
                                    Product Photo (515 × 621 px)
                                </span>
                            </div>

                            {/* RIGHT: Product Details & Controls (Matching Wireframe Coordinates) */}
                            <div className="flex flex-col justify-between space-y-6">
                                <div className="space-y-6">
                                    {/* 1. PRICE (Large Red text in wireframe: $ 999) */}
                                    <div>
                                        <span className="text-xs uppercase tracking-wider text-[var(--muted)]">
                                            Product Price
                                        </span>
                                        <div className="mt-1 flex items-center gap-2">
                                            <span className="font-serif text-4xl font-extrabold text-[#FF4747] md:text-5xl">
                                                $
                                            </span>
                                            <input
                                                type="number"
                                                value={editPrice}
                                                onChange={(e) => setEditPrice(Number(e.target.value))}
                                                className="w-48 font-serif text-4xl font-extrabold text-[#FF4747] border-b-2 border-[#FF4747]/40 bg-transparent focus:border-[#FF4747] focus:outline-none md:text-5xl"
                                            />
                                        </div>
                                    </div>

                                    {/* 2. PRODUCT NAME (Large Bold: 40px in wireframe) */}
                                    <div>
                                        <label className="block text-xs uppercase tracking-wider text-[var(--muted)]">
                                            Product Name
                                        </label>
                                        <input
                                            type="text"
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            className="mt-1 w-full font-serif text-2xl font-bold text-[var(--ink)] border-b-2 border-[var(--border)] bg-transparent pb-1 transition-colors focus:border-[var(--accent)] focus:outline-none md:text-3xl"
                                        />
                                    </div>

                                    {/* 3. DESCRIPTIONS (Multi-line text: 36px in wireframe) */}
                                    <div>
                                        <label className="block text-xs uppercase tracking-wider text-[var(--muted)]">
                                            Descriptions
                                        </label>
                                        <textarea
                                            rows={3}
                                            value={editDesc}
                                            onChange={(e) => setEditDesc(e.target.value)}
                                            className="mt-1.5 w-full rounded-2xl border border-[var(--border)] bg-[var(--cream)]/60 p-4 text-base font-medium text-[var(--ink)] transition-all focus:border-[var(--accent)] focus:bg-white focus:outline-none"
                                        />
                                    </div>

                                    {/* 4. COLORS (red, green, blue swatches & pills in wireframe) */}
                                    <div>
                                        <label className="block text-sm font-semibold uppercase tracking-wider text-[var(--ink)]">
                                            Colors
                                        </label>
                                        <div className="mt-2.5 flex items-center gap-4">
                                            {/* Red Option */}
                                            <button
                                                type="button"
                                                onClick={() => setEditColor('red')}
                                                className={`flex items-center gap-2.5 rounded-full border px-4 py-2 text-sm font-semibold transition-all ${
                                                    editColor === 'red'
                                                        ? 'border-[#FF4747] bg-[#FF4747]/10 text-[#FF4747]'
                                                        : 'border-[var(--border)] bg-white text-[var(--muted)] hover:bg-[var(--rose-soft)]'
                                                }`}
                                            >
                                                <span className="size-3.5 rounded-full bg-[#FF4747]" />
                                                <span className="capitalize">red</span>
                                            </button>

                                            {/* Green Option */}
                                            <button
                                                type="button"
                                                onClick={() => setEditColor('green')}
                                                className={`flex items-center gap-2.5 rounded-full border px-4 py-2 text-sm font-semibold transition-all ${
                                                    editColor === 'green'
                                                        ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]'
                                                        : 'border-[var(--border)] bg-white text-[var(--muted)] hover:bg-[var(--rose-soft)]'
                                                }`}
                                            >
                                                <span className="size-3.5 rounded-full bg-[var(--accent)]" />
                                                <span className="capitalize">green</span>
                                            </button>

                                            {/* Blue Option */}
                                            <button
                                                type="button"
                                                onClick={() => setEditColor('blue')}
                                                className={`flex items-center gap-2.5 rounded-full border px-4 py-2 text-sm font-semibold transition-all ${
                                                    editColor === 'blue'
                                                        ? 'border-blue-600 bg-blue-50 text-blue-600'
                                                        : 'border-[var(--border)] bg-white text-[var(--muted)] hover:bg-[var(--rose-soft)]'
                                                }`}
                                            >
                                                <span className="size-3.5 rounded-full bg-blue-500" />
                                                <span className="capitalize">blue</span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* 5. SIZE (S, M, L options from wireframe) */}
                                    <div>
                                        <label className="block text-sm font-semibold uppercase tracking-wider text-[var(--ink)]">
                                            Size
                                        </label>
                                        <div className="mt-2.5 flex items-center gap-3">
                                            {(['S', 'M', 'L'] as const).map((s) => (
                                                <button
                                                    key={s}
                                                    type="button"
                                                    onClick={() => setEditSize(s)}
                                                    className={`grid size-12 place-items-center rounded-2xl border text-sm font-bold transition-all ${
                                                        editSize === s
                                                            ? 'border-[var(--accent)] bg-[var(--accent)] text-white shadow-xs'
                                                            : 'border-[var(--border)] bg-white text-[var(--ink)] hover:bg-[var(--rose-soft)]'
                                                    }`}
                                                >
                                                    {s}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* 6. STOCK (Quantity Stepper from wireframe: -, 1, +) */}
                                    <div>
                                        <label className="block text-sm font-semibold uppercase tracking-wider text-[var(--ink)]">
                                            Stock Quantity
                                        </label>
                                        <div className="mt-2.5 flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setEditStock((prev) => Math.max(0, prev - 1))}
                                                className="grid size-11 place-items-center rounded-xl border border-[var(--border)] bg-white text-lg font-bold text-[var(--ink)] shadow-2xs hover:bg-[var(--rose-soft)] active:scale-95"
                                            >
                                                <Minus size={16} />
                                            </button>

                                            <div className="grid h-11 min-w-[70px] place-items-center rounded-xl border border-[var(--border)] bg-[var(--cream)] px-4 font-serif text-lg font-bold text-[var(--ink)] shadow-2xs">
                                                {editStock}
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => setEditStock((prev) => prev + 1)}
                                                className="grid size-11 place-items-center rounded-xl border border-[var(--border)] bg-white text-lg font-bold text-[var(--ink)] shadow-2xs hover:bg-[var(--rose-soft)] active:scale-95"
                                            >
                                                <Plus size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* 7. SAVE BUTTON (Big pill at top 844: width 249 in wireframe) */}
                                <div className="pt-6 border-t border-[var(--border)]/60">
                                    <button
                                        type="submit"
                                        className="inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-[var(--accent)] px-8 py-3.5 text-base font-bold text-white shadow-md transition-all duration-200 hover:bg-[var(--accent-hover)] hover:shadow-lg active:scale-98 sm:w-64"
                                    >
                                        <Save size={18} />
                                        <span className="uppercase tracking-wider">Save Changes</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </form>

                    {/* ========================================================= */}
                    {/* BOTTOM SECTION: RELATED / OTHER CATALOG ITEMS (From wireframe top 1039) */}
                    {/* ========================================================= */}
                    <div className="mt-16">
                        <div className="mb-6 flex items-center justify-between border-b border-[var(--border)] pb-3">
                            <h2 className="font-serif text-2xl font-bold text-[var(--ink)]">
                                Other Catalog Items
                            </h2>
                            <span className="text-xs text-[var(--muted)]">
                                Click any bouquet to quickly switch and edit
                            </span>
                        </div>

                        {/* 3 CARDS AT BOTTOM (Matching wireframe width: 293, height: 352 at left 344, 677, 1010) */}
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {otherProducts.map((item) => (
                                <div
                                    key={item.id}
                                    onClick={() => handleStartEdit(item)}
                                    className="group cursor-pointer rounded-3xl border border-[var(--border)] bg-white p-5 shadow-xs transition-all duration-300 hover:border-[var(--accent)] hover:shadow-md"
                                >
                                    <div className="relative aspect-4/3 w-full overflow-hidden rounded-2xl bg-[var(--rose-soft)]">
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            style={{
                                                objectPosition: item.position || 'center',
                                            }}
                                        />
                                        <div className="absolute top-2.5 right-2.5 grid size-8 place-items-center rounded-full bg-white/90 text-[var(--accent)] shadow-2xs backdrop-blur-xs">
                                            <Edit3 size={14} />
                                        </div>
                                    </div>

                                    <div className="mt-4 flex items-start justify-between">
                                        <div>
                                            <h3 className="font-serif text-lg font-bold text-[var(--ink)] group-hover:text-[var(--accent)] transition-colors">
                                                {item.name}
                                            </h3>
                                            <div className="mt-1 font-serif text-2xl font-bold text-[var(--ink)]">
                                                ${item.price.toLocaleString()}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-1 rounded-full bg-[var(--rose-soft)] px-2.5 py-1 text-xs font-bold text-[var(--ink)]">
                                            <Star size={13} className="fill-amber-400 text-amber-400" />
                                            <span>{item.rating.toFixed(1)}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </main>
            ) : null}

            {/* ========================================================= */}
            {/* VIEW: PRODUCTS CATALOGUE LIST (When not editing)          */}
            {/* ========================================================= */}
            {activeNav === 'products' && !editingProduct && (
                <main className="flower-container py-8 md:py-12">
                    <div className="mb-8 flex flex-col justify-between gap-4 border-b border-[var(--border)] pb-6 sm:flex-row sm:items-end">
                        <div>
                            <p className="flower-eyebrow text-xs tracking-wider text-[var(--muted)] uppercase">
                                INVENTORY & CATALOG OVERVIEW
                            </p>
                            <h1 className="mt-1 font-serif text-3xl font-bold tracking-tight text-[var(--ink)] md:text-4xl">
                                Products Management
                            </h1>
                            <p className="mt-1 text-sm text-[var(--muted)]">
                                Curate flower arrangements, configure colors, prices, ratings, and edit existing listings.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => setIsAddModalOpen(true)}
                            className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition-all hover:bg-[var(--accent-hover)] hover:shadow-md active:scale-95"
                        >
                            <Plus size={18} />
                            <span>Add New Product</span>
                        </button>
                    </div>

                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[280px_1fr]">
                        {/* LEFT SIDEBAR: FILTER PANEL */}
                        <aside className="h-fit rounded-3xl border border-[var(--border)] bg-white p-6 shadow-xs">
                            <div className="flex items-center justify-between border-b border-[var(--border)]/70 pb-4">
                                <div className="flex items-center gap-2 font-serif text-xl font-bold text-[var(--ink)]">
                                    <Filter size={18} className="text-[var(--accent)]" />
                                    <span>Filter</span>
                                </div>
                                {(selectedColors.length > 0 ||
                                    selectedCostRanges.length > 0 ||
                                    selectedRatings.length > 0) && (
                                    <button
                                        type="button"
                                        onClick={resetProductFilters}
                                        className="flex items-center gap-1 text-xs font-semibold text-[var(--accent)] hover:underline"
                                    >
                                        <RotateCcw size={12} /> Reset
                                    </button>
                                )}
                            </div>

                            {/* Color Section */}
                            <div className="border-b border-[var(--border)]/60 py-5">
                                <h3 className="mb-3.5 text-sm font-bold uppercase tracking-wider text-[var(--ink)]">
                                    Color
                                </h3>
                                <div className="space-y-3">
                                    <label
                                        onClick={() => toggleColorFilter('red')}
                                        className="flex cursor-pointer items-center justify-between text-sm text-[var(--ink)]"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="size-5 rounded-full bg-[#FF4747] shadow-2xs" />
                                            <span className="font-medium">Red</span>
                                        </div>
                                        <div
                                            className={`grid size-5 place-items-center rounded-full border transition-colors ${
                                                selectedColors.includes('red')
                                                    ? 'border-[var(--accent)] bg-[var(--accent)] text-white'
                                                    : 'border-[var(--border)] bg-[var(--rose-soft)]/50'
                                            }`}
                                        >
                                            {selectedColors.includes('red') && <Check size={12} strokeWidth={3} />}
                                        </div>
                                    </label>

                                    <label
                                        onClick={() => toggleColorFilter('green')}
                                        className="flex cursor-pointer items-center justify-between text-sm text-[var(--ink)]"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="size-5 rounded-full bg-[var(--accent)] shadow-2xs" />
                                            <span className="font-medium">Green</span>
                                        </div>
                                        <div
                                            className={`grid size-5 place-items-center rounded-full border transition-colors ${
                                                selectedColors.includes('green')
                                                    ? 'border-[var(--accent)] bg-[var(--accent)] text-white'
                                                    : 'border-[var(--border)] bg-[var(--rose-soft)]/50'
                                            }`}
                                        >
                                            {selectedColors.includes('green') && <Check size={12} strokeWidth={3} />}
                                        </div>
                                    </label>

                                    <label
                                        onClick={() => toggleColorFilter('blue')}
                                        className="flex cursor-pointer items-center justify-between text-sm text-[var(--ink)]"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="size-5 rounded-full bg-blue-500 shadow-2xs" />
                                            <span className="font-medium">Blue</span>
                                        </div>
                                        <div
                                            className={`grid size-5 place-items-center rounded-full border transition-colors ${
                                                selectedColors.includes('blue')
                                                    ? 'border-[var(--accent)] bg-[var(--accent)] text-white'
                                                    : 'border-[var(--border)] bg-[var(--rose-soft)]/50'
                                            }`}
                                        >
                                            {selectedColors.includes('blue') && <Check size={12} strokeWidth={3} />}
                                        </div>
                                    </label>
                                </div>
                            </div>

                            {/* Cost Section */}
                            <div className="border-b border-[var(--border)]/60 py-5">
                                <h3 className="mb-3.5 text-sm font-bold uppercase tracking-wider text-[var(--ink)]">
                                    Cost
                                </h3>
                                <div className="space-y-3">
                                    {['0-100', '100-200', '200-300', '500-1000'].map((range) => (
                                        <label
                                            key={range}
                                            onClick={() => toggleCostRange(range)}
                                            className="flex cursor-pointer items-center justify-between text-sm text-[var(--ink)]"
                                        >
                                            <span className="font-medium">${range}</span>
                                            <div
                                                className={`grid size-5 place-items-center rounded-full border transition-colors ${
                                                    selectedCostRanges.includes(range)
                                                        ? 'border-[var(--accent)] bg-[var(--accent)] text-white'
                                                        : 'border-[var(--border)] bg-[var(--rose-soft)]/50'
                                                }`}
                                            >
                                                {selectedCostRanges.includes(range) && <Check size={12} strokeWidth={3} />}
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Rating Section */}
                            <div className="pt-5">
                                <h3 className="mb-3.5 text-sm font-bold uppercase tracking-wider text-[var(--ink)]">
                                    Rating
                                </h3>
                                <div className="space-y-2.5">
                                    {[5, 4, 3, 2, 1].map((stars) => (
                                        <label
                                            key={stars}
                                            onClick={() => toggleRatingFilter(stars)}
                                            className="flex cursor-pointer items-center justify-between text-sm text-[var(--ink)]"
                                        >
                                            <div className="flex items-center gap-1.5">
                                                <div className="flex text-amber-400">
                                                    {Array.from({ length: stars }).map((_, i) => (
                                                        <Star
                                                            key={i}
                                                            size={14}
                                                            className="fill-amber-400 text-amber-400"
                                                        />
                                                    ))}
                                                </div>
                                                <span className="text-xs text-[var(--muted)]">({stars})</span>
                                            </div>
                                            <div
                                                className={`grid size-5 place-items-center rounded-full border transition-colors ${
                                                    selectedRatings.includes(stars)
                                                        ? 'border-[var(--accent)] bg-[var(--accent)] text-white'
                                                        : 'border-[var(--border)] bg-[var(--rose-soft)]/50'
                                                }`}
                                            >
                                                {selectedRatings.includes(stars) && <Check size={12} strokeWidth={3} />}
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </aside>

                        {/* PRODUCT CATALOG GRID */}
                        <div>
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                                {/* CARD 1: BIG '+' ADD PRODUCT CARD */}
                                <button
                                    type="button"
                                    onClick={() => setIsAddModalOpen(true)}
                                    className="group flex min-h-[380px] flex-col items-center justify-center rounded-3xl border-2 border-dashed border-[var(--border)] bg-white/70 p-8 text-center transition-all duration-300 hover:border-[var(--accent)] hover:bg-[var(--rose-soft)]/40 hover:shadow-md"
                                >
                                    <div className="grid size-24 place-items-center rounded-full bg-[var(--rose-soft)] text-[var(--accent)] transition-transform duration-300 group-hover:scale-110 group-hover:bg-[var(--accent)] group-hover:text-white">
                                        <Plus size={52} strokeWidth={1.8} />
                                    </div>
                                    <h3 className="mt-6 font-serif text-xl font-bold text-[var(--ink)]">
                                        Add New Bouquet
                                    </h3>
                                    <p className="mt-1 max-w-[200px] text-xs text-[var(--muted)]">
                                        Expand your flower assortment with fresh bouquet listings
                                    </p>
                                </button>

                                {/* LIST OF PRODUCT CARDS */}
                                {filteredProducts.map((product) => (
                                    <div
                                        key={product.id}
                                        className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-[var(--border)] bg-white p-5 shadow-xs transition-all duration-300 hover:shadow-md hover:border-[var(--accent)]/40"
                                    >
                                        <div>
                                            <div className="relative aspect-4/3 w-full overflow-hidden rounded-2xl bg-[var(--rose-soft)] shadow-2xs">
                                                <img
                                                    src={product.image}
                                                    alt={product.name}
                                                    className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
                                                    style={{
                                                        objectPosition: product.position || 'center',
                                                    }}
                                                />

                                                {/* Top Right Actions (Edit & Delete) */}
                                                <div className="absolute top-3 right-3 flex items-center gap-1.5 opacity-90 transition-opacity group-hover:opacity-100">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleStartEdit(product)}
                                                        className="grid size-8 place-items-center rounded-full bg-white/95 text-[var(--accent)] shadow-xs backdrop-blur-xs transition-colors hover:bg-[var(--rose-soft)]"
                                                        title="Edit Product"
                                                    >
                                                        <Edit3 size={14} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteProduct(product.id)}
                                                        className="grid size-8 place-items-center rounded-full bg-white/95 text-red-600 shadow-xs backdrop-blur-xs transition-colors hover:bg-red-50"
                                                        title="Delete Bouquet"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>

                                                <div className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-0.5 text-[11px] font-semibold text-[var(--ink)] shadow-2xs backdrop-blur-xs">
                                                    <span
                                                        className="size-2 rounded-full"
                                                        style={{
                                                            backgroundColor:
                                                                product.color === 'red'
                                                                    ? '#FF4747'
                                                                    : product.color === 'green'
                                                                    ? '#365b45'
                                                                    : '#3b82f6',
                                                        }}
                                                    />
                                                    <span className="capitalize">{product.color}</span>
                                                    <span>· Size {product.size}</span>
                                                </div>
                                            </div>

                                            <div className="mt-4">
                                                <h3 className="font-serif text-lg font-bold text-[var(--ink)] group-hover:text-[var(--accent)] transition-colors">
                                                    {product.name}
                                                </h3>
                                                {product.thai && (
                                                    <p className="text-xs text-[var(--muted)]">{product.thai}</p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="mt-5 flex items-center justify-between border-t border-[var(--border)]/60 pt-3.5">
                                            <div>
                                                <span className="text-[10px] uppercase tracking-wider text-[var(--muted)]">
                                                    Price
                                                </span>
                                                <div className="font-serif text-2xl font-bold text-[var(--ink)]">
                                                    ${product.price.toLocaleString()}
                                                </div>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => handleStartEdit(product)}
                                                className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--cream)] px-3 py-1.5 text-xs font-bold text-[var(--ink)] hover:bg-white"
                                            >
                                                <Edit3 size={13} />
                                                <span>Edit</span>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </main>
            )}

            {/* ========================================================= */}
            {/* VIEW: USERS MANAGEMENT                                    */}
            {/* ========================================================= */}
            {activeNav === 'users' && (
                <main className="flower-container py-8 md:py-12">
                    <div className="mb-8 flex flex-col justify-between gap-4 border-b border-[var(--border)] pb-6 md:flex-row md:items-end">
                        <div>
                            <p className="flower-eyebrow text-xs tracking-wider text-[var(--muted)] uppercase">
                                REGISTERED CUSTOMERS DIRECTORY
                            </p>
                            <h1 className="mt-1 font-serif text-3xl font-bold tracking-tight text-[var(--ink)] md:text-4xl">
                                User Management
                            </h1>
                            <p className="mt-1 text-sm text-[var(--muted)]">
                                View customer credentials, supervise membership statuses, and control access permissions.
                            </p>
                        </div>

                        <div className="flex items-center gap-2 rounded-2xl border border-[var(--border)] bg-white p-1.5 shadow-2xs">
                            <button
                                type="button"
                                onClick={() => setUserStatusFilter('all')}
                                className={`rounded-xl px-4 py-2 text-xs font-semibold tracking-wide transition-all ${
                                    userStatusFilter === 'all'
                                        ? 'bg-[var(--accent)] text-white shadow-2xs'
                                        : 'text-[var(--muted)] hover:text-[var(--ink)]'
                                }`}
                            >
                                All users ({users.length})
                            </button>

                            <button
                                type="button"
                                onClick={() => setUserStatusFilter('active')}
                                className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold tracking-wide transition-all ${
                                    userStatusFilter === 'active'
                                        ? 'bg-[var(--accent)] text-white shadow-2xs'
                                        : 'text-[var(--muted)] hover:text-[var(--ink)]'
                                }`}
                            >
                                <UserCheck size={14} />
                                Active ({activeUsersCount})
                            </button>

                            <button
                                type="button"
                                onClick={() => setUserStatusFilter('blocked')}
                                className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold tracking-wide transition-all ${
                                    userStatusFilter === 'blocked'
                                        ? 'bg-[var(--accent)] text-white shadow-2xs'
                                        : 'text-[var(--muted)] hover:text-[var(--ink)]'
                                }`}
                            >
                                <Ban size={14} />
                                Blocked ({blockedUsersCount})
                            </button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {filteredUsers.length === 0 ? (
                            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-[var(--border)] bg-white/70 py-16 text-center">
                                <div className="grid size-16 place-items-center rounded-full bg-[var(--rose-soft)] text-[var(--muted)]">
                                    <Users size={32} />
                                </div>
                                <h3 className="mt-4 text-lg font-bold text-[var(--ink)]">No users found</h3>
                                <p className="mt-1 text-sm text-[var(--muted)]">
                                    There are no customers matching your search or filter settings.
                                </p>
                            </div>
                        ) : (
                            filteredUsers.map((user) => (
                                <div
                                    key={user.id}
                                    className="group flex flex-col justify-between gap-4 rounded-3xl border border-[var(--border)] bg-white p-5 shadow-xs transition-all duration-200 hover:border-[var(--accent)]/40 hover:shadow-md sm:flex-row sm:items-center sm:px-8 sm:py-5"
                                >
                                    <div className="flex items-center gap-4.5">
                                        <div className="grid size-14 shrink-0 place-items-center rounded-2xl bg-[var(--rose-soft)] text-lg font-bold text-[var(--accent)] border border-[var(--border)]/60 shadow-2xs">
                                            {user.name.charAt(0).toUpperCase()}
                                        </div>

                                        <div>
                                            <div className="flex items-center gap-2.5">
                                                <span className="text-xs uppercase tracking-wider text-[var(--muted)]">
                                                    Name
                                                </span>
                                                <span className="font-serif text-lg font-bold text-[var(--ink)]">
                                                    {user.name}
                                                </span>
                                            </div>

                                            <div className="mt-1 flex items-center gap-2 text-sm text-[var(--muted)]">
                                                <span className="text-xs uppercase tracking-wider">Email:</span>
                                                <span className="font-medium text-[var(--ink)]">
                                                    {user.email}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                                        <div className="text-left sm:text-right">
                                            <span className="block text-[11px] uppercase tracking-wider text-[var(--muted)]">
                                                Orders Made
                                            </span>
                                            <span className="text-sm font-semibold text-[var(--ink)]">
                                                {user.ordersCount} bouquets
                                            </span>
                                        </div>

                                        <div>
                                            {user.status === 'active' ? (
                                                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1 text-xs font-semibold text-emerald-800">
                                                    <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                                                    Active
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-200 bg-orange-50 px-3.5 py-1 text-xs font-semibold text-[#FF5F2A]">
                                                    <span className="size-2 rounded-full bg-[#FF5F2A]" />
                                                    Blocked
                                                </span>
                                            )}
                                        </div>

                                        <div className="w-28 text-right">
                                            {user.status === 'active' ? (
                                                <button
                                                    type="button"
                                                    onClick={() => handleToggleUserBlock(user.id)}
                                                    className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#FF5F2A] px-4 py-2 text-xs font-bold text-white shadow-xs transition-all duration-200 hover:bg-[#e04f1e] hover:shadow-md active:scale-95"
                                                >
                                                    <Ban size={14} />
                                                    <span>Block</span>
                                                </button>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() => handleToggleUserBlock(user.id)}
                                                    className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border-2 border-[#FF5F2A] bg-white px-4 py-2 text-xs font-bold text-[#FF5F2A] shadow-2xs transition-all duration-200 hover:bg-orange-50 active:scale-95"
                                                >
                                                    <Unlock size={14} />
                                                    <span>unblock</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </main>
            )}

            {/* ========================================================= */}
            {/* VIEW: ORDER HISTORY                                       */}
            {/* ========================================================= */}
            {activeNav === 'orders' && (
                <main className="flower-container py-8 md:py-12">
                    <div className="mb-8 flex flex-col justify-between gap-4 border-b border-[var(--border)] pb-6 md:flex-row md:items-end">
                        <div>
                            <p className="flower-eyebrow text-xs tracking-wider text-[var(--muted)] uppercase">
                                STORE ORDERS OVERVIEW
                            </p>
                            <h1 className="mt-1 font-serif text-3xl font-bold tracking-tight text-[var(--ink)] md:text-4xl">
                                Order Management
                            </h1>
                            <p className="mt-1 text-sm text-[var(--muted)]">
                                Monitor incoming requests, verify deliveries, and manage fulfilled customer orders.
                            </p>
                        </div>

                        <div className="flex items-center gap-2 rounded-2xl border border-[var(--border)] bg-white p-1.5 shadow-2xs">
                            <button
                                type="button"
                                onClick={() => setOrderStatusFilter('all')}
                                className={`rounded-xl px-4 py-2 text-xs font-semibold tracking-wide transition-all ${
                                    orderStatusFilter === 'all'
                                        ? 'bg-[var(--accent)] text-white shadow-2xs'
                                        : 'text-[var(--muted)] hover:text-[var(--ink)]'
                                }`}
                            >
                                All order ({orders.length})
                            </button>

                            <button
                                type="button"
                                onClick={() => setOrderStatusFilter('delivery')}
                                className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold tracking-wide transition-all ${
                                    orderStatusFilter === 'delivery'
                                        ? 'bg-[var(--accent)] text-white shadow-2xs'
                                        : 'text-[var(--muted)] hover:text-[var(--ink)]'
                                }`}
                            >
                                <Truck size={14} />
                                On delivery ({deliveryOrdersCount})
                            </button>

                            <button
                                type="button"
                                onClick={() => setOrderStatusFilter('success')}
                                className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold tracking-wide transition-all ${
                                    orderStatusFilter === 'success'
                                        ? 'bg-[var(--accent)] text-white shadow-2xs'
                                        : 'text-[var(--muted)] hover:text-[var(--ink)]'
                                }`}
                            >
                                <CheckCircle2 size={14} />
                                Success ({successOrdersCount})
                            </button>
                        </div>
                    </div>

                    <div className="space-y-8">
                        {filteredOrders.length === 0 ? (
                            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-[var(--border)] bg-white/70 py-16 text-center">
                                <div className="grid size-16 place-items-center rounded-full bg-[var(--rose-soft)] text-[var(--muted)]">
                                    <Package size={32} />
                                </div>
                                <h3 className="mt-4 text-lg font-bold text-[var(--ink)]">No orders found</h3>
                                <p className="mt-1 text-sm text-[var(--muted)]">
                                    There are no orders matching your current filter or search criteria.
                                </p>
                            </div>
                        ) : (
                            filteredOrders.map((order) => (
                                <section
                                    key={order.id}
                                    className="overflow-hidden rounded-3xl border border-[var(--border)] bg-white shadow-sm transition-shadow duration-300 hover:shadow-md"
                                >
                                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border)]/70 bg-[var(--rose-soft)]/40 px-6 py-4.5 md:px-8">
                                        <div className="flex flex-wrap items-center gap-3">
                                            <div className="flex items-center gap-2 text-sm font-semibold text-[var(--ink)]">
                                                <Clock size={16} className="text-[var(--accent)]" />
                                                <span>{order.date}</span>
                                            </div>
                                            <span className="hidden text-xs text-[var(--border)] md:inline">|</span>
                                            <span className="rounded-full bg-white/90 px-3 py-0.5 text-xs font-medium text-[var(--muted)] border border-[var(--border)]/60">
                                                {order.id}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <span className="text-xs uppercase tracking-wider text-[var(--muted)]">
                                                    Order Total
                                                </span>
                                                <div className="font-serif text-2xl font-bold text-[var(--ink)]">
                                                    ${order.total.toLocaleString()}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="divide-y divide-[var(--border)]/50 p-6 md:p-8">
                                        {order.items.map((item) => (
                                            <div
                                                key={item.id}
                                                className="group flex flex-col justify-between gap-4 py-4.5 first:pt-0 last:pb-0 sm:flex-row sm:items-center"
                                            >
                                                <div className="flex items-center gap-4.5">
                                                    <div className="relative size-20 shrink-0 overflow-hidden rounded-2xl border border-[var(--border)]/80 bg-[var(--rose-soft)] shadow-2xs sm:size-24">
                                                        <img
                                                            src={item.image}
                                                            alt={item.name}
                                                            className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                            style={{
                                                                objectPosition: item.position || 'center',
                                                            }}
                                                        />
                                                    </div>

                                                    <div>
                                                        <h3 className="font-serif text-base font-bold text-[var(--ink)] transition-colors group-hover:text-[var(--accent)] sm:text-lg">
                                                            {item.name}
                                                        </h3>
                                                        <p className="mt-1 text-xs text-[var(--muted)] sm:text-sm">
                                                            {item.variant}
                                                        </p>
                                                        <div className="mt-2 text-sm font-bold text-[var(--accent)] sm:hidden">
                                                            ${item.price.toLocaleString()}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between gap-8 sm:justify-end">
                                                    <div className="hidden text-right sm:block">
                                                        <span className="text-xs text-[var(--muted)]">Price</span>
                                                        <div className="font-serif text-xl font-bold text-[var(--ink)]">
                                                            ${item.price.toLocaleString()}
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--cream)] px-4 py-1.5 text-xs font-semibold text-[var(--ink)] shadow-2xs">
                                                        <span className="text-[var(--muted)]">Qty:</span>
                                                        <span>{item.quantity}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[var(--border)]/70 bg-gradient-to-r from-transparent to-[var(--rose-soft)]/20 px-6 py-4.5 md:px-8">
                                        <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
                                            <span>Items count: {order.items.length} bouquets</span>
                                        </div>

                                        <div>
                                            {order.status === 'delivery' ? (
                                                <button
                                                    type="button"
                                                    onClick={() => handleConfirmSuccess(order.id)}
                                                    className="group inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] px-6 py-2.5 text-sm font-semibold text-white shadow-xs transition-all duration-200 hover:bg-[var(--accent-hover)] hover:shadow-md active:scale-95"
                                                >
                                                    <CheckCircle2
                                                        size={18}
                                                        className="transition-transform duration-200 group-hover:scale-110"
                                                    />
                                                    <span>Confirm Success</span>
                                                </button>
                                            ) : (
                                                <div className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50/80 px-5 py-2.5 text-sm font-semibold text-emerald-800 shadow-2xs">
                                                    <CheckCircle2 size={18} className="text-emerald-600" />
                                                    <span>Successfully delivered</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </section>
                            ))
                        )}
                    </div>
                </main>
            )}

            {/* MODAL: ADD NEW BOUQUET */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
                    <div className="w-full max-w-md rounded-3xl border border-[var(--border)] bg-[var(--cream)] p-6 shadow-xl">
                        <div className="flex items-center justify-between border-b border-[var(--border)]/70 pb-3.5">
                            <h2 className="font-serif text-xl font-bold text-[var(--ink)]">
                                Add New Flower Bouquet
                            </h2>
                            <button
                                type="button"
                                onClick={() => setIsAddModalOpen(false)}
                                className="grid size-8 place-items-center rounded-full text-[var(--muted)] hover:bg-[var(--rose-soft)]"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleAddProduct} className="mt-5 space-y-4">
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                                    Bouquet Name
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Lavender Dreams"
                                    value={newProductName}
                                    onChange={(e) => setNewProductName(e.target.value)}
                                    className="mt-1.5 h-11 w-full rounded-xl border border-[var(--border)] bg-white px-3.5 text-sm text-[var(--ink)] focus:border-[var(--accent)] focus:outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                                        Price ($)
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        value={newProductPrice}
                                        onChange={(e) => setNewProductPrice(e.target.value)}
                                        className="mt-1.5 h-11 w-full rounded-xl border border-[var(--border)] bg-white px-3.5 text-sm text-[var(--ink)] focus:border-[var(--accent)] focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                                        Color Theme
                                    </label>
                                    <select
                                        value={newProductColor}
                                        onChange={(e) => setNewProductColor(e.target.value)}
                                        className="mt-1.5 h-11 w-full rounded-xl border border-[var(--border)] bg-white px-3.5 text-sm text-[var(--ink)] focus:border-[var(--accent)] focus:outline-none capitalize"
                                    >
                                        <option value="red">Red</option>
                                        <option value="green">Green</option>
                                        <option value="blue">Blue</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2.5 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="rounded-xl border border-[var(--border)] px-4 py-2 text-xs font-bold text-[var(--muted)] hover:bg-white"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="rounded-xl bg-[var(--accent)] px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-[var(--accent-hover)]"
                                >
                                    Create Bouquet
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
