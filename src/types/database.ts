export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      articles: {
        Row: {
          id: string
          title: string
          slug: string
          content: string
          excerpt: string
          author_id: string
          category: string
          published: boolean
          featured_image?: string
          created_at: string
          updated_at: string
          is_premium: boolean
        }
        Insert: {
          id?: string
          title: string
          slug: string
          content: string
          excerpt: string
          author_id: string
          category: string
          published?: boolean
          featured_image?: string
          created_at?: string
          updated_at?: string
          is_premium?: boolean
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          content?: string
          excerpt?: string
          author_id?: string
          category?: string
          published?: boolean
          featured_image?: string
          created_at?: string
          updated_at?: string
          is_premium?: boolean
        }
      }
      universities: {
        Row: {
          id: string
          name: string
          slug?: string | null
          logo_url?: string | null
          hero_image_url?: string | null
          website_url?: string | null
          institution_type?: string | null

          // legacy fields kept for compatibility
          avg_tuition_per_year?: number | null
          min_gpa?: number | null
          required_tests?: string[] | null

          // new detailed fields from migration
          degree_levels?: string[] | null
          languages?: string[] | null
          study_abroad?: boolean | null
          accreditation?: string | null

          test_policy?: string | null
          sat_avg?: number | null
          ielts_min?: number | null
          toefl_min?: number | null

          tuition_intl?: number | null
          cost_of_living?: number | null
          scholarships_intl?: boolean | null
          financial_aid_rating?: number | null

          city?: string | null
          state_province?: string | null
          campus_setting?: string | null
          climate?: string | null

          employment_rate?: number | null
          avg_starting_salary?: number | null
          post_study_visa_months?: number | null
          alumni_network_rating?: number | null

          // additional metadata bag
          metadata?: Json | null

          created_at?: string | null
          updated_at?: string | null
        }
        Insert: {
          id?: string
          name: string
          slug?: string | null
          logo_url?: string | null
          hero_image_url?: string | null
          website_url?: string | null
          institution_type?: string | null

          avg_tuition_per_year?: number | null
          min_gpa?: number | null
          required_tests?: string[] | null

          degree_levels?: string[] | null
          languages?: string[] | null
          study_abroad?: boolean | null
          accreditation?: string | null

          test_policy?: string | null
          sat_avg?: number | null
          ielts_min?: number | null
          toefl_min?: number | null

          tuition_intl?: number | null
          cost_of_living?: number | null
          scholarships_intl?: boolean | null
          financial_aid_rating?: number | null

          city?: string | null
          state_province?: string | null
          campus_setting?: string | null
          climate?: string | null

          employment_rate?: number | null
          avg_starting_salary?: number | null
          post_study_visa_months?: number | null
          alumni_network_rating?: number | null

          metadata?: Json | null

          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          slug?: string | null
          logo_url?: string | null
          hero_image_url?: string | null
          website_url?: string | null
          institution_type?: string | null

          avg_tuition_per_year?: number | null
          min_gpa?: number | null
          required_tests?: string[] | null

          degree_levels?: string[] | null
          languages?: string[] | null
          study_abroad?: boolean | null
          accreditation?: string | null

          test_policy?: string | null
          sat_avg?: number | null
          ielts_min?: number | null
          toefl_min?: number | null

          tuition_intl?: number | null
          cost_of_living?: number | null
          scholarships_intl?: boolean | null
          financial_aid_rating?: number | null

          city?: string | null
          state_province?: string | null
          campus_setting?: string | null
          climate?: string | null

          employment_rate?: number | null
          avg_starting_salary?: number | null
          post_study_visa_months?: number | null
          alumni_network_rating?: number | null

          metadata?: Json | null

          created_at?: string | null
          updated_at?: string | null
        }
      }
      orientation_resources: {
        Row: {
          id: string
          title: string
          slug: string
          content: string
          category: 'fields' | 'schools' | 'study-abroad' | 'procedures' | 'comparisons'
          featured: boolean
          is_premium: boolean
          premium?: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          slug: string
          content: string
          category: 'fields' | 'schools' | 'study-abroad' | 'procedures' | 'comparisons'
          featured?: boolean
          is_premium?: boolean
          premium?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          content?: string
          category?: 'fields' | 'schools' | 'study-abroad' | 'procedures' | 'comparisons'
          featured?: boolean
          is_premium?: boolean
          premium?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

export type MixerCriteria = {
  academics: {
    enabled: boolean
    filters: {
      minGpa?: number
      testPolicy?: string
      degreeLevels?: string[]
    }
  }
  financials: {
    enabled: boolean
    filters: {
      maxBudget?: number
      requireScholarships?: boolean
    }
  }
  lifestyle: {
    enabled: boolean
    filters: {
      countries?: string[]
      settings?: string[]
      climates?: string[]
    }
  }
  future: {
    enabled: boolean
    filters: {
      minVisaMonths?: number
      minSalary?: number
    }
  }
  interests?: string[]
}

