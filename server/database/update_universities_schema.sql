-- Migration: add matching fields for Future Mixer
-- Adds academics, financials, lifestyle, and future-related columns
ALTER TABLE public.universities
  ADD COLUMN IF NOT EXISTS degree_levels text[],
  ADD COLUMN IF NOT EXISTS languages text[],
  ADD COLUMN IF NOT EXISTS ranking_tier text,
  ADD COLUMN IF NOT EXISTS scholarship_availability integer,
  ADD COLUMN IF NOT EXISTS cost_of_living_index integer,
  ADD COLUMN IF NOT EXISTS campus_setting text,
  ADD COLUMN IF NOT EXISTS climate text,
  ADD COLUMN IF NOT EXISTS post_grad_visa_strength integer,
  ADD COLUMN IF NOT EXISTS internship_strength integer;

-- Optional: set sensible defaults for new integer scales (NULL is allowed)
-- You can run this migration against your Supabase / Postgres DB.
