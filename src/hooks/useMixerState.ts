import { useCallback, useState } from 'react'
import type { MixerCriteria } from '../types/database'

const defaultCriteria: MixerCriteria = {
  academics: { enabled: true, filters: { minGpa: undefined, testPolicy: undefined, degreeLevels: [] } },
  financials: { enabled: true, filters: { maxBudget: undefined, requireScholarships: false } },
  lifestyle: { enabled: true, filters: { countries: [], settings: [], climates: [] } },
  future: { enabled: true, filters: { minVisaMonths: undefined, minSalary: undefined } },
  interests: [],
}

type ModuleKey = keyof MixerCriteria

export default function useMixerState(initial?: Partial<MixerCriteria>) {
  const [criteria, setCriteria] = useState<MixerCriteria>({ ...defaultCriteria, ...(initial as any) })

  const setModuleEnabled = useCallback((module: ModuleKey, enabled: boolean) => {
    setCriteria((c) => ({ ...c, [module]: { ...((c as any)[module] as any), enabled } } as MixerCriteria))
  }, [])

  const setModuleFilters = useCallback((module: ModuleKey, filters: Partial<any>) => {
    setCriteria((c) => ({ ...c, [module]: { ...((c as any)[module] as any), filters: { ...(((c as any)[module] as any).filters || {}), ...filters } } } as MixerCriteria))
  }, [])

  const updateFilter = useCallback((module: ModuleKey, key: string, value: any) => {
    setCriteria((c) => {
      const mod = (c as any)[module] || { enabled: false, filters: {} }
      return { ...c, [module]: { ...mod, filters: { ...(mod.filters || {}), [key]: value } } } as MixerCriteria
    })
  }, [])

  const toggleModule = useCallback((module: ModuleKey) => {
    setCriteria((c) => {
      const mod = (c as any)[module]
      return { ...c, [module]: { ...mod, enabled: !mod.enabled } } as MixerCriteria
    })
  }, [])

  const reset = useCallback((next?: Partial<MixerCriteria>) => {
    setCriteria({ ...defaultCriteria, ...(next as any) })
  }, [])

  return {
    criteria,
    setCriteria,
    setModuleEnabled,
    setModuleFilters,
    updateFilter,
    toggleModule,
    reset,
  }
}

export { defaultCriteria }
