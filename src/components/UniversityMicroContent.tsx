import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Calendar,
  Video,
  Megaphone,
  RefreshCw,
  Clock,
  ExternalLink,
  Plus,
  Edit,
  Trash2,
  AlertCircle
} from 'lucide-react'
import { microContentAPI, MicroContent, CONTENT_TYPES, PRIORITY_LEVELS } from '../lib/services/microContentService'

interface UniversityMicroContentProps {
  universityId: string
  isOwner?: boolean
  onEdit?: (content: MicroContent) => void
  onCreateNew?: () => void
}

export default function UniversityMicroContent({ 
  universityId, 
  isOwner = false, 
  onEdit,
  onCreateNew 
}: UniversityMicroContentProps) {
  const [microContent, setMicroContent] = useState<MicroContent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => {
    fetchMicroContent()
  }, [universityId])

  const fetchMicroContent = async () => {
    try {
      setLoading(true)
      const content = await microContentAPI.getMicroContent(universityId)
      // Filter only published content for non-owners
      const filteredContent = isOwner 
        ? content 
        : content.filter((item: MicroContent) => item.status === 'published' && (!item.expiry_date || new Date(item.expiry_date) > new Date()))
      
      // Sort by priority and creation date
      const sortedContent = filteredContent.sort((a: MicroContent, b: MicroContent) => {
        if (a.priority !== b.priority) return b.priority - a.priority
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      })
      
      setMicroContent(sortedContent)
    } catch (err: any) {
      setError(err.message || 'Failed to load micro-content')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this micro-content?')) return
    
    try {
      await microContentAPI.deleteMicroContent(id)
      setMicroContent(prev => prev.filter(item => item.id !== id))
    } catch (err: any) {
      setError(err.message || 'Failed to delete micro-content')
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

  const getPriorityBadge = (priority: number) => {
    const colors = {
      1: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
      2: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      3: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
      4: 'bg-red-500/20 text-red-300 border-red-500/30',
    }
    return colors[priority as keyof typeof colors] || colors[1]
  }

  const filteredContent = filter === 'all' 
    ? microContent 
    : microContent.filter(item => item.content_type === filter)

  const contentTypeOptions = [
    { value: 'all', label: 'All Content' },
    ...CONTENT_TYPES
  ]

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
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500/20 to-blue-500/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-purple-500/30">
              <Megaphone className="w-5 h-5 text-purple-400" />
            </div>
            University Updates
          </h3>
          
          {isOwner && (
            <motion.button
              onClick={onCreateNew}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:from-purple-500 hover:to-pink-500 transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Plus className="w-4 h-4" />
              Add Update
            </motion.button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2">
          {contentTypeOptions.map(type => (
            <motion.button
              key={type.value}
              onClick={() => setFilter(type.value)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                filter === type.value
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  : 'bg-gray-700/50 text-gray-400 border border-gray-600/50 hover:bg-gray-600/50'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {type.value !== 'all' && getContentIcon(type.value)}
              <span>{type.label}</span>
              {type.value !== 'all' && (
                <span className="text-xs bg-gray-700/50 px-2 py-1 rounded-full">
                  {microContent.filter(item => item.content_type === type.value).length}
                </span>
              )}
            </motion.button>
          ))}
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
                <Megaphone className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-gray-300 mb-2">
                  {filter === 'all' ? 'No updates yet' : `No ${filter} updates`}
                </h4>
                <p className="text-gray-500">
                  {isOwner 
                    ? 'Start sharing updates with prospective students!'
                    : 'Check back later for updates from this university.'
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
              {filteredContent.map((content, index) => (
                <motion.div
                  key={content.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`bg-gray-800/50 rounded-xl p-5 border transition-all hover:border-purple-500/30 ${
                    content.status === 'draft' ? 'border-yellow-500/30 opacity-75' : 'border-gray-700/50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getContentIcon(content.content_type)}
                      <div>
                        <h4 className="font-semibold text-white">{content.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-xs px-2 py-1 rounded-full border ${getPriorityBadge(content.priority)}`}>
                            {PRIORITY_LEVELS.find(p => p.value === content.priority)?.label} Priority
                          </span>
                          {content.status === 'draft' && (
                            <span className="text-xs px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
                              Draft
                            </span>
                          )}
                          {content.expiry_date && (
                            <div className="flex items-center gap-1 text-xs text-gray-400">
                              <Clock className="w-3 h-3" />
                              Expires {new Date(content.expiry_date).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {isOwner && (
                      <div className="flex items-center gap-2">
                        <motion.button
                          onClick={() => onEdit?.(content)}
                          className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-all"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Edit className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          onClick={() => handleDelete(content.id)}
                          className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-all"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      </div>
                    )}
                  </div>

                  <p className="text-gray-300 leading-relaxed mb-4">{content.content}</p>

                  {content.media_url && (
                    <div className="mb-4">
                      {content.media_url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                        <img 
                          src={content.media_url} 
                          alt={content.title}
                          className="w-full rounded-lg border border-gray-700/50"
                        />
                      ) : content.media_url.match(/\.(mp4|webm|ogg)$/i) ? (
                        <video 
                          controls
                          className="w-full rounded-lg border border-gray-700/50"
                        >
                          <source src={content.media_url} />
                        </video>
                      ) : (
                        <a 
                          href={content.media_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                          View Media
                        </a>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>
                      {CONTENT_TYPES.find(t => t.value === content.content_type)?.label}
                    </span>
                    <span>
                      Posted {new Date(content.created_at).toLocaleDateString()}
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
