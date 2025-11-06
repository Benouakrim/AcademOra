-- Create user_preferences table to store per-user matching weights
-- Weights are in range [0,1]; defaults provide a reasonable baseline

BEGIN;

CREATE TABLE IF NOT EXISTS public.user_preferences (
    user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    weight_tuition NUMERIC(4,3) NOT NULL DEFAULT 0.5,
    weight_location NUMERIC(4,3) NOT NULL DEFAULT 0.5,
    weight_ranking NUMERIC(4,3) NOT NULL DEFAULT 0.5,
    weight_program NUMERIC(4,3) NOT NULL DEFAULT 0.5,
    weight_language NUMERIC(4,3) NOT NULL DEFAULT 0.5,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.user_preferences IS 'Per-user weights for the matching engine';

CREATE OR REPLACE FUNCTION public.set_user_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_user_preferences_updated_at ON public.user_preferences;
CREATE TRIGGER trg_user_preferences_updated_at
BEFORE UPDATE ON public.user_preferences
FOR EACH ROW EXECUTE FUNCTION public.set_user_preferences_updated_at();

COMMIT;


