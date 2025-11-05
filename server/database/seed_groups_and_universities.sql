-- Seed University Groups and Additional Universities
-- This script creates 4 university groups and 6 additional universities
-- Distribution:
-- - Group 1: 3 universities
-- - Group 2: 2 universities
-- - Group 3: 0 universities (empty group)
-- - Group 4: 0 universities (empty group)
-- - 1 standalone university (no group)

-- First, create 4 university groups
INSERT INTO public.university_groups (
  name, short_name, slug, description, logo_url, hero_image_url, website_url,
  established_year, headquarters_country, headquarters_city, headquarters_address,
  contact_email, contact_phone
) VALUES
-- Group 1: La Rochelle University (3 universities)
(
  'La Rochelle University',
  'ULr',
  'la-rochelle-university',
  'A comprehensive public university in western France, offering diverse programs across multiple campuses and faculties.',
  'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=1200&h=600&fit=crop',
  'https://www.univ-larochelle.fr',
  1991,
  'France',
  'La Rochelle',
  '23 Avenue Albert Einstein, 17000 La Rochelle, France',
  'contact@univ-larochelle.fr',
  '+33 5 46 45 91 00'
),
-- Group 2: University of California System (2 universities)
(
  'University of California System',
  'UC',
  'university-of-california-system',
  'The public university system in California, one of the most prestigious public university systems in the world.',
  'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&h=600&fit=crop',
  'https://www.universityofcalifornia.edu',
  1868,
  'USA',
  'Oakland',
  '1111 Franklin Street, Oakland, CA 94607, USA',
  'info@ucop.edu',
  '+1 510-987-0700'
),
-- Group 3: Sorbonne University Alliance (0 universities)
(
  'Sorbonne University Alliance',
  'Sorbonne',
  'sorbonne-university-alliance',
  'A prestigious alliance of French universities, combining excellence in humanities, sciences, and medicine.',
  'https://images.unsplash.com/photo-1536924940846-227afb31e2a5?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1536924940846-227afb31e2a5?w=1200&h=600&fit=crop',
  'https://www.sorbonne-universite.fr',
  2018,
  'France',
  'Paris',
  '21 Rue de l''École de Médecine, 75006 Paris, France',
  'contact@sorbonne-universite.fr',
  '+33 1 44 27 44 27'
),
-- Group 4: University of London (0 universities)
(
  'University of London',
  'UoL',
  'university-of-london',
  'A federal university system in London, comprising 17 member institutions and numerous research institutes.',
  'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&h=600&fit=crop',
  'https://www.london.ac.uk',
  1836,
  'UK',
  'London',
  'Senate House, Malet Street, London WC1E 7HU, UK',
  'enquiries@london.ac.uk',
  '+44 20 7862 8000'
)
ON CONFLICT (slug) DO NOTHING;

