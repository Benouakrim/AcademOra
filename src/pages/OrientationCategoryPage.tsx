import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Lock, Star, Search, Filter, MapPin, DollarSign, GraduationCap, Globe, X, Building2, School } from 'lucide-react'
import { orientationAPI, universitiesAPI, universityGroupsAPI } from '../lib/api'
import { getCurrentUser } from '../lib/api'

interface Resource {
  id: string
  title: string
  slug: string
  content: string
  category: string
  featured: boolean
  is_premium?: boolean
  premium?: boolean
  created_at: string
}

const categoryNames: Record<string, string> = {
  fields: 'Fields & Programs',
  schools: 'Schools & Universities',
  'study-abroad': 'Study Abroad',
  procedures: 'Procedures & Guides',
  comparisons: 'Comparisons',
}

interface University {
  id: string
  name: string
  short_name?: string
  slug?: string
  logo_url?: string
  hero_image_url?: string
  image_url?: string
  description?: string
  location_country?: string
  location_city?: string
  country?: string
  city?: string
  campus_setting?: string
  tuition_international?: number
  avg_tuition_per_year?: number
  acceptance_rate?: number
  ranking_world?: number
  post_study_work_visa_months?: number
  top_ranked_programs?: string[]
  website_url?: string
  program_url?: string
  group_id?: string
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
  total_instances?: number
  universities?: University[]
}

