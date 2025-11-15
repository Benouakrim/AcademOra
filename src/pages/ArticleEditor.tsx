import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getCurrentUser } from '../lib/api';
import { useTranslation } from 'react-i18next';
import { useArticleEditor, type EditorFormData } from '../hooks/useArticleEditor';
import EditorHeader from '../components/editor/EditorHeader';
import SidebarSettings from '../components/editor/SidebarSettings';
import SEOSidebar from '../components/editor/SEOSidebar';
import RichTextEditor from '../components/editor/RichTextEditor';
import MessageBanner from '../components/editor/MessageBanner';
import '../styles/editor.css';

export default function ArticleEditor() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const isEditMode = !!id;
  const isUserMode = location.pathname.startsWith('/write-article');

  const [showSEO, setShowSEO] = useState(false);
  const {
    loading,
    saving,
    error,
    setError,
    message,
    categories,
    termsByTaxonomy,
    TAXONOMY_KEYS,
    submissionLimit,
    formData,
    handleTitleChange,
    handleInputChange,
    handleExcerptChange,
    toggleTerm,
    editor,
    adminSave,
    userSave,
  } = useArticleEditor(isUserMode ? 'user' : 'admin', id);

  // Route awareness (allow admin and user routes)
  useEffect(() => {
    const validRoutes = ['/admin/articles/new', '/admin/articles/edit/', '/write-article'];
    const isValidRoute = validRoutes.some(route => location.pathname.startsWith(route));
    if (!isValidRoute) {
      setError('Invalid editor route. Redirecting...');
      setTimeout(() => navigate(isUserMode ? '/my-articles' : '/admin'), 1500);
    }
  }, [location.pathname, id, isEditMode, navigate, setError, isUserMode]);

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) navigate('/login');
  }, [navigate]);

  // Keep editor content in sync when changed externally
  useEffect(() => {
    if (editor && formData.content !== editor.getHTML()) {
      editor.commands.setContent(formData.content);
    }
  }, [formData.content, editor]);

  // Local adapters to keep JSX tidy
  const setSlug = (v: string) => handleInputChange('slug', v)
  const setCategory = (v: string) => handleInputChange('category', v)
  const setFeatured = (v: string) => handleInputChange('featured_image', v)
  const setPublished = (v: boolean) => handleInputChange('published', v)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isUserMode) {
      await userSave('draft');
      navigate('/my-articles');
    } else {
      await adminSave();
      navigate('/admin');
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-gray-600">{t('common.loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)]">
      <div className="flex h-screen">
        {/* Left Sidebar */}
        <div className="w-80 bg-[var(--color-bg-secondary)]/95 backdrop-blur-sm border-r border-[var(--color-border-primary)]/80 overflow-y-auto scrollbar-thin transition-all shadow-lg">
          <SidebarSettings
            formData={formData}
            setTitle={(v) => handleTitleChange(v)}
            setSlug={setSlug}
            setExcerpt={(v) => handleExcerptChange(v)}
            setCategory={setCategory}
            setFeatured={(v) => setFeatured(v as string)}
            setPublished={(v) => setPublished(v as boolean)}
            toggleTerm={toggleTerm}
            categories={categories.map((c) => ({ id: c.id, name: c.name }))}
            termsByTaxonomy={termsByTaxonomy}
            taxonomyKeys={TAXONOMY_KEYS}
            showTaxonomies={!isUserMode}
            showPublished={!isUserMode}
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col bg-[var(--color-bg-primary)]">
          <EditorHeader
            backTo={isUserMode ? '/my-articles' : '/admin'}
            saving={saving}
            mode={isUserMode ? 'user' : 'admin'}
            onAdminSubmit={async () => { await adminSave(); }}
            onUserDraft={async () => { await userSave('draft'); }}
            onUserSubmit={async () => { await userSave('pending'); }}
            disableUserSubmit={Boolean(submissionLimit && !submissionLimit.canSubmit && !isEditMode)}
          />

          {/* Editor Area */}
          <div className="flex-1 overflow-hidden flex flex-col">
            {error && <MessageBanner type="error" text={error} />}
            {message && <MessageBanner type="success" text={message} />}
            <form id="article-form" onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
              <RichTextEditor editor={editor} />
            </form>
          </div>
        </div>

        {/* Right Sidebar - SEO */}
        <div className="w-80 bg-[var(--color-bg-secondary)]/95 backdrop-blur-sm border-l border-[var(--color-border-primary)]/80 overflow-y-auto scrollbar-thin transition-all shadow-lg">
          <SEOSidebar
            open={showSEO}
            setOpen={setShowSEO}
            formData={{
              focus_keyword: formData.focus_keyword,
              meta_title: formData.meta_title,
              meta_description: formData.meta_description,
              meta_keywords: formData.meta_keywords,
              og_image: formData.og_image,
              canonical_url: formData.canonical_url,
            }}
            setValue={(name: keyof EditorFormData, value: string) => handleInputChange(name, value)}
          />
        </div>
      </div>
    </div>
  );
}

