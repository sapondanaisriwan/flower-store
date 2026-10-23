<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class UserAddressTest extends TestCase
{
    use RefreshDatabase;

    /** @return array<string, string> */
    private function address(string $name = 'บ้าน'): array
    {
        return [
            'address_name' => $name, 'recipient_name' => 'Green',
            'address_line' => '123', 'subdistrict' => 'บางรัก', 'district' => 'บางรัก',
            'province' => 'กรุงเทพมหานคร', 'postal_code' => '10500', 'phone_number' => '0812345678',
        ];
    }

    // เพิ่ม แก้ชื่อ และปิดที่อยู่ โดยยังเก็บแถวเดิมไว้
    public function test_customer_can_manage_their_address(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user)->postJson('/addresses', $this->address())->assertCreated();
        $this->getJson('/addresses')->assertJsonCount(1, 'addresses');
        $this->patchJson('/addresses/'.rawurlencode('บ้าน'), $this->address('ที่ทำงาน'))->assertOk();
        $this->deleteJson('/addresses/'.rawurlencode('ที่ทำงาน'))->assertOk();
        $this->getJson('/addresses')->assertJsonCount(0, 'addresses');
        $this->assertDatabaseHas('user_addresses', ['user_id' => $user->id, 'address_name' => 'ที่ทำงาน', 'is_active' => false]);
    }

    public function test_customer_cannot_manage_another_users_address(): void
    {
        $owner = User::factory()->create();
        $other = User::factory()->create();
        $this->actingAs($owner)->postJson('/addresses', $this->address())->assertCreated();
        $this->actingAs($other)->getJson('/addresses')->assertJsonCount(0, 'addresses');
        $this->patchJson('/addresses/'.rawurlencode('บ้าน'), $this->address())->assertNotFound();
        $this->deleteJson('/addresses/'.rawurlencode('บ้าน'))->assertNotFound();
        $this->postJson('/addresses', [...$this->address(), 'user_id' => $owner->id])->assertCreated();
        $this->assertDatabaseCount('user_addresses', 2);
    }

    public function test_invalid_fields_and_duplicate_names_are_rejected(): void
    {
        $this->actingAs(User::factory()->create());
        $this->postJson('/addresses', $this->address())->assertCreated();
        $this->postJson('/addresses', $this->address())->assertUnprocessable()->assertJsonValidationErrors('address_name');
        $this->postJson('/addresses', [...$this->address('ใหม่'), 'phone_number' => 'abc', 'postal_code' => '123', 'recipient_name' => ''])
            ->assertUnprocessable()->assertJsonValidationErrors(['phone_number', 'postal_code', 'recipient_name']);
        $this->postJson('/addresses', $this->address('ที่ทำงาน'))->assertCreated();
        $this->patchJson('/addresses/'.rawurlencode('บ้าน'), $this->address('ที่ทำงาน'))
            ->assertUnprocessable()->assertJsonValidationErrors('address_name');
    }

    public function test_renaming_address_keeps_order_reference_and_snapshot(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user)->postJson('/addresses', $this->address())->assertCreated();
        DB::table('orders')->insert([
            'user_id' => $user->id, 'address_name' => 'บ้าน', 'address' => 'ข้อมูลจัดส่งเดิม',
            'total_price' => 100, 'created_at' => now(), 'updated_at' => now(),
        ]);
        $this->patchJson('/addresses/'.rawurlencode('บ้าน'), $this->address('ใหม่'))->assertOk();
        $this->assertDatabaseHas('orders', ['address_name' => 'ใหม่', 'address' => 'ข้อมูลจัดส่งเดิม']);
        $this->deleteJson('/addresses/'.rawurlencode('ใหม่'))->assertOk();
        $this->assertDatabaseCount('orders', 1);
    }

    public function test_guest_admin_and_banned_customer_cannot_use_addresses(): void
    {
        $this->getJson('/addresses')->assertUnauthorized();
        $this->postJson('/addresses', $this->address())->assertUnauthorized();
        foreach ([['role' => 'admin'], ['is_banned' => true]] as $attributes) {
            $user = User::factory()->create($attributes);
            $this->actingAs($user)->getJson('/addresses')->assertForbidden();
            $this->postJson('/addresses', $this->address())->assertForbidden();
            $this->patchJson('/addresses/home', $this->address())->assertForbidden();
            $this->deleteJson('/addresses/home')->assertForbidden();
        }
        $this->assertDatabaseCount('user_addresses', 0);
    }
}
