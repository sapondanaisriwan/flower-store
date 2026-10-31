<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Color;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
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
            ->where('products.is_deleted', false)
            ->orderBy('products.id', 'asc')
            ->get();

        $colors = Product::getDistinctColors();
        $colorCatalog = Product::getColorCatalog();

        return Inertia::render('admin', [
            'initialTab' => 'products',
            'dbProducts' => $products,
            'dbColors' => $colors,
            'dbColorCatalog' => $colorCatalog,
            'navCounts' => [
                'products' => $products->count(),
                'orders' => Order::count(),
                'users' => User::count(),
            ],
        ]);
    }

    /**
     * เปิดหน้าแก้ไขสินค้าชิ้นใดชิ้นหนึ่ง
     */
    public function edit(int $product): Response
    {
        Product::where('id', $product)->where('is_deleted', false)->firstOrFail();

        $products = Product::withRatingStats()
            ->where('products.is_deleted', false)
            ->orderBy('products.id', 'asc')
            ->get();

        $colors = Product::getDistinctColors();
        $colorCatalog = Product::getColorCatalog();

        return Inertia::render('admin', [
            'initialTab' => 'products',
            'initialEditId' => $product,
            'dbProducts' => $products,
            'dbColors' => $colors,
            'dbColorCatalog' => $colorCatalog,
            'navCounts' => [
                'products' => $products->count(),
                'orders' => Order::count(),
                'users' => User::count(),
            ],
        ]);
    }

    /**
     * สร้างสีใหม่ลงตาราง colors
     */
    public function storeColor(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'hex_code' => ['nullable', 'string', 'max:20', 'regex:/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/'],
        ]);

        $name = trim($validated['name']);
        if ($name === '') {
            throw ValidationException::withMessages(['name' => 'กรุณาระบุชื่อสี']);
        }

        $hex = ! empty($validated['hex_code'])
            ? strtolower(trim($validated['hex_code']))
            : Color::defaultHexFor($name);

        Color::updateOrCreate(
            ['name' => $name],
            ['hex_code' => $hex]
        );

        Inertia::flash('toast', ['type' => 'success', 'message' => "สร้างสี \"{$name}\" เข้าระบบเรียบร้อยแล้ว"]);

        return back();
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
            'color' => ['nullable', 'string', 'max:500'],
            'colors' => ['nullable', 'array'],
            'colors.*' => ['string', 'max:100'],
            'description' => ['nullable', 'string', 'max:2000'],
            'picture_path' => ['nullable', 'string', 'max:255'],
            'picture' => ['nullable', 'file', 'image', 'max:10240'],
            'image' => ['nullable', 'file', 'image', 'max:10240'],
        ]);

        $colorList = $this->extractColors($validated['colors'] ?? null, $validated['color'] ?? null);
        if (empty($colorList)) {
            throw ValidationException::withMessages(['color' => 'กรุณาเลือกสีดอกไม้อย่างน้อย 1 สี']);
        }

        $picturePath = '/images/homepage/bouquets.png';

        $file = $request->file('picture') ?? $request->file('image');
        if ($file && $file->isValid()) {
            $storedPath = $file->store('products', 'public');
            $picturePath = '/storage/'.$storedPath;
        } elseif ($request->filled('picture_path')) {
            $picturePath = $request->input('picture_path');
        }

        $product = Product::create([
            'name' => $validated['name'],
            'price' => sprintf('%.2f', (float) $validated['price']),
            'stock' => (int) $validated['stock'],
            'description' => $validated['description'] ?? 'ช่อดอกไม้สดใหม่ บรรจงจัดด้วยความประณีต',
            'picture_path' => $picturePath,
            'is_deleted' => false,
        ]);

        $product->syncColors($colorList);

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
            'color' => ['nullable', 'string', 'max:500'],
            'colors' => ['nullable', 'array'],
            'colors.*' => ['string', 'max:100'],
            'description' => ['nullable', 'string', 'max:2000'],
            'picture_path' => ['nullable', 'string', 'max:255'],
            'picture' => ['nullable', 'file', 'image', 'max:10240'],
            'image' => ['nullable', 'file', 'image', 'max:10240'],
        ]);

        $colorList = $this->extractColors($validated['colors'] ?? null, $validated['color'] ?? null);
        if (empty($colorList)) {
            throw ValidationException::withMessages(['color' => 'กรุณาเลือกสีดอกไม้อย่างน้อย 1 สี']);
        }

        $item = Product::findOrFail($product);

        $picturePath = $item->picture_path;

        $file = $request->file('picture') ?? $request->file('image');
        if ($file && $file->isValid()) {
            if ($item->picture_path && str_starts_with($item->picture_path, '/storage/')) {
                Storage::disk('public')->delete(substr($item->picture_path, strlen('/storage/')));
            }
            $storedPath = $file->store('products', 'public');
            $picturePath = '/storage/'.$storedPath;
        } elseif ($request->filled('picture_path')) {
            $picturePath = $request->input('picture_path');
        }

        $item->update([
            'name' => $validated['name'],
            'price' => sprintf('%.2f', (float) $validated['price']),
            'stock' => (int) $validated['stock'],
            'description' => $validated['description'] ?? '',
            'picture_path' => $picturePath ?: '/images/homepage/bouquets.png',
        ]);

        $item->syncColors($colorList);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'บันทึกการแก้ไขสินค้าเรียบร้อยแล้ว']);

        return back();
    }

    /**
     * แปลงค่าสีจาก array หรือ string คั่นด้วยลูกน้ำให้เป็น list ของชื่อสีที่ไม่ซ้ำ
     *
     * @param  list<string>|null  $colorsArray
     * @return list<string>
     */
    private function extractColors(?array $colorsArray, ?string $colorString): array
    {
        $raw = ! empty($colorsArray)
            ? $colorsArray
            : ($colorString !== null ? explode(',', $colorString) : []);

        return array_values(array_unique(array_filter(
            array_map(fn ($c) => trim((string) $c), $raw),
            fn (string $c) => $c !== ''
        )));
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

        // ลบออกจากตะกร้าและ Wishlist ของลูกค้าเพื่อไม่ให้ค้างหลังถูกลบ
        $item->cartProducts()->delete();
        $item->wishlistProducts()->delete();

        // หากยังไม่เคยถูกสั่งซื้อในออเดอร์ใดเลย สามารถลบออกจากฐานข้อมูลได้จริง
        if (! $item->orderProducts()->exists()) {
            if ($item->picture_path && str_starts_with($item->picture_path, '/storage/')) {
                Storage::disk('public')->delete(substr($item->picture_path, strlen('/storage/')));
            }
            $item->colorProducts()->delete();
            $item->delete();
        } else {
            // หากมีประวัติในคำสั่งซื้อแล้ว ให้ใช้ is_deleted = true เพื่อไม่ให้ประวัติออเดอร์พัง
            $item->update([
                'is_deleted' => true,
            ]);
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => 'ลบสินค้าเรียบร้อยแล้ว']);

        return back();
    }
}
