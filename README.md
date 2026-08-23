# web-2-assignment-2 — Movie Tracker

A Laravel-based Movie Tracker single-page application. Authenticated users can maintain a personal list of movies (title, year, genre, poster, watch status, and rating), while admins can view and manage every user's movies. This is a Phase 2 (Laravel MVC) rewrite of an earlier plain PHP + AJAX version of the same app, as documented in `ONBOARDING.md`.

![Last Commit](https://img.shields.io/github/last-commit/OmarElzero/web-2-assignment-2)
![Top Language](https://img.shields.io/github/languages/top/OmarElzero/web-2-assignment-2)
![Repo Size](https://img.shields.io/github/repo-size/OmarElzero/web-2-assignment-2)

## Features

- **User accounts** with `role` (`user` / `admin`) and `status` (`active` / `disabled`) fields.
- **Movie CRUD API** — `GET/POST /api/movies`, `GET/PUT/DELETE /api/movies/{movie}`, protected by `auth` middleware.
- **Role-based access control** — regular users only see/manage their own movies; admins see and manage every user's movies (`MovieController::index`, `show`, `update` check `$user->isAdmin()`).
- **Per-movie fields**: IMDb ID, title, year, genre, poster path/URL, watch `status` (`want_to_watch`, `watching`, `watched`, `dropped`), and a rating.
- **Server-side validation** via `StoreMovieRequest` / `UpdateMovieRequest` form request classes.
- **TMDb integration** planned/documented for movie search and metadata (per `ONBOARDING.md`).
- **Single-Page Application shell** served from a Blade view (`spa.index`) with the API consumed client-side.

## Tech Stack

- **PHP 8.1+** with the **Laravel 10** framework
- **Eloquent ORM** for the `User` and `Movie` models (foreign key `movies.user_id → users.id`, cascade delete)
- **Laravel Sanctum** for API/token authentication
- **SQLite/MySQL** via Laravel migrations
- **PHPUnit** for testing (Feature and Unit test suites)
- **Composer** for PHP dependency management, **npm/Vite** for front-end assets

## Project Structure

```
app/Http/Controllers/MovieController.php   # Movie CRUD + role-based access logic
app/Http/Requests/                          # StoreMovieRequest / UpdateMovieRequest validation
app/Models/Movie.php                        # Movie Eloquent model (fillable fields, casts, user() relation)
app/Models/User.php                         # User model (role/status, movies relation)
database/migrations/                        # users, movies, and auth-related table schemas
routes/web.php                              # SPA entry route + authenticated /api/movies routes
routes/api.php                              # Sanctum-protected /user route
resources/views/spa.index.blade.php         # SPA shell view
ONBOARDING.md                                # Project background: Phase 1 -> Phase 2 (Laravel) migration notes
tests/                                       # Feature and Unit test scaffolding
```

## Installation

```bash
git clone https://github.com/OmarElzero/web-2-assignment-2.git
cd web-2-assignment-2
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
npm install && npm run build
```

## Usage

```bash
php artisan serve
```

Then authenticate and call the movie endpoints, e.g.:

```bash
curl -X GET http://localhost:8000/api/movies \
  -H "Accept: application/json" \
  --cookie "laravel_session=<session>"
```

## Demo

No live demo is available for this project.

## Testing

```bash
php artisan test
```

---

**Author:** OmarElzero · [GitHub](https://github.com/OmarElzero)
_Last updated: 2026-08-23_
