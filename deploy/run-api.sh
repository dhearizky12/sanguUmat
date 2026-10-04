#!/usr/bin/env bash
# Runs the API on the host (not in Docker) against the Postgres from `docker compose up -d db`.
# Reads deploy/.env; listens on 127.0.0.1:5236 for a reverse proxy to forward to.
set -euo pipefail
cd "$(dirname "$0")"
set -a; . ./.env; set +a
cd ../backend
export ASPNETCORE_ENVIRONMENT=Production
export ASPNETCORE_URLS=http://127.0.0.1:5236
export ConnectionStrings__DefaultConnection="Host=127.0.0.1;Port=${POSTGRES_HOST_PORT:-5433};Database=$POSTGRES_DB;Username=$POSTGRES_USER;Password=$POSTGRES_PASSWORD"
export Authentication__Google__ClientId="$GOOGLE_CLIENT_ID"
export Authentication__Google__ClientSecret="$GOOGLE_CLIENT_SECRET"
export Jwt__Key="$JWT_KEY"
export Jwt__ExpiryDays="${JWT_EXPIRY_DAYS:-7}"
export Frontend__BaseUrl="$PUBLIC_BASE_URL"
export App__BasePath="${APP_BASE_PATH:-}"
export Cors__AllowedOrigins__0="${EXTRA_CORS_ORIGIN:-}"
export AdminEmails__0="${ADMIN_EMAIL:-}"
exec dotnet run -c Release --no-launch-profile
