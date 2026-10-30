import { productImage } from '@/types/shop';
export type StoreProduct = {
    id: number;
    name: string;
    description: string;
    price: string | number;
    stock: number;
    color: string | null;
    picture_path: string | null;
    rating: string | number;
    rating_count: string | number;
};
export const normalizeProduct = (product: StoreProduct) => ({
    id: product.id,
    name: product.name,
    thai: product.description,
    price: Number(product.price),
    stock: Number(product.stock),
    color: (product.color ?? '').trim(),
    rating: Number(product.rating ?? 0),
    count: Number(product.rating_count ?? 0),
    picture_path: productImage(
        product.picture_path || '/images/homepage/bouquets.png',
    ),
    position: 'center',
});
