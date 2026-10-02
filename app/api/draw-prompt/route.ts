import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const prompt = body?.prompt;

    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return NextResponse.json({ error: "Missing or invalid prompt" }, { status: 400 });
    }

    const cleanPrompt = prompt.trim();
    let imageUrl: string | null = null;

    // 1. First attempt: Search Wikipedia for a real reference image
    try {
      const wikiUrl = `https://en.wikipedia.org/w/api.php?action=query&format=json&generator=search&gsrsearch=${encodeURIComponent(
        cleanPrompt
      )}&gsrlimit=3&prop=pageimages&piprop=thumbnail&pithumbsize=600`;

      const wikiRes = await fetch(wikiUrl, {
        headers: { "User-Agent": "DoodleCreator/1.0 (Educational Workshop)" },
      });

      if (wikiRes.ok) {
        const wikiData = await wikiRes.json();
        const pages = wikiData.query?.pages ? Object.values(wikiData.query.pages) : [];
        const match = pages.find((p: any) => p.thumbnail?.source) as any;
        if (match?.thumbnail?.source) {
          imageUrl = match.thumbnail.source;
        }
      }
    } catch (e) {
      console.warn("Wikipedia image lookup fallback:", e);
    }

    // 2. Second attempt: If Wikipedia didn't have an image, fetch clean reference image
    if (!imageUrl) {
      const seed = Math.floor(Math.random() * 1000000);
      imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(
        "simple clean clear isolated illustration of " + cleanPrompt + " on plain white background, centered, high contrast"
      )}?width=600&height=400&nologo=true&seed=${seed}`;
    }

    // 12-second timeout controller
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    const res = await fetch(imageUrl, {
      signal: controller.signal,
      headers: {
        Accept: "image/*",
      },
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      return NextResponse.json(
        { success: false, error: `Image fetch responded with status ${res.status}` },
        { status: 502 }
      );
    }

    const buffer = await res.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    const mimeType = res.headers.get("content-type") || "image/jpeg";
    const dataUrl = `data:${mimeType};base64,${base64}`;

    return NextResponse.json({
      success: true,
      image: dataUrl,
      prompt: cleanPrompt,
    });
  } catch (err: any) {
    console.warn("Reference image search error:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to search reference image" },
      { status: 500 }
    );
  }
}
