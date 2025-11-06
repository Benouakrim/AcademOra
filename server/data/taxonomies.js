import supabase from '../database/supabase.js';

export async function listTaxonomies() {
  const { data, error } = await supabase
    .from('taxonomies')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function getTaxonomyByKey(key) {
  const { data, error } = await supabase
    .from('taxonomies')
    .select('*')
    .eq('key', key)
    .single();
  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data || null;
}

export async function createTaxonomy({ key, name, description, sort_order = 0 }) {
  const { data, error } = await supabase
    .from('taxonomies')
    .insert([{ key, name, description: description || null, sort_order }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateTaxonomy(id, { name, description, sort_order }) {
  const updateData = {};
  if (name !== undefined) updateData.name = name;
  if (description !== undefined) updateData.description = description;
  if (sort_order !== undefined) updateData.sort_order = sort_order;

  const { data, error } = await supabase
    .from('taxonomies')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data || null;
}

export async function deleteTaxonomy(id) {
  const { error } = await supabase
    .from('taxonomies')
    .delete()
    .eq('id', id);
  if (error) throw error;
  return true;
}

export async function listTerms(taxonomyKey) {
  let query = supabase
    .from('taxonomy_terms')
    .select('*, taxonomies!inner(key)')
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true });
  if (taxonomyKey) {
    query = query.eq('taxonomies.key', taxonomyKey);
  }
  const { data, error } = await query;
  if (error) throw error;
  // Flatten
  return (data || []).map((row) => ({ ...row, taxonomy_key: row.taxonomies.key }));
}

export async function listTermsByTaxonomyId(taxonomyId) {
  const { data, error } = await supabase
    .from('taxonomy_terms')
    .select('*')
    .eq('taxonomy_id', taxonomyId)
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function createTerm({ taxonomy_id, name, slug, description, color, sort_order = 0 }) {
  const { data, error } = await supabase
    .from('taxonomy_terms')
    .insert([{ taxonomy_id, name, slug, description: description || null, color: color || null, sort_order }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateTerm(id, { name, slug, description, color, sort_order }) {
  const updateData = {};
  if (name !== undefined) updateData.name = name;
  if (slug !== undefined) updateData.slug = slug;
  if (description !== undefined) updateData.description = description;
  if (color !== undefined) updateData.color = color;
  if (sort_order !== undefined) updateData.sort_order = sort_order;

  const { data, error } = await supabase
    .from('taxonomy_terms')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data || null;
}

export async function deleteTerm(id) {
  const { error } = await supabase
    .from('taxonomy_terms')
    .delete()
    .eq('id', id);
  if (error) throw error;
  return true;
}

export async function listArticleTerms(articleId) {
  const { data, error } = await supabase
    .from('article_terms')
    .select('term_id, taxonomy_terms(*, taxonomies!inner(key, name))')
    .eq('article_id', articleId);
  if (error) throw error;
  return (data || []).map((row) => row.taxonomy_terms);
}

export async function setArticleTerms(articleId, termIds) {
  // Replace strategy: delete then insert
  let { error: delError } = await supabase
    .from('article_terms')
    .delete()
    .eq('article_id', articleId);
  if (delError) throw delError;

  if (!termIds || termIds.length === 0) return true;

  const inserts = termIds.map((termId) => ({ article_id: articleId, term_id: termId }));
  const { error } = await supabase
    .from('article_terms')
    .insert(inserts);
  if (error) throw error;
  return true;
}
