import React from 'react'

type Uni = any

export default function UniversityMixerCard({ university }: { university: Uni }) {
  const reasons: string[] = university.explanations || []
  const location = university.location_city || university.city || ''
  const country = university.location_country || university.country || ''
  const campus = university.campus_setting || ''
  const tuition = university.tuition_international || university.avg_tuition_per_year || null
  const acceptance = university.acceptance_rate || null
  const visaMonths = university.post_study_work_visa_months || null
  const [imageError, setImageError] = React.useState(false)
  const logoUrl = university.logo_url || university.image_url

  return (
    <article className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        {logoUrl && !imageError ? (
          <img 
            src={logoUrl} 
            alt={university.name} 
            className="w-16 h-16 object-contain rounded border border-gray-200"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-200 rounded flex items-center justify-center text-sm font-bold text-primary-700">
            {university?.name?.slice?.(0,1) || 'U'}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-gray-900 truncate">{university.name}</h3>
              {university.short_name && (
                <p className="text-xs text-gray-500 mt-0.5">{university.short_name}</p>
              )}
            </div>
            <div className="text-xs font-bold text-primary-600 whitespace-nowrap">Score: {university.score ?? 0}</div>
          </div>
          <div className="mt-1 text-xs text-gray-500">
            {(location || country) && `${location ? location + ', ' : ''}${country}`}
            {campus && ` • ${campus}`}
          </div>
          <div className="mt-2 text-xs text-gray-700 line-clamp-2">{university.description?.slice(0, 140)}</div>
          
          <div className="mt-2 flex items-center gap-2 text-xs text-gray-500 flex-wrap">
            {tuition && (
              <span>${(tuition / 1000).toFixed(0)}k/yr</span>
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
                <span>{visaMonths}mo visa</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-100">
        <ul className="text-xs space-y-1">
          {reasons.length === 0 ? (
            <li className="text-green-600 font-medium">✅ Matched</li>
          ) : (
            reasons.map((r: string, i: number) => (
              <li key={i} className={`${r.includes('(-') || r.includes('(-') ? 'text-red-600' : 'text-green-600'}`}>
                {r}
              </li>
            ))
          )}
        </ul>
      </div>
    </article>
  )
}
