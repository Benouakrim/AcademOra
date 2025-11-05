import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Building, DollarSign, Book, Flag, Percent, Globe, Calendar, FileText } from 'lucide-react';
import { adminUniversityAPI } from '../../lib/api';
import { getCurrentUser } from '../../lib/api';
import { useTranslation } from 'react-i18next';

interface UniversityData {
  id?: string;
  name: string;
  country: string;
  description: string;
  image_url: string;
  avg_tuition_per_year: number | string;
  min_gpa: number | string;
  interests: string; // Comma-separated string for editing
  application_deadline: string;
  acceptance_rate: number | string;
  ranking_world: number | string;
  required_tests: string; // Comma-separated string for editing
  program_url: string;
}

const allCountries = ['USA', 'Canada', 'France', 'UK', 'Germany', 'Australia', 'Other'];

export default function UniversityEditor() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
  });

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      navigate('/login');
      return;
    }
    if (isEditMode && id) {
      fetchUniversity(id);
    }
  }, [id, isEditMode, navigate]);

  const fetchUniversity = async (uniId: string) => {
    try {
      setLoading(true);
      const data = await adminUniversityAPI.getUniversityById(uniId);
      if (data) {
        setFormData({
          ...data,
          // Convert arrays back to comma-separated strings for editing
          interests: Array.isArray(data.interests) ? data.interests.join(', ') : '',
          required_tests: Array.isArray(data.required_tests) ? data.required_tests.join(', ') : '',
          // Handle null or 0 values for inputs
          avg_tuition_per_year: data.avg_tuition_per_year || '',
          min_gpa: data.min_gpa || '',
          application_deadline: data.application_deadline ? data.application_deadline.split('T')[0] : '', // Format date for input
          acceptance_rate: data.acceptance_rate || '',
          ranking_world: data.ranking_world || '',
          program_url: data.program_url || '',
          image_url: data.image_url || '',
          description: data.description || '',
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
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      if (isEditMode && id) {
        await adminUniversityAPI.updateUniversity(id, formData);
      } else {
        await adminUniversityAPI.createUniversity(formData);
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
        <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 flex items-center gap-2 mb-4">
                <Building className="w-5 h-5 text-primary-600" />
                Core Information
              </h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                  <input type="text" name="name" id="name" required value={formData.name} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" />
                </div>
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea name="description" id="description" rows={4} value={formData.description} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"></textarea>
                </div>
                <div>
                  <label htmlFor="image_url" className="block text-sm font-medium text-gray-700">Image URL</label>
                  <input type="url" name="image_url" id="image_url" value={formData.image_url} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" placeholder="[https://example.com/image.png](https://example.com/image.png)" />
                </div>
                <div>
                  <label htmlFor="program_url" className="block text-sm font-medium text-gray-700">Program URL</label>
                  <input type="url" name="program_url" id="program_url" value={formData.program_url} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" placeholder="[https://example.edu/programs](https://example.edu/programs)" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 flex items-center gap-2 mb-4">
                <Book className="w-5 h-5 text-primary-600" />
                Academic Details
              </h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="interests" className="block text-sm font-medium text-gray-700">Interests</label>
                  <input type="text" name="interests" id="interests" required value={formData.interests} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" />
                  <p className="mt-1 text-xs text-gray-500">Comma-separated (e.g., Engineering, Business, Arts)</p>
                </div>
                <div>
                  <label htmlFor="required_tests" className="block text-sm font-medium text-gray-700">Required Tests</label>
                  <input type="text" name="required_tests" id="required_tests" value={formData.required_tests} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" />
                  <p className="mt-1 text-xs text-gray-500">Comma-separated (e.g., SAT, TOEFL, IELTS)</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Sidebar Column */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 flex items-center gap-2 mb-4">
                <Flag className="w-5 h-5 text-primary-600" />
                Location
              </h2>
              <div>
                <label htmlFor="country" className="block text-sm font-medium text-gray-700">Country</label>
                <select name="country" id="country" required value={formData.country} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500">
                  {allCountries.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 flex items-center gap-2 mb-4">
                <DollarSign className="w-5 h-5 text-primary-600" />
                Financials & Admissions
              </h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="avg_tuition_per_year" className="block text-sm font-medium text-gray-700">Avg. Tuition / Year</label>
                  <input type="number" name="avg_tuition_per_year" id="avg_tuition_per_year" required value={formData.avg_tuition_per_year} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" placeholder="30000" />
                </div>
                <div>
                  <label htmlFor="min_gpa" className="block text-sm font-medium text-gray-700">Min. GPA (4.0 Scale)</label>
                  <input type="number" step="0.1" min="0" max="4" name="min_gpa" id="min_gpa" value={formData.min_gpa} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" placeholder="3.0" />
                </div>
                <div>
                  <label htmlFor="application_deadline" className="block text-sm font-medium text-gray-700">Application Deadline</label>
                  <input type="date" name="application_deadline" id="application_deadline" value={formData.application_deadline} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" />
                </div>
                <div>
                  <label htmlFor="acceptance_rate" className="block text-sm font-medium text-gray-700">Acceptance Rate (%)</label>
                  <input type="number" step="0.1" min="0" max="100" name="acceptance_rate" id="acceptance_rate" value={formData.acceptance_rate} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" placeholder="25" />
                </div>
                <div>
                  <label htmlFor="ranking_world" className="block text-sm font-medium text-gray-700">World Ranking</label>
                  <input type="number" name="ranking_world" id="ranking_world" value={formData.ranking_world} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" placeholder="50" />
                </div>
              </div>
            </div>
          </div>

        </div>
      </form>
    </div>
  );
}
