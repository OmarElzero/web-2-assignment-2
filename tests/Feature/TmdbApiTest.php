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

        $response->assertStatus(500)
            ->assertJsonPath('ok', false)
            ->assertJsonPath('error.message', 'TMDB_API_KEY is not configured. Add it to .env');
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
