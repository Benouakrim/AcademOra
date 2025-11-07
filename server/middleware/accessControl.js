import { supabase } from '../database/supabase.js';

const resolvePlanContext = async (user) => {
  if (!user) {
    return { planKey: 'anonymous', planId: null };
  }

  if (!user.plan_id) {
    return { planKey: 'free', planId: null };
  }

  try {
    const { data, error } = await supabase
      .from('plans')
      .select('id, key')
      .eq('id', user.plan_id)
      .maybeSingle();

    if (error) {
      console.error('Failed to resolve plan for user:', error);
      return { planKey: 'free', planId: user.plan_id };
    }

    return {
      planKey: data?.key || 'free',
      planId: data?.id || user.plan_id,
    };
  } catch (err) {
    console.error('Unexpected error resolving plan:', err);
    return { planKey: 'free', planId: user.plan_id };
  }
};

const fetchPlanLimit = async (planKey, featureKey) => {
  try {
    const { data: plan, error: planError } = await supabase
      .from('plans')
      .select('id')
      .eq('key', planKey)
      .maybeSingle();

    if (planError || !plan) {
      if (planError) console.error('Error fetching plan:', planError);
      return null;
    }

    const { data: limits, error: limitsError } = await supabase
      .from('plan_features')
      .select('access_level, limit_value')
      .eq('plan_id', plan.id)
      .eq('feature_key', featureKey)
      .maybeSingle();

    if (limitsError) {
      console.error('Error fetching plan limits:', limitsError);
      return null;
    }

    return limits || null;
  } catch (error) {
    console.error('Unexpected error fetching plan limits:', error);
    return null;
  }
};

const fetchUserOverride = async (userId, featureKey) => {
  try {
    const { data, error } = await supabase
      .from('user_feature_overrides')
      .select('access_level, limit_value')
      .eq('user_id', userId)
      .eq('feature_key', featureKey)
      .maybeSingle();

    if (error) {
      console.error('Error fetching user override:', error);
      return null;
    }

    return data || null;
  } catch (err) {
    console.error('Unexpected error fetching user override:', err);
    return null;
  }
};

const buildEffectiveLimit = (planLimit, override) => {
  if (override) {
    return {
      access_level: override.access_level,
      limit_value: override.limit_value ?? 0,
      source: 'override',
    };
  }

  if (planLimit) {
    return {
      access_level: planLimit.access_level,
      limit_value: planLimit.limit_value ?? 0,
      source: 'plan',
    };
  }

  return null;
};

const getUsageCount = async ({ table, identifierColumn, identifier, featureKey }) => {
  const { count, error } = await supabase
    .from(table)
    .select('id', { count: 'exact', head: true })
    .eq(identifierColumn, identifier)
    .eq('feature_key', featureKey);

  if (error) {
    throw error;
  }

  return count || 0;
};

const formatLimitResponse = (limit, usageCount) => {
  if (!limit) {
    return {
      configured: false,
      accessLevel: null,
      limitValue: null,
      remaining: null,
      used: usageCount,
      source: null,
    };
  }

  const isUnlimited = limit.access_level === 'unlimited';
  const remaining = isUnlimited
    ? null
    : Math.max((limit.limit_value ?? 0) - usageCount, 0);

  return {
    configured: true,
    accessLevel: limit.access_level,
    limitValue: limit.limit_value ?? 0,
    remaining,
    used: usageCount,
    source: limit.source,
  };
};

