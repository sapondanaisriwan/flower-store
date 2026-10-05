<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class CartTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_must_log_in_to_view_cart(): void
    {
        $this->get('/cart')->assertRedirect(route('login'));
    }

    public function test_member_can_view_cart(): void
    {
        $this->actingAs(User::factory()->create())->get('/cart')
            ->assertOk()->assertInertia(fn (Assert $page) => $page->component('cart'));
    }

    public function test_admin_cannot_view_cart(): void
    {
        $admin = User::factory()->create();
        $admin->setAttribute('role', 'admin');
        $this->actingAs($admin)->get('/cart')->assertForbidden();
    }
}
