import express from 'express'
import fs from 'fs'
import path from 'path'
import { runDevScan } from '../dev/scanner.js'

const router = express.Router()

router.get('/scan', async (req, res) => {
  try {
    const data = await runDevScan()
    res.json(data)
  } catch (e) {
    console.error('dev scan error', e)
    res.status(500).json({ error: e?.message || 'scan failed' })
  }
})

router.get('/scan.json', (req, res) => {
  try {
    const f = path.join(process.cwd(), 'tmp', 'dev-scan.json')
    if (!fs.existsSync(f)) return res.status(404).json({ error: 'no scan snapshot' })
    const data = JSON.parse(fs.readFileSync(f, 'utf-8'))
    res.json(data)
  } catch (e) {
    res.status(500).json({ error: e?.message || 'read failed' })
  }
})

export default router


