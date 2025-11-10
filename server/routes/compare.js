import express from 'express';
import { parseUserToken, requireUser } from '../middleware/auth.js';
import { checkFeatureAccess, logUsage } from '../middleware/accessControl.js';
import { getAllUniversities, getUniversityById } from '../data/universities.js';
import { getFinancialProfile } from '../data/userFinancialProfiles.js';
import { predictFinancialAidBatch } from '../services/financialAidPredictor.js';
import {
  createSavedComparison,
  getSavedComparisonsByUserId,
  getSavedComparisonById,
  updateSavedComparison,
  deleteSavedComparison,
  toggleComparisonFavorite,
  markComparisonAsViewed,
  getSavedComparisonsCount,
  findDuplicateComparison,
} from '../data/savedComparisons.js';

const router = express.Router();

// GET /api/compare
// Get all universities for comparison (light data)
router.get(
  '/',
  parseUserToken,
  checkFeatureAccess('compare-universities'),
  logUsage('compare-universities'),
  async (req, res) => {
    try {
      const universities = await getAllUniversities();
      
      // Return lighter data for the list view
      const lightData = universities.map(u => ({
        id: u.id,
        name: u.name,
        country: u.country,
        city: u.city,
        state: u.state,
        logo_url: u.logo_url,
        ranking_global: u.ranking_global,
        acceptance_rate: u.acceptance_rate,
        avg_tuition_per_year: u.avg_tuition_per_year,
        tuition_international: u.tuition_international,
        tuition_out_of_state: u.tuition_out_of_state,
        tuition_in_state: u.tuition_in_state,
      }));
      
      res.json(lightData);
    } catch (error) {
      console.error('Error fetching compare universities:', error);
      res.status(500).json({ error: 'Failed to fetch university comparison data.' });
    }
  }
);

// POST /api/compare/detailed
// Get detailed comparison for specific universities
router.post(
  '/detailed',
  parseUserToken,
  requireUser,
  checkFeatureAccess('compare-universities'),
  async (req, res) => {
    try {
      const { university_ids } = req.body;
      
      if (!university_ids || !Array.isArray(university_ids)) {
        return res.status(400).json({ error: 'university_ids array is required' });
      }
      
      if (university_ids.length > 5) {
        return res.status(400).json({ error: 'Maximum 5 universities can be compared at once' });
      }
      
      // Fetch full university details
      const universities = await Promise.all(
        university_ids.map(id => getUniversityById(id))
      );
      
      const validUniversities = universities.filter(u => u !== null);
      
      if (validUniversities.length === 0) {
        return res.status(404).json({ error: 'No valid universities found' });
      }
      
      res.json({
        universities: validUniversities,
        count: validUniversities.length,
      });
    } catch (error) {
      console.error('Error fetching detailed comparison:', error);
      res.status(500).json({ error: 'Failed to fetch detailed comparison data.' });
    }
  }
);

// POST /api/compare/with-predictions
// Get comparison with financial aid predictions
router.post(
  '/with-predictions',
  parseUserToken,
  requireUser,
  checkFeatureAccess('compare-universities'),
  async (req, res) => {
    try {
      const userId = req.user?.id;
      const { university_ids } = req.body;
      
      if (!university_ids || !Array.isArray(university_ids)) {
        return res.status(400).json({ error: 'university_ids array is required' });
      }
      
      if (university_ids.length > 5) {
        return res.status(400).json({ error: 'Maximum 5 universities can be compared at once' });
      }
      
      // Fetch universities
      const universities = await Promise.all(
        university_ids.map(id => getUniversityById(id))
      );
      
      const validUniversities = universities.filter(u => u !== null);
      
      if (validUniversities.length === 0) {
        return res.status(404).json({ error: 'No valid universities found' });
      }
      
      // Try to get user's financial profile for predictions
      let predictions = null;
      let profileComplete = false;
      
      try {
        const userProfile = await getFinancialProfile(userId);
        
        if (userProfile) {
          profileComplete = Boolean(
            userProfile.gpa !== null &&
            userProfile.family_income !== null &&
            userProfile.international_student !== null &&
            userProfile.in_state !== null
          );
          
          if (profileComplete) {
            // Generate predictions for all universities
            predictions = predictFinancialAidBatch(validUniversities, userProfile);
          }
        }
      } catch (error) {
        console.warn('Could not fetch financial profile for predictions:', error.message);
        // Continue without predictions
      }
      
      res.json({
        universities: validUniversities,
        predictions: predictions,
        profile_complete: profileComplete,
        count: validUniversities.length,
      });
    } catch (error) {
      console.error('Error fetching comparison with predictions:', error);
      res.status(500).json({ error: 'Failed to fetch comparison with predictions.' });
    }
  }
);

