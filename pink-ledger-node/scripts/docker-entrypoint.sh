#!/bin/sh
set -eu

DB_PATH="${DB_PATH:-/app/data/database.sqlite}"
DB_DIR="$(dirname "$DB_PATH")"

mkdir -p "$DB_DIR"
export AUTO_INIT_DATABASE=true

echo "Starting Pink Ledger container..."
echo "Database path: $DB_PATH"

node scripts/init-database.js

exec node src/app.js
