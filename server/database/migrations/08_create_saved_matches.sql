-- Create saved_matches for users to bookmark universities from matching results

BEGIN;

CREATE TABLE IF NOT EXISTS public.saved_matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    university_id UUID NOT NULL REFERENCES public.universities(id) ON DELETE CASCADE,
    note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, university_id)
);

CREATE INDEX IF NOT EXISTS idx_saved_matches_user ON public.saved_matches(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_matches_university ON public.saved_matches(university_id);

COMMENT ON TABLE public.saved_matches IS 'User-saved universities from matching results';

COMMIT;


