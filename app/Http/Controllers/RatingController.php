<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderProduct;
use App\Support\OrderStatus;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class RatingController extends Controller
{
    public function store(Request $request, int $order, int $product): RedirectResponse
    {
        $data = $request->validate(['rating' => ['required', 'integer', 'between:1,5']]);
        DB::transaction(function () use ($request, $order, $product, $data): void {
            $record = Order::where('user_id', $request->user()->id)->where('id', $order)->lockForUpdate()->firstOrFail();
            abort_unless(OrderProduct::where('order_id', $order)->where('product_id', $product)->exists(), 404);
            if (OrderStatus::normalize($record->status) !== 'delivered') {
                throw ValidationException::withMessages(['rating' => 'ให้คะแนนได้เมื่อจัดส่งสำเร็จเท่านั้น']);
            }
            $query = DB::table('ratings')->where('order_id', $order)->where('product_id', $product);
            if ($query->exists()) {
                $query->update(['rating' => $data['rating'], 'updated_at' => now()]);
            } else {
                DB::table('ratings')->insert(['order_id' => $order, 'product_id' => $product, 'rating' => $data['rating'], 'created_at' => now(), 'updated_at' => now()]);
            }
        }, 3);
        Inertia::flash('toast', ['type' => 'success', 'message' => 'บันทึกคะแนนแล้ว']);

        return back();
    }
}
