import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Palette, MoonStar, Sun, Save, ArrowLeft, CheckCircle } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import { Link } from 'react-router-dom'

// Define theme palette metadata
const THEME_PALETTES = {
  slate: {
    name: 'Slate',
    description: 'Professional gray tones with subtle blue accents',
    preview: ['#64748b', '#475569', '#334155'],
  },
  ocean: {
    name: 'Ocean',
    description: 'Calming blues and teals for extended reading',
    preview: ['#0ea5e9', '#06b6d4', '#3b82f6'],
  },
  forest: {
    name: 'Forest',
    description: 'Natural greens easy on the eyes',
    preview: ['#10b981', '#059669', '#047857'],
  },
  lavender: {
    name: 'Lavender',
    description: 'Soft purples for a premium, gentle feel',
    preview: ['#a78bfa', '#8b5cf6', '#7c3aed'],
  },
  amber: {
    name: 'Amber',
    description: 'Warm oranges and golds for a cozy atmosphere',
    preview: ['#f59e0b', '#d97706', '#b45309'],
  },
}

export default function ThemeSettingsPage() {
  // Attempt to use ThemeContext hook
  const themeApi = useTheme()

  const [theme, setTheme] = useState<string>('slate')
  const [mode, setMode] = useState<'dark' | 'light'>('dark')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    // hydrate from document/body classes or localStorage
    setTheme(themeApi.theme)
    setMode(themeApi.mode)
  }, [themeApi.theme, themeApi.mode])

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)
    try {
      // Persist selection for all users (simple localStorage for now; backend could be wired later)
      localStorage.setItem('ao_admin_theme', theme)
      localStorage.setItem('ao_admin_mode', mode)
      // Apply via ThemeContext API if present
      themeApi.setTheme(theme as any)
      themeApi.setMode(mode)
      // Ensure body classes updated in case
      document.body.classList.forEach(c => {
        if (c.startsWith('theme-') || c.startsWith('mode-')) document.body.classList.remove(c)
      })
      document.body.classList.add(`theme-${theme}`)
      document.body.classList.add(`mode-${mode}`)
      
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/admin"
            className="inline-flex items-center gap-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Admin Dashboard
          </Link>
          
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[var(--color-accent-primary)]/10 rounded-xl border border-[var(--color-border-primary)]">
              <Palette className="w-8 h-8 text-[var(--color-accent-primary)]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">Theme Settings</h1>
              <p className="text-[var(--color-text-secondary)] mt-1">
                Choose a gentle color palette designed for comfortable reading
              </p>
            </div>
          </div>
        </div>

        {/* Main Settings Card */}
        <div className="bg-[var(--color-bg-secondary)] rounded-2xl border border-[var(--color-border-primary)] shadow-lg overflow-hidden">
          <div className="p-8 space-y-8">
            {/* Mode Selection - Moved to top */}
            <div>
              <label className="block text-sm font-semibold text-[var(--color-text-primary)] mb-4">
                Display Mode
              </label>
              <div className="flex items-center gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex items-center gap-3 px-6 py-4 rounded-xl border-2 transition-all flex-1 justify-center ${
                    mode === 'dark'
                      ? 'border-[var(--color-accent-primary)] bg-[var(--color-accent-primary)]/10 text-[var(--color-text-primary)] shadow-md'
                      : 'border-[var(--color-border-secondary)] bg-[var(--color-interactive-bg)] text-[var(--color-text-secondary)] hover:border-[var(--color-border-primary)]'
                  }`}
                  onClick={() => setMode('dark')}
                >
                  <MoonStar className="w-5 h-5" />
                  <span className="font-medium">Dark</span>
                  {mode === 'dark' && <CheckCircle className="w-4 h-4 ml-1" />}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex items-center gap-3 px-6 py-4 rounded-xl border-2 transition-all flex-1 justify-center ${
                    mode === 'light'
                      ? 'border-[var(--color-accent-primary)] bg-[var(--color-accent-primary)]/10 text-[var(--color-text-primary)] shadow-md'
                      : 'border-[var(--color-border-secondary)] bg-[var(--color-interactive-bg)] text-[var(--color-text-secondary)] hover:border-[var(--color-border-primary)]'
                  }`}
                  onClick={() => setMode('light')}
                >
                  <Sun className="w-5 h-5" />
                  <span className="font-medium">Light</span>
                  {mode === 'light' && <CheckCircle className="w-4 h-4 ml-1" />}
                </motion.button>
              </div>
            </div>

            {/* Theme Selection */}
            <div>
              <label className="block text-sm font-semibold text-[var(--color-text-primary)] mb-4">
                Color Palette
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(THEME_PALETTES).map(([key, palette]) => (
                  <motion.button
                    key={key}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`relative p-5 rounded-xl border-2 text-left transition-all ${
                      theme === key
                        ? 'border-[var(--color-accent-primary)] bg-[var(--color-accent-primary)]/10 shadow-md'
                        : 'border-[var(--color-border-secondary)] bg-[var(--color-interactive-bg)] hover:border-[var(--color-border-primary)]'
                    }`}
                    onClick={() => setTheme(key)}
                  >
                    {theme === key && (
                      <div className="absolute top-3 right-3">
                        <CheckCircle className="w-5 h-5 text-[var(--color-accent-primary)]" />
                      </div>
                    )}
                    
                    {/* Color Preview Swatches */}
                    <div className="flex items-center gap-2 mb-3">
                      {palette.preview.map((color, idx) => (
                        <div
                          key={idx}
                          className="w-8 h-8 rounded-lg shadow-sm"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>

                    <div className="font-semibold text-[var(--color-text-primary)] mb-1">
                      {palette.name}
                    </div>
                    <div className="text-xs text-[var(--color-text-secondary)]">
                      {palette.description}
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-4 border-t border-[var(--color-border-primary)]">
              <div className="flex items-center justify-between">
                <div className="text-sm text-[var(--color-text-tertiary)]">
                  {saved ? (
                    <span className="flex items-center gap-2 text-[var(--heatmap-best)]">
                      <CheckCircle className="w-4 h-4" />
                      Changes saved successfully!
                    </span>
                  ) : (
                    <span>Changes will apply immediately across the site</span>
                  )}
                </div>
                
                <motion.button
                  onClick={handleSave}
                  disabled={saving}
                  whileHover={!saving ? { scale: 1.02 } : {}}
                  whileTap={!saving ? { scale: 0.98 } : {}}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--color-accent-primary)] text-white font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Saving…' : 'Save Changes'}
                </motion.button>
              </div>
            </div>
          </div>
        </div>

        {/* Info Card */}
        <div className="mt-8 p-6 bg-[var(--color-interactive-bg)] border border-[var(--color-border-primary)] rounded-xl">
          <h3 className="font-semibold text-[var(--color-text-primary)] mb-2">Eye-Friendly Design</h3>
          <p className="text-sm text-[var(--color-text-secondary)]">
            All palettes are carefully designed with optimal contrast ratios for comfortable reading. Dark mode uses deeper backgrounds to reduce eye strain, while light mode features soft neutrals instead of harsh whites.
          </p>
        </div>
      </div>
    </div>
  )
}
