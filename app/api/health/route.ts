/**
 * ============================================================================
 * HEALTH API ROUTE - app/api/health/route.ts
 * ============================================================================
 *
 * Liveness check for agents and monitors. No config or external calls.
 *
 * ENDPOINT: GET /api/health
 * RESPONSE: 200 with { status: "ok", timestamp: ISO8601 }
 */

import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
}
