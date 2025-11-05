import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Building2, Globe, MapPin, Mail, Phone, Calendar, ExternalLink } from 'lucide-react';
import { adminUniversityGroupsAPI } from '../../lib/api';
import { getCurrentUser } from '../../lib/api';
import { useTranslation } from 'react-i18next';

interface GroupData {
  id?: string;
  name: string;
  short_name?: string;
  slug?: string;
  description?: string;
  logo_url?: string;
  hero_image_url?: string;
  website_url?: string;
  established_year?: number | string;
  headquarters_country?: string;
  headquarters_city?: string;
  headquarters_address?: string;
  contact_email?: string;
  contact_phone?: string;
}

const allCountries = ['USA', 'Canada', 'France', 'UK', 'Germany', 'Australia', 'Japan', 'South Korea', 'Singapore', 'Netherlands', 'Switzerland', 'Sweden', 'Other'];

export default function GroupEditor() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<GroupData>({
    name: '',
    short_name: '',
    slug: '',
    description: '',
    logo_url: '',
    hero_image_url: '',
    website_url: '',
    established_year: '',
    headquarters_country: 'USA',
    headquarters_city: '',
    headquarters_address: '',
    contact_email: '',
    contact_phone: '',
  });

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      navigate('/login');
      return;
    }
    if (isEditMode && id) {
      fetchGroup(id);
    }
  }, [id, isEditMode, navigate]);

  const fetchGroup = async (groupId: string) => {
    try {
      setLoading(true);
      const data = await adminUniversityGroupsAPI.getGroupById(groupId);
      if (data) {
        setFormData({
          ...data,
          established_year: data.established_year || '',
          headquarters_country: data.headquarters_country || 'USA',
          headquarters_city: data.headquarters_city || '',
          headquarters_address: data.headquarters_address || '',
          contact_email: data.contact_email || '',
          contact_phone: data.contact_phone || '',
          description: data.description || '',
          logo_url: data.logo_url || '',
          hero_image_url: data.hero_image_url || '',
          website_url: data.website_url || '',
          short_name: data.short_name || '',
          slug: data.slug || '',
        });
      } else {
        setError('Group not found.');
      }
    } catch (err: any) {
      setError('Failed to load group: ' + err.message);
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

  // Auto-generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData(prev => ({
      ...prev,
      name,
      // Auto-generate slug if it's empty or was auto-generated
      slug: prev.slug === '' || prev.slug === generateSlug(prev.name) ? generateSlug(name) : prev.slug,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      // Prepare data for submission
      const submitData: any = {
        name: formData.name.trim(),
        short_name: formData.short_name?.trim() || null,
        slug: formData.slug?.trim() || generateSlug(formData.name),
        description: formData.description?.trim() || null,
        logo_url: formData.logo_url?.trim() || null,
        hero_image_url: formData.hero_image_url?.trim() || null,
        website_url: formData.website_url?.trim() || null,
        established_year: formData.established_year ? parseInt(String(formData.established_year)) : null,
        headquarters_country: formData.headquarters_country || null,
        headquarters_city: formData.headquarters_city?.trim() || null,
        headquarters_address: formData.headquarters_address?.trim() || null,
        contact_email: formData.contact_email?.trim() || null,
        contact_phone: formData.contact_phone?.trim() || null,
      };

      if (isEditMode && id) {
        await adminUniversityGroupsAPI.updateGroup(id, submitData);
        alert('Group updated successfully!');
      } else {
        await adminUniversityGroupsAPI.createGroup(submitData);
        alert('Group created successfully!');
      }
      navigate('/admin/university-groups');
    } catch (err: any) {
      setError('Failed to save group: ' + (err.message || 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-gray-600">{t('common.loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link to="/admin/university-groups" className="text-primary-600 hover:text-primary-700 mb-4 inline-block flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Groups
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditMode ? 'Edit University Group' : 'Create New University Group'}
          </h1>
          <p className="text-gray-600 mt-2">
            {isEditMode ? 'Update group information and details' : 'Add a new university group (parent organization)'}
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* General Identity & Metadata */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 flex items-center gap-2 mb-4">
              <Building2 className="w-5 h-5 text-primary-600" />
              General Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Group Name *</label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  required
                  value={formData.name}
                  onChange={handleNameChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  placeholder="e.g., La Rochelle University"
                />
              </div>
              <div>
                <label htmlFor="short_name" className="block text-sm font-medium text-gray-700">Short Name / Abbreviation</label>
                <input
                  type="text"
                  name="short_name"
                  id="short_name"
                  value={formData.short_name}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  placeholder="e.g., ULr, LRU"
                />
              </div>
              <div>
                <label htmlFor="slug" className="block text-sm font-medium text-gray-700">Slug (URL-friendly identifier)</label>
                <input
                  type="text"
                  name="slug"
                  id="slug"
                  value={formData.slug}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  placeholder="e.g., la-rochelle-university"
                />
                <p className="mt-1 text-xs text-gray-500">Auto-generated from name if left empty</p>
              </div>
              <div className="md:col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  name="description"
                  id="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  placeholder="Brief description of the university group..."
                />
              </div>
              <div>
                <label htmlFor="established_year" className="block text-sm font-medium text-gray-700">Established Year</label>
                <input
                  type="number"
                  name="established_year"
                  id="established_year"
                  value={formData.established_year}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  placeholder="e.g., 1991"
                  min="1000"
                  max="2099"
                />
              </div>
            </div>
          </div>

          {/* Media & Links */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 flex items-center gap-2 mb-4">
              <ExternalLink className="w-5 h-5 text-primary-600" />
              Media & Links
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="logo_url" className="block text-sm font-medium text-gray-700">Logo URL</label>
                <input
                  type="url"
                  name="logo_url"
                  id="logo_url"
                  value={formData.logo_url}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  placeholder="https://example.com/logo.png"
                />
              </div>
              <div>
                <label htmlFor="hero_image_url" className="block text-sm font-medium text-gray-700">Hero Image URL</label>
                <input
                  type="url"
                  name="hero_image_url"
                  id="hero_image_url"
                  value={formData.hero_image_url}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  placeholder="https://example.com/hero.jpg"
                />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="website_url" className="block text-sm font-medium text-gray-700">Website URL</label>
                <input
                  type="url"
                  name="website_url"
                  id="website_url"
                  value={formData.website_url}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  placeholder="https://www.example.com"
                />
              </div>
            </div>
          </div>

          {/* Headquarters & Location */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-primary-600" />
              Headquarters & Location
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="headquarters_country" className="block text-sm font-medium text-gray-700">Country</label>
                <select
                  name="headquarters_country"
                  id="headquarters_country"
                  value={formData.headquarters_country}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                >
                  {allCountries.map(country => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="headquarters_city" className="block text-sm font-medium text-gray-700">City</label>
                <input
                  type="text"
                  name="headquarters_city"
                  id="headquarters_city"
                  value={formData.headquarters_city}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  placeholder="e.g., La Rochelle"
                />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="headquarters_address" className="block text-sm font-medium text-gray-700">Full Address</label>
                <textarea
                  name="headquarters_address"
                  id="headquarters_address"
                  rows={2}
                  value={formData.headquarters_address}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  placeholder="Street address, postal code, etc."
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 flex items-center gap-2 mb-4">
              <Mail className="w-5 h-5 text-primary-600" />
              Contact Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="contact_email" className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  name="contact_email"
                  id="contact_email"
                  value={formData.contact_email}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  placeholder="contact@example.com"
                />
              </div>
              <div>
                <label htmlFor="contact_phone" className="block text-sm font-medium text-gray-700">Phone</label>
                <input
                  type="tel"
                  name="contact_phone"
                  id="contact_phone"
                  value={formData.contact_phone}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  placeholder="+33 5 46 45 91 00"
                />
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-4">
            <Link
              to="/admin/university-groups"
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : isEditMode ? 'Update Group' : 'Create Group'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

