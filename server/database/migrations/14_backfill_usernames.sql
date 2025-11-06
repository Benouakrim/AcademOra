-- Backfill usernames for all users and enforce NOT NULL

BEGIN;

-- Normalize and backfill
UPDATE public.users
SET username = LOWER(SPLIT_PART(email, '@', 1)) || '-' || SUBSTR(id::text, 1, 8)
WHERE (username IS NULL OR username = '');

-- Ensure username is lowercase and trimmed
UPDATE public.users
SET username = REGEXP_REPLACE(LOWER(username), '[^a-z0-9\-]+', '-', 'g');

-- Enforce not null
ALTER TABLE public.users
  ALTER COLUMN username SET NOT NULL;

-- Unique is already defined; if not, uncomment below
-- CREATE UNIQUE INDEX IF NOT EXISTS users_username_key ON public.users(username);

COMMIT;


