import { NextRequest, NextResponse } from "next/server";
import { Client } from "@notionhq/client";

interface BookItem {
  id: string;
  title: string;
  author: string;
  genre: {
    name: string;
    color: string;
  } | null;
  coverImage: string | null;
  rating: number | null;
  review: string;
  notionUrl?: string;
  lastEditedTime?: string;
}

// Realistic curated sample books matching the exact 6 database properties:
// Title, Author, Genre (Single select), Cover Image, Rating (Number), Review
const SAMPLE_BOOKS: BookItem[] = [
  {
    id: "sample-1",
    title: "The Design of Everyday Things",
    author: "Don Norman",
    genre: { name: "Design", color: "blue" },
    coverImage: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=700&q=80",
    rating: 5,
    review: "An absolute foundational classic for any designer. Norman transforms how you see doors, teapots, light switches, and digital interfaces. The concept of affordances and signifiers permanently alters how you perceive human-machine interaction.",
    notionUrl: "https://notion.so",
    lastEditedTime: "2026-10-15T14:30:00.000Z",
  },
  {
    id: "sample-2",
    title: "Exhalation: Stories",
    author: "Ted Chiang",
    genre: { name: "Sci-Fi", color: "purple" },
    coverImage: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=700&q=80",
    rating: 5,
    review: "Nine astonishingly deep philosophical speculative fiction novellas. 'The Merchant and the Alchemist's Gate' and 'Anxiety Is the Dizziness of Freedom' explore free will, entropy, and memory with emotional resonance that stayed with me for weeks.",
    notionUrl: "https://notion.so",
    lastEditedTime: "2026-10-12T09:15:00.000Z",
  },
  {
    id: "sample-3",
    title: "Grid Systems in Graphic Design",
    author: "Josef Müller-Brockmann",
    genre: { name: "Design", color: "blue" },
    coverImage: "https://images.unsplash.com/photo-1507842229451-7f01be8610ce?auto=format&fit=crop&w=700&q=80",
    rating: 4.8,
    review: "The definitive Swiss typographic bible. Demonstrates the mathematical rigor, visual harmony, and structural rhythm behind 8-field, 20-field, and 32-field modular grid systems.",
    notionUrl: "https://notion.so",
    lastEditedTime: "2026-10-08T18:40:00.000Z",
  },
  {
    id: "sample-4",
    title: "Klara and the Sun",
    author: "Kazuo Ishiguro",
    genre: { name: "Fiction", color: "orange" },
    coverImage: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=700&q=80",
    rating: 4.5,
    review: "A poignant, tender, and unsettling tale told from the perspective of an Artificial Friend. Ishiguro investigates whether the human heart contains something uniquely irreplaceable that an algorithm can never replicate.",
    notionUrl: "https://notion.so",
    lastEditedTime: "2026-09-28T11:20:00.000Z",
  },
  {
    id: "sample-5",
    title: "Atomic Habits",
    author: "James Clear",
    genre: { name: "Non-Fiction", color: "green" },
    coverImage: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=700&q=80",
    rating: 4.5,
    review: "Extremely practical and structured breakdown of compounding incremental improvements. The four laws of behavior change (make it obvious, attractive, easy, and satisfying) are immediately actionable.",
    notionUrl: "https://notion.so",
    lastEditedTime: "2026-09-15T16:00:00.000Z",
  },
  {
    id: "sample-6",
    title: "Invisible Cities",
    author: "Italo Calvino",
    genre: { name: "Philosophy", color: "pink" },
    coverImage: "https://images.unsplash.com/photo-1476275466078-4007374efbbe?auto=format&fit=crop&w=700&q=80",
    rating: 5,
    review: "Marco Polo describes fifty-five imaginary cities to Kublai Khan. A poetic meditation on urban memory, semiotics, desire, architectural spaces, and the nature of human longing.",
    notionUrl: "https://notion.so",
    lastEditedTime: "2026-08-30T20:10:00.000Z",
  },
  {
    id: "sample-7",
    title: "Thinking, Fast and Slow",
    author: "Daniel Kahneman",
    genre: { name: "Psychology", color: "yellow" },
    coverImage: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=700&q=80",
    rating: 4.2,
    review: "A masterwork on cognitive biases, heuristics, System 1 intuition vs. System 2 deliberation, prospect theory, and loss aversion. Invaluable for understanding decision-making and product friction.",
    notionUrl: "https://notion.so",
    lastEditedTime: "2026-08-14T10:00:00.000Z",
  },
  {
    id: "sample-8",
    title: "Speculative Everything",
    author: "Anthony Dunne & Fiona Raby",
    genre: { name: "Design", color: "blue" },
    coverImage: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=700&q=80",
    rating: 4.7,
    review: "Critical and speculative design manifestos exploring how design can act as a catalyst for collective debate rather than mere market consumption. Essential reading for design prototyping workshops.",
    notionUrl: "https://notion.so",
    lastEditedTime: "2026-07-22T17:45:00.000Z",
  },
];

