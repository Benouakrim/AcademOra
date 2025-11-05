-- Migration: Add comprehensive university criteria fields
-- This migration adds all the criteria fields organized by modules:
-- 1. General Identity & Metadata
-- 2. Location & Campus Vibe (Lifestyle Module)
-- 3. Detailed Academics (Academics Module)
-- 4. Admissions & Selectivity
-- 5. Financials & Aid (Financials Module)
-- 6. Student Demographics
-- 7. Future Outcomes (Future Module)

-- Enable necessary extensions if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis"; -- For POINT type if needed

ALTER TABLE public.universities
  -- 1. General Identity & Metadata
  ADD COLUMN IF NOT EXISTS short_name TEXT,
  ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS logo_url TEXT,
  ADD COLUMN IF NOT EXISTS hero_image_url TEXT,
  ADD COLUMN IF NOT EXISTS website_url TEXT,
  ADD COLUMN IF NOT EXISTS established_year INTEGER,
  ADD COLUMN IF NOT EXISTS institution_type TEXT CHECK (institution_type IN ('Public', 'Private Non-profit', 'Private For-profit')) OR institution_type IS NULL,
  ADD COLUMN IF NOT EXISTS religious_affiliation TEXT,

  -- 2. Location & Campus Vibe (Lifestyle Module)
  ADD COLUMN IF NOT EXISTS location_country TEXT, -- Rename existing 'country' or keep both
  ADD COLUMN IF NOT EXISTS location_city TEXT, -- Rename existing 'city' or keep both
  ADD COLUMN IF NOT EXISTS location_state_province TEXT, -- Rename existing 'state_province' or keep both
  ADD COLUMN IF NOT EXISTS location_coordinates JSONB, -- {lat, lng} format
  ADD COLUMN IF NOT EXISTS campus_setting TEXT CHECK (campus_setting IN ('Urban', 'Suburban', 'Rural')) OR campus_setting IS NULL,
  ADD COLUMN IF NOT EXISTS campus_size_acres INTEGER,
  ADD COLUMN IF NOT EXISTS housing_availability TEXT,
  ADD COLUMN IF NOT EXISTS climate_zone TEXT,
  ADD COLUMN IF NOT EXISTS nearest_major_airport TEXT,
  ADD COLUMN IF NOT EXISTS student_life_tags TEXT[],

  -- 3. Detailed Academics (Academics Module)
  ADD COLUMN IF NOT EXISTS degree_levels_offered TEXT[], -- Rename existing 'degree_levels' or keep both
  ADD COLUMN IF NOT EXISTS academic_calendar TEXT CHECK (academic_calendar IN ('Semester', 'Quarter', 'Trimester')) OR academic_calendar IS NULL,
  ADD COLUMN IF NOT EXISTS faculty_to_student_ratio TEXT, -- e.g., "1:15"
  ADD COLUMN IF NOT EXISTS research_activity_level TEXT, -- e.g., "Very High", "High", "Teaching Focused"
  ADD COLUMN IF NOT EXISTS programs_count INTEGER,
  ADD COLUMN IF NOT EXISTS top_ranked_programs TEXT[],
  ADD COLUMN IF NOT EXISTS study_abroad_opportunities BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS languages_of_instruction TEXT[], -- Rename existing 'languages' or keep both
  ADD COLUMN IF NOT EXISTS accreditation_body TEXT, -- Rename existing 'accreditation' or keep both

  -- 4. Admissions & Selectivity
  ADD COLUMN IF NOT EXISTS acceptance_rate DECIMAL(5,2), -- Already exists, but ensure correct type
  ADD COLUMN IF NOT EXISTS application_fee INTEGER, -- USD
  ADD COLUMN IF NOT EXISTS application_deadlines JSONB, -- { "early_decision": "2025-11-01", "regular": "2026-01-01" }
  ADD COLUMN IF NOT EXISTS standardized_test_policy TEXT CHECK (standardized_test_policy IN ('Required', 'Test-Optional', 'Test-Blind')) OR standardized_test_policy IS NULL,
  ADD COLUMN IF NOT EXISTS sat_score_25th_percentile INTEGER,
  ADD COLUMN IF NOT EXISTS sat_score_75th_percentile INTEGER,
  ADD COLUMN IF NOT EXISTS act_score_avg INTEGER,
  ADD COLUMN IF NOT EXISTS min_gpa_requirement DECIMAL(3,2), -- Rename existing 'min_gpa' or keep both
  ADD COLUMN IF NOT EXISTS avg_gpa_admitted DECIMAL(3,2),
  ADD COLUMN IF NOT EXISTS international_english_reqs JSONB, -- { "toefl_min": 100, "ielts_min": 7.5 }

  -- 5. Financials & Aid (Financials Module)
  ADD COLUMN IF NOT EXISTS tuition_in_state INTEGER,
  ADD COLUMN IF NOT EXISTS tuition_out_of_state INTEGER,
  ADD COLUMN IF NOT EXISTS tuition_international INTEGER, -- Rename existing 'tuition_intl' or keep both
  ADD COLUMN IF NOT EXISTS cost_of_living_est INTEGER, -- Rename existing 'cost_of_living' or keep both
  ADD COLUMN IF NOT EXISTS percentage_receiving_aid INTEGER,
  ADD COLUMN IF NOT EXISTS avg_financial_aid_package INTEGER,
  ADD COLUMN IF NOT EXISTS scholarships_international BOOLEAN DEFAULT false, -- Rename existing 'scholarships_intl' or keep both
  ADD COLUMN IF NOT EXISTS need_blind_admission BOOLEAN DEFAULT false,

  -- 6. Student Demographics
  ADD COLUMN IF NOT EXISTS total_enrollment INTEGER,
  ADD COLUMN IF NOT EXISTS undergrad_enrollment INTEGER,
  ADD COLUMN IF NOT EXISTS grad_enrollment INTEGER,
  ADD COLUMN IF NOT EXISTS percentage_international DECIMAL(5,2),
  ADD COLUMN IF NOT EXISTS gender_ratio TEXT, -- e.g., "50:50" or store as % female decimal
  ADD COLUMN IF NOT EXISTS retention_rate_first_year DECIMAL(5,2),

  -- 7. Future Outcomes (Future Module)
  ADD COLUMN IF NOT EXISTS graduation_rate_4yr DECIMAL(5,2),
  ADD COLUMN IF NOT EXISTS graduation_rate_6yr DECIMAL(5,2),
  ADD COLUMN IF NOT EXISTS employment_rate_6mo DECIMAL(5,2), -- Rename existing 'employment_rate' or keep both
  ADD COLUMN IF NOT EXISTS avg_starting_salary INTEGER, -- Already exists
  ADD COLUMN IF NOT EXISTS internship_placement_support INTEGER CHECK (internship_placement_support BETWEEN 1 AND 5) OR internship_placement_support IS NULL,
  ADD COLUMN IF NOT EXISTS alumni_network_strength INTEGER CHECK (alumni_network_strength BETWEEN 1 AND 5) OR alumni_network_strength IS NULL,
  ADD COLUMN IF NOT EXISTS post_study_work_visa_months INTEGER; -- Rename existing 'post_study_visa_months' or keep both

