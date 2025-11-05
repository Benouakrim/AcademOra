import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Building, DollarSign, Book, Flag, MapPin, Users, TrendingUp, GraduationCap, Globe, Building2 } from 'lucide-react';
import { adminUniversityAPI, adminUniversityGroupsAPI } from '../../lib/api';
import { getCurrentUser } from '../../lib/api';
import { useTranslation } from 'react-i18next';

interface UniversityData {
  id?: string;
  // General Identity & Metadata
  name: string;
  short_name?: string;
  slug?: string;
  logo_url?: string;
  hero_image_url?: string;
  website_url?: string;
  established_year?: number | string;
  institution_type?: string;
  religious_affiliation?: string;
  description: string;
  image_url: string;
  
  // Location & Campus Vibe
  country: string;
  location_country?: string;
  location_city?: string;
  location_state_province?: string;
  location_coordinates?: string; // JSON string for editing
  campus_setting?: string;
  campus_size_acres?: number | string;
  housing_availability?: string;
  climate_zone?: string;
  nearest_major_airport?: string;
  student_life_tags?: string; // Comma-separated for editing
  
  // Detailed Academics
  interests: string; // Comma-separated string for editing
  degree_levels_offered?: string; // Comma-separated for editing
  academic_calendar?: string;
  faculty_to_student_ratio?: string;
  research_activity_level?: string;
  programs_count?: number | string;
  top_ranked_programs?: string; // Comma-separated for editing
  study_abroad_opportunities?: boolean;
  languages_of_instruction?: string; // Comma-separated for editing
  accreditation_body?: string;
  
  // Admissions & Selectivity
  application_deadline: string;
  application_deadlines?: string; // JSON string for editing
  acceptance_rate: number | string;
  application_fee?: number | string;
  standardized_test_policy?: string;
  sat_score_25th_percentile?: number | string;
  sat_score_75th_percentile?: number | string;
  act_score_avg?: number | string;
  min_gpa: number | string;
  min_gpa_requirement?: number | string;
  avg_gpa_admitted?: number | string;
  required_tests: string; // Comma-separated string for editing
  international_english_reqs?: string; // JSON string for editing
  
  // Financials & Aid
  avg_tuition_per_year: number | string;
  tuition_in_state?: number | string;
  tuition_out_of_state?: number | string;
  tuition_international?: number | string;
  cost_of_living_est?: number | string;
  percentage_receiving_aid?: number | string;
  avg_financial_aid_package?: number | string;
  scholarships_international?: boolean;
  need_blind_admission?: boolean;
  
  // Student Demographics
  total_enrollment?: number | string;
  undergrad_enrollment?: number | string;
  grad_enrollment?: number | string;
  percentage_international?: number | string;
  gender_ratio?: string;
  retention_rate_first_year?: number | string;
  
  // Future Outcomes
  graduation_rate_4yr?: number | string;
  graduation_rate_6yr?: number | string;
  employment_rate_6mo?: number | string;
  avg_starting_salary?: number | string;
  internship_placement_support?: number | string;
  alumni_network_strength?: number | string;
  post_study_work_visa_months?: number | string;
  
  // Legacy fields
  ranking_world: number | string;
  program_url: string;
  
  // Group association
  group_id?: string;
}

const allCountries = ['USA', 'Canada', 'France', 'UK', 'Germany', 'Australia', 'Japan', 'South Korea', 'Singapore', 'Netherlands', 'Switzerland', 'Sweden', 'Other'];
const institutionTypes = ['Public', 'Private Non-profit', 'Private For-profit'];
const campusSettings = ['Urban', 'Suburban', 'Rural'];
const academicCalendars = ['Semester', 'Quarter', 'Trimester'];
const testPolicies = ['Required', 'Test-Optional', 'Test-Blind'];
const researchLevels = ['Very High', 'High', 'Medium', 'Teaching Focused'];

