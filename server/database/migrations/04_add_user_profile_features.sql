-- Migration: Add User Profile Management Features
-- This migration adds fields for user profile management and subscription status

-- Add subscription-related columns to users table
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'free' CHECK (subscription_status IN ('free', 'premium', 'enterprise')),
  ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS full_name TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS bio TEXT,
  ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Create saved_items table for articles and resources
CREATE TABLE IF NOT EXISTS public.saved_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL CHECK (item_type IN ('article', 'resource', 'university', 'university_group')),
  item_id UUID NOT NULL,
  item_data JSONB, -- Store metadata for quick access without joins
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, item_type, item_id) -- Prevent duplicate saves
);

-- Create indexes for saved_items
CREATE INDEX IF NOT EXISTS idx_saved_items_user_id ON public.saved_items(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_items_type ON public.saved_items(item_type);
CREATE INDEX IF NOT EXISTS idx_saved_items_user_type ON public.saved_items(user_id, item_type);

-- Create university_claim_requests table
CREATE TABLE IF NOT EXISTS public.university_claim_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  university_id UUID REFERENCES public.universities(id) ON DELETE CASCADE,
  university_group_id UUID REFERENCES public.university_groups(id) ON DELETE CASCADE,
  requester_email TEXT NOT NULL,
  requester_name TEXT NOT NULL,
  requester_phone TEXT,
  requester_position TEXT, -- e.g., "Director of Admissions", "Marketing Manager"
  requester_department TEXT,
  organization_name TEXT, -- Official university name
  verification_documents JSONB, -- Store links to verification documents
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected', 'revoked')),
  admin_notes TEXT, -- Admin notes during review
  reviewed_by UUID REFERENCES public.users(id), -- Admin who reviewed
  reviewed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ, -- Claim expires if not approved within timeframe
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create university_claims table (approved claims)
CREATE TABLE IF NOT EXISTS public.university_claims (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  university_id UUID REFERENCES public.universities(id) ON DELETE CASCADE,
  university_group_id UUID REFERENCES public.university_groups(id) ON DELETE CASCADE,
  claim_request_id UUID REFERENCES public.university_claim_requests(id),
  claimed_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  permissions JSONB DEFAULT '{"can_edit": true, "can_manage_media": true, "can_respond_reviews": false}'::jsonb,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'revoked')),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(university_id, claimed_by), -- One user can claim one university
  UNIQUE(university_group_id, claimed_by) -- One user can claim one group
);

-- Create indexes for claim tables
CREATE INDEX IF NOT EXISTS idx_claim_requests_university_id ON public.university_claim_requests(university_id);
CREATE INDEX IF NOT EXISTS idx_claim_requests_university_group_id ON public.university_claim_requests(university_group_id);
CREATE INDEX IF NOT EXISTS idx_claim_requests_status ON public.university_claim_requests(status);
CREATE INDEX IF NOT EXISTS idx_claim_requests_email ON public.university_claim_requests(requester_email);
CREATE INDEX IF NOT EXISTS idx_claims_university_id ON public.university_claims(university_id);
CREATE INDEX IF NOT EXISTS idx_claims_university_group_id ON public.university_claims(university_group_id);
CREATE INDEX IF NOT EXISTS idx_claims_claimed_by ON public.university_claims(claimed_by);
CREATE INDEX IF NOT EXISTS idx_claims_status ON public.university_claims(status);

-- Create trigger to update updated_at timestamp for claim requests
CREATE OR REPLACE FUNCTION update_claim_request_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_claim_request_updated_at_trigger ON public.university_claim_requests;
CREATE TRIGGER update_claim_request_updated_at_trigger
    BEFORE UPDATE ON public.university_claim_requests
    FOR EACH ROW EXECUTE FUNCTION update_claim_request_updated_at();

-- Create trigger to update updated_at timestamp for claims
DROP TRIGGER IF EXISTS update_claim_updated_at_trigger ON public.university_claims;
CREATE TRIGGER update_claim_updated_at_trigger
    BEFORE UPDATE ON public.university_claims
    FOR EACH ROW EXECUTE FUNCTION update_claim_request_updated_at();

-- Add comments for documentation
COMMENT ON TABLE public.saved_items IS 'User saved articles, resources, and universities';
COMMENT ON TABLE public.university_claim_requests IS 'Requests from university representatives to claim their institution';
COMMENT ON TABLE public.university_claims IS 'Approved claims linking users to universities/groups';

