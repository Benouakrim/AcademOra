import { getAllUniversities } from '../data/universities.js';

/**
 * New simplified scoring per Phase 2 requirements.
 * Accepts a complex criteria object with module toggles. Each enabled module
 * can deduct fixed points for mismatches. Starts from base 100.
 *
 * Input example:
 * {
 *   academics: { enabled: boolean, filters: { minGpa, testPolicy, degreeLevels: [] } },
 *   financials: { enabled: boolean, filters: { maxBudget, requireScholarships } },
 *   lifestyle: { enabled: boolean, filters: { countries: [], settings: [], climates: [] } },
 *   future: { enabled: boolean, filters: { minVisaMonths, minSalary } }
 * }
 */
function scoreUniversity(uni = {}, criteria = {}) {
  const explanations = [];

  // Start with base score of 100
  let score = 100;

  // Helper getters and safe normalization
  const get = (obj, path, fallback = undefined) => {
    try {
      return path.split('.').reduce((o, k) => (o && o[k] !== undefined ? o[k] : fallback), obj);
    } catch (e) {
      return fallback;
    }
  };

  // Academics: -20 if GPA below min; -10 if test policy mismatch
  const academicsEnabled = get(criteria, 'academics.enabled') === true;
  if (academicsEnabled) {
    const minGpa = get(criteria, 'academics.filters.minGpa', null);
    if (typeof minGpa === 'number' && typeof uni.min_gpa === 'number') {
      if (uni.min_gpa < minGpa) {
        score -= 20;
        explanations.push(`Academics: university min_gpa ${uni.min_gpa} < required ${minGpa} (-20)`);
      } else {
        explanations.push(`Academics: university min_gpa ${uni.min_gpa} >= required ${minGpa} (ok)`);
      }
    }

    const testPolicy = get(criteria, 'academics.filters.testPolicy', null);
    if (testPolicy) {
      const uniTests = Array.isArray(uni.required_tests) ? uni.required_tests.map((t) => String(t).toLowerCase()) : [];
      const tp = String(testPolicy).toLowerCase();
      let mismatch = false;

      if (tp === 'no-test') {
        if (uniTests.length > 0) mismatch = true;
      } else if (tp === 'requires-test') {
        if (uniTests.length === 0) mismatch = true;
      } else {
        // treat as specific test name; mismatch if not present
        if (!uniTests.includes(tp)) mismatch = true;
      }

      if (mismatch) {
        score -= 10;
        explanations.push(`Academics: test policy mismatch (${testPolicy}) (-10)`);
      } else {
        explanations.push(`Academics: test policy OK (${testPolicy})`);
      }
    }
  } else {
    explanations.push('Academics disabled — neutral');
  }

  // Financials: -30 if tuition_intl > maxBudget (we map to avg_tuition_per_year)
  const financialsEnabled = get(criteria, 'financials.enabled') === true;
  if (financialsEnabled) {
    const maxBudget = get(criteria, 'financials.filters.maxBudget', null);
    if (typeof maxBudget === 'number' && typeof uni.avg_tuition_per_year === 'number') {
      if (uni.avg_tuition_per_year > maxBudget) {
        score -= 30;
        explanations.push(`Financials: tuition ${uni.avg_tuition_per_year} > maxBudget ${maxBudget} (-30)`);
      } else {
        explanations.push(`Financials: tuition ${uni.avg_tuition_per_year} <= maxBudget ${maxBudget} (ok)`);
      }
    }
  } else {
    explanations.push('Financials disabled — neutral');
  }

  // Lifestyle: -15 if country NOT in preferred list (if list not empty)
  const lifestyleEnabled = get(criteria, 'lifestyle.enabled') === true;
  if (lifestyleEnabled) {
    const countries = get(criteria, 'lifestyle.filters.countries', []);
    if (Array.isArray(countries) && countries.length > 0) {
      const uniCountry = uni.country ? String(uni.country).toLowerCase() : '';
      const normalized = countries.map((c) => String(c).toLowerCase());
      if (!normalized.includes(uniCountry)) {
        score -= 15;
        explanations.push(`Lifestyle: country ${uni.country || 'unknown'} not in preferred list (-15)`);
      } else {
        explanations.push(`Lifestyle: country ${uni.country} preferred (ok)`);
      }
    } else {
      explanations.push('Lifestyle: no country preferences provided — neutral');
    }
  } else {
    explanations.push('Lifestyle disabled — neutral');
  }

  // Future: -20 if post_study_visa_months < minVisaMonths (map to post_grad_visa_strength)
  const futureEnabled = get(criteria, 'future.enabled') === true;
  if (futureEnabled) {
    const minVisaMonths = get(criteria, 'future.filters.minVisaMonths', null);
    if (typeof minVisaMonths === 'number' && typeof uni.post_grad_visa_strength === 'number') {
      if (uni.post_grad_visa_strength < minVisaMonths) {
        score -= 20;
        explanations.push(`Future: visa months ${uni.post_grad_visa_strength} < required ${minVisaMonths} (-20)`);
      } else {
        explanations.push(`Future: visa months ${uni.post_grad_visa_strength} >= required ${minVisaMonths} (ok)`);
      }
    }
  } else {
    explanations.push('Future disabled — neutral');
  }

  // Ensure score is between 0 and 100
  if (score < 0) score = 0;
  if (score > 100) score = 100;

  return { score: Math.round(score), explanations };
}

export async function matchUniversities(criteria = {}, topN = 10) {
  const universities = await getAllUniversities();

  const scored = universities.map((u) => {
    const { score, explanations } = scoreUniversity(u, criteria);
    return { ...u, score, explanations };
  });

  const filtered = scored.filter((s) => s.score >= 1);

  filtered.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    const aTuition = typeof a.avg_tuition_per_year === 'number' ? a.avg_tuition_per_year : Infinity;
    const bTuition = typeof b.avg_tuition_per_year === 'number' ? b.avg_tuition_per_year : Infinity;
    return aTuition - bTuition;
  });

  return filtered.slice(0, topN);
}
