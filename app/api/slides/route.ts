import { NextResponse } from "next/server";
import { discoverSlides } from "@/lib/slides/discover";

export async function GET() {
  return NextResponse.json(discoverSlides());
}
