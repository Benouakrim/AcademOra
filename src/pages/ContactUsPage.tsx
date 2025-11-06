import { useState, useEffect } from 'react';
import { staticPagesAPI } from '../lib/api';

interface PageContent {
  title: string;
  content: string;
  meta_title: string;
  meta_description: string;
  updated_at: string;
}

export default function ContactUsPage() {
  const [pageContent, setPageContent] = useState<PageContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPageContent = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await staticPagesAPI.getPage('contact');
        if (data) {
          setPageContent(data);
        } else {
          setError('Page not found');
        }
      } catch (err: any) {
        console.error('Error fetching contact page:', err);
        setError(err.message || 'Failed to load page');
      } finally {
        setLoading(false);
      }
    };

    fetchPageContent();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error || !pageContent) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Page Not Found</h1>
          <p className="text-gray-600">{error || "The contact page you're looking for doesn't exist."}</p>
        </div>
      </div>
    );
  }

  // Render content without any default styling - let HTML/CSS override everything
  return (
    <div style={{ margin: 0, padding: 0, minHeight: '100vh' }}>
      <div dangerouslySetInnerHTML={{ __html: pageContent.content }} />
    </div>
  );
}
