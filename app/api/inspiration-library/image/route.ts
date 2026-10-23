import { NextRequest } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getPool } from "@/lib/db";
import { getImageStreamFromStorage, isStorageConfigured } from "@/lib/storage";

export const dynamic = "force-dynamic";

/**
 * Streams private images from Supabase Storage to authorized viewers.
 *
 * Rules:
 * - Public boards: anyone with the link can view the image.
 * - Private boards: only the owner of the board can view the image. Returns 404 for non-owners.
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const path = searchParams.get("path");

  if (!path) {
    return new Response("Missing path parameter", { status: 400 });
  }

  if (!isStorageConfigured()) {
    return new Response("Storage not configured", { status: 503 });
  }

  try {
    const pool = getPool();
    const query = `
      SELECT i.id, i.image_url, i.board_id, b.user_id as board_owner_id, b.is_public
      FROM items i
      JOIN boards b ON b.id = i.board_id
      WHERE i.image_url = $1;
    `;
    const result = await pool.query(query, [path]);

    if (result.rows.length === 0) {
      return new Response("Image not found", { status: 404 });
    }

    const item = result.rows[0];

    // Privacy rule check:
    // If board is private, verify user is the owner
    if (!item.is_public) {
      const headerList = await headers();
      const session = await auth.api.getSession({
        headers: headerList,
      });

      if (!session?.user?.id || session.user.id !== item.board_owner_id) {
        // Return 404 as required by privacy rule for private boards
        return new Response("Not found", { status: 404 });
      }
    }

    // Fetch the private object from Supabase Storage
    const storageRes = await getImageStreamFromStorage(path);

    if (!storageRes.ok || !storageRes.body) {
      return new Response("File not found in storage", {
        status: storageRes.status || 404,
      });
    }

    const contentType =
      storageRes.headers.get("content-type") || "application/octet-stream";

    return new Response(storageRes.body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": item.is_public
          ? "public, max-age=86400, stale-while-revalidate=3600"
          : "private, max-age=3600",
      },
    });
  } catch (error) {
    console.error("Error serving image:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
