-- Enable necessary extensions if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

ALTER TABLE public.universities
  -- Identity & Metadata
  ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS logo_url TEXT,
  ADD COLUMN IF NOT EXISTS hero_image_url TEXT,
  ADD COLUMN IF NOT EXISTS website_url TEXT,
  ADD COLUMN IF NOT EXISTS institution_type TEXT, -- 'Public', 'Private'

  -- Detailed Academics
  ADD COLUMN IF NOT EXISTS degree_levels TEXT[], -- ['Bachelor', 'Master', 'PhD']
  ADD COLUMN IF NOT EXISTS languages TEXT[], -- ['English', 'French']
  ADD COLUMN IF NOT EXISTS study_abroad BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS accreditation TEXT,

  -- Admissions
  ADD COLUMN IF NOT EXISTS test_policy TEXT, -- 'Required', 'Optional', 'Blind'
  ADD COLUMN IF NOT EXISTS sat_avg INTEGER,
  ADD COLUMN IF NOT EXISTS ielts_min NUMERIC(3,1),
  ADD COLUMN IF NOT EXISTS toefl_min INTEGER,

  -- Financials (International focus)
  ADD COLUMN IF NOT EXISTS tuition_intl INTEGER,
  ADD COLUMN IF NOT EXISTS cost_of_living INTEGER,
  ADD COLUMN IF NOT EXISTS scholarships_intl BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS financial_aid_rating INTEGER, -- 1-5 scale

  -- Location & Lifestyle
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS state_province TEXT,
  ADD COLUMN IF NOT EXISTS campus_setting TEXT, -- 'Urban', 'Suburban', 'Rural'
  ADD COLUMN IF NOT EXISTS climate TEXT, -- 'Temperate', 'Tropical', 'Cold'

  -- Future Outcomes
  ADD COLUMN IF NOT EXISTS employment_rate NUMERIC(5,2), -- % employed within 6 mo
  ADD COLUMN IF NOT EXISTS avg_starting_salary INTEGER, -- USD equivalent
  ADD COLUMN IF NOT EXISTS post_study_visa_months INTEGER, -- e.g., 12, 24, 36
  ADD COLUMN IF NOT EXISTS alumni_network_rating INTEGER; -- 1-5 scale

-- Create indexes for frequently filtered columns
CREATE INDEX IF NOT EXISTS idx_uni_campus_setting ON public.universities(campus_setting);
CREATE INDEX IF NOT EXISTS idx_uni_tuition_intl ON public.universities(tuition_intl);
CREATE INDEX IF NOT EXISTS idx_uni_visa_months ON public.universities(post_study_visa_months);