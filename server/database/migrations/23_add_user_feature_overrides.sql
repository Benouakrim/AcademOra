BEGIN;

-- Create overrides table to allow per-user feature limits
CREATE TABLE IF NOT EXISTS user_feature_overrides (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  feature_key TEXT NOT NULL REFERENCES features(key) ON DELETE CASCADE,
  access_level limit_type NOT NULL DEFAULT 'count',
  limit_value INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (user_id, feature_key)
);

CREATE OR REPLACE FUNCTION set_user_feature_overrides_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_user_feature_overrides_updated_at ON user_feature_overrides;
CREATE TRIGGER trg_user_feature_overrides_updated_at
BEFORE UPDATE ON user_feature_overrides
FOR EACH ROW
EXECUTE FUNCTION set_user_feature_overrides_updated_at();

-- Convenience view for admin analytics
CREATE OR REPLACE VIEW view_user_feature_usage_counts AS
SELECT
  ufu.user_id,
  u.email,
  u.plan_id,
  ufu.feature_key,
  COUNT(*) AS usage_count
FROM user_feature_usage ufu
JOIN users u ON u.id = ufu.user_id
GROUP BY ufu.user_id, u.email, u.plan_id, ufu.feature_key;

COMMIT;

