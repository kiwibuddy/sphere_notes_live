import { NextResponse } from "next/server";
import { discoverSlides } from "@/lib/slides/discover";

/** Re-scan public/slides on every request (never bake the deck list at build time). */
export const dynamic = "force-dynamic";

export async function GET() {
  const body = discoverSlides();
  return NextResponse.json(body, {
    headers: {
      "Cache-Control": "no-store, max-age=0",
    },
  });
}
