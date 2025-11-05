-- Create universities table for the Matching Engine
-- Run this in Supabase SQL Editor (Dashboard -> SQL Editor) or via psql

-- Ensure uuid extension is enabled (schema.sql already enables it, but safe to include)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.universities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  country TEXT,
  description TEXT,
  image_url TEXT,
  program_url TEXT,
  avg_tuition_per_year NUMERIC,
  min_gpa NUMERIC,
  application_deadline DATE,
  acceptance_rate NUMERIC,
  ranking_world INTEGER,
  interests TEXT[],
  required_tests TEXT[],
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes to speed up common queries
CREATE INDEX IF NOT EXISTS idx_universities_country ON public.universities(country);
CREATE INDEX IF NOT EXISTS idx_universities_tuition ON public.universities(avg_tuition_per_year);
CREATE INDEX IF NOT EXISTS idx_universities_gpa ON public.universities(min_gpa);
CREATE INDEX IF NOT EXISTS idx_universities_interests ON public.universities USING GIN (interests);

-- Add trigger to keep updated_at current if the shared function exists
-- schema.sql defines update_updated_at_column(); create trigger only if function exists
DO $$
BEGIN
  IF EXISTS(SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column') THEN
    DROP TRIGGER IF EXISTS update_universities_updated_at ON public.universities;
    CREATE TRIGGER update_universities_updated_at 
      BEFORE UPDATE ON public.universities
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END;
$$;

-- Optional: seed with a few sample rows (safe - will not duplicate if names exist)
DELETE FROM public.universities WHERE name IN (
  'University of Toronto',
  'Sorbonne University',
  'University of California, Berkeley (UCB)'
);

INSERT INTO public.universities (name, country, description, avg_tuition_per_year, min_gpa, interests, required_tests, ranking_world)
VALUES
  ('University of Toronto', 'Canada', 'Top public research university in Toronto.', 45000, 3.2, ARRAY['Engineering','Computer Science','Business'], ARRAY['TOEFL','IELTS'], 25),
  ('Sorbonne University', 'France', 'Leading research university in Paris.', 8000, 3.0, ARRAY['Arts','Humanities','Science'], ARRAY['IELTS'], 75),
  ('University of California, Berkeley (UCB)', 'USA', 'Top public research university in California.', 52000, 3.6, ARRAY['Engineering','Computer Science','Business'], ARRAY['SAT','ACT','TOEFL'], 20)
ON CONFLICT (name) DO NOTHING;

-- End of script
