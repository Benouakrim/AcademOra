import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { adminAPI } from '../lib/api'
import * as LucideIcons from 'lucide-react'

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

export default function OrientationPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      const data = await adminAPI.getAllCategories('orientation')
      setCategories(Array.isArray(data) ? data : [])
    } catch (err: any) {
      console.error('Error loading orientation categories:', err)
      // Fallback to default categories if API fails
      setCategories([
        { id: '1', name: 'Fields', slug: 'fields', type: 'orientation', description: 'Explore different academic fields and programs', icon: 'GraduationCap', color: 'bg-blue-500', sort_order: 1 },
        { id: '2', name: 'Schools', slug: 'schools', type: 'orientation', description: 'Compare schools and universities worldwide', icon: 'Building2', color: 'bg-green-500', sort_order: 2 },
        { id: '3', name: 'Study Abroad', slug: 'study-abroad', type: 'orientation', description: 'International study opportunities and programs', icon: 'Globe', color: 'bg-purple-500', sort_order: 3 },
        { id: '4', name: 'Procedures', slug: 'procedures', type: 'orientation', description: 'Step-by-step guides for applications and admissions', icon: 'FileText', color: 'bg-orange-500', sort_order: 4 },
        { id: '5', name: 'Comparisons', slug: 'comparisons', type: 'orientation', description: 'Compare programs, schools, and opportunities', icon: 'Scale', color: 'bg-red-500', sort_order: 5 },
      ])
    } finally {
      setLoading(false)
    }
  }

  const getIcon = (iconName?: string) => {
    if (!iconName) return LucideIcons.GraduationCap
    const IconComponent = (LucideIcons as any)[iconName]
    return IconComponent || LucideIcons.GraduationCap
  }
  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Academic Orientation
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Comprehensive resources to guide your academic decisions and career path
          </p>
        </div>

        {/* Categories Grid */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-200 border-t-primary-600"></div>
            <p className="mt-4 text-gray-600">Loading categories...</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl text-gray-600">No orientation categories found.</p>
            <p className="text-gray-500 mt-2">Please add categories in the admin panel.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((category) => {
              const Icon = getIcon(category.icon)
              const colorClass = category.color || 'bg-blue-500'
              return (
                <Link
                  key={category.id}
                  to={`/orientation/${category.slug}`}
                  className="card group hover:scale-105 transition-transform duration-200"
                >
                  <div className={`${colorClass} w-16 h-16 rounded-xl flex items-center justify-center mb-4 text-white`}>
                    <Icon className="h-8 w-8" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2 text-gray-900 group-hover:text-primary-600 transition-colors">
                    {category.name}
                  </h2>
                  <p className="text-gray-600">{category.description || 'Explore resources in this category'}</p>
                  <div className="mt-4 text-primary-600 font-semibold group-hover:text-primary-700">
                    Explore →
                  </div>
                </Link>
              )
            })}
          </div>
        )}

        {/* Info Section */}
        <div className="mt-20 bg-white rounded-xl shadow-lg p-8 md:p-12">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Your Academic Journey, Simplified
            </h2>
            <p className="text-lg text-gray-600 mb-6">
              AcademOra provides comprehensive orientation resources to help you make informed
              decisions about your education. Whether you're choosing a field, selecting a school,
              planning to study abroad, or navigating procedures, we've got you covered.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-600 mb-2">1000+</div>
                <div className="text-gray-600">Resources</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-600 mb-2">500+</div>
                <div className="text-gray-600">Schools</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-600 mb-2">50+</div>
                <div className="text-gray-600">Countries</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

