<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\Concerns\ShopFixtures;
use Tests\TestCase;

class CheckoutTest extends TestCase
{
    use RefreshDatabase, ShopFixtures;

    // ยังไม่ล็อกอินเปิด Checkout ไม่ได้
    public function test_guest_must_log_in_to_view_checkout(): void
    {
        $this->get('/checkout')->assertRedirect(route('login'));
    }

    // ลูกค้าเปิด Checkout ได้ แม้ยังไม่มีสินค้า
    public function test_member_can_view_checkout(): void
    {
        $this->actingAs(User::factory()->create())->get('/checkout')
            ->assertOk()->assertInertia(fn (Assert $page) => $page->component('checkout'));
    }

    // Admin เปิด Checkout ของลูกค้าไม่ได้
    public function test_admin_cannot_view_checkout(): void
    {
        $admin = User::factory()->create();
        $admin->setAttribute('role', 'admin');
        $this->actingAs($admin)->get('/checkout')->assertForbidden();
    }

    // ใช้ราคาจริง เก็บข้อมูลตอนซื้อ ตัดสต็อก และล้างแค่ตะกร้าของตัวเอง
    public function test_checkout_uses_database_prices_and_saves_snapshots_and_clears_cart(): void
    {
        $user = User::factory()->create();
        $other = User::factory()->create();
        $id = $this->product();
        $this->cartLine($user, $id, 2);
        $this->cartLine($other, $id, 1);
        $response = $this->actingAs($user)->post('/checkout', [...$this->delivery(), 'total_price' => 1, 'user_id' => $other->id, 'status' => 'delivered']);
        $order = DB::table('orders')->sole();
        $response->assertSessionHasNoErrors()->assertRedirect('/orders/'.$order->id);
        $this->assertSame($user->id, $order->user_id);
        $this->assertSame('1180.50', $order->total_price);
        $this->assertSame('pending', $order->status);
        $this->assertSame('Green', json_decode($order->address, true)['recipient_name']);
        $this->assertDatabaseHas('order_product', ['order_id' => $order->id, 'product_name' => 'ช่อชมพู', 'purchase_price' => '590.25', 'quantity' => 2, 'product_order' => 1]);
        $this->assertDatabaseHas('products', ['id' => $id, 'stock' => 3]);
        $this->assertDatabaseMissing('cart_product', ['cart_user_id' => $user->id]);
        $this->assertDatabaseHas('cart_product', ['cart_user_id' => $other->id]);
        DB::table('products')->where('id', $id)->update(['name' => 'ชื่อใหม่', 'price' => 999]);
        DB::table('user_addresses')->where('user_id', $user->id)->update(['recipient_name' => 'ชื่อผู้รับใหม่']);
        $this->get('/orders/'.$order->id)->assertInertia(fn (Assert $page) => $page->where('items.0.product_name', 'ช่อชมพู')->where('items.0.purchase_price', '590.25')->where('order.address', $order->address));
    }

    // เลือกที่อยู่เดิมได้ ส่งตะกร้าเดิมซ้ำหลังสำเร็จต้องไม่เกิดออเดอร์เพิ่ม
    public function test_checkout_can_use_existing_address_and_cannot_submit_same_cart_twice(): void
    {
        $user = User::factory()->create();
        $this->savedAddress($user);
        $id = $this->product();
        $this->cartLine($user, $id, 1);
        $input = ['use_saved_address' => true, 'address_name' => 'บ้าน'];
        $this->actingAs($user)->post('/checkout', $input)->assertSessionHasNoErrors()->assertRedirect();
        $this->postJson('/checkout', $input)->assertUnprocessable()->assertJsonValidationErrors('cart');
        $this->assertDatabaseCount('orders', 1);
        $this->assertDatabaseCount('user_addresses', 1);
        $this->assertDatabaseHas('products', ['id' => $id, 'stock' => 4]);
    }

    // ตะกร้าว่าง ที่อยู่ผิด ของคนอื่น หรือปิดใช้งาน ต้องสั่งซื้อไม่ได้
    public function test_checkout_rejects_empty_cart_invalid_delivery_and_foreign_or_inactive_address(): void
    {
        $user = User::factory()->create();
        $other = User::factory()->create();
        $this->savedAddress($other);
        $this->actingAs($user)->postJson('/checkout', $this->delivery())->assertUnprocessable()->assertJsonValidationErrors('cart');
        $this->cartLine($user, $this->product(), 1);
        $this->postJson('/checkout', [])->assertUnprocessable();
        $this->postJson('/checkout', ['use_saved_address' => true, 'address_name' => 'บ้าน'])->assertUnprocessable()->assertJsonValidationErrors('address_name');
        $this->savedAddress($user, false);
        $this->postJson('/checkout', ['use_saved_address' => true, 'address_name' => 'บ้าน'])->assertUnprocessable();
        $this->postJson('/checkout', [...$this->delivery(), 'phone_number' => 'abc'])->assertUnprocessable();
        $this->assertDatabaseCount('orders', 0);
    }

    // สต็อกไม่พอแม้รายการเดียว ต้องไม่ตัดสินค้าอื่นหรือสร้างออเดอร์/ที่อยู่ค้าง
    public function test_stock_failure_leaves_all_products_cart_and_addresses_unchanged(): void
    {
        $user = User::factory()->create();
        $available = $this->product();
        $short = $this->product(['stock' => 1]);
        $this->cartLine($user, $available, 1);
        $this->cartLine($user, $short, 2);
        $this->actingAs($user)->postJson('/checkout', $this->delivery())->assertUnprocessable()->assertJsonValidationErrors('cart');
        $this->assertDatabaseHas('products', ['id' => $available, 'stock' => 5]);
        $this->assertDatabaseHas('products', ['id' => $short, 'stock' => 1]);
        $this->assertDatabaseCount('cart_product', 2);
        $this->assertDatabaseCount('orders', 0);
        $this->assertDatabaseCount('order_product', 0);
        $this->assertDatabaseCount('user_addresses', 0);
        DB::table('products')->where('id', $short)->update(['stock' => 5, 'is_deleted' => true]);
        $this->postJson('/checkout', $this->delivery())->assertUnprocessable();
        $this->assertDatabaseCount('orders', 0);
    }

    // เมื่อลูกค้าคนแรกซื้อชิ้นสุดท้ายแล้ว คนถัดไปต้องซื้อไม่ได้
    public function test_second_customer_cannot_buy_stock_already_sold(): void
    {
        $first = User::factory()->create();
        $second = User::factory()->create();
        $id = $this->product(['stock' => 1]);
        $this->cartLine($first, $id, 1);
        $this->cartLine($second, $id, 1);
        $this->actingAs($first)->post('/checkout', $this->delivery())->assertRedirect();
        $this->actingAs($second)->postJson('/checkout', $this->delivery())->assertUnprocessable();
        $this->assertDatabaseHas('products', ['id' => $id, 'stock' => 0]);
        $this->assertDatabaseCount('orders', 1);
        $this->assertDatabaseHas('cart_product', ['cart_user_id' => $second->id]);
    }

    // คนไม่ล็อกอิน Admin และบัญชีแบน สร้างออเดอร์ไม่ได้
    public function test_guest_admin_and_banned_customer_cannot_checkout(): void
    {
        $this->postJson('/checkout', $this->delivery())->assertUnauthorized();
        foreach ([['role' => 'admin'], ['is_banned' => true]] as $attributes) {
            $this->actingAs(User::factory()->create($attributes))->get('/checkout')->assertForbidden();
            $this->post('/checkout', $this->delivery())->assertForbidden();
        }
        $this->assertDatabaseCount('orders', 0);
    }
}
