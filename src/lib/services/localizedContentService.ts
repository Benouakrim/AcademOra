import { localizedContentAPI } from '../api'

export interface LocalizedContent {
  id: string
  content_type: 'article' | 'university_info' | 'guide' | 'faq' | 'announcement'
  entity_id?: string // university_id, article_id, etc.
  language_code: string
  title: string
  content: string
  summary?: string
  tags?: string[]
  media_urls?: string[]
  status: 'published' | 'draft' | 'pending_review'
  created_at: string
  updated_at: string
  created_by: string
  reviewed_by?: string
  reviewed_at?: string
}

export interface LocalizedContentFormData {
  content_type: 'article' | 'university_info' | 'guide' | 'faq' | 'announcement'
  entity_id?: string
  language_code: string
  title: string
  content: string
  summary?: string
  tags?: string[]
  media_urls?: string[]
  status: 'published' | 'draft' | 'pending_review'
}

export interface LanguageStats {
  language_code: string
  total_content: number
  published_content: number
  draft_content: number
  pending_review: number
  last_updated: string
}

export { localizedContentAPI }

export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸', direction: 'ltr' },
  { code: 'fr', name: 'Français', flag: '🇫🇷', direction: 'ltr' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦', direction: 'rtl' },
  { code: 'es', name: 'Español', flag: '🇪🇸', direction: 'ltr' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪', direction: 'ltr' },
  { code: 'zh', name: '中文', flag: '🇨🇳', direction: 'ltr' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳', direction: 'ltr' },
  { code: 'pt', name: 'Português', flag: '🇵🇹', direction: 'ltr' },
] as const

export const CONTENT_TYPES = [
  { 
    value: 'article', 
    label: 'Article', 
    icon: '📝',
    description: 'Blog posts and educational articles',
    color: 'blue'
  },
  { 
    value: 'university_info', 
    label: 'University Information', 
    icon: '🏫',
    description: 'University descriptions and details',
    color: 'purple'
  },
  { 
    value: 'guide', 
    label: 'Guide', 
    icon: '📚',
    description: 'How-to guides and tutorials',
    color: 'green'
  },
  { 
    value: 'faq', 
    label: 'FAQ', 
    icon: '❓',
    description: 'Frequently asked questions',
    color: 'orange'
  },
  { 
    value: 'announcement', 
    label: 'Announcement', 
    icon: '📢',
    description: 'Platform announcements and news',
    color: 'red'
  },
] as const

export const getStatusColor = (status: string) => {
  const colors = {
    published: 'bg-green-500/20 text-green-300 border-green-500/30',
    draft: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
    pending_review: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  }
  return colors[status as keyof typeof colors] || colors.draft
}

export const getStatusLabel = (status: string) => {
  const labels = {
    published: 'Published',
    draft: 'Draft',
    pending_review: 'Pending Review',
  }
  return labels[status as keyof typeof labels] || 'Draft'
}
