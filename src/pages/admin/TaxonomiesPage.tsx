import { useEffect, useState } from 'react'
import { adminAPI } from '../../lib/api'
import { Edit2, Trash2, Plus, X, ChevronDown, ChevronRight } from 'lucide-react'

interface Taxonomy {
  id: string
  key: string
  name: string
  description?: string
  sort_order?: number
}

interface Term {
  id: string
  taxonomy_id: string
  name: string
  slug: string
  description?: string
  color?: string
  sort_order?: number
  taxonomy_key?: string
}

interface Category {
  id: string
  name: string
  slug: string
  type: string
  description?: string
  icon?: string
  color?: string
  sort_order?: number
}

export default function TaxonomiesPage() {
  const [taxonomies, setTaxonomies] = useState<Taxonomy[]>([])
  const [terms, setTerms] = useState<Record<string, Term[]>>({})
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [expandedTaxonomies, setExpandedTaxonomies] = useState<Set<string>>(new Set())
  const [expandedCategories, setExpandedCategories] = useState(false)
  const [showTaxonomyModal, setShowTaxonomyModal] = useState(false)
  const [showTermModal, setShowTermModal] = useState(false)
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [editingTaxonomy, setEditingTaxonomy] = useState<Taxonomy | null>(null)
  const [editingTerm, setEditingTerm] = useState<{ term: Term | null; taxonomyId: string } | null>(null)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState<any>({})
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'taxonomies' | 'categories'>('taxonomies')

  useEffect(() => {
    loadAll()
  }, [])

  const loadAll = async () => {
    setLoading(true)
    setError(null)
    try {
      const [taxData, catData] = await Promise.all([
        adminAPI.listTaxonomies().catch(() => []),
        adminAPI.getAllCategories().catch(() => [])
      ])
      
      setTaxonomies(Array.isArray(taxData) ? taxData : [])
      setCategories(Array.isArray(catData) ? catData : [])
      
      // Load terms for each taxonomy
      const termsMap: Record<string, Term[]> = {}
      for (const tax of taxData || []) {
        const termData = await adminAPI.listTerms(tax.key).catch(() => [])
        termsMap[tax.id] = Array.isArray(termData) ? termData : []
      }
      setTerms(termsMap)
    } catch (err: any) {
      setError(err.message || 'Failed to load data')
      console.error('Error loading data:', err)
    } finally {
      setLoading(false)
    }
  }

  const toggleTaxonomy = (id: string) => {
    setExpandedTaxonomies(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleOpenTaxonomyModal = (taxonomy?: Taxonomy) => {
    setEditingTaxonomy(taxonomy || null)
    setFormData(taxonomy ? { key: taxonomy.key, name: taxonomy.name, description: taxonomy.description || '', sort_order: taxonomy.sort_order || 0 } : { key: '', name: '', description: '', sort_order: 0 })
    setError(null)
    setShowTaxonomyModal(true)
  }

  const handleOpenTermModal = (taxonomyId: string, term?: Term) => {
    setEditingTerm(term ? { term, taxonomyId } : { term: null, taxonomyId })
    const taxonomy = taxonomies.find(t => t.id === taxonomyId)
    setFormData(term ? { name: term.name, slug: term.slug, description: term.description || '', color: term.color || '', sort_order: term.sort_order || 0 } : { name: '', slug: '', description: '', color: '', sort_order: 0, taxonomy_id: taxonomyId })
    setError(null)
    setShowTermModal(true)
  }

  const handleOpenCategoryModal = (category?: Category) => {
    setEditingCategory(category || null)
    setFormData(category ? { name: category.name, slug: category.slug, type: category.type || 'blog', description: category.description || '', icon: category.icon || '', color: category.color || '', sort_order: category.sort_order || 0 } : { name: '', slug: '', type: 'blog', description: '', icon: '', color: '', sort_order: 0 })
    setError(null)
    setShowCategoryModal(true)
  }

  const handleCloseModal = () => {
    setShowTaxonomyModal(false)
    setShowTermModal(false)
    setShowCategoryModal(false)
    setEditingTaxonomy(null)
    setEditingTerm(null)
    setEditingCategory(null)
    setFormData({})
    setError(null)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    if (name === 'name' && !editingTaxonomy && !editingTerm && !editingCategory) {
      const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
      setFormData(prev => ({ ...prev, slug }))
    }
  }

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const slug = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-').replace(/^-|-$/g, '')
    setFormData(prev => ({ ...prev, slug }))
  }

  const handleSubmitTaxonomy = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!formData.key || !formData.name) {
      setError('Key and name are required')
      return
    }
    try {
      if (editingTaxonomy) {
        await adminAPI.updateTaxonomy(editingTaxonomy.id, formData)
      } else {
        await adminAPI.createTaxonomy(formData)
      }
      handleCloseModal()
      loadAll()
    } catch (err: any) {
      setError(err.message || 'Failed to save taxonomy')
    }
  }

  const handleSubmitTerm = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!formData.name || !formData.slug || !formData.taxonomy_id) {
      setError('Name, slug, and taxonomy are required')
      return
    }
    try {
      if (editingTerm?.term) {
        await adminAPI.updateTerm(editingTerm.term.id, formData)
      } else {
        await adminAPI.createTerm(formData)
      }
      handleCloseModal()
      loadAll()
    } catch (err: any) {
      setError(err.message || 'Failed to save term')
    }
  }

  const handleSubmitCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!formData.name || !formData.slug || !formData.type) {
      setError('Name, slug, and type are required')
      return
    }
    try {
      if (editingCategory) {
        await adminAPI.updateCategory(editingCategory.id, formData)
      } else {
        await adminAPI.createCategory(formData)
      }
      handleCloseModal()
      loadAll()
    } catch (err: any) {
      setError(err.message || 'Failed to save category')
    }
  }

  const handleDeleteTaxonomy = async (id: string, name: string) => {
    if (!window.confirm(`Delete taxonomy "${name}"? This will also delete all its terms.`)) return
    try {
      await adminAPI.deleteTaxonomy(id)
      loadAll()
    } catch (err: any) {
      alert(err.message || 'Failed to delete taxonomy')
    }
  }

  const handleDeleteTerm = async (id: string, name: string) => {
    if (!window.confirm(`Delete term "${name}"?`)) return
    try {
      await adminAPI.deleteTerm(id)
      loadAll()
    } catch (err: any) {
      alert(err.message || 'Failed to delete term')
    }
  }

  const handleDeleteCategory = async (id: string, name: string) => {
    if (!window.confirm(`Delete category "${name}"?`)) return
    try {
      await adminAPI.deleteCategory(id)
      loadAll()
    } catch (err: any) {
      alert(err.message || 'Failed to delete category')
    }
  }

  const categoryTypes = ['blog', 'orientation', 'university', 'program', 'other']

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Taxonomies & Categories</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('taxonomies')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                activeTab === 'taxonomies' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Taxonomies
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                activeTab === 'categories' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Categories
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading…</div>
        ) : activeTab === 'taxonomies' ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">Taxonomies</h2>
              <button
                onClick={() => handleOpenTaxonomyModal()}
                className="btn-primary flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                New Taxonomy
              </button>
            </div>

            <div className="bg-white rounded-xl shadow overflow-hidden">
              {taxonomies.length === 0 ? (
                <div className="p-8 text-center text-gray-500">No taxonomies yet. Create your first taxonomy!</div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {taxonomies.map((tax) => {
                    const isExpanded = expandedTaxonomies.has(tax.id)
                    const taxTerms = terms[tax.id] || []
                    return (
                      <div key={tax.id} className="hover:bg-gray-50">
                        <div className="px-6 py-4 flex items-center justify-between">
                          <div className="flex items-center gap-3 flex-1">
                            <button
                              onClick={() => toggleTaxonomy(tax.id)}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                            </button>
                            <div className="flex-1">
                              <div className="font-semibold text-gray-900">{tax.name}</div>
                              <div className="text-sm text-gray-500">Key: {tax.key}</div>
                              {tax.description && <div className="text-xs text-gray-400 mt-1">{tax.description}</div>}
                            </div>
                            <div className="text-sm text-gray-500">{taxTerms.length} terms</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleOpenTermModal(tax.id)}
                              className="text-blue-600 hover:text-blue-700 text-sm"
                              title="Add term"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleOpenTaxonomyModal(tax)}
                              className="text-blue-600 hover:text-blue-700"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteTaxonomy(tax.id, tax.name)}
                              className="text-red-600 hover:text-red-700"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        {isExpanded && (
                          <div className="px-6 pb-4 pl-14 bg-gray-50">
                            {taxTerms.length === 0 ? (
                              <div className="text-sm text-gray-400 py-2">No terms yet</div>
                            ) : (
                              <div className="space-y-2">
                                {taxTerms.map((term) => (
                                  <div key={term.id} className="flex items-center justify-between bg-white p-3 rounded border">
                                    <div className="flex-1">
                                      <div className="font-medium text-gray-900">{term.name}</div>
                                      <div className="text-xs text-gray-500">/{term.slug}</div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={() => handleOpenTermModal(tax.id, term)}
                                        className="text-blue-600 hover:text-blue-700"
                                        title="Edit"
                                      >
                                        <Edit2 className="w-4 h-4" />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteTerm(term.id, term.name)}
                                        className="text-red-600 hover:text-red-700"
                                        title="Delete"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">Categories</h2>
              <button
                onClick={() => handleOpenCategoryModal()}
                className="btn-primary flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                New Category
              </button>
            </div>

            <div className="bg-white rounded-xl shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Slug</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {categories.map((cat) => (
                    <tr key={cat.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900">{cat.name}</div>
                        {cat.description && <div className="text-xs text-gray-500 mt-1">{cat.description}</div>}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-block px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-800">
                          {cat.type || 'blog'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600">/{cat.slug}</div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <button
                            onClick={() => handleOpenCategoryModal(cat)}
                            className="text-blue-600 hover:text-blue-700"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(cat.id, cat.name)}
                            className="text-red-600 hover:text-red-700"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {categories.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                        No categories yet. Create your first category!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Taxonomy Modal */}
        {showTaxonomyModal && (
          <Modal
            title={editingTaxonomy ? 'Edit Taxonomy' : 'New Taxonomy'}
            onClose={handleCloseModal}
            onSubmit={handleSubmitTaxonomy}
            error={error}
          >
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Key *</label>
              <input
                type="text"
                name="key"
                value={formData.key || ''}
                onChange={handleInputChange}
                required
                disabled={!!editingTaxonomy}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="scope"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name || ''}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border rounded-md"
                placeholder="Scope"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description || ''}
                onChange={handleInputChange}
                rows={2}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort Order</label>
              <input
                type="number"
                name="sort_order"
                value={formData.sort_order || 0}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
          </Modal>
        )}

        {/* Term Modal */}
        {showTermModal && (
          <Modal
            title={editingTerm?.term ? 'Edit Term' : 'New Term'}
            onClose={handleCloseModal}
            onSubmit={handleSubmitTerm}
            error={error}
          >
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name || ''}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Slug *</label>
              <input
                type="text"
                name="slug"
                value={formData.slug || ''}
                onChange={handleSlugChange}
                required
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description || ''}
                onChange={handleInputChange}
                rows={2}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
              <input
                type="text"
                name="color"
                value={formData.color || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="bg-blue-500"
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort Order</label>
              <input
                type="number"
                name="sort_order"
                value={formData.sort_order || 0}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
          </Modal>
        )}

        {/* Category Modal */}
        {showCategoryModal && (
          <Modal
            title={editingCategory ? 'Edit Category' : 'New Category'}
            onClose={handleCloseModal}
            onSubmit={handleSubmitCategory}
            error={error}
          >
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Type *</label>
              <select
                name="type"
                value={formData.type || 'blog'}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border rounded-md"
              >
                {categoryTypes.map(type => (
                  <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name || ''}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Slug *</label>
              <input
                type="text"
                name="slug"
                value={formData.slug || ''}
                onChange={handleSlugChange}
                required
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                name="description"
                value={formData.description || ''}
                onChange={handleInputChange}
                rows={2}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Icon</label>
              <input
                type="text"
                name="icon"
                value={formData.icon || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="GraduationCap"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
              <input
                type="text"
                name="color"
                value={formData.color || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="bg-blue-500"
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort Order</label>
              <input
                type="number"
                name="sort_order"
                value={formData.sort_order || 0}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
          </Modal>
        )}
      </div>
    </div>
  )
}

// Modal Component
function Modal({ title, children, onClose, onSubmit, error }: {
  title: string
  children: React.ReactNode
  onClose: () => void
  onSubmit: (e: React.FormEvent) => void
  error: string | null
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            {error}
          </div>
        )}
        <form onSubmit={onSubmit}>
          {children}
          <div className="flex items-center justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {title.includes('Edit') ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

