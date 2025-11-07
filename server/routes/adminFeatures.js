import { Router } from 'express';
import { supabase } from '../database/supabase.js';
import { parseUserToken, requireAdmin } from '../middleware/auth.js';
import {
  resetFeatureUsage,
  upsertUserFeatureOverride,
  deleteUserFeatureOverride,
} from '../middleware/accessControl.js';

const router = Router();

router.use(parseUserToken, requireAdmin); // All routes here are admin-only

// Get all plans
router.get('/plans', async (req, res) => {
  const { data, error } = await supabase.from('plans').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Get all features
router.get('/features', async (req, res) => {
  const { data, error } = await supabase.from('features').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Get all rules (plan_features)
router.get('/plan-features', async (req, res) => {
  const { data, error } = await supabase.from('plan_features').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Update or Create a plan-feature rule
router.post('/plan-features', async (req, res) => {
  const { plan_id, feature_key, access_level, limit_value } = req.body;

  const { data, error } = await supabase
    .from('plan_features')
    .upsert(
      { plan_id, feature_key, access_level, limit_value },
      { onConflict: 'plan_id, feature_key' }
    )
    .select();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data[0]);
});

// Aggregate usage for admins
router.get('/usage', async (req, res) => {
  try {
    const { userId, featureKey } = req.query;

    const usersQuery = supabase
      .from('users')
      .select('id, email, full_name, plan_id');
    if (userId) usersQuery.eq('id', userId);
    const { data: users, error: usersError } = await usersQuery;
    if (usersError) return res.status(500).json({ error: usersError.message });

    if (!users || users.length === 0) {
      return res.json([]);
    }

    const { data: features, error: featuresError } = await supabase
      .from('features')
      .select('key, name');
    if (featuresError) return res.status(500).json({ error: featuresError.message });

    const { data: plans, error: plansError } = await supabase
      .from('plans')
      .select('id, key, name');
    if (plansError) return res.status(500).json({ error: plansError.message });

    const { data: planFeatures, error: planFeaturesError } = await supabase
      .from('plan_features')
      .select('plan_id, feature_key, access_level, limit_value');
    if (planFeaturesError) return res.status(500).json({ error: planFeaturesError.message });

    const overridesQuery = supabase
      .from('user_feature_overrides')
      .select('user_id, feature_key, access_level, limit_value');
    if (userId) overridesQuery.eq('user_id', userId);
    if (featureKey) overridesQuery.eq('feature_key', featureKey);
    const { data: overrides, error: overridesError } = await overridesQuery;
    if (overridesError) return res.status(500).json({ error: overridesError.message });

    const usageQuery = supabase
      .from('user_feature_usage')
      .select('user_id, feature_key');
    if (userId) usageQuery.eq('user_id', userId);
    if (featureKey) usageQuery.eq('feature_key', featureKey);
    const { data: usageRows, error: usageError } = await usageQuery;
    if (usageError) return res.status(500).json({ error: usageError.message });

    const planById = new Map(plans?.map((plan) => [plan.id, plan]) || []);
    const freePlanId = plans?.find((plan) => plan.key === 'free')?.id || null;
    const featureNameMap = new Map(features?.map((f) => [f.key, f.name]) || []);

    const overridesMap = new Map(
      (overrides || []).map((override) => [
        `${override.user_id}:${override.feature_key}`,
        override,
      ]),
    );

    const usageMap = new Map();
    (usageRows || []).forEach((row) => {
      const key = `${row.user_id}:${row.feature_key}`;
      usageMap.set(key, (usageMap.get(key) || 0) + 1);
    });

    const addKey = (set, key) => {
      if (!featureKey || featureKey === key) {
        set.add(key);
      }
    };

    const results = [];

    users.forEach((user) => {
      const planId = user.plan_id || freePlanId;
      const plan = planId ? planById.get(planId) : null;
      const planKey = plan?.key || (user.plan_id ? 'custom' : 'free');

      const planFeatureList = planFeatures?.filter((pf) => pf.plan_id === planId) || [];

      const userOverrides = (overrides || []).filter((override) => override.user_id === user.id);
      const userUsageRows = (usageRows || []).filter((usage) => usage.user_id === user.id);

      if (userOverrides.length === 0 && userUsageRows.length === 0) {
        return;
      }

      const relevantFeatureKeys = new Set();
      userOverrides.forEach((override) => addKey(relevantFeatureKeys, override.feature_key));
      userUsageRows.forEach((usage) => addKey(relevantFeatureKeys, usage.feature_key));

      relevantFeatureKeys.forEach((key) => {
        const mapKey = `${user.id}:${key}`;
        const usageCount = usageMap.get(mapKey) || 0;
        const override = overridesMap.get(mapKey) || null;
        const planLimit = planFeatureList.find((pf) => pf.feature_key === key) || null;
        const effective = override || planLimit || null;

        const accessLevel = effective?.access_level || null;
        const limitValue = effective?.limit_value ?? 0;
        const unlimited = accessLevel === 'unlimited';
        const remaining = !effective
          ? null
          : unlimited
            ? null
            : Math.max(limitValue - usageCount, 0);

        results.push({
          user_id: user.id,
          email: user.email,
          full_name: user.full_name,
          plan_key: planKey,
          feature_key: key,
          feature_name: featureNameMap.get(key) || key,
          usage_count: usageCount,
          access_level: accessLevel,
          limit_value: limitValue,
          remaining,
          configured: Boolean(effective),
          source: override ? 'override' : planLimit ? 'plan' : null,
          override: override
            ? {
                access_level: override.access_level,
                limit_value: override.limit_value,
              }
            : null,
        });
      });
    });

    results.sort((a, b) => {
      if (a.email === b.email) {
        return a.feature_key.localeCompare(b.feature_key);
      }
      return (a.email || '').localeCompare(b.email || '');
    });

    res.json(results);
  } catch (error) {
    console.error('Failed to fetch feature usage:', error);
    res.status(500).json({ error: 'Failed to fetch feature usage.' });
  }
});

router.post('/usage/reset', async (req, res) => {
  const { user_id, feature_key } = req.body || {};

  if (!user_id || !feature_key) {
    return res.status(400).json({ error: 'user_id and feature_key are required.' });
  }

  try {
    await resetFeatureUsage({ userId: user_id, featureKey: feature_key });
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to reset feature usage:', error);
    res.status(500).json({ error: 'Failed to reset feature usage.' });
  }
});

router.post('/overrides', async (req, res) => {
  const { user_id, feature_key, access_level = 'count', limit_value } = req.body || {};

  if (!user_id || !feature_key) {
    return res.status(400).json({ error: 'user_id and feature_key are required.' });
  }

  try {
    const data = await upsertUserFeatureOverride({
      userId: user_id,
      featureKey: feature_key,
      access_level,
      limit_value,
    });
    res.json({ success: true, data });
  } catch (error) {
    console.error('Failed to upsert feature override:', error);
    res.status(500).json({ error: 'Failed to upsert feature override.' });
  }
});

router.delete('/overrides', async (req, res) => {
  const { user_id, feature_key } = req.body || {};

  if (!user_id || !feature_key) {
    return res.status(400).json({ error: 'user_id and feature_key are required.' });
  }

  try {
    await deleteUserFeatureOverride({ userId: user_id, featureKey: feature_key });
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to delete feature override:', error);
    res.status(500).json({ error: 'Failed to delete feature override.' });
  }
});

export default router;

