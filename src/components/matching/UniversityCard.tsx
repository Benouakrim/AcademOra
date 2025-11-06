import React from 'react'
import { useNavigate } from 'react-router-dom'
import { savedMatchesAPI } from '../../lib/api'

type Props = {
  university: any
}

export default function UniversityCard({ university }: Props) {
  const location = university.location_city || university.city || ''
  const country = university.location_country || university.country || ''
  const campus = university.campus_setting || ''
  const tuition = university.tuition_international || university.avg_tuition_per_year || null
  const acceptance = university.acceptance_rate || null
  const visaMonths = university.post_study_work_visa_months || null
  const [imageError, setImageError] = React.useState(false)
  const logoUrl = university.logo_url || university.image_url
  const navigate = useNavigate()
  const detailHref = university?.slug ? `/universities/${university.slug}` : (university?.id ? `/universities/${university.id}` : '#')
  const [saved, setSaved] = React.useState<boolean>(false)
  const [saving, setSaving] = React.useState<boolean>(false)

  React.useEffect(() => {
    let mounted = true
    async function load() {
      try {
        const res = await savedMatchesAPI.isSaved(university.id)
        if (!mounted) return
        setSaved(!!res?.saved)
      } catch {}
    }
    if (university?.id) load()
    return () => { mounted = false }
  }, [university?.id])

  const toggleSave = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!university?.id || saving) return
    setSaving(true)
    try {
      if (saved) {
        await savedMatchesAPI.unsave(university.id)
        setSaved(false)
      } else {
        await savedMatchesAPI.save(university.id)
        setSaved(true)
      }
    } catch (e) {
      // ignore for now
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="bg-white rounded-lg shadow p-4 border hover:shadow-md transition-shadow cursor-pointer hover:ring-2 hover:ring-primary-100"
      onClick={() => navigate(detailHref)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter') navigate(detailHref) }}
    >
      <div className="flex items-start gap-4">
        {logoUrl && !imageError ? (
          <img 
            src={logoUrl} 
            alt={university.name} 
            className="w-20 h-20 object-contain rounded-md border border-gray-200"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-primary-200 rounded-md flex items-center justify-center text-lg font-bold text-primary-700">
            {university?.name?.slice?.(0,1) || 'U'}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-gray-900 truncate">{university.name}</h4>
              {university.short_name && (
                <p className="text-xs text-gray-500 mt-0.5">{university.short_name}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleSave}
                disabled={saving}
                className={`text-xs px-2 py-1 rounded border ${saved ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-primary-600 border-primary-600 hover:bg-primary-50'} transition-colors`}
                aria-label={saved ? 'Unsave' : 'Save'}
                title={saved ? 'Unsave' : 'Save'}
              >
                {saved ? 'Saved' : 'Save'}
              </button>
              <div className="text-xs font-bold text-primary-600 whitespace-nowrap">{university.score ?? 0}%</div>
            </div>
          </div>
          <p className="text-xs text-gray-600 mt-1 line-clamp-2">{university.description}</p>
          
          <div className="mt-3 space-y-1.5">
            <div className="flex items-center gap-2 text-xs text-gray-500 flex-wrap">
              {location && country && (
                <>
                  <span className="flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {location}, {country}
                  </span>
                </>
              )}
              {campus && (
                <>
                  <span>•</span>
                  <span>{campus}</span>
                </>
              )}
            </div>
            
            <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
              {tuition && (
                <span className="flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  ${(tuition / 1000).toFixed(0)}k/yr
                </span>
              )}
              {acceptance && (
                <>
                  <span>•</span>
                  <span>{acceptance}% acceptance</span>
                </>
              )}
              {visaMonths && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {visaMonths}mo visa
                  </span>
                </>
              )}
            </div>
            
            {university.top_ranked_programs && Array.isArray(university.top_ranked_programs) && university.top_ranked_programs.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap mt-2">
                {university.top_ranked_programs.slice(0, 3).map((program: string, idx: number) => (
                  <span key={idx} className="text-xs px-2 py-0.5 bg-primary-50 text-primary-700 rounded-full">
                    {program}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
