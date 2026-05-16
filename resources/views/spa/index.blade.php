@extends('layouts.app')

@section('title', 'MovieReview - Discover & Review Movies')

@section('content')
    <div id="appMessage" class="app-message" aria-live="polite"></div>

    <main id="mainContent">
        <section id="homeSection" class="view active">
            <header class="header">
                <div class="container">
                    <div class="header-content">
                        <div class="header-text">
                            <h2>Discover. Review. <br> Rate.</h2>
                            <p>Join our community of movie lovers! Read reviews, share your opinions, and explore a world of cinematic stories.</p>
                            <div class="header-btn">
                                <a href="#" class="book-btn">Get Started</a>
                            </div>
                        </div>
                        <div class="header-img">
                            <img src="{{ asset('movie_image/samuel-regan-asante-wMkaMXTJjlQ-unsplash.jpg') }}" alt="Movie Collection">
                        </div>
                    </div>
                </div>
            </header>

            <section class="movie-browse" id="browse">
                <div class="hero-browse">
                    <div class="container">
                        <div class="hero-content">
                            <h2>Featured Movies</h2>
                            <form id="searchForm" class="search-filter-wrapper">
                                <input type="search" id="searchInput" class="search-input" placeholder="Search movies by name…" autocomplete="off">
                                <button type="submit" class="search-submit-btn">Search</button>
                            </form>
                            <div id="genreContainer" class="genre-filters"></div>
                        </div>
                    </div>
                </div>

                <div class="container browse-container">
                    <div id="moviesLoading" class="movies-state" hidden>Loading movies…</div>
                    <div id="moviesError" class="movies-state movies-state--error" hidden></div>
                    <div id="movieGrid" class="movie-grid" aria-live="polite"></div>
                </div>
            </section>
        </section>

        <section id="detailsSection" class="view">
            <button id="backButton" class="btn btn-back">← Back to browse</button>
            <div class="details-page">
                <main id="movieDetailsContent" class="details-container">
                    <div class="loading-spinner">Loading movie details...</div>
                </main>
                <section id="reviewsSection" class="reviews-section" style="display:none;">
                    <div class="container">
                        <h2>Reviews</h2>
                        <div id="reviewFormContainer" class="review-form-container" style="display:none;">
                            <form id="reviewForm" class="review-form">
                                <label for="reviewRating">Your Rating:</label>
                                <div class="rating-input">
                                    <input type="range" id="reviewRating" name="rating" min="1" max="10" value="5" class="rating-slider">
                                    <span id="ratingDisplay">5</span>/10
                                </div>
                                <label for="reviewText">Your Review:</label>
                                <textarea id="reviewText" name="review" placeholder="Share your thoughts about this movie..." rows="4" required></textarea>
                                <button type="submit" class="btn btn-submit-review">Post Review</button>
                            </form>
                        </div>
                        <div id="reviewsList" class="reviews-list"></div>
                    </div>
                </section>
            </div>
        </section>

        <section id="loginSection" class="view">
            <div class="container">
                <form id="loginForm">
                    <h2>Login</h2>
                    <p id="loginFormMessage" class="form-message" role="alert"></p>
                    <label for="loginEmail">Email</label>
                    <input type="email" id="loginEmail" name="email" required autocomplete="username">
                    <label for="loginPassword">Password</label>
                    <input type="password" id="loginPassword" name="password" required autocomplete="current-password">
                    <button type="submit">Login</button>
                </form>
            </div>
        </section>

        <section id="signupSection" class="view">
            <div class="container">
                <form id="signupForm">
                    <h2>Sign Up</h2>
                    <p id="signupFormMessage" class="form-message" role="alert"></p>
                    <label for="signupName">Name</label>
                    <input type="text" id="signupName" name="name" required autocomplete="name">
                    <label for="signupEmail">Email</label>
                    <input type="email" id="signupEmail" name="email" required autocomplete="email">
                    <label for="signupPassword">Password</label>
                    <input type="password" id="signupPassword" name="password" required autocomplete="new-password" minlength="4">
                    <button type="submit">Create Account</button>
                </form>
            </div>
        </section>

        <section id="profileSection" class="view">
            <div class="container profile-page">
                <header class="profile-header">
                    <div class="user-avatar">👤</div>
                    <div class="user-info-text">
                        <h2 id="userNameDisplay">Welcome Back!</h2>
                        <p id="userEmailDisplay">loading...</p>
                    </div>
                </header>
                <section class="profile-stats">
                    <div class="stat">
                        <div class="value" id="watchlistCount">0</div>
                        <div class="label">Watchlist items</div>
                    </div>
                    <div class="stat">
                        <div class="value" id="reviewsCount">0</div>
                        <div class="label">Reviews added</div>
                    </div>
                </section>
                <section class="user-watchlist">
                    <div class="container">
                        <h2 class="section-title">Your Watchlist</h2>
                        <div id="profileMovieGrid" class="movie-grid"></div>
                    </div>
                </section>
            </div>
        </section>
    </main>
@endsection
