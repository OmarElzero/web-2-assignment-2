<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\MovieController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\TmdbController;
use App\Http\Controllers\UploadController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::post('/users/register.php', [AuthController::class, 'register']);
Route::post('/users/login.php', [AuthController::class, 'login']);
Route::post('/users/logout.php', [AuthController::class, 'logout'])->middleware('auth:sanctum');

Route::get('/tmdb/genres.php', [TmdbController::class, 'genres']);
Route::get('/tmdb/popular.php', [TmdbController::class, 'popular']);
Route::get('/tmdb/details.php', [TmdbController::class, 'details']);
Route::get('/tmdb/discover.php', [TmdbController::class, 'discover']);
Route::get('/tmdb/search.php', [TmdbController::class, 'search']);

Route::get('/reviews/movie/{movie}', [ReviewController::class, 'index']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    Route::get('/movies', [MovieController::class, 'index'])->name('api.movies.index');
    Route::post('/movies', [MovieController::class, 'store'])->name('api.movies.store');
    Route::get('/movies/{movie}', [MovieController::class, 'show'])->name('api.movies.show');
    Route::put('/movies/{movie}', [MovieController::class, 'update'])->name('api.movies.update');
    Route::delete('/movies/{movie}', [MovieController::class, 'destroy'])->name('api.movies.destroy');

    Route::get('/reviews/user', [ReviewController::class, 'userReviews']);
    Route::post('/reviews', [ReviewController::class, 'store']);
    Route::put('/reviews/{review}', [ReviewController::class, 'update']);
    Route::delete('/reviews/{review}', [ReviewController::class, 'destroy']);

    Route::post('/users/upload-avatar.php', [UploadController::class, 'uploadAvatar']);
    Route::post('/movies/upload-poster.php', [UploadController::class, 'uploadPoster']);
});

