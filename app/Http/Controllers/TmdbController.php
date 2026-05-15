<?php

namespace App\Http\Controllers;

use App\Services\TmdbService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TmdbController extends Controller
{
    public function __construct(
        protected TmdbService $tmdb
    ) {
    }

    protected function proxy(string $path, array $params = []): JsonResponse
    {
        if (! $this->tmdb->isConfigured()) {
            return response()->json([
                'ok' => false,
                'error' => ['message' => 'TMDB_API_KEY is not configured. Add it to .env'],
            ], 500);
        }

        $response = $this->tmdb->request($path, $params);

        if (! $response->successful()) {
            return response()->json([
                'ok' => false,
                'error' => ['message' => 'TMDb request failed with status ' . $response->status()],
            ], $response->status());
        }

        return response()->json(['ok' => true, 'data' => $response->json()]);
    }

    public function popular(Request $request): JsonResponse
    {
        return $this->proxy('/movie/popular', [
            'page' => $request->query('page', 1),
        ]);
    }

    public function genres(Request $request): JsonResponse
    {
        return $this->proxy('/genre/movie/list');
    }

    public function details(Request $request): JsonResponse
    {
        $movieId = $request->query('id');
        if (! $movieId) {
            return response()->json([
                'ok' => false,
                'error' => ['message' => 'Movie id is required.'],
            ], 422);
        }

        return $this->proxy('/movie/' . $movieId, [
            'append_to_response' => 'credits',
        ]);
    }

    public function discover(Request $request): JsonResponse
    {
        $genreId = $request->query('genre_id');
        $params = ['page' => $request->query('page', 1)];

        if ($genreId) {
            $params['with_genres'] = $genreId;
        }

        return $this->proxy('/discover/movie', $params);
    }

    public function search(Request $request): JsonResponse
    {
        $query = $request->query('q');

        if (! $query) {
            return response()->json([
                'ok' => false,
                'error' => ['message' => 'Search query is required.'],
            ], 422);
        }

        return $this->proxy('/search/movie', [
            'query' => $query,
            'include_adult' => $request->query('include_adult', 'false'),
            'page' => $request->query('page', 1),
        ]);
    }
}
