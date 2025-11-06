import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, Mail, Eye, Phone, MapPin, Clock, FileText } from 'lucide-react';
import { getCurrentUser } from '../../lib/api';

interface ContactSettings {
  // Contact Information
  email_general: string;
  email_support: string;
  phone_main: string;
  phone_emergency: string;
  address_name: string;
  address_street: string;
  address_city: string;
  address_state: string;
  address_zip: string;
  address_country: string;
  
  // Business Hours
  hours_weekday: string;
  hours_saturday: string;
  hours_sunday: string;
  hours_note: string;
  
  // Page Content
  page_title: string;
  page_description: string;
  meta_title: string;
  meta_description: string;
  
  // FAQ Content (HTML)
  faq_content: string;
}

export default function AdminContactPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState<ContactSettings>({
    email_general: 'hello@academora.com',
    email_support: 'support@academora.com',
    phone_main: '+1 (555) 123-4567',
    phone_emergency: '+1 (555) 123-4567',
    address_name: 'AcademOra Headquarters',
    address_street: '123 Education Boulevard, Suite 100',
    address_city: 'Boston',
    address_state: 'MA',
    address_zip: '02108',
    address_country: 'United States',
    hours_weekday: 'Monday - Friday: 8:00 AM - 8:00 PM EST',
    hours_saturday: 'Saturday: 10:00 AM - 4:00 PM EST',
    hours_sunday: 'Sunday: 12:00 PM - 4:00 PM EST',
    hours_note: '24/7 email support available',
    page_title: 'Get in Touch',
    page_description: 'Have questions about your academic journey? Need guidance on choosing the right field? Our team of experienced education counselors is here to help you every step of the way.',
    meta_title: 'Contact Us - AcademOra',
    meta_description: 'Get in touch with AcademOra for academic guidance, university application help, and study abroad support.',
    faq_content: '',
  });

  useEffect(() => {
    const user = getCurrentUser();
    if (!user || user.role !== 'admin') {
      navigate('/login');
      return;
    }
    // In real implementation, fetch from API
    const saved = localStorage.getItem('contact_page_settings');
    if (saved) {
      try {
        setFormData(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse saved settings');
      }
    }
    setLoading(false);
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      // In real implementation, save to API
      // await adminAPI.updateContactPage(formData);
      
      localStorage.setItem('contact_page_settings', JSON.stringify(formData));
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link
            to="/admin"
            className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-6 text-sm font-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Admin Dashboard
          </Link>
          
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Contact Page Settings</h1>
              <p className="text-gray-600">Manage contact information and page content</p>
            </div>
            <Link
              to="/contact"
              target="_blank"
              className="btn-secondary flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              View Page
            </Link>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-lg">
            Settings saved successfully!
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Page Content */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary-600" />
              Page Content
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="page_title" className="block text-sm font-medium text-gray-700 mb-2">
                  Page Title *
                </label>
                <input
                  type="text"
                  id="page_title"
                  name="page_title"
                  required
                  value={formData.page_title}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label htmlFor="meta_title" className="block text-sm font-medium text-gray-700 mb-2">
                  Meta Title (SEO)
                </label>
                <input
                  type="text"
                  id="meta_title"
                  name="meta_title"
                  value={formData.meta_title}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="page_description" className="block text-sm font-medium text-gray-700 mb-2">
                  Page Description
                </label>
                <textarea
                  id="page_description"
                  name="page_description"
                  rows={3}
                  value={formData.page_description}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="meta_description" className="block text-sm font-medium text-gray-700 mb-2">
                  Meta Description (SEO)
                </label>
                <textarea
                  id="meta_description"
                  name="meta_description"
                  rows={2}
                  value={formData.meta_description}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary-600" />
              Contact Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="email_general" className="block text-sm font-medium text-gray-700 mb-2">
                  General Email *
                </label>
                <input
                  type="email"
                  id="email_general"
                  name="email_general"
                  required
                  value={formData.email_general}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label htmlFor="email_support" className="block text-sm font-medium text-gray-700 mb-2">
                  Support Email *
                </label>
                <input
                  type="email"
                  id="email_support"
                  name="email_support"
                  required
                  value={formData.email_support}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label htmlFor="phone_main" className="block text-sm font-medium text-gray-700 mb-2">
                  Main Phone *
                </label>
                <input
                  type="tel"
                  id="phone_main"
                  name="phone_main"
                  required
                  value={formData.phone_main}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label htmlFor="phone_emergency" className="block text-sm font-medium text-gray-700 mb-2">
                  Emergency Phone
                </label>
                <input
                  type="tel"
                  id="phone_emergency"
                  name="phone_emergency"
                  value={formData.phone_emergency}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
          </div>

          {/* Address */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary-600" />
              Address
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="address_name" className="block text-sm font-medium text-gray-700 mb-2">
                  Location Name
                </label>
                <input
                  type="text"
                  id="address_name"
                  name="address_name"
                  value={formData.address_name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="address_street" className="block text-sm font-medium text-gray-700 mb-2">
                  Street Address
                </label>
                <input
                  type="text"
                  id="address_street"
                  name="address_street"
                  value={formData.address_street}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label htmlFor="address_city" className="block text-sm font-medium text-gray-700 mb-2">
                  City
                </label>
                <input
                  type="text"
                  id="address_city"
                  name="address_city"
                  value={formData.address_city}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label htmlFor="address_state" className="block text-sm font-medium text-gray-700 mb-2">
                  State/Province
                </label>
                <input
                  type="text"
                  id="address_state"
                  name="address_state"
                  value={formData.address_state}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label htmlFor="address_zip" className="block text-sm font-medium text-gray-700 mb-2">
                  ZIP/Postal Code
                </label>
                <input
                  type="text"
                  id="address_zip"
                  name="address_zip"
                  value={formData.address_zip}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label htmlFor="address_country" className="block text-sm font-medium text-gray-700 mb-2">
                  Country
                </label>
                <input
                  type="text"
                  id="address_country"
                  name="address_country"
                  value={formData.address_country}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
          </div>

          {/* Business Hours */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary-600" />
              Business Hours
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="hours_weekday" className="block text-sm font-medium text-gray-700 mb-2">
                  Weekday Hours
                </label>
                <input
                  type="text"
                  id="hours_weekday"
                  name="hours_weekday"
                  value={formData.hours_weekday}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label htmlFor="hours_saturday" className="block text-sm font-medium text-gray-700 mb-2">
                  Saturday Hours
                </label>
                <input
                  type="text"
                  id="hours_saturday"
                  name="hours_saturday"
                  value={formData.hours_saturday}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label htmlFor="hours_sunday" className="block text-sm font-medium text-gray-700 mb-2">
                  Sunday Hours
                </label>
                <input
                  type="text"
                  id="hours_sunday"
                  name="hours_sunday"
                  value={formData.hours_sunday}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label htmlFor="hours_note" className="block text-sm font-medium text-gray-700 mb-2">
                  Hours Note
                </label>
                <input
                  type="text"
                  id="hours_note"
                  name="hours_note"
                  value={formData.hours_note}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
          </div>

          {/* FAQ Content */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary-600" />
              FAQ Content (HTML)
            </h2>
            <div>
              <label htmlFor="faq_content" className="block text-sm font-medium text-gray-700 mb-2">
                FAQ Section HTML
              </label>
              <textarea
                id="faq_content"
                name="faq_content"
                rows={15}
                value={formData.faq_content}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-mono text-sm"
                placeholder="Enter HTML content for the FAQ section..."
              />
              <p className="mt-2 text-xs text-gray-500">
                HTML content for the FAQ section. The contact form structure is fixed and cannot be edited.
              </p>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="btn-primary flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
            <Link
              to="/admin"
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

