# syntax=docker/dockerfile:1
#
# Builds the React SPA and the ASP.NET Core API into a single image. The SPA is
# copied into wwwroot so both are served from one origin, which keeps the auth
# cookie first-party — Firefox and Safari block the third-party cookie you get
# when the frontend and API live on separate domains.
#
# Build context is the repo root (not backend/), because the frontend has to be
# reachable. Deploy with: gcloud run deploy --source . from the repo root.

# ---- frontend build ----
FROM node:24-alpine AS frontend
WORKDIR /fe

# Install from the lockfile first so this layer caches unless deps change.
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

COPY frontend/ ./
# Mode "production" picks up frontend/.env.production, which leaves VITE_API_URL
# empty so the bundle calls the API with same-origin relative URLs.
RUN npm run build

# ---- backend build ----
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Restore first so dependency layers stay cached when only source changes.
COPY backend/backend.csproj ./
RUN dotnet restore backend.csproj

COPY backend/ ./
RUN dotnet publish backend.csproj -c Release -o /app/publish --no-restore

# ---- runtime ----
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final

# Npgsql probes for Kerberos/GSSAPI during connection setup; without this it logs
# a spurious "libgssapi_krb5.so.2: cannot open shared object file" on every boot.
RUN apt-get update \
    && apt-get install -y --no-install-recommends libgssapi-krb5-2 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY --from=build /app/publish ./
COPY --from=frontend /fe/dist ./wwwroot

# Profile picture uploads land here. Note this is instance-local storage that
# Cloud Run discards on every scale-to-zero — it needs object storage to persist.
RUN mkdir -p /app/wwwroot/uploads

ENV ASPNETCORE_ENVIRONMENT=Production
EXPOSE 8080

# Cloud Run injects PORT at runtime; 8080 is the fallback for local `docker run`.
ENTRYPOINT ["sh", "-c", "exec dotnet backend.dll --urls http://0.0.0.0:${PORT:-8080}"]
