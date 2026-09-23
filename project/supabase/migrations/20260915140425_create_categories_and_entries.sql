/*
# Create categories and entries tables for a personal review/rating app

This app works as a personal "Letterboxd" — the user creates categories (e.g., "Restaurants I visited", "Foods I cooked", "Movies")
and adds entries inside each category with a 0.5–5 star rating, a comment, and an optional photo.

1. New Tables

- `categories`
  - `id` (uuid, primary key)
  - `name` (text, not null) — display name of the category
  - `emoji` (text) — an emoji icon chosen by the user to represent the category
  - `color` (text) — a hex color string used for the category card accent
  - `created_at` (timestamptz, defaults to now())

- `entries`
  - `id` (uuid, primary key)
  - `category_id` (uuid, foreign key → categories.id, ON DELETE CASCADE)
  - `title` (text, not null) — name of the thing being reviewed
  - `rating` (numeric(2,1), not null) — star rating from 0.5 to 5.0 in half-star increments
  - `comment` (text) — optional review/comment text
  - `photo_url` (text) — optional URL to a stored photo
  - `created_at` (timestamptz, defaults to now())
  - `updated_at` (timestamptz, defaults to now()) — tracks when the entry was last edited

2. Indexes

- `entries_category_id_idx` on `entries.category_id` for fast category lookups
- `entries_created_at_idx` on `entries.created_at` DESC for recent-activity feeds

3. Security

- This is a single-tenant app with NO sign-in screen. All data is intentionally shared/public.
- RLS enabled on both tables.
- Policies allow `anon` AND `authenticated` to perform all CRUD operations (the anon-key frontend can read and write).
- `USING (true)` / `WITH CHECK (true)` is acceptable here because the data is intentionally public.
*/

CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  emoji text DEFAULT '⭐',
  color text DEFAULT '#F59E0B',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  title text NOT NULL,
  rating numeric(2,1) NOT NULL DEFAULT 5.0 CHECK (rating >= 0.5 AND rating <= 5.0),
  comment text,
  photo_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS entries_category_id_idx ON entries(category_id);
CREATE INDEX IF NOT EXISTS entries_created_at_idx ON entries(created_at DESC);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE entries ENABLE ROW LEVEL SECURITY;

-- Categories policies (single-tenant, no auth)
DROP POLICY IF EXISTS "anon_select_categories" ON categories;
CREATE POLICY "anon_select_categories" ON categories FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_categories" ON categories;
CREATE POLICY "anon_insert_categories" ON categories FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_categories" ON categories;
CREATE POLICY "anon_update_categories" ON categories FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_categories" ON categories;
CREATE POLICY "anon_delete_categories" ON categories FOR DELETE
  TO anon, authenticated USING (true);

-- Entries policies (single-tenant, no auth)
DROP POLICY IF EXISTS "anon_select_entries" ON entries;
CREATE POLICY "anon_select_entries" ON entries FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_entries" ON entries;
CREATE POLICY "anon_insert_entries" ON entries FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_entries" ON entries;
CREATE POLICY "anon_update_entries" ON entries FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_entries" ON entries;
CREATE POLICY "anon_delete_entries" ON entries FOR DELETE
  TO anon, authenticated USING (true);