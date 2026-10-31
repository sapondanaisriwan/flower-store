import { productImage } from '@/types/shop';

export type StoreColorObject = {
    name: string;
    hex_code?: string;
};

export type StoreProduct = {
    id: number;
    name: string;
    description: string;
    price: string | number;
    stock: number;
    color: string | null;
    colors?: (StoreColorObject | string)[];
    picture_path: string | null;
    rating: string | number;
    rating_count: string | number;
};

export const normalizeProduct = (product: StoreProduct) => {
    const colorObjects: StoreColorObject[] = Array.isArray(product.colors)
        ? product.colors
              .map((c) =>
                  typeof c === 'string'
                      ? { name: c.trim() }
                      : {
                            name: (c?.name ?? '').trim(),
                            hex_code: c?.hex_code,
                        },
              )
              .filter((c) => c.name !== '')
        : [];

    const fallbackColors = (product.color ?? '')
        .split(',')
        .map((c) => c.trim())
        .filter(Boolean);

    const colors =
        colorObjects.length > 0
            ? colorObjects.map((c) => c.name)
            : fallbackColors;

    return {
        id: product.id,
        name: product.name,
        thai: product.description,
        price: Number(product.price),
        stock: Number(product.stock),
        color: colors[0] ?? (product.color ?? '').trim(),
        colors,
        colorObjects,
        rating: Number(product.rating ?? 0),
        count: Number(product.rating_count ?? 0),
        picture_path: productImage(
            product.picture_path || '/images/homepage/bouquets.png',
        ),
        position: 'center',
    };
};
