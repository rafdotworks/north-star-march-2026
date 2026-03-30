/**
 * ============================================================================
 * ME API ROUTE - app/api/me/route.ts
 * ============================================================================
 *
 * Agent-facing canonical identity endpoint. Returns who Raf is, location,
 * contact, principles, and pointers to writings. Reuses existing config only.
 *
 * ENDPOINT: GET /api/me
 *
 * RESPONSE: JSON with name, bio, location, contact, principles, writings, site.
 * CACHE: 60s (Cache-Control) so agents can cache safely.
 */

import { NextResponse } from "next/server";
import { ABOUT_MODAL_CONTENT } from "@/app/config/aboutModalConfig";
import { CONTACT_LINKS } from "@/app/config/contactLinks";
import { getCurrentLocation } from "@/app/config/locationConfig";
import { writings, personalNotes } from "@/app/config/writingsConfig";
import { stripAboutCopyTokens } from "@/app/lib/aboutCopyTokens";

const CACHE_MAX_AGE_SECONDS = 60;
const SITE_URL = "https://raf.works";

/**
 * Build a short plain-text bio from the first highlighted paragraph in
 * Origins or Craft (no HTML or placeholders).
 */
function getBio(): string {
  for (const section of ABOUT_MODAL_CONTENT.sections) {
    const highlighted = section.paragraphs.find((p) => p.isHighlighted && p.text);
    if (highlighted?.text) {
      return stripAboutCopyTokens(highlighted.text)
        .replace(/<[^>]+>/g, "")
        .replace(/\s+/g, " ")
        .trim();
    }
  }
  return "";
}

export async function GET() {
  try {
    const location = getCurrentLocation();
    const bio = getBio();

    const body = {
      name: "Raf",
      bio,
      location: {
        city: location.city,
        timezone: location.timezone,
      },
      contact: {
        email: CONTACT_LINKS.email.href.replace(/^mailto:/i, ""),
        linkedin: CONTACT_LINKS.linkedin.href,
        x: CONTACT_LINKS.x.href,
      },
      principles: ABOUT_MODAL_CONTENT.principles,
      writings: [
        ...writings.map((w) => ({ id: w.id, title: w.title })),
        ...personalNotes.map((w) => ({ id: w.id, title: w.title })),
      ],
      site: SITE_URL,
    };

    return NextResponse.json(body, {
      headers: {
        "Cache-Control": `public, max-age=${CACHE_MAX_AGE_SECONDS}`,
      },
    });
  } catch (error) {
    console.error("Error in /api/me:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load identity" },
      { status: 500 }
    );
  }
}
