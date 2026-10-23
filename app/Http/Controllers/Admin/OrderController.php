<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    /**
     * ดูทุกออเดอร์ของระบบ พร้อมสถานะ รายการสินค้า และตัวนับสถานะ
     */
    public function index(Request $request): Response
    {
        $statusFilter = $request->query('status', 'all');

        $groups = [
            'pending' => ['pending'],
            'delivery' => ['shipping', 'shipped', 'delivery', 'processing'],
            'success' => ['delivered', 'success'],
            'cancelled' => ['cancelled', 'canceled'],
        ];

        $counts = [
            'all' => DB::table('orders')->count(),
            'pending' => DB::table('orders')->whereIn('status', $groups['pending'])->count(),
            'delivery' => DB::table('orders')->whereIn('status', $groups['delivery'])->count(),
            'success' => DB::table('orders')->whereIn('status', $groups['success'])->count(),
            'cancelled' => DB::table('orders')->whereIn('status', $groups['cancelled'])->count(),
        ];

        $query = DB::table('orders')
            ->leftJoin('users', 'users.id', '=', 'orders.user_id')
            ->select(
                'orders.id',
                'orders.user_id',
                'orders.status',
                'orders.total_price',
                'orders.address_name',
                'orders.address',
                'orders.created_at',
                'orders.updated_at',
                'users.username as customer_name',
                'users.email as customer_email',
                'users.role as customer_role'
            );

        if ($statusFilter !== 'all' && isset($groups[$statusFilter])) {
            $query->whereIn('orders.status', $groups[$statusFilter]);
        }

        $orders = $query->orderByDesc('orders.id')->get();

        // โหลดรายการสินค้าของแต่ละออเดอร์
        $items = DB::table('order_product')
            ->whereIn('order_id', $orders->pluck('id'))
            ->orderBy('product_order')
            ->get()
            ->groupBy('order_id');

        foreach ($orders as $order) {
            $order->items = $items->get($order->id, collect())->values();
            $order->customer_name = $order->customer_name ?: 'Customer';
            $order->delivery = null;
            if (!empty($order->address)) {
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
        $record = DB::table('orders')
            ->leftJoin('users', 'users.id', '=', 'orders.user_id')
            ->where('orders.id', $order)
            ->select(
                'orders.*',
                'users.username as customer_name',
                'users.email as customer_email',
                'users.role as customer_role'
            )
            ->first();

        abort_unless($record !== null, 404);

        $items = DB::table('order_product')
            ->where('order_id', $order)
            ->orderBy('product_order')
            ->get();

        $record->items = $items;
        $record->customer_name = $record->customer_name ?: 'Customer';
        $record->delivery = null;
        if (!empty($record->address)) {
            $decoded = json_decode($record->address, true);
            if (is_array($decoded)) {
                $record->delivery = $decoded;
            }
        }

        return Inertia::render('admin', [
            'initialTab' => 'orders',
            'selectedOrder' => $record,
        ]);
    }

    /**
     * ยอมรับ / ยกเลิก / เปลี่ยนสถานะออเดอร์ (Update Order Status)
     */
    public function updateStatus(Request $request, int $order): RedirectResponse
    {
        $allowed = [
            'pending',
            'processing',
            'shipping',
            'delivery',
            'delivered',
            'success',
            'cancelled',
            'canceled',
        ];

        $validated = $request->validate([
            'status' => ['required', 'string', Rule::in($allowed)],
        ]);

        $newStatus = $validated['status'];

        DB::transaction(function () use ($order, $newStatus): void {
            $record = DB::table('orders')->where('id', $order)->lockForUpdate()->first();
            abort_unless($record !== null, 404);

            $oldStatus = $record->status;
            $wasCancelled = in_array($oldStatus, ['cancelled', 'canceled'], true);
            $nowCancelled = in_array($newStatus, ['cancelled', 'canceled'], true);

            // ถ้ายกเลิกออเดอร์ ให้คืนสต็อกสินค้ากลับเข้าร้าน
            if (! $wasCancelled && $nowCancelled) {
                $items = DB::table('order_product')->where('order_id', $order)->get();
                foreach ($items as $item) {
                    DB::table('products')->where('id', $item->product_id)
                        ->increment('stock', (int) $item->quantity, ['updated_at' => now()]);
                }
            }
            // ถ้าเปลี่ยนจากยกเลิกกลับมาเป็นสถานะปกติ ให้ตัดสต็อกอีกครั้ง
            elseif ($wasCancelled && ! $nowCancelled) {
                $items = DB::table('order_product')->where('order_id', $order)->get();
                foreach ($items as $item) {
                    DB::table('products')->where('id', $item->product_id)
                        ->decrement('stock', (int) $item->quantity, ['updated_at' => now()]);
                }
            }

            DB::table('orders')->where('id', $order)->update([
                'status' => $newStatus,
                'updated_at' => now(),
            ]);
        }, 3);

        Inertia::flash('toast', ['type' => 'success', 'message' => "เปลี่ยนสถานะออเดอร์เป็น {$newStatus} แล้ว"]);

        return back();
    }
}
