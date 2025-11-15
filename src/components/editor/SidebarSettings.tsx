import ImageUpload from '../ImageUpload'

interface Category { id: string; name: string }

interface SidebarSettingsProps {
  formData: {
    title: string
    slug: string
    excerpt: string
    category: string
    featured_image: string
    published: boolean
    term_ids: string[]
  }
  setTitle: (v: string) => void
  setSlug: (v: string) => void
  setExcerpt: (v: string) => void
  setCategory: (v: string) => void
  setFeatured: (v: string) => void
  setPublished: (v: boolean) => void
  toggleTerm: (id: string) => void
  categories: Category[]
  termsByTaxonomy: Record<string, Array<{ id: string; name: string }>>
  taxonomyKeys: string[]
  showTaxonomies?: boolean
  showPublished?: boolean
}

export default function SidebarSettings({
  formData,
  setTitle,
  setSlug,
  setExcerpt,
  setCategory,
  setFeatured,
  setPublished,
  toggleTerm,
  categories,
  termsByTaxonomy,
  taxonomyKeys,
  showTaxonomies = true,
  showPublished = true,
}: SidebarSettingsProps) {
  return (
    <div className="p-6 animate-fadeIn text-[var(--color-text-primary)]">
      <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-6 flex items-center gap-2">
        <span className="w-1 h-6 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full shadow-sm"></span>
        Article Settings
      </h2>

      {/* Title */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-[var(--color-text-primary)]/80 mb-2">Title</label>
        <input
          type="text"
          required
          value={formData.title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-2 bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-primary)] border border-[var(--color-border-primary)] transition-all duration-200 hover:bg-[var(--color-interactive-bg)] focus:bg-[var(--color-bg-secondary)]"
          placeholder="Enter article title"
        />
      </div>

      {/* Slug */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-[var(--color-text-primary)]/80 mb-2">Slug</label>
        <input
          type="text"
          required
          value={formData.slug}
          onChange={(e) => setSlug(e.target.value)}
          className="w-full px-4 py-2 bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-primary)] border border-[var(--color-border-primary)] transition-all duration-200 hover:bg-[var(--color-interactive-bg)] focus:bg-[var(--color-bg-secondary)]"
          placeholder="article-url-slug"
        />
      </div>

      {/* Category */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-[var(--color-text-primary)]/80 mb-2">Category</label>
        <select
          required
          value={formData.category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full px-4 py-2 bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-primary)] border border-[var(--color-border-primary)] transition-all duration-200 hover:bg-[var(--color-interactive-bg)] focus:bg-[var(--color-bg-secondary)]"
        >
          {categories.length > 0 ? (
            categories.map((cat) => (
              <option key={cat.id} value={cat.name}>
                {cat.name}
              </option>
            ))
          ) : (
            <option value="General">General</option>
          )}
        </select>
        {categories.length === 0 && (
          <p className="mt-1 text-xs text-[var(--color-text-secondary)]">Loading categories... Using default options.</p>
        )}
      </div>

      {/* Taxonomies */}
      {showTaxonomies && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-[var(--color-text-primary)]/80 mb-2">Classifications</label>
          <div className="space-y-4">
            {taxonomyKeys.map((key) => {
              const label = key === 'content_type' ? 'Content Type' : key.charAt(0).toUpperCase() + key.slice(1)
              const terms = termsByTaxonomy[key] || []
              return (
                <div key={key}>
                  <div className="text-xs font-medium text-[var(--color-text-secondary)] mb-2">{label}</div>
                  <div className="flex gap-2 flex-wrap">
                    {terms.length === 0 ? (
                      <div className="text-xs text-[var(--color-text-tertiary)]">No options</div>
                    ) : (
                      terms.map((t) => {
                        const active = (formData.term_ids || []).includes(t.id)
                        return (
                          <button
                            type="button"
                            key={t.id}
                            onClick={() => toggleTerm(t.id)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-shadow border ${
                              active 
                                ? 'bg-[var(--color-interactive-bg)] border-[var(--color-accent-primary)] text-[var(--color-text-primary)] shadow-sm' 
                                : 'bg-[var(--color-bg-tertiary)] border-[var(--color-border-primary)] text-[var(--color-text-primary)]'
                            }`}
                          >
                            {t.name}
                          </button>
                        )
                      })
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Excerpt */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-[var(--color-text-primary)]/80 mb-2">Excerpt</label>
        <textarea
          required
          rows={3}
          value={formData.excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          className="w-full px-4 py-2 bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-primary)] border border-[var(--color-border-primary)] transition-all duration-200 hover:bg-[var(--color-interactive-bg)] focus:bg-[var(--color-bg-secondary)]"
          placeholder="Brief description of the article"
        />
      </div>

      {/* Published */}
      {showPublished && (
        <div className="mb-6">
          <label className="flex items-center text-sm font-medium text-[var(--color-text-primary)] cursor-pointer">
            <input
              type="checkbox"
              checked={formData.published}
              onChange={(e) => setPublished(e.target.checked)}
              className="mr-2 h-4 w-4 text-[var(--color-accent-primary)] bg-[var(--color-bg-secondary)] border-[var(--color-border-primary)] rounded focus:ring-[var(--color-accent-primary)]"
            />
            Published
          </label>
        </div>
      )}

      {/* Featured Image */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-[var(--color-text-primary)]/80 mb-2">Featured Image</label>
        <div className="bg-[var(--color-bg-tertiary)] p-3 rounded-lg border border-[var(--color-border-primary)]">
          <ImageUpload value={formData.featured_image} onChange={setFeatured} placeholder="https://example.com/image.jpg" />
        </div>
      </div>
    </div>
  )
}
