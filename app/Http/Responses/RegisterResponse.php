<?php

namespace App\Http\Responses;

use Laravel\Fortify\Contracts\RegisterResponse as RegisterResponseContract;

class RegisterResponse implements RegisterResponseContract
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
        $target = $role === 'admin' ? '/admin/products' : '/';

        return $request->wantsJson()
            ? response()->json(['redirect' => $target], 201)
            : redirect()->intended($target);
    }
}

