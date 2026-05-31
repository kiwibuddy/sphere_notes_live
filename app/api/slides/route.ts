import { NextRequest, NextResponse } from "next/server";
import { discoverSlides } from "@/lib/slides/discover";

export async function GET(request: NextRequest) {
  const dayParam = request.nextUrl.searchParams.get("day");
  const day = parseInt(dayParam ?? "1", 10);

  if (!Number.isFinite(day) || day < 1 || day > 7) {
    return NextResponse.json({ error: "Invalid day" }, { status: 400 });
  }

  return NextResponse.json(discoverSlides(day));
}
