/**
 * Financial Aid Predictor Service
 * 
 * This service provides sophisticated algorithms to predict financial aid packages
 * based on university data, student academic profile, and financial information.
 * 
 * Algorithm considers:
 * - University-specific aid policies (need-blind, international scholarships)
 * - Student academic merit (GPA, SAT/ACT scores)
 * - Financial need (family income, EFC estimation)
 * - Demographics (first-generation, in-state, international)
 * - Historical aid data (average packages, percentage receiving aid)
 */

/**
 * Calculate Expected Family Contribution (EFC) based on federal methodology
 * Simplified version of the FAFSA formula
 */
function calculateEFC(familyIncome, dependents = 1) {
  if (!familyIncome) return 0;

  // Simplified EFC calculation
  // Real FAFSA uses complex tables, this is an approximation
  let efc = 0;

  if (familyIncome <= 30000) {
    efc = familyIncome * 0.05; // 5% of income
  } else if (familyIncome <= 50000) {
    efc = 1500 + (familyIncome - 30000) * 0.12; // Progressive scale
  } else if (familyIncome <= 75000) {
    efc = 3900 + (familyIncome - 50000) * 0.22;
  } else if (familyIncome <= 100000) {
    efc = 9400 + (familyIncome - 75000) * 0.25;
  } else if (familyIncome <= 150000) {
    efc = 15650 + (familyIncome - 100000) * 0.30;
  } else {
    efc = 30650 + (familyIncome - 150000) * 0.35;
  }

  // Adjust for dependents (simplified)
  efc = efc / Math.max(1, dependents * 0.75);

  return Math.round(efc);
}

/**
 * Calculate academic merit score (0-100)
 */
function calculateMeritScore(userProfile) {
  let score = 0;
  let factors = 0;

  // GPA contribution (0-40 points)
  if (userProfile.gpa !== null && userProfile.gpa !== undefined) {
    factors++;
    if (userProfile.gpa >= 4.0) score += 40;
    else if (userProfile.gpa >= 3.8) score += 36;
    else if (userProfile.gpa >= 3.5) score += 30;
    else if (userProfile.gpa >= 3.0) score += 22;
    else if (userProfile.gpa >= 2.5) score += 12;
    else score += 5;
  }

  // SAT contribution (0-35 points)
  if (userProfile.sat_score !== null && userProfile.sat_score !== undefined) {
    factors++;
    if (userProfile.sat_score >= 1500) score += 35;
    else if (userProfile.sat_score >= 1400) score += 30;
    else if (userProfile.sat_score >= 1300) score += 24;
    else if (userProfile.sat_score >= 1200) score += 18;
    else if (userProfile.sat_score >= 1100) score += 12;
    else score += 6;
  }

  // ACT contribution (0-35 points)
  if (userProfile.act_score !== null && userProfile.act_score !== undefined) {
    factors++;
    if (userProfile.act_score >= 33) score += 35;
    else if (userProfile.act_score >= 30) score += 30;
    else if (userProfile.act_score >= 27) score += 24;
    else if (userProfile.act_score >= 24) score += 18;
    else if (userProfile.act_score >= 21) score += 12;
    else score += 6;
  }

  // Special talents (0-25 points)
  if (userProfile.special_talents && userProfile.special_talents.length > 0) {
    factors++;
    score += Math.min(25, userProfile.special_talents.length * 8);
  }

  // Normalize to 0-100 scale
  if (factors === 0) return 0;
  
  // If both SAT and ACT are provided, average them
  if (userProfile.sat_score && userProfile.act_score) {
    factors = factors - 1; // Reduce double-counting
  }

  return Math.min(100, Math.round(score / factors * (factors === 1 ? 2.5 : factors === 2 ? 1.5 : 1.25)));
}

/**
 * Main prediction function
 */
