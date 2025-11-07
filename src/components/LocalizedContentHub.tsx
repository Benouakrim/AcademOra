import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import {
  Globe,
  BookOpen,
  Building,
  HelpCircle,
  Megaphone,
  Search,
  Plus,
  Edit,
  Trash2,
  Clock,
  CheckCircle,
  AlertCircle,
  Languages
} from 'lucide-react'
import { 
  localizedContentAPI, 
  LocalizedContent, 
  SUPPORTED_LANGUAGES, 
  CONTENT_TYPES,
  getStatusColor,
  getStatusLabel
} from '../lib/services/localizedContentService'
import { getCurrentUser } from '../lib/api'

interface LocalizedContentHubProps {
  contentType?: string
  entityId?: string
  showCreateButton?: boolean
  onCreateNew?: () => void
  onEdit?: (content: LocalizedContent) => void
}

export default function LocalizedContentHub({ 
  contentType = 'all',
  entityId,
  showCreateButton = false,
  onCreateNew,
  onEdit
}: LocalizedContentHubProps) {
  const { i18n } = useTranslation()
  const [content, setContent] = useState<LocalizedContent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language || 'en')
  const [selectedContentType, setSelectedContentType] = useState(contentType)
  const [searchQuery, setSearchQuery] = useState('')
  const [showOnlyPublished, setShowOnlyPublished] = useState(false)

  const currentUser = getCurrentUser()
  const isAdmin = currentUser?.role === 'admin'

  useEffect(() => {
    fetchLocalizedContent()
  }, [selectedLanguage, selectedContentType, entityId])

  const fetchLocalizedContent = async () => {
    try {
      setLoading(true)
      let data: LocalizedContent[] = []
      
      // Temporary mock data (will be replaced with real Supabase integration)
      const mockData: LocalizedContent[] = [
        {
          id: '1',
          content_type: 'article',
          language_code: 'en',
          title: 'Getting Started with University Applications',
          content: 'This comprehensive guide will help you navigate the university application process.',
          entity_id: undefined,
          status: 'published',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          created_by: 'admin',
          tags: ['education', 'application', 'guide']
        },
        {
          id: '2',
          content_type: 'university_info',
          language_code: 'en',
          title: 'Harvard University Overview',
          content: 'Harvard University is one of the most prestigious institutions in the world.',
          entity_id: undefined,
          status: 'published',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          created_by: 'admin',
          tags: ['harvard', 'ivy-league', 'prestigious']
        },
        {
          id: '3',
          content_type: 'guide',
          language_code: 'en',
          title: 'How to Write a Personal Statement',
          content: 'Learn the art of crafting compelling personal statements that showcase your unique qualities.',
          entity_id: undefined,
          status: 'published',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          created_by: 'admin',
          tags: ['writing', 'personal-statement', 'admissions']
        }
      ]
      
      if (selectedContentType === 'all') {
        data = mockData
      } else {
        data = mockData.filter(item => item.content_type === selectedContentType)
      }

      // Apply filters
      let filteredData = data
      
      if (searchQuery) {
        filteredData = filteredData.filter(item =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ?? false)
        )
      }

      if (showOnlyPublished && !isAdmin) {
        filteredData = filteredData.filter(item => item.status === 'published')
      }

      // Sort by creation date (newest first)
      filteredData.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

      setContent(filteredData)
    } catch (err: any) {
      setError(err.message || 'Failed to load localized content')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this localized content?')) return
    
    try {
      await localizedContentAPI.deleteLocalizedContent(id)
      setContent(prev => prev.filter(item => item.id !== id))
    } catch (err: any) {
      setError(err.message || 'Failed to delete content')
    }
  }

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'article': return <BookOpen className="w-5 h-5 text-blue-400" />
      case 'university_info': return <Building className="w-5 h-5 text-purple-400" />
      case 'guide': return <BookOpen className="w-5 h-5 text-green-400" />
      case 'faq': return <HelpCircle className="w-5 h-5 text-orange-400" />
      case 'announcement': return <Megaphone className="w-5 h-5 text-red-400" />
      default: return <Globe className="w-5 h-5 text-gray-400" />
    }
  }

  const getTypeInfo = (type: string) => {
    return CONTENT_TYPES.find(t => t.value === type) || CONTENT_TYPES[0]
  }

  const getLanguageInfo = (code: string) => {
    return SUPPORTED_LANGUAGES.find(l => l.code === code) || SUPPORTED_LANGUAGES[0]
  }

  const filteredContent = content

  if (loading) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50">
        <div className="flex justify-center items-center py-12">
          <motion.div
            className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-400 rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50">
        <div className="text-center py-12">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <p className="text-red-300">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-700/50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-blue-500/30">
              <Languages className="w-5 h-5 text-blue-400" />
            </div>
            {getLanguageInfo(selectedLanguage).flag} Content Hub
          </h3>
          
          {showCreateButton && isAdmin && (
            <motion.button
              onClick={onCreateNew}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:from-blue-500 hover:to-purple-500 transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Plus className="w-4 h-4" />
              Add Content
            </motion.button>
          )}
        </div>

        {/* Filters */}
        <div className="space-y-4">
          {/* Language and Content Type */}
          <div className="flex flex-wrap gap-3">
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:border-blue-500/50 focus:outline-none transition-all"
            >
              {SUPPORTED_LANGUAGES.map(lang => (
                <option key={lang.code} value={lang.code}>
                  {lang.flag} {lang.name}
                </option>
              ))}
            </select>

            <select
              value={selectedContentType}
              onChange={(e) => setSelectedContentType(e.target.value)}
              className="px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:border-blue-500/50 focus:outline-none transition-all"
            >
              <option value="all">All Content Types</option>
              {CONTENT_TYPES.map(type => (
                <option key={type.value} value={type.value}>
                  {type.icon} {type.label}
                </option>
              ))}
            </select>

            {!isAdmin && (
              <motion.button
                onClick={() => setShowOnlyPublished(!showOnlyPublished)}
                className={`px-4 py-2 rounded-xl font-medium transition-all ${
                  showOnlyPublished
                    ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                    : 'bg-gray-700/50 text-gray-400 border border-gray-600/50'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <CheckCircle className="w-4 h-4 inline mr-1" />
                Published Only
              </motion.button>
            )}
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search content..."
              className="w-full pl-10 pr-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-500 focus:border-blue-500/50 focus:outline-none transition-all"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          {filteredContent.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center py-12"
            >
              <div className="bg-gray-800/50 rounded-2xl p-8 border border-gray-700/50">
                <Languages className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-gray-300 mb-2">
                  No localized content found
                </h4>
                <p className="text-gray-500">
                  {searchQuery 
                    ? 'Try adjusting your search terms.'
                    : `No ${selectedContentType === 'all' ? 'content' : selectedContentType} available in ${getLanguageInfo(selectedLanguage).name}.`
                  }
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {filteredContent.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`bg-gray-800/50 rounded-xl p-5 border transition-all hover:border-blue-500/30 ${
                    item.status === 'draft' ? 'border-yellow-500/30 opacity-75' : 
                    item.status === 'pending_review' ? 'border-orange-500/30' : 
                    'border-gray-700/50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getContentIcon(item.content_type)}
                      <div>
                        <h4 className="font-semibold text-white">{item.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(item.status)}`}>
                            {getStatusLabel(item.status)}
                          </span>
                          <span className="text-xs text-gray-400">
                            {getLanguageInfo(item.language_code).flag} {getLanguageInfo(item.language_code).name}
                          </span>
                          <span className="text-xs text-gray-400">
                            {getTypeInfo(item.content_type).icon} {getTypeInfo(item.content_type).label}
                          </span>
                        </div>
                      </div>
                    </div>

                    {isAdmin && (
                      <div className="flex items-center gap-2">
                        <motion.button
                          onClick={() => onEdit?.(item)}
                          className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-all"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Edit className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          onClick={() => handleDelete(item.id)}
                          className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-all"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      </div>
                    )}
                  </div>

                  {item.summary && (
                    <p className="text-gray-300 text-sm mb-3 italic">{item.summary}</p>
                  )}

                  <p className="text-gray-300 leading-relaxed mb-4 line-clamp-3">
                    {item.content}
                  </p>

                  {item.tags && item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {item.tags.map((tag, tagIndex) => (
                        <span
                          key={tagIndex}
                          className="text-xs px-2 py-1 bg-blue-500/20 text-blue-300 rounded-full border border-blue-500/30"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Updated {new Date(item.updated_at).toLocaleDateString()}
                    </span>
                    <span>
                      By {item.created_by}
                    </span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
