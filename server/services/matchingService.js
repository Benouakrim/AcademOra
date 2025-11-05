import { getAllUniversities } from '../data/universities.js';

/**
 * Compute a score (0..100) for a university given student criteria.
 * Weights (default): interests 40%, gpa 25%, budget 25%, country 10%.
 */
function scoreUniversity(uni, criteria, weights = { interests: 0.4, gpa: 0.25, budget: 0.25, country: 0.1 }) {
  const explanations = [];

  // Interests score: fraction of user's interests matched
  let interestsScore = 0;
  if (criteria.interests && criteria.interests.length > 0) {
    const matched = uni.interests?.filter(i => criteria.interests.includes(i)) || [];
    interestsScore = matched.length / criteria.interests.length;
    explanations.push(`Interests matched: ${matched.length}/${criteria.interests.length}`);
  } else {
    interestsScore = 0.5; // neutral when user didn't specify
    explanations.push('No interests provided — neutral score');
  }

  // GPA score: student meets or exceeds required min_gpa
  let gpaScore = 0;
  if (criteria.minGpa && uni.min_gpa) {
    if (criteria.minGpa >= uni.min_gpa) {
      gpaScore = 1;
      explanations.push(`GPA meets requirement (you: ${criteria.minGpa}, required: ${uni.min_gpa})`);
    } else {
      gpaScore = Math.max(0, criteria.minGpa / uni.min_gpa);
      explanations.push(`GPA below requirement (you: ${criteria.minGpa}, required: ${uni.min_gpa})`);
    }
  } else {
    gpaScore = 0.5;
    explanations.push('GPA not provided — neutral score');
  }

  // Budget score: 1 if within budget, otherwise decreasing
  let budgetScore = 0;
  if (criteria.maxBudget && typeof uni.avg_tuition_per_year === 'number') {
    if (uni.avg_tuition_per_year <= criteria.maxBudget) {
      budgetScore = 1;
      explanations.push(`Within budget ($${uni.avg_tuition_per_year} ≤ $${criteria.maxBudget})`);
    } else {
      // scale down based on how far above the budget
      const diff = uni.avg_tuition_per_year - criteria.maxBudget;
      budgetScore = Math.max(0, 1 - diff / Math.max(criteria.maxBudget, 1));
      explanations.push(`Above budget by $${diff}`);
    }
  } else {
    budgetScore = 0.5;
    explanations.push('Budget not provided — neutral score');
  }

  // Country score
  let countryScore = 0;
  if (!criteria.country || criteria.country.toLowerCase() === 'any') {
    countryScore = 1;
    explanations.push('No country preference');
  } else if (uni.country && uni.country.toLowerCase() === criteria.country.toLowerCase()) {
    countryScore = 1;
    explanations.push(`Preferred country match: ${uni.country}`);
  } else {
    countryScore = 0.5;
    explanations.push(`Different country: ${uni.country}`);
  }

  // Weighted sum
  const rawScore =
    interestsScore * weights.interests +
    gpaScore * weights.gpa +
    budgetScore * weights.budget +
    countryScore * weights.country;

  const score = Math.round(rawScore * 100);
  return { score, explanations };
}

/**
 * Main entry: fetch universities and return top N scored matches.
 * @param {object} criteria
 * @param {number} topN
 */
export async function matchUniversities(criteria = {}, topN = 10) {
  // Fetch all universities and compute scores. We keep this simple and do in-memory ranking.
  const universities = await getAllUniversities();

  const scored = universities.map(u => {
    const { score, explanations } = scoreUniversity(u, criteria);
    return { ...u, score, explanations };
  });

  // Optional filtering: remove very low scores (e.g., <20)
  const filtered = scored.filter(s => s.score >= 20);

  // Sort by score desc, then tuition asc as tiebreaker
  filtered.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.avg_tuition_per_year - b.avg_tuition_per_year;
  });

  return filtered.slice(0, topN);
}
