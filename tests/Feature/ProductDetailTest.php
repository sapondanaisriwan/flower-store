<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ProductDetailTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_can_view_a_product(): void
    {
        $this->get('/products/1')->assertOk()->assertInertia(fn (Assert $page) => $page
            ->component('product-detail')->where('productId', 1)->where('auth.user', null));
    }

    public function test_unknown_products_return_not_found(): void
    {
        $this->get('/products/999')->assertNotFound();
        $this->get('/products/abc')->assertNotFound();
    }
}
