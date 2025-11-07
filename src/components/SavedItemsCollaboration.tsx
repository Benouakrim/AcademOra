import { useState, useEffect } from 'react'
import { 
  Share2, Eye, Copy, CheckCircle, Users, Calendar, 
  FileText, Lock, Unlock, Plus, X, BookOpen
} from 'lucide-react'

interface SavedItem {
  id: string
  type: 'university' | 'article' | 'resource'
  title: string
  description?: string
  url?: string
  image_url?: string
  saved_at: string
  metadata?: {
    location?: string
    major?: string
    tuition?: number
    author?: string
    read_time?: number
  }
}

interface SharedList {
  id: string
  token: string
  title: string
  description?: string
  items: SavedItem[]
  created_by: string
  created_at: string
  expires_at?: string
  view_count: number
  is_public: boolean
  allow_comments: boolean
  password?: string
}

interface SavedItemsCollaborationProps {
  userId?: string
  savedItems?: SavedItem[]
}

export default function SavedItemsCollaboration({ userId, savedItems = [] }: SavedItemsCollaborationProps) {
  const [sharedLists, setSharedLists] = useState<SharedList[]>([])
  const [, setShowShareModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [newList, setNewList] = useState({
    title: '',
    description: '',
    is_public: false,
    allow_comments: true,
    expires_in_days: '30'
  })
  const [copiedToken, setCopiedToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Mock data for demonstration
  const mockSavedItems: SavedItem[] = [
    {
      id: '1',
      type: 'university',
      title: 'Stanford University',
      description: 'Private research university in Stanford, California',
      url: '/universities/stanford',
      image_url: '/stanford.jpg',
      saved_at: '2024-01-15',
      metadata: {
        location: 'Stanford, CA',
        major: 'Computer Science',
        tuition: 56169
      }
    },
    {
      id: '2',
      type: 'article',
      title: 'Complete Guide to US College Applications',
      description: 'Step-by-step process for applying to US universities',
      url: '/articles/college-app-guide',
      image_url: '/article1.jpg',
      saved_at: '2024-01-14',
      metadata: {
        author: 'Sarah Chen',
        read_time: 8
      }
    },
    {
      id: '3',
      type: 'university',
      title: 'MIT',
      description: 'Private research university in Cambridge, Massachusetts',
      url: '/universities/mit',
      image_url: '/mit.jpg',
      saved_at: '2024-01-13',
      metadata: {
        location: 'Cambridge, MA',
        major: 'Engineering',
        tuition: 57720
      }
    }
  ]

  const mockSharedLists: SharedList[] = [
    {
      id: '1',
      token: 'abc123def',
      title: 'My Top University Choices',
      description: 'Universities I am considering for Fall 2024',
      items: mockSavedItems.filter(item => item.type === 'university'),
      created_by: 'John Doe',
      created_at: '2024-01-10',
      expires_at: '2024-02-10',
      view_count: 15,
      is_public: true,
      allow_comments: true
    },
    {
      id: '2',
      token: 'xyz789uvw',
      title: 'Application Resources',
      description: 'Helpful articles and resources for college applications',
      items: mockSavedItems.filter(item => item.type === 'article'),
      created_by: 'Jane Smith',
      created_at: '2024-01-08',
      view_count: 8,
      is_public: false,
      allow_comments: false
    }
  ]

  useEffect(() => {
    // Load shared lists
    setSharedLists(mockSharedLists)
  }, [])

  const generateShareToken = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
    let token = ''
    for (let i = 0; i < 9; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return token
  }

  const createSharedList = async () => {
    if (selectedItems.length === 0 || !newList.title) return

    setLoading(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))

    const token = generateShareToken()
    const itemsToShare = mockSavedItems.filter((item: SavedItem) => selectedItems.includes(item.id))
    
    const sharedList: SharedList = {
      id: Date.now().toString(),
      token,
      title: newList.title,
      description: newList.description,
      items: itemsToShare,
      created_by: 'Current User',
      created_at: new Date().toISOString().split('T')[0],
      expires_at: newList.expires_in_days !== 'never' 
        ? new Date(Date.now() + parseInt(newList.expires_in_days) * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        : undefined,
      view_count: 0,
      is_public: newList.is_public,
      allow_comments: newList.allow_comments
    }

    setSharedLists([sharedList, ...sharedLists])
    setNewList({ title: '', description: '', is_public: false, allow_comments: true, expires_in_days: '30' })
    setSelectedItems([])
    setShowCreateModal(false)
    setLoading(false)
  }

  const copyShareLink = (token: string) => {
    const shareUrl = `${window.location.origin}/shared/${token}`
    navigator.clipboard.writeText(shareUrl)
    setCopiedToken(token)
    setTimeout(() => setCopiedToken(null), 3000)
  }

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'university':
        return <FileText className="h-4 w-4" />
      case 'article':
        return <FileText className="h-4 w-4" />
      case 'resource':
        return <FileText className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getItemTypeLabel = (type: string) => {
    switch (type) {
      case 'university':
        return 'University'
      case 'article':
        return 'Article'
      case 'resource':
        return 'Resource'
      default:
        return 'Item'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-teal-600 p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Share2 className="h-6 w-6" />
            <div>
              <h3 className="text-lg font-bold">Saved Items Collaboration</h3>
              <p className="text-green-100 text-sm">Share your research with counselors, family, and friends</p>
            </div>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Create Shared List
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <BookOpen className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-700">{mockSavedItems.length}</div>
                <div className="text-blue-600 text-sm">Saved Items</div>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4 border border-green-100">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <Users className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-green-700">{sharedLists.length}</div>
                <div className="text-green-600 text-sm">Shared Lists</div>
              </div>
            </div>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 p-2 rounded-lg">
                <Eye className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-700">
                  {sharedLists.reduce((sum: number, list: SharedList) => sum + list.view_count, 0)}
                </div>
                <div className="text-purple-600 text-sm">Total Views</div>
              </div>
            </div>
          </div>
        </div>

        {/* Shared Lists */}
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900 mb-4">Your Shared Lists</h4>
          
          {sharedLists.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Share2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No shared lists yet. Create your first shared list to collaborate with others!</p>
            </div>
          ) : (
            sharedLists.map((list: SharedList) => (
              <div key={list.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h5 className="font-semibold text-gray-900">{list.title}</h5>
                      {list.is_public ? (
                        <Unlock className="h-4 w-4 text-green-600" />
                      ) : (
                        <Lock className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                    {list.description && (
                      <p className="text-sm text-gray-600 mb-2">{list.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Created {list.created_at}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {list.view_count} views
                      </span>
                      <span className="flex items-center gap-1">
                        <BookOpen className="h-3 w-3" />
                        {list.items.length} items
                      </span>
                      {list.expires_at && (
                        <span>Expires {list.expires_at}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => copyShareLink(list.token)}
                      className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Copy share link"
                    >
                      {copiedToken === list.token ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      onClick={() => setShowShareModal(true)}
                      className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Share options"
                    >
                      <Share2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Items Preview */}
                <div className="border-t border-gray-100 pt-3">
                  <div className="flex flex-wrap gap-2">
                    {list.items.slice(0, 3).map((item) => (
                      <div key={item.id} className="flex items-center gap-1 px-2 py-1 bg-gray-50 rounded text-xs text-gray-600">
                        {getItemIcon(item.type)}
                        <span>{item.title}</span>
                      </div>
                    ))}
                    {list.items.length > 3 && (
                      <span className="px-2 py-1 bg-gray-50 rounded text-xs text-gray-600">
                        +{list.items.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Share Link */}
                <div className="mt-3 p-2 bg-gray-50 rounded-lg flex items-center justify-between">
                  <code className="text-xs text-gray-600 font-mono">
                    {window.location.origin}/shared/{list.token}
                  </code>
                  <button
                    onClick={() => copyShareLink(list.token)}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                  >
                    {copiedToken === list.token ? 'Copied!' : 'Copy Link'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Create Shared List Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Create Shared List</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* List Details */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    List Title *
                  </label>
                  <input
                    type="text"
                    value={newList.title}
                    onChange={(e) => setNewList({ ...newList, title: e.target.value })}
                    placeholder="e.g., My Top University Choices"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={newList.description}
                    onChange={(e) => setNewList({ ...newList, description: e.target.value })}
                    placeholder="Optional description for your shared list"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Item Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Items to Share *
                </label>
                <div className="space-y-2 max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-3">
                  {mockSavedItems.map((item) => (
                    <label key={item.id} className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedItems([...selectedItems, item.id])
                          } else {
                            setSelectedItems(selectedItems.filter(id => id !== item.id))
                          }
                        }}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {getItemIcon(item.type)}
                          <span className="font-medium text-gray-900">{item.title}</span>
                          <span className="text-xs text-gray-500">({getItemTypeLabel(item.type)})</span>
                        </div>
                        {item.description && (
                          <p className="text-sm text-gray-600">{item.description}</p>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Settings */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Privacy Settings
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={newList.is_public}
                        onChange={(e) => setNewList({ ...newList, is_public: e.target.checked })}
                        className="rounded"
                      />
                      <span className="text-sm text-gray-700">Public (anyone with link can view)</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={newList.allow_comments}
                        onChange={(e) => setNewList({ ...newList, allow_comments: e.target.checked })}
                        className="rounded"
                      />
                      <span className="text-sm text-gray-700">Allow comments</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expires In
                  </label>
                  <select
                    value={newList.expires_in_days}
                    onChange={(e) => setNewList({ ...newList, expires_in_days: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="7">7 days</option>
                    <option value="30">30 days</option>
                    <option value="90">90 days</option>
                    <option value="never">Never</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createSharedList}
                disabled={!newList.title || selectedItems.length === 0 || loading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                {loading ? 'Creating...' : 'Create Shared List'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
