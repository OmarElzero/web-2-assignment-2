#!/usr/bin/env bash
# One-shot setup for teammates (PHP + Composer required). Uses env.team → .env
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

if [[ ! -f env.team ]]; then
  echo "Missing env.team." >&2
  exit 1
fi

if ! command -v composer >/dev/null 2>&1; then
  echo "Install Composer first: https://getcomposer.org" >&2
  exit 1
fi

if ! command -v php >/dev/null 2>&1; then
  echo "Install PHP 8.x with extensions (openssl, pdo_sqlite, mbstring, tokenizer, xml, curl)." >&2
  exit 1
fi

composer install --no-interaction --prefer-dist

cp -f env.team .env

mkdir -p database
if [[ ! -f database/database.sqlite ]]; then
  touch database/database.sqlite
fi

php artisan migrate --seed --no-interaction
php artisan config:clear --no-interaction

echo ""
echo "Ready. Demo login: admin@example.test / secret123"
echo "Run: php artisan serve"
echo "Then open http://127.0.0.1:8000"
