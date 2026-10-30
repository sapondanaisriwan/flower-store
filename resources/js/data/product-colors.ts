// Options come only from the products returned by the server.
// Known colors have display swatches; other DB values retain their original label.
export function productColors(products: { color: string | null }[]) {
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
    return [
        ...new Set(
            products
                .map((product) => (product.color ?? '').trim())
                .filter(Boolean),
        ),
    ]
        .sort((a, b) => a.localeCompare(b, 'th'))
        .map((value) => ({
            value,
            label: value,
            hex:
                swatches[value.toLowerCase()] ??
                (/^#[0-9a-f]{3}([0-9a-f]{3})?$/i.test(value)
                    ? value
                    : '#dbc3ca'),
        }));
}
