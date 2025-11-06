import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, Eye, EyeOff, Monitor, X } from 'lucide-react';
import { getCurrentUser, adminStaticPagesAPI } from '../../lib/api';
import Notification from '../../components/Notification';

interface PageData {
  id?: string;
  slug: string;
  title: string;
  content: string;
  meta_title: string;
  meta_description: string;
  status: 'published' | 'draft';
  visibility_areas: string[];
  sort_order: number;
}

const VISIBILITY_AREAS = [
  { value: 'navbar', label: 'Navigation Bar' },
  { value: 'footer', label: 'Footer' },
  { value: 'sidebar', label: 'Sidebar' },
  { value: 'mobile_menu', label: 'Mobile Menu' },
  { value: 'sitemap', label: 'Sitemap' },
  { value: 'none', label: 'None (Hidden)' },
];

export default function UnifiedPageEditor() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const isEditMode = !!slug;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [formData, setFormData] = useState<PageData>({
    slug: '',
    title: '',
    content: '',
    meta_title: '',
    meta_description: '',
    status: 'draft',
    visibility_areas: [],
    sort_order: 0,
  });

  useEffect(() => {
    const user = getCurrentUser();
    if (!user || user.role !== 'admin') {
      navigate('/login');
      return;
    }

    if (isEditMode && slug) {
      fetchPageContent();
    } else {
      setLoading(false);
    }
  }, [navigate, isEditMode, slug]);

  const fetchPageContent = async () => {
    try {
      setLoading(true);
      const data = await adminStaticPagesAPI.getPage(slug!);
      if (data) {
        setFormData({
          id: data.id,
          slug: data.slug || slug!,
          title: data.title || '',
          content: data.content || '',
          meta_title: data.meta_title || '',
          meta_description: data.meta_description || '',
          status: data.status || 'draft',
          visibility_areas: Array.isArray(data.visibility_areas) ? data.visibility_areas : [],
          sort_order: data.sort_order || 0,
        });
      }
    } catch (err: any) {
      console.error('Failed to fetch page:', err);
      setNotification({
        message: err.message || 'Failed to load page content',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setNotification(null);

    if (!formData.slug.trim()) {
      setNotification({
        message: 'Slug is required',
        type: 'error',
      });
      setSaving(false);
      return;
    }

    try {
      await adminStaticPagesAPI.updatePage(formData.slug, formData);
      setNotification({
        message: 'Page saved successfully!',
        type: 'success',
      });
      setTimeout(() => {
        navigate('/admin/pages');
      }, 1500);
    } catch (err: any) {
      setNotification({
        message: err.message || 'Failed to save page',
        type: 'error',
      });
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

    // Auto-generate slug from title if creating new page
    if (name === 'title' && !isEditMode) {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setFormData(prev => ({
        ...prev,
        slug,
      }));
    }
  };

  const handleVisibilityAreaToggle = (area: string) => {
    setFormData(prev => {
      const areas = prev.visibility_areas || [];
      if (areas.includes(area)) {
        return {
          ...prev,
          visibility_areas: areas.filter(a => a !== area),
        };
      } else {
        return {
          ...prev,
          visibility_areas: [...areas, area],
        };
      }
    });
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
            to="/admin/pages"
            className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-6 text-sm font-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Pages
          </Link>

          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                {isEditMode ? 'Edit Page' : 'Create New Page'}
              </h1>
              <p className="text-gray-600">Manage page content and settings</p>
            </div>
            {isEditMode && (
              <Link
                to={`/${formData.slug}`}
                target="_blank"
                className="btn-secondary flex items-center gap-2"
              >
                <Eye className="h-4 w-4" />
                View Page
              </Link>
            )}
          </div>
        </div>

        {notification && (
          <Notification
            message={notification.message}
            type={notification.type}
            onClose={() => setNotification(null)}
          />
        )}

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Preview/Edit Toggle */}
          <div className="border-b border-gray-200 px-6 py-4 bg-gray-50 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Monitor className="h-5 w-5 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">
                {showPreview ? 'Preview Mode' : 'Edit Mode'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors"
            >
              {showPreview ? (
                <>
                  <EyeOff className="h-4 w-4" />
                  Edit
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4" />
                  Preview
                </>
              )}
            </button>
          </div>

          {showPreview ? (
            /* Preview Mode */
            <div className="p-6">
              <div className="min-h-screen" style={{ margin: 0, padding: 0 }}>
                <div dangerouslySetInnerHTML={{ __html: formData.content }} />
              </div>
            </div>
          ) : (
            /* Edit Mode */
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Page Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter page title"
                />
              </div>

              <div>
                <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-2">
                  URL Slug *
                </label>
                <input
                  type="text"
                  id="slug"
                  name="slug"
                  required
                  value={formData.slug}
                  onChange={handleInputChange}
                  pattern="[a-z0-9-]+"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-mono text-sm"
                  placeholder="page-url-slug"
                />
                <p className="mt-1 text-xs text-gray-500">Lowercase letters, numbers, and hyphens only</p>
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'published' | 'draft' }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Page Visibility Areas
                </label>
                <p className="text-xs text-gray-500 mb-3">Select where this page should appear (multiple selections allowed)</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {VISIBILITY_AREAS.map((area) => (
                    <label
                      key={area.value}
                      className="flex items-center gap-2 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={formData.visibility_areas.includes(area.value)}
                        onChange={() => handleVisibilityAreaToggle(area.value)}
                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-700">{area.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="sort_order" className="block text-sm font-medium text-gray-700 mb-2">
                  Sort Order
                </label>
                <input
                  type="number"
                  id="sort_order"
                  name="sort_order"
                  value={formData.sort_order}
                  onChange={(e) => setFormData(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="0"
                />
                <p className="mt-1 text-xs text-gray-500">Lower numbers appear first in lists</p>
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
                  maxLength={60}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="SEO title for search engines"
                />
                <p className="mt-1 text-xs text-gray-500">{formData.meta_title.length}/60 characters</p>
              </div>

              <div>
                <label htmlFor="meta_description" className="block text-sm font-medium text-gray-700 mb-2">
                  Meta Description (SEO)
                </label>
                <textarea
                  id="meta_description"
                  name="meta_description"
                  rows={2}
                  value={formData.meta_description}
                  onChange={handleInputChange}
                  maxLength={160}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="SEO description for search engines"
                />
                <p className="mt-1 text-xs text-gray-500">{formData.meta_description.length}/160 characters</p>
              </div>

              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                  Page Content (HTML) *
                </label>
                <textarea
                  id="content"
                  name="content"
                  required
                  rows={25}
                  value={formData.content}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-mono text-sm"
                  placeholder="Enter HTML content for the page. Include &lt;style&gt; tags for CSS styling..."
                />
                <p className="mt-2 text-xs text-gray-500">
                  You can use HTML tags and CSS to format the content. The content will be rendered as-is on the page.
                  Include &lt;style&gt; tags for custom styling. All default styling is removed.
                </p>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <Link
                  to="/admin/pages"
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

