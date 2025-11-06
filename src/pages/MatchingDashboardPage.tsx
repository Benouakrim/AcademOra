import { useEffect, useState } from 'react'
import MixerModule from '../components/matching/MixerModule'
import RangeSlider from '../components/matching/inputs/RangeSlider'
import ToggleGroup from '../components/matching/inputs/ToggleGroup'
import MultiSelectPills from '../components/matching/inputs/MultiSelectPills'
import UniversityCard from '../components/matching/UniversityCard'
import { matchingAPI, userPreferencesAPI } from '../lib/api'

function useDebouncedValue(value: any, delay = 400) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

const defaultState = {
  academics: { enabled: true, filters: { minGpa: 3.0, degreeLevel: 'Any', languages: [] as string[], researchLevel: 'Any', studyAbroad: false } },
  financials: { enabled: true, filters: { maxBudget: 50000, maxCostOfLiving: 100, minScholarship: 1, scholarshipsInternational: false, needBlind: false } },
  lifestyle: { enabled: true, filters: { country: 'Any', campusSetting: 'Any', climate: 'Any', city: 'Any' } },
  admissions: { enabled: true, filters: { maxAcceptanceRate: 100, testPolicy: 'Any', minSat: 0, maxSat: 1600 } },
  demographics: { enabled: true, filters: { minEnrollment: 0, maxEnrollment: 100000, minInternationalPct: 0, maxInternationalPct: 100 } },
  future: { enabled: true, filters: { minVisaMonths: 0, minInternshipStrength: 1, minAlumniStrength: 1, minGraduationRate: 0, minEmploymentRate: 0 } },
  interests: [] as string[],
}

