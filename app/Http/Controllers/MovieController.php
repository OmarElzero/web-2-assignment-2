<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreMovieRequest;
use App\Http\Requests\UpdateMovieRequest;
use App\Models\Movie;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class MovieController extends Controller
{

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->isAdmin()) {
            $movies = Movie::with('user')->orderByDesc('created_at')->get();
        } else {
            $movies = $user->movies()->orderByDesc('created_at')->get();
        }

        return response()->json(['data' => $movies]);
    }

    public function store(StoreMovieRequest $request): JsonResponse
    {
        $user = $request->user();
        $data = $request->validated();

        if (!$user->isAdmin()) {
            $data['user_id'] = $user->id;
        } else {
            $data['user_id'] = $data['user_id'] ?? $user->id;
        }

        $movie = Movie::create($data);

        return response()->json([
            'created' => true,
            'movie_id' => $movie->id,
            'movie' => $movie,
        ], 201);
    }

    public function show(Request $request, Movie $movie): JsonResponse
    {
        $user = $request->user();

        if (!$user->isAdmin() && $movie->user_id !== $user->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        return response()->json(['data' => $movie->load('user')]);
    }

    public function update(UpdateMovieRequest $request, Movie $movie): JsonResponse
    {
        $user = $request->user();

        if (!$user->isAdmin() && $movie->user_id !== $user->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $movie->update($request->validated());

        return response()->json(['updated' => true, 'movie' => $movie]);
    }

    public function destroy(Request $request, Movie $movie): JsonResponse
    {
        $user = $request->user();

        if (!$user->isAdmin() && $movie->user_id !== $user->id) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $movie->delete();

        return response()->json(['deleted' => true]);
    }
}
