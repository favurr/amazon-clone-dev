import { NextRequest, NextResponse } from "next/server";
import { getSearchSuggestions } from "@/actions/search";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q") || "";

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ suggestions: [] });
    }

    const suggestions = await getSearchSuggestions(query);

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error("Search suggestions API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch suggestions" },
      { status: 500 }
    );
  }
}
