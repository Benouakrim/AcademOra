export interface University {
  id: string;
  name: string;
  country?: string | null;
  description?: string | null;
  image_url?: string | null;
  program_url?: string | null;
  avg_tuition_per_year?: number | null;
  min_gpa?: number | null;
  application_deadline?: string | null;
  acceptance_rate?: number | null;
  ranking_world?: number | null;
  interests?: string[];
  required_tests?: string[];
  metadata?: any;

  // New Future Mixer fields
  degree_levels?: string[]; // e.g. ['Bachelors','Masters']
  languages?: string[];
  ranking_tier?: string | null; // e.g. 'Top 50'

  scholarship_availability?: number | null; // 1-5
  cost_of_living_index?: number | null; // 1-100

  campus_setting?: string | null; // 'Urban' | 'Suburban' | 'Rural'
  climate?: string | null; // 'Warm' | 'Temperate' | 'Cold'

  post_grad_visa_strength?: number | null; // 1-5
  internship_strength?: number | null; // 1-5
}

export type MatchingCriteria = {
  academics?: { enabled: boolean; filters?: any };
  financials?: { enabled: boolean; filters?: any };
  lifestyle?: { enabled: boolean; filters?: any };
  future?: { enabled: boolean; filters?: any };
  // legacy/simple fields for backward compatibility
  interests?: string[];
  minGpa?: number;
  maxBudget?: number;
  country?: string;
};
