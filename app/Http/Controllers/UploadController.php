<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class UploadController extends Controller
{
    public function uploadAvatar(Request $request): JsonResponse
    {
        $request->validate([
            'avatar' => ['required', 'image', 'mimes:jpg,jpeg,png,gif,svg', 'max:2048'],
        ]);

        $path = $request->file('avatar')->store('avatars', 'public');

        $user = $request->user();
        $user->avatar_path = $path;
        $user->save();

        return response()->json([
            'ok' => true,
            'data' => [
                'path' => $path,
                'url' => Storage::disk('public')->url($path),
            ],
        ]);
    }

    public function uploadPoster(Request $request): JsonResponse
    {
        $request->validate([
            'poster' => ['required', 'image', 'mimes:jpg,jpeg,png,gif,svg', 'max:4096'],
        ]);

        $path = $request->file('poster')->store('posters', 'public');

        return response()->json([
            'ok' => true,
            'data' => [
                'path' => $path,
                'url' => Storage::disk('public')->url($path),
            ],
        ]);
    }
}
