import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    Ban,
    Check,
    CheckCircle2,
    ChevronDown,
    Clock,
    DollarSign,
    Edit3,
    Eye,
    Filter,
    Flower2,
    Info,
    Layers,
    LogOut,
    Mail,
    MapPin,
    Minus,
    Package,
    Phone,
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
    User,
    UserCheck,
    UserRound,
    Users,
    X,
} from 'lucide-react';
import React, { useState } from 'react';
import { logout } from '@/routes';
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
    description?: string;
    thai?: string;
    price: number;
    color: string;
    size?: string;
    rating: number;
    stock: number;
    position?: string;
    image: string;
    is_deleted?: boolean;
}

const initialOrders: Order[] = [
    {
        id: 'ORD-2026-0402',
        date: 'Ordered on April 2, 2026, at 11:11 AM',
        total: 1998,
        status: 'delivery',
        customerName: 'Siravit Phongsawat',
        customerEmail: 'siravit@flowerboutique.com',
        customerRole: 'customer',
        userId: 2,
        addressName: 'Home',
        recipientName: 'Siravit Phongsawat',
        phoneNumber: '081-234-5678',
        fullAddress: '123 Sukhumvit Road, Khlong Toei, Bangkok 10110',
        items: [
            {
                id: 1,
                name: 'Peachy Morning Bouquet',
                variant: 'Color Green',
                price: 999,
                quantity: 1,
                image: '/images/homepage/bouquets.png',
                position: '74% 50%',
            },
            {
                id: 2,
                name: 'Ivory Whisper Roses',
                variant: 'Color Green',
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
        customerName: 'Ananya Srisuk',
        customerEmail: 'ananya@flowerboutique.com',
        customerRole: 'customer',
        userId: 3,
        addressName: 'Office',
        recipientName: 'Ananya Srisuk',
        phoneNumber: '089-876-5432',
        fullAddress: '88 Silom Road, Bang Rak, Bangkok 10500',
        items: [
            {
                id: 3,
                name: 'A Little Romance Arrangement',
                variant: 'Color Green',
                price: 999,
                quantity: 1,
                image: '/images/homepage/bouquets.png',
                position: '65% 35%',
            },
            {
                id: 4,
                name: 'Forever Yours Special Edition',
                variant: 'Color Green',
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
        username: 'Myname lastname',
        name: 'Myname lastname',
        email: 'eieiei@email.com',
        status: 'active',
        joined: 'March 14, 2026',
        ordersCount: 4,
    },
    {
        id: 2,
        username: 'Ploy Pailin Srisuk',
        name: 'Ploy Pailin Srisuk',
        email: 'eieiei@email.com',
        status: 'active',
        joined: 'March 20, 2026',
        ordersCount: 2,
    },
    {
        id: 3,
        username: 'Nattawut Somchai',
        name: 'Nattawut Somchai',
        email: 'eieiei@email.com',
        status: 'active',
        joined: 'March 28, 2026',
        ordersCount: 1,
    },
    {
        id: 4,
        username: 'Chanya Wongsuwan',
        name: 'Chanya Wongsuwan',
        email: 'eieiei@email.com',
        status: 'active',
        joined: 'April 01, 2026',
        ordersCount: 5,
    },
    {
        id: 5,
        username: 'Thanatorn Prasert',
        name: 'Thanatorn Prasert',
        email: 'eieiei@email.com',
        status: 'active',
        joined: 'April 03, 2026',
        ordersCount: 3,
    },
    {
        id: 6,
        username: 'Akarin Chaiwong',
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

interface AdminProps {
    initialTab?: 'orders' | 'users' | 'products';
    initialEditId?: number;
    dbProducts?: any[];
    dbOrders?: any[];
    dbUsers?: any[];
    dbColors?: string[];
    statusCounts?: Record<string, number>;
}

// Utility to verify if color string can be rendered in CSS (returns valid color or null)
const getValidCssColor = (colorStr?: string): string | null => {
    if (!colorStr) return null;
    const clean = colorStr.trim().toLowerCase();
    if (!clean) return null;
    if (/^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(clean)) return clean;
    if (/^(rgb|hsl)a?\(.+\)$/i.test(clean)) return clean;
    if (typeof window !== 'undefined' && typeof Option !== 'undefined') {
        const testStyle = new Option().style;
        testStyle.color = clean;
        if (testStyle.color !== '') {
            return clean;
        }
    }
    const standardColors = [
        'red', 'green', 'blue', 'pink', 'yellow', 'purple', 'orange',
        'white', 'black', 'gray', 'grey', 'brown', 'violet', 'cyan',
        'magenta', 'lime', 'coral', 'crimson', 'gold', 'indigo', 'lavender',
        'peachpuff', 'salmon', 'teal', 'turquoise', 'plum', 'maroon', 'navy',
        'olive', 'beige', 'khaki', 'ivory', 'chocolate'
    ];
    if (standardColors.includes(clean)) return clean;
    return null;
};

const mapDbProducts = (list: any[]): ProductItem[] =>
    list.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description || '',
        thai: p.name,
        price: Number(p.price),
        color: p.color || 'pink',
        rating: Number(p.rating || 5.0),
        stock: Number(p.stock),
        position: 'center',
        image: p.picture_path || '/images/homepage/bouquets.png',
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

        const customerName = o.customer_name || o.username || recipientName || 'Customer';

        return {
            id: String(o.id),
            date: o.created_at
                ? new Date(o.created_at).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                  })
                : 'Recent',
            total: Number(o.total_price),
            status: ['delivered', 'success'].includes(o.status) ? 'success' : 'delivery',
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
                          name: item.product_name || 'Bouquet',
                          variant: `Qty: ${item.quantity}`,
                          price: Number(item.purchase_price || 999),
                          quantity: item.quantity,
                          image: item.picture_path || '/images/homepage/bouquets.png',
                      }))
                    : [
                          {
                              id: 1,
                              name: 'Flower Bouquet',
                              variant: 'Standard',
                              price: Number(o.total_price),
                              quantity: 1,
                              image: '/images/homepage/bouquets.png',
                          },
                      ],
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
                ? new Date(u.created_at).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                  })
                : 'Member',
            ordersCount: Number(u.orders_count || 0),
        };
    });

