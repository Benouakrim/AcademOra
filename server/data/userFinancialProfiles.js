import supabase from '../database/supabase.js';

const TABLE = 'user_financial_profiles';

const toNumberOrNull = (value) => {
  if (value === undefined || value === null || value === '') return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
};

const toBooleanOrNull = (value) => {
  if (value === undefined || value === null || value === '') return null;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    if (value.toLowerCase() === 'true') return true;
    if (value.toLowerCase() === 'false') return false;
  }
  return Boolean(value);
};

const toStringArray = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value
      .map((entry) => (typeof entry === 'string' ? entry.trim() : ''))
      .filter(Boolean);
  }
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((entry) => entry.trim())
      .filter(Boolean);
  }
  return [];
};

const normalizeProfile = (record) => {
  if (!record) return null;
  return {
    user_id: record.user_id,
    gpa: record.gpa ?? null,
    sat_score: record.sat_score ?? null,
    act_score: record.act_score ?? null,
    family_income: record.family_income ?? null,
    international_student: record.international_student ?? null,
    in_state: record.in_state ?? null,
    first_generation: record.first_generation ?? null,
    special_talents: Array.isArray(record.special_talents) ? record.special_talents : [],
    created_at: record.created_at,
    updated_at: record.updated_at,
  };
};

export async function getFinancialProfile(userId) {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;
  return normalizeProfile(data);
}

export async function upsertFinancialProfile(userId, payload) {
  const rawIncome = toNumberOrNull(payload?.family_income);

  const updateData = {
    user_id: userId,
    gpa: toNumberOrNull(payload?.gpa),
    sat_score: toNumberOrNull(payload?.sat_score),
    act_score: toNumberOrNull(payload?.act_score),
    family_income: rawIncome !== null ? Math.round(rawIncome) : null,
    international_student: toBooleanOrNull(payload?.international_student),
    in_state: toBooleanOrNull(payload?.in_state),
    first_generation: toBooleanOrNull(payload?.first_generation),
    special_talents: toStringArray(payload?.special_talents),
  };

  const { data, error } = await supabase
    .from(TABLE)
    .upsert(updateData, { onConflict: 'user_id' })
    .select('*')
    .single();

  if (error) throw error;
  return normalizeProfile(data);
}


