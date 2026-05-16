# ONBOARDING — MovieReview Laravel App

## What this app is

This is a Laravel migration of the original Phase 1 Movie Review SPA. It provides:

- User registration and login with Laravel Sanctum token authentication.
- Movie watchlist CRUD for logged-in users.
- TMDb proxy endpoints for search, popular movies, details, genres, and discovery.
- Server-side review storage and retrieval.
- Upload endpoints for user avatars and movie posters.
- A Blade-based SPA shell and JavaScript UI.
- SQLite support for local development and fast testing.

## Environment configuration

Copy `.env.example` to `.env` and set these values:

- `APP_KEY` — generate with `php artisan key:generate`
- `TMDB_API_KEY` — your TMDb API key
- `FILESYSTEM_DISK=public` — the app stores uploaded avatars/posters in `storage/app/public`
- `DB_CONNECTION=sqlite` and `DB_DATABASE=database/database.sqlite`

If using the shared team helper file, run:

```bash
./setup-dev.sh
```

Otherwise:

```bash
composer install
cp .env.example .env
php artisan key:generate
touch database/database.sqlite
php artisan storage:link
php artisan migrate --seed
php artisan config:clear
php artisan serve --host=127.0.0.1 --port=8000
```

## Required environment variables

- `APP_NAME`
- `APP_ENV`
- `APP_KEY`
- `APP_URL`
- `DB_CONNECTION`
- `DB_DATABASE`
- `FILESYSTEM_DISK`
- `TMDB_API_KEY`
- `TMDB_BASE_URL`

## New backend features added

### Reviews

- `reviews` table with `user_id`, `movie_id`, `rating`, and `text`.
- `Review` model and `ReviewController`.
- Public review listing: `GET /api/reviews/movie/{movie}`.
- Authenticated review posting: `POST /api/reviews`.
- Authenticated review listing for current user: `GET /api/reviews/user`.
- Review editing/deleting for owners and admins.

### Uploads

- `UploadController` with secure file validation.
- Avatar upload: `POST /api/users/upload-avatar.php` (authenticated).
- Movie poster upload: `POST /api/movies/upload-poster.php` (authenticated).
- Files are stored on the `public` disk and returned as accessible URLs.

## API endpoints

### Authentication

- `POST /api/users/register.php`
- `POST /api/users/login.php`
- `POST /api/users/logout.php`

### Movie CRUD

- `GET /api/movies`
- `POST /api/movies`
- `GET /api/movies/{id}`
- `PUT /api/movies/{id}`
- `DELETE /api/movies/{id}`

### Reviews

- `GET /api/reviews/movie/{movie}`
- `GET /api/reviews/user`
- `POST /api/reviews`
- `PUT /api/reviews/{review}`
- `DELETE /api/reviews/{review}`

### Uploads

- `POST /api/users/upload-avatar.php`
- `POST /api/movies/upload-poster.php`

### TMDb proxy

- `GET /api/tmdb/genres.php`
- `GET /api/tmdb/popular.php`
- `GET /api/tmdb/details.php`
- `GET /api/tmdb/discover.php`
- `GET /api/tmdb/search.php`

## Database schema summary

### `users`
- `id`, `full_name`, `email`, `password_hash`, `role`, `status`, `avatar_path`, `created_at`, `updated_at`

### `movies`
- `id`, `user_id`, `imdb_id`, `title`, `year`, `genre`, `poster_path`, `poster_url`, `status`, `rating`, `created_at`, `updated_at`

### `reviews`
- `id`, `user_id`, `movie_id`, `rating`, `text`, `created_at`, `updated_at`

## Notes

- The app uses Sanctum bearer tokens with `Authorization: Bearer <token>`.
- CORS is open for API calls, and the `public` disk is configured for uploads.
- Run `php artisan config:clear` after updating `.env`.

## Packaging

- Include `Team_Members.txt`.
- Include `database/database.sqlite` or a SQL dump under `database/`.
- Remove `vendor/` before zipping.
- Archive as `YourTeamNumber_ASSIGNMENT-2.zip`.