export default function AdminPage({
    initialTab = 'products',
    initialEditId,
    dbProducts,
    dbOrders,
    dbUsers,
    dbColors,
}: AdminProps) {
    const [activeNav, setActiveNav] = useState<'orders' | 'users' | 'products'>(initialTab);
    const [orders, setOrders] = useState<Order[]>(() =>
        dbOrders && dbOrders.length > 0 ? mapDbOrders(dbOrders) : initialOrders
    );
    const [users, setUsers] = useState<UserAccount[]>(() =>
        dbUsers && dbUsers.length > 0 ? mapDbUsers(dbUsers) : initialUsers
    );
    const [products, setProducts] = useState<ProductItem[]>(() =>
        dbProducts && dbProducts.length > 0 ? mapDbProducts(dbProducts) : initialProducts
    );

    // Editing State (From Wireframe Edit Product Page)
    const [editingProduct, setEditingProduct] = useState<ProductItem | null>(() => {
        const pool = dbProducts && dbProducts.length > 0 ? mapDbProducts(dbProducts) : initialProducts;
        if (initialEditId) {
            return pool.find((p) => p.id === initialEditId) || pool[0];
        }
        return null;
    });

    // Form fields for editing
    const [editName, setEditName] = useState(editingProduct?.name || '');
    const [editPrice, setEditPrice] = useState(editingProduct?.price || 690);
    const [editDesc, setEditDesc] = useState(
        editingProduct?.description || 'descriptions descriptions \ndescriptions'
    );
    const [editColor, setEditColor] = useState<string>(editingProduct?.color || 'pink');
    const [editStock, setEditStock] = useState<number>(editingProduct?.stock || 1);
    const [editPhotoFile, setEditPhotoFile] = useState<File | null>(null);
    const [editPhotoPreview, setEditPhotoPreview] = useState<string | null>(null);
    const [showSaveToast, setShowSaveToast] = useState(false);

    // Available Colors in DB
    const availableColors = Array.from(
        new Set([
            ...(dbColors || []),
            ...products.map((p) => p.color?.trim()).filter(Boolean),
        ])
    ) as string[];

    // Global Search
    const [searchQuery, setSearchQuery] = useState('');

    // Orders Filter State
    const [orderStatusFilter, setOrderStatusFilter] = useState<'all' | 'delivery' | 'success'>('all');

    // Users Filter State
    const [userStatusFilter, setUserStatusFilter] = useState<'all' | 'active' | 'blocked'>('all');
    const [isUserGuideOpen, setIsUserGuideOpen] = useState(false);

    // Products Filter State
    const [selectedColors, setSelectedColors] = useState<string[]>([]);
    const [selectedCostRanges, setSelectedCostRanges] = useState<string[]>([]);
    const [selectedRatings, setSelectedRatings] = useState<number[]>([]);

    // Modal Add Product State
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newProductName, setNewProductName] = useState('');
    const [newProductPrice, setNewProductPrice] = useState('690');
    const [newProductColor, setNewProductColor] = useState('pink');
    const [newProductStock, setNewProductStock] = useState('10');
    const [newProductDescription, setNewProductDescription] = useState('');
    const [newProductFile, setNewProductFile] = useState<File | null>(null);
    const [newProductFilePreview, setNewProductFilePreview] = useState<string | null>(null);

    // Role Confirmation Modal State
    const [roleConfirmUser, setRoleConfirmUser] = useState<UserAccount | null>(null);
    const [targetRole, setTargetRole] = useState<'customer' | 'admin'>('admin');

    // Start editing a product
    const handleStartEdit = (product: ProductItem) => {
        setEditingProduct(product);
        setEditName(product.name);
        setEditPrice(product.price);
        setEditDesc(product.description || 'descriptions descriptions \ndescriptions');
        setEditColor(product.color || 'pink');
        setEditStock(product.stock || 1);
        setEditPhotoFile(null);
        setEditPhotoPreview(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Save edited product to backend (Supports both photo upload and text update)
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
                }
            );
        }

        setProducts((prev) =>
            prev.map((p) =>
                p.id === editingProduct.id
                    ? {
                          ...p,
                          name: editName,
                          price: editPrice,
                          description: editDesc,
                          color: editColor,
                          stock: editStock,
                          image: editPhotoPreview || p.image,
                      }
                    : p
            )
        );
    };

    // Toggle Order Status on backend
    const handleConfirmSuccess = (orderId: string) => {
        router.patch(
            `/admin/orders/${orderId}/status`,
            { status: 'delivered' },
            { preserveScroll: true }
        );

        setOrders((prev) =>
            prev.map((order) =>
                order.id === orderId ? { ...order, status: 'success' } : order
            )
        );
    };

    // Toggle User Block Status on backend
    const handleToggleUserBlock = (userId: number) => {
        router.patch(
            `/admin/users/${userId}/ban`,
            {},
            { preserveScroll: true }
        );

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
            }
        );

        setUsers((prev) =>
            prev.map((user) => (user.id === userId ? { ...user, role } : user))
        );
        setRoleConfirmUser(null);
    };

    // Delete Product on backend
    const handleDeleteProduct = (productId: number) => {
        router.delete(`/admin/products/${productId}`, { preserveScroll: true });
        setProducts((prev) => prev.filter((p) => p.id !== productId));
        if (editingProduct?.id === productId) {
            setEditingProduct(null);
        }
    };

    // Toggle sell on backend
    const handleToggleSell = (productId: number) => {
        router.patch(`/admin/products/${productId}/toggle`, {}, { preserveScroll: true });
        setProducts((prev) =>
            prev.map((p) => (p.id === productId ? { ...p, is_deleted: !p.is_deleted } : p))
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
                setNewProductPrice('690');
                setNewProductColor('pink');
                setNewProductStock('10');
                setNewProductDescription('');
                setNewProductFile(null);
                setNewProductFilePreview(null);
            },
        });

        const newId = Date.now();
        const created: ProductItem = {
            id: newId,
            name: newProductName.trim(),
            description: newProductDescription.trim() || 'ช่อดอกไม้สดใหม่ บรรจงจัดด้วยความประณีต',
            thai: '',
            price: Number(newProductPrice) || 690,
            color: newProductColor.trim(),
            rating: 5.0,
            stock: Number(newProductStock) || 10,
            image: newProductFilePreview || '/images/homepage/bouquets.png',
            position: '50% 50%',
        };

        setProducts([created, ...products]);
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
            selectedColors.length === 0 ||
            selectedColors.some(
                (c) => (p.color || '').trim().toLowerCase() === c.trim().toLowerCase()
            );

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
            (o.customerName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (o.customerEmail || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (o.phoneNumber || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (o.recipientName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
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

                    {/* Admin User Profile & Logout */}
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

                        {/* Log Out Button */}
                        <Link
                            href={logout()}
                            as="button"
                            className="inline-flex h-11 items-center gap-2 rounded-full border border-[var(--border)] bg-white/90 px-4 text-xs font-semibold text-[var(--muted)] shadow-xs transition-all hover:border-red-200 hover:bg-red-50 hover:text-red-600 active:scale-95"
                            title="ออกจากระบบ (Log Out)"
                        >
                            <LogOut size={16} />
                            <span>Log out</span>
                        </Link>
                    </div>
                </div>

                {/* Subnavigation Bar (Order History | User | Products) */}
                <div className="border-t border-[var(--border)]/60 bg-[var(--rose-soft)]/50">
                    <div className="flower-container flex items-center gap-3 py-2.5">
                        {/* Order History Tab */}
                        <Link
                            href="/admin/orders"
                            className={`flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition-all ${
                                activeNav === 'orders' && !editingProduct
                                    ? 'bg-[var(--accent)] text-white shadow-xs'
                                    : 'text-[var(--muted)] hover:bg-white/60 hover:text-[var(--ink)]'
                            }`}
                        >
                            <Package size={16} />
                            Order History
                        </Link>

                        {/* User Tab */}
                        <Link
                            href="/admin/users"
                            className={`flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition-all ${
                                activeNav === 'users'
                                    ? 'bg-[var(--accent)] text-white shadow-xs'
                                    : 'text-[var(--muted)] hover:bg-white/60 hover:text-[var(--ink)]'
                            }`}
                        >
                            <Users size={16} />
                            User
                        </Link>

                        {/* Products Tab */}
                        <Link
                            href="/admin/products"
                            className={`flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition-all ${
                                activeNav === 'products' && !editingProduct
                                    ? 'bg-[var(--accent)] text-white shadow-xs'
                                    : 'text-[var(--muted)] hover:bg-white/60 hover:text-[var(--ink)]'
                            }`}
                        >
                            <ShoppingBag size={16} />
                            Products
                        </Link>
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
                                <div className="relative aspect-5/6 w-full max-w-[515px] overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--rose-soft)] shadow-xs group">
                                    <img
                                        src={editPhotoPreview || editingProduct.image}
                                        alt={editName}
                                        className="size-full object-cover"
                                        style={{
                                            objectPosition: editingProduct.position || 'center',
                                        }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-90 sm:opacity-0 transition-opacity group-hover:opacity-100 flex items-end justify-center p-6">
                                        <label
                                            htmlFor="edit-product-photo"
                                            className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-white/95 px-5 py-2.5 text-xs font-bold text-[var(--ink)] shadow-md backdrop-blur-xs transition-transform hover:scale-105"
                                        >
                                            <Upload size={14} /> Replace Photo
                                        </label>
                                        <input
                                            id="edit-product-photo"
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    setEditPhotoFile(file);
                                                    setEditPhotoPreview(URL.createObjectURL(file));
                                                }
                                            }}
                                        />
                                    </div>
                                </div>
                                <span className="mt-3 text-xs tracking-wider text-[var(--muted)] uppercase">
                                    {editPhotoFile ? `Selected: ${editPhotoFile.name}` : 'Product Photo (515 × 621 px)'}
                                </span>
                            </div>

                            {/* RIGHT: Product Details & Controls (Matching Wireframe Coordinates) */}
                            <div className="flex flex-col justify-between space-y-6">
                                <div className="space-y-6">
                                    {/* 1. PRICE (Large Red text in wireframe: ฿ 999) */}
                                    <div>
                                        <span className="text-xs uppercase tracking-wider text-[var(--muted)]">
                                            Product Price
                                        </span>
                                        <div className="mt-1 flex items-center gap-2">
                                            <span className="font-serif text-4xl font-extrabold text-[#FF4747] md:text-5xl">
                                                ฿
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

                                    {/* 4. COLOR (Free text input with live preview dot and available color pills) */}
                                    <div>
                                        <label className="block text-sm font-semibold uppercase tracking-wider text-[var(--ink)]">
                                            Color
                                        </label>
                                        <div className="mt-2 flex items-center gap-3">
                                            <div className="relative flex-1 max-w-sm">
                                                <input
                                                    type="text"
                                                    value={editColor}
                                                    onChange={(e) => setEditColor(e.target.value)}
                                                    placeholder="e.g. pink, red, lavender, #e11d48..."
                                                    className="h-11 w-full rounded-xl border border-[var(--border)] bg-white pl-10 pr-3.5 text-sm font-medium text-[var(--ink)] focus:border-[var(--accent)] focus:outline-none"
                                                />
                                                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                                                    {getValidCssColor(editColor) ? (
                                                        <span
                                                            className="block size-5 rounded-full border border-black/10 shadow-2xs"
                                                            style={{ backgroundColor: getValidCssColor(editColor)! }}
                                                        />
                                                    ) : (
                                                        <span className="block size-5 rounded-full border border-dashed border-[var(--border)] bg-[var(--rose-soft)]" />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        {availableColors.length > 0 && (
                                            <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                                                <span className="text-xs text-[var(--muted)] mr-1">Quick pick:</span>
                                                {availableColors.map((c) => {
                                                    const swatch = getValidCssColor(c);
                                                    const isActive = editColor.toLowerCase() === c.toLowerCase();
                                                    return (
                                                        <button
                                                            key={c}
                                                            type="button"
                                                            onClick={() => setEditColor(c)}
                                                            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-all ${
                                                                isActive
                                                                    ? 'border-[var(--accent)] bg-[var(--accent)] text-white'
                                                                    : 'border-[var(--border)] bg-white text-[var(--ink)] hover:bg-[var(--rose-soft)]'
                                                            }`}
                                                        >
                                                            {swatch ? (
                                                                <span
                                                                    className="size-2.5 rounded-full border border-black/10 shrink-0"
                                                                    style={{ backgroundColor: swatch }}
                                                                />
                                                            ) : null}
                                                            <span className="capitalize">{c}</span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        )}
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
                                                ฿{item.price.toLocaleString()}
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

                            {/* Color Section (Dynamically fetched from DB products.color) */}
                            <div className="border-b border-[var(--border)]/60 py-5">
                                <h3 className="mb-3.5 text-sm font-bold uppercase tracking-wider text-[var(--ink)]">
                                    Color
                                </h3>
                                <div className="space-y-3">
                                    {availableColors.length === 0 ? (
                                        <p className="text-xs text-[var(--muted)]">No colors available</p>
                                    ) : (
                                        availableColors.map((col) => {
                                            const validCssColor = getValidCssColor(col);
                                            const isSelected = selectedColors.includes(col.toLowerCase());
                                            return (
                                                <label
                                                    key={col}
                                                    onClick={() => toggleColorFilter(col.toLowerCase())}
                                                    className="flex cursor-pointer items-center justify-between text-sm text-[var(--ink)]"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        {validCssColor ? (
                                                            <span
                                                                className="size-5 rounded-full border border-black/10 shadow-2xs shrink-0"
                                                                style={{ backgroundColor: validCssColor }}
                                                            />
                                                        ) : null}
                                                        <span className="font-medium capitalize">{col}</span>
                                                    </div>
                                                    <div
                                                        className={`grid size-5 shrink-0 place-items-center rounded-full border transition-colors ${
                                                            isSelected
                                                                ? 'border-[var(--accent)] bg-[var(--accent)] text-white'
                                                                : 'border-[var(--border)] bg-[var(--rose-soft)]/50'
                                                        }`}
                                                    >
                                                        {isSelected && <Check size={12} strokeWidth={3} />}
                                                    </div>
                                                </label>
                                            );
                                        })
                                    )}
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
                                            <span className="font-medium">฿{range}</span>
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
                                                        onClick={() => handleToggleSell(product.id)}
                                                        className={`grid size-8 place-items-center rounded-full shadow-xs backdrop-blur-xs transition-colors ${
                                                            product.is_deleted
                                                                ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                                                                : 'bg-white/95 text-slate-600 hover:bg-slate-100'
                                                        }`}
                                                        title={product.is_deleted ? 'เปิดการขาย (Open Sale)' : 'ปิดการขาย (Close Sale)'}
                                                    >
                                                        <Ban size={14} />
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

                                                {product.is_deleted && (
                                                    <div className="absolute top-3 left-3 rounded-full bg-red-600/90 px-2.5 py-0.5 text-[10px] font-bold text-white shadow-xs backdrop-blur-xs">
                                                        ปิดการขาย
                                                    </div>
                                                )}

                                                {product.color && (
                                                    <div className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-0.5 text-[11px] font-semibold text-[var(--ink)] shadow-2xs backdrop-blur-xs">
                                                        {getValidCssColor(product.color) ? (
                                                            <span
                                                                className="size-2 rounded-full border border-black/10 shrink-0"
                                                                style={{
                                                                    backgroundColor: getValidCssColor(product.color)!,
                                                                }}
                                                            />
                                                        ) : null}
                                                        <span className="capitalize">{product.color}</span>
                                                    </div>
                                                )}
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
                                                    ฿{product.price.toLocaleString()}
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

                    {/* DROPDOWN INSTRUCTION GUIDE & PAGE USE TIPS */}
                    <div className="mb-6 overflow-hidden rounded-3xl border border-[var(--border)] bg-white shadow-2xs transition-all duration-300">
                        <button
                            type="button"
                            onClick={() => setIsUserGuideOpen((prev) => !prev)}
                            className="flex w-full items-center justify-between px-5 py-3.5 text-left transition-colors hover:bg-[var(--rose-soft)]/20"
                            aria-expanded={isUserGuideOpen}
                        >
                            <div className="flex items-center gap-3">
                                <div className="grid size-8 shrink-0 place-items-center rounded-xl bg-[var(--accent)]/15 text-[var(--accent)] border border-[var(--accent)]/20">
                                    <Info size={16} strokeWidth={2.4} />
                                </div>
                                <div className="flex flex-wrap items-center gap-2.5">
                                    <span className="font-serif text-sm font-bold text-[var(--ink)]">
                                        How to assign admin
                                    </span>
                                    <span className="rounded-full bg-[var(--cream)] border border-[var(--border)] px-2.5 py-0.5 text-[11px] font-medium text-[var(--muted)]">
                                        Click to view instructions & page guidelines
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--muted)]">
                                <span className="hidden sm:inline">
                                    {isUserGuideOpen ? 'Hide Guide' : 'Show Guide'}
                                </span>
                                <ChevronDown
                                    size={16}
                                    className={`transition-transform duration-300 ${
                                        isUserGuideOpen ? 'rotate-180 text-[var(--accent)]' : ''
                                    }`}
                                />
                            </div>
                        </button>

                        {/* Dropdown Body: Rendered when opened */}
                        {isUserGuideOpen && (
                            <div className="border-t border-[var(--border)]/70 bg-gradient-to-b from-[var(--cream)]/30 to-white p-5 sm:p-6 animate-in fade-in duration-200">
                                {/* Section 1: How to Assign Admin Role */}
                                <div>
                                    <div className="flex items-center gap-2">
                                        <ShieldCheck size={18} className="text-[var(--accent)]" />
                                        <h3 className="font-serif text-base font-bold text-[var(--ink)]">
                                            How to Assign or Revoke the Admin Role
                                        </h3>
                                    </div>
                                    <p className="mt-1 text-xs text-[var(--muted)]">
                                        Promoting a user grants them full privileges to add/edit bouquets, adjust inventory, supervise customer orders, and manage accounts.
                                    </p>

                                    <div className="mt-3.5 grid grid-cols-1 gap-3 sm:grid-cols-3">
                                        <div className="flex items-start gap-3 rounded-2xl border border-[var(--border)]/70 bg-white p-3.5 shadow-2xs">
                                            <span className="grid size-6 shrink-0 place-items-center rounded-full bg-[var(--accent)] text-xs font-bold text-white">
                                                1
                                            </span>
                                            <div>
                                                <p className="text-xs font-bold text-[var(--ink)]">Locate the Member</p>
                                                <p className="mt-0.5 text-[11px] leading-relaxed text-[var(--muted)]">
                                                    Find the user's card in the directory list below or use the search bar.
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-3 rounded-2xl border border-[var(--border)]/70 bg-white p-3.5 shadow-2xs">
                                            <span className="grid size-6 shrink-0 place-items-center rounded-full bg-[var(--accent)] text-xs font-bold text-white">
                                                2
                                            </span>
                                            <div>
                                                <p className="text-xs font-bold text-[var(--ink)]">Click Role Pill</p>
                                                <p className="mt-0.5 text-[11px] leading-relaxed text-[var(--muted)]">
                                                    In the <span className="font-semibold text-[var(--ink)]">[ Admin | Block ]</span> tab, click the <span className="font-semibold text-[var(--accent)]">Customer</span> or <span className="font-semibold text-[var(--accent)]">Admin</span> pill.
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-3 rounded-2xl border border-[var(--border)]/70 bg-white p-3.5 shadow-2xs">
                                            <span className="grid size-6 shrink-0 place-items-center rounded-full bg-[var(--accent)] text-xs font-bold text-white">
                                                3
                                            </span>
                                            <div>
                                                <p className="text-xs font-bold text-[var(--ink)]">Confirm in Modal</p>
                                                <p className="mt-0.5 text-[11px] leading-relaxed text-[var(--muted)]">
                                                    A confirmation dialog will pop up. Click <span className="font-semibold text-[var(--accent)]">"Yes, Assign Admin"</span> to save immediately.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Section 2: Crucial Instructions to Use This Page */}
                                <div className="mt-5 border-t border-[var(--border)]/60 pt-4">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                                        Crucial Page Instructions & Security Rules
                                    </h4>

                                    <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
                                        <div className="rounded-xl border border-[var(--border)]/60 bg-white p-3">
                                            <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--ink)]">
                                                <CheckCircle2 size={14} className="text-emerald-600" />
                                                <span>Active / Blocked Status</span>
                                            </div>
                                            <p className="mt-1 text-[11px] leading-relaxed text-[var(--muted)]">
                                                Displayed prominently beside the profile. Blocked members are immediately denied sign-in and checkout.
                                            </p>
                                        </div>

                                        <div className="rounded-xl border border-[var(--border)]/60 bg-white p-3">
                                            <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--ink)]">
                                                <Ban size={14} className="text-[#FF5F2A]" />
                                                <span>Block / Unblock Action</span>
                                            </div>
                                            <p className="mt-1 text-[11px] leading-relaxed text-[var(--muted)]">
                                                Toggle member access anytime via the orange Block / Unblock button in the right controls tab.
                                            </p>
                                        </div>

                                        <div className="rounded-xl border border-[var(--border)]/60 bg-white p-3">
                                            <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--ink)]">
                                                <ShoppingBag size={14} className="text-[var(--accent)]" />
                                                <span>Orders Made Counter</span>
                                            </div>
                                            <p className="mt-1 text-[11px] leading-relaxed text-[var(--muted)]">
                                                The centered pill tracks total bouquets purchased (formatted as <span className="font-mono font-bold">001 | bouquets</span>).
                                            </p>
                                        </div>

                                        <div className="rounded-xl border border-[var(--border)]/60 bg-white p-3">
                                            <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--ink)]">
                                                <ShieldAlert size={14} className="text-amber-600" />
                                                <span>Self-Action Lock</span>
                                            </div>
                                            <p className="mt-1 text-[11px] leading-relaxed text-[var(--muted)]">
                                                For safety, administrators cannot demote their own role or block their own currently signed-in account.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
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
                                    className="group grid grid-cols-1 items-center gap-3.5 rounded-3xl border border-[var(--border)] bg-white p-4.5 shadow-xs transition-all duration-200 hover:border-[var(--accent)]/40 hover:shadow-md lg:grid-cols-[1fr_auto_1fr] lg:gap-4 lg:px-6 lg:py-3.5"
                                >
                                    {/* 1. LEFT: PROFILE + FIXED COMPACT ACTIVE BADGE */}
                                    <div className="flex min-w-0 items-center gap-3">
                                        <div className="relative grid size-11 shrink-0 place-items-center rounded-2xl border border-[var(--border)]/60 bg-[var(--rose-soft)] text-[var(--accent)] shadow-2xs">
                                            <UserRound size={18} strokeWidth={1.8} />
                                            <span className="absolute -bottom-1 -right-1 grid size-4.5 place-items-center rounded-full border border-[var(--border)] bg-white text-[9px] font-bold text-[var(--ink)] shadow-2xs">
                                                {(user.username || user.name || 'U').charAt(0).toUpperCase()}
                                            </span>
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-[10px] tracking-wider text-[var(--muted)] uppercase">
                                                    Username
                                                </span>
                                                <span
                                                    className="block truncate font-serif text-sm font-bold text-[var(--ink)]"
                                                    title={user.username || user.name}
                                                >
                                                    {user.username || user.name || 'Member'}
                                                </span>
                                            </div>

                                            <div className="mt-0.5 flex items-center gap-1 text-xs text-[var(--muted)]">
                                                <span className="text-[10px] tracking-wider uppercase">Email:</span>
                                                <span
                                                    className="block truncate font-medium text-[var(--ink)]"
                                                    title={user.email}
                                                >
                                                    {user.email}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Fixed & Compact Status Badge (Noticeable, not too small) */}
                                        <div className="shrink-0">
                                            {user.status === 'active' ? (
                                                <span className="inline-flex h-6.5 w-20 items-center justify-center gap-1 rounded-full border border-emerald-300 bg-emerald-50 text-[11px] font-bold text-emerald-800 shadow-2xs">
                                                    <CheckCircle2 size={13} className="shrink-0 text-emerald-600" strokeWidth={2.5} />
                                                    <span>Active</span>
                                                </span>
                                            ) : (
                                                <span className="inline-flex h-6.5 w-20 items-center justify-center gap-1 rounded-full border border-orange-300 bg-orange-50 text-[11px] font-bold text-[#FF5F2A] shadow-2xs">
                                                    <Ban size={13} className="shrink-0 text-[#FF5F2A]" strokeWidth={2.5} />
                                                    <span>Blocked</span>
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* 2. MIDDLE: ORDERS MADE (Mathematically Fixed in Middle) */}
                                    <div className="flex shrink-0 items-center justify-start lg:justify-center">
                                        <div className="inline-flex h-7 items-center gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--cream)]/80 px-2.5 shadow-2xs">
                                            <span className="text-[10px] font-bold tracking-wider text-[var(--muted)] uppercase">
                                                Orders
                                            </span>
                                            <div className="flex items-center gap-1 font-mono text-xs font-semibold text-[var(--ink)]">
                                                <span className="tabular-nums font-bold text-[var(--accent)]">
                                                    {String(user.ordersCount || 0).padStart(3, '0')}
                                                </span>
                                                <span className="text-[var(--border)] select-none">|</span>
                                                <span className="font-sans text-[11px] font-medium text-[var(--muted)]">
                                                    bouquets
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 3. RIGHT: CONTROLS [ Admin | Block ] (Aligned to Right) */}
                                    <div className="flex shrink-0 items-center justify-start lg:justify-end">
                                        <div className="flex h-8 items-center rounded-2xl border border-[var(--border)] bg-[var(--cream)]/60 p-0.5 shadow-2xs transition-all group-hover:border-[var(--accent)]/30">
                                            {/* Role Button (Admin / Customer) */}
                                            <button
                                                type="button"
                                                onClick={() => handlePromptChangeRole(user)}
                                                title="คลิกเพื่อเปลี่ยน Role ผู้ใช้ (เปิดหน้าต่างยืนยัน)"
                                                className={`flex h-6.5 w-24 items-center justify-center gap-1.5 rounded-xl border text-[11px] font-semibold transition-all hover:shadow-xs active:scale-95 ${
                                                    user.role === 'admin'
                                                        ? 'border-[var(--accent)]/40 bg-[var(--accent)]/15 font-bold text-[var(--accent)]'
                                                        : 'border-transparent bg-white text-[var(--ink)] hover:border-[var(--border)]'
                                                }`}
                                            >
                                                {user.role === 'admin' ? (
                                                    <ShieldCheck size={13} className="shrink-0 text-[var(--accent)]" />
                                                ) : (
                                                    <UserRound size={13} className="shrink-0 text-[var(--muted)]" />
                                                )}
                                                <span className="truncate">{user.role === 'admin' ? 'Admin' : 'Customer'}</span>
                                            </button>

                                            {/* Divider */}
                                            <span className="mx-1 h-3.5 w-px bg-[var(--border)] select-none" />

                                            {/* Block / Unblock Button */}
                                            <div className="w-20">
                                                {user.status === 'active' ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleToggleUserBlock(user.id)}
                                                        className="inline-flex h-6.5 w-full items-center justify-center gap-1 rounded-xl bg-[#FF5F2A] text-[11px] font-bold text-white shadow-2xs transition-all hover:bg-[#e04f1e] hover:shadow-xs active:scale-95"
                                                    >
                                                        <Ban size={12} />
                                                        <span>Block</span>
                                                    </button>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleToggleUserBlock(user.id)}
                                                        className="inline-flex h-6.5 w-full items-center justify-center gap-1 rounded-xl border-2 border-[#FF5F2A] bg-white text-[11px] font-bold text-[#FF5F2A] shadow-2xs transition-all hover:bg-orange-50 active:scale-95"
                                                    >
                                                        <Unlock size={12} />
                                                        <span>Unblock</span>
                                                    </button>
                                                )}
                                            </div>
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
                                                    ฿{order.total.toLocaleString()}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* CUSTOMER & DELIVERY CREDENTIALS */}
                                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border)]/60 bg-[var(--cream)]/45 px-6 py-3.5 md:px-8">
                                        <div className="flex flex-wrap items-center gap-5 sm:gap-7">
                                            {/* Customer Identity */}
                                            <div className="flex items-center gap-3">
                                                <div className="grid size-9 shrink-0 place-items-center rounded-2xl border border-[var(--border)] bg-white font-serif text-sm font-bold text-[var(--accent)] shadow-2xs">
                                                    {(order.customerName || 'U').charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-serif text-sm font-bold text-[var(--ink)]">
                                                            {order.customerName || 'Customer'}
                                                        </span>
                                                        {order.customerRole && (
                                                            <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] border border-[var(--border)] shadow-2xs">
                                                                {order.customerRole}
                                                            </span>
                                                        )}
                                                        {order.userId && (
                                                            <span className="font-mono text-[10px] text-[var(--muted)]">
                                                                #UID-{order.userId}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {order.customerEmail ? (
                                                        <div className="mt-0.5 flex items-center gap-1.5 text-xs text-[var(--muted)]">
                                                            <Mail size={12} className="shrink-0 text-[var(--accent)]" />
                                                            <span className="font-mono">{order.customerEmail}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-[11px] text-[var(--muted)]">No email on file</span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Recipient & Phone Number */}
                                            {(order.phoneNumber || (order.recipientName && order.recipientName !== order.customerName)) && (
                                                <div className="border-l border-[var(--border)]/70 pl-5 sm:pl-7">
                                                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
                                                        Recipient / Contact
                                                    </span>
                                                    <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs">
                                                        {order.recipientName && (
                                                            <span className="font-semibold text-[var(--ink)]">
                                                                {order.recipientName}
                                                            </span>
                                                        )}
                                                        {order.phoneNumber && (
                                                            <a
                                                                href={`tel:${order.phoneNumber}`}
                                                                className="inline-flex items-center gap-1 rounded-md bg-white px-2 py-0.5 font-mono text-[11px] font-semibold text-[var(--accent)] border border-[var(--border)] shadow-2xs hover:underline"
                                                            >
                                                                <Phone size={11} />
                                                                <span>{order.phoneNumber}</span>
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Shipping Address */}
                                        {(order.fullAddress || order.addressName) && (
                                            <div className="flex items-start gap-2 max-w-md text-xs text-[var(--ink)]">
                                                <MapPin size={14} className="shrink-0 text-[var(--accent)] mt-0.5" />
                                                <div className="text-left leading-relaxed">
                                                    {order.addressName && (
                                                        <span className="font-bold text-[var(--ink)] mr-1">
                                                            [{order.addressName}]
                                                        </span>
                                                    )}
                                                    <span className="text-[var(--muted)] text-[11px]">
                                                        {order.fullAddress || 'Address on file'}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
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
                                                            ฿{item.price.toLocaleString()}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between gap-8 sm:justify-end">
                                                    <div className="hidden text-right sm:block">
                                                        <span className="text-xs text-[var(--muted)]">Price</span>
                                                        <div className="font-serif text-xl font-bold text-[var(--ink)]">
                                                            ฿{item.price.toLocaleString()}
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

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                                    Description
                                </label>
                                <textarea
                                    rows={2}
                                    placeholder="Describe the bouquet, floral varieties included, styling notes..."
                                    value={newProductDescription}
                                    onChange={(e) => setNewProductDescription(e.target.value)}
                                    className="mt-1.5 w-full rounded-xl border border-[var(--border)] bg-white p-3 text-sm text-[var(--ink)] focus:border-[var(--accent)] focus:outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                                        Price (฿)
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        min={0}
                                        value={newProductPrice}
                                        onChange={(e) => setNewProductPrice(e.target.value)}
                                        className="mt-1.5 h-11 w-full rounded-xl border border-[var(--border)] bg-white px-3.5 text-sm text-[var(--ink)] focus:border-[var(--accent)] focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                                        Color
                                    </label>
                                    <div className="relative mt-1.5">
                                        <input
                                            type="text"
                                            placeholder="e.g. pink, lavender, #ec4899"
                                            value={newProductColor}
                                            onChange={(e) => setNewProductColor(e.target.value)}
                                            className="h-11 w-full rounded-xl border border-[var(--border)] bg-white pl-9 pr-3 text-sm text-[var(--ink)] focus:border-[var(--accent)] focus:outline-none"
                                        />
                                        <div className="absolute left-2.5 top-1/2 -translate-y-1/2">
                                            {getValidCssColor(newProductColor) ? (
                                                <span
                                                    className="block size-4 rounded-full border border-black/10 shadow-2xs"
                                                    style={{ backgroundColor: getValidCssColor(newProductColor)! }}
                                                />
                                            ) : (
                                                <span className="block size-4 rounded-full border border-dashed border-[var(--border)] bg-[var(--rose-soft)]" />
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                                        Stock Qty
                                    </label>
                                    <input
                                        type="number"
                                        min={0}
                                        required
                                        value={newProductStock}
                                        onChange={(e) => setNewProductStock(e.target.value)}
                                        className="mt-1.5 h-11 w-full rounded-xl border border-[var(--border)] bg-white px-3.5 text-sm text-[var(--ink)] focus:border-[var(--accent)] focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                                    Bouquet Picture
                                </label>
                                <div className="mt-1.5 flex items-center gap-3">
                                    {newProductFilePreview ? (
                                        <div className="relative size-16 shrink-0 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--rose-soft)]">
                                            <img
                                                src={newProductFilePreview}
                                                alt="Preview"
                                                className="size-full object-cover"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setNewProductFile(null);
                                                    setNewProductFilePreview(null);
                                                }}
                                                className="absolute top-1 right-1 grid size-5 place-items-center rounded-full bg-black/60 text-white hover:bg-black"
                                            >
                                                <X size={10} />
                                            </button>
                                        </div>
                                    ) : null}

                                    <label className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--border)] bg-[var(--cream)]/40 px-4 py-3 text-xs font-semibold text-[var(--ink)] transition-colors hover:border-[var(--accent)] hover:bg-[var(--rose-soft)]">
                                        <Upload size={14} className="text-[var(--accent)]" />
                                        <span>{newProductFile ? 'Change Picture File' : 'Upload Picture File'}</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    setNewProductFile(file);
                                                    setNewProductFilePreview(URL.createObjectURL(file));
                                                }
                                            }}
                                        />
                                    </label>
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

            {/* MODAL: ASSIGN ROLE CONFIRMATION */}
            {roleConfirmUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in duration-200">
                    <div className="w-full max-w-md overflow-hidden rounded-3xl border border-[var(--border)] bg-white p-7 shadow-2xl">
                        <div className="flex items-start gap-4">
                            <div
                                className={`grid size-12 shrink-0 place-items-center rounded-2xl border border-[var(--border)]/60 shadow-2xs ${
                                    targetRole === 'admin'
                                        ? 'bg-[var(--rose-soft)] text-[var(--accent)]'
                                        : 'bg-amber-50 text-amber-700'
                                }`}
                            >
                                {targetRole === 'admin' ? (
                                    <ShieldCheck size={26} strokeWidth={2} />
                                ) : (
                                    <ShieldAlert size={26} strokeWidth={2} />
                                )}
                            </div>

                            <div className="flex-1">
                                <h3 className="font-serif text-xl font-bold text-[var(--ink)]">
                                    {targetRole === 'admin'
                                        ? 'Assign Admin Role?'
                                        : 'Demote to Customer?'}
                                </h3>
                                <div className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
                                    {targetRole === 'admin' ? (
                                        <>
                                            Are you sure you want to assign the role{' '}
                                            <strong className="text-[var(--ink)]">admin</strong> to user{' '}
                                            <span className="font-semibold text-[var(--accent)]">
                                                "{roleConfirmUser.username || roleConfirmUser.name}"
                                            </span>
                                            ?
                                            <div className="mt-3 rounded-2xl border border-[var(--border)]/70 bg-[var(--cream)]/80 p-3.5 text-xs text-[var(--ink)]">
                                                This user will gain administrative access to edit bouquets, adjust inventory, inspect customer orders, and supervise accounts.
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            Are you sure you want to remove admin privileges from user{' '}
                                            <span className="font-semibold text-[var(--accent)]">
                                                "{roleConfirmUser.username || roleConfirmUser.name}"
                                            </span>{' '}
                                            and return their role to{' '}
                                            <strong className="text-[var(--ink)]">customer</strong>?
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex items-center justify-end gap-3 border-t border-[var(--border)]/70 pt-4">
                            <button
                                type="button"
                                onClick={() => setRoleConfirmUser(null)}
                                className="rounded-xl border border-[var(--border)] px-4 py-2 text-xs font-semibold text-[var(--muted)] hover:bg-[var(--rose-soft)] hover:text-[var(--ink)] transition-colors"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={handleConfirmRoleChange}
                                className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold text-white shadow-xs transition-all active:scale-95 ${
                                    targetRole === 'admin'
                                        ? 'bg-[var(--accent)] hover:bg-[var(--accent-hover)]'
                                        : 'bg-amber-700 hover:bg-amber-800'
                                }`}
                            >
                                <Check size={14} strokeWidth={2.5} />
                                <span>
                                    {targetRole === 'admin'
                                        ? 'Yes, Assign Admin'
                                        : 'Yes, Change to Customer'}
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
