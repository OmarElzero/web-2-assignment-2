<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\MovieController;

Route::get('/', function () {
    return view('spa.index');
})->name('home');

Route::middleware(['auth'])->prefix('api')->group(function () {
    Route::get('movies', [MovieController::class, 'index'])->name('api.movies.index');
    Route::post('movies', [MovieController::class, 'store'])->name('api.movies.store');
    Route::get('movies/{movie}', [MovieController::class, 'show'])->name('api.movies.show');
    Route::put('movies/{movie}', [MovieController::class, 'update'])->name('api.movies.update');
    Route::delete('movies/{movie}', [MovieController::class, 'destroy'])->name('api.movies.destroy');
});