/**
 * Extracts a normalized 32-character or hyphenated UUID from a Notion URL or raw ID string.
 */
function extractNotionId(input: string): string {
  if (!input) return "";
  const cleaned = input.trim();

  // If a full Notion URL is pasted, extract the 32 hex chars before query params
  const urlMatch = cleaned.match(/([a-f0-9]{32})/i);
  if (urlMatch) {
    const raw = urlMatch[1];
    return `${raw.slice(0, 8)}-${raw.slice(8, 12)}-${raw.slice(12, 16)}-${raw.slice(16, 20)}-${raw.slice(20)}`;
  }

  // Already standard UUID format
  const uuidMatch = cleaned.match(/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/i);
  if (uuidMatch) {
    return uuidMatch[0];
  }

  return cleaned;
}

/**
 * Helper to extract property value irrespective of casing.
 */
function findProperty(properties: Record<string, any>, candidateNames: string[]): any {
  const keys = Object.keys(properties);
  for (const name of candidateNames) {
    const matchedKey = keys.find((k) => k.trim().toLowerCase() === name.toLowerCase());
    if (matchedKey && properties[matchedKey]) {
      return properties[matchedKey];
    }
  }
  return null;
}

/**
 * Parses a single Notion page into a typed BookItem matching the 6 properties.
 */
