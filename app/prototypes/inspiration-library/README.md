# Inspiration Library (Personal Are.na & Pinterest)

A tactile, personal visual archive and bookmarks channel prototype built with **Next.js 15 (App Router)**, **React 19**, **Better Auth**, and **PostgreSQL (Supabase)** via the native `pg` client.

---

## Features

- **Better Auth Authentication**:
  - Secure email & password sign-up and sign-in.
  - Session verification strictly handled on the server for all pages and server actions.
  - Better Auth route mounted at `/api/auth/[...all]`.
  - Automatic session cookie handling via `nextCookies()`.
- **Boards & Channels**:
  - Curate ideas, references, and visual research into categorized boards.
  - **Privacy Control**:
    - **Private Boards**: Exclusively visible and editable by their owner. Any unauthorized or anonymous visitor accessing the URL sees a clean "404 / Private" page.
    - **Public Boards**: Sharable with anyone via direct link. Signed-out or non-owner visitors get a clean, read-only view without any edit/delete buttons.
- **Masonry Visual Grid**:
  - Pinterest and Are.na inspired multi-column masonry layout that adapts naturally to varied image aspect ratios.
  - **Local Image Upload**:
    - Direct image uploads from computer (JPG, PNG, GIF, WEBP, SVG up to 10MB).
    - Stored in a private Supabase Storage bucket (`inspiration-library`).
    - Only the relative storage file path is saved in the `items.image_url` column.
    - Owner-only upload & deletion security.
    - Private images are securely streamed to authorized viewers through `/api/inspiration-library/image`.
  - Add items with:
    - **Image** (Upload from computer OR paste external image URL)
    - **Title** (required, auto-prefills from uploaded filename)
    - **Link / Source URL** (with automatic domain badge and external link ↗)
    - **Note** (commentary / design notes)
  - Full owner editing: delete items, update board details, toggle public/private.

---

## Supabase PostgreSQL Setup Guide

Follow these quick steps when you are ready to connect your Supabase database:

### 1. Get Your Supabase Database Connection String
1. Log in to your [Supabase Dashboard](https://supabase.com/dashboard).
2. Open your project.
3. Click on **Project Settings** (gear icon) -> **Database**.
4. Scroll to **Connection string** and select the **URI** tab (or **Node.js** connection string).
5. Copy the connection string. It looks like:
   ```text
   postgresql://postgres.[project-ref]:[YOUR-PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres
   ```
6. Replace `[YOUR-PASSWORD]` with your database password.

### 2. Add to `.env.local`
Open your local `.env.local` file and paste the connection string into `DATABASE_URL`, and your Supabase `service_role` key into `SUPABASE_SERVICE_ROLE_KEY`:
```bash
DATABASE_URL=postgresql://postgres.[project-ref]:[YOUR-PASSWORD]@aws-0-[region].pooler.supabase.com:6543/postgres
SUPABASE_URL=https://[project-ref].supabase.co
SUPABASE_SERVICE_ROLE_KEY=[YOUR-SERVICE-ROLE-KEY]
```
*(Find your `service_role` key in Supabase Dashboard > Project Settings > API).*
*(Never commit `.env.local` or share your password in public chat).*

### 3. Run the Database Schema
1. In your Supabase Dashboard, click on **SQL Editor** in the left sidebar.
2. Click **New query**.
3. Open [`app/prototypes/inspiration-library/schema.sql`](./schema.sql), copy its full content, and paste it into the SQL Editor.
4. Click **Run**.
5. This creates the Better Auth tables (`user`, `session`, `account`, `verification`) and the application tables (`boards` and `items`) with foreign key cascade deletions and performance indexes.

---

## Database Schema Overview

### Better Auth Tables
- **`user`**: User identity, name, email, avatar, and verification state.
- **`session`**: Active session tokens, expiry timestamps, user foreign keys.
- **`account`**: Authentication provider records (stores hashed credentials for email/password).
- **`verification`**: Verification tokens.

### Inspiration Library Tables
- **`boards`**:
  - `id`: UUID (primary key, defaults to `gen_random_uuid()`)
  - `user_id`: TEXT (references `"user"(id)` with `ON DELETE CASCADE`)
  - `title`: TEXT (board title)
  - `description`: TEXT (optional notes/context)
  - `is_public`: BOOLEAN (default `false`)
  - `created_at`: TIMESTAMP WITH TIME ZONE
- **`items`**:
  - `id`: UUID (primary key, defaults to `gen_random_uuid()`)
  - `board_id`: UUID (references `boards(id)` with `ON DELETE CASCADE`)
  - `user_id`: TEXT (references `"user"(id)` with `ON DELETE CASCADE`)
  - `image_url`: TEXT (direct image link)
  - `link_url`: TEXT (external source link)
  - `title`: TEXT (item title)
  - `note`: TEXT (annotations / notes)
  - `created_at`: TIMESTAMP WITH TIME ZONE

---

## File Structure

```text
app/prototypes/inspiration-library/
├── page.tsx                    # Main landing / boards dashboard
├── styles.module.css           # Scoped cutting-mat CSS module
├── actions.ts                  # Server actions with session validation
├── types.ts                    # TypeScript types for boards & items
├── schema.sql                  # Complete Supabase PostgreSQL schema
├── README.md                   # This documentation guide
├── components/
│   ├── AuthBar.tsx             # Header auth bar with Better Auth sign out
│   ├── BoardListClient.tsx     # Client board grid & new board modal
│   └── BoardDetailClient.tsx   # Masonry visual grid & add/edit forms
├── sign-in/
│   └── page.tsx                # Email & password sign-in page
├── sign-up/
│   └── page.tsx                # Email & password sign-up page
└── boards/[id]/
    └── page.tsx                # Individual board page with privacy checks

lib/
├── auth.ts                     # Better Auth server configuration
├── auth-client.ts              # Better Auth React client instance
└── db.ts                       # PostgreSQL connection pool using pg
```
