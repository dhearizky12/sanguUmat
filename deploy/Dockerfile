# syntax=docker/dockerfile:1
#
# One image, one origin: the ASP.NET Core API plus the built React bundle, which
# it serves out of wwwroot. That is what keeps the auth cookie first-party behind
# the Tailscale Funnel hostname.
#
# The build context is the repo root, because both backend/ and frontend/ have to
# be reachable:
#   docker compose -f deploy/docker-compose.yml build

# ---- frontend build ----
FROM node:22-alpine AS frontend
WORKDIR /src

# Install first so the dependency layer stays cached when only source changes.
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

COPY frontend/ ./
# mode=production, so frontend/.env.production applies: VITE_API_URL is empty and
# the bundle talks to its own origin with relative URLs.
RUN npm run build

# ---- backend build ----
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

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

# The SPA lands next to wwwroot/uploads. Order matters: publish already wrote
# wwwroot, so this merges into it instead of replacing it.
COPY --from=frontend /src/dist/ ./wwwroot/

# Cookie auth encrypts its ticket with the Data Protection key ring, which
# ASP.NET Core writes to $HOME/.aspnet/DataProtection-Keys with no code needed.
# docker-compose.yml mounts a volume there so a rebuild does not regenerate the
# keys and log every user out.
#
# HOME is pinned because the path depends on it. The base image runs as root today
# but ships an APP_UID=1654 ready to be switched on; if that ever happens HOME
# would move, the volume would stop lining up, and the only symptom would be users
# being logged out after each deploy — no error anywhere.
ENV HOME=/root

# Bind targets for the named volumes. Creating them here means a plain
# `docker run` with no volumes still works.
RUN mkdir -p /app/wwwroot/uploads /root/.aspnet/DataProtection-Keys

# The base image already binds 8080 via HTTP_PORTS; setting ASPNETCORE_URLS on top
# of it only produces an "Overriding HTTP_PORTS" warning at boot.
ENV ASPNETCORE_ENVIRONMENT=Production

EXPOSE 8080

ENTRYPOINT ["dotnet", "backend.dll"]
