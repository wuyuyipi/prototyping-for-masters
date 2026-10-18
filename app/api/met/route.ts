import { NextRequest, NextResponse } from "next/server";
import {
  MET_WEATHER_MASTERWORKS,
  MetArtworkData,
  resolveWeatherArtCategory,
} from "@/app/prototypes/weather/metArtworks";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const requestedId = searchParams.get("id");
  const condition = searchParams.get("condition") || "";
  const tempF = searchParams.get("temp") ? parseFloat(searchParams.get("temp")!) : undefined;

  const category = resolveWeatherArtCategory(condition, tempF);
  const categoryMasterworks = MET_WEATHER_MASTERWORKS[category];

  // If a specific ID is requested, look for it in curated works or fetch from Met API
  if (requestedId) {
    const idNum = parseInt(requestedId, 10);
    const existing = Object.values(MET_WEATHER_MASTERWORKS)
      .flat()
      .find((item) => item.objectID === idNum);

    if (existing) {
      return NextResponse.json({
        success: true,
        source: "curated",
        data: existing,
        apiDocsUrl: "https://metmuseum.github.io",
      });
    }

    // Try fetching directly from The Met Public API
    try {
      const metRes = await fetch(`https://collectionapi.metmuseum.org/public/collection/v1/objects/${idNum}`, {
        next: { revalidate: 86400 }, // Cache 24h
      });

      if (metRes.ok) {
        const metJson = await metRes.json();
        if (metJson && metJson.objectID) {
          const liveData: MetArtworkData = {
            objectID: metJson.objectID,
            title: metJson.title || "Untitled Artwork",
            artistDisplayName: metJson.artistDisplayName || "Unknown Artist",
            artistDisplayBio: metJson.artistDisplayBio || "",
            objectDate: metJson.objectDate || "Undated",
            medium: metJson.medium || "Mixed media",
            dimensions: metJson.dimensions || "",
            department: metJson.department || "The Met Collection",
            primaryImage: metJson.primaryImage || metJson.primaryImageSmall || "",
            primaryImageSmall: metJson.primaryImageSmall || metJson.primaryImage || "",
            objectURL: metJson.objectURL || `https://www.metmuseum.org/art/collection/search/${metJson.objectID}`,
            creditLine: metJson.creditLine || "",
            weatherConditionCategory: category,
            weatherMood: `Met Masterpiece for ${condition || "Current Weather"}`,
            curatorialNote: `Curated from The Met's permanent collection to reflect current ${condition || "atmospheric"} conditions.`,
          };

          return NextResponse.json({
            success: true,
            source: "met_api_live",
            data: liveData,
            apiDocsUrl: "https://metmuseum.github.io",
          });
        }
      }
    } catch {
      // Fall through to curated fallback
    }
  }

  // Return the best match from curated artworks
  const selectedIndex = searchParams.get("index")
    ? parseInt(searchParams.get("index")!, 10) % categoryMasterworks.length
    : 0;
  const selected = categoryMasterworks[selectedIndex >= 0 ? selectedIndex : 0];

  return NextResponse.json({
    success: true,
    source: "curated",
    category,
    allForCategory: categoryMasterworks,
    data: selected,
    apiDocsUrl: "https://metmuseum.github.io",
  });
}
