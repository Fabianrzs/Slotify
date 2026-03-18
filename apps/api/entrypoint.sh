#!/bin/sh
set -e

echo "=== Slotify API entrypoint ==="
echo "Waiting for SQL Server to accept connections..."

MAX_RETRIES=40
COUNT=0

until curl -sf "http://localhost:8080/health" > /dev/null 2>&1 || \
      nc -z sqlserver 1433 > /dev/null 2>&1 || \
      [ $COUNT -ge $MAX_RETRIES ]; do
  COUNT=$((COUNT + 1))
  echo "  [$COUNT/$MAX_RETRIES] SQL Server not ready, waiting 3s..."
  sleep 3
done

if [ $COUNT -ge $MAX_RETRIES ]; then
  echo "WARNING: Could not confirm SQL Server is ready. Starting anyway (migrations may fail)."
fi

echo "Starting Slotify API (migrations will run automatically)..."
exec dotnet Slotify.Api.dll
