"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { getPool, isDatabaseConfigured } from "@/lib/db";
import {
  uploadImageToStorage,
  deleteImageFromStorage,
  deleteImagesFromStorage,
  isStorageConfigured,
} from "@/lib/storage";
import type { Board, Item, BoardWithItems } from "./types";

/**
 * Helper to securely get the authenticated session from request headers.
 */
export async function getServerSession() {
  try {
    const headerList = await headers();
    const session = await auth.api.getSession({
      headers: headerList,
    });
    return session;
  } catch (error) {
    console.error("Error retrieving session:", error);
    return null;
  }
}

/**
 * Fetch all boards belonging to the authenticated user.
 */
export async function getMyBoards(): Promise<{
  boards: Board[];
  error?: string;
  isDbConfigured: boolean;
}> {
  if (!isDatabaseConfigured()) {
    return {
      boards: [],
      error: "DATABASE_URL is not set. Please add your Supabase connection string to .env.local.",
      isDbConfigured: false,
    };
  }

  const session = await getServerSession();
  if (!session?.user?.id) {
    return { boards: [], error: "Not authenticated", isDbConfigured: true };
  }

  const pool = getPool();
  try {
    const query = `
      SELECT 
        b.id,
        b.user_id,
        b.title,
        b.description,
        b.is_public,
        b.created_at,
        COUNT(i.id)::int AS item_count
      FROM boards b
      LEFT JOIN items i ON i.board_id = b.id
      WHERE b.user_id = $1
      GROUP BY b.id
      ORDER BY b.created_at DESC;
    `;
    const result = await pool.query(query, [session.user.id]);
    return { boards: result.rows, isDbConfigured: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Database error";
    console.error("Failed to fetch boards:", err);
    return {
      boards: [],
      error: message.includes("relation \"boards\" does not exist")
        ? "The 'boards' table does not exist in your database yet. Run the schema.sql script in Supabase SQL editor."
        : `Database error: ${message}`,
      isDbConfigured: true,
    };
  }
}

/**
 * Create a new board for the authenticated user.
 */
export async function createBoardAction(formData: FormData): Promise<{
  success: boolean;
  board?: Board;
  error?: string;
}> {
  if (!isDatabaseConfigured()) {
    return { success: false, error: "Database is not configured yet." };
  }

  const session = await getServerSession();
  if (!session?.user?.id) {
    return { success: false, error: "You must be signed in to create a board." };
  }

  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || null;
  const isPublic = formData.get("is_public") === "true";

  if (!title) {
    return { success: false, error: "Board title is required." };
  }

  const pool = getPool();
  try {
    const query = `
      INSERT INTO boards (user_id, title, description, is_public)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const result = await pool.query(query, [session.user.id, title, description, isPublic]);
    revalidatePath("/prototypes/inspiration-library");
    return { success: true, board: result.rows[0] };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create board";
    console.error("Error creating board:", err);
    return { success: false, error: message };
  }
}

/**
 * Update an existing board's details (owner only).
 */
export async function updateBoardAction(
  boardId: string,
  formData: FormData
): Promise<{
  success: boolean;
  error?: string;
}> {
  if (!isDatabaseConfigured()) {
    return { success: false, error: "Database is not configured." };
  }

  const session = await getServerSession();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized." };
  }

  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || null;
  const isPublic = formData.get("is_public") === "true";

  if (!title) {
    return { success: false, error: "Board title is required." };
  }

  const pool = getPool();
  try {
    const query = `
      UPDATE boards
      SET title = $3, description = $4, is_public = $5
      WHERE id = $1 AND user_id = $2
      RETURNING id;
    `;
    const result = await pool.query(query, [boardId, session.user.id, title, description, isPublic]);
    if (result.rowCount === 0) {
      return { success: false, error: "Board not found or you do not have permission." };
    }
    revalidatePath(`/prototypes/inspiration-library/boards/${boardId}`);
    revalidatePath("/prototypes/inspiration-library");
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update board";
    return { success: false, error: message };
  }
}

/**
 * Delete a board and all its items (owner only).
 * Also cleans up any uploaded images from Supabase Storage.
 */
export async function deleteBoardAction(boardId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  if (!isDatabaseConfigured()) {
    return { success: false, error: "Database is not configured." };
  }

  const session = await getServerSession();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized." };
  }

  const pool = getPool();
  try {
    // 1. Find all items with storage images to clean up
    const itemsResult = await pool.query(
      `SELECT image_url FROM items WHERE board_id = $1 AND user_id = $2;`,
      [boardId, session.user.id]
    );

    const storagePaths = itemsResult.rows
      .map((row) => row.image_url)
      .filter(
        (url): url is string =>
          Boolean(url && !url.startsWith("http://") && !url.startsWith("https://"))
      );

    if (storagePaths.length > 0) {
      await deleteImagesFromStorage(storagePaths);
    }

    // 2. Delete board (foreign key cascades to items)
    const query = `
      DELETE FROM boards
      WHERE id = $1 AND user_id = $2;
    `;
    const result = await pool.query(query, [boardId, session.user.id]);
    if (result.rowCount === 0) {
      return { success: false, error: "Board not found or you do not have permission." };
    }
    revalidatePath("/prototypes/inspiration-library");
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete board";
    return { success: false, error: message };
  }
}

/**
 * Fetch a single board and its items with strict privacy rules:
 * - Private boards: visible ONLY to the owner.
 * - Public boards: visible to anyone, but without editing capabilities for non-owners.
 */
export async function getBoardAndItems(boardId: string): Promise<{
  data?: BoardWithItems;
  notFound?: boolean;
  error?: string;
  isDbConfigured: boolean;
}> {
  if (!isDatabaseConfigured()) {
    return {
      notFound: false,
      error: "DATABASE_URL is not set. Please add your Supabase connection string to .env.local.",
      isDbConfigured: false,
    };
  }

  const session = await getServerSession();
  const currentUserId = session?.user?.id ?? null;
  const pool = getPool();

  try {
    // 1. Fetch the board
    const boardQuery = `
      SELECT b.*, u.name as owner_name
      FROM boards b
      LEFT JOIN "user" u ON u.id = b.user_id
      WHERE b.id = $1;
    `;
    const boardResult = await pool.query(boardQuery, [boardId]);

    if (boardResult.rows.length === 0) {
      return { notFound: true, isDbConfigured: true };
    }

    const board: Board = boardResult.rows[0];
    const isOwner = currentUserId !== null && board.user_id === currentUserId;

    // Strict privacy rule:
    // Private boards are only visible to their owner. If someone else visits, show not found.
    if (!board.is_public && !isOwner) {
      return { notFound: true, isDbConfigured: true };
    }

    // 2. Fetch items for this board
    const itemsQuery = `
      SELECT *
      FROM items
      WHERE board_id = $1
      ORDER BY created_at DESC;
    `;
    const itemsResult = await pool.query(itemsQuery, [boardId]);

    return {
      data: {
        board,
        items: itemsResult.rows,
        isOwner,
      },
      notFound: false,
      isDbConfigured: true,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Database error";
    console.error("Error fetching board:", err);
    return {
      notFound: false,
      error: message.includes("relation \"boards\" does not exist")
        ? "The 'boards' table does not exist in your database yet. Run the schema.sql script in Supabase SQL editor."
        : `Database error: ${message}`,
      isDbConfigured: true,
    };
  }
}

/**
 * Add an item to a board (owner only).
 * Supports uploading an image from computer (stored in private Supabase Storage bucket)
 * or providing an external image URL.
 * Saves only the relative file path in the items table when uploaded.
 */
export async function createItemAction(
  boardId: string,
  formData: FormData
): Promise<{
  success: boolean;
  item?: Item;
  error?: string;
}> {
  if (!isDatabaseConfigured()) {
    return { success: false, error: "Database is not configured." };
  }

  const session = await getServerSession();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized. Please sign in." };
  }

  const title = (formData.get("title") as string)?.trim();
  const rawImageUrl = (formData.get("image_url") as string)?.trim() || null;
  const linkUrl = (formData.get("link_url") as string)?.trim() || null;
  const note = (formData.get("note") as string)?.trim() || null;
  const imageFile = formData.get("image_file") as File | null;

  if (!title) {
    return { success: false, error: "Item title is required." };
  }

  const pool = getPool();
  try {
    // Verify board ownership first
    const ownershipCheck = await pool.query(
      `SELECT id FROM boards WHERE id = $1 AND user_id = $2;`,
      [boardId, session.user.id]
    );

    if (ownershipCheck.rowCount === 0) {
      return { success: false, error: "Only the owner can add items to this board." };
    }

    let finalImagePath: string | null = rawImageUrl;

    // Handle local file upload to private Supabase Storage bucket
    if (imageFile && imageFile.size > 0) {
      if (!isStorageConfigured()) {
        return {
          success: false,
          error:
            "Supabase Storage is not configured yet. Please add SUPABASE_SERVICE_ROLE_KEY to your .env.local file (found in Supabase Dashboard > Project Settings > API).",
        };
      }

      // Check max size (10MB)
      if (imageFile.size > 10 * 1024 * 1024) {
        return { success: false, error: "Image file is too large. Maximum size is 10MB." };
      }

      const arrayBuffer = await imageFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Upload and retrieve relative path
      const uploadResult = await uploadImageToStorage({
        userId: session.user.id,
        boardId,
        filename: imageFile.name,
        buffer,
        mimeType: imageFile.type || "image/jpeg",
      });

      // Save ONLY the relative storage file path in the items table
      finalImagePath = uploadResult.path;
    }

    const insertQuery = `
      INSERT INTO items (board_id, user_id, image_url, link_url, title, note)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;
    const result = await pool.query(insertQuery, [
      boardId,
      session.user.id,
      finalImagePath,
      linkUrl,
      title,
      note,
    ]);

    revalidatePath(`/prototypes/inspiration-library/boards/${boardId}`);
    revalidatePath("/prototypes/inspiration-library");
    return { success: true, item: result.rows[0] };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to add item";
    console.error("Error creating item:", err);
    return { success: false, error: message };
  }
}

/**
 * Update an existing inspo item's title, note, or link (owner only).
 */
export async function updateItemAction(
  itemId: string,
  boardId: string,
  formData: FormData
): Promise<{
  success: boolean;
  item?: Item;
  error?: string;
}> {
  if (!isDatabaseConfigured()) {
    return { success: false, error: "Database is not configured." };
  }

  const session = await getServerSession();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized. Please sign in." };
  }

  const title = (formData.get("title") as string)?.trim();
  const note = (formData.get("note") as string)?.trim() || null;
  const linkUrl = (formData.get("link_url") as string)?.trim() || null;

  if (!title) {
    return { success: false, error: "Item title is required." };
  }

  const pool = getPool();
  try {
    // 1. Verify item exists and belongs to the authenticated user
    const checkQuery = `
      SELECT id, user_id, board_id, image_url
      FROM items
      WHERE id = $1 AND user_id = $2;
    `;
    const checkRes = await pool.query(checkQuery, [itemId, session.user.id]);
    if (checkRes.rowCount === 0) {
      return {
        success: false,
        error: "Item not found or you do not have permission to edit it.",
      };
    }

    // 2. Perform the update
    const updateQuery = `
      UPDATE items
      SET title = $3, note = $4, link_url = $5
      WHERE id = $1 AND user_id = $2
      RETURNING *;
    `;
    const updateRes = await pool.query(updateQuery, [
      itemId,
      session.user.id,
      title,
      note,
      linkUrl,
    ]);

    revalidatePath(`/prototypes/inspiration-library/boards/${boardId}`);
    revalidatePath("/prototypes/inspiration-library");
    return { success: true, item: updateRes.rows[0] };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update item";
    console.error("Error updating item:", err);
    return { success: false, error: message };
  }
}

