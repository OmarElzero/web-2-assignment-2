#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

TEAM_NUMBER="${1:-00}"
ARCHIVE_NAME="${TEAM_NUMBER}_ASSIGNMENT-2.zip"
STAGING_DIR="$(mktemp -d)"

echo "==> Installing dependencies..."
if command -v composer >/dev/null 2>&1; then
  composer install --optimize-autoloader
elif [[ -f composer.phar ]]; then
  php composer.phar install --optimize-autoloader
else
  php "$(command -v composer 2>/dev/null || echo composer.phar)" install --optimize-autoloader 2>/dev/null || true
fi

echo "==> Building submission database..."
mkdir -p database
touch database/database.sqlite
php artisan migrate:fresh --seed --force

echo "==> Running tests..."
php artisan test

echo "==> Staging project (excluding vendor)..."
rsync -a \
  --exclude='vendor' \
  --exclude='node_modules' \
  --exclude='.git' \
  --exclude='.env' \
  --exclude='composer.phar' \
  --exclude='.DS_Store' \
  --exclude='**/.DS_Store' \
  --exclude="${ARCHIVE_NAME}" \
  --exclude='*_ASSIGNMENT-2.zip' \
  --exclude='.phpunit.result.cache' \
  --exclude='storage/logs/*.log' \
  --exclude='app/Models/User.php.bak' \
  ./ "${STAGING_DIR}/"

echo "==> Force-including required submission files..."
# Always copy these explicitly (avoids .gitignore / rsync edge cases)
cp -f "${ROOT}/database/database.sqlite" "${STAGING_DIR}/database/database.sqlite"
cp -f "${ROOT}/Team_Members.txt" "${STAGING_DIR}/Team_Members.txt"

echo "==> Verifying required files before zipping..."
MISSING=0
if [[ ! -f "${STAGING_DIR}/database/database.sqlite" ]]; then
  echo "ERROR: database/database.sqlite is missing from staging."
  MISSING=1
fi
if [[ ! -f "${STAGING_DIR}/Team_Members.txt" ]]; then
  echo "ERROR: Team_Members.txt is missing from staging."
  MISSING=1
fi
if [[ "${MISSING}" -eq 1 ]]; then
  rm -rf "${STAGING_DIR}"
  exit 1
fi

if [[ ! -s "${STAGING_DIR}/database/database.sqlite" ]]; then
  echo "ERROR: database/database.sqlite exists but is empty."
  rm -rf "${STAGING_DIR}"
  exit 1
fi

echo "==> Creating ${ARCHIVE_NAME}..."
rm -f "${ROOT}/${ARCHIVE_NAME}"
(cd "${STAGING_DIR}" && zip -r "${ROOT}/${ARCHIVE_NAME}" .)

echo "==> Zip contents check (required files):"
unzip -l "${ROOT}/${ARCHIVE_NAME}" | grep -E 'database/database\.sqlite|Team_Members\.txt' || {
  echo "ERROR: Required files not found inside zip."
  exit 1
}

rm -rf "${STAGING_DIR}"

echo ""
echo "==> Done. Upload this file:"
echo "    ${ROOT}/${ARCHIVE_NAME}"
echo ""
echo "Required files confirmed:"
echo "  - database/database.sqlite"
echo "  - Team_Members.txt"
echo ""
echo "IMPORTANT: Edit Team_Members.txt with your real team number and member IDs before uploading."