// POST /api/compare/analyze
// Get comparative analysis and insights
router.post(
  '/analyze',
  parseUserToken,
  requireUser,
  checkFeatureAccess('compare-universities'),
  async (req, res) => {
    try {
      const { university_ids } = req.body;
      
      if (!university_ids || !Array.isArray(university_ids)) {
        return res.status(400).json({ error: 'university_ids array is required' });
      }
      
      // Fetch universities
      const universities = await Promise.all(
        university_ids.map(id => getUniversityById(id))
      );
      
      const validUniversities = universities.filter(u => u !== null);
      
      if (validUniversities.length < 2) {
        return res.status(400).json({ error: 'At least 2 universities required for analysis' });
      }
      
      // Calculate comparative metrics
      const analysis = {
        cost_analysis: calculateCostAnalysis(validUniversities),
        academic_analysis: calculateAcademicAnalysis(validUniversities),
        location_analysis: calculateLocationAnalysis(validUniversities),
        recommendations: generateRecommendations(validUniversities),
      };
      
      res.json(analysis);
    } catch (error) {
      console.error('Error analyzing universities:', error);
      res.status(500).json({ error: 'Failed to analyze universities.' });
    }
  }
);

// Helper functions for analysis
function calculateCostAnalysis(universities) {
  const costs = universities.map(u => ({
    id: u.id,
    name: u.name,
    avg_tuition: u.avg_tuition_per_year || 0,
    int_tuition: u.tuition_international || u.tuition_out_of_state || 0,
    cost_of_living: u.cost_of_living_est || 15000,
  }));
  
  const avgTuitions = costs.map(c => c.avg_tuition).filter(t => t > 0);
  const avgCost = avgTuitions.length > 0 
    ? avgTuitions.reduce((a, b) => a + b, 0) / avgTuitions.length 
    : 0;
  
  return {
    universities: costs,
    average_tuition: Math.round(avgCost),
    lowest_cost: costs.reduce((min, u) => 
      u.avg_tuition > 0 && u.avg_tuition < min.avg_tuition ? u : min
    ),
    highest_cost: costs.reduce((max, u) => 
      u.avg_tuition > max.avg_tuition ? u : max
    ),
  };
}

function calculateAcademicAnalysis(universities) {
  const academics = universities.map(u => ({
    id: u.id,
    name: u.name,
    ranking_global: u.ranking_global,
    ranking_national: u.ranking_national,
    acceptance_rate: u.acceptance_rate,
    avg_gpa: u.avg_gpa_admitted,
    student_faculty_ratio: u.student_faculty_ratio,
  }));
  
  return {
    universities: academics,
    most_selective: academics.reduce((min, u) => 
      u.acceptance_rate && (!min.acceptance_rate || u.acceptance_rate < min.acceptance_rate) ? u : min
    ),
    highest_ranked: academics.reduce((best, u) => 
      u.ranking_global && (!best.ranking_global || u.ranking_global < best.ranking_global) ? u : best
    ),
  };
}

function calculateLocationAnalysis(universities) {
  const locations = universities.map(u => ({
    id: u.id,
    name: u.name,
    country: u.country,
    city: u.city,
    state: u.state,
    campus_setting: u.campus_setting,
    climate: u.climate,
    safety_rating: u.safety_rating,
  }));
  
  const countries = [...new Set(locations.map(l => l.country).filter(Boolean))];
  const cities = [...new Set(locations.map(l => l.city).filter(Boolean))];
  
  return {
    universities: locations,
    unique_countries: countries,
    unique_cities: cities,
    diversity: {
      countries: countries.length,
      cities: cities.length,
    },
  };
}

