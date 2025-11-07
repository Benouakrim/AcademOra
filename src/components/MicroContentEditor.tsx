import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Save,
  X,
  Upload,
  Calendar,
  Video,
  Megaphone,
  RefreshCw,
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react'
import { microContentAPI, MicroContent, MicroContentFormData, CONTENT_TYPES, PRIORITY_LEVELS } from '../lib/services/microContentService'

interface MicroContentEditorProps {
  universityId: string
  content?: MicroContent
  onSave: (content: MicroContent) => void
  onCancel: () => void
}

export default function MicroContentEditor({ 
  universityId, 
  content, 
  onSave, 
  onCancel 
}: MicroContentEditorProps) {
  const [formData, setFormData] = useState<MicroContentFormData>({
    university_id: universityId,
    content_type: 'announcement',
    title: '',
    content: '',
    media_url: '',
    expiry_date: '',
    priority: 2,
    status: 'draft'
  })
  const [saving, setSaving] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const isEditMode = !!content

  useEffect(() => {
    if (content) {
      setFormData({
        university_id: content.university_id,
        content_type: content.content_type,
        title: content.title,
        content: content.content,
        media_url: content.media_url || '',
        expiry_date: content.expiry_date || '',
        priority: content.priority,
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

    if (formData.title.length > 100) {
      newErrors.title = 'Title must be less than 100 characters'
    }

    if (formData.content.length > 1000) {
      newErrors.content = 'Content must be less than 1000 characters'
    }

    if (formData.expiry_date && new Date(formData.expiry_date) <= new Date()) {
      newErrors.expiry_date = 'Expiry date must be in the future'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setSaving(true)
    try {
      let savedContent: MicroContent

      if (isEditMode && content) {
        savedContent = await microContentAPI.updateMicroContent(content.id, formData)
      } else {
        savedContent = await microContentAPI.createMicroContent(formData)
      }

      onSave(savedContent)
    } catch (error: any) {
      setErrors({ submit: error.message || 'Failed to save micro-content' })
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field: keyof MicroContentFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const getContentIcon = (contentType: string) => {
    switch (contentType) {
      case 'event': return <Calendar className="w-5 h-5 text-blue-400" />
      case 'tour': return <Video className="w-5 h-5 text-purple-400" />
      case 'announcement': return <Megaphone className="w-5 h-5 text-orange-400" />
      case 'update': return <RefreshCw className="w-5 h-5 text-green-400" />
      default: return <AlertCircle className="w-5 h-5 text-gray-400" />
    }
  }

  const getPriorityColor = (priority: number) => {
    const colors = {
      1: 'border-gray-500/50 bg-gray-500/10',
      2: 'border-blue-500/50 bg-blue-500/10',
      3: 'border-orange-500/50 bg-orange-500/10',
      4: 'border-red-500/50 bg-red-500/10',
    }
    return colors[priority as keyof typeof colors] || colors[1]
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
        className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700/50 w-full max-w-2xl max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-700/50">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white flex items-center gap-3">
              {getContentIcon(formData.content_type)}
              {isEditMode ? 'Edit Update' : 'Create New Update'}
            </h3>
            <div className="flex items-center gap-2">
              <motion.button
                onClick={() => setShowPreview(!showPreview)}
                className={`p-2 rounded-lg transition-all ${
                  showPreview 
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' 
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
                        {formData.title || 'Untitled Update'}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs px-2 py-1 rounded-full border ${getPriorityColor(formData.priority)}`}>
                          {PRIORITY_LEVELS.find(p => p.value === formData.priority)?.label} Priority
                        </span>
                        {formData.status === 'draft' && (
                          <span className="text-xs px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
                            Draft
                          </span>
                        )}
                        {formData.expiry_date && (
                          <span className="text-xs text-gray-400">
                            Expires {new Date(formData.expiry_date).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-300 leading-relaxed mb-4">
                    {formData.content || 'No content provided...'}
                  </p>
                  {formData.media_url && (
                    <div className="text-sm text-purple-400">
                      Media: {formData.media_url}
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
                {/* Content Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Content Type
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {CONTENT_TYPES.map(type => (
                      <motion.button
                        key={type.value}
                        type="button"
                        onClick={() => handleInputChange('content_type', type.value)}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          formData.content_type === type.value
                            ? 'bg-purple-500/20 border-purple-500/50 text-purple-300'
                            : 'bg-gray-800/50 border-gray-700/50 text-gray-400 hover:border-purple-500/30'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{type.icon}</span>
                          <div className="text-left">
                            <div className="font-medium">{type.label}</div>
                            <div className="text-xs opacity-75">{type.description}</div>
                          </div>
                        </div>
                      </motion.button>
                    ))}
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
                    placeholder="Enter update title..."
                    className={`w-full p-3 bg-gray-800/50 border rounded-xl text-white placeholder-gray-500 focus:border-purple-500/50 focus:outline-none transition-all ${
                      errors.title ? 'border-red-500/50' : 'border-gray-700/50'
                    }`}
                    maxLength={100}
                  />
                  {errors.title && (
                    <p className="text-red-400 text-sm mt-1">{errors.title}</p>
                  )}
                  <div className="text-xs text-gray-500 mt-1">
                    {formData.title.length}/100 characters
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
                    placeholder="Write your update content..."
                    rows={6}
                    className={`w-full p-3 bg-gray-800/50 border rounded-xl text-white placeholder-gray-500 focus:border-purple-500/50 focus:outline-none transition-all resize-none ${
                      errors.content ? 'border-red-500/50' : 'border-gray-700/50'
                    }`}
                    maxLength={1000}
                  />
                  {errors.content && (
                    <p className="text-red-400 text-sm mt-1">{errors.content}</p>
                  )}
                  <div className="text-xs text-gray-500 mt-1">
                    {formData.content.length}/1000 characters
                  </div>
                </div>

                {/* Media URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Media URL (optional)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={formData.media_url}
                      onChange={(e) => handleInputChange('media_url', e.target.value)}
                      placeholder="https://example.com/image.jpg or video.mp4"
                      className="flex-1 p-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:border-purple-500/50 focus:outline-none transition-all"
                    />
                    <motion.button
                      type="button"
                      className="p-3 bg-gray-700/50 text-gray-400 rounded-xl hover:bg-gray-600/50 transition-all"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Upload className="w-4 h-4" />
                    </motion.button>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Supports images, videos, or external links
                  </div>
                </div>

                {/* Priority and Status */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Priority
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) => handleInputChange('priority', parseInt(e.target.value))}
                      className="w-full p-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white focus:border-purple-500/50 focus:outline-none transition-all"
                    >
                      {PRIORITY_LEVELS.map(level => (
                        <option key={level.value} value={level.value}>
                          {level.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => handleInputChange('status', e.target.value)}
                      className="w-full p-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white focus:border-purple-500/50 focus:outline-none transition-all"
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                    </select>
                  </div>
                </div>

                {/* Expiry Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Expiry Date (optional)
                  </label>
                  <input
                    type="date"
                    value={formData.expiry_date}
                    onChange={(e) => handleInputChange('expiry_date', e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className={`w-full p-3 bg-gray-800/50 border rounded-xl text-white focus:border-purple-500/50 focus:outline-none transition-all ${
                      errors.expiry_date ? 'border-red-500/50' : 'border-gray-700/50'
                    }`}
                  />
                  {errors.expiry_date && (
                    <p className="text-red-400 text-sm mt-1">{errors.expiry_date}</p>
                  )}
                  <div className="text-xs text-gray-500 mt-1">
                    Content will be hidden after this date
                  </div>
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
                disabled={saving}
                className="flex-1 px-4 py-3 bg-gray-700/50 text-gray-300 rounded-xl font-medium hover:bg-gray-600/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                whileHover={!saving ? { scale: 1.02 } : {}}
                whileTap={!saving ? { scale: 0.98 } : {}}
              >
                Cancel
              </motion.button>
              <motion.button
                onClick={handleSubmit}
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                whileHover={!saving ? { scale: 1.02 } : {}}
                whileTap={!saving ? { scale: 0.98 } : {}}
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
  )
}
