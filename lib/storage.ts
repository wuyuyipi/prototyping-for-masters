/**
 * Supabase Storage client helper for Inspiration Library.
 * Interacts directly with the Supabase Storage REST API using native fetch.
 * Does NOT use Supabase Auth or @supabase/supabase-js.
 */

// Ensure .env.local is loaded in non-Next environments
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  try {
    process.loadEnvFile(".env.local");
  } catch {
    // Ignore if not readable
  }
}

export const STORAGE_BUCKET = "inspiration-library";

/**
 * Returns the configured Supabase Storage URL and Service Role Key.
 */
export function getStorageConfig() {
  const url =
    process.env.SUPABASE_URL || "https://qyzjypbbpqtnyuhtyczb.supabase.co";
  const serviceRoleKey =
    process.env.SUPABASE_SECRET_KEY?.trim() ||
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    "";
  return { url: url.replace(/\/$/, ""), serviceRoleKey };
}

/**
 * Checks if Supabase Storage is configured in the environment.
 */
export function isStorageConfigured(): boolean {
  const { serviceRoleKey } = getStorageConfig();
  return Boolean(serviceRoleKey && serviceRoleKey.length > 0);
}

/**
 * Uploads an image file to the private Supabase Storage bucket.
 * Stores the object at `${userId}/${boardId}/${timestamp}-${filename}`.
 * Returns only the relative storage path.
 */
export async function uploadImageToStorage(params: {
  userId: string;
  boardId: string;
  filename: string;
  buffer: Buffer | ArrayBuffer | Uint8Array;
  mimeType: string;
}): Promise<{ path: string }> {
  const { url, serviceRoleKey } = getStorageConfig();
  if (!serviceRoleKey) {
    throw new Error(
      "Supabase Storage is not configured yet. Please add SUPABASE_SERVICE_ROLE_KEY to your .env.local file (found in Supabase Dashboard > Project Settings > API)."
    );
  }

  // Sanitize filename and create unique relative storage path
  const ext = params.filename.split(".").pop()?.toLowerCase() || "jpg";
  const baseName = params.filename
    .replace(/\.[^/.]+$/, "")
    .replace(/[^a-zA-Z0-9-_]/g, "_")
    .slice(0, 40);
  const uniqueName = `${Date.now()}-${baseName}.${ext}`;
  const storagePath = `${params.userId}/${params.boardId}/${uniqueName}`;

  const endpoint = `${url}/storage/v1/object/${STORAGE_BUCKET}/${encodeURIComponent(
    storagePath
  ).replace(/%2F/g, "/")}`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      "Content-Type": params.mimeType || "application/octet-stream",
      "x-upsert": "true",
    },
    body: params.buffer,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Supabase Storage upload error:", response.status, errorText);
    throw new Error(`Upload failed (${response.status}): ${errorText || response.statusText}`);
  }

  return { path: storagePath };
}

/**
 * Fetches an image stream from the private Supabase Storage bucket.
 */
export async function getImageStreamFromStorage(path: string): Promise<Response> {
  const { url, serviceRoleKey } = getStorageConfig();
  if (!serviceRoleKey) {
    throw new Error(
      "Supabase Storage is not configured. Please add SUPABASE_SERVICE_ROLE_KEY to .env.local."
    );
  }

  const endpoint = `${url}/storage/v1/object/authenticated/${STORAGE_BUCKET}/${encodeURIComponent(
    path
  ).replace(/%2F/g, "/")}`;

  const response = await fetch(endpoint, {
    method: "GET",
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
    },
  });

  return response;
}

/**
 * Deletes an image from the private Supabase Storage bucket.
 */
export async function deleteImageFromStorage(path: string): Promise<boolean> {
  const { url, serviceRoleKey } = getStorageConfig();
  if (!serviceRoleKey || !path) return false;

  const endpoint = `${url}/storage/v1/object/${STORAGE_BUCKET}`;
  try {
    const response = await fetch(endpoint, {
      method: "DELETE",
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prefixes: [path] }),
    });

    return response.ok;
  } catch (err) {
    console.error("Failed to delete image from Supabase Storage:", err);
    return false;
  }
}

/**
 * Deletes multiple images from the private Supabase Storage bucket.
 */
export async function deleteImagesFromStorage(paths: string[]): Promise<boolean> {
  const { url, serviceRoleKey } = getStorageConfig();
  const validPaths = paths.filter(Boolean);
  if (!serviceRoleKey || validPaths.length === 0) return false;

  const endpoint = `${url}/storage/v1/object/${STORAGE_BUCKET}`;
  try {
    const response = await fetch(endpoint, {
      method: "DELETE",
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prefixes: validPaths }),
    });

    return response.ok;
  } catch (err) {
    console.error("Failed to delete images from Supabase Storage:", err);
    return false;
  }
}