function generateRecommendations(universities) {
  const recommendations = [];
  
  // Best value recommendation
  const withCostAndRanking = universities.filter(u => 
    u.avg_tuition_per_year && u.ranking_global
  );
  
  if (withCostAndRanking.length > 0) {
    const bestValue = withCostAndRanking.reduce((best, u) => {
      const valueScore = (1000 - u.ranking_global) / (u.avg_tuition_per_year / 10000);
      const bestScore = (1000 - best.ranking_global) / (best.avg_tuition_per_year / 10000);
      return valueScore > bestScore ? u : best;
    });
    
    recommendations.push({
      type: 'best_value',
      university_id: bestValue.id,
      university_name: bestValue.name,
      reason: 'Best combination of ranking and affordability',
    });
  }
  
  // Most prestigious
  const withRanking = universities.filter(u => u.ranking_global);
  if (withRanking.length > 0) {
    const mostPrestigious = withRanking.reduce((best, u) => 
      u.ranking_global < best.ranking_global ? u : best
    );
    
    recommendations.push({
      type: 'most_prestigious',
      university_id: mostPrestigious.id,
      university_name: mostPrestigious.name,
      reason: `Highest ranked (#${mostPrestigious.ranking_global} globally)`,
    });
  }
  
  // Most affordable
  const withCost = universities.filter(u => u.avg_tuition_per_year);
  if (withCost.length > 0) {
    const mostAffordable = withCost.reduce((cheapest, u) => 
      u.avg_tuition_per_year < cheapest.avg_tuition_per_year ? u : cheapest
    );
    
    recommendations.push({
      type: 'most_affordable',
      university_id: mostAffordable.id,
      university_name: mostAffordable.name,
      reason: `Lowest tuition ($${Math.round(mostAffordable.avg_tuition_per_year).toLocaleString()}/year)`,
    });
  }
  
  // Best for international students
  const withIntSupport = universities.filter(u => 
    u.scholarships_international || u.international_student_percentage > 10
  );
  
  if (withIntSupport.length > 0) {
    const bestForInternational = withIntSupport.reduce((best, u) => {
      const score = (u.scholarships_international ? 50 : 0) + 
                   (u.international_student_percentage || 0);
      const bestScore = (best.scholarships_international ? 50 : 0) + 
                       (best.international_student_percentage || 0);
      return score > bestScore ? u : best;
    });
    
    recommendations.push({
      type: 'best_for_international',
      university_id: bestForInternational.id,
      university_name: bestForInternational.name,
      reason: 'Strong international student support and opportunities',
    });
  }
  
  return recommendations;
}

// ========== Saved Comparisons Routes ==========

// POST /api/compare/saved
// Save a comparison for later viewing
router.post(
  '/saved',
  parseUserToken,
  requireUser,
  checkFeatureAccess('compare-universities'),
  async (req, res) => {
    try {
      const userId = req.user?.id;
      const { name, description, university_ids } = req.body;

      if (!name || !university_ids || !Array.isArray(university_ids)) {
        return res.status(400).json({ error: 'name and university_ids array are required' });
      }

      if (university_ids.length < 2 || university_ids.length > 5) {
        return res.status(400).json({ error: 'Must save between 2 and 5 universities' });
      }

      // Check for duplicates
      const duplicate = await findDuplicateComparison(userId, university_ids);
      if (duplicate) {
        return res.status(409).json({ 
          error: 'A comparison with these universities already exists',
          existing_id: duplicate.id 
        });
      }

      const savedComparison = await createSavedComparison({
        userId,
        name,
        description,
        universityIds: university_ids,
      });

      res.status(201).json(savedComparison);
    } catch (error) {
      console.error('Error saving comparison:', error);
      res.status(500).json({ error: 'Failed to save comparison' });
    }
  }
);

