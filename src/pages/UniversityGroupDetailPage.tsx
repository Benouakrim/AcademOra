import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft, MapPin, Building2, ExternalLink, School, Users, Calendar,
  Globe, ChevronRight, GraduationCap
} from 'lucide-react'
import { universityGroupsAPI } from '../lib/api'

interface University {
  id: string
  name: string
  short_name?: string
  slug?: string
  logo_url?: string
  description?: string
  location_country?: string
  location_city?: string
  campus_setting?: string
  tuition_international?: number
  acceptance_rate?: number
  ranking_world?: number
}

interface UniversityGroup {
  id: string
  name: string
  short_name?: string
  slug?: string
  description?: string
  logo_url?: string
  hero_image_url?: string
  website_url?: string
  established_year?: number
  headquarters_country?: string
  headquarters_city?: string
  headquarters_address?: string
  contact_email?: string
  contact_phone?: string
  total_instances?: number
  universities?: University[]
}

export default function UniversityGroupDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const [group, setGroup] = useState<UniversityGroup | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [imageError, setImageError] = useState(false)

  useEffect(() => {
    async function fetchGroup() {
      if (!slug) {
        setError('Group slug is required')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const data = await universityGroupsAPI.getGroupBySlug(slug)
        if (data) {
          setGroup(data)
        } else {
          setError('University group not found')
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load university group')
      } finally {
        setLoading(false)
      }
    }

    fetchGroup()
  }, [slug])

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen py-12">
        <div className="text-center py-20">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">Loading group...</p>
        </div>
      </div>
    )
  }

  if (error || !group) {
    return (
      <div className="bg-gray-50 min-h-screen py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="bg-white rounded-lg shadow-lg p-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Group Not Found</h1>
            <p className="text-gray-600 mb-6">{error || 'The university group you are looking for does not exist.'}</p>
            <Link to="/orientation/schools" className="btn-primary inline-flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Schools
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const location = group.headquarters_city || ''
  const country = group.headquarters_country || ''
  const universities = group.universities || []

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-primary-600 to-primary-800 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Link
            to="/orientation/schools"
            className="inline-flex items-center gap-2 text-white/90 hover:text-white mb-6 text-sm font-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Schools
          </Link>

          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Logo */}
            <div className="flex-shrink-0">
              {group.logo_url && !imageError ? (
                <img
                  src={group.logo_url}
                  alt={group.name}
                  className="w-32 h-32 object-contain bg-white rounded-lg p-4 shadow-lg"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="w-32 h-32 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center text-4xl font-bold">
                  {(group.name || 'G')[0].toUpperCase()}
                </div>
              )}
            </div>

            {/* Header Info */}
            <div className="flex-1">
              <div className="mb-4">
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold mb-3">
                  <Building2 className="h-4 w-4" />
                  University Group
                </div>
                <h1 className="text-4xl md:text-5xl font-bold mb-2">{group.name}</h1>
                {group.short_name && (
                  <p className="text-xl text-white/90 mb-2">{group.short_name}</p>
                )}
                {(location || country) && (
                  <div className="flex items-center gap-2 text-white/90">
                    <MapPin className="h-5 w-5" />
                    <span>{location ? `${location}, ` : ''}{country}</span>
                  </div>
                )}
              </div>

              {group.description && (
                <p className="text-white/90 text-lg mb-4 max-w-3xl">{group.description}</p>
              )}

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
                {group.total_instances && group.total_instances > 0 && (
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                    <div className="text-xs text-white/80 mb-1">Institutions</div>
                    <div className="text-2xl font-bold">{group.total_instances}</div>
                  </div>
                )}
                {group.established_year && (
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                    <div className="text-xs text-white/80 mb-1">Established</div>
                    <div className="text-2xl font-bold">{group.established_year}</div>
                  </div>
                )}
                {group.website_url && (
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                    <div className="text-xs text-white/80 mb-1">Website</div>
                    <div className="text-sm font-bold">Available</div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              {group.website_url && (
                <div className="mt-6">
                  <a
                    href={group.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-white text-primary-600 px-4 py-2 rounded-lg font-semibold hover:bg-white/90 transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Visit Group Website
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Group Information */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Building2 className="h-6 w-6 text-primary-600" />
            Group Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {group.established_year && (
              <div>
                <div className="text-xs text-gray-500 mb-1">Established Year</div>
                <div className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  {group.established_year}
                </div>
              </div>
            )}
            {group.headquarters_address && (
              <div>
                <div className="text-xs text-gray-500 mb-1">Headquarters Address</div>
                <div className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  {group.headquarters_address}
                </div>
              </div>
            )}
            {group.contact_email && (
              <div>
                <div className="text-xs text-gray-500 mb-1">Contact Email</div>
                <div className="text-sm font-semibold text-gray-900">{group.contact_email}</div>
              </div>
            )}
            {group.contact_phone && (
              <div>
                <div className="text-xs text-gray-500 mb-1">Contact Phone</div>
                <div className="text-sm font-semibold text-gray-900">{group.contact_phone}</div>
              </div>
            )}
          </div>
        </div>

        {/* Universities Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <School className="h-6 w-6 text-primary-600" />
              Institutions ({universities.length})
            </h2>
          </div>

          {universities.length === 0 ? (
            <div className="text-center py-12">
              <School className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No institutions found in this group.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {universities.map((university) => (
                <div
                  key={university.id}
                  onClick={() => {
                    if (university.slug) {
                      navigate(`/universities/${university.slug}`)
                    }
                  }}
                  className="bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition-colors cursor-pointer border border-gray-200 hover:border-primary-300 group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2 flex-1">
                      {university.name}
                    </h3>
                    <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-primary-600 transition-colors flex-shrink-0 ml-2" />
                  </div>
                  
                  {university.short_name && (
                    <p className="text-sm text-gray-500 mb-2">{university.short_name}</p>
                  )}

                  {university.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {university.description}
                    </p>
                  )}

                  <div className="space-y-2 pt-4 border-t border-gray-200">
                    {(university.location_city || university.location_country) && (
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <MapPin className="h-3 w-3 text-gray-400" />
                        <span>
                          {university.location_city ? `${university.location_city}, ` : ''}
                          {university.location_country}
                        </span>
                      </div>
                    )}
                    {university.campus_setting && (
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Building2 className="h-3 w-3 text-gray-400" />
                        <span>{university.campus_setting}</span>
                      </div>
                    )}
                    {university.tuition_international && (
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <GraduationCap className="h-3 w-3 text-gray-400" />
                        <span>${(university.tuition_international / 1000).toFixed(0)}k/yr</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