function parseBookPage(page: any): BookItem {
  const properties = page.properties || {};

  // 1. Title: check property named 'Title' / 'Name' or any property with type === 'title'
  let title = "Untitled Book";
  const titleProp =
    findProperty(properties, ["Title", "Book Title", "Name"]) ||
    Object.values(properties).find((p: any) => p && p.type === "title");

  if (titleProp && titleProp.title && Array.isArray(titleProp.title)) {
    const rawTitle = titleProp.title.map((t: any) => t.plain_text || "").join("").trim();
    if (rawTitle) title = rawTitle;
  }

  // 2. Author: check property named 'Author' / 'Writer' / 'By'
  let author = "Unknown Author";
  const authorProp = findProperty(properties, ["Author", "author", "Writer", "writer", "By", "by"]);
  if (authorProp) {
    if (authorProp.type === "rich_text" && Array.isArray(authorProp.rich_text)) {
      const parsed = authorProp.rich_text.map((t: any) => t.plain_text || "").join("").trim();
      if (parsed) author = parsed;
    } else if (authorProp.type === "select" && authorProp.select?.name) {
      author = authorProp.select.name;
    } else if (authorProp.type === "multi_select" && Array.isArray(authorProp.multi_select)) {
      author = authorProp.multi_select.map((m: any) => m.name).join(", ");
    } else if (authorProp.type === "people" && Array.isArray(authorProp.people)) {
      author = authorProp.people.map((p: any) => p.name || "Unknown").join(", ");
    }
  }

  // 3. Genre: Single select
  let genre: { name: string; color: string } | null = null;
  const genreProp = findProperty(properties, ["Genre", "genre", "Category", "category"]);
  if (genreProp) {
    if (genreProp.type === "select" && genreProp.select?.name) {
      genre = {
        name: genreProp.select.name,
        color: genreProp.select.color || "default",
      };
    } else if (genreProp.type === "multi_select" && Array.isArray(genreProp.multi_select) && genreProp.multi_select.length > 0) {
      genre = {
        name: genreProp.multi_select[0].name,
        color: genreProp.multi_select[0].color || "default",
      };
    }
  }

  // 4. Cover Image: Files property, URL property, or top-level page cover
  let coverImage: string | null = null;
  const coverProp = findProperty(properties, ["Cover Image", "Cover", "cover", "Image", "image", "CoverImage"]);
  if (coverProp) {
    if (coverProp.type === "files" && Array.isArray(coverProp.files) && coverProp.files.length > 0) {
      const fileObj = coverProp.files[0];
      if (fileObj.file?.url) {
        coverImage = fileObj.file.url;
      } else if (fileObj.external?.url) {
        coverImage = fileObj.external.url;
      }
    } else if (coverProp.type === "url" && coverProp.url) {
      coverImage = coverProp.url;
    }
  }

  // Fallback to page cover if property was empty
  if (!coverImage && page.cover) {
    if (page.cover.type === "external" && page.cover.external?.url) {
      coverImage = page.cover.external.url;
    } else if (page.cover.type === "file" && page.cover.file?.url) {
      coverImage = page.cover.file.url;
    }
  }

  // 5. Rating: Number
  let rating: number | null = null;
  const ratingProp = findProperty(properties, ["Rating", "rating", "Score", "score", "Stars"]);
  if (ratingProp) {
    if (ratingProp.type === "number" && typeof ratingProp.number === "number") {
      rating = ratingProp.number;
    } else if (ratingProp.type === "select" && ratingProp.select?.name) {
      const parsedNum = parseFloat(ratingProp.select.name);
      if (!isNaN(parsedNum)) {
        rating = parsedNum;
      } else {
        // Count stars if formatted like '★★★★'
        const stars = (ratingProp.select.name.match(/★/g) || []).length;
        if (stars > 0) rating = stars;
      }
    }
  }

  // 6. Review: Rich text
  let review = "";
  const reviewProp = findProperty(properties, ["Review", "review", "Notes", "notes", "Thoughts", "thoughts", "Summary"]);
  if (reviewProp && reviewProp.type === "rich_text" && Array.isArray(reviewProp.rich_text)) {
    review = reviewProp.rich_text.map((t: any) => t.plain_text || "").join("").trim();
  }

  return {
    id: page.id,
    title,
    author,
    genre,
    coverImage,
    rating,
    review,
    notionUrl: page.url,
    lastEditedTime: page.last_edited_time || page.created_time,
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  // Allow credentials from environment variables OR request headers/query params
  const apiKey =
    request.headers.get("x-notion-api-key") ||
    searchParams.get("api_key") ||
    process.env.NOTION_API_KEY ||
    process.env.NOTION_TOKEN;

  const rawDatabaseId =
    request.headers.get("x-notion-database-id") ||
    searchParams.get("database_id") ||
    process.env.NOTION_DATABASE_ID ||
    process.env.NOTION_DATA_SOURCE_ID;

  // If no credentials supplied yet, return demo mock data gracefully
  if (!apiKey || !apiKey.trim() || !rawDatabaseId || !rawDatabaseId.trim()) {
    return NextResponse.json({
      success: true,
      isDemo: true,
      message: "Showing sample bookshelf data. Provide NOTION_API_KEY and NOTION_DATABASE_ID in .env.local or UI to connect live.",
      configuredKey: Boolean(apiKey && apiKey.trim()),
      configuredDb: Boolean(rawDatabaseId && rawDatabaseId.trim()),
      books: SAMPLE_BOOKS,
      databaseTitle: "My Bookshelf (Preview Demo)",
    });
  }

  const cleanedId = extractNotionId(rawDatabaseId);

  try {
    const notion = new Client({
      auth: apiKey.trim(),
    });

    let rawResults: any[] = [];
    let databaseTitle = "My Bookshelf";

    // Latest Notion SDK v5+ uses dataSources.query.
    // 1. First retrieve the database container to discover data sources & title
    let resolvedDataSourceId: string | null = null;

    // In Notion API v2025-09-03+, IDs can be a direct data_source_id or a database container.
    // 1. Try dataSources.retrieve first
    try {
      const dsResponse: any = await notion.dataSources.retrieve({
        data_source_id: cleanedId,
      });

      if (dsResponse && Array.isArray(dsResponse.title)) {
        const titleStr = dsResponse.title.map((t: any) => t.plain_text || "").join("").trim();
        if (titleStr) databaseTitle = titleStr;
      }
      resolvedDataSourceId = cleanedId;
    } catch (_) {
      // 2. If dataSources.retrieve fails, attempt databases.retrieve
      try {
        const dbResponse: any = await notion.databases.retrieve({
          database_id: cleanedId,
        });

        if (dbResponse && Array.isArray(dbResponse.title)) {
          const titleStr = dbResponse.title.map((t: any) => t.plain_text || "").join("").trim();
          if (titleStr) databaseTitle = titleStr;
        }

        if (dbResponse && Array.isArray(dbResponse.data_sources) && dbResponse.data_sources.length > 0) {
          resolvedDataSourceId = dbResponse.data_sources[0].id;
        }
      } catch (dbErr: any) {
        // If both throw, we still try querying with cleanedId as fallback
      }
    }

    const targetQueryId = resolvedDataSourceId || cleanedId;

    // 2. Query the data source
    try {
      const queryResponse = await notion.dataSources.query({
        data_source_id: targetQueryId,
        page_size: 100,
      });
      rawResults = queryResponse.results || [];
    } catch (queryErr: any) {
      // Fallback: If dataSources.query fails and old database query exists on client
      if (typeof (notion.databases as any).query === "function") {
        const legacyResponse = await (notion.databases as any).query({
          database_id: cleanedId,
          page_size: 100,
        });
        rawResults = legacyResponse.results || [];
      } else {
        throw queryErr;
      }
    }

    // Parse returned pages
    const books: BookItem[] = rawResults
      .filter((item: any) => item.object === "page")
      .map(parseBookPage);

    return NextResponse.json({
      success: true,
      isDemo: false,
      databaseTitle,
      totalCount: books.length,
      books,
    });
  } catch (error: any) {
    console.error("Notion API Error:", error);

    let friendlyMessage = error.message || "Failed to fetch Notion database.";
    let suggestion = "Double check your Notion integration token and database sharing permissions.";

    if (error.code === "unauthorized" || error.status === 401) {
      friendlyMessage = "Invalid or expired Notion API key / token.";
      suggestion = "Ensure your integration token begins with 'ntn_' or 'secret_' and has not been revoked.";
    } else if (error.code === "object_not_found" || error.status === 404) {
      friendlyMessage = "Database not found or access not granted.";
      suggestion =
        "Make sure you shared your Notion database with your integration. In Notion, click '...' in the top right of your database, select 'Connect to', and choose your integration.";
    } else if (error.code === "validation_error") {
      friendlyMessage = "Notion validation error: check database ID formatting.";
      suggestion = "The database ID should be the 32-character string from the database link.";
    }

    return NextResponse.json(
      {
        success: false,
        isDemo: true,
        error: friendlyMessage,
        suggestion,
        code: error.code || "API_ERROR",
        status: error.status || 500,
        fallbackBooks: SAMPLE_BOOKS,
      },
      { status: 200 } // return 200 with error details so UI displays friendly diagnostics instead of a generic network 500
    );
  }
}
