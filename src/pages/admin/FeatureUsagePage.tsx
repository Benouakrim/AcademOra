import { useCallback, useEffect, useMemo, useState } from 'react'
import { adminAPI } from '../../lib/api'

type UsageRow = {
  user_id: string
  email?: string | null
  full_name?: string | null
  plan_key: string | null
  feature_key: string
  feature_name: string
  usage_count: number
  access_level: 'count' | 'unlimited' | null
  limit_value: number | null
  remaining: number | null
  configured: boolean
  source: 'plan' | 'override' | null
  override?: {
    access_level: 'count' | 'unlimited'
    limit_value: number | null
  } | null
}

const formatLimit = (row: UsageRow) => {
  if (!row.configured) return 'Not configured'
  if (row.access_level === 'unlimited') return 'Unlimited'
  const value = row.override ? row.override.limit_value : row.limit_value
  if (value === null || value === undefined) return '—'
  return `${value} uses`
}

export default function FeatureUsagePage() {
  const [rows, setRows] = useState<UsageRow[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userQuery, setUserQuery] = useState('')
  const [featureQuery, setFeatureQuery] = useState('')
  const [activeUserFilter, setActiveUserFilter] = useState('')
  const [activeFeatureFilter, setActiveFeatureFilter] = useState('')
  const [refreshNonce, setRefreshNonce] = useState(0)

  const fetchUsage = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await adminAPI.getFeatureUsage({
        userId: activeUserFilter || undefined,
        featureKey: activeFeatureFilter || undefined,
      })
      setRows(Array.isArray(data) ? data : [])
    } catch (err: any) {
      console.error('Failed to load feature usage:', err)
      setError(err?.message || 'Failed to load feature usage.')
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [activeUserFilter, activeFeatureFilter])

  useEffect(() => {
    fetchUsage()
  }, [fetchUsage, refreshNonce])

  const handleApplyFilters = (event: React.FormEvent) => {
    event.preventDefault()
    setActiveUserFilter(userQuery.trim())
    setActiveFeatureFilter(featureQuery.trim())
  }

  const handleResetUsage = async (row: UsageRow) => {
    if (!window.confirm(`Reset usage for ${row.email || row.user_id} on ${row.feature_key}?`)) {
      return
    }
    try {
      await adminAPI.resetFeatureUsage({
        user_id: row.user_id,
        feature_key: row.feature_key,
      })
      setRefreshNonce((value) => value + 1)
    } catch (err: any) {
      alert(err?.message || 'Failed to reset usage.')
    }
  }

  const handleSetOverride = async (row: UsageRow) => {
    const current = row.override?.limit_value ?? row.limit_value ?? ''
    const input = window.prompt(
      `Enter a new limit for ${row.feature_key} (${row.email || row.user_id}). Type "unlimited" for unlimited access.`,
      current === null ? '' : String(current),
    )
    if (input === null) return

    const trimmed = input.trim()
    let access_level: 'count' | 'unlimited' = 'count'
    let limit_value: number | null = row.limit_value ?? 0

    if (trimmed === '') {
      alert('Please provide a value.')
      return
    }

    if (trimmed.toLowerCase() === 'unlimited') {
      access_level = 'unlimited'
      limit_value = 0
    } else {
      const parsed = Number(trimmed)
      if (!Number.isFinite(parsed) || parsed < 0) {
        alert('Please enter a non-negative number or "unlimited".')
        return
      }
      access_level = 'count'
      limit_value = Math.floor(parsed)
    }

    try {
      await adminAPI.setFeatureOverride({
        user_id: row.user_id,
        feature_key: row.feature_key,
        access_level,
        limit_value,
      })
      setRefreshNonce((value) => value + 1)
    } catch (err: any) {
      alert(err?.message || 'Failed to save override.')
    }
  }

  const handleClearOverride = async (row: UsageRow) => {
    if (!row.override) return
    if (!window.confirm(`Remove override for ${row.email || row.user_id} on ${row.feature_key}?`)) {
      return
    }
    try {
      await adminAPI.deleteFeatureOverride({
        user_id: row.user_id,
        feature_key: row.feature_key,
      })
      setRefreshNonce((value) => value + 1)
    } catch (err: any) {
      alert(err?.message || 'Failed to remove override.')
    }
  }

  const uniqueUsers = useMemo(() => {
    const map = new Map<string, { label: string; id: string }>()
    rows.forEach((row) => {
      const label = row.email || row.full_name || row.user_id
      if (!map.has(row.user_id)) {
        map.set(row.user_id, { label: label || row.user_id, id: row.user_id })
      }
    })
    return Array.from(map.values()).sort((a, b) => a.label.localeCompare(b.label))
  }, [rows])

  const uniqueFeatures = useMemo(() => {
    const set = new Set<string>()
    rows.forEach((row) => set.add(row.feature_key))
    return Array.from(set).sort()
  }, [rows])

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Feature Usage</h1>
          <p className="text-sm text-gray-500">
            Track feature consumption and manage overrides for individual users.
          </p>
        </div>
        <button
          onClick={() => setRefreshNonce((value) => value + 1)}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
          Refresh
        </button>
      </div>

      <form
        onSubmit={handleApplyFilters}
        className="grid gap-4 rounded-xl border border-gray-200 bg-white p-4 md:grid-cols-4"
      >
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500">
            User ID or Email
          </label>
          <input
            type="text"
            value={userQuery}
            onChange={(e) => setUserQuery(e.target.value)}
            placeholder="e.g., user@example.com or UUID"
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500">
            Feature Key
          </label>
          <input
            type="text"
            value={featureQuery}
            onChange={(e) => setFeatureQuery(e.target.value)}
            placeholder="e.g., matching-engine"
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>
        <div className="flex items-end gap-2">
          <button
            type="submit"
            className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Apply Filters
          </button>
          <button
            type="button"
            onClick={() => {
              setUserQuery('')
              setFeatureQuery('')
              setActiveUserFilter('')
              setActiveFeatureFilter('')
            }}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"
          >
            Clear
          </button>
        </div>
      </form>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
          <div>
            <h2 className="text-sm font-semibold text-gray-700">Usage Overview</h2>
            <p className="text-xs text-gray-400">
              {rows.length} rows • {uniqueUsers.length} users • {uniqueFeatures.length} features
            </p>
          </div>
          {loading && <span className="text-xs text-gray-500">Loading…</span>}
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left font-semibold text-gray-600">User</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-600">Feature</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-600">Usage</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-600">Limit</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-600">Remaining</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-600">Source</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.length === 0 && !loading && (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-sm text-gray-500">
                    No records found for the selected filters.
                  </td>
                </tr>
              )}
              {rows.map((row) => (
                <tr key={`${row.user_id}-${row.feature_key}`} className="hover:bg-gray-50">
                  <td className="px-4 py-3 align-top">
                    <div className="font-semibold text-gray-800">{row.email || row.full_name || 'Unnamed User'}</div>
                    <div className="text-xs text-gray-500 break-all">{row.user_id}</div>
                    <div className="mt-1 text-xs text-gray-400">Plan: {row.plan_key || 'n/a'}</div>
                  </td>
                  <td className="px-4 py-3 align-top">
                    <div className="font-semibold text-gray-800">{row.feature_name}</div>
                    <div className="text-xs text-gray-500">{row.feature_key}</div>
                  </td>
                  <td className="px-4 py-3 align-top">
                    <div className="font-semibold text-gray-800">{row.usage_count}</div>
                    <div className="text-xs text-gray-500">actions logged</div>
                  </td>
                  <td className="px-4 py-3 align-top">
                    <div className="font-semibold text-gray-800">{formatLimit(row)}</div>
                    {row.override && (
                      <div className="text-xs text-blue-600">Override active</div>
                    )}
                    {!row.configured && (
                      <div className="text-xs text-amber-600">Needs configuration</div>
                    )}
                  </td>
                  <td className="px-4 py-3 align-top">
                    {row.access_level === 'unlimited' ? (
                      <span className="text-sm text-gray-500">∞</span>
                    ) : (
                      <span className="font-semibold text-gray-800">
                        {row.remaining !== null ? row.remaining : '—'}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 align-top">
                    <span className="text-xs uppercase tracking-wide text-gray-500">
                      {row.source ?? 'n/a'}
                    </span>
                  </td>
                  <td className="px-4 py-3 align-top">
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => handleResetUsage(row)}
                        className="rounded-lg border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-100"
                      >
                        Reset Usage
                      </button>
                      <button
                        onClick={() => handleSetOverride(row)}
                        className="rounded-lg border border-blue-200 px-3 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-50"
                      >
                        Set Override
                      </button>
                      {row.override && (
                        <button
                          onClick={() => handleClearOverride(row)}
                          className="rounded-lg border border-red-200 px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-50"
                        >
                          Clear Override
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

