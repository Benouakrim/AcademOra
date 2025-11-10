-- Migration: Create saved_comparisons table
-- Description: Allows users to save their university comparisons for later viewing
-- Date: 2025-11-10

-- Create saved_comparisons table
CREATE TABLE IF NOT EXISTS saved_comparisons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  university_ids UUID[] NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  last_viewed_at TIMESTAMP WITH TIME ZONE,
  is_favorite BOOLEAN DEFAULT FALSE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_saved_comparisons_user_id ON saved_comparisons(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_comparisons_created_at ON saved_comparisons(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_saved_comparisons_is_favorite ON saved_comparisons(is_favorite) WHERE is_favorite = TRUE;
CREATE INDEX IF NOT EXISTS idx_saved_comparisons_university_ids ON saved_comparisons USING GIN(university_ids);

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_saved_comparisons_updated_at ON saved_comparisons;
CREATE TRIGGER update_saved_comparisons_updated_at 
    BEFORE UPDATE ON saved_comparisons
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add comment to table
COMMENT ON TABLE saved_comparisons IS 'Stores user-saved university comparisons for later viewing';
COMMENT ON COLUMN saved_comparisons.university_ids IS 'Array of university UUIDs in the comparison (max 5)';
COMMENT ON COLUMN saved_comparisons.is_favorite IS 'Whether this comparison is marked as a favorite by the user';
COMMENT ON COLUMN saved_comparisons.last_viewed_at IS 'Last time the user viewed this comparison';
