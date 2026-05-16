# ONBOARDING — Movie Tracker (Laravel migration of Phase 1 SPA)

## Abstracted Summary
This project is a Single-Page Application (SPA) for tracking movies (personal lists, ratings, and details via TMDb). Phase‑1 used plain PHP + AJAX with a MySQL schema; Phase‑2 migrates the app into a Laravel MVC project using:

- Laravel (controllers, Blade views, Eloquent)
- SQLite (or MySQL) via Laravel migrations
- PHP 8.x, Composer packages
- Frontend: original JS ported into Blade + static assets
- TMDb as the third-party API (server-side proxy recommended; API key in `.env`)

## Feature List

- User accounts: sign-up, login, role (`user` | `admin`), status (`active` | `disabled`).
- Movie CRUD: create, read, update, delete movie entries (title, imdb id, year, genre, poster, status, rating).
- TMDb integration: search movies, show popular, show detailed metadata (credits).
- File handling for avatars/posters: store file on server and save path in DB.
- Server-side validation using Laravel `FormRequest`s.
- Blade master layout with `header`/`footer` includes and SPA entry view.
- Automated tests: at least one Feature test and unit tests (Phase‑2 requirement).

## Database Schema Map

### Table: `users`
- `id` (bigint, primary, auto-increment)
- `full_name` (varchar(100), NOT NULL)
- `email` (varchar(100), NOT NULL, UNIQUE)
- `password_hash` (varchar(255), NOT NULL)
- `role` (enum: 'user','admin') — default 'user'
- `status` (enum: 'active','disabled') — default 'active'
- `avatar_path` (varchar(255), NULL)
- `created_at` (datetime)
- `updated_at` (datetime)

Relationships:
- `users.id` → `movies.user_id` (1-to-many). Deleting a user cascades their movies.

### Table: `movies`
- `id` (bigint, primary, auto-increment)
- `user_id` (bigint, foreign key → `users.id`, ON DELETE CASCADE)
- `imdb_id` (varchar(20), NULL)
- `title` (varchar(255), NOT NULL)
- `year` (integer, NULL)
- `genre` (varchar(100), NULL)
- `poster_path` (varchar(255), NULL)
- `poster_url` (varchar(500), NULL)
- `status` (enum: 'want_to_watch','watching','watched','dropped') — default 'want_to_watch'
- `rating` (unsigned tinyint, NULL) — 1..10
- `created_at` (datetime)
- `updated_at` (datetime)

Indexes:
- `movies.user_id`

## Quick dev setup

1. Install dependencies:
```bash
composer install
cp .env.example .env
php artisan key:generate
```
2. Use SQLite (recommended for assignment):
```bash
touch database/database.sqlite
# set DB_CONNECTION=sqlite in .env
php artisan migrate
```
3. Add `TMDB_API_KEY` to `.env` (do not commit `.env`).

## API endpoints (JSON)

- `GET /api/movies` — list movies (admin => all; otherwise => user's movies)
- `POST /api/movies` — create movie
- `GET /api/movies/{id}` — movie details
- `PUT /api/movies/{id}` — update
- `DELETE /api/movies/{id}` — delete

## Validation summary (server-side)

- `title`: required, string, max 255
- `imdb_id`: nullable, string, max 20
- `year`: nullable, integer, between 1888 and (current year + 2)
- `genre`: nullable, string, max 100
- `poster_path`: nullable, string, max 255
- `poster_url`: nullable, valid URL, max 500
- `status`: required, one of [want_to_watch, watching, watched, dropped]
- `rating`: nullable, integer between 1 and 10

## Tests

- Add at least one Feature test (end-to-end HTTP) and unit tests for validation.

## Packaging (submission)

- Include `Team_Members.txt` with team number and members.
- Include `database/database.sqlite` or SQL dump in `database/`.
- Delete `vendor/` before compressing.
- Archive as `TeamNumber_ASSIGNMENT-2.zip`.
