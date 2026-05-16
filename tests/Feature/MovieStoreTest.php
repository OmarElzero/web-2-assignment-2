<?php

namespace Tests\Feature;

use App\Models\Movie;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class MovieStoreTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_create_movie_via_api(): void
    {
        $user = User::create([
            'full_name' => 'Test User',
            'email' => 'testuser@example.test',
            'password_hash' => Hash::make('password'),
            'role' => 'user',
            'status' => 'active',
        ]);

        Sanctum::actingAs($user);

        $response = $this->postJson('/api/movies', [
            'title' => 'Inception',
            'imdb_id' => 'tt1375666',
            'year' => 2010,
            'genre' => 'Sci-Fi',
            'status' => 'want_to_watch',
            'rating' => 9,
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('created', true)
            ->assertJsonPath('movie.title', 'Inception');

        $this->assertDatabaseHas('movies', [
            'user_id' => $user->id,
            'title' => 'Inception',
            'imdb_id' => 'tt1375666',
            'status' => 'want_to_watch',
        ]);

        $this->assertSame(1, Movie::count());
    }
}
