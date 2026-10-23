<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
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

    private function product(bool $deleted = false): int
    {
        return DB::table('products')->insertGetId([
            'name' => 'ช่อทดสอบ', 'price' => 590, 'stock' => 0, 'color' => 'pink',
            'description' => 'ดอกไม้', 'picture_path' => 'products/test.jpg', 'is_deleted' => $deleted,
            'created_at' => now(), 'updated_at' => now(),
        ]);
    }

    // เพิ่มซ้ำต้องไม่เกิดแถวซ้ำ และลบได้เฉพาะรายการของตัวเอง
    public function test_wishlist_is_saved_once_and_separated_by_user(): void
    {
        $owner = User::factory()->create();
        $other = User::factory()->create();
        $id = $this->product();
        $this->actingAs($owner)->from('/wishlist')->post('/wishlist', ['product_id' => $id])->assertRedirect('/wishlist');
        $this->post('/wishlist', ['product_id' => $id])->assertRedirect();
        $this->assertDatabaseCount('wishlist_product', 1);
        $this->get('/wishlist')->assertInertia(fn (Assert $page) => $page
            ->has('items', 1)->where('items.0.id', $id)->where('wishlistIds.0', $id));

        $this->actingAs($other)->get('/wishlist')->assertInertia(fn (Assert $page) => $page->has('items', 0)->has('wishlistIds', 0));
        $this->delete('/wishlist/'.$id)->assertRedirect();
        $this->assertDatabaseCount('wishlist_product', 1);
        $this->actingAs($owner)->delete('/wishlist/'.$id)->assertRedirect();
        $this->assertDatabaseCount('wishlist_product', 0);
    }

    public function test_missing_or_deleted_products_cannot_be_added(): void
    {
        $this->actingAs(User::factory()->create());
        $deleted = $this->product(true);
        foreach ([[], ['product_id' => 99999], ['product_id' => $deleted]] as $input) {
            $this->postJson('/wishlist', $input)->assertUnprocessable()->assertJsonValidationErrors('product_id');
        }
        $this->assertDatabaseCount('wishlist_product', 0);
    }

    public function test_deleted_products_are_hidden_but_can_be_removed(): void
    {
        $id = $this->product();
        $this->actingAs(User::factory()->create())->post('/wishlist', ['product_id' => $id])->assertRedirect();
        DB::table('products')->where('id', $id)->update(['is_deleted' => true]);
        $this->get('/wishlist')->assertInertia(fn (Assert $page) => $page->has('items', 0)->has('wishlistIds', 0));
        $this->delete('/wishlist/'.$id)->assertRedirect();
        $this->assertDatabaseCount('wishlist_product', 0);
    }

    public function test_guest_admin_and_banned_customer_cannot_change_wishlist(): void
    {
        $id = $this->product();
        $this->postJson('/wishlist', ['product_id' => $id])->assertUnauthorized();
        $this->deleteJson('/wishlist/'.$id)->assertUnauthorized();
        foreach ([['role' => 'admin'], ['is_banned' => true]] as $attributes) {
            $this->actingAs(User::factory()->create($attributes))->get('/wishlist')->assertForbidden();
            $this->post('/wishlist', ['product_id' => $id])->assertForbidden();
            $this->delete('/wishlist/'.$id)->assertForbidden();
        }
        $this->assertDatabaseCount('wishlist_product', 0);
    }
}
