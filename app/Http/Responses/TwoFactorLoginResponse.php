<?php

namespace App\Http\Responses;

use Laravel\Fortify\Contracts\TwoFactorLoginResponse as TwoFactorLoginResponseContract;

class TwoFactorLoginResponse implements TwoFactorLoginResponseContract
{
    /**
     * Create an HTTP response that represents the object.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function toResponse($request)
    {
        $role = $request->user()?->role;
        $target = $role === 'admin' ? '/dashboard/admin' : '/';

        return $request->wantsJson()
            ? response()->json(['two_factor' => false, 'redirect' => $target])
            : redirect()->intended($target);
    }
}
