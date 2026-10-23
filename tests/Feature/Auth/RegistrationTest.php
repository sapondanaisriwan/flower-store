<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Fortify\Features;
use Tests\TestCase;

class RegistrationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->skipUnlessFortifyHas(Features::registration());
    }

    public function test_registration_screen_can_be_rendered()
    {
        $response = $this->get(route('register'));

        $response->assertOk();
    }

    public function test_new_users_can_register()
    {
        $response = $this->post(route('register.store'), [
            'username' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        $this->assertAuthenticated();
        $user = User::where('email', 'test@example.com')->firstOrFail();
        $this->assertSame('Test User', $user->username);
        $this->assertSame('customer', $user->role);
        $this->assertTrue(Hash::check('password', $user->password));
        $response->assertRedirect(route('dashboard', absolute: false));
    }

    public function test_registration_requires_username_instead_of_legacy_name(): void
    {
        $this->post(route('register.store'), [
            'name' => 'Legacy Name', 'email' => 'legacy@example.com',
            'password' => 'password', 'password_confirmation' => 'password',
        ])->assertSessionHasErrors('username');
        $this->assertDatabaseMissing('users', ['email' => 'legacy@example.com']);
    }
}