-- Get group IDs for reference (we'll use these in the university inserts)
-- Note: In actual execution, you would need to get these IDs from the database

-- Now insert 6 additional universities
-- Universities 1-3: Under La Rochelle University (Group 1)
-- Universities 4-5: Under UC System (Group 2)
-- University 6: Standalone (no group)

INSERT INTO public.universities (
  name, short_name, slug, logo_url, hero_image_url, website_url, established_year, institution_type, religious_affiliation,
  description, image_url, program_url,
  location_country, location_city, location_state_province, location_coordinates, campus_setting, campus_size_acres, housing_availability, climate_zone, nearest_major_airport, student_life_tags,
  degree_levels_offered, academic_calendar, faculty_to_student_ratio, research_activity_level, programs_count, top_ranked_programs, study_abroad_opportunities, languages_of_instruction, accreditation_body,
  acceptance_rate, application_fee, application_deadlines, standardized_test_policy, sat_score_25th_percentile, sat_score_75th_percentile, act_score_avg, min_gpa_requirement, avg_gpa_admitted, required_tests, international_english_reqs,
  tuition_in_state, tuition_out_of_state, tuition_international, avg_tuition_per_year, cost_of_living_est, percentage_receiving_aid, avg_financial_aid_package, scholarships_international, need_blind_admission,
  total_enrollment, undergrad_enrollment, grad_enrollment, percentage_international, gender_ratio, retention_rate_first_year,
  graduation_rate_4yr, graduation_rate_6yr, employment_rate_6mo, avg_starting_salary, internship_placement_support, alumni_network_strength, post_study_work_visa_months, ranking_world,
  country, group_id, min_gpa, interests, application_deadline
) VALUES
-- University 1: La Rochelle University - Business School (Group 1)
(
  'La Rochelle University - Business School',
  'ULr Business',
  'la-rochelle-university-business-school',
  'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&h=600&fit=crop',
  'https://www.univ-larochelle.fr/business',
  1991,
  'Public',
  'None',
  'The business school of La Rochelle University, offering specialized programs in business, management, and economics.',
  'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&h=600&fit=crop',
  'https://www.univ-larochelle.fr/business/programs',
  'France', 'La Rochelle', 'Nouvelle-Aquitaine', '{"lat": 46.1591, "lng": -1.1520}', 'Urban', 50, 'On-campus available', 'Temperate', 'LRH', ARRAY['Business Focused', 'International', 'Career Oriented'],
  ARRAY['Bachelor', 'Master'], 'Semester', '1:20', 'High', 25, ARRAY['Business Administration', 'International Business', 'Finance'], TRUE, ARRAY['French', 'English'], 'Ministry of Higher Education',
  65.0, 75, '{"early_action": "2025-12-01", "regular": "2026-03-15"}', 'Test-Optional', NULL, NULL, NULL, 2.5, 3.2, ARRAY['TOEFL', 'IELTS'], '{"toefl_min": 80, "ielts_min": 6.0}',
  2800, NULL, 4500, 4500, 12000, 45, 2500, TRUE, FALSE,
  3500, 2800, 700, 15.5, '48:52', 88.0,
  72.0, 85.0, 89.0, 42000, 4, 4, 12, 1200,
  'France', (SELECT id FROM public.university_groups WHERE slug = 'la-rochelle-university' LIMIT 1), 2.5, ARRAY['Business', 'Economics', 'Management'], '2026-03-15'
),

-- University 2: La Rochelle University - Engineering Campus (Group 1)
(
  'La Rochelle University - Engineering Campus',
  'ULr Engineering',
  'la-rochelle-university-engineering-campus',
  'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1200&h=600&fit=crop',
  'https://www.univ-larochelle.fr/engineering',
  1995,
  'Public',
  'None',
  'Engineering and technology campus of La Rochelle University, specializing in marine engineering, renewable energy, and computer science.',
  'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=600&fit=crop',
  'https://www.univ-larochelle.fr/engineering/programs',
  'France', 'La Rochelle', 'Nouvelle-Aquitaine', '{"lat": 46.1591, "lng": -1.1520}', 'Urban', 45, 'Guaranteed for Freshmen', 'Temperate', 'LRH', ARRAY['Research Focused', 'Innovation Hub', 'STEM Focused'],
  ARRAY['Bachelor', 'Master', 'Doctoral'], 'Semester', '1:15', 'Very High', 35, ARRAY['Engineering', 'Computer Science', 'Renewable Energy'], TRUE, ARRAY['French', 'English'], 'Commission des Titres d''Ingénieur',
  58.0, 75, '{"early_action": "2025-12-01", "regular": "2026-03-15"}', 'Test-Optional', NULL, NULL, NULL, 2.8, 3.4, ARRAY['TOEFL', 'IELTS'], '{"toefl_min": 85, "ielts_min": 6.5}',
  2800, NULL, 4800, 4800, 12000, 50, 2800, TRUE, FALSE,
  2800, 2200, 600, 18.0, '55:45', 90.0,
  75.0, 88.0, 92.0, 48000, 5, 4, 12, 1150,
  'France', (SELECT id FROM public.university_groups WHERE slug = 'la-rochelle-university' LIMIT 1), 2.8, ARRAY['Engineering', 'Computer Science', 'Technology'], '2026-03-15'
),

-- University 3: La Rochelle University - Law & Social Sciences (Group 1)
(
  'La Rochelle University - Law & Social Sciences',
  'ULr Law',
  'la-rochelle-university-law-social-sciences',
  'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1200&h=600&fit=crop',
  'https://www.univ-larochelle.fr/law',
  1991,
  'Public',
  'None',
  'Law and social sciences faculty of La Rochelle University, offering programs in law, political science, and sociology.',
  'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&h=600&fit=crop',
  'https://www.univ-larochelle.fr/law/programs',
  'France', 'La Rochelle', 'Nouvelle-Aquitaine', '{"lat": 46.1591, "lng": -1.1520}', 'Urban', 30, 'On-campus available', 'Temperate', 'LRH', ARRAY['Law Focused', 'Social Sciences', 'Public Service'],
  ARRAY['Bachelor', 'Master', 'Doctoral'], 'Semester', '1:18', 'High', 20, ARRAY['Law', 'Political Science', 'Sociology'], TRUE, ARRAY['French'], 'Ministry of Higher Education',
  70.0, 75, '{"early_action": "2025-12-01", "regular": "2026-03-15"}', 'Test-Optional', NULL, NULL, NULL, 2.5, 3.1, ARRAY['TOEFL', 'IELTS'], '{"toefl_min": 80, "ielts_min": 6.0}',
  2800, NULL, 4200, 4200, 12000, 40, 2200, TRUE, FALSE,
  2200, 1800, 400, 12.0, '52:48', 86.0,
  70.0, 82.0, 87.0, 38000, 3, 3, 12, 1300,
  'France', (SELECT id FROM public.university_groups WHERE slug = 'la-rochelle-university' LIMIT 1), 2.5, ARRAY['Law', 'Political Science', 'Social Sciences'], '2026-03-15'
),

-- University 4: UC Berkeley (Group 2)
(
  'University of California, Berkeley',
  'UC Berkeley',
  'university-of-california-berkeley',
  'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&h=600&fit=crop',
  'https://www.berkeley.edu',
  1868,
  'Public',
  'None',
  'A world-renowned public research university, consistently ranked among the top universities globally.',
  'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&h=600&fit=crop',
  'https://www.berkeley.edu/academics',
  'USA', 'Berkeley', 'CA', '{"lat": 37.8719, "lng": -122.2585}', 'Urban', 1232, 'Guaranteed for Freshmen', 'Mediterranean', 'SFO', ARRAY['Research Intensive', 'Activist Campus', 'Academically Rigorous'],
  ARRAY['Bachelor', 'Master', 'Doctoral'], 'Semester', '1:18', 'Very High', 350, ARRAY['Engineering', 'Computer Science', 'Business', 'Social Sciences'], TRUE, ARRAY['English'], 'WASC',
  17.5, 70, '{"early_action": "2025-11-30", "regular": "2026-01-05"}', 'Test-Optional', 1330, 1530, 33, 3.0, 3.9, ARRAY['SAT', 'ACT', 'TOEFL'], '{"toefl_min": 80, "ielts_min": 6.5}',
  14253, 44253, 44253, 44253, 22000, 65, 18000, TRUE, FALSE,
  45000, 32000, 13000, 24.0, '49:51', 97.0,
  76.0, 91.0, 95.0, 75000, 5, 5, 36, 4,
  'USA', (SELECT id FROM public.university_groups WHERE slug = 'university-of-california-system' LIMIT 1), 3.0, ARRAY['Engineering', 'Computer Science', 'Business', 'Social Sciences'], '2026-01-05'
),

-- University 5: UC Los Angeles (Group 2)
(
  'University of California, Los Angeles',
  'UCLA',
  'university-of-california-los-angeles',
  'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&h=600&fit=crop',
  'https://www.ucla.edu',
  1919,
  'Public',
  'None',
  'One of the most prestigious public universities in the world, known for excellence in academics, athletics, and research.',
  'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&h=600&fit=crop',
  'https://www.ucla.edu/academics',
  'USA', 'Los Angeles', 'CA', '{"lat": 34.0689, "lng": -118.4452}', 'Urban', 419, 'Guaranteed for Freshmen', 'Mediterranean', 'LAX', ARRAY['Sports Focused', 'Diverse Campus', 'Research Intensive'],
  ARRAY['Bachelor', 'Master', 'Doctoral'], 'Quarter', '1:18', 'Very High', 337, ARRAY['Film', 'Medicine', 'Business', 'Engineering'], TRUE, ARRAY['English'], 'WASC',
  14.0, 70, '{"early_action": "2025-11-30", "regular": "2026-01-05"}', 'Test-Optional', 1360, 1550, 34, 3.0, 3.9, ARRAY['SAT', 'ACT', 'TOEFL'], '{"toefl_min": 100, "ielts_min": 7.0}',
  13124, 43124, 43124, 43124, 22000, 60, 16500, TRUE, FALSE,
  47000, 32000, 15000, 23.0, '48:52', 97.0,
  75.0, 91.0, 94.0, 72000, 5, 5, 36, 5,
  'USA', (SELECT id FROM public.university_groups WHERE slug = 'university-of-california-system' LIMIT 1), 3.0, ARRAY['Film', 'Medicine', 'Business', 'Engineering'], '2026-01-05'
),

-- University 6: Standalone University - Edinburgh University (no group)
(
  'University of Edinburgh',
  'Edinburgh',
  'university-of-edinburgh',
  'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&h=600&fit=crop',
  'https://www.ed.ac.uk',
  1583,
  'Public',
  'None',
  'One of Scotland''s ancient universities and a world-renowned center for teaching and research, consistently ranked among the top universities globally.',
  'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&h=600&fit=crop',
  'https://www.ed.ac.uk/studying',
  'UK', 'Edinburgh', 'Scotland', '{"lat": 55.9508, "lng": -3.1875}', 'Urban', 210, 'On-campus available', 'Temperate', 'EDI', ARRAY['Historic', 'Research Intensive', 'International'],
  ARRAY['Bachelor', 'Master', 'Doctoral'], 'Semester', '1:13', 'Very High', 500, ARRAY['Medicine', 'Law', 'Arts', 'Sciences'], TRUE, ARRAY['English'], 'QAA Scotland',
  43.0, 22, '{"early_action": "2025-10-15", "regular": "2026-01-15"}', 'Test-Optional', NULL, NULL, NULL, 3.0, 3.7, ARRAY['IELTS', 'TOEFL'], '{"toefl_min": 92, "ielts_min": 6.5}',
  NULL, NULL, 28000, 28000, 15000, 55, 12000, TRUE, FALSE,
  38000, 25000, 13000, 40.0, '47:53', 94.0,
  78.0, 90.0, 93.0, 68000, 5, 5, 24, 16,
  'UK', NULL, 3.0, ARRAY['Medicine', 'Law', 'Arts', 'Sciences'], '2026-01-15'
)
ON CONFLICT (slug) DO NOTHING;

-- Update total_instances count for groups (should be automatic via trigger, but we'll verify)
UPDATE public.university_groups
SET total_instances = (
  SELECT COUNT(*)
  FROM public.universities
  WHERE universities.group_id = university_groups.id
);

