<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class CheckoutTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_must_log_in_to_view_checkout(): void
    {
        $this->get('/checkout')->assertRedirect(route('login'));
    }

    public function test_member_can_view_checkout(): void
    {
        $this->actingAs(User::factory()->create())->get('/checkout')
            ->assertOk()->assertInertia(fn (Assert $page) => $page->component('checkout'));
    }

    public function test_admin_cannot_view_checkout(): void
    {
        $admin = User::factory()->create();
        $admin->setAttribute('role', 'admin');
        $this->actingAs($admin)->get('/checkout')->assertForbidden();
    }
}
