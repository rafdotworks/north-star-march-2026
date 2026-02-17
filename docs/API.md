# raf.works API

Agent-facing API for identity, content, and liveness. JSON only; no auth; no rate limits in v1.

**Base URL (production):** `https://raf.works`

---

## Endpoints

### `GET /api/me`

Canonical identity: who Raf is, location, contact, principles, and pointers to writings. Use this as the single entry point for agents.

**Response:** JSON with `name`, `bio`, `location` (city, timezone), `contact` (email, linkedin, x), `principles` (array), `writings` (array of `{ id, title }`), `site`.

**Cache:** 60 seconds. Clients can cache; repeat calls within 60s may be served from cache.

---

### `GET /api/health`

Liveness check. Use to verify the API is up.

**Response:** `200` with `{ "status": "ok", "timestamp": "ISO8601" }`. No config or external calls.

---

### Existing endpoints

- **`GET /api/article/[id]`** — Markdown article content by id (e.g. writings). Returns `{ "content": "..." }`. Id must be alphanumeric or hyphen.
- **`GET /api/story/[id]`** — Story markdown content by id. Same response shape.
- **`GET /api/weather?lat={lat}&lon={lon}`** — Weather at coordinates. Returns `{ tempC, tempF, description }`. Requires server-side env config.

---

## Behavior

- **Format:** JSON only.
- **Auth:** None.
- **Rate limits:** None in v1.

---

## Cost

Free. No API keys required for `/api/me`, `/api/health`, `/api/article/[id]`, or `/api/story/[id]`. Weather uses a server-side key and is not part of the public agent contract.

---

## Availability

Check **`GET /api/health`** for status. Returns 200 when the service is up.

---

## Performance

- **`/api/me`:** Short cache (60s). Safe for agents to cache responses.
- **`/api/health`:** Minimal work; use for frequent liveness checks.
