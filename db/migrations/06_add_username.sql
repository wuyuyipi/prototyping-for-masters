-- Add username and displayUsername columns to Better Auth user table
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "username" TEXT UNIQUE;
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "displayUsername" TEXT;

-- Backfill existing users if username is null
UPDATE "user"
SET "username" = LOWER(REGEXP_REPLACE(name, '[^a-zA-Z0-9_]', '', 'g')),
    "displayUsername" = name
WHERE "username" IS NULL;

-- Performance index for case-insensitive username lookups on public profile routes
CREATE INDEX IF NOT EXISTS idx_user_username ON "user" ("username");
CREATE INDEX IF NOT EXISTS idx_user_username_lower ON "user" (LOWER("username"));
