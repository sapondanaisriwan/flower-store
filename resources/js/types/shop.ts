export type CartProduct = {
    id: number;
    name: string;
    description: string;
    price: string;
    stock: number;
    is_deleted: boolean | number;
    picture_path: string;
    quantity: number;
};

export type DeliveryAddress = {
    address_name: string;
    recipient_name: string;
    phone_number: string;
    address_line: string;
    subdistrict: string;
    district: string;
    province: string;
    postal_code: string;
};

export type CustomerOrder = {
    id: number;
    status: string;
    total_price: string;
    created_at: string;
    address: string;
};

export type PurchasedProduct = {
    rating?: number | null;
    product_id: number;
    product_name: string;
    purchase_price: string;
    quantity: number;
    picture_path: string;
};

export const money = (value: number | string) =>
    `฿${Number(value).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const productImage = (path: string) =>
    path.startsWith('/') || /^https?:\/\//.test(path)
        ? path
        : `/storage/${path}`;

export function orderStatus(status: string) {
    const labels: Record<string, string> = {
        pending: 'รอจัดส่ง',
        shipping: 'ระหว่างจัดส่ง',
        delivery: 'ระหว่างจัดส่ง',
        shipped: 'ระหว่างจัดส่ง',
        delivered: 'จัดส่งสำเร็จ',
        success: 'จัดส่งสำเร็จ',
        cancelled: 'ยกเลิกแล้ว',
        canceled: 'ยกเลิกแล้ว',
    };
    return labels[status] ?? status;
}
