#!/usr/bin/env bash
# Check weather API used by the About tagline (SideTray).
# Requires dev server running: npm run dev
# Coordinates match app/config/locationConfig.ts default (Toronto).

set -e

BASE_URL="${BASE_URL:-http://localhost:3000}"
LAT="${LAT:-43.6532}"
LON="${LON:--79.3832}"
URL="${BASE_URL}/api/weather?lat=${LAT}&lon=${LON}"

RESPONSE=$(mktemp)
STATUS=$(curl -s -w "%{http_code}" -o "$RESPONSE" "$URL")

if [ "$STATUS" -eq 200 ]; then
  BODY=$(cat "$RESPONSE")
  if echo "$BODY" | grep -q '"tempC"' && echo "$BODY" | grep -q '"description"'; then
    echo "OK: Weather API returned 200 with tempC and description."
    if command -v jq >/dev/null 2>&1; then
      echo "  tempC: $(echo "$BODY" | jq -r '.tempC')"
      echo "  tempF: $(echo "$BODY" | jq -r '.tempF')"
      echo "  description: $(echo "$BODY" | jq -r '.description')"
    fi
    rm -f "$RESPONSE"
    exit 0
  else
    echo "FAIL: 200 but response missing tempC or description: $BODY"
    rm -f "$RESPONSE"
    exit 1
  fi
elif [ "$STATUS" -eq 503 ]; then
  echo "WEATHER NOT CONFIGURED: OPENWEATHERMAP_API_KEY is missing. Set it in .env.local and restart the dev server."
  cat "$RESPONSE" | head -1
  rm -f "$RESPONSE"
  exit 1
elif [ "$STATUS" -eq 500 ]; then
  echo "WEATHER API ERROR: Server returned 500. Check server logs for 'Weather API error:'."
  cat "$RESPONSE" | head -5
  rm -f "$RESPONSE"
  exit 1
else
  echo "FAIL: HTTP $STATUS"
  cat "$RESPONSE"
  rm -f "$RESPONSE"
  exit 1
fi
