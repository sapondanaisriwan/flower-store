<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\Concerns\ShopFixtures;
use Tests\TestCase;

class OrdersTest extends TestCase
{
    use RefreshDatabase, ShopFixtures;

    // ยังไม่ล็อกอินต้องไปหน้า Login
    public function test_guest_must_log_in(): void
    {
        $this->get('/orders')->assertRedirect(route('login'));
        $this->get('/orders/1')->assertRedirect(route('login'));
    }

    // เห็นเฉพาะประวัติตัวเอง เปิดของคนอื่นหรือรหัสที่ไม่มีตอบ 404
    public function test_customer_only_sees_their_own_orders(): void
    {
        $owner = User::factory()->create();
        $other = User::factory()->create();
        $id = $this->order($owner);
        $otherId = $this->order($other);
        $this->actingAs($owner)->get('/orders')->assertInertia(fn (Assert $page) => $page
            ->component('orders')->has('orders.data', 1)->where('orders.data.0.id', $id));
        $this->get('/orders/'.$id)->assertInertia(fn (Assert $page) => $page->where('order.id', $id));
        $this->get('/orders/'.$otherId)->assertNotFound();
        $this->get('/orders/99999')->assertNotFound();
        $this->get('/orders/DEMO-260402')->assertNotFound();
    }

    // Admin และบัญชีแบน เปิดออเดอร์ฝั่งลูกค้าไม่ได้
    public function test_admin_and_banned_user_cannot_view_orders(): void
    {
        $owner = User::factory()->create();
        $id = $this->order($owner);
        foreach ([['role' => 'admin'], ['is_banned' => true]] as $attributes) {
            $this->actingAs(User::factory()->create($attributes))->get('/orders')->assertForbidden();
            $this->get('/orders/'.$id)->assertForbidden();
        }
    }

    // มี 11 ออเดอร์ ต้องแบ่งหน้าแรก 10 และหน้าสอง 1
    public function test_order_history_is_paginated(): void
    {
        $user = User::factory()->create();
        $this->savedAddress($user);
        for ($i = 0; $i < 11; $i++) {
            DB::table('orders')->insert([
                'user_id' => $user->id, 'address_name' => 'บ้าน', 'address' => 'ที่อยู่เดิม',
                'total_price' => '100.00', 'created_at' => now(), 'updated_at' => now(),
            ]);
        }
        $this->actingAs($user)->get('/orders')->assertInertia(fn (Assert $page) => $page
            ->has('orders.data', 10)->where('orders.total', 11)->where('orders.current_page', 1));
        $this->get('/orders?page=2')->assertInertia(fn (Assert $page) => $page->has('orders.data', 1));
    }

    // แท็บนับและกรองทั้งประวัติของตัวเองก่อนแบ่งหน้า ไม่รวมของคนอื่น
    public function test_order_tabs_filter_before_pagination_and_keep_other_accounts_hidden(): void
    {
        $user = User::factory()->create();
        $other = User::factory()->create();
        $this->savedAddress($user);
        $foreign = $this->order($other);
        for ($i = 0; $i < 11; $i++) {
            DB::table('orders')->insert([
                'user_id' => $user->id, 'address_name' => 'บ้าน', 'address' => 'ที่อยู่เดิม',
                'status' => $i === 10 ? 'delivered' : 'pending', 'total_price' => '100.00',
                'created_at' => now(), 'updated_at' => now(),
            ]);
        }
        $this->actingAs($user)->get('/orders?status=delivered')->assertInertia(fn (Assert $page) => $page
            ->has('orders.data', 1)->where('orders.data.0.status', 'delivered')
            ->where('statusCounts.all', 11)->where('statusCounts.pending', 10)->where('statusCounts.delivered', 1)
            ->where('selectedStatus', 'delivered'));
        $this->get('/orders/'.$foreign)->assertNotFound();
        $this->getJson('/orders?status=invalid')->assertUnprocessable();
    }

    // การ์ดได้รับชื่อ/ราคาตอนซื้อและคะแนนจริงจาก DB
    public function test_history_cards_receive_purchased_items_and_real_rating(): void
    {
        $user = User::factory()->create();
        $id = $this->order($user);
        $product = $this->product();
        DB::table('order_product')->insert([
            'order_id' => $id, 'product_id' => $product, 'product_name' => 'ชื่อสินค้าตอนซื้อ',
            'purchase_price' => '99.00', 'picture_path' => 'products/snapshot.jpg', 'quantity' => 2, 'product_order' => 1,
        ]);
        DB::table('ratings')->insert([
            'order_id' => $id, 'product_id' => $product, 'rating' => 4, 'created_at' => now(), 'updated_at' => now(),
        ]);
        $this->actingAs($user)->get('/orders')->assertInertia(fn (Assert $page) => $page
            ->where('orders.data.0.items.0.product_name', 'ชื่อสินค้าตอนซื้อ')
            ->where('orders.data.0.items.0.purchase_price', '99.00')->where('orders.data.0.items.0.rating', 4));
        $this->get('/orders/'.$id)->assertInertia(fn (Assert $page) => $page->where('items.0.rating', 4));
    }
}
