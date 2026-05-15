<?php

namespace Tests\Feature;

use App\Models\Movie;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class MovieUpdateTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_update_movie_status_and_rating(): void
    {
        $user = User::create([
            'full_name' => 'Test User',
            'email' => 'updateuser@example.test',
            'password_hash' => Hash::make('password'),
            'role' => 'user',
            'status' => 'active',
        ]);

        $movie = Movie::create([
            'user_id' => $user->id,
            'title' => 'Test Film',
            'imdb_id' => '12345',
            'status' => 'want_to_watch',
            'rating' => null,
        ]);

        Sanctum::actingAs($user);

        $response = $this->putJson("/api/movies/{$movie->id}", [
            'status' => 'watched',
            'rating' => 8,
        ]);

        $response->assertOk()
            ->assertJsonPath('updated', true)
            ->assertJsonPath('movie.status', 'watched')
            ->assertJsonPath('movie.rating', 8);

        $this->assertDatabaseHas('movies', [
            'id' => $movie->id,
            'status' => 'watched',
            'rating' => 8,
        ]);
    }
}
