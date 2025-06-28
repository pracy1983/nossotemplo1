/*
  # Add photo field to events table

  1. Changes
    - Add `photo` column to events table for event photos
    - Update existing events to have null photo by default

  2. Security
    - No changes to RLS policies needed
*/

-- Add photo column to events table
ALTER TABLE events ADD COLUMN IF NOT EXISTS photo text;

-- Add comment to document the new field
COMMENT ON COLUMN events.photo IS 'URL da foto do evento';