export default function MatchingDashboardPage() {
  const [state, setState] = useState(defaultState)
  const debouncedState = useDebouncedValue(state, 500)
  const [results, setResults] = useState<any[]>([])
  const [flash, setFlash] = useState<string | null>(null)
  const [weights, setWeights] = useState({
    weight_tuition: 0.5,
    weight_location: 0.5,
    weight_ranking: 0.5,
    weight_program: 0.5,
    weight_language: 0.5,
  })
  const debouncedWeights = useDebouncedValue(weights, 600)

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        const res = await matchingAPI.getMatches(debouncedState)
        if (!mounted) return
        const prev = results.length
        setResults(res || [])
        if (Math.abs((res?.length || 0) - prev) > 0) {
          setFlash(`${res.length - prev > 0 ? '+' : ''}${res.length - prev} matches`)
          setTimeout(() => setFlash(null), 1200)
        }
      } catch (error) {
        console.error('Matching error', error)
      }
    }
    load()
    return () => {
      mounted = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedState])

  // Load existing weights on mount
  useEffect(() => {
    let mounted = true
    async function loadPrefs() {
      try {
        const data = await userPreferencesAPI.getPreferences()
        if (!mounted) return
        if (data) setWeights({
          weight_tuition: Number(data.weight_tuition ?? 0.5),
          weight_location: Number(data.weight_location ?? 0.5),
          weight_ranking: Number(data.weight_ranking ?? 0.5),
          weight_program: Number(data.weight_program ?? 0.5),
          weight_language: Number(data.weight_language ?? 0.5),
        })
      } catch {}
    }
    loadPrefs()
    return () => { mounted = false }
  }, [])

  // Persist weights when changed
  useEffect(() => {
    async function savePrefs() {
      try {
        await userPreferencesAPI.savePreferences(debouncedWeights)
      } catch {}
    }
    savePrefs()
  }, [debouncedWeights])

  // modules list intentionally omitted (unused) to avoid unused local errors

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">Your Future Mixer: {results.length} matches found</h1>
        {flash && <div className="text-sm text-green-600 font-semibold">{flash}</div>}
      </div>

      <div className="grid gap-6 lg:grid-cols-[400px_1fr]">
        <div className="space-y-4">
          <MixerModule
            title="Weights"
            isEnabled={true}
            onToggle={()=>{}}
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 17h18M6 9h12M10 3h4"/></svg>}
          >
            <div className="space-y-3">
              <RangeSlider label="Tuition Importance" value={weights.weight_tuition} min={0} max={1} step={0.05} onChange={(v)=> setWeights(w=>({ ...w, weight_tuition: v }))} />
              <RangeSlider label="Location Importance" value={weights.weight_location} min={0} max={1} step={0.05} onChange={(v)=> setWeights(w=>({ ...w, weight_location: v }))} />
              <RangeSlider label="Ranking/Visa Importance" value={weights.weight_ranking} min={0} max={1} step={0.05} onChange={(v)=> setWeights(w=>({ ...w, weight_ranking: v }))} />
              <RangeSlider label="Program Fit Importance" value={weights.weight_program} min={0} max={1} step={0.05} onChange={(v)=> setWeights(w=>({ ...w, weight_program: v }))} />
              <RangeSlider label="Language Importance" value={weights.weight_language} min={0} max={1} step={0.05} onChange={(v)=> setWeights(w=>({ ...w, weight_language: v }))} />
            </div>
          </MixerModule>
          <MixerModule
            title="Academics"
            isEnabled={state.academics.enabled}
            onToggle={(v) => setState(s => ({ ...s, academics: { ...s.academics, enabled: v } }))}
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 2l9 4.5-9 4.5L3 6.5 12 2z"/></svg>}
          >
            <div className="space-y-3">
              <RangeSlider label="Minimum GPA" value={state.academics.filters.minGpa} min={0} max={4} step={0.1} onChange={(v) => setState(s => ({ ...s, academics: { ...s.academics, filters: { ...s.academics.filters, minGpa: v } } }))} />
              <ToggleGroup label="Degree Level" options={[{value:'Any'},{value:'Associate'},{value:'Bachelor'},{value:'Master'},{value:'Doctoral'}]} value={state.academics.filters.degreeLevel} onChange={(v)=> setState(s=>({ ...s, academics: { ...s.academics, filters: { ...s.academics.filters, degreeLevel: v } } }))} />
              <MultiSelectPills label="Languages" options={['English','French','Arabic','Spanish','German','Italian','Chinese','Japanese']} value={state.academics.filters.languages} onChange={(v)=> setState(s=>({ ...s, academics: { ...s.academics, filters: { ...s.academics.filters, languages: v } } }))} />
              <div>
                <div className="text-xs font-medium text-gray-600 mb-1">Research Level</div>
                <select value={state.academics.filters.researchLevel} onChange={(e)=> setState(s=>({ ...s, academics: { ...s.academics, filters: { ...s.academics.filters, researchLevel: e.target.value } } }))} className="w-full rounded-md border-gray-200 text-xs">
                  <option>Any</option>
                  <option>Very High</option>
                  <option>High</option>
                  <option>Medium</option>
                  <option>Teaching Focused</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={state.academics.filters.studyAbroad} onChange={(e)=> setState(s=>({ ...s, academics: { ...s.academics, filters: { ...s.academics.filters, studyAbroad: e.target.checked } } }))} className="rounded" />
                <label className="text-xs text-gray-600">Study Abroad Available</label>
              </div>
            </div>
          </MixerModule>

          <MixerModule
            title="Financials"
            isEnabled={state.financials.enabled}
            onToggle={(v) => setState(s => ({ ...s, financials: { ...s.financials, enabled: v } }))}
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 1v22"/></svg>}
          >
            <div className="space-y-3">
              <RangeSlider label="Max Budget ($)" value={state.financials.filters.maxBudget} min={0} max={150000} step={1000} onChange={(v)=> setState(s=>({ ...s, financials: { ...s.financials, filters: { ...s.financials.filters, maxBudget: v } } }))} />
              <RangeSlider label="Max Cost of Living ($/yr)" value={state.financials.filters.maxCostOfLiving} min={0} max={50000} step={500} onChange={(v)=> setState(s=>({ ...s, financials: { ...s.financials, filters: { ...s.financials.filters, maxCostOfLiving: v } } }))} />
              <RangeSlider label="Min Scholarship Reliance (1-5)" value={state.financials.filters.minScholarship} min={1} max={5} onChange={(v)=> setState(s=>({ ...s, financials: { ...s.financials, filters: { ...s.financials.filters, minScholarship: v } } }))} />
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={state.financials.filters.scholarshipsInternational} onChange={(e)=> setState(s=>({ ...s, financials: { ...s.financials, filters: { ...s.financials.filters, scholarshipsInternational: e.target.checked } } }))} className="rounded" />
                <label className="text-xs text-gray-600">International Scholarships</label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={state.financials.filters.needBlind} onChange={(e)=> setState(s=>({ ...s, financials: { ...s.financials, filters: { ...s.financials.filters, needBlind: e.target.checked } } }))} className="rounded" />
                <label className="text-xs text-gray-600">Need-Blind Admission</label>
              </div>
            </div>
          </MixerModule>

          <MixerModule
            title="Lifestyle"
            isEnabled={state.lifestyle.enabled}
            onToggle={(v) => setState(s => ({ ...s, lifestyle: { ...s.lifestyle, enabled: v } }))}
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"/></svg>}
          >
            <div className="space-y-3">
              <div>
                <div className="text-xs font-medium text-gray-600">Country</div>
                <select value={state.lifestyle.filters.country} onChange={(e)=> setState(s=>({ ...s, lifestyle: { ...s.lifestyle, filters: { ...s.lifestyle.filters, country: e.target.value } } }))} className="mt-1 block w-full rounded-md border-gray-200 text-xs">
                  <option>Any</option>
                  <option>USA</option>
                  <option>Canada</option>
                  <option>UK</option>
                  <option>France</option>
                  <option>Germany</option>
                  <option>Australia</option>
                  <option>Japan</option>
                  <option>South Korea</option>
                  <option>Singapore</option>
                  <option>Netherlands</option>
                  <option>Switzerland</option>
                  <option>Sweden</option>
                </select>
              </div>
              <div>
                <div className="text-xs font-medium text-gray-600">City (optional)</div>
                <input type="text" value={state.lifestyle.filters.city} onChange={(e)=> setState(s=>({ ...s, lifestyle: { ...s.lifestyle, filters: { ...s.lifestyle.filters, city: e.target.value } } }))} className="mt-1 block w-full rounded-md border-gray-200 text-xs px-2 py-1" placeholder="Any" />
              </div>
              <ToggleGroup label="Campus Setting" options={[{value:'Any'},{value:'Urban'},{value:'Suburban'},{value:'Rural'}]} value={state.lifestyle.filters.campusSetting} onChange={(v)=> setState(s=>({ ...s, lifestyle: { ...s.lifestyle, filters: { ...s.lifestyle.filters, campusSetting: v } } }))} />
              <div>
                <div className="text-xs font-medium text-gray-600">Climate Zone</div>
                <select value={state.lifestyle.filters.climate} onChange={(e)=> setState(s=>({ ...s, lifestyle: { ...s.lifestyle, filters: { ...s.lifestyle.filters, climate: e.target.value } } }))} className="mt-1 block w-full rounded-md border-gray-200 text-xs">
                  <option>Any</option>
                  <option>Continental</option>
                  <option>Temperate</option>
                  <option>Tropical</option>
                  <option>Arid</option>
                  <option>Mediterranean</option>
                </select>
              </div>
            </div>
          </MixerModule>

          <MixerModule
            title="Admissions"
            isEnabled={state.admissions.enabled}
            onToggle={(v) => setState(s => ({ ...s, admissions: { ...s.admissions, enabled: v } }))}
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/></svg>}
          >
            <div className="space-y-3">
              <RangeSlider label="Max Acceptance Rate (%)" value={state.admissions.filters.maxAcceptanceRate} min={0} max={100} step={1} onChange={(v)=> setState(s=>({ ...s, admissions: { ...s.admissions, filters: { ...s.admissions.filters, maxAcceptanceRate: v } } }))} />
              <div>
                <div className="text-xs font-medium text-gray-600 mb-1">Test Policy</div>
                <select value={state.admissions.filters.testPolicy} onChange={(e)=> setState(s=>({ ...s, admissions: { ...s.admissions, filters: { ...s.admissions.filters, testPolicy: e.target.value } } }))} className="w-full rounded-md border-gray-200 text-xs">
                  <option>Any</option>
                  <option>Required</option>
                  <option>Test-Optional</option>
                  <option>Test-Blind</option>
                </select>
              </div>
              <RangeSlider label="Min SAT Score" value={state.admissions.filters.minSat} min={0} max={1600} step={50} onChange={(v)=> setState(s=>({ ...s, admissions: { ...s.admissions, filters: { ...s.admissions.filters, minSat: v } } }))} />
            </div>
          </MixerModule>

          <MixerModule
            title="Demographics"
            isEnabled={state.demographics.enabled}
            onToggle={(v) => setState(s => ({ ...s, demographics: { ...s.demographics, enabled: v } }))}
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
          >
            <div className="space-y-3">
              <RangeSlider label="Min Enrollment" value={state.demographics.filters.minEnrollment} min={0} max={50000} step={500} onChange={(v)=> setState(s=>({ ...s, demographics: { ...s.demographics, filters: { ...s.demographics.filters, minEnrollment: v } } }))} />
              <RangeSlider label="Max Enrollment" value={state.demographics.filters.maxEnrollment} min={0} max={100000} step={1000} onChange={(v)=> setState(s=>({ ...s, demographics: { ...s.demographics, filters: { ...s.demographics.filters, maxEnrollment: v } } }))} />
              <RangeSlider label="Min % International" value={state.demographics.filters.minInternationalPct} min={0} max={100} step={1} onChange={(v)=> setState(s=>({ ...s, demographics: { ...s.demographics, filters: { ...s.demographics.filters, minInternationalPct: v } } }))} />
            </div>
          </MixerModule>

          <MixerModule
            title="Future Outcomes"
            isEnabled={state.future.enabled}
            onToggle={(v) => setState(s => ({ ...s, future: { ...s.future, enabled: v } }))}
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 12h18"/></svg>}
          >
            <div className="space-y-3">
              <RangeSlider label="Min Post-Study Visa (months)" value={state.future.filters.minVisaMonths} min={0} max={60} step={6} onChange={(v)=> setState(s=>({ ...s, future: { ...s.future, filters: { ...s.future.filters, minVisaMonths: v } } }))} />
              <RangeSlider label="Min Internship Support (1-5)" value={state.future.filters.minInternshipStrength} min={1} max={5} onChange={(v)=> setState(s=>({ ...s, future: { ...s.future, filters: { ...s.future.filters, minInternshipStrength: v } } }))} />
              <RangeSlider label="Min Alumni Network (1-5)" value={state.future.filters.minAlumniStrength} min={1} max={5} onChange={(v)=> setState(s=>({ ...s, future: { ...s.future, filters: { ...s.future.filters, minAlumniStrength: v } } }))} />
              <RangeSlider label="Min 6-Year Graduation Rate (%)" value={state.future.filters.minGraduationRate} min={0} max={100} step={1} onChange={(v)=> setState(s=>({ ...s, future: { ...s.future, filters: { ...s.future.filters, minGraduationRate: v } } }))} />
              <RangeSlider label="Min Employment Rate (%)" value={state.future.filters.minEmploymentRate} min={0} max={100} step={1} onChange={(v)=> setState(s=>({ ...s, future: { ...s.future, filters: { ...s.future.filters, minEmploymentRate: v } } }))} />
            </div>
          </MixerModule>
        </div>

        <div>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((u) => (
              <UniversityCard key={u.id} university={u} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
