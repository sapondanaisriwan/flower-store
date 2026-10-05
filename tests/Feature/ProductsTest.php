<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ProductsTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_can_view_products_with_a_search_query(): void
    {
        $this->get('/products?q=rose')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('products')
                ->where('auth.user', null));
    }
}
