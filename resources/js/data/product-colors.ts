// Options come only from the products returned by the server.
// Known colors have display swatches; other DB values retain their original label and custom hex_code.
export function productColors(
    products: {
        color?: string | null;
        colors?: (string | { name: string; hex_code?: string })[];
        colorObjects?: { name: string; hex_code?: string }[];
    }[],
) {
    const swatches: Record<string, string> = {
        pink: '#dca3b2',
        white: '#fff9e9',
        red: '#9a3b50',
        purple: '#a78bbd',
        yellow: '#e6c871',
        green: '#6b8f71',
        blue: '#779fbd',
        orange: '#d99866',
    };

    const customHexMap = new Map<string, string>();
    const rawValues: string[] = [];

    for (const product of products) {
        if (Array.isArray(product.colorObjects)) {
            for (const obj of product.colorObjects) {
                const name = (obj?.name ?? '').trim();
                if (name) {
                    rawValues.push(name);
                    if (obj.hex_code) {
                        customHexMap.set(name.toLowerCase(), obj.hex_code);
                    }
                }
            }
        }
        if (Array.isArray(product.colors)) {
            for (const item of product.colors) {
                if (typeof item === 'string') {
                    const name = item.trim();
                    if (name) rawValues.push(name);
                } else if (item && typeof item === 'object') {
                    const name = (item.name ?? '').trim();
                    if (name) {
                        rawValues.push(name);
                        if (item.hex_code) {
                            customHexMap.set(name.toLowerCase(), item.hex_code);
                        }
                    }
                }
            }
        }
        if (product.color) {
            for (const part of product.color.split(',')) {
                const name = part.trim();
                if (name) rawValues.push(name);
            }
        }
    }

    return [...new Set(rawValues)]
        .sort((a, b) => a.localeCompare(b, 'th'))
        .map((value) => {
            const key = value.toLowerCase();
            return {
                value,
                label: value,
                hex:
                    customHexMap.get(key) ??
                    swatches[key] ??
                    (/^#[0-9a-f]{3}([0-9a-f]{3})?$/i.test(value)
                        ? value
                        : '#dbc3ca'),
            };
        });
}
