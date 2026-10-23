<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    /**
     * แสดงรายการสินค้าทั้งหมดในระบบ จัดการสต็อก และตัวกรอง
     */
    public function index(Request $request): Response
    {
        $ratings = DB::table('ratings')
            ->selectRaw('product_id, AVG(rating) as average_rating, COUNT(*) as rating_count')
            ->groupBy('product_id');

        $products = DB::table('products')
            ->leftJoinSub($ratings, 'scores', 'scores.product_id', '=', 'products.id')
            ->select(
                'products.id',
                'products.name',
                'products.description',
                'products.price',
                'products.stock',
                'products.color',
                'products.picture_path',
                'products.is_deleted',
                'products.created_at',
                'products.updated_at',
                DB::raw('COALESCE(scores.average_rating, 5.0) as rating'),
                DB::raw('COALESCE(scores.rating_count, 0) as rating_count')
            )
            ->orderBy('products.is_deleted', 'asc')
            ->orderBy('products.id', 'asc')
            ->get();

        $colors = DB::table('products')
            ->whereNotNull('color')
            ->where('color', '<>', '')
            ->distinct()
            ->pluck('color')
            ->values();

        return Inertia::render('admin', [
            'initialTab' => 'products',
            'dbProducts' => $products,
            'dbColors' => $colors,
        ]);
    }

    /**
     * เปิดหน้าแก้ไขสินค้าชิ้นใดชิ้นหนึ่ง
     */
    public function edit(int $product): Response
    {
        $item = DB::table('products')->where('id', $product)->first();
        abort_unless($item !== null, 404);

        $ratings = DB::table('ratings')
            ->selectRaw('product_id, AVG(rating) as average_rating, COUNT(*) as rating_count')
            ->groupBy('product_id');

        $products = DB::table('products')
            ->leftJoinSub($ratings, 'scores', 'scores.product_id', '=', 'products.id')
            ->select(
                'products.*',
                DB::raw('COALESCE(scores.average_rating, 5.0) as rating'),
                DB::raw('COALESCE(scores.rating_count, 0) as rating_count')
            )
            ->orderBy('products.id', 'asc')
            ->get();

        $colors = DB::table('products')
            ->whereNotNull('color')
            ->where('color', '<>', '')
            ->distinct()
            ->pluck('color')
            ->values();

        return Inertia::render('admin', [
            'initialTab' => 'products',
            'initialEditId' => $product,
            'dbProducts' => $products,
            'dbColors' => $colors,
        ]);
    }

    /**
     * เพิ่มสินค้าใหม่เข้าร้าน
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'price' => ['required', 'numeric', 'min:0', 'max:9999999.99'],
            'stock' => ['required', 'integer', 'min:0', 'max:1000000'],
            'color' => ['nullable', 'string', 'max:100'],
            'description' => ['nullable', 'string', 'max:2000'],
            'picture_path' => ['nullable', 'string', 'max:255'],
            'picture' => ['nullable', 'file', 'image', 'max:10240'],
            'image' => ['nullable', 'file', 'image', 'max:10240'],
        ]);

        $picturePath = '/images/homepage/bouquets.png';

        $file = $request->file('picture') ?? $request->file('image');
        if ($file && $file->isValid()) {
            $destDir = public_path('images/homepage');
            if (! file_exists($destDir)) {
                mkdir($destDir, 0755, true);
            }
            $filename = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
            $file->move($destDir, $filename);
            $picturePath = '/images/homepage/' . $filename;
        } elseif ($request->filled('picture_path')) {
            $picturePath = $request->input('picture_path');
        }

        DB::table('products')->insert([
            'name' => $validated['name'],
            'price' => sprintf('%.2f', (float) $validated['price']),
            'stock' => (int) $validated['stock'],
            'color' => $validated['color'] ? trim($validated['color']) : null,
            'description' => $validated['description'] ?? 'ช่อดอกไม้สดใหม่ บรรจงจัดด้วยความประณีต',
            'picture_path' => $picturePath,
            'is_deleted' => false,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'เพิ่มสินค้าใหม่เรียบร้อยแล้ว']);

        return back();
    }

    /**
     * แก้ไขรายละเอียดสินค้า
     */
    public function update(Request $request, int $product): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'price' => ['required', 'numeric', 'min:0', 'max:9999999.99'],
            'stock' => ['required', 'integer', 'min:0', 'max:1000000'],
            'color' => ['nullable', 'string', 'max:100'],
            'description' => ['nullable', 'string', 'max:2000'],
            'picture_path' => ['nullable', 'string', 'max:255'],
            'picture' => ['nullable', 'file', 'image', 'max:10240'],
            'image' => ['nullable', 'file', 'image', 'max:10240'],
        ]);

        $item = DB::table('products')->where('id', $product)->first();
        abort_unless($item !== null, 404);

        $picturePath = $item->picture_path;

        $file = $request->file('picture') ?? $request->file('image');
        if ($file && $file->isValid()) {
            $destDir = public_path('images/homepage');
            if (! file_exists($destDir)) {
                mkdir($destDir, 0755, true);
            }
            $filename = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
            $file->move($destDir, $filename);
            $picturePath = '/images/homepage/' . $filename;
        } elseif ($request->filled('picture_path')) {
            $picturePath = $request->input('picture_path');
        }

        DB::table('products')->where('id', $product)->update([
            'name' => $validated['name'],
            'price' => sprintf('%.2f', (float) $validated['price']),
            'stock' => (int) $validated['stock'],
            'color' => $validated['color'] ? trim($validated['color']) : null,
            'description' => $validated['description'] ?? '',
            'picture_path' => $picturePath ?: '/images/homepage/bouquets.png',
            'updated_at' => now(),
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'บันทึกการแก้ไขสินค้าเรียบร้อยแล้ว']);

        return back();
    }

    /**
     * ปิดขายสินค้า / เปิดขายสินค้า (Toggle is_deleted)
     */
    public function toggleSell(int $product): RedirectResponse
    {
        $item = DB::table('products')->where('id', $product)->first();
        abort_unless($item !== null, 404);

        $newDeleted = ! (bool) $item->is_deleted;

        DB::table('products')->where('id', $product)->update([
            'is_deleted' => $newDeleted,
            'updated_at' => now(),
        ]);

        $statusText = $newDeleted ? 'ปิดการขายสินค้าแล้ว' : 'เปิดการขายสินค้าแล้ว';
        Inertia::flash('toast', ['type' => 'success', 'message' => $statusText]);

        return back();
    }

    /**
     * จัดการสต็อกสินค้าโดยตรง
     */
    public function updateStock(Request $request, int $product): RedirectResponse
    {
        $validated = $request->validate([
            'stock' => ['required', 'integer', 'min:0', 'max:1000000'],
        ]);

        $updated = DB::table('products')->where('id', $product)->update([
            'stock' => (int) $validated['stock'],
            'updated_at' => now(),
        ]);

        abort_unless($updated > 0 || DB::table('products')->where('id', $product)->exists(), 404);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'ปรับปรุงสต็อกสินค้าเรียบร้อยแล้ว']);

        return back();
    }

    /**
     * ลบสินค้าออกจากร้าน
     */
    public function destroy(int $product): RedirectResponse
    {
        $deleted = DB::table('products')->where('id', $product)->update([
            'is_deleted' => true,
            'updated_at' => now(),
        ]);

        abort_unless($deleted > 0, 404);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'ลบสินค้าเรียบร้อยแล้ว']);

        return back();
    }
}
