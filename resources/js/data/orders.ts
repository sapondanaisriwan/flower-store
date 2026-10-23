export type DemoOrder = {
    id: string;
    date: string;
    status: 'shipping' | 'delivered';
    items: {
        id: number;
        name: string;
        thai: string;
        price: number;
        quantity: number;
        position: string;
    }[];
};
export const demoOrders: DemoOrder[] = [
    {
        id: 'DEMO-260406',
        date: '2026-04-06T04:11:00Z',
        status: 'shipping',
        items: [
            {
                id: 1,
                name: 'Peachy Morning',
                thai: 'ช่อกุหลาบโทนพีช',
                price: 690,
                quantity: 1,
                position: '74% 50%',
            },
            {
                id: 2,
                name: 'Ivory Whisper',
                thai: 'ช่อกุหลาบสีขาวครีม',
                price: 590,
                quantity: 2,
                position: '50% 90%',
            },
        ],
    },
    {
        id: 'DEMO-260402',
        date: '2026-04-02T04:11:00Z',
        status: 'delivered',
        items: [
            {
                id: 3,
                name: 'A Little Romance',
                thai: 'ช่อดอกไม้ชมพูโรแมนติก',
                price: 790,
                quantity: 1,
                position: '70% 20%',
            },
            {
                id: 5,
                name: 'Soft Embrace',
                thai: 'ช่อกุหลาบขาวละมุน',
                price: 490,
                quantity: 1,
                position: '48% 85%',
            },
        ],
    },
];
export const orderTotal = (order: DemoOrder) =>
    order.items.reduce((total, item) => total + item.price * item.quantity, 0);
export const money = (value: number) => '฿' + value.toLocaleString('th-TH');
export const orderDate = (value: string) =>
    new Intl.DateTimeFormat('th-TH', {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZone: 'Asia/Bangkok',
    }).format(new Date(value));
