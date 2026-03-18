# ── Build stage ──────────────────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy all csproj files for layer-cached restore
COPY Slotify.sln .
COPY src/Slotify.Api/Slotify.Api.csproj                                           src/Slotify.Api/
COPY src/Slotify.Application/Slotify.Application.csproj                           src/Slotify.Application/
COPY src/Slotify.Domain/Slotify.Domain.csproj                                     src/Slotify.Domain/
COPY src/Slotify.Infrastructure/Slotify.Infrastructure.csproj                     src/Slotify.Infrastructure/
COPY tests/Slotify.Infrastructure.Tests/Slotify.Infrastructure.Tests.csproj       tests/Slotify.Infrastructure.Tests/

RUN dotnet restore Slotify.sln

# Copy sources and publish (only the API project output matters)
COPY src/ src/
RUN dotnet publish src/Slotify.Api/Slotify.Api.csproj \
    -c Release -o /app/publish --no-restore

# ── Runtime stage ─────────────────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app

RUN apt-get update && apt-get install -y curl netcat-openbsd && rm -rf /var/lib/apt/lists/*

COPY --from=build /app/publish .
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENV ASPNETCORE_URLS=http://+:8080
ENV DATABASE_AUTO_MIGRATE=true
EXPOSE 8080

ENTRYPOINT ["/entrypoint.sh"]
