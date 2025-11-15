import ImageUpload from '../ImageUpload'
import { ChevronDown, ChevronUp } from 'lucide-react'
import type { EditorFormData } from '../../hooks/useArticleEditor'

interface SEOSidebarProps {
  open: boolean
  setOpen: (v: boolean) => void
  formData: {
    focus_keyword: string
    meta_title: string
    meta_description: string
    meta_keywords: string
    og_image: string
    canonical_url: string
  }
  setValue: (name: keyof EditorFormData, value: string) => void
}

export default function SEOSidebar({ open, setOpen, formData, setValue }: SEOSidebarProps) {
  return (
    <div className="p-6 animate-fadeIn text-[var(--color-text-primary)]">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full text-lg font-semibold text-[var(--color-text-primary)] mb-6 hover:text-[var(--color-accent-primary)] transition-all duration-200 p-2 hover:bg-[var(--color-interactive-bg)] rounded-lg group"
      >
        <span>SEO Settings</span>
        {open ? <ChevronUp className="h-5 w-5 group-hover:scale-110 transition-transform" /> : <ChevronDown className="h-5 w-5 group-hover:scale-110 transition-transform" />}
      </button>

      {open && (
        <div className="space-y-4 animate-slideDown">
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-primary)]/80 mb-2">Focus Keyword</label>
            <input
              type="text"
              value={formData.focus_keyword}
              onChange={(e) => setValue('focus_keyword', e.target.value)}
              className="w-full px-4 py-2 bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-primary)] border border-[var(--color-border-primary)] transition-all duration-200 hover:bg-[var(--color-interactive-bg)] focus:bg-[var(--color-bg-secondary)]"
              placeholder="Main keyword"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-text-primary)]/80 mb-2">Meta Title ({formData.meta_title.length}/60)</label>
            <input
              type="text"
              value={formData.meta_title}
              onChange={(e) => setValue('meta_title', e.target.value)}
              maxLength={60}
              className="w-full px-4 py-2 bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-primary)] border border-[var(--color-border-primary)] transition-all duration-200 hover:bg-[var(--color-interactive-bg)] focus:bg-[var(--color-bg-secondary)]"
              placeholder="SEO title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-text-primary)]/80 mb-2">Meta Description ({formData.meta_description.length}/160)</label>
            <textarea
              rows={3}
              value={formData.meta_description}
              onChange={(e) => setValue('meta_description', e.target.value)}
              maxLength={160}
              className="w-full px-4 py-2 bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-primary)] border border-[var(--color-border-primary)] transition-all duration-200 hover:bg-[var(--color-interactive-bg)] focus:bg-[var(--color-bg-secondary)]"
              placeholder="SEO description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-text-primary)]/80 mb-2">Meta Keywords</label>
            <input
              type="text"
              value={formData.meta_keywords}
              onChange={(e) => setValue('meta_keywords', e.target.value)}
              className="w-full px-4 py-2 bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-primary)] border border-[var(--color-border-primary)] transition-all duration-200 hover:bg-[var(--color-interactive-bg)] focus:bg-[var(--color-bg-secondary)]"
              placeholder="keyword1, keyword2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-text-primary)]/80 mb-2">OG Image</label>
            <div className="bg-[var(--color-bg-tertiary)] p-3 rounded-lg border border-[var(--color-border-primary)]">
              <ImageUpload value={formData.og_image} onChange={(url) => setValue('og_image', url)} placeholder="https://example.com/og.jpg" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-text-primary)]/80 mb-2">Canonical URL</label>
            <input
              type="url"
              value={formData.canonical_url}
              onChange={(e) => setValue('canonical_url', e.target.value)}
              className="w-full px-4 py-2 bg-[var(--color-bg-tertiary)] text-[var(--color-text-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-primary)] border border-[var(--color-border-primary)] transition-all duration-200 hover:bg-[var(--color-interactive-bg)] focus:bg-[var(--color-bg-secondary)]"
              placeholder="https://yoursite.com/article"
            />
          </div>
        </div>
      )}
    </div>
  )
}
