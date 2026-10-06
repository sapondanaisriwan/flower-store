<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class WishlistTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_must_log_in_to_view_wishlist(): void
    {
        $this->get('/wishlist')->assertRedirect(route('login'));
    }

    public function test_member_can_view_wishlist(): void
    {
        $this->actingAs(User::factory()->create())->get('/wishlist')
            ->assertOk()->assertInertia(fn (Assert $page) => $page->component('wishlist'));
    }

    public function test_admin_cannot_view_wishlist(): void
    {
        $admin = User::factory()->create();
        $admin->setAttribute('role', 'admin');
        $this->actingAs($admin)->get('/wishlist')->assertForbidden();
    }
}
