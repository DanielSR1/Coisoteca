/*
# Add photo_orientation column to entries

1. Changes
- Adds `photo_orientation` column to the `entries` table.
- Values: 'horizontal' (default) or 'vertical'.
- This lets users choose whether their photo displays in landscape or portrait mode.
2. Security
- No security changes. Existing RLS policies remain unchanged.
*/

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'entries' AND column_name = 'photo_orientation'
  ) THEN
    ALTER TABLE entries ADD COLUMN photo_orientation text NOT NULL DEFAULT 'horizontal';
  END IF;
END $$;