<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class TmdbApiTest extends TestCase
{
    public function test_popular_endpoint_returns_friendly_error_when_api_key_missing(): void
    {
        config(['services.tmdb.key' => null]);

        $response = $this->getJson('/api/tmdb/popular.php');

        $response->assertStatus(503)
            ->assertJsonPath('ok', false)
            ->assertJsonPath('error.message', 'TMDB_API_KEY is not configured. Copy .env.example to .env, set TMDB_API_KEY (TMDb v3 API key or v4 Read Access Token), then run php artisan config:clear.');
    }

    public function test_popular_endpoint_returns_data_when_tmdb_responds(): void
    {
        config(['services.tmdb.key' => 'fake-key']);

        Http::fake([
            'api.themoviedb.org/*' => Http::response([
                'page' => 1,
                'results' => [['id' => 1, 'title' => 'Test Movie']],
            ], 200),
        ]);

        $response = $this->getJson('/api/tmdb/popular.php');

        $response->assertOk()
            ->assertJsonPath('ok', true)
            ->assertJsonPath('data.results.0.title', 'Test Movie');
    }
}
