import { useEffect, useMemo, useState } from 'react'
import MixerModule from '../components/matching/MixerModule'
import RangeSlider from '../components/matching/inputs/RangeSlider'
import ToggleGroup from '../components/matching/inputs/ToggleGroup'
import MultiSelectPills from '../components/matching/inputs/MultiSelectPills'
import UniversityCard from '../components/matching/UniversityCard'
import { matchingAPI, userPreferencesAPI } from '../lib/api'
import {
  SlidersHorizontal,
  GraduationCap,
  PiggyBank,
  Globe2,
  ClipboardList,
  Users,
  TrendingUp,
  CircleSlash2,
  Dot,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

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

const defaultWeights = {
  weight_tuition: 0.5,
  weight_location: 0.5,
  weight_ranking: 0.5,
  weight_program: 0.5,
  weight_language: 0.5,
}

type TabId = 'weights' | 'academics' | 'financials' | 'lifestyle' | 'admissions' | 'demographics' | 'future'
type SectionTabId = Exclude<TabId, 'weights'>
type TabStatus = 'disabled' | 'default' | 'complete' | 'incomplete'

type MatchingState = typeof defaultState
type WeightsState = typeof defaultWeights

const TAB_CONFIG: Array<{ id: TabId; label: string; icon: LucideIcon }> = [
  { id: 'weights', label: 'Weights', icon: SlidersHorizontal },
  { id: 'academics', label: 'Academics', icon: GraduationCap },
  { id: 'financials', label: 'Financials', icon: PiggyBank },
  { id: 'lifestyle', label: 'Lifestyle', icon: Globe2 },
  { id: 'admissions', label: 'Admissions', icon: ClipboardList },
  { id: 'demographics', label: 'Demographics', icon: Users },
  { id: 'future', label: 'Future Outcomes', icon: TrendingUp },
]

const STATUS_LABEL: Record<TabStatus, string> = {
  disabled: 'Disabled',
  default: 'Using defaults',
  complete: 'Custom values (all fields changed)',
  incomplete: 'Custom values (some fields unchanged)',
}

const STATUS_STYLE: Record<TabStatus, string> = {
  disabled: 'text-gray-400',
  default: 'text-sky-500',
  complete: 'text-emerald-500',
  incomplete: 'text-amber-500',
}

const STATUS_ICON: Record<TabStatus, LucideIcon> = {
  disabled: CircleSlash2,
  default: Dot,
  complete: CheckCircle2,
  incomplete: AlertTriangle,
}

function arraysEqual<T>(a: T[] = [], b: T[] = []) {
  if (a.length !== b.length) return false
  return a.every((value, index) => value === b[index])
}

function isEqualValue(a: any, b: any) {
  if (Array.isArray(a) && Array.isArray(b)) return arraysEqual(a, b)
  return a === b
}

function calculateFilterDiff(current: Record<string, any>, defaults: Record<string, any>) {
  const keys = Object.keys(defaults)
  let hasChanges = false
  let allChanged = true

  for (const key of keys) {
    const equal = isEqualValue(current[key], defaults[key])
    if (!equal) {
      hasChanges = true
    } else {
      allChanged = false
    }
  }

  return { hasChanges, allChanged }
}

function computeWeightsStatus(weights: WeightsState): TabStatus {
  const { hasChanges, allChanged } = calculateFilterDiff(weights, defaultWeights)
  if (!hasChanges) return 'default'
  return allChanged ? 'complete' : 'incomplete'
}

function computeTabStatus(tabId: TabId, state: MatchingState, weights: WeightsState): TabStatus {
  if (tabId === 'weights') {
    return computeWeightsStatus(weights)
  }

  const sectionState = state[tabId as SectionTabId]
  const defaultSection = defaultState[tabId as SectionTabId]

  if (!sectionState.enabled) return 'disabled'

  const { hasChanges, allChanged } = calculateFilterDiff(sectionState.filters, defaultSection.filters)
  if (!hasChanges) return 'default'
  return allChanged ? 'complete' : 'incomplete'
}

export default function MatchingDashboardPage() {
  const [state, setState] = useState(defaultState)
  const debouncedState = useDebouncedValue(state, 500)
  const [results, setResults] = useState<any[]>([])
  const [flash, setFlash] = useState<string | null>(null)
  const [weights, setWeights] = useState(defaultWeights)
  const [activeTab, setActiveTab] = useState<TabId>('weights')
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

  const tabs = useMemo(
    () =>
      TAB_CONFIG.map((tab) => ({
        ...tab,
        status: computeTabStatus(tab.id, state, weights),
      })),
    [state, weights]
  )

  const renderStatusIcon = (status: TabStatus) => {
    const Icon = STATUS_ICON[status]
    return <Icon className={`h-4 w-4 ${STATUS_STYLE[status]}`} />
  }

  const renderTabContent = (tabId: TabId) => {
    switch (tabId) {
      case 'weights':
        return (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Adjust how much each dimension influences your matches. These weights are saved automatically.
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              <RangeSlider label="Tuition Importance" value={weights.weight_tuition} min={0} max={1} step={0.05} onChange={(v)=> setWeights(w=>({ ...w, weight_tuition: v }))} />
              <RangeSlider label="Location Importance" value={weights.weight_location} min={0} max={1} step={0.05} onChange={(v)=> setWeights(w=>({ ...w, weight_location: v }))} />
              <RangeSlider label="Ranking/Visa Importance" value={weights.weight_ranking} min={0} max={1} step={0.05} onChange={(v)=> setWeights(w=>({ ...w, weight_ranking: v }))} />
              <RangeSlider label="Program Fit Importance" value={weights.weight_program} min={0} max={1} step={0.05} onChange={(v)=> setWeights(w=>({ ...w, weight_program: v }))} />
              <RangeSlider label="Language Importance" value={weights.weight_language} min={0} max={1} step={0.05} onChange={(v)=> setWeights(w=>({ ...w, weight_language: v }))} />
            </div>
          </div>
        )
      case 'academics':
        return (
          <MixerModule
            title="Academics"
            isEnabled={state.academics.enabled}
            onToggle={(v) => setState(s => ({ ...s, academics: { ...s.academics, enabled: v } }))}
            icon={<GraduationCap className="h-5 w-5" />}
          >
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="sm:col-span-2 lg:col-span-1">
                <RangeSlider label="Minimum GPA" value={state.academics.filters.minGpa} min={0} max={4} step={0.1} onChange={(v) => setState(s => ({ ...s, academics: { ...s.academics, filters: { ...s.academics.filters, minGpa: v } } }))} />
              </div>
              <div className="sm:col-span-2 lg:col-span-2">
                <ToggleGroup label="Degree Level" options={[{value:'Any'},{value:'Associate'},{value:'Bachelor'},{value:'Master'},{value:'Doctoral'}]} value={state.academics.filters.degreeLevel} onChange={(v)=> setState(s=>({ ...s, academics: { ...s.academics, filters: { ...s.academics.filters, degreeLevel: v } } }))} />
              </div>
              <div className="sm:col-span-2 lg:col-span-3">
                <MultiSelectPills label="Languages" options={['English','French','Arabic','Spanish','German','Italian','Chinese','Japanese']} value={state.academics.filters.languages} onChange={(v)=> setState(s=>({ ...s, academics: { ...s.academics, filters: { ...s.academics.filters, languages: v } } }))} />
              </div>
              <div>
                <div className="mb-2 text-sm font-semibold text-slate-800 tracking-tight">Research Level</div>
                <select
                  value={state.academics.filters.researchLevel}
                  onChange={(e)=> setState(s=>({ ...s, academics: { ...s.academics, filters: { ...s.academics.filters, researchLevel: e.target.value } } }))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition focus:border-primary-400 focus:ring-2 focus:ring-primary-200"
                >
                  <option>Any</option>
                  <option>Very High</option>
                  <option>High</option>
                  <option>Medium</option>
                  <option>Teaching Focused</option>
                </select>
              </div>
              <div className="flex items-center gap-2.5 sm:col-span-2 lg:col-span-1">
                <input
                  type="checkbox"
                  checked={state.academics.filters.studyAbroad}
                  onChange={(e)=> setState(s=>({ ...s, academics: { ...s.academics, filters: { ...s.academics.filters, studyAbroad: e.target.checked } } }))}
                  className="h-5 w-5 rounded-md border border-slate-300 text-primary-600 focus:ring-primary-200"
                />
                <label className="text-sm font-medium text-slate-600">Study Abroad Available</label>
              </div>
            </div>
          </MixerModule>
        )
      case 'financials':
        return (
          <MixerModule
            title="Financials"
            isEnabled={state.financials.enabled}
            onToggle={(v) => setState(s => ({ ...s, financials: { ...s.financials, enabled: v } }))}
            icon={<PiggyBank className="h-5 w-5" />}
          >
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="sm:col-span-2 lg:col-span-1">
                <RangeSlider label="Max Budget ($)" value={state.financials.filters.maxBudget} min={0} max={150000} step={1000} onChange={(v)=> setState(s=>({ ...s, financials: { ...s.financials, filters: { ...s.financials.filters, maxBudget: v } } }))} />
              </div>
              <div className="sm:col-span-2 lg:col-span-1">
                <RangeSlider label="Max Cost of Living ($/yr)" value={state.financials.filters.maxCostOfLiving} min={0} max={50000} step={500} onChange={(v)=> setState(s=>({ ...s, financials: { ...s.financials, filters: { ...s.financials.filters, maxCostOfLiving: v } } }))} />
              </div>
              <div className="sm:col-span-2 lg:col-span-1">
                <RangeSlider label="Min Scholarship Reliance (1-5)" value={state.financials.filters.minScholarship} min={1} max={5} onChange={(v)=> setState(s=>({ ...s, financials: { ...s.financials, filters: { ...s.financials.filters, minScholarship: v } } }))} />
              </div>
              <div className="flex items-center gap-2.5 sm:col-span-2 lg:col-span-1">
                <input
                  type="checkbox"
                  checked={state.financials.filters.scholarshipsInternational}
                  onChange={(e)=> setState(s=>({ ...s, financials: { ...s.financials, filters: { ...s.financials.filters, scholarshipsInternational: e.target.checked } } }))}
                  className="h-5 w-5 rounded-md border border-slate-300 text-primary-600 focus:ring-primary-200"
                />
                <label className="text-sm font-medium text-slate-600">International Scholarships</label>
              </div>
              <div className="flex items-center gap-2.5 sm:col-span-2 lg:col-span-1">
                <input
                  type="checkbox"
                  checked={state.financials.filters.needBlind}
                  onChange={(e)=> setState(s=>({ ...s, financials: { ...s.financials, filters: { ...s.financials.filters, needBlind: e.target.checked } } }))}
                  className="h-5 w-5 rounded-md border border-slate-300 text-primary-600 focus:ring-primary-200"
                />
                <label className="text-sm font-medium text-slate-600">Need-Blind Admission</label>
              </div>
            </div>
          </MixerModule>
        )
      case 'lifestyle':
        return (
          <MixerModule
            title="Lifestyle"
            isEnabled={state.lifestyle.enabled}
            onToggle={(v) => setState(s => ({ ...s, lifestyle: { ...s.lifestyle, enabled: v } }))}
            icon={<Globe2 className="h-5 w-5" />}
          >
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="flex flex-col">
                  <div className="mb-2 text-sm font-semibold text-slate-800 tracking-tight">Country</div>
                  <select
                    value={state.lifestyle.filters.country}
                    onChange={(e)=> setState(s=>({ ...s, lifestyle: { ...s.lifestyle, filters: { ...s.lifestyle.filters, country: e.target.value } } }))}
                    className="block w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition focus:border-primary-400 focus:ring-2 focus:ring-primary-200"
                  >
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
                <div className="flex flex-col">
                  <div className="mb-2 text-sm font-semibold text-slate-800 tracking-tight">City (optional)</div>
                  <input
                    type="text"
                    value={state.lifestyle.filters.city}
                    onChange={(e)=> setState(s=>({ ...s, lifestyle: { ...s.lifestyle, filters: { ...s.lifestyle.filters, city: e.target.value } } }))}
                    className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm placeholder:text-slate-400 focus:border-primary-400 focus:ring-2 focus:ring-primary-200"
                    placeholder="Any"
                  />
                </div>
                <div className="flex flex-col">
                  <div className="mb-2 text-sm font-semibold text-slate-800 tracking-tight">Climate Zone</div>
                  <select
                    value={state.lifestyle.filters.climate}
                    onChange={(e)=> setState(s=>({ ...s, lifestyle: { ...s.lifestyle, filters: { ...s.lifestyle.filters, climate: e.target.value } } }))}
                    className="block w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition focus:border-primary-400 focus:ring-2 focus:ring-primary-200"
                  >
                    <option>Any</option>
                    <option>Continental</option>
                    <option>Temperate</option>
                    <option>Tropical</option>
                    <option>Arid</option>
                    <option>Mediterranean</option>
                  </select>
                </div>
                <div className="sm:col-span-2 lg:col-span-3">
                  <ToggleGroup label="Campus Setting" options={[{value:'Any'},{value:'Urban'},{value:'Suburban'},{value:'Rural'}]} value={state.lifestyle.filters.campusSetting} onChange={(v)=> setState(s=>({ ...s, lifestyle: { ...s.lifestyle, filters: { ...s.lifestyle.filters, campusSetting: v } } }))} />
                </div>
              </div>
            </div>
          </MixerModule>
        )
      case 'admissions':
        return (
          <MixerModule
            title="Admissions"
            isEnabled={state.admissions.enabled}
            onToggle={(v) => setState(s => ({ ...s, admissions: { ...s.admissions, enabled: v } }))}
            icon={<ClipboardList className="h-5 w-5" />}
          >
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="sm:col-span-2 lg:col-span-1">
                <RangeSlider label="Max Acceptance Rate (%)" value={state.admissions.filters.maxAcceptanceRate} min={0} max={100} step={1} onChange={(v)=> setState(s=>({ ...s, admissions: { ...s.admissions, filters: { ...s.admissions.filters, maxAcceptanceRate: v } } }))} />
              </div>
              <div>
                <div className="mb-2 text-sm font-semibold text-slate-800 tracking-tight">Test Policy</div>
                <select
                  value={state.admissions.filters.testPolicy}
                  onChange={(e)=> setState(s=>({ ...s, admissions: { ...s.admissions, filters: { ...s.admissions.filters, testPolicy: e.target.value } } }))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition focus:border-primary-400 focus:ring-2 focus:ring-primary-200"
                >
                  <option>Any</option>
                  <option>Required</option>
                  <option>Test-Optional</option>
                  <option>Test-Blind</option>
                </select>
              </div>
              <div className="sm:col-span-2 lg:col-span-1">
                <RangeSlider label="Min SAT Score" value={state.admissions.filters.minSat} min={0} max={1600} step={50} onChange={(v)=> setState(s=>({ ...s, admissions: { ...s.admissions, filters: { ...s.admissions.filters, minSat: v } } }))} />
              </div>
            </div>
          </MixerModule>
        )
      case 'demographics':
        return (
          <MixerModule
            title="Demographics"
            isEnabled={state.demographics.enabled}
            onToggle={(v) => setState(s => ({ ...s, demographics: { ...s.demographics, enabled: v } }))}
            icon={<Users className="h-5 w-5" />}
          >
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <div className="sm:col-span-2 lg:col-span-1">
                <RangeSlider label="Min Enrollment" value={state.demographics.filters.minEnrollment} min={0} max={50000} step={500} onChange={(v)=> setState(s=>({ ...s, demographics: { ...s.demographics, filters: { ...s.demographics.filters, minEnrollment: v } } }))} />
              </div>
              <div className="sm:col-span-2 lg:col-span-1">
                <RangeSlider label="Max Enrollment" value={state.demographics.filters.maxEnrollment} min={0} max={100000} step={1000} onChange={(v)=> setState(s=>({ ...s, demographics: { ...s.demographics, filters: { ...s.demographics.filters, maxEnrollment: v } } }))} />
              </div>
              <div className="sm:col-span-2 lg:col-span-1">
                <RangeSlider label="Min % International" value={state.demographics.filters.minInternationalPct} min={0} max={100} step={1} onChange={(v)=> setState(s=>({ ...s, demographics: { ...s.demographics, filters: { ...s.demographics.filters, minInternationalPct: v } } }))} />
              </div>
            </div>
          </MixerModule>
        )
      case 'future':
        return (
          <MixerModule
            title="Future Outcomes"
            isEnabled={state.future.enabled}
            onToggle={(v) => setState(s => ({ ...s, future: { ...s.future, enabled: v } }))}
            icon={<TrendingUp className="h-5 w-5" />}
          >
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <div className="sm:col-span-2 lg:col-span-1">
                <RangeSlider label="Min Post-Study Visa (months)" value={state.future.filters.minVisaMonths} min={0} max={60} step={6} onChange={(v)=> setState(s=>({ ...s, future: { ...s.future, filters: { ...s.future.filters, minVisaMonths: v } } }))} />
              </div>
              <div className="sm:col-span-2 lg:col-span-1">
                <RangeSlider label="Min Internship Support (1-5)" value={state.future.filters.minInternshipStrength} min={1} max={5} onChange={(v)=> setState(s=>({ ...s, future: { ...s.future, filters: { ...s.future.filters, minInternshipStrength: v } } }))} />
              </div>
              <div className="sm:col-span-2 lg:col-span-1">
                <RangeSlider label="Min Alumni Network (1-5)" value={state.future.filters.minAlumniStrength} min={1} max={5} onChange={(v)=> setState(s=>({ ...s, future: { ...s.future, filters: { ...s.future.filters, minAlumniStrength: v } } }))} />
              </div>
              <div className="sm:col-span-2 lg:col-span-1">
                <RangeSlider label="Min 6-Year Graduation Rate (%)" value={state.future.filters.minGraduationRate} min={0} max={100} step={1} onChange={(v)=> setState(s=>({ ...s, future: { ...s.future, filters: { ...s.future.filters, minGraduationRate: v } } }))} />
              </div>
              <div className="sm:col-span-2 lg:col-span-1">
                <RangeSlider label="Min Employment Rate (%)" value={state.future.filters.minEmploymentRate} min={0} max={100} step={1} onChange={(v)=> setState(s=>({ ...s, future: { ...s.future, filters: { ...s.future.filters, minEmploymentRate: v } } }))} />
              </div>
            </div>
          </MixerModule>
        )
      default:
        return null
    }
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="space-y-6">
        <header className="space-y-1">
          <h1 className="text-2xl font-bold text-gray-900">Your Future Mixer</h1>
          <p className="text-sm text-gray-600">Tune each criteria to surface universities that match the journey you envision.</p>
        </header>

        <section className="bg-white/80 backdrop-blur-md border border-gray-200 shadow-sm rounded-2xl overflow-hidden">
          <div className="flex flex-wrap items-center gap-2 px-4 py-3 border-b border-gray-200/70 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`group inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                    isActive ? 'bg-primary-600 text-white shadow-sm' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                  }`}
                  title={`${tab.label} — ${STATUS_LABEL[tab.status]}`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-gray-700'}`} />
                  <span>{tab.label}</span>
                  <span className="flex items-center">
                    {renderStatusIcon(tab.status)}
                  </span>
                </button>
              )
            })}
          </div>
          <div className="p-5">
            {renderTabContent(activeTab)}
          </div>
        </section>

        <section className="pb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Matching Results</h2>
              <p className="text-sm text-gray-500">{results.length} universities match your current settings.</p>
            </div>
            {flash && <div className="text-sm font-semibold text-emerald-600">{flash}</div>}
          </div>

          {results.length === 0 ? (
            <div className="border border-dashed border-gray-200 rounded-xl p-10 text-center text-gray-500">
              Adjust the criteria above to discover universities tailored to you.
            </div>
          ) : (
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {results.map((u) => (
                <UniversityCard key={u.id} university={u} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