export default function OrientationCategoryPage() {
  const { category } = useParams<{ category: string }>()
  const [resources, setResources] = useState<Resource[]>([])
  const [universities, setUniversities] = useState<University[]>([])
  const [groups, setGroups] = useState<UniversityGroup[]>([])
  const [filteredUniversities, setFilteredUniversities] = useState<University[]>([])
  const [filteredGroups, setFilteredGroups] = useState<UniversityGroup[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const isSchoolsPage = category === 'schools'
  const [viewMode, setViewMode] = useState<'all' | 'groups' | 'universities'>('all')

  // Filters for schools page
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCountry, setSelectedCountry] = useState<string>('All')
  const [selectedCampusSetting, setSelectedCampusSetting] = useState<string>('All')
  const [sortBy, setSortBy] = useState<string>('name')
  const [showFilters, setShowFilters] = useState(false)
  const [maxTuition, setMaxTuition] = useState<number>(150000)
  const [minAcceptanceRate, setMinAcceptanceRate] = useState<number>(0)

  useEffect(() => {
    async function fetchData() {
      if (!category) return

      try {
        if (isSchoolsPage) {
          // Fetch both groups and universities
          const [groupsData, universitiesData] = await Promise.all([
            universityGroupsAPI.getGroups(),
            universitiesAPI.getUniversities()
          ])
          
          setGroups(groupsData || [])
          // Filter out universities that belong to groups (only show standalone universities)
          const standaloneUniversities = (universitiesData || []).filter((u: University) => !u.group_id)
          setUniversities(standaloneUniversities)
          setFilteredUniversities(standaloneUniversities)
          setFilteredGroups(groupsData || [])
        } else {
          const data = await orientationAPI.getResourcesByCategory(category)
          const normalized = (data || []).map((item: Resource) => ({
            ...item,
            is_premium: item.is_premium ?? item.premium ?? false,
          }))
          setResources(normalized as Resource[])
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [category, isSchoolsPage])

  // Filter and sort universities
  useEffect(() => {
    if (!isSchoolsPage) return

    let filtered = [...universities]

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(uni =>
        uni.name?.toLowerCase().includes(term) ||
        uni.short_name?.toLowerCase().includes(term) ||
        uni.location_city?.toLowerCase().includes(term) ||
        uni.location_country?.toLowerCase().includes(term) ||
        uni.description?.toLowerCase().includes(term)
      )
    }

    // Country filter
    if (selectedCountry !== 'All') {
      filtered = filtered.filter(uni =>
        (uni.location_country || uni.country) === selectedCountry
      )
    }

    // Campus setting filter
    if (selectedCampusSetting !== 'All') {
      filtered = filtered.filter(uni => uni.campus_setting === selectedCampusSetting)
    }

    // Tuition filter
    filtered = filtered.filter(uni => {
      const tuition = uni.tuition_international || uni.avg_tuition_per_year || 0
      return tuition <= maxTuition
    })

    // Acceptance rate filter
    if (minAcceptanceRate > 0) {
      filtered = filtered.filter(uni => {
        const rate = uni.acceptance_rate || 100
        return rate >= minAcceptanceRate
      })
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a.name || '').localeCompare(b.name || '')
        case 'tuition_low':
          return (a.tuition_international || a.avg_tuition_per_year || 0) - (b.tuition_international || b.avg_tuition_per_year || 0)
        case 'tuition_high':
          return (b.tuition_international || b.avg_tuition_per_year || 0) - (a.tuition_international || a.avg_tuition_per_year || 0)
        case 'acceptance_rate':
          return (a.acceptance_rate || 100) - (b.acceptance_rate || 100)
        case 'ranking':
          return (a.ranking_world || 9999) - (b.ranking_world || 9999)
        default:
          return 0
      }
    })

    setFilteredUniversities(filtered)
  }, [universities, searchTerm, selectedCountry, selectedCampusSetting, sortBy, maxTuition, minAcceptanceRate, isSchoolsPage])

  // Filter and sort groups
  useEffect(() => {
    if (!isSchoolsPage) return

    let filtered = [...groups]

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(group =>
        group.name?.toLowerCase().includes(term) ||
        group.short_name?.toLowerCase().includes(term) ||
        group.headquarters_city?.toLowerCase().includes(term) ||
        group.headquarters_country?.toLowerCase().includes(term) ||
        group.description?.toLowerCase().includes(term)
      )
    }

    // Country filter
    if (selectedCountry !== 'All') {
      filtered = filtered.filter(group =>
        group.headquarters_country === selectedCountry
      )
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a.name || '').localeCompare(b.name || '')
        case 'instances':
          return (b.total_instances || 0) - (a.total_instances || 0)
        default:
          return 0
      }
    })

    setFilteredGroups(filtered)
  }, [groups, searchTerm, selectedCountry, sortBy, isSchoolsPage])

  // Get unique countries and campus settings
  const countries = Array.from(new Set([
    ...universities.map(u => u.location_country || u.country),
    ...groups.map(g => g.headquarters_country)
  ].filter(Boolean))).sort()
  const campusSettings = Array.from(new Set(universities.map(u => u.campus_setting).filter(Boolean))).sort()

  const handleResourceClick = (resource: Resource) => {
    if (resource.is_premium) {
      // Check if user is authenticated
      const user = getCurrentUser()
      if (user) {
        navigate(`/orientation/${category}/${resource.slug}`)
      } else {
        navigate('/login')
      }
    } else {
      navigate(`/orientation/${category}/${resource.slug}`)
    }
  }

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-gray-600">Loading resources...</p>
          </div>
        </div>
      </div>
    )
  }

  const categoryName = category ? categoryNames[category] || category : 'Category'

  // Schools page with universities
  if (isSchoolsPage) {
    return (
      <div className="bg-gray-50 min-h-screen py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <Link to="/orientation" className="text-primary-600 hover:text-primary-700 mb-4 inline-block">
              ← Back to Orientation
            </Link>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Schools & Universities
            </h1>
            <p className="text-xl text-gray-600 mb-4">
              Explore university groups and individual institutions worldwide
            </p>
            
            {/* View Mode Toggle */}
            <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1 w-fit">
              <button
                onClick={() => setViewMode('all')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'all'
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                All ({filteredGroups.length + filteredUniversities.length})
              </button>
              <button
                onClick={() => setViewMode('groups')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'groups'
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Building2 className="h-4 w-4 inline mr-1" />
                Groups ({filteredGroups.length})
              </button>
              <button
                onClick={() => setViewMode('universities')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'universities'
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <School className="h-4 w-4 inline mr-1" />
                Institutions ({filteredUniversities.length})
              </button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              {/* Search Bar */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search universities by name, location, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center gap-2 transition-colors"
              >
                <Filter className="h-5 w-5" />
                Filters
              </button>
            </div>

            {/* Filter Panel */}
            {showFilters && (
              <div className="border-t border-gray-200 pt-4 mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                  <select
                    value={selectedCountry}
                    onChange={(e) => setSelectedCountry(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="All">All Countries</option>
                    {countries.map(country => (
                      <option key={country} value={country}>{country}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Campus Setting</label>
                  <select
                    value={selectedCampusSetting}
                    onChange={(e) => setSelectedCampusSetting(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="All">All Settings</option>
                    {campusSettings.map(setting => (
                      <option key={setting} value={setting}>{setting}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Tuition: ${maxTuition.toLocaleString()}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="150000"
                    step="5000"
                    value={maxTuition}
                    onChange={(e) => setMaxTuition(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="name">Name (A-Z)</option>
                    <option value="tuition_low">Tuition (Low to High)</option>
                    <option value="tuition_high">Tuition (High to Low)</option>
                    <option value="acceptance_rate">Acceptance Rate</option>
                    <option value="ranking">World Ranking</option>
                  </select>
                </div>
              </div>
            )}

            {/* Active Filters */}
            {(selectedCountry !== 'All' || selectedCampusSetting !== 'All' || searchTerm) && (
              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-200">
                {searchTerm && (
                  <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm flex items-center gap-2">
                    Search: {searchTerm}
                    <button onClick={() => setSearchTerm('')} className="hover:text-primary-900">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {selectedCountry !== 'All' && (
                  <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm flex items-center gap-2">
                    Country: {selectedCountry}
                    <button onClick={() => setSelectedCountry('All')} className="hover:text-primary-900">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {selectedCampusSetting !== 'All' && (
                  <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm flex items-center gap-2">
                    Campus: {selectedCampusSetting}
                    <button onClick={() => setSelectedCampusSetting('All')} className="hover:text-primary-900">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
              </div>
            )}

            {/* Results Count */}
            <div className="mt-4 text-sm text-gray-600">
              {viewMode === 'all' && (
                <>Showing {filteredGroups.length} groups and {filteredUniversities.length} institutions</>
              )}
              {viewMode === 'groups' && (
                <>Showing {filteredGroups.length} of {groups.length} groups</>
              )}
              {viewMode === 'universities' && (
                <>Showing {filteredUniversities.length} of {universities.length} institutions</>
              )}
            </div>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
              <p className="mt-4 text-gray-600">Loading...</p>
            </div>
          ) : (
            <>
              {/* Groups Section */}
              {(viewMode === 'all' || viewMode === 'groups') && (
                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-4">
                    <Building2 className="h-5 w-5 text-primary-600" />
                    <h2 className="text-2xl font-bold text-gray-900">University Groups</h2>
                    <span className="text-sm text-gray-500">({filteredGroups.length})</span>
                  </div>
                  {filteredGroups.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl shadow-lg">
                      <p className="text-gray-600">No groups found.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                      {filteredGroups.map((group) => (
                        <GroupCard
                          key={group.id}
                          group={group}
                          onClick={() => {
                            if (group.slug) {
                              navigate(`/university-groups/${group.slug}`)
                            }
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Universities Section */}
              {(viewMode === 'all' || viewMode === 'universities') && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <School className="h-5 w-5 text-primary-600" />
                    <h2 className="text-2xl font-bold text-gray-900">Individual Institutions</h2>
                    <span className="text-sm text-gray-500">({filteredUniversities.length})</span>
                  </div>
                  {filteredUniversities.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl shadow-lg">
                      <p className="text-gray-600">No institutions found.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredUniversities.map((university) => (
                        <UniversityCard
                          key={university.id}
                          university={university}
                          onClick={() => {
                            if (university.slug) {
                              navigate(`/universities/${university.slug}`)
                            } else if (university.id) {
                              navigate(`/universities/${university.id}`)
                            }
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    )
  }

  // Regular resources page
  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <Link to="/orientation" className="text-primary-600 hover:text-primary-700 mb-4 inline-block">
            ← Back to Orientation
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {categoryName}
          </h1>
          <p className="text-xl text-gray-600">
            Explore our comprehensive resources in this category
          </p>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-gray-600">Loading resources...</p>
          </div>
        ) : resources.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl shadow-lg">
            <p className="text-xl text-gray-600 mb-4">No resources found in this category.</p>
            <p className="text-gray-500">Check back soon for new content!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {resources.map((resource) => (
              <div
                key={resource.id}
                className="card group cursor-pointer relative"
                onClick={() => handleResourceClick(resource)}
              >
                {resource.featured && (
                  <div className="absolute top-4 right-4 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-semibold flex items-center">
                    <Star className="h-3 w-3 mr-1" />
                    Featured
                  </div>
                )}
                {resource.is_premium && (
                  <div className="absolute top-4 left-4 bg-primary-600 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center">
                    <Lock className="h-3 w-3 mr-1" />
                    Premium
                  </div>
                )}
                <h2 className="text-xl font-bold mb-3 text-gray-900 group-hover:text-primary-600 transition-colors pr-20">
                  {resource.title}
                </h2>
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {resource.content ? resource.content.substring(0, 150) + '...' : 'No content available'}
                </p>
                <div className="flex items-center text-primary-600 font-semibold">
                  {resource.is_premium ? (
                    <>
                      <Lock className="h-4 w-4 mr-1" />
                      <span>Premium Content</span>
                    </>
                  ) : (
                    <>
                      Read More <ArrowRight className="h-4 w-4 ml-1" />
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// University Card Component for Schools Page
function UniversityCard({ university, onClick }: { university: University; onClick: () => void }) {
  const [imageError, setImageError] = useState(false)
  const location = university.location_city || university.city || ''
  const country = university.location_country || university.country || ''
  const campus = university.campus_setting || ''
  const tuition = university.tuition_international || university.avg_tuition_per_year || null
  const acceptance = university.acceptance_rate || null
  const visaMonths = university.post_study_work_visa_months || null
  const logoUrl = university.logo_url || university.image_url || university.hero_image_url

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden border border-gray-200 hover:border-primary-300 group"
    >
      {/* Image/Logo Header */}
      <div className="relative h-48 bg-gradient-to-br from-primary-100 to-primary-200 overflow-hidden">
        {logoUrl && !imageError ? (
          <img
            src={logoUrl}
            alt={university.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-6xl font-bold text-primary-700 opacity-50">
              {(university.name || 'U')[0].toUpperCase()}
            </div>
          </div>
        )}
        {university.ranking_world && (
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-primary-700">
            #{university.ranking_world}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="mb-3">
          <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-primary-600 transition-colors line-clamp-2">
            {university.name}
          </h3>
          {university.short_name && (
            <p className="text-sm text-gray-500">{university.short_name}</p>
          )}
        </div>

        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {university.description || 'No description available'}
        </p>

        {/* Location */}
        {(location || country) && (
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
            <MapPin className="h-4 w-4 text-gray-400" />
            <span>{location ? `${location}, ` : ''}{country}</span>
            {campus && <span className="text-gray-400">• {campus}</span>}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4 pt-4 border-t border-gray-100">
          {tuition && (
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-gray-400" />
              <div>
                <div className="text-xs text-gray-500">Tuition</div>
                <div className="text-sm font-semibold text-gray-900">${(tuition / 1000).toFixed(0)}k/yr</div>
              </div>
            </div>
          )}
          {acceptance && (
            <div className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-gray-400" />
              <div>
                <div className="text-xs text-gray-500">Acceptance</div>
                <div className="text-sm font-semibold text-gray-900">{acceptance}%</div>
              </div>
            </div>
          )}
          {visaMonths && (
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-gray-400" />
              <div>
                <div className="text-xs text-gray-500">Post-Study Visa</div>
                <div className="text-sm font-semibold text-gray-900">{visaMonths} months</div>
              </div>
            </div>
          )}
        </div>

        {/* Top Programs */}
        {university.top_ranked_programs && Array.isArray(university.top_ranked_programs) && university.top_ranked_programs.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {university.top_ranked_programs.slice(0, 3).map((program, idx) => (
              <span key={idx} className="px-2 py-1 bg-primary-50 text-primary-700 rounded text-xs font-medium">
                {program}
              </span>
            ))}
          </div>
        )}

        {/* View Details */}
        <div className="flex items-center text-primary-600 font-semibold text-sm group-hover:text-primary-700">
          View Details <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </div>
  )
}

// Group Card Component for Schools Page
function GroupCard({ group, onClick }: { group: UniversityGroup; onClick: () => void }) {
  const [imageError, setImageError] = useState(false)
  const location = group.headquarters_city || ''
  const country = group.headquarters_country || ''
  const logoUrl = group.logo_url || group.hero_image_url

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden border border-gray-200 hover:border-primary-300 group relative"
    >
      {/* Group Badge */}
      <div className="absolute top-4 left-4 bg-primary-600 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 z-10">
        <Building2 className="h-3 w-3" />
        Group
      </div>

      {/* Image/Logo Header */}
      <div className="relative h-48 bg-gradient-to-br from-primary-100 to-primary-200 overflow-hidden">
        {logoUrl && !imageError ? (
          <img
            src={logoUrl}
            alt={group.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-6xl font-bold text-primary-700 opacity-50">
              {(group.name || 'G')[0].toUpperCase()}
            </div>
          </div>
        )}
        {group.total_instances && group.total_instances > 0 && (
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-primary-700">
            {group.total_instances} {group.total_instances === 1 ? 'institution' : 'institutions'}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="mb-3">
          <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-primary-600 transition-colors line-clamp-2">
            {group.name}
          </h3>
          {group.short_name && (
            <p className="text-sm text-gray-500">{group.short_name}</p>
          )}
        </div>

        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {group.description || 'No description available'}
        </p>

        {/* Location */}
        {(location || country) && (
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
            <MapPin className="h-4 w-4 text-gray-400" />
            <span>{location ? `${location}, ` : ''}{country}</span>
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100 mb-4">
          {group.established_year && (
            <div className="text-sm text-gray-600">
              <span className="font-medium">Est.</span> {group.established_year}
            </div>
          )}
          {group.total_instances && group.total_instances > 0 && (
            <div className="text-sm text-gray-600">
              <span className="font-medium">{group.total_instances}</span> {group.total_instances === 1 ? 'campus' : 'campuses'}
            </div>
          )}
        </div>

        {/* View Details */}
        <div className="flex items-center text-primary-600 font-semibold text-sm group-hover:text-primary-700">
          View Group <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </div>
  )
}

