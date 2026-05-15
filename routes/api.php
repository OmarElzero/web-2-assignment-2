<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\MovieController;
use App\Http\Controllers\TmdbController;
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
Route::post('/users/logout.php', [AuthController::class, 'logout']);

Route::get('/tmdb/genres.php', [TmdbController::class, 'genres']);
Route::get('/tmdb/popular.php', [TmdbController::class, 'popular']);
Route::get('/tmdb/details.php', [TmdbController::class, 'details']);
Route::get('/tmdb/discover.php', [TmdbController::class, 'discover']);
Route::get('/tmdb/search.php', [TmdbController::class, 'search']);

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/movies', [MovieController::class, 'index'])->name('api.movies.index');
    Route::post('/movies', [MovieController::class, 'store'])->name('api.movies.store');
    Route::get('/movies/{movie}', [MovieController::class, 'show'])->name('api.movies.show');
    Route::put('/movies/{movie}', [MovieController::class, 'update'])->name('api.movies.update');
    Route::delete('/movies/{movie}', [MovieController::class, 'destroy'])->name('api.movies.destroy');
});
