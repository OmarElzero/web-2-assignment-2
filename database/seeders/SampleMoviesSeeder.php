<?php

namespace Database\Seeders;

use App\Models\Movie;
use App\Models\User;
use Illuminate\Database\Seeder;

class SampleMoviesSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::where('email', 'admin@example.test')->first();

        if (! $user) {
            return;
        }

        $samples = [
            [
                'title' => 'Inception',
                'imdb_id' => 'tt1375666',
                'year' => 2010,
                'genre' => 'Sci-Fi',
                'status' => 'watched',
                'rating' => 9,
            ],
            [
                'title' => 'The Dark Knight',
                'imdb_id' => 'tt0468569',
                'year' => 2008,
                'genre' => 'Action',
                'status' => 'want_to_watch',
                'rating' => null,
            ],
        ];

        foreach ($samples as $sample) {
            Movie::firstOrCreate(
                ['user_id' => $user->id, 'title' => $sample['title']],
                array_merge($sample, ['user_id' => $user->id])
            );
        }
    }
}
