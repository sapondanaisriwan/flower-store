<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    // เปิดประวัติของตัวเอง พร้อมข้อมูลสำหรับแท็บและการ์ดสินค้า
    public function index(Request $request): Response
    {
        // ใช้ชื่อกลุ่มเดียวกับแท็บหน้าเว็บ และกรองก่อนแบ่งหน้า
        $groups = [
            'pending' => ['pending'],
            'shipping' => ['shipping', 'shipped', 'delivery'],
            'delivered' => ['delivered', 'success'],
            'cancelled' => ['cancelled', 'canceled'],
        ];
        $input = $request->validate(['status' => ['nullable', Rule::in(['all', ...array_keys($groups)])]]);
        $status = $input['status'] ?? 'all';
        $query = DB::table('orders')->where('user_id', $request->user()->id);
        // clone แยกคำค้นก่อนนับแต่ละแท็บ เพื่อไม่ให้เงื่อนไขไปปนกัน
        $counts = ['all' => (clone $query)->count()];
        foreach ($groups as $group => $values) {
            $counts[$group] = (clone $query)->whereIn('status', $values)->count();
        }
        if ($status !== 'all') {
            $query->whereIn('status', $groups[$status]);
        }
        // แบ่งหน้าหลังกรองแล้ว และเก็บ status ไว้ในลิงก์หน้าถัดไป
        $orders = $query->orderByDesc('id')->paginate(10)->withQueryString();
        // โหลดรายการซื้อของออเดอร์ในหน้านี้ทีเดียว เพื่อใช้การ์ดรายการเดิม
        $items = DB::table('order_product')->leftJoin('ratings', function ($join): void {
            $join->on('ratings.order_id', '=', 'order_product.order_id')
                ->on('ratings.product_id', '=', 'order_product.product_id');
        })->whereIn('order_product.order_id', $orders->getCollection()->pluck('id'))
            ->select('order_product.*', 'ratings.rating')->orderBy('product_order')->get()->groupBy('order_id');
        foreach ($orders->getCollection() as $order) {
            $order->items = $items->get($order->id, collect())->values();
        }

        return Inertia::render('orders', [
            'orders' => $orders, 'order' => null, 'items' => [],
            'selectedStatus' => $status, 'statusCounts' => $counts,
        ]);
    }

    // เปิดรายละเอียดเฉพาะออเดอร์ของคนที่ล็อกอิน ไม่พบหรือเป็นของคนอื่นตอบ 404
    public function show(Request $request, int $order): Response
    {
        $record = DB::table('orders')->where('id', $order)->where('user_id', $request->user()->id)->first();
        abort_unless($record !== null, 404);

        // ใช้ข้อมูลตอนซื้อ ไม่อ่านชื่อ/ราคาใหม่จาก products
        return Inertia::render('orders', [
            'orders' => null,
            'order' => $record,
            'items' => DB::table('order_product')->leftJoin('ratings', function ($join): void {
                $join->on('ratings.order_id', '=', 'order_product.order_id')
                    ->on('ratings.product_id', '=', 'order_product.product_id');
            })->where('order_product.order_id', $record->id)->select('order_product.*', 'ratings.rating')
                ->orderBy('product_order')->get(),
            'selectedStatus' => 'all', 'statusCounts' => [],
        ]);
    }
}
