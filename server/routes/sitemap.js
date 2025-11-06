import express from 'express'
import supabase from '../database/supabase.js'

const router = express.Router()

function xmlEscape(s){
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
}

router.get('/sitemap.xml', async (req, res) => {
  try {
    const base = (process.env.PUBLIC_BASE_URL || '').replace(/\/$/, '') || 'http://localhost:5173'
    const urls = new Set([
      '/', '/blog', '/orientation', '/compare', '/contact', '/about'
    ])

    try {
      const { data } = await supabase.from('articles').select('slug, updated_at, published').eq('published', true).limit(5000)
      for (const a of data || []) urls.add(`/blog/${a.slug}`)
    } catch {}
    try {
      const { data } = await supabase.from('users').select('username, updated_at').limit(5000)
      for (const u of data || []) if (u.username) urls.add(`/u/${u.username}`)
    } catch {}
    try {
      const { data } = await supabase.from('universities').select('slug, updated_at').limit(5000)
      for (const u of data || []) if (u.slug) urls.add(`/universities/${u.slug}`)
    } catch {}

    const body = `<?xml version="1.0" encoding="UTF-8"?>\n` +
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">` +
      Array.from(urls).map(u => `\n  <url><loc>${xmlEscape(base + u)}</loc></url>`).join('') +
      `\n</urlset>`

    res.set('Content-Type', 'application/xml')
    res.send(body)
  } catch (e) {
    res.status(500).send('')
  }
})

export default router


