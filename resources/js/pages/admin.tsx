import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    ArrowRight,
    Ban,
    Check,
    CheckCircle2,
    ChevronDown,
    ChevronRight,
    Clock,
    Edit3,
    Flower2,
    Info,
    LogOut,
    Mail,
    MapPin,
    Menu,
    Minus,
    Package,
    Phone,
    Plus,
    Save,
    Search,
    ShieldAlert,
    ShieldCheck,
    ShoppingBag,
    Star,
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
import { StoreFooter } from '@/components/store/store-chrome';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { productColors } from '@/data/product-colors';
import { useFlashToast } from '@/hooks/use-flash-toast';
import { logout } from '@/routes';
import { money, orderStatus, productImage } from '@/types/shop';
import '../../css/homepage.css';
import '../../css/products.css';

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
    status: 'pending' | 'delivery' | 'success' | 'cancelled';
    rawStatus: string;
    items: OrderItem[];
    customerName?: string;
    customerEmail?: string;
    customerRole?: string;
    userId?: number;
    addressName?: string;
    recipientName?: string;
    phoneNumber?: string;
    fullAddress?: string;
}

interface UserAccount {
    id: number;
    username: string;
    name?: string;
    email: string;
    role?: 'customer' | 'admin';
    status: 'active' | 'blocked';
    joined: string;
    ordersCount: number;
}

interface ProductItem {
    id: number;
    name: string;
    description: string;
    thai: string;
    price: number;
    color: string;
    rating: number;
    ratingCount: number;
    stock: number;
    position: string;
    image: string;
    is_deleted?: boolean;
}

interface AdminProps {
    initialTab?: 'orders' | 'users' | 'products';
    initialEditId?: number;
    dbProducts?: any[];
    dbOrders?: any[];
    dbUsers?: any[];
    dbColors?: string[];
    statusCounts?: Record<string, number>;
}

const prices = [
    { value: 'all', label: 'ทุกราคา', min: 0, max: Infinity },
    { value: 'under500', label: 'ต่ำกว่า ฿500', min: 0, max: 500 },
    { value: '500to999', label: '฿500 – ต่ำกว่า ฿1,000', min: 500, max: 1000 },
    { value: '1000plus', label: '฿1,000 ขึ้นไป', min: 1000, max: Infinity },
];

const colorSwatches: Record<string, string> = {
    pink: '#dca3b2',
    white: '#fff9e9',
    red: '#9a3b50',
    purple: '#a78bbd',
    yellow: '#e6c871',
    green: '#6b8f71',
    blue: '#779fbd',
    orange: '#d99866',
};

const colorLabels: Record<string, string> = {
    pink: 'ชมพู & พีช (pink)',
    white: 'ขาวครีม (white)',
    red: 'แดงไวน์ (red)',
};

const getSwatchColor = (colorStr?: string): string | null => {
    if (!colorStr) return null;
    const clean = colorStr.trim().toLowerCase();
    if (!clean) return null;
    if (colorSwatches[clean]) return colorSwatches[clean];
    if (/^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(clean)) return clean;
    if (/^(rgb|hsl)a?\(.+\)$/i.test(clean)) return clean;
    return '#dbc3ca';
};

const mapDbProducts = (list: any[]): ProductItem[] =>
    list.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description || '',
        thai: p.description || p.name,
        price: Number(p.price),
        color: (p.color ?? '').trim(),
        rating: Number(p.rating ?? 0),
        ratingCount: Number(p.rating_count ?? 0),
        stock: Number(p.stock),
        position: 'center',
        image: productImage(p.picture_path || '/images/homepage/bouquets.png'),
        is_deleted: !!p.is_deleted,
    }));

const mapDbOrders = (list: any[]): Order[] =>
    list.map((o) => {
        let recipientName = '';
        let phoneNumber = '';
        let formattedAddress = '';

        if (o.delivery && typeof o.delivery === 'object') {
            recipientName = o.delivery.recipient_name || '';
            phoneNumber = o.delivery.phone_number || '';
            const parts = [
                o.delivery.address_line,
                o.delivery.subdistrict,
                o.delivery.district,
                o.delivery.province,
                o.delivery.postal_code,
            ].filter(Boolean);
            formattedAddress = parts.join(' ');
        } else if (typeof o.address === 'string') {
            try {
                const parsed = JSON.parse(o.address);
                if (parsed && typeof parsed === 'object') {
                    recipientName = parsed.recipient_name || '';
                    phoneNumber = parsed.phone_number || '';
                    const parts = [
                        parsed.address_line,
                        parsed.subdistrict,
                        parsed.district,
                        parsed.province,
                        parsed.postal_code,
                    ].filter(Boolean);
                    formattedAddress = parts.join(' ');
                } else {
                    formattedAddress = o.address;
                }
            } catch {
                formattedAddress = o.address;
            }
        }

        const customerName =
            o.customer_name || o.username || recipientName || 'Customer';

        return {
            id: String(o.id),
            date: o.created_at
                ? new Date(o.created_at).toLocaleDateString('th-TH', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                  })
                : 'ล่าสุด',
            total: Number(o.total_price),
            rawStatus: o.status || 'pending',
            status: ['delivered', 'success'].includes(o.status)
                ? 'success'
                : ['cancelled', 'canceled'].includes(o.status)
                  ? 'cancelled'
                  : o.status === 'pending'
                    ? 'pending'
                    : 'delivery',
            customerName,
            customerEmail: o.customer_email || '',
            customerRole: o.customer_role || 'customer',
            userId: o.user_id ? Number(o.user_id) : undefined,
            addressName: o.address_name || '',
            recipientName: recipientName || customerName,
            phoneNumber: phoneNumber || '',
            fullAddress: formattedAddress || '',
            items:
                Array.isArray(o.items) && o.items.length > 0
                    ? o.items.map((item: any) => ({
                          id: item.product_id || item.id,
                          name: item.product_name || 'ช่อดอกไม้',
                          variant: `จำนวน ${item.quantity} ช่อ`,
                          price: Number(item.purchase_price ?? 0),
                          quantity: item.quantity,
                          image: productImage(
                              item.picture_path ||
                                  '/images/homepage/bouquets.png',
                          ),
                      }))
                    : [],
        };
    });

const mapDbUsers = (list: any[]): UserAccount[] =>
    list.map((u) => {
        const username = u.username || u.name || 'Member';
        return {
            id: u.id,
            username,
            name: username,
            email: u.email || '',
            role: u.role || 'customer',
            status: u.is_banned ? 'blocked' : 'active',
            joined: u.created_at
                ? new Date(u.created_at).toLocaleDateString('th-TH', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                  })
                : 'สมาชิก',
            ordersCount: Number(u.orders_count || 0),
        };
    });

const primaryBtn =
    'inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[var(--accent)] px-6 text-sm text-[var(--on-accent)] transition-colors hover:bg-[var(--accent-hover)] disabled:opacity-50';

