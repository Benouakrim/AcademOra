import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

type Scan = {
  generatedAt: string
  files: { pages: string[]; components: string[]; src: string[]; serverRoutes: string[] }
  data: { users: any[]; articles: any[]; universities: any[]; staticPages: any[]; universityGroups: any[]; orientationCategories: any[]; orientationResources: any[]; tags: any[]; categories: any[] }
  derived: { userPaths: string[]; articlePaths: string[]; universityPaths: string[]; staticPagePaths: string[]; groupPaths: string[]; orientationCategoryPaths: string[]; orientationResourcePaths: string[]; frontendRoutePatterns: string[]; backendRoutePatterns: string[] }
}

export default function DevDashboard(){
  const [scan, setScan] = useState<Scan | null>(null)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<'routes'|'frontend'|'backend'|'users'|'articles'|'universities'|'groups'|'orientation'|'pages'|'files'>('routes')

  async function refresh(){
    try {
      const res = await fetch((import.meta as any).env?.VITE_API_URL?.replace(/\/$/, '') + '/dev/scan')
      const json = await res.json()
      setScan(json)
    } catch {}
  }

  useEffect(() => {
    refresh()
    const t = setInterval(refresh, 10000)
    return () => clearInterval(t)
  }, [])

  const routes = useMemo(() => {
    if (!scan) return []
    const all = [
      ...scan.derived.userPaths,
      ...scan.derived.articlePaths,
      ...scan.derived.universityPaths,
      ...scan.derived.staticPagePaths,
      ...scan.derived.groupPaths,
      ...scan.derived.orientationCategoryPaths,
      ...scan.derived.orientationResourcePaths,
    ]
      .filter(Boolean)
      .filter((v, i, a) => a.indexOf(v) === i)
      .sort((a,b)=> a.localeCompare(b))
    return !query ? all : all.filter(p => p.toLowerCase().includes(query.toLowerCase()))
  }, [scan, query])

  const files = useMemo(() => {
    if (!scan) return []
    const all = [...scan.files.pages, ...scan.files.components, ...scan.files.src, ...scan.files.serverRoutes]
    return !query ? all : all.filter(f => f.toLowerCase().includes(query.toLowerCase()))
  }, [scan, query])
  const groups = useMemo(() => scan ? scan.data.universityGroups : [], [scan])
  const orientationCats = useMemo(() => scan ? scan.data.orientationCategories : [], [scan])
  const orientationRes = useMemo(() => scan ? scan.data.orientationResources : [], [scan])
  const fePatterns = useMemo(() => scan ? scan.derived.frontendRoutePatterns.filter(p => !query || p.toLowerCase().includes(query.toLowerCase())).sort((a,b)=> a.localeCompare(b)) : [], [scan, query])
  const bePatterns = useMemo(() => scan ? scan.derived.backendRoutePatterns.filter(p => !query || p.toLowerCase().includes(query.toLowerCase())).sort((a,b)=> a.localeCompare(b)) : [], [scan, query])

  const users = useMemo(() => {
    if (!scan) return []
    const all = scan.data.users
    return !query ? all : all.filter(u => (u.username||'').includes(query) || (u.email||'').includes(query))
  }, [scan, query])

  const articlesMeta = useMemo(() => {
    if (!scan) return []
    const all = (scan.derived as any).articleMeta || []
    return !query ? all : all.filter((a:any) => (a.slug||'').includes(query) || (a.title||'').toLowerCase().includes(query.toLowerCase()))
  }, [scan, query])

  const universities = useMemo(() => {
    if (!scan) return []
    const all = scan.data.universities
    return !query ? all : all.filter(u => (u.slug||'').includes(query) || (u.name||'').toLowerCase().includes(query.toLowerCase()))
  }, [scan, query])

  const staticPages = useMemo(() => {
    if (!scan) return []
    const all = scan.data.staticPages
    return !query ? all : all.filter(p => (p.slug||'').includes(query) || (p.title||'').toLowerCase().includes(query.toLowerCase()))
  }, [scan, query])

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dev Dashboard</h1>
        <div className="text-xs text-gray-500">{scan ? `Generated: ${new Date(scan.generatedAt).toLocaleString()}` : 'Loading...'}</div>
      </div>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-3">
        <input className="border rounded px-3 py-2 text-sm" placeholder="Search" value={query} onChange={(e)=> setQuery(e.target.value)} />
        <select className="border rounded px-3 py-2 text-sm" value={category} onChange={(e)=> setCategory(e.target.value as any)}>
          <option value="routes">Routes (DB-derived)</option>
          <option value="frontend">Frontend Route Patterns</option>
          <option value="backend">Backend Route Patterns</option>
          <option value="users">Users</option>
          <option value="articles">Articles</option>
          <option value="universities">Universities</option>
          <option value="groups">University Groups</option>
          <option value="orientation">Orientation</option>
          <option value="pages">Static Pages</option>
          <option value="files">Files</option>
        </select>
        <button className="px-3 py-2 border rounded text-sm" onClick={refresh}>Refresh</button>
        <Link to="/" className="px-3 py-2 border rounded text-sm text-primary-600">Home</Link>
      </div>

      <div className="mt-6 bg-white border rounded-lg p-4 max-h-[70vh] overflow-auto">
        {!scan ? (
          <div className="text-gray-500 text-sm">Scanning...</div>
        ) : category === 'routes' ? (
          <div className="space-y-2">
            {routes.map((r) => (
              <div key={r} className="flex items-center justify-between">
                <Link to={r} className="text-sm text-primary-600 hover:underline">{r}</Link>
                <span className="text-xs text-gray-500">route</span>
              </div>
            ))}
            {routes.length === 0 && <div className="text-sm text-gray-500">No routes found</div>}
          </div>
        ) : category === 'frontend' ? (
          <div className="space-y-1">
            {fePatterns.map((p) => (
              <div key={p} className="text-sm text-gray-800">{p}</div>
            ))}
            {fePatterns.length === 0 && <div className="text-sm text-gray-500">No frontend patterns</div>}
          </div>
        ) : category === 'backend' ? (
          <div className="space-y-1">
            {bePatterns.map((p) => (
              <div key={p} className="text-sm text-gray-800">{p}</div>
            ))}
            {bePatterns.length === 0 && <div className="text-sm text-gray-500">No backend patterns</div>}
          </div>
        ) : category === 'users' ? (
          <div className="space-y-2">
            {users.map((u:any) => (
              <div key={u.id} className="flex items-center justify-between">
                <div className="text-sm">{u.full_name || u.email} <span className="text-gray-500">@{u.username}</span></div>
                <Link to={`/u/${u.username}`} className="text-xs text-primary-600">Open</Link>
              </div>
            ))}
            {users.length === 0 && <div className="text-sm text-gray-500">No users</div>}
          </div>
        ) : category === 'articles' ? (
          <div className="space-y-1">
            <div className="grid grid-cols-12 text-xs font-semibold text-gray-600">
              <div className="col-span-6 px-2 py-1">Title</div>
              <div className="col-span-3 px-2 py-1">Slug</div>
              <div className="col-span-1 px-2 py-1">Published</div>
              <div className="col-span-1 px-2 py-1">Content</div>
              <div className="col-span-1 px-2 py-1"></div>
            </div>
            {articlesMeta.map((a:any) => (
              <div key={a.slug} className="grid grid-cols-12 items-center text-sm">
                <div className="col-span-6 px-2 py-1 truncate">{a.title || a.slug}</div>
                <div className="col-span-3 px-2 py-1 text-xs text-gray-600 truncate">{a.slug}</div>
                <div className="col-span-1 px-2 py-1 text-xs">
                  <span className={`px-2 py-0.5 rounded ${a.published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{a.published ? 'yes' : 'no'}</span>
                </div>
                <div className="col-span-1 px-2 py-1 text-xs">
                  <span className={`px-2 py-0.5 rounded ${a.hasContent ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{a.hasContent ? 'yes' : 'no'}</span>
                </div>
                <div className="col-span-1 px-2 py-1 text-right">
                  <Link to={`/blog/${a.slug}`} className="text-xs text-primary-600">Open</Link>
                </div>
              </div>
            ))}
            {articlesMeta.length === 0 && <div className="text-sm text-gray-500">No articles</div>}
          </div>
        ) : category === 'universities' ? (
          <div className="space-y-2">
            {universities.map((u:any) => (
              <div key={u.id} className="flex items-center justify-between">
                <div className="text-sm">{u.name || u.slug}</div>
                <Link to={`/universities/${u.slug}`} className="text-xs text-primary-600">Open</Link>
              </div>
            ))}
            {universities.length === 0 && <div className="text-sm text-gray-500">No universities</div>}
          </div>
        ) : category === 'groups' ? (
          <div className="space-y-2">
            {groups.map((g:any) => (
              <div key={g.id} className="flex items-center justify-between">
                <div className="text-sm">{g.name || g.slug}</div>
                <Link to={`/university-groups/${g.slug}`} className="text-xs text-primary-600">Open</Link>
              </div>
            ))}
            {groups.length === 0 && <div className="text-sm text-gray-500">No groups</div>}
          </div>
        ) : category === 'orientation' ? (
          <div className="space-y-4">
            <div>
              <div className="text-xs font-semibold text-gray-600 mb-1">Categories</div>
              <div className="space-y-1">
                {orientationCats.map((c:any) => (
                  <div key={c.id} className="flex items-center justify-between">
                    <div className="text-sm">{c.title || c.slug}</div>
                    <Link to={`/orientation/${c.slug}`} className="text-xs text-primary-600">Open</Link>
                  </div>
                ))}
                {orientationCats.length === 0 && <div className="text-sm text-gray-500">No categories</div>}
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold text-gray-600 mb-1">Resources</div>
              <div className="space-y-1">
                {orientationRes.map((r:any) => (
                  <div key={r.id} className="flex items-center justify-between">
                    <div className="text-sm">{r.title || r.slug}</div>
                    <Link to={`/orientation/${r.category}/${r.slug}`} className="text-xs text-primary-600">Open</Link>
                  </div>
                ))}
                {orientationRes.length === 0 && <div className="text-sm text-gray-500">No resources</div>}
              </div>
            </div>
          </div>
        ) : category === 'pages' ? (
          <div className="space-y-2">
            {staticPages.map((p:any, idx:number) => (
              <div key={`${p.slug}-${idx}`} className="flex items-center justify-between">
                <div className="text-sm">{p.title || p.slug}</div>
                <Link to={`/${p.slug}`} className="text-xs text-primary-600">Open</Link>
              </div>
            ))}
            {staticPages.length === 0 && <div className="text-sm text-gray-500">No static pages</div>}
          </div>
        ) : (
          <div className="space-y-1">
            {files.map((f) => (
              <div key={f} className="text-xs text-gray-800">{f}</div>
            ))}
            {files.length === 0 && <div className="text-sm text-gray-500">No files</div>}
          </div>
        )}
      </div>
    </div>
  )
}


