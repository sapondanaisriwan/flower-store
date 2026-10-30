<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    /**
     * แสดงรายการสินค้าทั้งหมดในระบบ จัดการสต็อก และตัวกรอง
     */
    public function index(Request $request): Response
    {
        $products = Product::withRatingStats()
            ->orderBy('products.is_deleted', 'asc')
            ->orderBy('products.id', 'asc')
            ->get();

        $colors = Product::getDistinctColors();

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
        Product::findOrFail($product);

        $products = Product::withRatingStats()
            ->orderBy('products.id', 'asc')
            ->get();

        $colors = Product::getDistinctColors();

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
            'color' => ['required', 'string', 'max:100'],
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
            $filename = time().'_'.uniqid().'.'.$file->extension();
            $file->move($destDir, $filename);
            $picturePath = '/images/homepage/'.$filename;
        } elseif ($request->filled('picture_path')) {
            $picturePath = $request->input('picture_path');
        }

        Product::create([
            'name' => $validated['name'],
            'price' => sprintf('%.2f', (float) $validated['price']),
            'stock' => (int) $validated['stock'],
            'color' => trim($validated['color']),
            'description' => $validated['description'] ?? 'ช่อดอกไม้สดใหม่ บรรจงจัดด้วยความประณีต',
            'picture_path' => $picturePath,
            'is_deleted' => false,
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
            'color' => ['required', 'string', 'max:100'],
            'description' => ['nullable', 'string', 'max:2000'],
            'picture_path' => ['nullable', 'string', 'max:255'],
            'picture' => ['nullable', 'file', 'image', 'max:10240'],
            'image' => ['nullable', 'file', 'image', 'max:10240'],
        ]);

        $item = Product::findOrFail($product);

        $picturePath = $item->picture_path;

        $file = $request->file('picture') ?? $request->file('image');
        if ($file && $file->isValid()) {
            $destDir = public_path('images/homepage');
            if (! file_exists($destDir)) {
                mkdir($destDir, 0755, true);
            }
            $filename = time().'_'.uniqid().'.'.$file->extension();
            $file->move($destDir, $filename);
            $picturePath = '/images/homepage/'.$filename;
        } elseif ($request->filled('picture_path')) {
            $picturePath = $request->input('picture_path');
        }

        $item->update([
            'name' => $validated['name'],
            'price' => sprintf('%.2f', (float) $validated['price']),
            'stock' => (int) $validated['stock'],
            'color' => trim($validated['color']),
            'description' => $validated['description'] ?? '',
            'picture_path' => $picturePath ?: '/images/homepage/bouquets.png',
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'บันทึกการแก้ไขสินค้าเรียบร้อยแล้ว']);

        return back();
    }

    /**
     * ปิดขายสินค้า / เปิดขายสินค้า (Toggle is_deleted)
     */
    public function toggleSell(int $product): RedirectResponse
    {
        $item = Product::findOrFail($product);

        $newDeleted = ! $item->is_deleted;
        $item->update([
            'is_deleted' => $newDeleted,
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

        $item = Product::findOrFail($product);
        $item->update([
            'stock' => (int) $validated['stock'],
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'ปรับปรุงสต็อกสินค้าเรียบร้อยแล้ว']);

        return back();
    }

    /**
     * ลบสินค้าออกจากร้าน
     */
    public function destroy(int $product): RedirectResponse
    {
        $item = Product::findOrFail($product);
        $item->update([
            'is_deleted' => true,
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'ลบสินค้าเรียบร้อยแล้ว']);

        return back();
    }
}
