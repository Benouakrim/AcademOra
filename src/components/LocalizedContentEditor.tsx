import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Save,
  X,
  Upload,
  Globe,
  BookOpen,
  Building,
  HelpCircle,
  Megaphone,
  AlertCircle,
  Eye,
  EyeOff,
  Send,
  Clock,
  Tag,
  FileText
} from 'lucide-react'
import { 
  localizedContentAPI, 
  LocalizedContent, 
  LocalizedContentFormData,
  SUPPORTED_LANGUAGES, 
  CONTENT_TYPES 
} from '../lib/services/localizedContentService'
import { getCurrentUser } from '../lib/api'

interface LocalizedContentEditorProps {
  content?: LocalizedContent
  onSave: (content: LocalizedContent) => void
  onCancel: () => void
  entityId?: string
}

export default function LocalizedContentEditor({ 
  content, 
  onSave, 
  onCancel,
  entityId
}: LocalizedContentEditorProps) {
  const [formData, setFormData] = useState<LocalizedContentFormData>({
    content_type: 'article',
    entity_id: entityId,
    language_code: 'en',
    title: '',
    content: '',
    summary: '',
    tags: [],
    media_urls: [],
    status: 'draft'
  })
  const [saving, setSaving] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [newTag, setNewTag] = useState('')
  const [newMediaUrl, setNewMediaUrl] = useState('')

  const isEditMode = !!content
  const currentUser = getCurrentUser()
  const isAdmin = currentUser?.role === 'admin'

  useEffect(() => {
    if (content) {
      setFormData({
        content_type: content.content_type,
        entity_id: content.entity_id,
        language_code: content.language_code,
        title: content.title,
        content: content.content,
        summary: content.summary || '',
        tags: content.tags || [],
        media_urls: content.media_urls || [],
        status: content.status
      })
    }
  }, [content])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Content is required'
    }

    if (formData.title.length > 200) {
      newErrors.title = 'Title must be less than 200 characters'
    }

    if (formData.content.length > 5000) {
      newErrors.content = 'Content must be less than 5000 characters'
    }

    if (formData.summary && formData.summary.length > 500) {
      newErrors.summary = 'Summary must be less than 500 characters'
    }

    if (newMediaUrl && !isValidUrl(newMediaUrl)) {
      newErrors.media_url = 'Please enter a valid URL'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const isValidUrl = (string: string) => {
    try {
      new URL(string)
      return true
    } catch (_) {
      return false
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setSaving(true)
    try {
      let savedContent: LocalizedContent

      if (isEditMode && content) {
        savedContent = await localizedContentAPI.updateLocalizedContent(content.id, formData)
      } else {
        savedContent = await localizedContentAPI.createLocalizedContent(formData)
      }

      onSave(savedContent)
    } catch (error: any) {
      setErrors({ submit: error.message || 'Failed to save localized content' })
    } finally {
      setSaving(false)
    }
  }

  const handleSubmitForReview = async () => {
    if (!validateForm()) return

    setSubmitting(true)
    try {
      const reviewData = { ...formData, status: 'pending_review' as const }
      let savedContent: LocalizedContent

      if (isEditMode && content) {
        savedContent = await localizedContentAPI.updateLocalizedContent(content.id, reviewData)
        savedContent = await localizedContentAPI.submitForReview(savedContent.id)
      } else {
        savedContent = await localizedContentAPI.createLocalizedContent(reviewData)
        savedContent = await localizedContentAPI.submitForReview(savedContent.id)
      }

      onSave(savedContent)
    } catch (error: any) {
      setErrors({ submit: error.message || 'Failed to submit for review' })
    } finally {
      setSubmitting(false)
    }
  }

  const handleInputChange = (field: keyof LocalizedContentFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const addTag = () => {
    if (newTag.trim() && !formData.tags?.includes(newTag.trim())) {
      handleInputChange('tags', [...(formData.tags || []), newTag.trim()])
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    handleInputChange('tags', formData.tags?.filter(tag => tag !== tagToRemove) || [])
  }

  const addMediaUrl = () => {
    if (newMediaUrl.trim() && isValidUrl(newMediaUrl.trim())) {
      handleInputChange('media_urls', [...(formData.media_urls || []), newMediaUrl.trim()])
      setNewMediaUrl('')
    }
  }

  const removeMediaUrl = (urlToRemove: string) => {
    handleInputChange('media_urls', formData.media_urls?.filter(url => url !== urlToRemove) || [])
  }

  const getContentIcon = (contentType: string) => {
    switch (contentType) {
      case 'article': return <BookOpen className="w-5 h-5 text-blue-400" />
      case 'university_info': return <Building className="w-5 h-5 text-purple-400" />
      case 'guide': return <BookOpen className="w-5 h-5 text-green-400" />
      case 'faq': return <HelpCircle className="w-5 h-5 text-orange-400" />
      case 'announcement': return <Megaphone className="w-5 h-5 text-red-400" />
      default: return <FileText className="w-5 h-5 text-gray-400" />
    }
  }

  const getLanguageInfo = (code: string) => {
    return SUPPORTED_LANGUAGES.find(l => l.code === code) || SUPPORTED_LANGUAGES[0]
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ y: 20 }}
        animate={{ y: 0 }}
        className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700/50 w-full max-w-4xl max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-700/50">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white flex items-center gap-3">
              {getContentIcon(formData.content_type)}
              {getLanguageInfo(formData.language_code).flag}
              {isEditMode ? 'Edit Localized Content' : 'Create Localized Content'}
            </h3>
            <div className="flex items-center gap-2">
              <motion.button
                onClick={() => setShowPreview(!showPreview)}
                className={`p-2 rounded-lg transition-all ${
                  showPreview 
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' 
                    : 'bg-gray-700/50 text-gray-400 hover:bg-gray-600/50'
                }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {showPreview ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </motion.button>
              <motion.button
                onClick={onCancel}
                className="p-2 bg-gray-700/50 text-gray-400 rounded-lg hover:bg-gray-600/50 transition-all"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <AnimatePresence mode="wait">
            {showPreview ? (
              <motion.div
                key="preview"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="bg-gray-800/50 rounded-xl p-5 border border-gray-700/50">
                  <div className="flex items-center gap-3 mb-3">
                    {getContentIcon(formData.content_type)}
                    <div>
                      <h4 className="font-semibold text-white">
                        {formData.title || 'Untitled Content'}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-400">
                          {getLanguageInfo(formData.language_code).flag} {getLanguageInfo(formData.language_code).name}
                        </span>
                        <span className="text-xs text-gray-400">
                          {CONTENT_TYPES.find(t => t.value === formData.content_type)?.icon} {CONTENT_TYPES.find(t => t.value === formData.content_type)?.label}
                        </span>
                        <span className="text-xs px-2 py-1 rounded-full bg-gray-500/20 text-gray-300 border border-gray-500/30">
                          {formData.status === 'draft' ? 'Draft' : formData.status === 'pending_review' ? 'Pending Review' : 'Published'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {formData.summary && (
                    <p className="text-gray-300 text-sm mb-3 italic">{formData.summary}</p>
                  )}
                  
                  <p className="text-gray-300 leading-relaxed mb-4 whitespace-pre-wrap">
                    {formData.content || 'No content provided...'}
                  </p>

                  {formData.tags && formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {formData.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="text-xs px-2 py-1 bg-blue-500/20 text-blue-300 rounded-full border border-blue-500/30"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {formData.media_urls && formData.media_urls.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm text-gray-400 font-medium">Media:</p>
                      {formData.media_urls.map((url, index) => (
                        <a
                          key={index}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-400 hover:text-blue-300 block"
                        >
                          {url}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleSubmit}
                className="space-y-6"
              >
                {/* Language and Content Type */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Language
                    </label>
                    <select
                      value={formData.language_code}
                      onChange={(e) => handleInputChange('language_code', e.target.value)}
                      className="w-full p-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white focus:border-blue-500/50 focus:outline-none transition-all"
                    >
                      {SUPPORTED_LANGUAGES.map(lang => (
                        <option key={lang.code} value={lang.code}>
                          {lang.flag} {lang.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Content Type
                    </label>
                    <select
                      value={formData.content_type}
                      onChange={(e) => handleInputChange('content_type', e.target.value)}
                      className="w-full p-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white focus:border-blue-500/50 focus:outline-none transition-all"
                    >
                      {CONTENT_TYPES.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.icon} {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter content title..."
                    className={`w-full p-3 bg-gray-800/50 border rounded-xl text-white placeholder-gray-500 focus:border-blue-500/50 focus:outline-none transition-all ${
                      errors.title ? 'border-red-500/50' : 'border-gray-700/50'
                    }`}
                    maxLength={200}
                  />
                  {errors.title && (
                    <p className="text-red-400 text-sm mt-1">{errors.title}</p>
                  )}
                  <div className="text-xs text-gray-500 mt-1">
                    {formData.title.length}/200 characters
                  </div>
                </div>

                {/* Summary */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Summary (optional)
                  </label>
                  <textarea
                    value={formData.summary}
                    onChange={(e) => handleInputChange('summary', e.target.value)}
                    placeholder="Brief summary of the content..."
                    rows={2}
                    className={`w-full p-3 bg-gray-800/50 border rounded-xl text-white placeholder-gray-500 focus:border-blue-500/50 focus:outline-none transition-all resize-none ${
                      errors.summary ? 'border-red-500/50' : 'border-gray-700/50'
                    }`}
                    maxLength={500}
                  />
                  {errors.summary && (
                    <p className="text-red-400 text-sm mt-1">{errors.summary}</p>
                  )}
                  <div className="text-xs text-gray-500 mt-1">
                    {formData.summary.length}/500 characters
                  </div>
                </div>

                {/* Content */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Content
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => handleInputChange('content', e.target.value)}
                    placeholder="Write your localized content..."
                    rows={8}
                    className={`w-full p-3 bg-gray-800/50 border rounded-xl text-white placeholder-gray-500 focus:border-blue-500/50 focus:outline-none transition-all resize-none ${
                      errors.content ? 'border-red-500/50' : 'border-gray-700/50'
                    }`}
                    maxLength={5000}
                  />
                  {errors.content && (
                    <p className="text-red-400 text-sm mt-1">{errors.content}</p>
                  )}
                  <div className="text-xs text-gray-500 mt-1">
                    {formData.content.length}/5000 characters
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tags
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      placeholder="Add a tag..."
                      className="flex-1 p-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:border-blue-500/50 focus:outline-none transition-all"
                    />
                    <motion.button
                      type="button"
                      onClick={addTag}
                      className="p-3 bg-blue-500/20 text-blue-300 rounded-xl hover:bg-blue-500/30 transition-all"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                  <Tag className="w-4 h-4" />
                </motion.button>
              </div>
              {formData.tags && formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="flex items-center gap-1 text-xs px-2 py-1 bg-blue-500/20 text-blue-300 rounded-full border border-blue-500/30"
                    >
                      #{tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="hover:text-blue-100"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Media URLs */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Media URLs
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="url"
                  value={newMediaUrl}
                  onChange={(e) => setNewMediaUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className={`flex-1 p-3 bg-gray-800/50 border rounded-xl text-white placeholder-gray-500 focus:border-blue-500/50 focus:outline-none transition-all ${
                    errors.media_url ? 'border-red-500/50' : 'border-gray-700/50'
                  }`}
                />
                <motion.button
                  type="button"
                  onClick={addMediaUrl}
                  className="p-3 bg-blue-500/20 text-blue-300 rounded-xl hover:bg-blue-500/30 transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Upload className="w-4 h-4" />
                </motion.button>
              </div>
              {errors.media_url && (
                <p className="text-red-400 text-sm mt-1">{errors.media_url}</p>
              )}
              {formData.media_urls && formData.media_urls.length > 0 && (
                <div className="space-y-2">
                  {formData.media_urls.map((url, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-gray-800/50 rounded-lg border border-gray-700/50"
                    >
                      <span className="text-sm text-gray-300 truncate flex-1">{url}</span>
                      <button
                        type="button"
                        onClick={() => removeMediaUrl(url)}
                        className="ml-2 text-red-400 hover:text-red-300"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full p-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white focus:border-blue-500/50 focus:outline-none transition-all"
              >
                <option value="draft">Draft</option>
                {isAdmin && <option value="published">Published</option>}
                <option value="pending_review">Pending Review</option>
              </select>
            </div>

            {/* Error Message */}
            {errors.submit && (
              <div className="bg-red-900/20 border border-red-500/30 text-red-300 px-4 py-3 rounded-xl">
                {errors.submit}
              </div>
            )}
          </motion.form>
        )}
      </AnimatePresence>
    </div>

    {/* Footer */}
    {!showPreview && (
      <div className="p-6 border-t border-gray-700/50">
        <div className="flex gap-3">
          <motion.button
            onClick={onCancel}
            disabled={saving || submitting}
            className="flex-1 px-4 py-3 bg-gray-700/50 text-gray-300 rounded-xl font-medium hover:bg-gray-600/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            whileHover={!saving && !submitting ? { scale: 1.02 } : {}}
            whileTap={!saving && !submitting ? { scale: 0.98 } : {}}
          >
            Cancel
          </motion.button>

          {!isAdmin && formData.status !== 'published' && (
            <motion.button
              onClick={handleSubmitForReview}
              disabled={submitting || saving}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-orange-600 to-yellow-600 text-white rounded-xl font-medium hover:from-orange-500 hover:to-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              whileHover={!submitting && !saving ? { scale: 1.02 } : {}}
              whileTap={!submitting && !saving ? { scale: 0.98 } : {}}
            >
              {submitting ? (
                <motion.div
                  className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
              ) : (
                <Send className="w-4 h-4" />
              )}
              {submitting ? 'Submitting...' : 'Submit for Review'}
            </motion.button>
          )}

          <motion.button
            onClick={handleSubmit}
            disabled={saving || submitting}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:from-blue-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            whileHover={!saving && !submitting ? { scale: 1.02 } : {}}
            whileTap={!saving && !submitting ? { scale: 0.98 } : {}}
          >
            {saving ? (
              <motion.div
                className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saving ? 'Saving...' : (isEditMode ? 'Update' : 'Create')}
          </motion.button>
        </div>
      </div>
    )}
  </motion.div>
</motion.div>
)}