// GET /api/compare/saved
// Get all saved comparisons for the current user
router.get(
  '/saved',
  parseUserToken,
  requireUser,
  checkFeatureAccess('compare-universities'),
  async (req, res) => {
    try {
      const userId = req.user?.id;
      const { 
        limit = 50, 
        offset = 0, 
        sort_by = 'created_at',
        sort_order = 'desc',
        favorites_only = false 
      } = req.query;

      const comparisons = await getSavedComparisonsByUserId(userId, {
        limit: parseInt(limit),
        offset: parseInt(offset),
        sortBy: sort_by,
        sortOrder: sort_order,
        favoritesOnly: favorites_only === 'true',
      });

      const count = await getSavedComparisonsCount(userId);

      res.json({
        comparisons,
        count,
        has_more: offset + comparisons.length < count,
      });
    } catch (error) {
      console.error('Error fetching saved comparisons:', error);
      res.status(500).json({ error: 'Failed to fetch saved comparisons' });
    }
  }
);

// GET /api/compare/saved/:id
// Get a specific saved comparison with full university data
router.get(
  '/saved/:id',
  parseUserToken,
  requireUser,
  checkFeatureAccess('compare-universities'),
  async (req, res) => {
    try {
      const userId = req.user?.id;
      const { id } = req.params;

      const savedComparison = await getSavedComparisonById(id, userId);
      if (!savedComparison) {
        return res.status(404).json({ error: 'Saved comparison not found' });
      }

      // Mark as viewed
      await markComparisonAsViewed(id, userId);

      // Fetch full university details
      const universities = await Promise.all(
        savedComparison.university_ids.map(uId => getUniversityById(uId))
      );

      const validUniversities = universities.filter(u => u !== null);

      // Try to get predictions if user has a complete profile
      let predictions = null;
      let profileComplete = false;

      try {
        const userProfile = await getFinancialProfile(userId);
        if (userProfile) {
          profileComplete = Boolean(
            userProfile.gpa !== null &&
            userProfile.family_income !== null &&
            userProfile.international_student !== null &&
            userProfile.in_state !== null
          );
          
          if (profileComplete) {
            predictions = predictFinancialAidBatch(validUniversities, userProfile);
          }
        }
      } catch (error) {
        console.warn('Could not fetch financial profile:', error.message);
      }

      res.json({
        ...savedComparison,
        universities: validUniversities,
        predictions,
        profile_complete: profileComplete,
      });
    } catch (error) {
      console.error('Error fetching saved comparison:', error);
      res.status(500).json({ error: 'Failed to fetch saved comparison' });
    }
  }
);

// PUT /api/compare/saved/:id
// Update a saved comparison
router.put(
  '/saved/:id',
  parseUserToken,
  requireUser,
  checkFeatureAccess('compare-universities'),
  async (req, res) => {
    try {
      const userId = req.user?.id;
      const { id } = req.params;
      const { name, description, university_ids } = req.body;

      const updates = {
        name,
        description,
        universityIds: university_ids,
      };

      if (university_ids && (university_ids.length < 2 || university_ids.length > 5)) {
        return res.status(400).json({ error: 'Must have between 2 and 5 universities' });
      }

      const updatedComparison = await updateSavedComparison(id, userId, updates);
      res.json(updatedComparison);
    } catch (error) {
      console.error('Error updating saved comparison:', error);
      res.status(500).json({ error: 'Failed to update comparison' });
    }
  }
);

// DELETE /api/compare/saved/:id
// Delete a saved comparison
router.delete(
  '/saved/:id',
  parseUserToken,
  requireUser,
  checkFeatureAccess('compare-universities'),
  async (req, res) => {
    try {
      const userId = req.user?.id;
      const { id } = req.params;

      await deleteSavedComparison(id, userId);
      res.json({ success: true, message: 'Comparison deleted successfully' });
    } catch (error) {
      console.error('Error deleting saved comparison:', error);
      res.status(500).json({ error: 'Failed to delete comparison' });
    }
  }
);

// POST /api/compare/saved/:id/favorite
// Toggle favorite status of a saved comparison
router.post(
  '/saved/:id/favorite',
  parseUserToken,
  requireUser,
  checkFeatureAccess('compare-universities'),
  async (req, res) => {
    try {
      const userId = req.user?.id;
      const { id } = req.params;

      const updatedComparison = await toggleComparisonFavorite(id, userId);
      res.json(updatedComparison);
    } catch (error) {
      console.error('Error toggling favorite status:', error);
      res.status(500).json({ error: 'Failed to toggle favorite status' });
    }
  }
);

export default router;

