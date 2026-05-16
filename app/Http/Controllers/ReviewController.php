<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreReviewRequest;
use App\Http\Requests\UpdateReviewRequest;
use App\Models\Movie;
use App\Models\Review;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function index(Movie $movie): JsonResponse
    {
        $reviews = Review::with('user:id,full_name')
            ->where('movie_id', $movie->id)
            ->orderByDesc('created_at')
            ->get()
            ->map(function (Review $review) {
                return [
                    'id' => $review->id,
                    'movie_id' => $review->movie_id,
                    'rating' => $review->rating,
                    'text' => $review->text,
                    'created_at' => $review->created_at,
                    'updated_at' => $review->updated_at,
                    'user' => [
                        'id' => $review->user?->id,
                        'full_name' => $review->user?->full_name,
                    ],
                ];
            });

        return response()->json(['ok' => true, 'data' => $reviews]);
    }

    public function userReviews(Request $request): JsonResponse
    {
        $user = $request->user();

        $reviews = Review::with('movie:id,title,poster_url')
            ->where('user_id', $user->id)
            ->orderByDesc('created_at')
            ->get()
            ->map(function (Review $review) {
                return [
                    'id' => $review->id,
                    'movie_id' => $review->movie_id,
                    'rating' => $review->rating,
                    'text' => $review->text,
                    'created_at' => $review->created_at,
                    'updated_at' => $review->updated_at,
                    'movie' => [
                        'id' => $review->movie?->id,
                        'title' => $review->movie?->title,
                        'poster_url' => $review->movie?->poster_url,
                    ],
                ];
            });

        return response()->json(['ok' => true, 'data' => $reviews]);
    }

    public function store(StoreReviewRequest $request): JsonResponse
    {
        $user = $request->user();

        $review = Review::create([
            'user_id' => $user->id,
            'movie_id' => $request->input('movie_id'),
            'rating' => $request->input('rating'),
            'text' => $request->input('text'),
        ]);

        return response()->json(['ok' => true, 'data' => $review], 201);
    }

    public function update(UpdateReviewRequest $request, Review $review): JsonResponse
    {
        $this->ensureAuthorized($request, $review);

        $review->update($request->validated());

        return response()->json(['ok' => true, 'data' => $review]);
    }

    public function destroy(Request $request, Review $review): JsonResponse
    {
        $this->ensureAuthorized($request, $review);
        $review->delete();

        return response()->json(['ok' => true, 'data' => null]);
    }

    protected function ensureAuthorized(Request $request, Review $review): void
    {
        $user = $request->user();

        if ($user->id !== $review->user_id && ! $user->isAdmin()) {
            abort(403, 'Unauthorized action.');
        }
    }
}
