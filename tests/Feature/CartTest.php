<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\Concerns\ShopFixtures;
use Tests\TestCase;

class CartTest extends TestCase
{
    use RefreshDatabase, ShopFixtures;

    // ยังไม่ล็อกอินต้องไปหน้า Login
    public function test_guest_must_log_in_to_view_cart(): void
    {
        $this->get('/cart')->assertRedirect(route('login'));
    }

    // ลูกค้าเปิดหน้าตะกร้าได้
    public function test_member_can_view_cart(): void
    {
        $this->actingAs(User::factory()->create())->get('/cart')
            ->assertOk()->assertInertia(fn (Assert $page) => $page->component('cart'));
    }

    // Admin ใช้ตะกร้าลูกค้าไม่ได้
    public function test_admin_cannot_view_cart(): void
    {
        $admin = User::factory()->create();
        $admin->setAttribute('role', 'admin');
        $this->actingAs($admin)->get('/cart')->assertForbidden();
    }

    // เพิ่มสินค้าเดิมต้องรวมจำนวน แก้/ลบได้ และยังไม่ตัดสต็อก
    public function test_customer_can_add_merge_update_and_remove_cart_items(): void
    {
        $user = User::factory()->create();
        $id = $this->product();
        $this->actingAs($user)->from('/cart')->post('/cart', ['product_id' => $id, 'quantity' => 1])->assertRedirect('/cart');
        $this->post('/cart', ['product_id' => $id, 'quantity' => 2])->assertRedirect();
        $this->assertDatabaseCount('cart_product', 1);
        $this->assertDatabaseHas('cart_product', ['cart_user_id' => $user->id, 'quantity' => 3]);
        $this->get('/cart')->assertInertia(fn (Assert $page) => $page->where('items.0.id', $id)->where('items.0.quantity', 3)->where('cartLines.0.quantity', 3));
        $this->patch('/cart/'.$id, ['quantity' => 2])->assertRedirect();
        $this->assertDatabaseHas('cart_product', ['quantity' => 2]);
        $this->delete('/cart/'.$id)->assertRedirect();
        $this->assertDatabaseCount('cart_product', 0);
        $this->assertDatabaseHas('products', ['id' => $id, 'stock' => 5]);
    }

    // จำนวนผิด เกินสต็อก สินค้าหมด หรือปิดขาย ต้องบันทึกไม่ได้
    public function test_cart_rejects_invalid_quantity_and_unavailable_products(): void
    {
        $this->actingAs(User::factory()->create());
        $id = $this->product(['stock' => 2]);
        foreach ([0, -1, 1.5, 3, 1000001] as $quantity) {
            $this->postJson('/cart', ['product_id' => $id, 'quantity' => $quantity])->assertUnprocessable();
        }
        foreach ([$this->product(['stock' => 0]), $this->product(['is_deleted' => true]), 99999] as $invalid) {
            $this->postJson('/cart', ['product_id' => $invalid, 'quantity' => 1])->assertUnprocessable();
        }
        $this->post('/cart', ['product_id' => $id, 'quantity' => 2])->assertRedirect();
        $this->postJson('/cart', ['product_id' => $id, 'quantity' => 1])->assertUnprocessable();
        $this->assertDatabaseHas('cart_product', ['quantity' => 2]);
    }

    // อ่าน แก้ และลบตะกร้าคนอื่นไม่ได้ แม้ส่ง user_id ของเขามา
    public function test_cart_changes_never_touch_other_users_data(): void
    {
        $owner = User::factory()->create();
        $other = User::factory()->create();
        $id = $this->product();
        $this->cartLine($owner, $id, 1);
        $this->actingAs($other)->get('/cart')->assertInertia(fn (Assert $page) => $page->has('items', 0));
        $this->patch('/cart/'.$id, ['quantity' => 2, 'user_id' => $owner->id])->assertNotFound();
        $this->delete('/cart/'.$id)->assertRedirect();
        $this->assertDatabaseHas('cart_product', ['cart_user_id' => $owner->id, 'quantity' => 1]);
        $this->post('/cart', ['product_id' => $id, 'quantity' => 1, 'user_id' => $owner->id])->assertRedirect();
        $this->assertDatabaseCount('cart_product', 2);
    }

    // สินค้าปิดขายยังแสดงให้ลบออกได้ แต่แก้จำนวนไม่ได้
    public function test_deleted_product_stays_visible_until_customer_removes_it(): void
    {
        $user = User::factory()->create();
        $id = $this->product();
        $this->cartLine($user, $id, 1);
        DB::table('products')->where('id', $id)->update(['is_deleted' => true]);
        $this->actingAs($user)->get('/cart')->assertInertia(fn (Assert $page) => $page->has('items', 1));
        $this->patchJson('/cart/'.$id, ['quantity' => 1])->assertUnprocessable();
        $this->delete('/cart/'.$id)->assertRedirect();
        $this->assertDatabaseCount('cart_product', 0);
    }

    // คนไม่ล็อกอิน Admin และบัญชีแบน แก้ตะกร้าไม่ได้
    public function test_guest_admin_and_banned_customer_cannot_change_cart(): void
    {
        $id = $this->product();
        $this->postJson('/cart', ['product_id' => $id, 'quantity' => 1])->assertUnauthorized();
        foreach ([['role' => 'admin'], ['is_banned' => true]] as $attributes) {
            $this->actingAs(User::factory()->create($attributes))->get('/cart')->assertForbidden();
            $this->post('/cart', ['product_id' => $id, 'quantity' => 1])->assertForbidden();
            $this->patch('/cart/'.$id, ['quantity' => 1])->assertForbidden();
            $this->delete('/cart/'.$id)->assertForbidden();
        }
    }
}
