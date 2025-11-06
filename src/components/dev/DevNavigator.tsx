import React from 'react'
import { useNavigate } from 'react-router-dom'
import { getRegisteredRoutePaths, getVisitedPaths } from '../../devtools/routeRegistry'

type PageInfo = {
  file: string
  name: string
}

export default function DevNavigator() {
  const navigate = useNavigate()
  const [open, setOpen] = React.useState(false)
  const [connected, setConnected] = React.useState<string[]>([])
  const [pages, setPages] = React.useState<PageInfo[]>([])
  const [query, setQuery] = React.useState('')
  const [statusFilter, setStatusFilter] = React.useState<'all'|'connected'|'orphan'>('all')
  const [showOnlyRoutes, setShowOnlyRoutes] = React.useState(false)
  const [visited, setVisited] = React.useState<string[]>([])

  React.useEffect(() => {
    const interval = setInterval(() => {
      setConnected(getRegisteredRoutePaths())
      setVisited(getVisitedPaths())
    }, 500)
    return () => clearInterval(interval)
  }, [])

  React.useEffect(() => {
    const mods = import.meta.glob('/src/pages/**/*.tsx', { eager: true }) as any
    const infos: PageInfo[] = Object.keys(mods).map((file) => {
      const mod = mods[file]
      const name = (mod?.default?.name || Object.keys(mod)[0] || 'Unknown') as string
      return { file: file.replace(/^\/src\//, 'src/'), name }
    })
    setPages(infos.sort((a,b)=> a.file.localeCompare(b.file)))
  }, [])

  if (import.meta.env.PROD) return null

  const guessPath = (file: string) => {
    const base = file.split('/').pop() || ''
    const withoutExt = base.replace(/\.[tj]sx?$/, '')
    const pageAliases: Record<string, string> = {
      PublicUserProfilePage: '/u/john-doe',
      UniversityComparePage: '/compare',
    }
    if (pageAliases[withoutExt]) return pageAliases[withoutExt]
    const slug = withoutExt
      .replace(/Page$/,'')
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .toLowerCase()
    return `/${slug}`
  }

  const statusOf = (file: string) => {
    const guess = guessPath(file)
    const isConnected = connected.includes(guess) || connected.some(p => p.toLowerCase().includes(guess.replace(/^\//,'')))
    return isConnected ? 'connected' : 'orphan'
  }

  const filterText = (text: string) => text.toLowerCase().includes(query.trim().toLowerCase())
  const filteredRoutes = connected
    .filter((p) => !query || filterText(p))
    .sort((a,b)=> a.localeCompare(b))
  const filteredVisited = visited
    .filter((p) => !query || filterText(p))
    .sort((a,b)=> a.localeCompare(b))

  // Generate concrete examples for dynamic patterns
  const paramSamples: Record<string, string[]> = {
    id: ['1', '42', '123'],
    slug: ['example-slug', 'hello-world'],
    username: ['john-doe'],
    category: ['schools', 'programs', 'cs'],
  }
  const defaultSample = ['sample']
  function expandPattern(pattern: string): string[] {
    if (!pattern.includes(':')) return []
    const parts = pattern.split('/')
    const options: string[][] = parts.map(seg => {
      if (!seg.startsWith(':')) return [seg]
      const key = seg.slice(1)
      return paramSamples[key] || defaultSample
    })
    // Cartesian product
    const results: string[] = []
    const backtrack = (i: number, acc: string[]) => {
      if (i === options.length) {
        results.push(acc.join('/'))
        return
      }
      for (const choice of options[i]) backtrack(i+1, [...acc, choice])
    }
    backtrack(0, [])
    return results
  }
  const generatedPaths = connected
    .flatMap(p => expandPattern(p))
    .filter(p => p) // remove empty
    .map(p => (p.startsWith('/') ? p : `/${p}`))
    .filter((p, idx, arr) => arr.indexOf(p) === idx)
    .filter((p) => !query || filterText(p))
    .sort((a,b)=> a.localeCompare(b))
  const filteredPages = pages
    .map((pg) => ({ ...pg, status: statusOf(pg.file), guess: guessPath(pg.file) }))
    .filter((pg) => {
      if (query && !(filterText(pg.file) || filterText(pg.name) || filterText(pg.guess))) return false
      if (statusFilter !== 'all' && pg.status !== statusFilter) return false
      return true
    })
    .sort((a,b)=> a.file.localeCompare(b.file))

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        title="Dev Navigator"
        style={{ position: 'fixed', right: 16, bottom: 16, zIndex: 1000 }}
        className="rounded-full shadow-lg bg-primary-600 hover:bg-primary-700 text-white w-12 h-12 flex items-center justify-center"
      >
        ≡
      </button>
      {open && (
        <div
          style={{ position: 'fixed', right: 16, bottom: 80, zIndex: 1000, width: 'min(640px, 95vw)' }}
          className="bg-white border rounded-xl shadow-2xl overflow-hidden"
        >
          <div className="px-4 py-3 border-b">
            <div className="flex items-center justify-between gap-3">
              <div className="font-semibold text-gray-800">Dev Navigator</div>
              <button className="text-sm text-gray-500" onClick={()=> setOpen(false)}>Close</button>
            </div>
            <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-2">
              <input
                value={query}
                onChange={(e)=> setQuery(e.target.value)}
                placeholder="Search routes/pages"
                className="border rounded px-2 py-1 text-sm w-full"
              />
              <select
                value={statusFilter}
                onChange={(e)=> setStatusFilter(e.target.value as any)}
                className="border rounded px-2 py-1 text-sm w-full"
              >
                <option value="all">All (pages)</option>
                <option value="connected">Connected only</option>
                <option value="orphan">Orphans only</option>
              </select>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" checked={showOnlyRoutes} onChange={(e)=> setShowOnlyRoutes(e.target.checked)} />
                Show only Connected Routes
              </label>
            </div>
          </div>
          <div className="max-h-[75vh] overflow-auto">
            {!showOnlyRoutes && (
              <div className="px-4 py-3">
                <div className="text-xs font-semibold text-gray-600 mb-2">Connected Routes ({filteredRoutes.length})</div>
                <div className="space-y-1">
                  {filteredRoutes.length === 0 && <div className="text-xs text-gray-500">No routes match</div>}
                  {filteredRoutes.map((p) => (
                    <div key={p} className="flex items-center justify-between text-sm">
                      <button className="text-primary-600 hover:underline" onClick={()=> navigate(p)}>{p}</button>
                      <span className="text-xs text-green-600">connected</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {!showOnlyRoutes && generatedPaths.length > 0 && (
              <div className="px-4 py-3 border-t">
                <div className="text-xs font-semibold text-gray-600 mb-2">Generated Dynamic Paths ({generatedPaths.length})</div>
                <div className="space-y-1">
                  {generatedPaths.map((p) => (
                    <div key={p} className="flex items-center justify-between text-sm">
                      <button className="text-primary-600 hover:underline" onClick={()=> navigate(p)}>{p}</button>
                      <span className="text-xs text-purple-600">generated</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {!showOnlyRoutes && (
              <div className="px-4 py-3 border-t">
                <div className="text-xs font-semibold text-gray-600 mb-2">Visited Paths ({filteredVisited.length})</div>
                <div className="space-y-1">
                  {filteredVisited.length === 0 && <div className="text-xs text-gray-500">No paths visited</div>}
                  {filteredVisited.map((p) => (
                    <div key={p} className="flex items-center justify-between text-sm">
                      <button className="text-primary-600 hover:underline" onClick={()=> navigate(p)}>{p}</button>
                      <span className="text-xs text-blue-600">visited</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="px-4 py-3 border-t">
              <div className="text-xs font-semibold text-gray-600 mb-2">Discovered Pages ({filteredPages.length})</div>
              <div className="space-y-1">
                {filteredPages.length === 0 && <div className="text-xs text-gray-500">No pages match</div>}
                {filteredPages.map((pg) => (
                  <div key={pg.file} className="text-xs flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-medium text-gray-800 truncate">{pg.name}</div>
                      <div className="text-gray-500 truncate">{pg.file}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="px-2 py-1 border rounded text-xs" onClick={()=> navigate(pg.guess)}>Open</button>
                      <span className={`px-2 py-1 rounded text-white ${pg.status==='connected'?'bg-green-600':'bg-gray-500'}`}>{pg.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}


