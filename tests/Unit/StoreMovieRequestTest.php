<?php

namespace Tests\Unit;

use App\Http\Requests\StoreMovieRequest;
use Illuminate\Support\Facades\Validator;
use Tests\TestCase;

class StoreMovieRequestTest extends TestCase
{
    public function test_title_and_status_are_required(): void
    {
        $validator = Validator::make([], (new StoreMovieRequest())->rules());

        $this->assertTrue($validator->fails());
        $this->assertArrayHasKey('title', $validator->errors()->toArray());
        $this->assertArrayHasKey('status', $validator->errors()->toArray());
    }

    public function test_valid_movie_payload_passes_validation(): void
    {
        $validator = Validator::make([
            'title' => 'The Matrix',
            'status' => 'watching',
            'year' => 1999,
            'rating' => 10,
        ], (new StoreMovieRequest())->rules());

        $this->assertFalse($validator->fails());
    }
}
