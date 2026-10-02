import { NextRequest, NextResponse } from "next/server";

async function fetchImageBuffer(url: string, timeoutMs = 8000): Promise<{ buffer: Buffer; mimeType: string } | null> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "image/*,*/*;q=0.8",
      },
    });
    clearTimeout(timer);
    if (!res.ok) return null;
    const contentType = res.headers.get("content-type") || "image/jpeg";
    const arrayBuf = await res.arrayBuffer();
    if (arrayBuf.byteLength < 500) return null; // Skip tiny dummy/corrupt files
    return { buffer: Buffer.from(arrayBuf), mimeType: contentType };
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const prompt = body?.prompt;

    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return NextResponse.json({ error: "Missing or invalid prompt" }, { status: 400 });
    }

    const cleanPrompt = prompt.trim();
    let imgData: { buffer: Buffer; mimeType: string } | null = null;

    // 1. Primary Attempt: Search DuckDuckGo for high-contrast isolated images of the subject
    try {
      const queries = [
        `${cleanPrompt} clipart isolated white background`,
        `${cleanPrompt} vector isolated`,
        cleanPrompt,
      ];

      for (const q of queries) {
        if (imgData) break;
        const tokenRes = await fetch(
          `https://duckduckgo.com/?q=${encodeURIComponent(q)}&t=h_&iax=images&ia=images`,
          {
            headers: {
              "User-Agent":
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            },
          }
        );
        if (!tokenRes.ok) continue;
        const tokenHtml = await tokenRes.text();
        const vqdMatch = tokenHtml.match(/vqd=([^&"'\s]+)/) || tokenHtml.match(/vqd="([^"]+)"/);
        if (!vqdMatch) continue;

        const vqd = vqdMatch[1];
        const searchUrl = `https://duckduckgo.com/i.js?l=us-en&o=json&q=${encodeURIComponent(
          q
        )}&vqd=${vqd}&f=,,,&p=1`;
        const searchRes = await fetch(searchUrl, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          },
        });
        if (!searchRes.ok) continue;
        const resultsData = await searchRes.json();
        const results = resultsData?.results || [];

        // Try top 4 candidates in case some host blocks direct downloads
        for (let i = 0; i < Math.min(4, results.length); i++) {
          const candidateUrl = results[i]?.image;
          if (!candidateUrl) continue;
          const fetched = await fetchImageBuffer(candidateUrl, 6000);
          if (fetched) {
            imgData = fetched;
            break;
          }
        }
      }
    } catch (e) {
      console.warn("DuckDuckGo image search error:", e);
    }

    // 2. Secondary Attempt: Wikimedia Commons / Wikipedia API
    if (!imgData) {
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
            imgData = await fetchImageBuffer(match.thumbnail.source, 6000);
          }
        }
      } catch (e) {
        console.warn("Wikipedia fallback error:", e);
      }
    }

    // 3. Third Attempt: Clean isolated reference illustration on white background
    if (!imgData) {
      try {
        const seed = Math.floor(Math.random() * 1000000);
        const pollUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(
          "simple clean clear isolated illustration of " +
            cleanPrompt +
            " on plain white background, centered, high contrast, vibrant colors"
        )}?width=600&height=400&nologo=true&seed=${seed}`;

        imgData = await fetchImageBuffer(pollUrl, 10000);
      } catch (e) {
        console.warn("Clean illustration fallback error:", e);
      }
    }

    if (!imgData) {
      return NextResponse.json(
        { success: false, error: "Could not retrieve reference image for prompt" },
        { status: 502 }
      );
    }

    const base64 = imgData.buffer.toString("base64");
    const dataUrl = `data:${imgData.mimeType};base64,${base64}`;

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