export default function AdminPage({
    initialTab = 'products',
    initialEditId,
    dbProducts,
    dbOrders,
    dbUsers,
    dbColors,
}: AdminProps) {
    useFlashToast();
    const activeNav = initialTab;
    const orders = mapDbOrders(dbOrders ?? []);
    const users = mapDbUsers(dbUsers ?? []);
    const products = mapDbProducts(dbProducts ?? []);
    const { errors, auth } = usePage().props;
    const [mobileMenu, setMobileMenu] = useState(false);

    // Editing State
    const [editingProduct, setEditingProduct] = useState<ProductItem | null>(
        () => {
            const pool = mapDbProducts(dbProducts ?? []);
            if (initialEditId) {
                return pool.find((p) => p.id === initialEditId) || null;
            }
            return null;
        },
    );

    // Form fields for editing
    const [editName, setEditName] = useState(editingProduct?.name || '');
    const [editPrice, setEditPrice] = useState(editingProduct?.price ?? 0);
    const [editDesc, setEditDesc] = useState(editingProduct?.description || '');
    const [editColor, setEditColor] = useState<string>(
        editingProduct?.color ?? '',
    );
    const [editStock, setEditStock] = useState<number>(
        editingProduct?.stock ?? 0,
    );
    const [editPhotoFile, setEditPhotoFile] = useState<File | null>(null);
    const [editPhotoPreview, setEditPhotoPreview] = useState<string | null>(
        null,
    );
    const [showSaveToast, setShowSaveToast] = useState(false);

    // Available Colors in DB (formatted like products.tsx)
    const availableColors = Array.from(
        new Set([
            ...(dbColors || []),
            ...products.map((p) => p.color?.trim()).filter(Boolean),
        ]),
    ) as string[];
    const colorFilterOptions = productColors([
        ...products,
        ...(dbColors ?? []).map((c) => ({ color: c })),
    ]);

    // Global Search
    const [searchQuery, setSearchQuery] = useState('');

    // Orders Filter State
    const [orderStatusFilter, setOrderStatusFilter] = useState<
        'all' | 'pending' | 'delivery' | 'success' | 'cancelled'
    >('all');

    // Users Filter State
    const [userStatusFilter, setUserStatusFilter] = useState<
        'all' | 'active' | 'blocked'
    >('all');
    const [isUserGuideOpen, setIsUserGuideOpen] = useState(false);

    // Products Filter State (aligned with products.tsx)
    const [selectedColors, setSelectedColors] = useState<string[]>([]);
    const [priceRange, setPriceRange] = useState('all');
    const [minRating, setMinRating] = useState('0');
    const [sortBy, setSortBy] = useState('recommended');

    // Modal Add Product State
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newProductName, setNewProductName] = useState('');
    const [newProductPrice, setNewProductPrice] = useState('');
    const [newProductColor, setNewProductColor] = useState('');
    const [newProductStock, setNewProductStock] = useState('');
    const [newProductDescription, setNewProductDescription] = useState('');
    const [newProductFile, setNewProductFile] = useState<File | null>(null);
    const [newProductFilePreview, setNewProductFilePreview] = useState<
        string | null
    >(null);

    // Role Confirmation Modal State
    const [roleConfirmUser, setRoleConfirmUser] = useState<UserAccount | null>(
        null,
    );
    const [targetRole, setTargetRole] = useState<'customer' | 'admin'>('admin');

    // Start editing a product
    const handleStartEdit = (product: ProductItem) => {
        setEditingProduct(product);
        setEditName(product.name);
        setEditPrice(product.price);
        setEditDesc(product.description || '');
        setEditColor(product.color ?? '');
        setEditStock(product.stock ?? 0);
        setEditPhotoFile(null);
        setEditPhotoPreview(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Save edited product to backend
    const handleSaveEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingProduct) return;

        if (editPhotoFile) {
            const formData = new FormData();
            formData.append('_method', 'patch');
            formData.append('name', editName);
            formData.append('price', String(editPrice));
            formData.append('description', editDesc);
            formData.append('color', editColor);
            formData.append('stock', String(editStock));
            formData.append('picture', editPhotoFile);

            router.post(`/admin/products/${editingProduct.id}`, formData, {
                forceFormData: true,
                preserveScroll: true,
                onSuccess: () => {
                    setShowSaveToast(true);
                    setTimeout(() => setShowSaveToast(false), 3000);
                    setEditPhotoFile(null);
                },
            });
        } else {
            router.patch(
                `/admin/products/${editingProduct.id}`,
                {
                    name: editName,
                    price: editPrice,
                    description: editDesc,
                    color: editColor,
                    stock: editStock,
                },
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        setShowSaveToast(true);
                        setTimeout(() => setShowSaveToast(false), 3000);
                    },
                },
            );
        }
    };

    // Update Order Status on backend
    const handleUpdateOrderStatus = (
        orderId: string,
        nextStatus: 'shipping' | 'delivered' | 'cancelled',
    ) => {
        router.patch(
            `/admin/orders/${orderId}/status`,
            { status: nextStatus },
            { preserveScroll: true },
        );
    };

    // Toggle User Block Status on backend
    const handleToggleUserBlock = (userId: number) => {
        router.patch(
            `/admin/users/${userId}/ban`,
            {},
            { preserveScroll: true },
        );
    };

    // Prompt Change User Role with Confirmation Modal
    const handlePromptChangeRole = (user: UserAccount) => {
        const nextRole = user.role === 'admin' ? 'customer' : 'admin';
        setRoleConfirmUser(user);
        setTargetRole(nextRole);
    };

    // Confirm Role Change on backend
    const handleConfirmRoleChange = () => {
        if (!roleConfirmUser) return;
        const userId = roleConfirmUser.id;
        const role = targetRole;

        router.patch(
            `/admin/users/${userId}/role`,
            { role },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setRoleConfirmUser(null);
                },
            },
        );
    };

    // Delete Product on backend
    const handleDeleteProduct = (productId: number) => {
        router.delete(`/admin/products/${productId}`, { preserveScroll: true });

        if (editingProduct?.id === productId) {
            setEditingProduct(null);
        }
    };

    // Toggle sell on backend
    const handleToggleSell = (productId: number) => {
        router.patch(
            `/admin/products/${productId}/toggle`,
            {},
            { preserveScroll: true },
        );
    };

    // Add Product Submit to backend
    const handleAddProduct = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newProductName.trim()) return;

        const formData = new FormData();
        formData.append('name', newProductName.trim());
        formData.append('price', String(newProductPrice));
        formData.append('stock', String(newProductStock));
        formData.append('color', newProductColor.trim());
        if (newProductDescription.trim()) {
            formData.append('description', newProductDescription.trim());
        }
        if (newProductFile) {
            formData.append('picture', newProductFile);
        }

        router.post('/admin/products', formData, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setIsAddModalOpen(false);
                setNewProductName('');
                setNewProductPrice('');
                setNewProductColor('');
                setNewProductStock('');
                setNewProductDescription('');
                setNewProductFile(null);
                setNewProductFilePreview(null);
            },
        });
    };

    // Color Filter Toggle
    const toggleColorFilter = (color: string) => {
        setSelectedColors((prev) =>
            prev.includes(color)
                ? prev.filter((c) => c !== color)
                : [...prev, color],
        );
    };

    const resetProductFilters = () => {
        setSelectedColors([]);
        setPriceRange('all');
        setMinRating('0');
        setSearchQuery('');
    };

    // Filtered & Sorted Products (Matching products.tsx)
    const activePriceObj =
        prices.find((item) => item.value === priceRange) ?? prices[0];
    const filteredProducts = products
        .filter((p) => {
            const matchesSearch =
                searchQuery.trim() === '' ||
                `${p.name} ${p.description}`
                    .toLowerCase()
                    .includes(searchQuery.trim().toLowerCase());

            const matchesColor =
                selectedColors.length === 0 ||
                selectedColors.some(
                    (c) =>
                        (p.color || '').trim().toLowerCase() ===
                        c.trim().toLowerCase(),
                );

            const matchesPrice =
                p.price >= activePriceObj.min && p.price < activePriceObj.max;

            const matchesRating = p.rating >= Number(minRating);

            return (
                matchesSearch && matchesColor && matchesPrice && matchesRating
            );
        })
        .sort((a, b) =>
            sortBy === 'price-asc'
                ? a.price - b.price
                : sortBy === 'price-desc'
                  ? b.price - a.price
                  : sortBy === 'rating'
                    ? b.rating - a.rating
                    : a.id - b.id,
        );

    const activeFilterCount =
        selectedColors.length +
        Number(priceRange !== 'all') +
        Number(minRating !== '0');

    // Filtered Users
    const filteredUsers = users.filter((u) => {
        const matchesStatus =
            userStatusFilter === 'all' || u.status === userStatusFilter;
        const displayName = u.username || u.name || '';
        const matchesSearch =
            searchQuery.trim() === '' ||
            displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (u.email || '').toLowerCase().includes(searchQuery.toLowerCase());
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
            (o.customerName || '')
                .toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
            (o.customerEmail || '')
                .toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
            (o.phoneNumber || '')
                .toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
            (o.recipientName || '')
                .toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
            o.items.some((item) =>
                item.name.toLowerCase().includes(searchQuery.toLowerCase()),
            );
        return matchesStatus && matchesSearch;
    });

    const activeUsersCount = users.filter((u) => u.status === 'active').length;
    const blockedUsersCount = users.filter(
        (u) => u.status === 'blocked',
    ).length;
    const pendingOrdersCount = orders.filter(
        (o) => o.status === 'pending',
    ).length;
    const deliveryOrdersCount = orders.filter(
        (o) => o.status === 'delivery',
    ).length;
    const successOrdersCount = orders.filter(
        (o) => o.status === 'success',
    ).length;
    const cancelledOrdersCount = orders.filter(
        (o) => o.status === 'cancelled',
    ).length;

    // Related / Other products for bottom of Edit Page
    const otherProducts = products
        .filter((p) => p.id !== editingProduct?.id)
        .slice(0, 3);

    return (
        <div className="flower-home min-h-screen">
            <Head
                title={
                    editingProduct
                        ? `แก้ไข ${editingProduct.name} — จัดการร้านค้า`
                        : activeNav === 'products'
                          ? 'จัดการช่อดอกไม้ — My Flower Shop'
                          : activeNav === 'users'
                            ? 'จัดการสมาชิก — My Flower Shop'
                            : 'จัดการคำสั่งซื้อ — My Flower Shop'
                }
            />

            {Object.keys(errors).length > 0 && (
                <div
                    role="alert"
                    className="fixed top-4 right-4 z-50 max-w-sm rounded-xl border border-[#9a3b50]/30 bg-[var(--rose)] p-4 text-sm text-[#9a3b50] shadow-md"
                >
                    {Object.values(errors).map((error, index) => (
                        <p key={index}>{error}</p>
                    ))}
                </div>
            )}

            {/* Announcement Banner (Same style as StoreHeader) */}
            <div className="flower-announcement">
                <ShieldCheck size={15} /> ระบบจัดการร้านค้าสำหรับผู้ดูแล{' '}
                <span>MY FLOWER SHOP · ADMIN PORTAL</span>
            </div>

            {/* Storefront-matched Header */}
            <header className="flower-header">
                <div className="flower-header-main flower-container">
                    <Link
                        href="/"
                        className="flower-brand"
                        aria-label="กลับไปหน้าร้าน My Flower Shop"
                    >
                        <Flower2 size={33} strokeWidth={1.25} />
                        <span>
                            MY FLOWER
                            <span className="flower-brand-bottom">
                                SHOP <i>·</i> admin portal
                            </span>
                        </span>
                    </Link>

                    <div className="flower-search" role="search">
                        <Search size={19} />
                        <input
                            type="text"
                            aria-label="ค้นหาในระบบจัดการร้าน"
                            placeholder={
                                activeNav === 'products'
                                    ? 'ค้นหาชื่อช่อดอกไม้หรือคำอธิบาย...'
                                    : activeNav === 'users'
                                      ? 'ค้นหาชื่อสมาชิกหรืออีเมล...'
                                      : 'ค้นหารหัสคำสั่งซื้อ ชื่อลูกค้า หรือเบอร์โทร...'
                            }
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {searchQuery ? (
                            <button
                                type="button"
                                aria-label="ล้างคำค้นหา"
                                onClick={() => setSearchQuery('')}
                            >
                                <X size={16} />
                            </button>
                        ) : (
                            <button type="button" aria-label="ค้นหา">
                                <ArrowRight size={18} />
                            </button>
                        )}
                    </div>

                    <div className="flower-account-actions">
                        <Link className="flower-account" href="/settings/profile">
                            <UserRound size={20} />
                            <span>{auth.user?.username ?? 'Admin'}</span>
                        </Link>
                        <Link
                            href={logout()}
                            as="button"
                            className="flower-account text-[var(--muted)] transition-colors hover:bg-[var(--rose-soft)] hover:text-[var(--ink)]"
                            title="ออกจากระบบ"
                        >
                            <LogOut size={17} />
                            <span>ออกจากระบบ</span>
                        </Link>
                        <button
                            type="button"
                            className="flower-icon flower-menu"
                            aria-label="เปิดเมนู"
                            aria-expanded={mobileMenu}
                            onClick={() => setMobileMenu(!mobileMenu)}
                        >
                            {mobileMenu ? <X /> : <Menu />}
                        </button>
                    </div>
                </div>

                {/* Storefront-matched Navigation Bar (.flower-nav) */}
                <nav
                    className={`flower-nav ${mobileMenu ? 'is-open' : ''}`}
                    aria-label="เมนูจัดการร้านค้า"
                >
                    <Link
                        href="/admin/products"
                        onClick={() => setEditingProduct(null)}
                        className={activeNav === 'products' ? 'active' : ''}
                        aria-current={
                            activeNav === 'products' ? 'page' : undefined
                        }
                    >
                        จัดการช่อดอกไม้ ({products.length})
                    </Link>
                    <Link
                        href="/admin/orders"
                        className={activeNav === 'orders' ? 'active' : ''}
                        aria-current={
                            activeNav === 'orders' ? 'page' : undefined
                        }
                    >
                        รายการคำสั่งซื้อ ({orders.length})
                    </Link>
                    <Link
                        href="/admin/users"
                        className={activeNav === 'users' ? 'active' : ''}
                        aria-current={
                            activeNav === 'users' ? 'page' : undefined
                        }
                    >
                        จัดการสมาชิก ({users.length})
                    </Link>
                    <Link href="/">ดูหน้าร้านค้า</Link>
                </nav>
            </header>

            {/* ========================================================= */}
            {/* VIEW 1: EDIT PRODUCT PAGE (Matched with product-detail.tsx) */}
            {/* ========================================================= */}
            {editingProduct && activeNav === 'products' ? (
                <main className="flower-container py-6 md:py-9">
                    {/* Breadcrumb matching product-detail.tsx */}
                    <nav
                        aria-label="เส้นทางหน้า"
                        className="mb-7 flex flex-wrap items-center justify-between gap-3 text-xs text-[var(--muted)]"
                    >
                        <div className="flex flex-wrap items-center gap-2">
                            <Link href="/">หน้าแรก</Link>
                            <span>/</span>
                            <button
                                type="button"
                                onClick={() => setEditingProduct(null)}
                                className="hover:underline"
                            >
                                จัดการช่อดอกไม้
                            </button>
                            <span>/</span>
                            <span
                                aria-current="page"
                                className="text-[var(--ink)]"
                            >
                                แก้ไข {editingProduct.name}
                            </span>
                        </div>

                        {showSaveToast && (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--rose-soft)] px-3.5 py-1 text-xs text-[var(--accent)]">
                                <Check size={14} /> บันทึกการแก้ไขเรียบร้อยแล้ว
                            </span>
                        )}
                    </nav>

                    {/* 2-Column Layout matching product-detail.tsx */}
                    <form
                        onSubmit={handleSaveEdit}
                        className="grid min-w-0 gap-8 lg:grid-cols-2 lg:gap-16"
                    >
                        {/* LEFT: Product Image (aspect-[4/5] rounded-xl bg-[var(--rose-soft)]) */}
                        <section aria-label="ภาพสินค้า" className="min-w-0">
                            <div className="group relative aspect-[4/5] w-full overflow-hidden rounded-xl bg-[var(--rose-soft)]">
                                <img
                                    src={
                                        editPhotoPreview || editingProduct.image
                                    }
                                    alt={editName}
                                    style={{
                                        objectPosition:
                                            editingProduct.position || 'center',
                                    }}
                                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                />
                                <span className="absolute top-4 left-4 rounded-full bg-[var(--cream)] px-3 py-1 text-xs text-[var(--ink)]">
                                    {editingProduct.is_deleted
                                        ? 'ปิดการขายชั่วคราว'
                                        : 'ช่อดอกไม้ปลอม'}
                                </span>
                                <label
                                    htmlFor="edit-product-photo"
                                    className="absolute right-4 bottom-4 flex cursor-pointer items-center gap-2 rounded-full bg-[var(--cream)] px-4 py-2 text-xs text-[var(--ink)] shadow-xs transition-colors hover:bg-[var(--rose)]"
                                >
                                    <Upload size={15} /> เปลี่ยนรูปภาพสินค้า
                                    <input
                                        id="edit-product-photo"
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                setEditPhotoFile(file);
                                                setEditPhotoPreview(
                                                    URL.createObjectURL(file),
                                                );
                                            }
                                        }}
                                    />
                                </label>
                            </div>
                            <p className="mt-3 text-xs text-[var(--muted)]">
                                {editPhotoFile
                                    ? `ไฟล์ที่เลือกใหม่: ${editPhotoFile.name}`
                                    : 'คลิกปุ่ม "เปลี่ยนรูปภาพสินค้า" บนมุมขวาล่างของภาพเพื่ออัปโหลดภาพใหม่'}
                            </p>
                        </section>

                        {/* RIGHT: Product Details Form matching product-detail.tsx */}
                        <section
                            aria-labelledby="edit-product-heading"
                            className="min-w-0 py-2"
                        >
                            <p className="flower-eyebrow">
                                A LITTLE BOUQUET. A LOT OF LOVE.
                            </p>
                            <p className="mt-5 text-xs text-[var(--muted)]">
                                รหัสสินค้า FL
                                {String(editingProduct.id).padStart(3, '0')}
                            </p>

                            {/* Product Name Input */}
                            <div className="mt-3">
                                <label
                                    htmlFor="edit-name"
                                    className="block text-xs text-[var(--muted)]"
                                >
                                    ชื่อช่อดอกไม้
                                </label>
                                <input
                                    id="edit-name"
                                    type="text"
                                    required
                                    value={editName}
                                    onChange={(e) =>
                                        setEditName(e.target.value)
                                    }
                                    className="mt-1 w-full border-b border-[var(--border)] bg-transparent pb-2 text-3xl font-bold text-[var(--ink)] focus:border-[var(--accent)] focus:outline-none md:text-4xl"
                                />
                            </div>

                            {/* Rating Display */}
                            <div className="mt-4 inline-flex items-center gap-2 text-sm text-[var(--accent)]">
                                <Star
                                    size={17}
                                    fill={
                                        editingProduct.ratingCount
                                            ? 'currentColor'
                                            : 'none'
                                    }
                                />
                                {editingProduct.ratingCount
                                    ? `${editingProduct.rating.toFixed(1)} / 5 · ${editingProduct.ratingCount} คนให้คะแนน`
                                    : `${editingProduct.rating.toFixed(1)} / 5 คะแนนเฉลี่ย`}
                            </div>

                            {/* Price Input (Using --accent instead of #FF4747) */}
                            <div className="my-6">
                                <label
                                    htmlFor="edit-price"
                                    className="block text-xs text-[var(--muted)]"
                                >
                                    ราคาจำหน่าย
                                </label>
                                <div className="mt-1 flex items-baseline gap-2">
                                    <strong className="text-3xl text-[var(--accent)]">
                                        ฿
                                    </strong>
                                    <input
                                        id="edit-price"
                                        type="number"
                                        required
                                        min={0}
                                        step="0.01"
                                        value={editPrice}
                                        onChange={(e) =>
                                            setEditPrice(Number(e.target.value))
                                        }
                                        className="w-44 border-b border-[var(--border)] bg-transparent pb-1 text-3xl font-bold text-[var(--accent)] focus:border-[var(--accent)] focus:outline-none"
                                    />
                                    <span className="text-sm text-[var(--muted)]">
                                        ต่อช่อ · ส่งฟรีทั่วประเทศ
                                    </span>
                                </div>
                            </div>

                            {/* Description Input */}
                            <div className="border-t border-[var(--border)] pt-6">
                                <label
                                    htmlFor="edit-description"
                                    className="block text-xs text-[var(--muted)]"
                                >
                                    คำอธิบายช่อดอกไม้
                                </label>
                                <textarea
                                    id="edit-description"
                                    rows={3}
                                    value={editDesc}
                                    onChange={(e) =>
                                        setEditDesc(e.target.value)
                                    }
                                    className="mt-2 w-full rounded-xl border border-[var(--border)] bg-[var(--rose-soft)]/50 p-3.5 text-sm leading-7 text-[var(--ink)] focus:border-[var(--accent)] focus:bg-[var(--cream)] focus:outline-none"
                                />
                            </div>

                            {/* Specs Grid (Color & Category) */}
                            <div className="my-6 space-y-4 border-t border-[var(--border)] pt-6 text-sm">
                                <div>
                                    <label
                                        htmlFor="edit-color"
                                        className="block text-xs text-[var(--muted)]"
                                    >
                                        โทนสีดอกไม้ (Color)
                                    </label>
                                    <div className="mt-2 flex items-center gap-3">
                                        <div className="relative flex-1">
                                            <input
                                                id="edit-color"
                                                type="text"
                                                required
                                                value={editColor}
                                                onChange={(e) =>
                                                    setEditColor(e.target.value)
                                                }
                                                placeholder="เช่น pink, white, red..."
                                                className="h-11 w-full rounded-lg border border-[var(--border)] bg-[var(--cream)] pr-4 pl-10 text-sm text-[var(--ink)] focus:border-[var(--accent)] focus:outline-none"
                                            />
                                            <span
                                                aria-hidden="true"
                                                className=" absolute top-1/2 left-3.5 size-4 -translate-y-1/2 rounded-full border border-[#ba9ea6]"
                                                style={{
                                                    backgroundColor:
                                                        getSwatchColor(
                                                            editColor,
                                                        ) ?? '#dbc3ca',
                                                }}
                                            />
                                        </div>
                                    </div>
                                    {availableColors.length > 0 && (
                                        <div className="mt-3 flex flex-wrap items-center gap-2">
                                            <span className="text-xs text-[var(--muted)]">
                                                เลือกสีที่มีในระบบ:
                                            </span>
                                            {availableColors.map((c) => {
                                                const isActive =
                                                    editColor.toLowerCase() ===
                                                    c.toLowerCase();
                                                return (
                                                    <button
                                                        key={c}
                                                        type="button"
                                                        onClick={() =>
                                                            setEditColor(c)
                                                        }
                                                        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition-colors ${
                                                            isActive
                                                                ? 'border-[var(--accent)] bg-[var(--accent)] text-[var(--on-accent)]'
                                                                : 'border-[var(--border)] bg-[var(--cream)] text-[var(--ink)] hover:bg-[var(--rose-soft)]'
                                                        }`}
                                                    >
                                                        <span
                                                            className="size-3 rounded-full border border-[#ba9ea6]"
                                                            style={{
                                                                backgroundColor:
                                                                    getSwatchColor(
                                                                        c,
                                                                    ) ??
                                                                    '#dbc3ca',
                                                            }}
                                                        />
                                                        <span>
                                                            {colorLabels[
                                                                c.toLowerCase()
                                                            ] ?? c}
                                                        </span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Stock Stepper (Matched with quantity stepper in product-detail.tsx) */}
                            <div className="border-t border-[var(--border)] pt-6">
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <label
                                        htmlFor="edit-stock"
                                        className="text-sm"
                                    >
                                        จำนวนสินค้าคงเหลือในสต็อก (ช่อ)
                                    </label>
                                    <div className="flex items-center gap-1 rounded-lg border border-[var(--border)] p-1">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            disabled={editStock <= 0}
                                            onClick={() =>
                                                setEditStock((prev) =>
                                                    Math.max(0, prev - 1),
                                                )
                                            }
                                            aria-label="ลดจำนวนสต็อก"
                                        >
                                            <Minus size={16} />
                                        </Button>
                                        <Input
                                            id="edit-stock"
                                            type="number"
                                            inputMode="numeric"
                                            min={0}
                                            max={1000000}
                                            step={1}
                                            value={editStock}
                                            onChange={(e) =>
                                                setEditStock(
                                                    Math.max(
                                                        0,
                                                        Number(
                                                            e.target.value,
                                                        ) || 0,
                                                    ),
                                                )
                                            }
                                            className="h-10 w-20 border-0 bg-transparent text-center text-[var(--ink)] shadow-none dark:bg-transparent"
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() =>
                                                setEditStock((prev) => prev + 1)
                                            }
                                            aria-label="เพิ่มจำนวนสต็อก"
                                        >
                                            <Plus size={16} />
                                        </Button>
                                    </div>
                                </div>

                                {/* Save & Action Buttons */}
                                <div className="mt-6 flex flex-wrap items-center gap-3">
                                    <button
                                        type="submit"
                                        className="flower-cta flex-1"
                                    >
                                        <Save size={18} /> บันทึกการแก้ไขสินค้า
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleToggleSell(editingProduct.id)
                                        }
                                        className="inline-flex min-h-12 items-center gap-2 rounded-full border border-[var(--border)] px-5 text-xs text-[var(--ink)] hover:bg-[var(--rose-soft)]"
                                    >
                                        <Ban size={15} />
                                        {editingProduct.is_deleted
                                            ? 'เปิดการขาย'
                                            : 'ปิดการขายชั่วคราว'}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => setEditingProduct(null)}
                                className="flower-text-link mt-6"
                            >
                                <ArrowLeft size={16} /> กลับไปหน้าจัดการช่อดอกไม้
                            </button>
                        </section>
                    </form>

                    {/* Bottom Section: Related / Other Catalog Items matching product-detail.tsx */}
                    <section className="mt-12 border-t border-[var(--border)] pt-10 pb-12">
                        <div className="mb-6 flex items-center justify-between gap-4">
                            <h2 className="text-xl font-bold">
                                ช่อดอกไม้อื่นในร้าน (คลิกเพื่อสลับแก้ไข)
                            </h2>
                            <button
                                type="button"
                                onClick={() => setEditingProduct(null)}
                                className="flower-text-link"
                            >
                                ดูทั้งหมด <ArrowRight size={16} />
                            </button>
                        </div>
                        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6">
                            {otherProducts.map((item) => (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => handleStartEdit(item)}
                                    className="group min-w-0 text-left"
                                >
                                    <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-[var(--rose-soft)]">
                                        <img
                                            loading="lazy"
                                            src={item.image}
                                            alt={item.name}
                                            style={{
                                                objectPosition:
                                                    item.position || 'center',
                                            }}
                                            className="h-full w-full object-cover transition-transform group-hover:scale-105"
                                        />
                                        <span className="absolute top-3 right-3 grid size-8 place-items-center rounded-full bg-[var(--cream)]/90 text-[var(--accent)]">
                                            <Edit3 size={14} />
                                        </span>
                                    </div>
                                    <h3 className="mt-3 text-sm font-bold md:text-base">
                                        {item.name}
                                    </h3>
                                    <p className="line-clamp-1 text-xs text-[var(--muted)]">
                                        {item.description}
                                    </p>
                                    <p className="mt-2 font-bold text-[var(--accent)]">
                                        ฿{item.price.toLocaleString('th-TH')}
                                    </p>
                                </button>
                            ))}
                        </div>
                    </section>
                </main>
            ) : null}

            {/* ========================================================= */}
            {/* VIEW 2: PRODUCTS CATALOG MANAGEMENT (Matched with products.tsx) */}
            {/* ========================================================= */}
            {activeNav === 'products' && !editingProduct && (
                <main>
                    {/* Intro Banner matching products.tsx (.catalog-intro) */}
                    <section className="catalog-intro">
                        <div className="flower-container">
                            <nav
                                aria-label="เส้นทางหน้า"
                                className="catalog-breadcrumb"
                            >
                                <Link href="/">หน้าแรก</Link>
                                <ChevronRight size={12} />
                                <span aria-current="page">
                                    จัดการช่อดอกไม้ทั้งหมด
                                </span>
                            </nav>
                            <div className="flex flex-wrap items-end justify-between gap-4">
                                <div>
                                    <p className="flower-eyebrow">
                                        INVENTORY & CATALOG OVERVIEW
                                    </p>
                                    <h1>จัดการคลังช่อดอกไม้</h1>
                                    <p>
                                        เพิ่มช่อดอกไม้ใหม่ ปรับปรุงราคา โทนสี
                                        และจัดการจำนวนสต็อกคงเหลือในร้าน
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsAddModalOpen(true)}
                                    className="flower-cta relative z-10"
                                >
                                    <Plus size={18} /> เพิ่มช่อดอกไม้ใหม่
                                </button>
                            </div>
                            <Flower2
                                className="catalog-intro-flower"
                                size={125}
                                strokeWidth={0.6}
                            />
                        </div>
                    </section>

                    {/* 2-Column Catalog Layout (.catalog-layout) */}
                    <div className="flower-container catalog-layout">
                        {/* LEFT SIDEBAR: Filter matching products.tsx */}
                        <aside
                            className="catalog-sidebar"
                            aria-label="ตัวกรองสินค้า"
                        >
                            <div className="catalog-filter-content min-w-0">
                                <div className="flex min-w-0 items-center justify-between gap-3 border-b border-[var(--border)] pb-4">
                                    <h2 className="text-base font-bold">
                                        ตัวกรองสินค้า
                                    </h2>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={resetProductFilters}
                                        className="shrink-0 text-xs text-[var(--muted)] hover:bg-[var(--rose-soft)]"
                                    >
                                        ล้างทั้งหมด
                                    </Button>
                                </div>

                                {/* Color Filter */}
                                <fieldset className="min-w-0 border-b border-[var(--border)] py-5">
                                    <legend className="sr-only">
                                        สีดอกไม้
                                    </legend>
                                    <p
                                        aria-hidden="true"
                                        className="mb-3 text-sm font-bold"
                                    >
                                        สีดอกไม้
                                    </p>
                                    <div className="grid min-w-0 gap-1">
                                        {colorFilterOptions.map((color) => (
                                            <label
                                                key={color.value}
                                                className="flex min-h-11 min-w-0 cursor-pointer items-center gap-3 rounded-md px-1 text-sm hover:bg-[var(--rose-soft)]"
                                            >
                                                <span
                                                    aria-hidden="true"
                                                    className="size-[18px] shrink-0 rounded-full border border-[#ba9ea6]"
                                                    style={{
                                                        backgroundColor:
                                                            color.hex,
                                                    }}
                                                />
                                                <span className="min-w-0 flex-1">
                                                    {color.label}
                                                </span>
                                                <Checkbox
                                                    checked={selectedColors.includes(
                                                        color.value.toLowerCase(),
                                                    )}
                                                    onCheckedChange={() =>
                                                        toggleColorFilter(
                                                            color.value.toLowerCase(),
                                                        )
                                                    }
                                                    className="catalog-checkbox"
                                                />
                                            </label>
                                        ))}
                                    </div>
                                </fieldset>

                                {/* Price Range Filter (Same ranges as products.tsx) */}
                                <fieldset className="min-w-0 border-b border-[var(--border)] py-5">
                                    <legend className="sr-only">
                                        ช่วงราคา
                                    </legend>
                                    <p
                                        aria-hidden="true"
                                        className="mb-3 text-sm font-bold"
                                    >
                                        ช่วงราคา
                                    </p>
                                    <div className="grid min-w-0 gap-1">
                                        {prices.map((item) => (
                                            <label
                                                key={item.value}
                                                className="flex min-h-11 min-w-0 cursor-pointer items-center gap-3 rounded-md px-1 text-sm hover:bg-[var(--rose-soft)]"
                                            >
                                                <span className="min-w-0 flex-1">
                                                    {item.label}
                                                </span>
                                                <input
                                                    className="catalog-radio size-4 shrink-0"
                                                    type="radio"
                                                    name="admin-price"
                                                    value={item.value}
                                                    checked={
                                                        priceRange ===
                                                        item.value
                                                    }
                                                    onChange={() =>
                                                        setPriceRange(
                                                            item.value,
                                                        )
                                                    }
                                                />
                                            </label>
                                        ))}
                                    </div>
                                </fieldset>

                                {/* Rating Filter */}
                                <fieldset className="min-w-0 border-b border-[var(--border)] py-5">
                                    <legend className="sr-only">
                                        คะแนนสินค้า
                                    </legend>
                                    <p
                                        aria-hidden="true"
                                        className="mb-3 text-sm font-bold"
                                    >
                                        คะแนนสินค้า
                                    </p>
                                    <div className="grid min-w-0 gap-1">
                                        {[
                                            { value: '0', label: 'ทุกคะแนน' },
                                            {
                                                value: '1',
                                                label: '1 ดาวขึ้นไป',
                                            },
                                            {
                                                value: '2',
                                                label: '2 ดาวขึ้นไป',
                                            },
                                            {
                                                value: '3',
                                                label: '3 ดาวขึ้นไป',
                                            },
                                            {
                                                value: '4',
                                                label: '4 ดาวขึ้นไป',
                                            },
                                            { value: '5', label: '5 ดาว' },
                                        ].map((item) => (
                                            <label
                                                key={item.value}
                                                className="flex min-h-11 min-w-0 cursor-pointer items-center gap-3 rounded-md px-1 text-sm hover:bg-[var(--rose-soft)]"
                                            >
                                                <span className="flex min-w-0 flex-1 items-center gap-1">
                                                    {item.value !== '0' && (
                                                        <Star
                                                            className="shrink-0 text-[var(--accent)]"
                                                            size={14}
                                                        />
                                                    )}
                                                    {item.label}
                                                </span>
                                                <input
                                                    className="catalog-radio size-4 shrink-0"
                                                    type="radio"
                                                    name="admin-rating"
                                                    value={item.value}
                                                    checked={
                                                        minRating === item.value
                                                    }
                                                    onChange={() =>
                                                        setMinRating(item.value)
                                                    }
                                                />
                                            </label>
                                        ))}
                                    </div>
                                </fieldset>
                            </div>
                        </aside>

                        {/* RIGHT: Product Grid matching products.tsx */}
                        <section
                            className="catalog-results"
                            aria-label="รายการสินค้าในคลัง"
                        >
                            <div className="catalog-toolbar">
                                <div>
                                    <h2>ช่อดอกไม้ทั้งหมด</h2>
                                    <p role="status" aria-live="polite">
                                        พบ {filteredProducts.length} รายการในคลัง
                                    </p>
                                </div>
                                <label className="catalog-sort">
                                    เรียงตาม
                                    <select
                                        value={sortBy}
                                        onChange={(e) =>
                                            setSortBy(e.target.value)
                                        }
                                    >
                                        <option value="recommended">
                                            รหัสสินค้า (เริ่มต้น)
                                        </option>
                                        <option value="price-asc">
                                            ราคา: ต่ำไปสูง
                                        </option>
                                        <option value="price-desc">
                                            ราคา: สูงไปต่ำ
                                        </option>
                                        <option value="rating">
                                            คะแนนสูงสุด
                                        </option>
                                    </select>
                                </label>
                            </div>

                            <div className="catalog-search-row">
                                <label className="catalog-search">
                                    <Search size={18} />
                                    <input
                                        aria-label="ค้นหาในรายการสินค้า"
                                        placeholder="ค้นหาชื่อดอกไม้หรือคำอธิบายช่อดอกไม้"
                                        value={searchQuery}
                                        onChange={(e) =>
                                            setSearchQuery(e.target.value)
                                        }
                                    />
                                    {searchQuery && (
                                        <button
                                            type="button"
                                            aria-label="ล้างคำค้นหา"
                                            onClick={() => setSearchQuery('')}
                                        >
                                            <X size={16} />
                                        </button>
                                    )}
                                </label>
                            </div>

                            {activeFilterCount > 0 && (
                                <div className="catalog-chips">
                                    {selectedColors.map((color) => (
                                        <button
                                            key={color}
                                            type="button"
                                            onClick={() =>
                                                toggleColorFilter(color)
                                            }
                                        >
                                            {color}
                                            <X size={13} />
                                        </button>
                                    ))}
                                    {priceRange !== 'all' && (
                                        <button
                                            type="button"
                                            onClick={() => setPriceRange('all')}
                                        >
                                            {activePriceObj.label}
                                            <X size={13} />
                                        </button>
                                    )}
                                    {minRating !== '0' && (
                                        <button
                                            type="button"
                                            onClick={() => setMinRating('0')}
                                        >
                                            {minRating}{' '}
                                            {minRating === '5'
                                                ? 'ดาว'
                                                : 'ดาวขึ้นไป'}
                                            <X size={13} />
                                        </button>
                                    )}
                                </div>
                            )}

                            <p className="catalog-demo">
                                คลิกที่รูปหรือชื่อช่อดอกไม้เพื่อแก้ไขรายละเอียดและสต็อก
                            </p>

                            <div className="catalog-grid">
                                {/* Card 0: Add New Bouquet Card in Storefront Aspect Ratio */}
                                <article className="flower-product">
                                    <button
                                        type="button"
                                        onClick={() => setIsAddModalOpen(true)}
                                        className="flower-product-image flex w-full flex-col items-center justify-center gap-3 border border-dashed border-[var(--border)] bg-[var(--rose-soft)]/60 p-6 text-center transition-colors hover:border-[var(--accent)] hover:bg-[var(--rose-soft)]"
                                    >
                                        <span className="grid size-14 place-items-center rounded-full bg-[var(--cream)] text-[var(--accent)]">
                                            <Plus size={28} strokeWidth={1.5} />
                                        </span>
                                        <span className="font-bold text-[var(--ink)]">
                                            เพิ่มช่อดอกไม้ใหม่
                                        </span>
                                        <span className="text-xs text-[var(--muted)]">
                                            คลิกเพื่อเพิ่มรายการสินค้าเข้าสู่ร้านค้า
                                        </span>
                                    </button>
                                </article>

                                {/* Product Cards matching products.tsx */}
                                {filteredProducts.map((item) => (
                                    <article
                                        className="flower-product"
                                        key={item.id}
                                    >
                                        <div className="flower-product-image">
                                            <button
                                                type="button"
                                                className="flower-product-open"
                                                onClick={() =>
                                                    handleStartEdit(item)
                                                }
                                                aria-label={`แก้ไข ${item.name}`}
                                            >
                                                <img
                                                    src={item.image}
                                                    alt={item.name}
                                                    style={{
                                                        objectPosition:
                                                            item.position,
                                                    }}
                                                    loading="lazy"
                                                />
                                                <span className="flower-product-overlay">
                                                    แก้ไขช่อดอกไม้{' '}
                                                    <Edit3 size={15} />
                                                </span>
                                            </button>

                                            {/* Top-right Admin Action Buttons (Styled like .flower-heart) */}
                                            <div className="absolute top-3 right-3 flex items-center gap-1.5">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleStartEdit(item)
                                                    }
                                                    className="grid size-9 place-items-center rounded-full bg-[#fff9f6ed] text-[var(--accent)] transition-colors hover:bg-[var(--rose)]"
                                                    title="แก้ไขสินค้า"
                                                >
                                                    <Edit3 size={15} />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleToggleSell(
                                                            item.id,
                                                        )
                                                    }
                                                    className={`grid size-9 place-items-center rounded-full transition-colors ${
                                                        item.is_deleted
                                                            ? 'bg-[var(--accent)] text-[var(--on-accent)]'
                                                            : 'bg-[#fff9f6ed] text-[var(--muted)] hover:bg-[var(--rose)]'
                                                    }`}
                                                    title={
                                                        item.is_deleted
                                                            ? 'เปิดการขายอีกครั้ง'
                                                            : 'ซ่อน/ปิดการขายชั่วคราว'
                                                    }
                                                >
                                                    <Ban size={15} />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleDeleteProduct(
                                                            item.id,
                                                        )
                                                    }
                                                    className="grid size-9 place-items-center rounded-full bg-[#fff9f6ed] text-[#9a3b50] transition-colors hover:bg-[var(--rose)]"
                                                    title="ลบสินค้า"
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                            </div>

                                            {/* Top-left Status / Color Tag */}
                                            {item.is_deleted ? (
                                                <span className="flower-product-tag !bg-[#9a3b50] !text-white">
                                                    ปิดการขาย
                                                </span>
                                            ) : item.color ? (
                                                <span className="flower-product-tag flex items-center gap-1.5">
                                                    <span
                                                        className="inline-block size-2 rounded-full border border-[#ba9ea6]"
                                                        style={{
                                                            backgroundColor:
                                                                getSwatchColor(
                                                                    item.color,
                                                                ) ?? '#dbc3ca',
                                                        }}
                                                    />
                                                    {item.color}
                                                </span>
                                            ) : null}

                                            {/* Bottom-left Stock Pill matching .catalog-stock */}
                                            <span className="catalog-stock">
                                                {item.stock > 0
                                                    ? `คงเหลือ ${item.stock} ช่อ`
                                                    : 'สินค้าหมด'}
                                            </span>
                                        </div>

                                        <div className="catalog-product-meta">
                                            <span>
                                                FL
                                                {String(item.id).padStart(
                                                    3,
                                                    '0',
                                                )}
                                            </span>
                                            <span className="catalog-rating">
                                                {item.ratingCount > 0 ||
                                                item.rating > 0 ? (
                                                    <>
                                                        <Star
                                                            size={13}
                                                            fill="currentColor"
                                                        />{' '}
                                                        {item.rating.toFixed(1)}
                                                        {item.ratingCount >
                                                            0 && (
                                                            <small>
                                                                (
                                                                {
                                                                    item.ratingCount
                                                                }
                                                                )
                                                            </small>
                                                        )}
                                                    </>
                                                ) : (
                                                    'ยังไม่มีคะแนน'
                                                )}
                                            </span>
                                        </div>

                                        <button
                                            type="button"
                                            className="catalog-product-name"
                                            onClick={() =>
                                                handleStartEdit(item)
                                            }
                                        >
                                            <h3>{item.name}</h3>
                                            <p className="line-clamp-2">
                                                {item.description}
                                            </p>
                                        </button>

                                        <div className="catalog-price flex items-center justify-between">
                                            <div>
                                                ฿
                                                {item.price.toLocaleString(
                                                    'th-TH',
                                                )}
                                                <small>สต็อก {item.stock}</small>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleStartEdit(item)
                                                }
                                                className="rounded-full border border-[var(--border)] px-3 py-1 text-xs font-normal text-[var(--ink)] hover:bg-[var(--rose-soft)]"
                                            >
                                                แก้ไข
                                            </button>
                                        </div>
                                    </article>
                                ))}
                            </div>

                            {filteredProducts.length === 0 && (
                                <div className="flower-empty">
                                    <Flower2 size={38} />
                                    <h3>ไม่พบช่อดอกไม้ที่ค้นหา</h3>
                                    <p>
                                        ลองเปลี่ยนคำค้นหาหรือล้างตัวกรองเพื่อดูสินค้าทั้งหมดในคลัง
                                    </p>
                                    <button
                                        type="button"
                                        className="flower-cta"
                                        onClick={resetProductFilters}
                                    >
                                        ดูสินค้าทั้งหมด <ArrowRight size={18} />
                                    </button>
                                </div>
                            )}
                        </section>
                    </div>
                </main>
            )}

            {/* ========================================================= */}
            {/* VIEW 3: USERS MANAGEMENT                                  */}
            {/* ========================================================= */}
            {activeNav === 'users' && (
                <main>
                    <section className="catalog-intro">
                        <div className="flower-container">
                            <nav
                                aria-label="เส้นทางหน้า"
                                className="catalog-breadcrumb"
                            >
                                <Link href="/">หน้าแรก</Link>
                                <ChevronRight size={12} />
                                <span aria-current="page">จัดการสมาชิก</span>
                            </nav>
                            <p className="flower-eyebrow">
                                REGISTERED CUSTOMERS DIRECTORY
                            </p>
                            <h1>จัดการบัญชีสมาชิก</h1>
                            <p>
                                ตรวจสอบรายชื่อสมาชิก ประวัติจำนวนการสั่งซื้อ
                                กำหนดสิทธิ์ผู้ดูแล และระงับการใช้งานบัญชี
                            </p>
                            <Flower2
                                className="catalog-intro-flower"
                                size={125}
                                strokeWidth={0.6}
                            />
                        </div>
                    </section>

                    <div className="flower-container py-8 md:py-12">
                        {/* Filter Tabs matching orders.tsx */}
                        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
                            <div className="flex flex-wrap items-center gap-2">
                                {[
                                    {
                                        id: 'all' as const,
                                        label: `ทั้งหมด (${users.length})`,
                                    },
                                    {
                                        id: 'active' as const,
                                        label: `ปกติ (${activeUsersCount})`,
                                    },
                                    {
                                        id: 'blocked' as const,
                                        label: `ถูกระงับ (${blockedUsersCount})`,
                                    },
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        type="button"
                                        onClick={() =>
                                            setUserStatusFilter(tab.id)
                                        }
                                        className={`rounded-full px-4 py-2 text-xs transition-colors ${
                                            userStatusFilter === tab.id
                                                ? 'bg-[var(--accent)] text-[var(--on-accent)]'
                                                : 'text-[var(--muted)] hover:bg-[var(--rose-soft)] hover:text-[var(--ink)]'
                                        }`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    setIsUserGuideOpen((prev) => !prev)
                                }
                                className="inline-flex items-center gap-2 text-xs text-[var(--accent)] hover:underline"
                            >
                                <Info size={15} />
                                <span>คำแนะนำการจัดการสิทธิ์สมาชิก</span>
                                <ChevronDown
                                    size={15}
                                    className={`transition-transform ${
                                        isUserGuideOpen ? 'rotate-180' : ''
                                    }`}
                                />
                            </button>
                        </div>

                        {/* Collapsible Guide in Storefront Palette */}
                        {isUserGuideOpen && (
                            <div className="mb-6 rounded-2xl border border-[var(--border)] bg-[var(--rose-soft)] p-5 text-sm">
                                <h2 className="flex items-center gap-2 font-bold text-[var(--accent)]">
                                    <ShieldCheck size={18} />
                                    การกำหนดสิทธิ์ผู้ดูแลระบบ (Admin) และการระงับบัญชี
                                </h2>
                                <div className="mt-3 grid gap-4 sm:grid-cols-3">
                                    <div className="rounded-xl border border-[var(--border)] bg-[var(--cream)] p-4">
                                        <strong className="text-xs text-[var(--accent)]">
                                            1. เปลี่ยนบทบาท (Role)
                                        </strong>
                                        <p className="mt-1 text-xs text-[var(--muted)]">
                                            คลิกปุ่มบทบาท (Customer / Admin)
                                            ของสมาชิกเพื่อเลื่อนขั้นหรือปรับลดสิทธิ์พร้อมยืนยันในหน้าต่างป๊อปอัป
                                        </p>
                                    </div>
                                    <div className="rounded-xl border border-[var(--border)] bg-[var(--cream)] p-4">
                                        <strong className="text-xs text-[var(--accent)]">
                                            2. ระงับการใช้งาน (แบน)
                                        </strong>
                                        <p className="mt-1 text-xs text-[var(--muted)]">
                                            คลิกปุ่ม "ระงับสิทธิ์" เพื่อป้องกันไม่ให้สมาชิกสั่งซื้อสินค้าหรือเพิ่มตะกร้า
                                        </p>
                                    </div>
                                    <div className="rounded-xl border border-[var(--border)] bg-[var(--cream)] p-4">
                                        <strong className="text-xs text-[var(--accent)]">
                                            3. ความปลอดภัยของระบบ
                                        </strong>
                                        <p className="mt-1 text-xs text-[var(--muted)]">
                                            ผู้ดูแลระบบไม่สามารถลดสิทธิ์หรือระงับบัญชีของตนเองที่กำลังเข้าสู่ระบบอยู่ได้
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Users List */}
                        <div className="space-y-4">
                            {filteredUsers.length === 0 ? (
                                <div className="flower-empty rounded-2xl border border-[var(--border)]">
                                    <Users size={38} />
                                    <h3>ไม่พบข้อมูลสมาชิก</h3>
                                    <p className="text-xs text-[var(--muted)]">
                                        ไม่มีสมาชิกที่ตรงกับคำค้นหาหรือตัวกรองที่เลือก
                                    </p>
                                </div>
                            ) : (
                                filteredUsers.map((user) => (
                                    <article
                                        key={user.id}
                                        className="grid grid-cols-1 items-center gap-4 rounded-2xl border border-[var(--border)] bg-[var(--cream)] p-5 transition-colors hover:bg-[var(--rose-soft)]/35 lg:grid-cols-[1fr_auto_1fr]"
                                    >
                                        {/* Left: User Info */}
                                        <div className="flex min-w-0 items-center gap-3.5">
                                            <div className="grid size-11 shrink-0 place-items-center rounded-full bg-[var(--rose-soft)] font-bold text-[var(--accent)]">
                                                {(
                                                    user.username ||
                                                    user.name ||
                                                    'U'
                                                )
                                                    .charAt(0)
                                                    .toUpperCase()}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <h3 className="truncate font-bold text-[var(--ink)]">
                                                        {user.username ||
                                                            user.name}
                                                    </h3>
                                                    {user.status ===
                                                    'active' ? (
                                                        <span className="inline-flex items-center gap-1 rounded-full bg-[var(--rose-soft)] px-2.5 py-0.5 text-xs text-[var(--accent)]">
                                                            <Check size={12} />{' '}
                                                            ปกติ
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 rounded-full bg-[#9a3b50]/15 px-2.5 py-0.5 text-xs text-[#9a3b50]">
                                                            <Ban size={12} />{' '}
                                                            ถูกระงับ
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="truncate text-xs text-[var(--muted)]">
                                                    {user.email} · สมัครเมื่อ{' '}
                                                    {user.joined}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Center: Orders Count */}
                                        <div className="flex items-center lg:justify-center">
                                            <span className="inline-flex items-center gap-2 rounded-full bg-[var(--rose-soft)] px-4 py-1.5 text-xs text-[var(--ink)]">
                                                <ShoppingBag
                                                    size={14}
                                                    className="text-[var(--accent)]"
                                                />
                                                คำสั่งซื้อทั้งหมด{' '}
                                                <strong className="text-[var(--accent)]">
                                                    {user.ordersCount}
                                                </strong>{' '}
                                                รายการ
                                            </span>
                                        </div>

                                        {/* Right: Role & Ban Controls */}
                                        <div className="flex flex-wrap items-center gap-2.5 lg:justify-end">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handlePromptChangeRole(user)
                                                }
                                                disabled={
                                                    auth.user?.id === user.id
                                                }
                                                className={`inline-flex h-9 items-center gap-1.5 rounded-full border px-4 text-xs transition-colors disabled:opacity-50 ${
                                                    user.role === 'admin'
                                                        ? 'border-[var(--accent)] bg-[var(--accent)] text-[var(--on-accent)]'
                                                        : 'border-[var(--border)] bg-[var(--cream)] text-[var(--ink)] hover:bg-[var(--rose-soft)]'
                                                }`}
                                            >
                                                {user.role === 'admin' ? (
                                                    <ShieldCheck size={14} />
                                                ) : (
                                                    <UserRound size={14} />
                                                )}
                                                <span>
                                                    {user.role === 'admin'
                                                        ? 'Admin'
                                                        : 'Customer'}
                                                </span>
                                            </button>

                                            {user.status === 'active' ? (
                                                <button
                                                    type="button"
                                                    disabled={
                                                        auth.user?.id ===
                                                        user.id
                                                    }
                                                    onClick={() =>
                                                        handleToggleUserBlock(
                                                            user.id,
                                                        )
                                                    }
                                                    className="inline-flex h-9 items-center gap-1.5 rounded-full border border-[#9a3b50]/40 px-4 text-xs text-[#9a3b50] transition-colors hover:bg-[#9a3b50] hover:text-white disabled:opacity-40"
                                                >
                                                    <Ban size={13} />
                                                    <span>ระงับสิทธิ์</span>
                                                </button>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleToggleUserBlock(
                                                            user.id,
                                                        )
                                                    }
                                                    className="inline-flex h-9 items-center gap-1.5 rounded-full bg-[var(--accent)] px-4 text-xs text-[var(--on-accent)] transition-colors hover:bg-[var(--accent-hover)]"
                                                >
                                                    <Unlock size={13} />
                                                    <span>ปลดระงับ</span>
                                                </button>
                                            )}
                                        </div>
                                    </article>
                                ))
                            )}
                        </div>
                    </div>
                </main>
            )}

            {/* ========================================================= */}
            {/* VIEW 4: ORDER HISTORY MANAGEMENT (Matched with orders.tsx) */}
            {/* ========================================================= */}
            {activeNav === 'orders' && (
                <main>
                    <section className="catalog-intro">
                        <div className="flower-container">
                            <nav
                                aria-label="เส้นทางหน้า"
                                className="catalog-breadcrumb"
                            >
                                <Link href="/">หน้าแรก</Link>
                                <ChevronRight size={12} />
                                <span aria-current="page">
                                    รายการคำสั่งซื้อทั้งหมด
                                </span>
                            </nav>
                            <p className="flower-eyebrow">
                                STORE ORDERS OVERVIEW
                            </p>
                            <h1>จัดการคำสั่งซื้อลูกค้า</h1>
                            <p>
                                ตรวจสอบคำสั่งซื้อที่เข้ามา ยอมรับเพื่อจัดส่ง
                                ยืนยันการจัดส่งสำเร็จ หรือยกเลิกคำสั่งซื้อ
                            </p>
                            <Flower2
                                className="catalog-intro-flower"
                                size={125}
                                strokeWidth={0.6}
                            />
                        </div>
                    </section>

                    <div className="flower-container py-8 md:py-12">
                        {/* Status Filter Pills matching orders.tsx TabsList */}
                        <div className="mb-6 flex flex-wrap gap-1.5 border-b border-[var(--border)] pb-3">
                            {[
                                {
                                    id: 'all' as const,
                                    label: `ทั้งหมด (${orders.length})`,
                                },
                                {
                                    id: 'pending' as const,
                                    label: `รอจัดส่ง (${pendingOrdersCount})`,
                                },
                                {
                                    id: 'delivery' as const,
                                    label: `ระหว่างจัดส่ง (${deliveryOrdersCount})`,
                                },
                                {
                                    id: 'success' as const,
                                    label: `จัดส่งสำเร็จ (${successOrdersCount})`,
                                },
                                {
                                    id: 'cancelled' as const,
                                    label: `ยกเลิกแล้ว (${cancelledOrdersCount})`,
                                },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() =>
                                        setOrderStatusFilter(tab.id)
                                    }
                                    className={`rounded-full px-4 py-2 text-xs transition-colors ${
                                        orderStatusFilter === tab.id
                                            ? 'bg-[var(--accent)] text-[var(--on-accent)]'
                                            : 'text-[var(--muted)] hover:bg-[var(--rose-soft)] hover:text-[var(--ink)]'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Orders List matching orders.tsx cards */}
                        <div className="space-y-6">
                            {filteredOrders.length === 0 ? (
                                <section className="flex flex-col items-center rounded-2xl border border-[var(--border)] px-5 py-16 text-center">
                                    <span className="mb-5 grid size-20 place-items-center rounded-full bg-[var(--rose)] text-[var(--accent)]">
                                        <Package size={34} strokeWidth={1.3} />
                                    </span>
                                    <h2 className="text-2xl">
                                        ไม่พบรายการคำสั่งซื้อ
                                    </h2>
                                    <p className="mt-2 text-sm text-[var(--muted)]">
                                        ไม่มีคำสั่งซื้อที่ตรงกับสถานะหรือคำค้นหาที่เลือก
                                    </p>
                                </section>
                            ) : (
                                filteredOrders.map((order) => (
                                    <article
                                        key={order.id}
                                        className="overflow-hidden rounded-2xl border border-[var(--border)]"
                                    >
                                        {/* Card Header matching orders.tsx */}
                                        <header className="flex flex-wrap items-center justify-between gap-4 bg-[var(--rose-soft)] px-5 py-4 sm:px-7">
                                            <div>
                                                <div className="flex items-center gap-2.5">
                                                    <h2 className="font-bold">
                                                        คำสั่งซื้อ #{order.id}
                                                    </h2>
                                                    <span className="text-xs text-[var(--muted)]">
                                                        · {order.date}
                                                    </span>
                                                </div>
                                                <p className="mt-1 text-xs text-[var(--muted)]">
                                                    ผู้สั่งซื้อ:{' '}
                                                    <strong className="text-[var(--ink)]">
                                                        {order.customerName}
                                                    </strong>
                                                    {order.customerEmail
                                                        ? ` (${order.customerEmail})`
                                                        : ''}
                                                </p>
                                            </div>

                                            <span
                                                className={`inline-flex items-center gap-1.5 rounded-full bg-[var(--cream)] px-3.5 py-1.5 text-xs ${
                                                    order.status === 'cancelled'
                                                        ? 'text-[#9a3b50]'
                                                        : 'text-[var(--accent)]'
                                                }`}
                                            >
                                                {order.status === 'success' ? (
                                                    <Check size={14} />
                                                ) : order.status ===
                                                  'cancelled' ? (
                                                    <Ban size={14} />
                                                ) : (
                                                    <Truck size={14} />
                                                )}
                                                {orderStatus(order.rawStatus)}
                                            </span>
                                        </header>

                                        {/* Delivery Address Bar */}
                                        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border)] bg-[var(--cream)] px-5 py-3.5 text-xs sm:px-7">
                                            <div className="flex flex-wrap items-center gap-4">
                                                <span className="inline-flex items-center gap-1.5 text-[var(--ink)]">
                                                    <UserRound
                                                        size={14}
                                                        className="text-[var(--accent)]"
                                                    />
                                                    ผู้รับ:{' '}
                                                    <strong>
                                                        {order.recipientName}
                                                    </strong>
                                                </span>
                                                {order.phoneNumber && (
                                                    <a
                                                        href={`tel:${order.phoneNumber}`}
                                                        className="inline-flex items-center gap-1 text-[var(--accent)] hover:underline"
                                                    >
                                                        <Phone size={13} />
                                                        {order.phoneNumber}
                                                    </a>
                                                )}
                                            </div>

                                            {(order.fullAddress ||
                                                order.addressName) && (
                                                <div className="flex items-start gap-1.5 text-[var(--muted)]">
                                                    <MapPin
                                                        size={14}
                                                        className="mt-0.5 shrink-0 text-[var(--accent)]"
                                                    />
                                                    <span>
                                                        {order.addressName && (
                                                            <strong className="mr-1 text-[var(--ink)]">
                                                                [
                                                                {
                                                                    order.addressName
                                                                }
                                                                ]
                                                            </strong>
                                                        )}
                                                        {order.fullAddress}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Order Items matching PurchasedOrderItems */}
                                        <div className="px-5 sm:px-7">
                                            <div className="divide-y divide-[var(--border)]">
                                                {order.items.map((item) => (
                                                    <div
                                                        key={item.id}
                                                        className="flex gap-4 py-5 sm:gap-5"
                                                    >
                                                        <Link
                                                            href={`/products/${item.id}`}
                                                            className="h-24 w-20 shrink-0 overflow-hidden rounded-lg bg-[var(--rose-soft)] sm:h-28 sm:w-24"
                                                        >
                                                            <img
                                                                src={item.image}
                                                                alt={item.name}
                                                                className="h-full w-full object-cover"
                                                                loading="lazy"
                                                            />
                                                        </Link>
                                                        <div className="min-w-0 flex-1">
                                                            <div className="flex flex-wrap justify-between gap-2">
                                                                <Link
                                                                    href={`/products/${item.id}`}
                                                                    className="font-bold hover:underline"
                                                                >
                                                                    {item.name}
                                                                </Link>
                                                                <p className="font-bold text-[var(--accent)]">
                                                                    {money(
                                                                        item.price *
                                                                            item.quantity,
                                                                    )}
                                                                </p>
                                                            </div>
                                                            <p className="mt-2 text-xs text-[var(--muted)]">
                                                                {money(
                                                                    item.price,
                                                                )}{' '}
                                                                / ช่อ ·{' '}
                                                                {item.variant}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Footer with Total & Admin Actions */}
                                            <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-[var(--border)] py-5">
                                                <p className="text-sm">
                                                    ยอดรวมทั้งสิ้น (
                                                    {order.items.length} รายการ){' '}
                                                    <strong className="ml-2 text-xl text-[var(--accent)]">
                                                        {money(order.total)}
                                                    </strong>
                                                    <span className="ml-2 text-xs text-[var(--muted)]">
                                                        จัดส่งฟรี
                                                    </span>
                                                </p>

                                                <div className="flex flex-wrap items-center gap-2.5">
                                                    {['pending', 'delivery'].includes(
                                                        order.status,
                                                    ) && (
                                                        <>
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleUpdateOrderStatus(
                                                                        order.id,
                                                                        'cancelled',
                                                                    )
                                                                }
                                                                className="inline-flex h-10 items-center gap-1.5 rounded-full border border-[#9a3b50]/40 px-4 text-xs text-[#9a3b50] transition-colors hover:bg-[#9a3b50] hover:text-white"
                                                            >
                                                                <X size={14} />
                                                                ยกเลิกออเดอร์
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleUpdateOrderStatus(
                                                                        order.id,
                                                                        order.status ===
                                                                            'pending'
                                                                            ? 'shipping'
                                                                            : 'delivered',
                                                                    )
                                                                }
                                                                className={
                                                                    primaryBtn
                                                                }
                                                            >
                                                                <CheckCircle2
                                                                    size={16}
                                                                />
                                                                <span>
                                                                    {order.status ===
                                                                    'pending'
                                                                        ? 'ยอมรับและเริ่มจัดส่ง'
                                                                        : 'ยืนยันจัดส่งสำเร็จ'}
                                                                </span>
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </footer>
                                        </div>
                                    </article>
                                ))
                            )}
                        </div>
                    </div>
                </main>
            )}

            <StoreFooter />

            {/* ========================================================= */}
            {/* DIALOG: ADD NEW BOUQUET (Using flower-dialog)             */}
            {/* ========================================================= */}
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogContent className="flower-dialog sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>เพิ่มช่อดอกไม้ใหม่</DialogTitle>
                        <DialogDescription>
                            กรอกรายละเอียดช่อดอกไม้ ราคา โทนสี และจำนวนสต็อกเพื่อเปิดจำหน่ายในร้าน
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleAddProduct} className="space-y-4">
                        <div>
                            <label className="block text-xs text-[var(--muted)]">
                                ชื่อช่อดอกไม้ *
                            </label>
                            <input
                                type="text"
                                required
                                placeholder="เช่น Peachy Morning"
                                value={newProductName}
                                onChange={(e) =>
                                    setNewProductName(e.target.value)
                                }
                                className="mt-1 h-11 w-full rounded-lg border border-[var(--border)] bg-[var(--cream)] px-3.5 text-sm text-[var(--ink)] focus:border-[var(--accent)] focus:outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-xs text-[var(--muted)]">
                                คำอธิบายสินค้า
                            </label>
                            <textarea
                                rows={2}
                                placeholder="บรรยายความหมายและโทนของช่อดอกไม้..."
                                value={newProductDescription}
                                onChange={(e) =>
                                    setNewProductDescription(e.target.value)
                                }
                                className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--cream)] p-3 text-sm text-[var(--ink)] focus:border-[var(--accent)] focus:outline-none"
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                            <div>
                                <label className="block text-xs text-[var(--muted)]">
                                    ราคา (฿) *
                                </label>
                                <input
                                    type="number"
                                    required
                                    min={0}
                                    step="0.01"
                                    max={9999999.99}
                                    placeholder="590"
                                    value={newProductPrice}
                                    onChange={(e) =>
                                        setNewProductPrice(e.target.value)
                                    }
                                    className="mt-1 h-11 w-full rounded-lg border border-[var(--border)] bg-[var(--cream)] px-3.5 text-sm text-[var(--ink)] focus:border-[var(--accent)] focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs text-[var(--muted)]">
                                    โทนสี (Color) *
                                </label>
                                <div className="relative mt-1">
                                    <input
                                        type="text"
                                        required
                                        maxLength={100}
                                        placeholder="pink, white, red"
                                        value={newProductColor}
                                        onChange={(e) =>
                                            setNewProductColor(e.target.value)
                                        }
                                        className="h-11 w-full rounded-lg border border-[var(--border)] bg-[var(--cream)] pr-3 pl-9 text-sm text-[var(--ink)] focus:border-[var(--accent)] focus:outline-none"
                                    />
                                    <span
                                        className="absolute top-1/2 left-3 size-4 -translate-y-1/2 rounded-full border border-[#ba9ea6]"
                                        style={{
                                            backgroundColor:
                                                getSwatchColor(
                                                    newProductColor,
                                                ) ?? '#dbc3ca',
                                        }}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs text-[var(--muted)]">
                                    จำนวนสต็อก *
                                </label>
                                <input
                                    type="number"
                                    required
                                    min={0}
                                    step={1}
                                    max={1000000}
                                    placeholder="10"
                                    value={newProductStock}
                                    onChange={(e) =>
                                        setNewProductStock(e.target.value)
                                    }
                                    className="mt-1 h-11 w-full rounded-lg border border-[var(--border)] bg-[var(--cream)] px-3.5 text-sm text-[var(--ink)] focus:border-[var(--accent)] focus:outline-none"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs text-[var(--muted)]">
                                รูปภาพช่อดอกไม้
                            </label>
                            <div className="mt-1.5 flex items-center gap-3">
                                {newProductFilePreview && (
                                    <div className="relative size-16 shrink-0 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--rose-soft)]">
                                        <img
                                            src={newProductFilePreview}
                                            alt="ตัวอย่างรูปสินค้า"
                                            className="size-full object-cover"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setNewProductFile(null);
                                                setNewProductFilePreview(null);
                                            }}
                                            className="absolute top-1 right-1 grid size-5 place-items-center rounded-full bg-black/60 text-white"
                                        >
                                            <X size={10} />
                                        </button>
                                    </div>
                                )}
                                <label className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-[var(--border)] bg-[var(--rose-soft)]/50 px-4 py-3 text-xs text-[var(--ink)] transition-colors hover:border-[var(--accent)] hover:bg-[var(--rose-soft)]">
                                    <Upload
                                        size={15}
                                        className="text-[var(--accent)]"
                                    />
                                    <span>
                                        {newProductFile
                                            ? newProductFile.name
                                            : 'เลือกรูปภาพประกอบสินค้า'}
                                    </span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                setNewProductFile(file);
                                                setNewProductFilePreview(
                                                    URL.createObjectURL(file),
                                                );
                                            }
                                        }}
                                    />
                                </label>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setIsAddModalOpen(false)}
                                className="rounded-full border border-[var(--border)] px-5 py-2.5 text-xs text-[var(--muted)] hover:bg-[var(--rose-soft)]"
                            >
                                ยกเลิก
                            </button>
                            <button type="submit" className={primaryBtn}>
                                บันทึกช่อดอกไม้
                            </button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* ========================================================= */}
            {/* DIALOG: ASSIGN ROLE CONFIRMATION (Using flower-dialog)    */}
            {/* ========================================================= */}
            <Dialog
                open={roleConfirmUser !== null}
                onOpenChange={(open) => {
                    if (!open) setRoleConfirmUser(null);
                }}
            >
                <DialogContent className="flower-dialog sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            {targetRole === 'admin'
                                ? 'ยืนยันการมอบสิทธิ์ผู้ดูแลร้าน (Admin)'
                                : 'ยืนยันการเปลี่ยนบทบาทเป็นลูกค้า (Customer)'}
                        </DialogTitle>
                        <DialogDescription>
                            {targetRole === 'admin'
                                ? `คุณต้องการเปลี่ยนบทบาทของ "${roleConfirmUser?.username || roleConfirmUser?.name}" เป็นผู้ดูแลระบบ (Admin) ใช่หรือไม่? บัญชีนี้จะสามารถจัดการสินค้า คำสั่งซื้อ และสมาชิกได้`
                                : `คุณต้องการถอดสิทธิ์ผู้ดูแลระบบของ "${roleConfirmUser?.username || roleConfirmUser?.name}" และเปลี่ยนกลับเป็นลูกค้าทั่วไปใช่หรือไม่?`}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="mt-4 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => setRoleConfirmUser(null)}
                            className="rounded-full border border-[var(--border)] px-5 py-2.5 text-xs text-[var(--muted)] hover:bg-[var(--rose-soft)]"
                        >
                            ยกเลิก
                        </button>
                        <button
                            type="button"
                            onClick={handleConfirmRoleChange}
                            className={primaryBtn}
                        >
                            <Check size={15} /> ยืนยันการเปลี่ยนบทบาท
                        </button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
