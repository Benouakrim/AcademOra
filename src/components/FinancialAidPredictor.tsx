import { useState, useEffect } from 'react'
import { Calculator, DollarSign, TrendingDown, GraduationCap, Award, AlertCircle, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { financialProfileAPI } from '../lib/api'

interface University {
  id: string
  name: string
  tuition_international?: number
  tuition_out_of_state?: number
  tuition_in_state?: number
  avg_financial_aid_package?: number
  percentage_receiving_aid?: number
  scholarships_international?: boolean
  need_blind_admission?: boolean
  cost_of_living_est?: number
}

interface UserProfile {
  gpa?: number
  sat_score?: number
  act_score?: number
  family_income?: number
  international_student?: boolean
  in_state?: boolean
  first_generation?: boolean
  special_talents?: string[]
}

interface FinancialAidPrediction {
  gross_tuition: number
  estimated_aid: number
  net_cost: number
  cost_of_living: number
  total_out_of_pocket: number
  aid_breakdown: {
    merit_based: number
    need_based: number
    scholarships: number
  }
  confidence_score: number
  scenarios: {
    optimistic: number
    realistic: number
    conservative: number
  }
}

interface FinancialAidPredictorProps {
  university: University
  userProfile?: UserProfile
  onRequestCompleteProfile?: () => void
}

export default function FinancialAidPredictor({ university, userProfile, onRequestCompleteProfile }: FinancialAidPredictorProps) {
  const [prediction, setPrediction] = useState<FinancialAidPrediction | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    if (university && userProfile) {
      calculatePrediction()
    }
  }, [university, userProfile])

  const calculatePrediction = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Call the real API endpoint
      const response = await financialProfileAPI.predictAid(
        university.id || '',
        university // Pass full university data as fallback
      )
      
      if (response.success && response.prediction) {
        setPrediction(response.prediction)
      } else {
        throw new Error('Invalid prediction response')
      }
    } catch (err: any) {
      console.error('Failed to calculate financial aid prediction:', err)
      setError(err.message || 'Failed to calculate prediction. Please try again.')
      
      // Fallback to client-side calculation if API fails
      fallbackCalculation()
    } finally {
      setLoading(false)
    }
  }

  // Fallback calculation method (simplified version for when API is unavailable)
  const fallbackCalculation = () => {
    console.warn('Using fallback calculation method')
    
    const tuition = userProfile?.international_student 
      ? university.tuition_international || university.tuition_out_of_state || 0
      : userProfile?.in_state 
        ? university.tuition_in_state || 0
        : university.tuition_out_of_state || 0

    const baseAid = university.avg_financial_aid_package || 0
    
    // Calculate merit-based aid based on academic profile
    let meritAid = 0
    if (userProfile?.gpa && userProfile.sat_score) {
      const gpaFactor = userProfile.gpa >= 3.8 ? 1.5 : userProfile.gpa >= 3.5 ? 1.2 : 1.0
      const satFactor = userProfile.sat_score >= 1400 ? 1.3 : userProfile.sat_score >= 1300 ? 1.1 : 1.0
      meritAid = baseAid * 0.6 * gpaFactor * satFactor
    }

    // Calculate need-based aid based on family income
    let needAid = 0
    if (userProfile?.family_income && university.need_blind_admission) {
      needAid = Math.max(0, tuition - (userProfile.family_income * 0.3))
    } else if (userProfile?.family_income) {
      needAid = Math.max(0, tuition - (userProfile.family_income * 0.4)) * 0.8
    }

    // International scholarships
    let scholarships = 0
    if (userProfile?.international_student && university.scholarships_international) {
      scholarships = baseAid * 0.3
    }

    // First generation bonus
    if (userProfile?.first_generation) {
      meritAid *= 1.1
      needAid *= 1.1
    }

    const totalAid = meritAid + needAid + scholarships
    const netCost = Math.max(0, tuition - totalAid)
    const costOfLiving = university.cost_of_living_est || 15000
    const totalOutOfPocket = netCost + costOfLiving

    // Calculate confidence score
    const confidenceScore = Math.min(95, 
      60 + 
      (university.avg_financial_aid_package ? 10 : 0) +
      (university.percentage_receiving_aid ? 10 : 0) +
      (userProfile?.gpa ? 5 : 0) +
      (userProfile?.sat_score ? 5 : 0) +
      (userProfile?.family_income ? 5 : 0)
    )

    // Calculate scenarios
    const scenarios = {
      optimistic: Math.max(0, tuition - (totalAid * 1.2)),
      realistic: netCost,
      conservative: Math.max(0, tuition - (totalAid * 0.8))
    }

    setPrediction({
      gross_tuition: tuition,
      estimated_aid: totalAid,
      net_cost: netCost,
      cost_of_living: costOfLiving,
      total_out_of_pocket: totalOutOfPocket,
      aid_breakdown: {
        merit_based: Math.round(meritAid),
        need_based: Math.round(needAid),
        scholarships: Math.round(scholarships)
      },
      confidence_score: confidenceScore,
      scenarios
    })
  }

  if (!userProfile) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-purple-900/20 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-6"
      >
        <div className="flex items-center gap-3 text-purple-300">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <AlertCircle className="h-5 w-5" />
          </motion.div>
          <p className="text-sm">Complete your profile to see personalized financial aid predictions</p>
        </div>
        {onRequestCompleteProfile && (
          <button
            onClick={onRequestCompleteProfile}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-500/80 hover:bg-purple-500 text-white text-sm font-medium transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            Complete profile
          </button>
        )}
      </motion.div>
    )
  }

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-8"
      >
        <div className="flex items-center justify-center py-8">
          <motion.div
            className="flex items-center gap-4"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <motion.div
              className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <span className="text-gray-300">Calculating your financial aid...</span>
          </motion.div>
        </div>
      </motion.div>
    )
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-red-900/20 backdrop-blur-sm border border-red-500/30 rounded-2xl p-6"
      >
        <div className="flex items-center gap-3 text-red-300 mb-3">
          <AlertCircle className="h-5 w-5" />
          <p className="text-sm font-medium">Failed to calculate financial aid prediction</p>
        </div>
        <p className="text-sm text-red-200/80 mb-4">{error}</p>
        <button
          onClick={calculatePrediction}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/80 hover:bg-red-500 text-white text-sm font-medium transition-colors"
        >
          Try again
        </button>
      </motion.div>
    )
  }

  if (!prediction) return null

  const savingsPercentage = university.tuition_international 
    ? Math.round((prediction.estimated_aid / university.tuition_international) * 100)
    : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 backdrop-blur-sm p-6 border-b border-gray-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ 
                boxShadow: ["0 0 20px rgba(16, 185, 129, 0.5)", "0 0 40px rgba(16, 185, 129, 0.8)", "0 0 20px rgba(16, 185, 129, 0.5)"]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Calculator className="h-6 w-6 text-green-400" />
            </motion.div>
            <div>
              <h3 className="text-lg font-bold text-white">Smart Cost Calculator</h3>
              <p className="text-green-300 text-sm">Algorithm-based financial aid estimate</p>
            </div>
          </div>
          <div className="text-right">
            <motion.div 
              className="text-3xl font-black bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              ${prediction.total_out_of_pocket.toLocaleString()}
            </motion.div>
            <div className="text-green-300 text-sm">Total out-of-pocket</div>
          </div>
          {onRequestCompleteProfile && (
            <button
              onClick={onRequestCompleteProfile}
              className="text-xs font-medium text-green-200 hover:text-white transition-colors border border-green-400/60 rounded-full px-3 py-1"
            >
              Update profile
            </button>
          )}
        </div>
      </div>

      {/* Main Results */}
      <div className="p-6 space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-red-900/20 backdrop-blur-sm rounded-xl p-4 border border-red-500/30"
          >
            <div className="flex items-center gap-2 text-red-400 mb-1">
              <DollarSign className="h-4 w-4" />
              <span className="text-sm font-medium">Gross Tuition</span>
            </div>
            <div className="text-2xl font-bold text-red-300">
              ${prediction.gross_tuition.toLocaleString()}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-green-900/20 backdrop-blur-sm rounded-xl p-4 border border-green-500/30"
          >
            <div className="flex items-center gap-2 text-green-400 mb-1">
              <TrendingDown className="h-4 w-4" />
              <span className="text-sm font-medium">Estimated Aid</span>
            </div>
            <div className="text-2xl font-bold text-green-300">
              ${prediction.estimated_aid.toLocaleString()}
            </div>
            <div className="text-xs text-green-400 mt-1">
              {savingsPercentage}% of tuition covered
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-blue-900/20 backdrop-blur-sm rounded-xl p-4 border border-blue-500/30"
          >
            <div className="flex items-center gap-2 text-blue-400 mb-1">
              <Award className="h-4 w-4" />
              <span className="text-sm font-medium">Net Cost</span>
            </div>
            <div className="text-2xl font-bold text-blue-300">
              ${prediction.net_cost.toLocaleString()}
            </div>
          </motion.div>
        </div>

        {/* Aid Breakdown */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="border-t border-gray-700/50 pt-4"
        >
          <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-purple-400" />
            Aid Breakdown
          </h4>
          <div className="space-y-3">
            {[
              { label: 'Merit-based Aid', value: prediction.aid_breakdown.merit_based, color: 'purple' },
              { label: 'Need-based Aid', value: prediction.aid_breakdown.need_based, color: 'blue' },
              { label: 'Scholarships', value: prediction.aid_breakdown.scholarships, color: 'green' }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.5 + (index * 0.1) }}
                className="flex justify-between items-center p-3 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10"
              >
                <span className="text-sm text-gray-300">{item.label}</span>
                <span className="font-medium text-white">
                  ${item.value.toLocaleString()}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Scenarios */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="border-t border-gray-700/50 pt-4"
        >
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-white">Cost Scenarios</h4>
            <motion.button
              onClick={() => setExpanded(!expanded)}
              className="text-purple-400 hover:text-purple-300 text-sm transition-colors flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Sparkles className="w-4 h-4" />
              {expanded ? 'Show less' : 'Show details'}
            </motion.button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { label: 'Optimistic', value: prediction.scenarios.optimistic, color: 'green' },
              { label: 'Realistic', value: prediction.scenarios.realistic, color: 'blue' },
              { label: 'Conservative', value: prediction.scenarios.conservative, color: 'orange' }
            ].map((scenario, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.7 + (index * 0.1) }}
                whileHover={{ y: -5 }}
                className={`text-center p-4 bg-${scenario.color}-900/20 backdrop-blur-sm rounded-xl border border-${scenario.color}-500/30`}
              >
                <div className={`text-xs text-${scenario.color}-400 font-medium mb-1`}>
                  {scenario.label}
                </div>
                <div className={`text-lg font-bold text-${scenario.color}-300`}>
                  ${scenario.value.toLocaleString()}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Additional Info */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="border-t border-gray-700/50 pt-4 space-y-3 overflow-hidden"
            >
              {[
                { label: 'Cost of Living (est.)', value: prediction.cost_of_living, bold: false },
                { label: 'Total Out-of-Pocket', value: prediction.total_out_of_pocket, bold: true },
                { label: 'Confidence Score', value: `${prediction.confidence_score}%`, bold: false }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="flex justify-between items-center p-3 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10"
                >
                  <span className="text-sm text-gray-300">{item.label}</span>
                  <span className={`font-medium ${item.bold ? 'text-lg text-white' : 'text-gray-300'}`}>
                    {typeof item.value === 'number' ? `$${item.value.toLocaleString()}` : item.value}
                  </span>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Disclaimer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-4 text-xs text-gray-400 border border-gray-700/50"
        >
          <p>
            <strong className="text-gray-300">Disclaimer:</strong> This is an estimate based on available data and your profile. 
            Actual financial aid packages may vary. Contact the university's financial aid office for official information.
          </p>
        </motion.div>
      </div>
    </motion.div>
  )
}
