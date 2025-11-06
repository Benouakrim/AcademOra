import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, Eye, EyeOff, Monitor } from 'lucide-react';
import { getCurrentUser, adminStaticPagesAPI } from '../../lib/api';
import Notification from '../../components/Notification';

interface AboutContent {
  title: string;
  content: string;
  meta_title: string;
  meta_description: string;
}

interface NotificationState {
  message: string;
  type: 'success' | 'error';
}

export default function AdminAboutPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [notification, setNotification] = useState<NotificationState | null>(null);
  
  const [formData, setFormData] = useState<AboutContent>({
    title: 'About AcademOra',
    content: '',
    meta_title: 'About AcademOra - Academic Orientation & Guidance Platform',
    meta_description: "Learn about AcademOra's mission to provide comprehensive academic orientation and guidance to students worldwide.",
  });

  useEffect(() => {
    const user = getCurrentUser();
    if (!user || user.role !== 'admin') {
      navigate('/login');
      return;
    }
    fetchPageContent();
  }, [navigate]);

  const fetchPageContent = async () => {
    try {
      setLoading(true);
      const data = await adminStaticPagesAPI.getPage('about');
      if (data) {
        setFormData({
          title: data.title || 'About AcademOra',
          content: data.content || '',
          meta_title: data.meta_title || 'About AcademOra - Academic Orientation & Guidance Platform',
          meta_description: data.meta_description || "Learn about AcademOra's mission to provide comprehensive academic orientation and guidance to students worldwide.",
        });
      }
    } catch (err: any) {
      console.error('Failed to fetch about page:', err);
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

    try {
      await adminStaticPagesAPI.updatePage('about', formData);
      setNotification({
        message: 'Changes saved successfully!',
        type: 'success',
      });
    } catch (err: any) {
      setNotification({
        message: err.message || 'Failed to save changes',
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
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">About Page Management</h1>
              <p className="text-gray-600">Edit the About Us page content</p>
            </div>
            <Link
              to="/about"
              target="_blank"
              className="btn-secondary flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              View Page
            </Link>
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
              <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-16">
                <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-12 xl:px-16">
                  <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-12">
                      <h1 className="text-4xl md:text-5xl font-bold text-white text-center">
                        {formData.title}
                      </h1>
                    </div>

                    {/* Content */}
                    <div className="px-10 py-16">
                      <div 
                        className="prose prose-lg max-w-none prose-headings:mb-6 prose-p:mb-4 prose-ul:mb-4 prose-li:mb-2 prose-h2:mt-8 prose-h3:mt-6 prose-h4:mt-4 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: formData.content }}
                      />
                    </div>
                  </div>
                </div>
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
              placeholder="SEO title for search engines"
            />
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="SEO description for search engines"
            />
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
              Page Content (HTML) *
            </label>
            <textarea
              id="content"
              name="content"
              required
              rows={20}
              value={formData.content}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-mono text-sm"
              placeholder="Enter HTML content for the About page..."
            />
            <p className="mt-2 text-xs text-gray-500">
              You can use HTML tags to format the content. The content will be rendered as-is on the About page.
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
                  to="/admin"
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

