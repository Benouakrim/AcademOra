import { useEffect, useMemo, useState } from 'react'
import MixerModule from '../components/mixer/MixerModule'
import FaderSlider from '../components/mixer/inputs/FaderSlider'
import TogglePill from '../components/mixer/inputs/TogglePill'
// DialKnob is available for future use; not used currently
import useMixerState, { defaultCriteria } from '../hooks/useMixerState'
import { matchingAPI } from '../lib/api'
import UniversityMixerCard from '../components/mixer/UniversityMixerCard'

export default function FutureMixerDashboard() {
  const { criteria, setModuleEnabled, updateFilter, reset } = useMixerState()
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  // Debounce criteria changes
  const debounced = useMemo(() => criteria, [criteria])

  useEffect(() => {
    const t = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await matchingAPI.getMatches(debounced)
        setResults(res || [])
      } catch (err) {
        console.error('Matching API error', err)
      } finally {
        setLoading(false)
      }
    }, 500)

    return () => clearTimeout(t)
  }, [debounced])

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="sticky top-0 bg-white/80 backdrop-blur-md z-20 p-3 rounded mb-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold">Your Future Mixer</h1>
        <div className="text-sm text-gray-700">{results.length} Matches Found {loading && '…'}</div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <aside className="space-y-4">
          <MixerModule title="Academics" isEnabled={criteria.academics.enabled} onToggle={(v)=> setModuleEnabled('academics', v)}>
            <div className="space-y-3">
              <FaderSlider label="Minimum GPA" value={criteria.academics.filters.minGpa || 0} min={0} max={4} step={0.1} onChange={(v)=> updateFilter('academics', 'minGpa', v)} />
              <div className="flex gap-2">
                {['Bachelors','Masters','PhD'].map(l=> <TogglePill key={l} active={(criteria.academics.filters.degreeLevels || []).includes(l)} label={l} onClick={()=> {
                  const arr = Array.from(new Set([...(criteria.academics.filters.degreeLevels||[]), l]))
                  updateFilter('academics','degreeLevels', arr)
                }} />)}
              </div>
            </div>
          </MixerModule>

          <MixerModule title="Financials" isEnabled={criteria.financials.enabled} onToggle={(v)=> setModuleEnabled('financials', v)}>
            <div className="space-y-3">
              <FaderSlider label="Max Budget" value={criteria.financials.filters.maxBudget || 0} min={0} max={100000} step={500} onChange={(v)=> updateFilter('financials','maxBudget', v)} />
              <div className="flex items-center gap-3">
                <label className="text-sm">Must offer scholarships</label>
                <input type="checkbox" checked={criteria.financials.filters.requireScholarships||false} onChange={(e)=> updateFilter('financials','requireScholarships', e.target.checked)} />
              </div>
            </div>
          </MixerModule>

          <MixerModule title="Lifestyle" isEnabled={criteria.lifestyle.enabled} onToggle={(v)=> setModuleEnabled('lifestyle', v)}>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-600">Preferred Countries</label>
                <select multiple value={criteria.lifestyle.filters.countries || []} onChange={(e)=> {
                  const opts = Array.from(e.target.selectedOptions).map(o=> o.value)
                  updateFilter('lifestyle','countries', opts)
                }} className="mt-1 block w-full rounded-md border-gray-200">
                  <option>United States</option>
                  <option>Canada</option>
                  <option>United Kingdom</option>
                  <option>Australia</option>
                </select>
              </div>
              <div className="flex gap-2">
                {['Urban','Suburban','Rural','Any'].map(s=> <TogglePill key={s} active={(criteria.lifestyle.filters.settings||[]).includes(s)} label={s} onClick={()=> {
                  const arr = Array.from(new Set([...(criteria.lifestyle.filters.settings||[]), s]))
                  updateFilter('lifestyle','settings', arr)
                }} />)}
              </div>
            </div>
          </MixerModule>

          <MixerModule title="Future Goals" isEnabled={criteria.future.enabled} onToggle={(v)=> setModuleEnabled('future', v)}>
            <div className="space-y-3">
              <FaderSlider label="Min. Visa Months" value={criteria.future.filters.minVisaMonths || 0} min={0} max={36} step={1} onChange={(v)=> updateFilter('future','minVisaMonths', v)} />
            </div>
          </MixerModule>

          <div className="hidden md:block">
            <button className="btn-outline w-full" onClick={()=> reset(defaultCriteria)}>Reset</button>
          </div>
        </aside>

        <main>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {results.map(u => <UniversityMixerCard key={u.id} university={u} />)}
          </div>
        </main>
      </div>

      {/* Mobile bottom sheet */}
      <div className="fixed bottom-0 left-0 right-0 p-3 bg-white/90 backdrop-blur-md border-t md:hidden">
        <div className="flex items-center justify-between">
          <div className="text-sm">Mixer</div>
          <div className="text-sm text-gray-700">{results.length} matches</div>
        </div>
      </div>
    </div>
  )
}
