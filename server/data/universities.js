import supabase from '../database/supabase.js';

// Helper to convert comma-separated string -> string[]
function csvToArray(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

// Helper to normalize numeric fields
function toNumberOrNull(val) {
  if (val === undefined || val === null || val === '') return null;
  const n = Number(val);
  return Number.isNaN(n) ? null : n;
}

export async function getMatchingUniversities(criteria) {
  try {
    let query = supabase.from('universities').select('*');

    if (criteria?.interests && criteria.interests.length > 0) {
      query = query.overlaps('interests', criteria.interests);
    }

    if (criteria?.maxBudget) {
      query = query.lte('avg_tuition_per_year', criteria.maxBudget);
    }

    if (criteria?.minGpa) {
      query = query.gte('min_gpa', criteria.minGpa);
    }

    if (criteria?.country && criteria.country.toLowerCase() !== 'any') {
      query = query.eq('country', criteria.country);
    }

    // New filters: degree levels, languages, cost of living
    if (criteria?.academics?.filters?.degreeLevel) {
      query = query.overlaps('degree_levels', [criteria.academics.filters.degreeLevel]);
    }

    if (criteria?.academics?.filters?.languages && criteria.academics.filters.languages.length > 0) {
      query = query.overlaps('languages', criteria.academics.filters.languages);
    }

    if (criteria?.financials?.filters?.maxCostOfLiving) {
      query = query.lte('cost_of_living_index', criteria.financials.filters.maxCostOfLiving);
    }

    query = query.order('avg_tuition_per_year', { ascending: true });

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch matching universities');
  }
}

export async function getAllUniversities() {
  try {
    const { data, error } = await supabase
      .from('universities')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    throw error;
  }
}

export async function getUniversityById(id) {
  try {
    const { data, error } = await supabase
      .from('universities')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data || null;
  } catch (error) {
    throw error;
  }
}

export async function getUniversityBySlug(slug) {
  try {
    const { data, error } = await supabase
      .from('universities')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data || null;
  } catch (error) {
    throw error;
  }
}

export async function createUniversity(payload) {
  try {
    const insert = {
      name: payload.name || null,
      country: payload.country || null,
      description: payload.description || null,
      image_url: payload.image_url || null,
      program_url: payload.program_url || null,
      avg_tuition_per_year: toNumberOrNull(payload.avg_tuition_per_year),
      min_gpa: toNumberOrNull(payload.min_gpa),
      application_deadline: payload.application_deadline || null,
      acceptance_rate: toNumberOrNull(payload.acceptance_rate),
      ranking_world: toNumberOrNull(payload.ranking_world),
      interests: csvToArray(payload.interests),
      required_tests: csvToArray(payload.required_tests),
      // New fields
      degree_levels: csvToArray(payload.degree_levels),
      languages: csvToArray(payload.languages),
      ranking_tier: payload.ranking_tier || null,
      scholarship_availability: toNumberOrNull(payload.scholarship_availability),
      cost_of_living_index: toNumberOrNull(payload.cost_of_living_index),
      campus_setting: payload.campus_setting || null,
      climate: payload.climate || null,
      post_grad_visa_strength: toNumberOrNull(payload.post_grad_visa_strength),
      internship_strength: toNumberOrNull(payload.internship_strength),
      metadata: payload.metadata || null,
      group_id: payload.group_id || null,
    };

    const { data, error } = await supabase
      .from('universities')
      .insert([insert])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    throw error;
  }
}

export async function updateUniversity(id, payload) {
  try {
    const update = {};
    if (payload.name !== undefined) update.name = payload.name;
    if (payload.country !== undefined) update.country = payload.country;
    if (payload.description !== undefined) update.description = payload.description;
    if (payload.image_url !== undefined) update.image_url = payload.image_url;
    if (payload.program_url !== undefined) update.program_url = payload.program_url;
    if (payload.avg_tuition_per_year !== undefined) update.avg_tuition_per_year = toNumberOrNull(payload.avg_tuition_per_year);
    if (payload.min_gpa !== undefined) update.min_gpa = toNumberOrNull(payload.min_gpa);
    if (payload.application_deadline !== undefined) update.application_deadline = payload.application_deadline || null;
    if (payload.acceptance_rate !== undefined) update.acceptance_rate = toNumberOrNull(payload.acceptance_rate);
    if (payload.ranking_world !== undefined) update.ranking_world = toNumberOrNull(payload.ranking_world);
    if (payload.interests !== undefined) update.interests = csvToArray(payload.interests);
    if (payload.required_tests !== undefined) update.required_tests = csvToArray(payload.required_tests);
    if (payload.degree_levels !== undefined) update.degree_levels = csvToArray(payload.degree_levels);
    if (payload.languages !== undefined) update.languages = csvToArray(payload.languages);
    if (payload.ranking_tier !== undefined) update.ranking_tier = payload.ranking_tier || null;
    if (payload.scholarship_availability !== undefined) update.scholarship_availability = toNumberOrNull(payload.scholarship_availability);
    if (payload.cost_of_living_index !== undefined) update.cost_of_living_index = toNumberOrNull(payload.cost_of_living_index);
    if (payload.campus_setting !== undefined) update.campus_setting = payload.campus_setting || null;
    if (payload.climate !== undefined) update.climate = payload.climate || null;
    if (payload.post_grad_visa_strength !== undefined) update.post_grad_visa_strength = toNumberOrNull(payload.post_grad_visa_strength);
    if (payload.internship_strength !== undefined) update.internship_strength = toNumberOrNull(payload.internship_strength);
    if (payload.metadata !== undefined) update.metadata = payload.metadata;
    if (payload.group_id !== undefined) update.group_id = payload.group_id || null;

    const { data, error } = await supabase
      .from('universities')
      .update(update)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data || null;
  } catch (error) {
    throw error;
  }
}

export async function deleteUniversity(id) {
  try {
    const { error } = await supabase
      .from('universities')
      .delete()
      .eq('id', id);

    if (error) {
      if (error.code === 'PGRST116') return false;
      throw error;
    }
    return true;
  } catch (error) {
    throw error;
  }
}