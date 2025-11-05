-- Migration: Create University Groups Table
-- This migration creates a hierarchical structure where:
-- 1. University Groups (parent/holding/brand) - e.g., "La Rochelle University"
-- 2. Universities (instances/campuses/faculties) - e.g., "La Rochelle University - Business School", "La Rochelle University - Engineering Campus"

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create university_groups table
CREATE TABLE IF NOT EXISTS public.university_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  short_name TEXT,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  logo_url TEXT,
  hero_image_url TEXT,
  website_url TEXT,
  established_year INTEGER,
  headquarters_country TEXT,
  headquarters_city TEXT,
  headquarters_address TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  total_instances INTEGER DEFAULT 0, -- Number of universities/institutions under this group
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Add group_id foreign key to universities table
ALTER TABLE public.universities
  ADD COLUMN IF NOT EXISTS group_id UUID REFERENCES public.university_groups(id) ON DELETE SET NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_university_groups_slug ON public.university_groups(slug);
CREATE INDEX IF NOT EXISTS idx_university_groups_name ON public.university_groups(name);
CREATE INDEX IF NOT EXISTS idx_universities_group_id ON public.universities(group_id);

-- Create trigger to update updated_at timestamp for university_groups
CREATE OR REPLACE FUNCTION update_university_groups_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_university_groups_updated_at_trigger ON public.university_groups;
CREATE TRIGGER update_university_groups_updated_at_trigger
    BEFORE UPDATE ON public.university_groups
    FOR EACH ROW EXECUTE FUNCTION update_university_groups_updated_at();

-- Create function to update total_instances count
CREATE OR REPLACE FUNCTION update_group_instance_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.group_id IS NOT NULL THEN
        UPDATE public.university_groups
        SET total_instances = total_instances + 1
        WHERE id = NEW.group_id;
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.group_id IS DISTINCT FROM NEW.group_id THEN
            -- Decrease count for old group
            IF OLD.group_id IS NOT NULL THEN
                UPDATE public.university_groups
                SET total_instances = GREATEST(0, total_instances - 1)
                WHERE id = OLD.group_id;
            END IF;
            -- Increase count for new group
            IF NEW.group_id IS NOT NULL THEN
                UPDATE public.university_groups
                SET total_instances = total_instances + 1
                WHERE id = NEW.group_id;
            END IF;
        END IF;
    ELSIF TG_OP = 'DELETE' AND OLD.group_id IS NOT NULL THEN
        UPDATE public.university_groups
        SET total_instances = GREATEST(0, total_instances - 1)
        WHERE id = OLD.group_id;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update instance count
DROP TRIGGER IF EXISTS update_group_instance_count_trigger ON public.universities;
CREATE TRIGGER update_group_instance_count_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.universities
    FOR EACH ROW EXECUTE FUNCTION update_group_instance_count();

-- Update existing total_instances counts
UPDATE public.university_groups
SET total_instances = (
    SELECT COUNT(*)
    FROM public.universities
    WHERE universities.group_id = university_groups.id
);