export default function UniversityEditor() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [groups, setGroups] = useState<Array<{ id: string; name: string }>>([]);

  const [formData, setFormData] = useState<UniversityData>({
    name: '',
    country: 'USA',
    description: '',
    image_url: '',
    avg_tuition_per_year: '',
    min_gpa: '',
    interests: '',
    application_deadline: '',
    acceptance_rate: '',
    ranking_world: '',
    required_tests: '',
    program_url: '',
    // Initialize new fields with empty strings/defaults
    short_name: '',
    slug: '',
    logo_url: '',
    hero_image_url: '',
    website_url: '',
    established_year: '',
    institution_type: '',
    religious_affiliation: '',
    location_country: '',
    location_city: '',
    location_state_province: '',
    location_coordinates: '',
    campus_setting: '',
    campus_size_acres: '',
    housing_availability: '',
    climate_zone: '',
    nearest_major_airport: '',
    student_life_tags: '',
    degree_levels_offered: '',
    academic_calendar: '',
    faculty_to_student_ratio: '',
    research_activity_level: '',
    programs_count: '',
    top_ranked_programs: '',
    study_abroad_opportunities: false,
    languages_of_instruction: '',
    accreditation_body: '',
    application_deadlines: '',
    application_fee: '',
    standardized_test_policy: '',
    sat_score_25th_percentile: '',
    sat_score_75th_percentile: '',
    act_score_avg: '',
    min_gpa_requirement: '',
    avg_gpa_admitted: '',
    international_english_reqs: '',
    tuition_in_state: '',
    tuition_out_of_state: '',
    tuition_international: '',
    cost_of_living_est: '',
    percentage_receiving_aid: '',
    avg_financial_aid_package: '',
    scholarships_international: false,
    need_blind_admission: false,
    total_enrollment: '',
    undergrad_enrollment: '',
    grad_enrollment: '',
    percentage_international: '',
    gender_ratio: '',
    retention_rate_first_year: '',
    graduation_rate_4yr: '',
    graduation_rate_6yr: '',
    employment_rate_6mo: '',
    avg_starting_salary: '',
    internship_placement_support: '',
    alumni_network_strength: '',
    post_study_work_visa_months: '',
    group_id: '',
  });

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      navigate('/login');
      return;
    }
    fetchGroups();
    if (isEditMode && id) {
      fetchUniversity(id);
    }
  }, [id, isEditMode, navigate]);

  const fetchGroups = async () => {
    try {
      const data = await adminUniversityGroupsAPI.getGroups();
      setGroups(data || []);
    } catch (err: any) {
      console.error('Failed to fetch groups:', err.message);
    }
  };

  const fetchUniversity = async (uniId: string) => {
    try {
      setLoading(true);
      const data = await adminUniversityAPI.getUniversityById(uniId);
      if (data) {
        // Helper function to convert arrays to comma-separated strings
        const arrayToString = (arr: any) => Array.isArray(arr) ? arr.join(', ') : (arr || '');
        // Helper function to convert JSON to string
        const jsonToString = (obj: any) => obj ? JSON.stringify(obj, null, 2) : '';
        
        setFormData({
          ...data,
          // Convert arrays back to comma-separated strings for editing
          interests: arrayToString(data.interests),
          required_tests: arrayToString(data.required_tests),
          degree_levels_offered: arrayToString(data.degree_levels_offered),
          top_ranked_programs: arrayToString(data.top_ranked_programs),
          languages_of_instruction: arrayToString(data.languages_of_instruction),
          student_life_tags: arrayToString(data.student_life_tags),
          // Convert JSON objects to strings
          application_deadlines: jsonToString(data.application_deadlines),
          international_english_reqs: jsonToString(data.international_english_reqs),
          location_coordinates: jsonToString(data.location_coordinates),
          // Handle null or 0 values for inputs
          avg_tuition_per_year: data.avg_tuition_per_year || '',
          min_gpa: data.min_gpa || '',
          application_deadline: data.application_deadline ? data.application_deadline.split('T')[0] : '',
          acceptance_rate: data.acceptance_rate || '',
          ranking_world: data.ranking_world || '',
          program_url: data.program_url || '',
          image_url: data.image_url || '',
          description: data.description || '',
          // Ensure all fields have defaults
          short_name: data.short_name || '',
          slug: data.slug || '',
          logo_url: data.logo_url || '',
          hero_image_url: data.hero_image_url || '',
          website_url: data.website_url || '',
          established_year: data.established_year || '',
          institution_type: data.institution_type || '',
          religious_affiliation: data.religious_affiliation || '',
          location_country: data.location_country || data.country || '',
          location_city: data.location_city || '',
          location_state_province: data.location_state_province || '',
          campus_setting: data.campus_setting || '',
          campus_size_acres: data.campus_size_acres || '',
          housing_availability: data.housing_availability || '',
          climate_zone: data.climate_zone || '',
          nearest_major_airport: data.nearest_major_airport || '',
          academic_calendar: data.academic_calendar || '',
          faculty_to_student_ratio: data.faculty_to_student_ratio || '',
          research_activity_level: data.research_activity_level || '',
          programs_count: data.programs_count || '',
          study_abroad_opportunities: data.study_abroad_opportunities || false,
          accreditation_body: data.accreditation_body || '',
          application_fee: data.application_fee || '',
          standardized_test_policy: data.standardized_test_policy || '',
          sat_score_25th_percentile: data.sat_score_25th_percentile || '',
          sat_score_75th_percentile: data.sat_score_75th_percentile || '',
          act_score_avg: data.act_score_avg || '',
          min_gpa_requirement: data.min_gpa_requirement || '',
          avg_gpa_admitted: data.avg_gpa_admitted || '',
          tuition_in_state: data.tuition_in_state || '',
          tuition_out_of_state: data.tuition_out_of_state || '',
          tuition_international: data.tuition_international || '',
          cost_of_living_est: data.cost_of_living_est || '',
          percentage_receiving_aid: data.percentage_receiving_aid || '',
          avg_financial_aid_package: data.avg_financial_aid_package || '',
          scholarships_international: data.scholarships_international || false,
          need_blind_admission: data.need_blind_admission || false,
          total_enrollment: data.total_enrollment || '',
          undergrad_enrollment: data.undergrad_enrollment || '',
          grad_enrollment: data.grad_enrollment || '',
          percentage_international: data.percentage_international || '',
          gender_ratio: data.gender_ratio || '',
          retention_rate_first_year: data.retention_rate_first_year || '',
          graduation_rate_4yr: data.graduation_rate_4yr || '',
          graduation_rate_6yr: data.graduation_rate_6yr || '',
          employment_rate_6mo: data.employment_rate_6mo || '',
          avg_starting_salary: data.avg_starting_salary || '',
          internship_placement_support: data.internship_placement_support || '',
          alumni_network_strength: data.alumni_network_strength || '',
          post_study_work_visa_months: data.post_study_work_visa_months || '',
          group_id: data.group_id || '',
        });
      } else {
        setError('University not found.');
      }
    } catch (err: any) {
      setError('Failed to load university: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      // Helper function to convert comma-separated strings to arrays
      const stringToArray = (str: string | undefined) => {
        if (!str || str.trim() === '') return [];
        return str.split(',').map(s => s.trim()).filter(s => s.length > 0);
      };
      
      // Helper function to parse JSON strings
      const parseJson = (str: string | undefined) => {
        if (!str || str.trim() === '') return null;
        try {
          return JSON.parse(str);
        } catch {
          return null;
        }
      };
      
      // Prepare data for submission
      const submitData = {
        ...formData,
        // Convert comma-separated strings to arrays
        interests: stringToArray(formData.interests as string),
        required_tests: stringToArray(formData.required_tests as string),
        degree_levels_offered: stringToArray(formData.degree_levels_offered as string),
        top_ranked_programs: stringToArray(formData.top_ranked_programs as string),
        languages_of_instruction: stringToArray(formData.languages_of_instruction as string),
        student_life_tags: stringToArray(formData.student_life_tags as string),
        // Convert JSON strings to objects
        application_deadlines: parseJson(formData.application_deadlines as string),
        international_english_reqs: parseJson(formData.international_english_reqs as string),
        location_coordinates: parseJson(formData.location_coordinates as string),
        // Convert empty strings to null for numeric fields
        avg_tuition_per_year: formData.avg_tuition_per_year === '' ? null : Number(formData.avg_tuition_per_year),
        min_gpa: formData.min_gpa === '' ? null : Number(formData.min_gpa),
        acceptance_rate: formData.acceptance_rate === '' ? null : Number(formData.acceptance_rate),
        ranking_world: formData.ranking_world === '' ? null : Number(formData.ranking_world),
        established_year: formData.established_year === '' ? null : Number(formData.established_year),
        campus_size_acres: formData.campus_size_acres === '' ? null : Number(formData.campus_size_acres),
        programs_count: formData.programs_count === '' ? null : Number(formData.programs_count),
        application_fee: formData.application_fee === '' ? null : Number(formData.application_fee),
        sat_score_25th_percentile: formData.sat_score_25th_percentile === '' ? null : Number(formData.sat_score_25th_percentile),
        sat_score_75th_percentile: formData.sat_score_75th_percentile === '' ? null : Number(formData.sat_score_75th_percentile),
        act_score_avg: formData.act_score_avg === '' ? null : Number(formData.act_score_avg),
        min_gpa_requirement: formData.min_gpa_requirement === '' ? null : Number(formData.min_gpa_requirement),
        avg_gpa_admitted: formData.avg_gpa_admitted === '' ? null : Number(formData.avg_gpa_admitted),
        tuition_in_state: formData.tuition_in_state === '' ? null : Number(formData.tuition_in_state),
        tuition_out_of_state: formData.tuition_out_of_state === '' ? null : Number(formData.tuition_out_of_state),
        tuition_international: formData.tuition_international === '' ? null : Number(formData.tuition_international),
        cost_of_living_est: formData.cost_of_living_est === '' ? null : Number(formData.cost_of_living_est),
        percentage_receiving_aid: formData.percentage_receiving_aid === '' ? null : Number(formData.percentage_receiving_aid),
        avg_financial_aid_package: formData.avg_financial_aid_package === '' ? null : Number(formData.avg_financial_aid_package),
        total_enrollment: formData.total_enrollment === '' ? null : Number(formData.total_enrollment),
        undergrad_enrollment: formData.undergrad_enrollment === '' ? null : Number(formData.undergrad_enrollment),
        grad_enrollment: formData.grad_enrollment === '' ? null : Number(formData.grad_enrollment),
        percentage_international: formData.percentage_international === '' ? null : Number(formData.percentage_international),
        retention_rate_first_year: formData.retention_rate_first_year === '' ? null : Number(formData.retention_rate_first_year),
        graduation_rate_4yr: formData.graduation_rate_4yr === '' ? null : Number(formData.graduation_rate_4yr),
        graduation_rate_6yr: formData.graduation_rate_6yr === '' ? null : Number(formData.graduation_rate_6yr),
        employment_rate_6mo: formData.employment_rate_6mo === '' ? null : Number(formData.employment_rate_6mo),
        avg_starting_salary: formData.avg_starting_salary === '' ? null : Number(formData.avg_starting_salary),
        internship_placement_support: formData.internship_placement_support === '' ? null : Number(formData.internship_placement_support),
        alumni_network_strength: formData.alumni_network_strength === '' ? null : Number(formData.alumni_network_strength),
        post_study_work_visa_months: formData.post_study_work_visa_months === '' ? null : Number(formData.post_study_work_visa_months),
        group_id: formData.group_id === '' ? null : formData.group_id,
      };
      
      if (isEditMode && id) {
        await adminUniversityAPI.updateUniversity(id, submitData);
      } else {
        await adminUniversityAPI.createUniversity(submitData);
      }
      navigate('/admin/universities');
    } catch (err: any) {
      setError('Failed to save university: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen py-12">
        <div className="text-center py-20">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <form onSubmit={handleSubmit}>
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                to="/admin/universities"
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                title="Back to Universities"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <h1 className="text-xl font-semibold text-gray-800">
                {isEditMode ? 'Edit University' : 'Create New University'}
              </h1>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="btn-primary flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              <span>{saving ? 'Saving...' : 'Save University'}</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-b border-red-200 text-red-700 px-6 py-3 text-sm">
            {error}
          </div>
        )}

        {/* Form Content */}
        <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-6">
          
          {/* 1. General Identity & Metadata */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 flex items-center gap-2 mb-4">
              <Building className="w-5 h-5 text-primary-600" />
              General Identity & Metadata
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name *</label>
                <input type="text" name="name" id="name" required value={formData.name} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" />
              </div>
              <div>
                <label htmlFor="short_name" className="block text-sm font-medium text-gray-700">Short Name / Abbreviation</label>
                <input type="text" name="short_name" id="short_name" value={formData.short_name} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" placeholder="e.g., MIT, UCLA" />
              </div>
              <div>
                <label htmlFor="slug" className="block text-sm font-medium text-gray-700">Slug (URL-friendly)</label>
                <input type="text" name="slug" id="slug" value={formData.slug} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" placeholder="university-name" />
              </div>
              <div>
                <label htmlFor="established_year" className="block text-sm font-medium text-gray-700">Established Year</label>
                <input type="number" name="established_year" id="established_year" value={formData.established_year} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" placeholder="1850" />
              </div>
              <div>
                <label htmlFor="institution_type" className="block text-sm font-medium text-gray-700">Institution Type</label>
                <select name="institution_type" id="institution_type" value={formData.institution_type} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500">
                  <option value="">Select type</option>
                  {institutionTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="religious_affiliation" className="block text-sm font-medium text-gray-700">Religious Affiliation</label>
                <input type="text" name="religious_affiliation" id="religious_affiliation" value={formData.religious_affiliation} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" placeholder="e.g., Catholic, None" />
              </div>
              <div>
                <label htmlFor="logo_url" className="block text-sm font-medium text-gray-700">Logo URL</label>
                <input type="url" name="logo_url" id="logo_url" value={formData.logo_url} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" />
              </div>
              <div>
                <label htmlFor="hero_image_url" className="block text-sm font-medium text-gray-700">Hero Image URL</label>
                <input type="url" name="hero_image_url" id="hero_image_url" value={formData.hero_image_url} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="website_url" className="block text-sm font-medium text-gray-700">Website URL</label>
                <input type="url" name="website_url" id="website_url" value={formData.website_url} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                <textarea name="description" id="description" rows={4} value={formData.description} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"></textarea>
              </div>
              <div>
                <label htmlFor="group_id" className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-primary-600" />
                  University Group (Optional)
                </label>
                <select name="group_id" id="group_id" value={formData.group_id || ''} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500">
                  <option value="">None (Standalone Institution)</option>
                  {groups.map(group => (
                    <option key={group.id} value={group.id}>{group.name}</option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500">Select a university group if this institution belongs to one</p>
              </div>
              <div>
                <label htmlFor="image_url" className="block text-sm font-medium text-gray-700">Image URL (Legacy)</label>
                <input type="url" name="image_url" id="image_url" value={formData.image_url} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" />
              </div>
              <div>
                <label htmlFor="program_url" className="block text-sm font-medium text-gray-700">Program URL</label>
                <input type="url" name="program_url" id="program_url" value={formData.program_url} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" />
              </div>
            </div>
          </div>

          {/* 2. Location & Campus Vibe (Lifestyle Module) */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-primary-600" />
              Location & Campus Vibe
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="location_country" className="block text-sm font-medium text-gray-700">Country *</label>
                <select name="location_country" id="location_country" value={formData.location_country || formData.country} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500">
                  {allCountries.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="location_city" className="block text-sm font-medium text-gray-700">City</label>
                <input type="text" name="location_city" id="location_city" value={formData.location_city} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" />
              </div>
              <div>
                <label htmlFor="location_state_province" className="block text-sm font-medium text-gray-700">State/Province</label>
                <input type="text" name="location_state_province" id="location_state_province" value={formData.location_state_province} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" />
              </div>
              <div>
                <label htmlFor="location_coordinates" className="block text-sm font-medium text-gray-700">Coordinates (JSON)</label>
                <textarea name="location_coordinates" id="location_coordinates" rows={2} value={formData.location_coordinates} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 font-mono text-xs" placeholder='{"lat": 40.7128, "lng": -74.0060}' />
                <p className="mt-1 text-xs text-gray-500">JSON format: {"{"}"lat": number, "lng": number{"}"}</p>
              </div>
              <div>
                <label htmlFor="campus_setting" className="block text-sm font-medium text-gray-700">Campus Setting</label>
                <select name="campus_setting" id="campus_setting" value={formData.campus_setting} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500">
                  <option value="">Select setting</option>
                  {campusSettings.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="campus_size_acres" className="block text-sm font-medium text-gray-700">Campus Size (Acres)</label>
                <input type="number" name="campus_size_acres" id="campus_size_acres" value={formData.campus_size_acres} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" />
              </div>
              <div>
                <label htmlFor="housing_availability" className="block text-sm font-medium text-gray-700">Housing Availability</label>
                <input type="text" name="housing_availability" id="housing_availability" value={formData.housing_availability} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" placeholder="e.g., Guaranteed for Freshmen" />
              </div>
              <div>
                <label htmlFor="climate_zone" className="block text-sm font-medium text-gray-700">Climate Zone</label>
                <input type="text" name="climate_zone" id="climate_zone" value={formData.climate_zone} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" placeholder="e.g., Continental, Temperate" />
              </div>
              <div>
                <label htmlFor="nearest_major_airport" className="block text-sm font-medium text-gray-700">Nearest Major Airport</label>
                <input type="text" name="nearest_major_airport" id="nearest_major_airport" value={formData.nearest_major_airport} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" placeholder="e.g., JFK, LAX" />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="student_life_tags" className="block text-sm font-medium text-gray-700">Student Life Tags</label>
                <input type="text" name="student_life_tags" id="student_life_tags" value={formData.student_life_tags} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" placeholder="e.g., Active Greek Life, Sports Focused, Artsy" />
                <p className="mt-1 text-xs text-gray-500">Comma-separated tags</p>
              </div>
            </div>
          </div>

          {/* 3. Detailed Academics (Academics Module) */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 flex items-center gap-2 mb-4">
              <GraduationCap className="w-5 h-5 text-primary-600" />
              Detailed Academics
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label htmlFor="interests" className="block text-sm font-medium text-gray-700">Interests / Academic Fields *</label>
                <input type="text" name="interests" id="interests" required value={formData.interests} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" />
                <p className="mt-1 text-xs text-gray-500">Comma-separated (e.g., Engineering, Business, Arts)</p>
              </div>
              <div className="md:col-span-2">
                <label htmlFor="degree_levels_offered" className="block text-sm font-medium text-gray-700">Degree Levels Offered</label>
                <input type="text" name="degree_levels_offered" id="degree_levels_offered" value={formData.degree_levels_offered} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" placeholder="e.g., Associate, Bachelor, Master, Doctoral" />
                <p className="mt-1 text-xs text-gray-500">Comma-separated</p>
              </div>
              <div>
                <label htmlFor="academic_calendar" className="block text-sm font-medium text-gray-700">Academic Calendar</label>
                <select name="academic_calendar" id="academic_calendar" value={formData.academic_calendar} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500">
                  <option value="">Select calendar</option>
                  {academicCalendars.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="faculty_to_student_ratio" className="block text-sm font-medium text-gray-700">Faculty to Student Ratio</label>
                <input type="text" name="faculty_to_student_ratio" id="faculty_to_student_ratio" value={formData.faculty_to_student_ratio} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" placeholder="e.g., 1:15" />
              </div>
              <div>
                <label htmlFor="research_activity_level" className="block text-sm font-medium text-gray-700">Research Activity Level</label>
                <select name="research_activity_level" id="research_activity_level" value={formData.research_activity_level} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500">
                  <option value="">Select level</option>
                  {researchLevels.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="programs_count" className="block text-sm font-medium text-gray-700">Total Programs Count</label>
                <input type="number" name="programs_count" id="programs_count" value={formData.programs_count} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="top_ranked_programs" className="block text-sm font-medium text-gray-700">Top Ranked Programs</label>
                <input type="text" name="top_ranked_programs" id="top_ranked_programs" value={formData.top_ranked_programs} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" placeholder="e.g., Engineering, Business" />
                <p className="mt-1 text-xs text-gray-500">Comma-separated</p>
              </div>
              <div>
                <label htmlFor="languages_of_instruction" className="block text-sm font-medium text-gray-700">Languages of Instruction</label>
                <input type="text" name="languages_of_instruction" id="languages_of_instruction" value={formData.languages_of_instruction} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" placeholder="e.g., English, French" />
                <p className="mt-1 text-xs text-gray-500">Comma-separated</p>
              </div>
              <div>
                <label htmlFor="accreditation_body" className="block text-sm font-medium text-gray-700">Accreditation Body</label>
                <input type="text" name="accreditation_body" id="accreditation_body" value={formData.accreditation_body} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" />
              </div>
              <div className="flex items-center">
                <input type="checkbox" name="study_abroad_opportunities" id="study_abroad_opportunities" checked={formData.study_abroad_opportunities} onChange={handleInputChange} className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                <label htmlFor="study_abroad_opportunities" className="ml-2 block text-sm text-gray-700">Study Abroad Opportunities Available</label>
              </div>
            </div>
          </div>

          {/* 4. Admissions & Selectivity */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 flex items-center gap-2 mb-4">
              <Book className="w-5 h-5 text-primary-600" />
              Admissions & Selectivity
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="acceptance_rate" className="block text-sm font-medium text-gray-700">Acceptance Rate (%)</label>
                <input type="number" step="0.1" min="0" max="100" name="acceptance_rate" id="acceptance_rate" value={formData.acceptance_rate} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" placeholder="25.5" />
              </div>
              <div>
                <label htmlFor="application_fee" className="block text-sm font-medium text-gray-700">Application Fee (USD)</label>
                <input type="number" name="application_fee" id="application_fee" value={formData.application_fee} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="application_deadlines" className="block text-sm font-medium text-gray-700">Application Deadlines (JSON)</label>
                <textarea name="application_deadlines" id="application_deadlines" rows={3} value={formData.application_deadlines} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 font-mono text-xs" placeholder='{"early_decision": "2025-11-01", "regular": "2026-01-01"}' />
                <p className="mt-1 text-xs text-gray-500">JSON format with deadline types</p>
              </div>
              <div>
                <label htmlFor="standardized_test_policy" className="block text-sm font-medium text-gray-700">Standardized Test Policy</label>
                <select name="standardized_test_policy" id="standardized_test_policy" value={formData.standardized_test_policy} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500">
                  <option value="">Select policy</option>
                  {testPolicies.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="application_deadline" className="block text-sm font-medium text-gray-700">Application Deadline (Legacy)</label>
                <input type="date" name="application_deadline" id="application_deadline" value={formData.application_deadline} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" />
              </div>
              <div>
                <label htmlFor="sat_score_25th_percentile" className="block text-sm font-medium text-gray-700">SAT Score 25th Percentile</label>
                <input type="number" name="sat_score_25th_percentile" id="sat_score_25th_percentile" value={formData.sat_score_25th_percentile} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" />
              </div>
              <div>
                <label htmlFor="sat_score_75th_percentile" className="block text-sm font-medium text-gray-700">SAT Score 75th Percentile</label>
                <input type="number" name="sat_score_75th_percentile" id="sat_score_75th_percentile" value={formData.sat_score_75th_percentile} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" />
              </div>
              <div>
                <label htmlFor="act_score_avg" className="block text-sm font-medium text-gray-700">ACT Score Average</label>
                <input type="number" name="act_score_avg" id="act_score_avg" value={formData.act_score_avg} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" />
              </div>
              <div>
                <label htmlFor="min_gpa" className="block text-sm font-medium text-gray-700">Min. GPA (4.0 Scale) - Legacy</label>
                <input type="number" step="0.1" min="0" max="4" name="min_gpa" id="min_gpa" value={formData.min_gpa} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" placeholder="3.0" />
              </div>
              <div>
                <label htmlFor="min_gpa_requirement" className="block text-sm font-medium text-gray-700">Min. GPA Requirement</label>
                <input type="number" step="0.1" min="0" max="4" name="min_gpa_requirement" id="min_gpa_requirement" value={formData.min_gpa_requirement} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" />
              </div>
              <div>
                <label htmlFor="avg_gpa_admitted" className="block text-sm font-medium text-gray-700">Average GPA Admitted</label>
                <input type="number" step="0.1" min="0" max="4" name="avg_gpa_admitted" id="avg_gpa_admitted" value={formData.avg_gpa_admitted} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="required_tests" className="block text-sm font-medium text-gray-700">Required Tests</label>
                <input type="text" name="required_tests" id="required_tests" value={formData.required_tests} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" />
                <p className="mt-1 text-xs text-gray-500">Comma-separated (e.g., SAT, TOEFL, IELTS)</p>
              </div>
              <div className="md:col-span-2">
                <label htmlFor="international_english_reqs" className="block text-sm font-medium text-gray-700">International English Requirements (JSON)</label>
                <textarea name="international_english_reqs" id="international_english_reqs" rows={2} value={formData.international_english_reqs} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 font-mono text-xs" placeholder='{"toefl_min": 100, "ielts_min": 7.5}' />
                <p className="mt-1 text-xs text-gray-500">JSON format with test requirements</p>
              </div>
            </div>
          </div>

          {/* 5. Financials & Aid (Financials Module) */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 flex items-center gap-2 mb-4">
              <DollarSign className="w-5 h-5 text-primary-600" />
              Financials & Aid
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="tuition_in_state" className="block text-sm font-medium text-gray-700">Tuition In-State (USD/year)</label>
                <input type="number" name="tuition_in_state" id="tuition_in_state" value={formData.tuition_in_state} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" />
              </div>
              <div>
                <label htmlFor="tuition_out_of_state" className="block text-sm font-medium text-gray-700">Tuition Out-of-State (USD/year)</label>
                <input type="number" name="tuition_out_of_state" id="tuition_out_of_state" value={formData.tuition_out_of_state} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" />
              </div>
              <div>
                <label htmlFor="tuition_international" className="block text-sm font-medium text-gray-700">Tuition International (USD/year)</label>
                <input type="number" name="tuition_international" id="tuition_international" value={formData.tuition_international} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" />
              </div>
              <div>
                <label htmlFor="avg_tuition_per_year" className="block text-sm font-medium text-gray-700">Avg. Tuition / Year (Legacy)</label>
                <input type="number" name="avg_tuition_per_year" id="avg_tuition_per_year" value={formData.avg_tuition_per_year} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" placeholder="30000" />
              </div>
              <div>
                <label htmlFor="cost_of_living_est" className="block text-sm font-medium text-gray-700">Cost of Living Estimate (USD/year)</label>
                <input type="number" name="cost_of_living_est" id="cost_of_living_est" value={formData.cost_of_living_est} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" />
              </div>
              <div>
                <label htmlFor="percentage_receiving_aid" className="block text-sm font-medium text-gray-700">% Receiving Financial Aid</label>
                <input type="number" min="0" max="100" name="percentage_receiving_aid" id="percentage_receiving_aid" value={formData.percentage_receiving_aid} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" />
              </div>
              <div>
                <label htmlFor="avg_financial_aid_package" className="block text-sm font-medium text-gray-700">Average Financial Aid Package (USD)</label>
                <input type="number" name="avg_financial_aid_package" id="avg_financial_aid_package" value={formData.avg_financial_aid_package} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" />
              </div>
              <div className="flex items-center">
                <input type="checkbox" name="scholarships_international" id="scholarships_international" checked={formData.scholarships_international} onChange={handleInputChange} className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                <label htmlFor="scholarships_international" className="ml-2 block text-sm text-gray-700">Scholarships Available for International Students</label>
              </div>
              <div className="flex items-center">
                <input type="checkbox" name="need_blind_admission" id="need_blind_admission" checked={formData.need_blind_admission} onChange={handleInputChange} className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                <label htmlFor="need_blind_admission" className="ml-2 block text-sm text-gray-700">Need-Blind Admission</label>
              </div>
            </div>
          </div>

          {/* 6. Student Demographics */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-primary-600" />
              Student Demographics
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="total_enrollment" className="block text-sm font-medium text-gray-700">Total Enrollment</label>
                <input type="number" name="total_enrollment" id="total_enrollment" value={formData.total_enrollment} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" />
              </div>
              <div>
                <label htmlFor="undergrad_enrollment" className="block text-sm font-medium text-gray-700">Undergraduate Enrollment</label>
                <input type="number" name="undergrad_enrollment" id="undergrad_enrollment" value={formData.undergrad_enrollment} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" />
              </div>
              <div>
                <label htmlFor="grad_enrollment" className="block text-sm font-medium text-gray-700">Graduate Enrollment</label>
                <input type="number" name="grad_enrollment" id="grad_enrollment" value={formData.grad_enrollment} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" />
              </div>
              <div>
                <label htmlFor="percentage_international" className="block text-sm font-medium text-gray-700">% International Students</label>
                <input type="number" step="0.1" min="0" max="100" name="percentage_international" id="percentage_international" value={formData.percentage_international} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" />
              </div>
              <div>
                <label htmlFor="gender_ratio" className="block text-sm font-medium text-gray-700">Gender Ratio</label>
                <input type="text" name="gender_ratio" id="gender_ratio" value={formData.gender_ratio} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" placeholder="e.g., 50:50" />
              </div>
              <div>
                <label htmlFor="retention_rate_first_year" className="block text-sm font-medium text-gray-700">First Year Retention Rate (%)</label>
                <input type="number" step="0.1" min="0" max="100" name="retention_rate_first_year" id="retention_rate_first_year" value={formData.retention_rate_first_year} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" />
              </div>
            </div>
          </div>

          {/* 7. Future Outcomes (Future Module) */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-primary-600" />
              Future Outcomes
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="graduation_rate_4yr" className="block text-sm font-medium text-gray-700">4-Year Graduation Rate (%)</label>
                <input type="number" step="0.1" min="0" max="100" name="graduation_rate_4yr" id="graduation_rate_4yr" value={formData.graduation_rate_4yr} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" />
              </div>
              <div>
                <label htmlFor="graduation_rate_6yr" className="block text-sm font-medium text-gray-700">6-Year Graduation Rate (%)</label>
                <input type="number" step="0.1" min="0" max="100" name="graduation_rate_6yr" id="graduation_rate_6yr" value={formData.graduation_rate_6yr} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" />
              </div>
              <div>
                <label htmlFor="employment_rate_6mo" className="block text-sm font-medium text-gray-700">Employment Rate 6 Months (%)</label>
                <input type="number" step="0.1" min="0" max="100" name="employment_rate_6mo" id="employment_rate_6mo" value={formData.employment_rate_6mo} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" />
              </div>
              <div>
                <label htmlFor="avg_starting_salary" className="block text-sm font-medium text-gray-700">Average Starting Salary (USD)</label>
                <input type="number" name="avg_starting_salary" id="avg_starting_salary" value={formData.avg_starting_salary} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" />
              </div>
              <div>
                <label htmlFor="internship_placement_support" className="block text-sm font-medium text-gray-700">Internship Placement Support (1-5)</label>
                <input type="number" min="1" max="5" name="internship_placement_support" id="internship_placement_support" value={formData.internship_placement_support} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" />
              </div>
              <div>
                <label htmlFor="alumni_network_strength" className="block text-sm font-medium text-gray-700">Alumni Network Strength (1-5)</label>
                <input type="number" min="1" max="5" name="alumni_network_strength" id="alumni_network_strength" value={formData.alumni_network_strength} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" />
              </div>
              <div>
                <label htmlFor="post_study_work_visa_months" className="block text-sm font-medium text-gray-700">Post-Study Work Visa (Months)</label>
                <input type="number" name="post_study_work_visa_months" id="post_study_work_visa_months" value={formData.post_study_work_visa_months} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" placeholder="e.g., 12, 24, 36" />
              </div>
              <div>
                <label htmlFor="ranking_world" className="block text-sm font-medium text-gray-700">World Ranking (Legacy)</label>
                <input type="number" name="ranking_world" id="ranking_world" value={formData.ranking_world} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" placeholder="50" />
              </div>
            </div>
          </div>

        </div>
      </form>
    </div>
  );
}
