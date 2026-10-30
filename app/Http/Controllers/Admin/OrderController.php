<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderProduct;
use App\Models\Product;
use App\Support\OrderStatus;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    /**
     * ดูทุกออเดอร์ของระบบ พร้อมสถานะ รายการสินค้า และตัวนับสถานะ
     */
    public function index(Request $request): Response
    {
        $filter = $request->validate(['status' => ['nullable', Rule::in(['all', 'pending', 'delivery', 'success', 'cancelled'])]]);
        $statusFilter = $filter['status'] ?? 'all';

        $groups = [
            'pending' => ['pending'],
            'delivery' => OrderStatus::GROUPS['shipping'],
            'success' => ['delivered', 'success'],
            'cancelled' => ['cancelled', 'canceled'],
        ];

        $counts = Order::getStatusCounts($groups);

        $query = Order::withCustomer();

        if ($statusFilter !== 'all' && isset($groups[$statusFilter])) {
            $query->whereIn('orders.status', $groups[$statusFilter]);
        }

        $orders = $query->orderByDesc('orders.id')->get();

        // โหลดรายการสินค้าของแต่ละออเดอร์ผ่าน Model
        $items = OrderProduct::whereIn('order_id', $orders->pluck('id'))
            ->orderBy('product_order')
            ->get()
            ->groupBy('order_id');

        foreach ($orders as $order) {
            $order->items = $items->get($order->id, collect())->values();
            $order->customer_name = $order->customer_name ?: 'Customer';
            $order->delivery = null;
            if (! empty($order->address)) {
                $decoded = json_decode($order->address, true);
                if (is_array($decoded)) {
                    $order->delivery = $decoded;
                }
            }
        }

        return Inertia::render('admin', [
            'initialTab' => 'orders',
            'dbOrders' => $orders,
            'statusCounts' => $counts,
            'selectedOrderStatus' => $statusFilter,
        ]);
    }

    /**
     * ดูรายละเอียดออเดอร์เดียว
     */
    public function show(int $order): Response
    {
        $record = Order::withCustomer()
            ->where('orders.id', $order)
            ->firstOrFail();

        $items = OrderProduct::where('order_id', $order)
            ->orderBy('product_order')
            ->get();

        $record->items = $items;
        $record->customer_name = $record->customer_name ?: 'Customer';
        $record->delivery = null;
        if (! empty($record->address)) {
            $decoded = json_decode($record->address, true);
            if (is_array($decoded)) {
                $record->delivery = $decoded;
            }
        }

        return Inertia::render('admin', [
            'initialTab' => 'orders',
            'selectedOrder' => $record,
            'dbOrders' => [$record],
        ]);
    }

    /**
     * ยอมรับ / ยกเลิก / เปลี่ยนสถานะออเดอร์ (Update Order Status)
     */
    public function updateStatus(Request $request, int $order): RedirectResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'string', Rule::in(array_merge(...array_values(OrderStatus::GROUPS)))],
        ]);
        $newStatus = OrderStatus::normalize($validated['status']);
        DB::transaction(function () use ($order, $newStatus): void {
            $record = Order::lockForUpdate()->findOrFail($order);
            $oldStatus = OrderStatus::normalize($record->status);
            if ($oldStatus === $newStatus) {
                return;
            }
            $transitions = [
                'pending' => ['shipping', 'cancelled'],
                'shipping' => ['delivered', 'cancelled'],
                'delivered' => [],
                'cancelled' => [],
            ];
            if (! in_array($newStatus, $transitions[$oldStatus] ?? [], true)) {
                throw ValidationException::withMessages(['status' => 'ไม่สามารถเปลี่ยนสถานะนี้ได้ ออเดอร์ที่สำเร็จหรือยกเลิกแล้วไม่สามารถเปิดใหม่']);
            }
            if ($newStatus === 'cancelled') {
                $items = OrderProduct::where('order_id', $order)->orderBy('product_id')->get();
                foreach ($items as $item) {
                    $product = Product::where('id', $item->product_id)->lockForUpdate()->firstOrFail();
                    if ($product->stock + $item->quantity > 1000000) {
                        throw ValidationException::withMessages(['status' => 'คืนสต็อกไม่ได้ เพราะจำนวนจะเกินขีดจำกัด กรุณาตรวจสอบสต็อก']);
                    }
                    $product->increment('stock', $item->quantity);
                }
            }
            $record->update(['status' => $newStatus]);
        }, 3);

        Inertia::flash('toast', ['type' => 'success', 'message' => "เปลี่ยนสถานะออเดอร์เป็น {$newStatus} แล้ว"]);

        return back();
    }
}
