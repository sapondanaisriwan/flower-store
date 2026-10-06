<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class OrdersTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_must_log_in(): void
    {
        $this->get('/orders')->assertRedirect(route('login'));
        $this->get('/orders/DEMO-260402')->assertRedirect(route('login'));
    }

    public function test_member_can_view_history_and_demo_detail(): void
    {
        $this->actingAs(User::factory()->create());
        $this->get('/orders')->assertOk()->assertInertia(fn (Assert $page) => $page->component('orders')->missing('orderId'));
        foreach (['DEMO-260406', 'DEMO-260402'] as $id) {
            $this->get('/orders/'.$id)->assertOk()->assertInertia(fn (Assert $page) => $page->component('orders')->where('orderId', $id));
        }
        $this->get('/orders/999')->assertNotFound();
    }

    public function test_admin_cannot_view_customer_orders(): void
    {
        $admin = User::factory()->create();
        $admin->setAttribute('role', 'admin');
        $this->actingAs($admin)->get('/orders')->assertForbidden();
        $this->get('/orders/DEMO-260402')->assertForbidden();
    }
}