/**
 * Delete an item from a board (owner only).
 * If the item has an uploaded image in Supabase Storage, delete the file from storage.
 */
export async function deleteItemAction(
  itemId: string,
  boardId: string
): Promise<{
  success: boolean;
  error?: string;
}> {
  if (!isDatabaseConfigured()) {
    return { success: false, error: "Database is not configured." };
  }

  const session = await getServerSession();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized." };
  }

  const pool = getPool();
  try {
    // 1. Fetch item to verify ownership and check for private storage path
    const itemQuery = `
      SELECT id, image_url, user_id
      FROM items
      WHERE id = $1 AND user_id = $2;
    `;
    const itemRes = await pool.query(itemQuery, [itemId, session.user.id]);
    if (itemRes.rowCount === 0) {
      return { success: false, error: "Item not found or you do not have permission." };
    }

    const item = itemRes.rows[0];

    // If image_url is a relative storage path (not external http/https), remove from Supabase Storage
    if (
      item.image_url &&
      !item.image_url.startsWith("http://") &&
      !item.image_url.startsWith("https://")
    ) {
      await deleteImageFromStorage(item.image_url);
    }

    // 2. Delete item from database
    const deleteQuery = `
      DELETE FROM items
      WHERE id = $1 AND user_id = $2;
    `;
    await pool.query(deleteQuery, [itemId, session.user.id]);

    revalidatePath(`/prototypes/inspiration-library/boards/${boardId}`);
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete item";
    return { success: false, error: message };
  }
}