-- Create indexes for frequently queried fields
CREATE INDEX IF NOT EXISTS idx_uni_slug ON public.universities(slug);
CREATE INDEX IF NOT EXISTS idx_uni_location_country ON public.universities(location_country);
CREATE INDEX IF NOT EXISTS idx_uni_location_city ON public.universities(location_city);
CREATE INDEX IF NOT EXISTS idx_uni_campus_setting ON public.universities(campus_setting);
CREATE INDEX IF NOT EXISTS idx_uni_tuition_intl ON public.universities(tuition_international);
CREATE INDEX IF NOT EXISTS idx_uni_acceptance_rate ON public.universities(acceptance_rate);
CREATE INDEX IF NOT EXISTS idx_uni_established_year ON public.universities(established_year);
CREATE INDEX IF NOT EXISTS idx_uni_degree_levels ON public.universities USING GIN (degree_levels_offered);
CREATE INDEX IF NOT EXISTS idx_uni_languages ON public.universities USING GIN (languages_of_instruction);
CREATE INDEX IF NOT EXISTS idx_uni_student_life_tags ON public.universities USING GIN (student_life_tags);
CREATE INDEX IF NOT EXISTS idx_uni_top_programs ON public.universities USING GIN (top_ranked_programs);

-- Add comments for documentation
COMMENT ON COLUMN public.universities.slug IS 'URL-friendly unique identifier';
COMMENT ON COLUMN public.universities.location_coordinates IS 'JSON object with lat and lng: {"lat": 40.7128, "lng": -74.0060}';
COMMENT ON COLUMN public.universities.application_deadlines IS 'JSON object with deadline types: {"early_decision": "2025-11-01", "regular": "2026-01-01"}';
COMMENT ON COLUMN public.universities.international_english_reqs IS 'JSON object with test requirements: {"toefl_min": 100, "ielts_min": 7.5}';
COMMENT ON COLUMN public.universities.gender_ratio IS 'Format: "50:50" or percentage female as decimal';
COMMENT ON COLUMN public.universities.faculty_to_student_ratio IS 'Format: "1:15" (ratio string)';