export function predictFinancialAid(university, userProfile) {
  // Validate inputs
  if (!university) {
    throw new Error('University data is required');
  }

  if (!userProfile) {
    throw new Error('User profile is required');
  }

  // Step 1: Determine applicable tuition
  let grossTuition = 0;
  
  if (userProfile.international_student) {
    grossTuition = university.tuition_international || university.tuition_out_of_state || 50000;
  } else if (userProfile.in_state) {
    grossTuition = university.tuition_in_state || 25000;
  } else {
    grossTuition = university.tuition_out_of_state || 40000;
  }

  // Step 2: Calculate cost of living
  const costOfLiving = university.cost_of_living_est || 15000;

  // Step 3: Calculate need-based aid
  let needBasedAid = 0;
  let demonstratedNeed = 0;

  if (userProfile.family_income !== null && userProfile.family_income !== undefined) {
    const efc = calculateEFC(userProfile.family_income);
    demonstratedNeed = Math.max(0, grossTuition - efc);

    if (university.need_blind_admission) {
      // Need-blind schools typically meet 90-100% of demonstrated need
      needBasedAid = demonstratedNeed * 0.95;
    } else {
      // Regular schools meet 60-80% of demonstrated need
      const aidPercentage = (university.percentage_receiving_aid || 50) / 100;
      needBasedAid = demonstratedNeed * (0.6 + (aidPercentage * 0.2));
    }

    // First-generation bonus (additional 5-10% of need)
    if (userProfile.first_generation) {
      needBasedAid += demonstratedNeed * 0.08;
    }
  }

  // Step 4: Calculate merit-based aid
  let meritBasedAid = 0;
  const meritScore = calculateMeritScore(userProfile);
  
  if (meritScore > 0) {
    // Base merit aid on university's average aid package and student's merit score
    const baseAid = university.avg_financial_aid_package || grossTuition * 0.3;
    
    // Merit aid scales with merit score (0-100)
    // Top students (90+) can get 60-80% of base aid as merit
    // Good students (70-89) can get 40-60% of base aid
    // Average students (50-69) can get 20-40% of base aid
    // Below average (<50) get 10-20%
    
    let meritFactor = 0;
    if (meritScore >= 90) meritFactor = 0.7;
    else if (meritScore >= 75) meritFactor = 0.5;
    else if (meritScore >= 60) meritFactor = 0.35;
    else if (meritScore >= 45) meritFactor = 0.2;
    else meritFactor = 0.12;

    meritBasedAid = baseAid * meritFactor;

    // International students at schools without international scholarships get reduced merit
    if (userProfile.international_student && !university.scholarships_international) {
      meritBasedAid *= 0.4;
    }

    // In-state bonus for public universities
    if (userProfile.in_state && university.type === 'public') {
      meritBasedAid *= 1.15;
    }
  }

  // Step 5: Calculate scholarships
  let scholarships = 0;
  
  if (userProfile.international_student && university.scholarships_international) {
    // International scholarships typically range from $5k-$20k
    const intlScholarshipBase = Math.min(20000, university.avg_financial_aid_package * 0.3 || 10000);
    scholarships = intlScholarshipBase * (meritScore / 100);
  } else if (!userProfile.international_student) {
    // Domestic students have access to more scholarships
    const avgAid = university.avg_financial_aid_package || 15000;
    scholarships = avgAid * 0.2 * (meritScore / 100);
    
    // First-generation students often get additional scholarship opportunities
    if (userProfile.first_generation) {
      scholarships *= 1.3;
    }
  }

  // Step 6: Avoid double-counting - ensure aid doesn't exceed tuition significantly
  // Need and merit can overlap, so apply a reduction factor
  let totalAid = needBasedAid + meritBasedAid + scholarships;
  
  // If total aid exceeds 95% of tuition, it's likely over-estimated
  if (totalAid > grossTuition * 0.95) {
    const overageRatio = (grossTuition * 0.95) / totalAid;
    needBasedAid *= overageRatio;
    meritBasedAid *= overageRatio;
    scholarships *= overageRatio;
    totalAid = needBasedAid + meritBasedAid + scholarships;
  }

  // Step 7: Calculate final costs
  const netCost = Math.max(0, grossTuition - totalAid);
  const totalOutOfPocket = netCost + costOfLiving;

  // Step 8: Calculate scenarios (optimistic, realistic, conservative)
  const scenarios = {
    optimistic: Math.max(0, grossTuition - (totalAid * 1.25)), // 25% more aid
    realistic: netCost,
    conservative: Math.max(0, grossTuition - (totalAid * 0.75)), // 25% less aid
  };

  // Step 9: Calculate confidence score
  let confidenceScore = 50; // Base confidence

  // Increase confidence based on available data
  if (university.avg_financial_aid_package) confidenceScore += 10;
  if (university.percentage_receiving_aid) confidenceScore += 10;
  if (university.need_blind_admission !== null) confidenceScore += 5;
  if (university.scholarships_international !== null) confidenceScore += 5;
  
  // User profile completeness
  if (userProfile.gpa !== null) confidenceScore += 4;
  if (userProfile.sat_score || userProfile.act_score) confidenceScore += 4;
  if (userProfile.family_income !== null) confidenceScore += 8;
  if (userProfile.international_student !== null) confidenceScore += 2;
  if (userProfile.in_state !== null) confidenceScore += 2;

  confidenceScore = Math.min(95, confidenceScore);

  // Step 10: Prepare detailed breakdown
  return {
    gross_tuition: Math.round(grossTuition),
    estimated_aid: Math.round(totalAid),
    net_cost: Math.round(netCost),
    cost_of_living: Math.round(costOfLiving),
    total_out_of_pocket: Math.round(totalOutOfPocket),
    aid_breakdown: {
      merit_based: Math.round(meritBasedAid),
      need_based: Math.round(needBasedAid),
      scholarships: Math.round(scholarships),
    },
    confidence_score: confidenceScore,
    scenarios: {
      optimistic: Math.round(scenarios.optimistic),
      realistic: Math.round(scenarios.realistic),
      conservative: Math.round(scenarios.conservative),
    },
    methodology: {
      merit_score: Math.round(meritScore),
      demonstrated_need: Math.round(demonstratedNeed),
      efc: userProfile.family_income ? calculateEFC(userProfile.family_income) : null,
    },
  };
}

/**
 * Batch prediction for multiple universities
 */
export function predictFinancialAidBatch(universities, userProfile) {
  if (!Array.isArray(universities)) {
    throw new Error('Universities must be an array');
  }

  return universities.map(university => ({
    university_id: university.id,
    university_name: university.name,
    prediction: predictFinancialAid(university, userProfile),
  }));
}
