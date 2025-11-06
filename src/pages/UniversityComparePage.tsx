import { useEffect, useMemo, useState } from 'react'
import { universitiesAPI } from '../lib/api'

type University = any

export default function UniversityComparePage() {
  const [all, setAll] = useState<University[]>([])
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<University[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        setLoading(true)
        const list = await universitiesAPI.getUniversities()
        if (!mounted) return
        setAll(Array.isArray(list) ? list : [])
      } finally {
        setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return all
    return all.filter((u) => (u.name || '').toLowerCase().includes(q) || (u.country || '').toLowerCase().includes(q))
  }, [all, query])

  const canAdd = selected.length < 3

  const add = (u: University) => {
    if (!canAdd) return
    if (selected.find((x) => x.id === u.id)) return
    setSelected((s) => [...s, u])
  }
  const remove = (id: string) => setSelected((s) => s.filter((x) => x.id !== id))

  const fields = [
    { key: 'avg_tuition_per_year', label: 'Tuition (avg/yr)', fmt: (v: any) => (typeof v === 'number' ? `$${(v/1000).toFixed(0)}k` : '—') },
    { key: 'ranking_global', label: 'Global Ranking', fmt: (v: any) => (v ?? '—') },
    { key: 'acceptance_rate', label: 'Acceptance Rate', fmt: (v: any) => (typeof v === 'number' ? `${v}%` : '—') },
    { key: 'country', label: 'Country', fmt: (v: any) => v || '—' },
    { key: 'city', label: 'City', fmt: (v: any) => v || '—' },
    { key: 'campus_setting', label: 'Campus', fmt: (v: any) => v || '—' },
    { key: 'post_grad_visa_strength', label: 'Post-study Visa (months)', fmt: (v: any) => v ?? '—' },
  ]

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Compare Universities</h1>
        <div className="text-sm text-gray-500">Select up to 3</div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[360px_1fr]">
        <div>
          <div className="bg-white border rounded-lg p-4 shadow-sm">
            <input
              className="w-full border rounded-md px-3 py-2 text-sm"
              placeholder="Search by name or country"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <div className="text-xs text-gray-500 mt-2">{loading ? 'Loading…' : `${filtered.length} results`}</div>
            <div className="max-h-80 overflow-auto divide-y mt-2">
              {filtered.slice(0, 100).map((u) => (
                <button
                  key={u.id}
                  onClick={() => add(u)}
                  disabled={!canAdd}
                  className="w-full text-left px-2 py-2 hover:bg-gray-50 disabled:opacity-50"
                >
                  <div className="font-medium text-sm text-gray-900 truncate">{u.name}</div>
                  <div className="text-xs text-gray-500">{u.country}{u.city ? ` • ${u.city}` : ''}</div>
                </button>
              ))}
            </div>
          </div>

          {selected.length > 0 && (
            <div className="mt-4 bg-white border rounded-lg p-3">
              <div className="text-sm font-semibold mb-2">Selected</div>
              <div className="flex flex-wrap gap-2">
                {selected.map((s) => (
                  <span key={s.id} className="text-xs px-2 py-1 rounded-full border">
                    {s.name}
                    <button className="ml-2 text-red-600" onClick={() => remove(s.id)}>×</button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="bg-white border rounded-lg shadow-sm overflow-x-auto">
          {selected.length === 0 ? (
            <div className="p-8 text-gray-500 text-sm">Select universities to compare</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left p-3 w-56">Metric</th>
                  {selected.map((u) => (
                    <th key={u.id} className="text-left p-3 min-w-56">
                      <div className="font-semibold text-gray-900 truncate">{u.name}</div>
                      <div className="text-xs text-gray-500">{u.country}{u.city ? ` • ${u.city}` : ''}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {fields.map((f) => (
                  <tr key={f.key} className="border-b last:border-0">
                    <td className="p-3 font-medium text-gray-700 bg-gray-50 sticky left-0">{f.label}</td>
                    {selected.map((u) => (
                      <td key={u.id} className="p-3">
                        {f.fmt((u as any)[f.key])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}


