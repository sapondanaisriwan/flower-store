<?php

namespace Tests\Feature\Settings;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProfileUpdateTest extends TestCase
{
    // ใช้ฐานข้อมูลทดสอบ และคืนข้อมูลหลังจบแต่ละการทดสอบ
    use RefreshDatabase;

    // ยังไม่ล็อกอิน ต้องถูกส่งไปหน้า Login
    public function test_guest_cannot_view_or_update_profile(): void
    {
        $this->get(route('profile.edit'))->assertRedirect(route('login'));
        $this->patch(route('profile.update'), ['username' => 'Guest', 'email' => 'guest@example.com'])->assertRedirect(route('login'));
    }

    // ใช้อีเมลของคนอื่นไม่ได้ และข้อมูลเดิมต้องไม่เปลี่ยน
    public function test_duplicate_email_does_not_change_profile(): void
    {
        $user = User::factory()->create();
        $other = User::factory()->create();
        $originalName = $user->username;
        $originalEmail = $user->email;
        $this->actingAs($user)->patch(route('profile.update'), [
            'username' => 'Changed Name',
            'email' => $other->email,
        ])->assertSessionHasErrors('email');
        $this->assertSame($originalName, $user->fresh()->username);
        $this->assertSame($originalEmail, $user->fresh()->email);
    }

    // คนที่ล็อกอินแล้วเปิดหน้าโปรไฟล์ได้
    public function test_profile_page_is_displayed()
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->get(route('profile.edit'));

        $response->assertOk();
    }

    // แก้ข้อมูลสำเร็จ username ถูกบันทึก และอีเมลใหม่ยังไม่ถือว่ายืนยันแล้ว
    public function test_profile_information_can_be_updated()
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->patch(route('profile.update'), [
                'username' => 'Test User',
                'email' => 'test@example.com',
            ]);

        $response
            ->assertSessionHasNoErrors()
            ->assertRedirect(route('profile.edit'));

        // อ่านข้อมูลล่าสุดจากฐานข้อมูลมาตรวจ
        $user->refresh();

        $this->assertSame('Test User', $user->username);
        $this->assertSame('test@example.com', $user->email);
        $this->assertNull($user->email_verified_at);
    }

    // ถ้าอีเมลเหมือนเดิม ไม่ต้องล้างสถานะยืนยันอีเมล
    public function test_email_verification_status_is_unchanged_when_the_email_address_is_unchanged()
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->patch(route('profile.update'), [
                'username' => 'Test User',
                'email' => $user->email,
            ]);

        $response
            ->assertSessionHasNoErrors()
            ->assertRedirect(route('profile.edit'));

        $this->assertNotNull($user->refresh()->email_verified_at);
    }

    // ลองส่ง id คนอื่นและ role มาด้วย ต้องแก้ได้แค่ชื่อกับอีเมลของตัวเอง
    public function test_profile_update_only_changes_the_authenticated_user(): void
    {
        $user = User::factory()->create();
        $other = User::factory()->create();
        $originalOtherName = $other->username;

        $this->actingAs($user)->patch(route('profile.update'), [
            'id' => $other->id,
            'username' => 'Green',
            'name' => 'Ignored legacy field',
            'email' => $user->email,
            'role' => 'admin',
            'is_banned' => true,
        ])->assertSessionHasNoErrors()->assertRedirect(route('profile.edit'));

        // อ่านข้อมูลล่าสุดจากฐานข้อมูลมาตรวจ
        $user->refresh();
        $this->assertSame('Green', $user->username);
        $this->assertSame('customer', $user->role);
        $this->assertEquals(0, $user->is_banned);
        $this->assertSame($originalOtherName, $other->fresh()->username);
    }

    // ลองชื่อว่าง ชื่อยาวเกิน และอีเมลผิดรูปแบบ ต้องไม่บันทึก
    public function test_invalid_profile_fields_are_rejected(): void
    {
        $user = User::factory()->create();
        $originalName = $user->username;

        foreach ([
            ['username' => '', 'email' => $user->email],
            ['username' => str_repeat('a', 256), 'email' => $user->email],
            ['username' => 'Green', 'email' => 'invalid-email'],
        ] as $input) {
            $this->actingAs($user)->patch(route('profile.update'), $input)
                ->assertSessionHasErrors();
        }

        $this->assertSame($originalName, $user->fresh()->username);
    }

    // ทดสอบลบบัญชีเดิม กรณียังไม่มีที่อยู่หรือออเดอร์ผูกอยู่
    public function test_user_can_delete_their_account()
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->delete(route('profile.destroy'), [
                'password' => 'password',
            ]);

        $response
            ->assertSessionHasNoErrors()
            ->assertRedirect(route('home'));

        $this->assertGuest();
        $this->assertNull($user->fresh());
    }

    // ใส่รหัสผ่านผิด ต้องลบบัญชีไม่ได้
    public function test_correct_password_must_be_provided_to_delete_account()
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->from(route('profile.edit'))
            ->delete(route('profile.destroy'), [
                'password' => 'wrong-password',
            ]);

        $response
            ->assertSessionHasErrors('password')
            ->assertRedirect(route('profile.edit'));

        $this->assertNotNull($user->fresh());
    }
}
