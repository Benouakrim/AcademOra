-- Migration: Create user financial profiles for personalized financial aid predictions

BEGIN;

CREATE TABLE IF NOT EXISTS public.user_financial_profiles (
  user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  gpa DOUBLE PRECISION,
  sat_score INTEGER,
  act_score INTEGER,
  family_income BIGINT,
  international_student BOOLEAN,
  in_state BOOLEAN,
  first_generation BOOLEAN,
  special_talents TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_financial_profiles_user_id ON public.user_financial_profiles(user_id);

CREATE OR REPLACE FUNCTION public.update_user_financial_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_user_financial_profiles_updated_at ON public.user_financial_profiles;
CREATE TRIGGER trg_user_financial_profiles_updated_at
  BEFORE UPDATE ON public.user_financial_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_financial_profiles_updated_at();

COMMENT ON TABLE public.user_financial_profiles IS 'Stored academic and financial profile inputs used for personalized aid predictions.';

COMMIT;


