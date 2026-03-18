# ── Build stage ──────────────────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Restore (layer-cached)
COPY Slotify.sln .
COPY src/Slotify.Api/Slotify.Api.csproj                                 src/Slotify.Api/
COPY src/Slotify.Application/Slotify.Application.csproj                 src/Slotify.Application/
COPY src/Slotify.Domain/Slotify.Domain.csproj                           src/Slotify.Domain/
COPY src/Slotify.Infrastructure/Slotify.Infrastructure.csproj           src/Slotify.Infrastructure/
RUN dotnet restore src/Slotify.Api/Slotify.Api.csproj

# Build
COPY src/ src/
RUN dotnet publish src/Slotify.Api/Slotify.Api.csproj \
    -c Release \
    -o /app/publish \
    --no-restore

# ── Runtime stage ─────────────────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app

RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "Slotify.Api.dll"]
