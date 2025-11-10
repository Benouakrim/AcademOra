import { useEffect, useMemo, useState } from 'react'
import { compareAPI } from '../lib/api'
import { useAccessControl } from '../context/AccessControlContext'
import { 
  Search, X, Plus, DollarSign, 
  GraduationCap, Users, Award, BarChart3,
  Sparkles, AlertCircle, ChevronDown, ChevronUp,
  Check, Globe, Briefcase, Target, Save, Bookmark
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import ComparisonCharts from '../components/ComparisonCharts'

type University = any

interface ComparisonData {
  universities: University[]
  predictions: any[] | null
  profile_complete: boolean
  count: number
}

interface Analysis {
  cost_analysis: any
  academic_analysis: any
  location_analysis: any
  recommendations: any[]
}

export default function UniversityComparePage() {
  const [all, setAll] = useState<University[]>([])
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<University[]>([])
  const [comparisonData, setComparisonData] = useState<ComparisonData | null>(null)
  const [analysis, setAnalysis] = useState<Analysis | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingComparison, setLoadingComparison] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['overview']))
  const [viewMode, setViewMode] = useState<'table' | 'cards' | 'charts'>('table')
  const [showProfilePrompt, setShowProfilePrompt] = useState(false)
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [saveName, setSaveName] = useState('')
  const [saveDescription, setSaveDescription] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const { showUpgradeModal } = useAccessControl()

  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        setLoading(true)
        const list = await compareAPI.getUniversities()
        if (!mounted) return
        setAll(Array.isArray(list) ? list : [])
        setErrorMessage(null)
      } catch (error: any) {
        if (error && (error.code === 'LOGIN_REQUIRED' || error.code === 'UPGRADE_REQUIRED')) {
          const fallback =
            error.code === 'LOGIN_REQUIRED'
              ? 'Please log in to compare universities.'
              : 'Upgrade to access university comparison.'
          const message = error.error || error.message || fallback
          setErrorMessage(message)
          showUpgradeModal({ message, code: error.code })
        } else {
          console.error('Failed to load comparison universities:', error)
          setErrorMessage('Unable to load universities. Please try again later.')
        }
        if (!mounted) return
        setAll([])
      } finally {
        setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  useEffect(() => {
    if (selected.length >= 2) {
      loadComparisonData()
    } else {
      setComparisonData(null)
      setAnalysis(null)
    }
  }, [selected])

  const loadComparisonData = async () => {
    try {
      setLoadingComparison(true)
      const ids = selected.map(u => u.id)
      
      // Load comparison with predictions
      const data = await compareAPI.getComparisonWithPredictions(ids)
      setComparisonData(data)
      
      if (!data.profile_complete && data.predictions === null) {
        setShowProfilePrompt(true)
      }
      
      // Load analysis
      const analysisData = await compareAPI.analyzeUniversities(ids)
      setAnalysis(analysisData)
    } catch (error) {
      console.error('Failed to load comparison data:', error)
    } finally {
      setLoadingComparison(false)
    }
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return all
    return all.filter((u) => 
      (u.name || '').toLowerCase().includes(q) || 
      (u.country || '').toLowerCase().includes(q) ||
      (u.city || '').toLowerCase().includes(q)
    )
  }, [all, query])

  const canAdd = selected.length < 5

  const add = (u: University) => {
    if (!canAdd) return
    if (selected.find((x) => x.id === u.id)) return
    setSelected((s) => [...s, u])
  }

  const remove = (id: string) => setSelected((s) => s.filter((x) => x.id !== id))

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev)
      if (newSet.has(section)) {
        newSet.delete(section)
      } else {
        newSet.add(section)
      }
      return newSet
    })
  }

  const formatCurrency = (value: any) => {
    if (typeof value === 'number') {
      return `$${(value / 1000).toFixed(0)}k`
    }
    return '—'
  }

  const formatPercent = (value: any) => {
    if (typeof value === 'number') {
      return `${value}%`
    }
    return '—'
  }

  const getPredictionForUniversity = (universityId: string) => {
    if (!comparisonData?.predictions) return null
    return comparisonData.predictions.find(p => p.university_id === universityId)
  }

  const handleSaveComparison = async () => {
    if (!saveName.trim() || selected.length < 2) return

    try {
      setSaving(true)
      await compareAPI.saveComparison(
        saveName.trim(),
        selected.map(u => u.id),
        saveDescription.trim() || undefined
      )
      
      setSaveSuccess(true)
      setTimeout(() => {
        setShowSaveModal(false)
        setSaveName('')
        setSaveDescription('')
        setSaveSuccess(false)
      }, 2000)
    } catch (error: any) {
      console.error('Failed to save comparison:', error)
      if (error.status === 409) {
        alert('You already have a saved comparison with these universities!')
      } else {
        alert('Failed to save comparison. Please try again.')
      }
    } finally {
      setSaving(false)
    }
  }

  const comparisonMetrics = [
    {
      section: 'overview',
      title: 'Overview',
      icon: <Globe className="w-5 h-5" />,
      metrics: [
        { key: 'country', label: 'Country', format: (v: any) => v || '—' },
        { key: 'city', label: 'City', format: (v: any) => v || '—' },
        { key: 'campus_setting', label: 'Campus Setting', format: (v: any) => v || '—' },
        { key: 'type', label: 'Type', format: (v: any) => v || '—' },
      ]
    },
    {
      section: 'academics',
      title: 'Academic Profile',
      icon: <GraduationCap className="w-5 h-5" />,
      metrics: [
        { key: 'ranking_global', label: 'Global Ranking', format: (v: any) => v ? `#${v}` : '—' },
        { key: 'ranking_national', label: 'National Ranking', format: (v: any) => v ? `#${v}` : '—' },
        { key: 'acceptance_rate', label: 'Acceptance Rate', format: formatPercent },
        { key: 'avg_gpa_admitted', label: 'Average GPA', format: (v: any) => v || '—' },
        { key: 'avg_sat_admitted', label: 'Average SAT', format: (v: any) => v || '—' },
        { key: 'student_faculty_ratio', label: 'Student:Faculty Ratio', format: (v: any) => v ? `${v}:1` : '—' },
      ]
    },
    {
      section: 'costs',
      title: 'Cost & Financial Aid',
      icon: <DollarSign className="w-5 h-5" />,
      metrics: [
        { key: 'avg_tuition_per_year', label: 'Avg Tuition/Year', format: formatCurrency },
        { key: 'tuition_in_state', label: 'In-State Tuition', format: formatCurrency },
        { key: 'tuition_out_of_state', label: 'Out-of-State Tuition', format: formatCurrency },
        { key: 'tuition_international', label: 'International Tuition', format: formatCurrency },
        { key: 'cost_of_living_est', label: 'Cost of Living (est)', format: formatCurrency },
        { key: 'avg_financial_aid_package', label: 'Avg Aid Package', format: formatCurrency },
        { key: 'percentage_receiving_aid', label: '% Receiving Aid', format: formatPercent },
      ]
    },
    {
      section: 'students',
      title: 'Student Body',
      icon: <Users className="w-5 h-5" />,
      metrics: [
        { key: 'total_enrollment', label: 'Total Enrollment', format: (v: any) => v ? v.toLocaleString() : '—' },
        { key: 'undergrad_enrollment', label: 'Undergraduate', format: (v: any) => v ? v.toLocaleString() : '—' },
        { key: 'grad_enrollment', label: 'Graduate', format: (v: any) => v ? v.toLocaleString() : '—' },
        { key: 'international_student_percentage', label: '% International', format: formatPercent },
        { key: 'gender_ratio', label: 'Gender Ratio (M:F)', format: (v: any) => v || '—' },
      ]
    },
    {
      section: 'outcomes',
      title: 'Outcomes & Career',
      icon: <Briefcase className="w-5 h-5" />,
      metrics: [
        { key: 'graduation_rate_4yr', label: '4-Year Graduation Rate', format: formatPercent },
        { key: 'graduation_rate_6yr', label: '6-Year Graduation Rate', format: formatPercent },
        { key: 'employment_rate_after_graduation', label: 'Employment Rate', format: formatPercent },
        { key: 'avg_starting_salary', label: 'Avg Starting Salary', format: formatCurrency },
        { key: 'post_grad_visa_strength', label: 'Post-Grad Visa (months)', format: (v: any) => v ?? '—' },
      ]
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Compare Universities</h1>
                <p className="text-gray-600">Side-by-side analysis of up to 5 universities</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-600 bg-white px-4 py-2 rounded-lg border">
                <span className="font-medium">{selected.length}/5</span> selected
              </div>
              {selected.length >= 2 && (
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowSaveModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    Save
                  </button>
                  <button
                    onClick={() => setViewMode('table')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      viewMode === 'table' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-white text-gray-700 border hover:bg-gray-50'
                    }`}
                  >
                    Table
                  </button>
                  <button
                    onClick={() => setViewMode('cards')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      viewMode === 'cards' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-white text-gray-700 border hover:bg-gray-50'
                    }`}
                  >
                    Cards
                  </button>
                  <button
                    onClick={() => setViewMode('charts')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      viewMode === 'charts' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-white text-gray-700 border hover:bg-gray-50'
                    }`}
                  >
                    Charts
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 rounded-xl border border-amber-300 bg-amber-50 px-5 py-4 flex items-center gap-3"
          >
            <AlertCircle className="w-5 h-5 text-amber-600" />
            <span className="text-sm text-amber-800">{errorMessage}</span>
          </motion.div>
        )}

        <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
          {/* Sidebar - University Selection */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            {/* Search */}
            <div className="bg-white rounded-xl border shadow-sm p-5">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  className="w-full border rounded-lg pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Search universities..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              <div className="text-xs text-gray-500 mt-3 flex items-center justify-between">
                <span>{loading ? 'Loading…' : `${filtered.length} universities`}</span>
                {!canAdd && <span className="text-amber-600 font-medium">Max 5 reached</span>}
              </div>
              
              <div className="max-h-96 overflow-auto divide-y mt-4 -mx-5">
                {filtered.slice(0, 100).map((u) => {
                  const isSelected = selected.find(s => s.id === u.id)
                  return (
                    <button
                      key={u.id}
                      onClick={() => isSelected ? remove(u.id) : add(u)}
                      disabled={!canAdd && !isSelected}
                      className={`w-full text-left px-5 py-3 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
                        isSelected ? 'bg-blue-50 hover:bg-blue-100' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm text-gray-900 truncate flex items-center gap-2">
                            {isSelected && <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />}
                            {u.name}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {u.country}{u.city ? ` • ${u.city}` : ''}
                          </div>
                        </div>
                        {!isSelected && canAdd && (
                          <Plus className="w-5 h-5 text-gray-400 flex-shrink-0 ml-2" />
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Selected Universities */}
            {selected.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl border shadow-sm p-5"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-900">Selected for Comparison</h3>
                  <button
                    onClick={() => setSelected([])}
                    className="text-xs text-red-600 hover:text-red-700 font-medium"
                  >
                    Clear all
                  </button>
                </div>
                <div className="space-y-2">
                  {selected.map((s, index) => (
                    <motion.div
                      key={s.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">{s.name}</div>
                        <div className="text-xs text-gray-600">{s.country}</div>
                      </div>
                      <button
                        onClick={() => remove(s.id)}
                        className="p-1 hover:bg-red-100 rounded-full transition-colors"
                      >
                        <X className="w-4 h-4 text-red-600" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Main Comparison Area */}
          <div className="space-y-6">
            {selected.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-xl border shadow-sm p-12 text-center"
              >
                <div className="max-w-md mx-auto">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Target className="w-10 h-10 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Ready to Compare?</h3>
                  <p className="text-gray-600 mb-6">
                    Select 2 or more universities from the list to see a detailed side-by-side comparison with insights and recommendations.
                  </p>
                  <div className="text-sm text-gray-500">
                    💡 Tip: You can compare up to 5 universities at once
                  </div>
                </div>
              </motion.div>
            ) : selected.length === 1 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-xl border shadow-sm p-12 text-center"
              >
                <div className="max-w-md mx-auto">
                  <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Plus className="w-10 h-10 text-amber-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Add One More</h3>
                  <p className="text-gray-600 mb-6">
                    You've selected <strong>{selected[0].name}</strong>. Add at least one more university to start comparing.
                  </p>
                </div>
              </motion.div>
            ) : (
              <>
                {/* Financial Aid Prompt */}
                {showProfilePrompt && comparisonData && !comparisonData.profile_complete && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200 p-5"
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Sparkles className="w-5 h-5 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-1">Get Personalized Cost Estimates</h4>
                        <p className="text-sm text-gray-700 mb-3">
                          Complete your financial profile to see predicted costs and financial aid for each university in your comparison.
                        </p>
                        <button 
                          onClick={() => window.location.href = '/profile'}
                          className="text-sm px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                        >
                          Complete Profile
                        </button>
                      </div>
                      <button
                        onClick={() => setShowProfilePrompt(false)}
                        className="p-1 hover:bg-purple-100 rounded-full transition-colors"
                      >
                        <X className="w-5 h-5 text-gray-500" />
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Smart Recommendations */}
                {analysis && analysis.recommendations && analysis.recommendations.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 p-6"
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <Award className="w-5 h-5 text-green-600" />
                      <h3 className="font-bold text-gray-900">Smart Recommendations</h3>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {analysis.recommendations.map((rec, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="bg-white rounded-lg p-4 border border-green-100"
                        >
                          <div className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-1">
                            {rec.type.replace(/_/g, ' ')}
                          </div>
                          <div className="font-medium text-gray-900 mb-1">{rec.university_name}</div>
                          <div className="text-xs text-gray-600">{rec.reason}</div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Comparison Table/Cards/Charts */}
                {loadingComparison ? (
                  <div className="bg-white rounded-xl border shadow-sm p-12">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                      <div className="text-gray-600">Loading comparison data...</div>
                    </div>
                  </div>
                ) : viewMode === 'table' ? (
                  <div className="space-y-4">
                    {comparisonMetrics.map((section) => (
                      <motion.div
                        key={section.section}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-xl border shadow-sm overflow-hidden"
                      >
                        <button
                          onClick={() => toggleSection(section.section)}
                          className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                              {section.icon}
                            </div>
                            <h3 className="font-bold text-gray-900">{section.title}</h3>
                          </div>
                          {expandedSections.has(section.section) ? (
                            <ChevronUp className="w-5 h-5 text-gray-400" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                          )}
                        </button>
                        
                        <AnimatePresence>
                          {expandedSections.has(section.section) && (
                            <motion.div
                              initial={{ height: 0 }}
                              animate={{ height: 'auto' }}
                              exit={{ height: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                  <thead>
                                    <tr className="border-t border-b bg-gray-50">
                                      <th className="text-left p-4 font-semibold text-gray-700 sticky left-0 bg-gray-50 z-10">Metric</th>
                                      {selected.map((u) => (
                                        <th key={u.id} className="text-left p-4 min-w-48">
                                          <div className="font-semibold text-gray-900">{u.name}</div>
                                          <div className="text-xs text-gray-500 font-normal mt-1">
                                            {u.city}, {u.country}
                                          </div>
                                        </th>
                                      ))}
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {section.metrics.map((metric, idx) => (
                                      <tr key={metric.key} className={`border-b last:border-0 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                                        <td className="p-4 font-medium text-gray-700 sticky left-0 bg-inherit">{metric.label}</td>
                                        {selected.map((u) => (
                                          <td key={u.id} className="p-4 text-gray-900">
                                            {metric.format((u as any)[metric.key])}
                                          </td>
                                        ))}
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    ))}

                    {/* Financial Aid Predictions Section */}
                    {comparisonData?.predictions && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200 overflow-hidden"
                      >
                        <button
                          onClick={() => toggleSection('predictions')}
                          className="w-full flex items-center justify-between p-5 hover:bg-purple-100/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                              <Sparkles className="w-5 h-5" />
                            </div>
                            <h3 className="font-bold text-gray-900">Your Predicted Costs</h3>
                          </div>
                          {expandedSections.has('predictions') ? (
                            <ChevronUp className="w-5 h-5 text-gray-400" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                          )}
                        </button>
                        
                        <AnimatePresence>
                          {expandedSections.has('predictions') && (
                            <motion.div
                              initial={{ height: 0 }}
                              animate={{ height: 'auto' }}
                              exit={{ height: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="overflow-x-auto bg-white">
                                <table className="w-full text-sm">
                                  <thead>
                                    <tr className="border-t border-b bg-purple-50">
                                      <th className="text-left p-4 font-semibold text-gray-700 sticky left-0 bg-purple-50 z-10">Cost Component</th>
                                      {selected.map((u) => (
                                        <th key={u.id} className="text-left p-4 min-w-48">
                                          <div className="font-semibold text-gray-900">{u.name}</div>
                                        </th>
                                      ))}
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {[
                                      { key: 'gross_tuition', label: 'Gross Tuition' },
                                      { key: 'estimated_aid', label: 'Estimated Aid' },
                                      { key: 'net_cost', label: 'Net Tuition' },
                                      { key: 'cost_of_living', label: 'Cost of Living' },
                                      { key: 'total_out_of_pocket', label: 'Total Out-of-Pocket' },
                                    ].map((item, idx) => (
                                      <tr key={item.key} className={`border-b last:border-0 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                                        <td className={`p-4 font-medium text-gray-700 sticky left-0 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                                          {item.label}
                                        </td>
                                        {selected.map((u) => {
                                          const pred = getPredictionForUniversity(u.id)
                                          const value = pred?.prediction?.[item.key]
                                          return (
                                            <td key={u.id} className={`p-4 font-semibold ${
                                              item.key === 'total_out_of_pocket' ? 'text-purple-600' :
                                              item.key === 'estimated_aid' ? 'text-green-600' :
                                              'text-gray-900'
                                            }`}>
                                              {value ? `$${value.toLocaleString()}` : '—'}
                                            </td>
                                          )
                                        })}
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    )}
                  </div>
                ) : viewMode === 'cards' ? (
                  <div className="grid gap-6">
                    {selected.map((university, index) => {
                      const prediction = getPredictionForUniversity(university.id)
                      return (
                        <motion.div
                          key={university.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="bg-white rounded-xl border shadow-md p-6"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="text-xl font-bold text-gray-900">{university.name}</h3>
                              <p className="text-gray-600">{university.city}, {university.country}</p>
                            </div>
                            <button
                              onClick={() => remove(university.id)}
                              className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <X className="w-5 h-5 text-red-600" />
                            </button>
                          </div>

                          <div className="grid md:grid-cols-3 gap-4">
                            <div className="bg-blue-50 rounded-lg p-4">
                              <div className="text-xs text-blue-600 font-semibold mb-1">RANKING</div>
                              <div className="text-2xl font-bold text-blue-900">
                                {university.ranking_global ? `#${university.ranking_global}` : '—'}
                              </div>
                            </div>
                            <div className="bg-green-50 rounded-lg p-4">
                              <div className="text-xs text-green-600 font-semibold mb-1">ACCEPTANCE</div>
                              <div className="text-2xl font-bold text-green-900">
                                {university.acceptance_rate ? `${university.acceptance_rate}%` : '—'}
                              </div>
                            </div>
                            <div className="bg-purple-50 rounded-lg p-4">
                              <div className="text-xs text-purple-600 font-semibold mb-1">TUITION</div>
                              <div className="text-2xl font-bold text-purple-900">
                                {formatCurrency(university.avg_tuition_per_year)}
                              </div>
                            </div>
                          </div>

                          {prediction && (
                            <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                              <div className="flex items-center gap-2 mb-2">
                                <Sparkles className="w-4 h-4 text-purple-600" />
                                <div className="text-sm font-semibold text-gray-900">Your Predicted Cost</div>
                              </div>
                              <div className="text-3xl font-bold text-purple-600 mb-1">
                                ${prediction.prediction.total_out_of_pocket.toLocaleString()}
                              </div>
                              <div className="text-xs text-gray-600">
                                After ${prediction.prediction.estimated_aid.toLocaleString()} estimated aid
                              </div>
                            </div>
                          )}
                        </motion.div>
                      )
                    })}
                  </div>
                ) : viewMode === 'charts' && comparisonData ? (
                  <ComparisonCharts
                    universities={comparisonData.universities}
                    predictions={comparisonData.predictions}
                  />
                ) : null}
              </>
            )}
          </div>
        </div>

        {/* Save Comparison Modal */}
        <AnimatePresence>
          {showSaveModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
              onClick={() => !saving && setShowSaveModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
                onClick={(e) => e.stopPropagation()}
              >
                {saveSuccess ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Check className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Saved Successfully!</h3>
                    <p className="text-gray-600">Your comparison has been saved</p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl">
                        <Bookmark className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">Save Comparison</h3>
                        <p className="text-sm text-gray-600">Save this comparison for later viewing</p>
                      </div>
                    </div>

                    <div className="space-y-4 mb-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Comparison Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={saveName}
                          onChange={(e) => setSaveName(e.target.value)}
                          placeholder="e.g., Top Engineering Schools 2025"
                          className="w-full border rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          disabled={saving}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Description (optional)
                        </label>
                        <textarea
                          value={saveDescription}
                          onChange={(e) => setSaveDescription(e.target.value)}
                          placeholder="Add notes about this comparison..."
                          rows={3}
                          className="w-full border rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                          disabled={saving}
                        />
                      </div>

                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="text-xs font-medium text-gray-700 mb-2">Universities to save:</div>
                        <div className="space-y-1">
                          {selected.map((u) => (
                            <div key={u.id} className="text-sm text-gray-600 flex items-center gap-2">
                              <Check className="w-3 h-3 text-green-600" />
                              {u.name}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => setShowSaveModal(false)}
                        disabled={saving}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveComparison}
                        disabled={saving || !saveName.trim()}
                        className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg text-sm font-medium hover:from-green-600 hover:to-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {saving ? 'Saving...' : 'Save Comparison'}
                      </button>
                    </div>
                  </>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}