export const checkFeatureAccess = (featureKey) => {
  return async (req, res, next) => {
    try {
      if (req.user?.role === 'admin') {
        return next();
      }

      const { planKey } = await resolvePlanContext(req.user);
      const identifier = req.user ? req.user.id : req.ip;

      const planLimit = await fetchPlanLimit(planKey, featureKey);
      const override = req.user ? await fetchUserOverride(req.user.id, featureKey) : null;
      const effectiveLimit = buildEffectiveLimit(planLimit, override);

      if (!effectiveLimit) {
        return res.status(403).json({
          error: 'Access denied. Feature not configured for your plan.',
          code: 'FEATURE_NOT_CONFIGURED',
        });
      }

      if (effectiveLimit.access_level === 'unlimited') {
        return next();
      }

      const usageTable = req.user ? 'user_feature_usage' : 'anonymous_feature_usage';
      const idColumn = req.user ? 'user_id' : 'identifier';
      const usageCount = await getUsageCount({
        table: usageTable,
        identifierColumn: idColumn,
        identifier,
        featureKey,
      });

      if (usageCount >= (effectiveLimit.limit_value ?? 0)) {
        const code = req.user ? 'UPGRADE_REQUIRED' : 'LOGIN_REQUIRED';
        const message = req.user
          ? "You've reached your limit for this feature. Upgrade to a Pro plan for unlimited access."
          : 'Please register for a free account to use this feature.';

        return res.status(403).json({
          error: message,
          code,
          limit: formatLimitResponse(effectiveLimit, usageCount),
        });
      }

      next();
    } catch (error) {
      console.error('Error in checkFeatureAccess middleware:', error);
      res.status(500).json({ error: 'Internal server error during access check.' });
    }
  };
};

export const logUsage = (featureKey) => {
  return async (req, res, next) => {
    res.on('finish', async () => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        try {
          const usageTable = req.user ? 'user_feature_usage' : 'anonymous_feature_usage';
          const record = req.user
            ? { user_id: req.user.id, feature_key: featureKey }
            : { identifier: req.ip, feature_key: featureKey };

          const { error } = await supabase.from(usageTable).insert(record);
          if (error) {
            console.error('Failed to log usage:', error);
          }
        } catch (err) {
          console.error('Exception in logUsage:', err);
        }
      }
    });

    next();
  };
};

export const getFeatureUsageSummary = async ({ user, ip, featureKey }) => {
  const { planKey } = await resolvePlanContext(user);
  const planLimit = await fetchPlanLimit(planKey, featureKey);
  const override = user ? await fetchUserOverride(user.id, featureKey) : null;
  const effectiveLimit = buildEffectiveLimit(planLimit, override);

  const usageTable = user ? 'user_feature_usage' : 'anonymous_feature_usage';
  const idColumn = user ? 'user_id' : 'identifier';
  const identifier = user ? user.id : ip;

  if (user?.role === 'admin') {
    const usageCount = await getUsageCount({
      table: usageTable,
      identifierColumn: idColumn,
      identifier,
      featureKey,
    });
    return {
      planKey: 'admin',
      configured: true,
      accessLevel: 'unlimited',
      limitValue: null,
      remaining: null,
      used: usageCount,
      source: 'admin',
    };
  }

  try {
    const usageCount = await getUsageCount({
      table: usageTable,
      identifierColumn: idColumn,
      identifier,
      featureKey,
    });

    return {
      planKey,
      ...formatLimitResponse(effectiveLimit, usageCount),
    };
  } catch (error) {
    console.error('Failed to compute feature usage summary:', error);
    throw error;
  }
};

export const resetFeatureUsage = async ({ userId, featureKey }) => {
  const { error } = await supabase
    .from('user_feature_usage')
    .delete()
    .eq('user_id', userId)
    .eq('feature_key', featureKey);

  if (error) {
    throw error;
  }
};

export const upsertUserFeatureOverride = async ({ userId, featureKey, access_level, limit_value }) => {
  const payload = {
    user_id: userId,
    feature_key: featureKey,
    access_level,
    limit_value,
  };

  const { data, error } = await supabase
    .from('user_feature_overrides')
    .upsert(payload, { onConflict: 'user_id, feature_key' })
    .select()
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
};

export const deleteUserFeatureOverride = async ({ userId, featureKey }) => {
  const { error } = await supabase
    .from('user_feature_overrides')
    .delete()
    .eq('user_id', userId)
    .eq('feature_key', featureKey);

  if (error) {
    throw error;
  }
};
