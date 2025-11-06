import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Calendar, User, ArrowLeft, Edit, Trash2, Flame, Clock } from 'lucide-react'
import { adminAPI, blogAPI } from '../lib/api'
import { BlogService } from '../lib/services/blogService'
import { getCurrentUser } from '../lib/api'
import MarkdownPreview from '@uiw/react-markdown-preview'
import rehypeRaw from 'rehype-raw'
import remarkGfm from 'remark-gfm'
import SaveButton from '../components/SaveButton'
import SEO from '../components/SEO'
import '../styles/editor.css'

interface Article {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string
  category: string
  featured_image?: string
  created_at: string
  updated_at: string
  author_id: string
}

export default function ArticlePage() {
  const { slug } = useParams<{ slug: string }>()
  const [article, setArticle] = useState<Article | null>(null)
  const [latestArticles, setLatestArticles] = useState<Article[]>([])
  const [hotArticles, setHotArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const navigate = useNavigate()

  // Check if current user is admin
  const currentUser = getCurrentUser()
  const isAdmin = currentUser && (currentUser.role === 'admin' || currentUser.email === 'admin@academora.com')

  useEffect(() => {
    async function fetchArticle() {
      if (!slug) return

      try {
        const data = await BlogService.getArticle(slug)
        setArticle(data as Article)
      } catch (error) {
        console.error('Error fetching article:', error)
      } finally {
        setLoading(false)
      }
    }

    async function fetchSidebarArticles() {
      try {
        const allArticles = await blogAPI.getArticles()
        const articles = Array.isArray(allArticles) ? allArticles : []
        
        // Exclude current article
        const filtered = articles.filter(a => a.slug !== slug)
        
        // Latest articles (most recent, limit 3)
        const latest = [...filtered]
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 3)
        setLatestArticles(latest)
        
        // Hot articles (could be most recent or featured, limit 3)
        // For now, using most recent as "hot" - you can customize this logic
        const hot = [...filtered]
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 3)
        setHotArticles(hot)
      } catch (error) {
        console.error('Error fetching sidebar articles:', error)
      }
    }

    fetchArticle()
    fetchSidebarArticles()
  }, [slug])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const handleEditArticle = () => {
    if (article) {
      navigate(`/admin/articles/edit/${article.id}`)
    }
  }

  const handleDeleteArticle = async () => {
    if (!article) return
    
    if (!window.confirm(`Are you sure you want to delete "${article.title}"? This action cannot be undone.`)) {
      return
    }

    setDeleting(true)
    try {
      await adminAPI.deleteArticle(article.id)
      navigate('/blog')
    } catch (error: any) {
      console.error('Error deleting article:', error)
      alert('Failed to delete article: ' + (error.message || 'Unknown error'))
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen py-16">
        <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-12 xl:px-16">
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-gray-600">Loading article...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!article) {
    return (
      <div className="bg-gray-50 min-h-screen py-16">
        <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-12 xl:px-16">
          <div className="text-center py-20">
            <h1 className="text-2xl font-bold mb-4">Article Not Found</h1>
            <p className="text-gray-600 mb-6">The article you're looking for doesn't exist.</p>
            <Link to="/blog" className="btn-primary">
              Back to Blog
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <SEO title={`${article.title} | AcademOra`} description={article.excerpt || article.title} />
      
      <div className="w-full">
        <div className="px-4 sm:px-6 lg:px-8">
          <Link
            to="/blog"
            className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Blog
          </Link>
        </div>

        {/* Top Header Banner - Above Article */}
        <div className="w-full bg-white border-b border-gray-100">
          <div className="max-w-[970px] mx-auto px-4 py-3">
            <div
              className="rounded border border-dashed border-gray-300 bg-gray-50 p-3 text-center text-gray-600 text-sm"
              aria-label="Advertisement"
              data-testid="ad-header-banner"
            >
              Header Banner (728×90)
            </div>
          </div>
        </div>

        <article className="w-full bg-white shadow-lg p-4 sm:p-6 lg:p-8 xl:p-12 mb-12">
          {/* Admin Actions Bar */}
          {isAdmin && (
            <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-200">
              <div className="flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                Admin Mode
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleEditArticle}
                  className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
                >
                  <Edit className="h-4 w-4" />
                  Edit Article
                </button>
                <button
                  onClick={handleDeleteArticle}
                  disabled={deleting}
                  className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deleting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          <div className="mb-4 flex flex-wrap gap-2">
            {Array.isArray((article as any).terms) && (article as any).terms.length > 0 ? (
              (article as any).terms.map((t: any) => (
                <span key={t.id} className="inline-block bg-primary-100 text-primary-700 text-sm font-semibold px-4 py-1 rounded-full">
                  {t.name}
                </span>
              ))
            ) : (
            <span className="inline-block bg-primary-100 text-primary-700 text-sm font-semibold px-4 py-1 rounded-full">
              {article.category}
            </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            {article.title}
          </h1>

          {/* Ad Placeholder - Below Title */}
          <div
            className="mb-6 rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4 text-center text-gray-600 text-sm"
            aria-label="Advertisement"
            data-testid="ad-below-title"
          >
            Ad placeholder (970x250)
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 pb-6 border-b border-gray-200">
            <div className="flex flex-wrap items-center gap-4 text-gray-600 text-sm">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                <span>{formatDate(article.created_at)}</span>
              </div>
              <div className="flex items-center">
                <User className="h-4 w-4 mr-2" />
                <span>Author</span>
              </div>
            </div>
            <SaveButton
              itemType="article"
              itemId={article.id}
              itemData={{ title: article.title, excerpt: article.excerpt, slug: article.slug }}
            />
          </div>

          {article.featured_image && (
            <div className="mb-6 rounded-lg overflow-hidden">
              <img
                src={article.featured_image}
                alt={article.title}
                className="w-full h-auto object-cover max-h-[500px]"
              />
            </div>
          )}

          {/* In-Content Rectangle Ad - Wrapped */}
          <div className="mb-8 flex flex-col lg:flex-row gap-6 items-start">
            <div className="flex-1">
              <div className="prose prose-base sm:prose-lg max-w-none prose-headings:mb-4 prose-p:mb-3 prose-ul:mb-3 prose-li:mb-1 prose-h2:mt-6 prose-h3:mt-4 prose-h4:mt-3 leading-relaxed markdown-preview" data-color-mode="light">
                <MarkdownPreview 
                  source={article.content} 
                  rehypePlugins={[rehypeRaw]} 
                  remarkPlugins={[remarkGfm]}
                  style={{ background: 'transparent' }}
                  wrapperElement={{
                    "data-color-mode": "light"
                  }}
                />
              </div>
            </div>
            
            {/* Side Rectangle Ad */}
            <div className="hidden lg:block w-[300px] flex-shrink-0">
              <div
                className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4 text-center text-gray-600 text-sm sticky top-24"
                aria-label="Advertisement"
                data-testid="ad-in-content-rectangle"
              >
                Rectangle Ad (300×250)
              </div>
            </div>
          </div>

          {/* Mid-Content Leaderboard */}
          <div
            className="mb-8 rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4 text-center text-gray-600 text-sm"
            aria-label="Advertisement"
            data-testid="ad-mid-content"
          >
            Mid-Content Leaderboard (728×90)
          </div>

          {/* Mobile In-Content Ad */}
          <div className="lg:hidden mb-6">
            <div
              className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-3 text-center text-gray-600 text-xs"
              aria-label="Advertisement"
              data-testid="ad-mobile-in-content"
            >
              Mobile Ad (300×250)
            </div>
          </div>

          {/* Ad Placeholder - Below Content */}
          <div
            className="mt-8 rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-gray-600"
            aria-label="Advertisement"
            data-testid="ad-below-content"
          >
            Ad placeholder (970x250)
          </div>
        </article>

        {/* Related Articles Section - Bottom */}
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Latest Articles */}
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <Clock className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white">Latest Articles</h3>
              </div>
            </div>
            <div className="p-6 space-y-4">
              {latestArticles.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No articles yet</p>
              ) : (
                latestArticles.map((art) => (
                  <Link
                    key={art.id}
                    to={`/blog/${art.slug}`}
                    className="block group hover:scale-[1.01] transition-all duration-200"
                  >
                    <div className="bg-white rounded-xl shadow-md hover:shadow-lg overflow-hidden border border-gray-100 flex gap-4">
                      {art.featured_image && (
                        <div className="w-32 h-24 flex-shrink-0 overflow-hidden bg-gray-200">
                          <img
                            src={art.featured_image}
                            alt={art.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        </div>
                      )}
                      <div className="flex-1 p-4">
                        <h4 className="text-sm font-bold text-gray-900 group-hover:text-blue-600 line-clamp-2 mb-2 transition-colors">
                          {art.title}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(art.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Hot Articles */}
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <Flame className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white">Hot Articles</h3>
              </div>
            </div>
            <div className="p-6 space-y-4">
              {hotArticles.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No articles yet</p>
              ) : (
                hotArticles.map((art) => (
                  <Link
                    key={art.id}
                    to={`/blog/${art.slug}`}
                    className="block group hover:scale-[1.01] transition-all duration-200"
                  >
                    <div className="bg-white rounded-xl shadow-md hover:shadow-lg overflow-hidden border border-gray-100 flex gap-4">
                      {art.featured_image && (
                        <div className="w-32 h-24 flex-shrink-0 overflow-hidden bg-gray-200">
                          <img
                            src={art.featured_image}
                            alt={art.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        </div>
                      )}
                      <div className="flex-1 p-4">
                        <h4 className="text-sm font-bold text-gray-900 group-hover:text-orange-600 line-clamp-2 mb-2 transition-colors">
                          {art.title}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(art.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
    
    {/* Sticky Mobile Footer Ad */}
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
      <div className="max-w-[320px] mx-auto px-2 py-2">
        <div
          className="rounded border border-dashed border-gray-300 bg-gray-50 p-2 text-center text-gray-600 text-xs"
          aria-label="Advertisement"
          data-testid="ad-mobile-footer"
        >
          Mobile Footer Ad (320×50)
        </div>
      </div>
    </div>
  </div>
  )
}

