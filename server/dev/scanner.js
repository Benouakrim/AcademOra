import fs from 'fs'
import path from 'path'
import supabase from '../database/supabase.js'

function safeStat(p){ try { return fs.statSync(p) } catch { return null } }

function listFilesRecursive(dir, exts = ['.tsx','.ts','.jsx','.js']){
  const out = []
  const st = safeStat(dir); if (!st || !st.isDirectory()) return out
  const stack = [dir]
  while (stack.length){
    const d = stack.pop()
    const items = fs.readdirSync(d)
    for (const name of items){
      const full = path.join(d, name)
      const s = safeStat(full); if (!s) continue
      if (s.isDirectory()) stack.push(full)
      else if (exts.includes(path.extname(full))) out.push(full.replace(/\\/g,'/'))
    }
  }
  return out
}

export async function runDevScan(){
  const projectRoot = path.join(process.cwd(), '..')
  const pagesDir = path.join(projectRoot, 'src', 'pages')
  const componentsDir = path.join(projectRoot, 'src', 'components')
  const srcDir = path.join(projectRoot, 'src')
  const serverRoutesDir = path.join(process.cwd(), 'routes')

  const pageFiles = listFilesRecursive(pagesDir)
  const componentFiles = listFilesRecursive(componentsDir)
  const srcFiles = listFilesRecursive(srcDir)
  const routeFiles = listFilesRecursive(serverRoutesDir)

  function readText(f){ try { return fs.readFileSync(f, 'utf-8') } catch { return '' } }
  // Extract frontend route patterns from code (<Route path="..."> and track("..."))
  const routeRegexes = [
    /path\s*=\s*\{?track\(\s*(["'`][^"'`]+["'`])\s*\)\}?/g,
    /path\s*=\s*(["'`][^"'`]+["'`])/g,
  ]
  const frontendPatternsSet = new Set()
  for (const f of srcFiles){
    const txt = readText(f)
    for (const re of routeRegexes){
      let m
      while ((m = re.exec(txt))){
        const raw = m[1]
        const val = String(raw).slice(1, -1)
        if (val) frontendPatternsSet.add(val)
      }
    }
  }
  const frontendPatterns = Array.from(frontendPatternsSet).filter(p => p.startsWith('/'))

  // Extract backend express routes
  const beRe = /router\.(get|post|put|delete|patch)\(\s*(["'`][^"'`]+["'`])/g
  const backendPatternsSet = new Set()
  for (const f of routeFiles){
    const txt = readText(f)
    let m
    while ((m = beRe.exec(txt))){
      const raw = m[2]
      const val = String(raw).slice(1, -1)
      if (val) backendPatternsSet.add(val)
    }
  }
  const backendPatterns = Array.from(backendPatternsSet)

  // DB fetches (best-effort)
  let users = [], articles = [], universities = [], pages = [], groups = [], orientationResources = [], orientationCategories = [], tags = [], categories = []
  try {
    const ur = await supabase.from('users').select('id, username, email, full_name').limit(500)
    users = ur.data || []
  } catch {}
  try {
    const ar = await supabase.from('articles').select('id, slug, title, published, content').limit(1000)
    articles = (ar.data || []).map(a => ({ id: a.id, slug: a.slug, title: a.title, published: a.published, _content: typeof a.content === 'string' ? a.content : null }))
  } catch {}
  try {
    const uni = await supabase.from('universities').select('id, slug, name').limit(1000)
    universities = uni.data || []
  } catch {}
  try {
    const sp = await supabase.from('static_pages').select('slug, title, status').limit(1000)
    pages = sp.data || []
  } catch {}
  try {
    const gr = await supabase.from('university_groups').select('id, slug, name').limit(1000)
    groups = gr.data || []
  } catch {}
  try {
    const oc = await supabase.from('orientation_categories').select('id, slug, title').limit(1000)
    orientationCategories = oc.data || []
  } catch {}
  try {
    const orr = await supabase.from('orientation_resources').select('id, category, slug, title').limit(2000)
    orientationResources = orr.data || []
  } catch {}
  try {
    const tg = await supabase.from('tags').select('id, name, slug').limit(1000)
    tags = tg.data || []
  } catch {}
  try {
    const cg = await supabase.from('categories').select('id, name, slug').limit(1000)
    categories = cg.data || []
  } catch {}

  const now = new Date().toISOString()
  const result = {
    generatedAt: now,
    projectRoot,
    files: {
      pages: pageFiles,
      components: componentFiles,
      src: srcFiles,
      serverRoutes: routeFiles,
    },
    data: {
      users,
      articles,
      universities,
      staticPages: pages,
      universityGroups: groups,
      orientationCategories,
      orientationResources,
      tags,
      categories,
    },
    derived: {
      userPaths: users.filter(u=>u.username).map(u=>`/u/${u.username}`),
      articlePaths: articles.filter(a=>a.slug).map(a=>`/blog/${a.slug}`),
      universityPaths: universities.filter(u=>u.slug).map(u=>`/universities/${u.slug}`),
      staticPagePaths: pages.filter(p=>p.slug).map(p=>`/${p.slug}`),
      groupPaths: groups.filter(g=>g.slug).map(g=>`/university-groups/${g.slug}`),
      orientationCategoryPaths: orientationCategories.filter(c=>c.slug).map(c=>`/orientation/${c.slug}`),
      orientationResourcePaths: orientationResources.filter(r=>r.category && r.slug).map(r=>`/orientation/${r.category}/${r.slug}`),
      articleMeta: articles.map(a => ({ slug: a.slug, title: a.title, published: a.published, hasContent: !!(a._content && a._content.length > 10) })),
      frontendRoutePatterns: frontendPatterns,
      backendRoutePatterns: backendPatterns,
    }
  }

  // Persist snapshot
  const outDir = path.join(process.cwd(), 'tmp')
  if (!safeStat(outDir)) fs.mkdirSync(outDir, { recursive: true })
  const outFile = path.join(outDir, 'dev-scan.json')
  fs.writeFileSync(outFile, JSON.stringify(result, null, 2), 'utf-8')
  return result
}


