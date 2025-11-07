import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  BarChart3,
  TrendingUp,
  Users,
  Activity,
  Download,
  RefreshCw,
  Calendar,
  Filter,
  Settings
} from 'lucide-react'
import AdvancedAnalyticsDashboard from '../components/AdvancedAnalyticsDashboard'
import { getCurrentUser } from '../lib/api'

export default function AdvancedAnalyticsPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const currentUser = getCurrentUser()
    if (currentUser) {
      setUser(currentUser)
    }
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <motion.div
          className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-400 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    )
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Settings className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-gray-400 mb-6">You need administrator privileges to access this page.</p>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                to="/admin"
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Admin
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-blue-500/30">
                    <BarChart3 className="w-6 h-6 text-blue-400" />
                  </div>
                  Advanced Analytics Dashboard
                </h1>
                <p className="text-gray-400 mt-2">
                  Comprehensive insights into platform performance, user behavior, and engagement metrics
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <motion.button
                className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Calendar className="w-4 h-4" />
                Last 30 days
              </motion.button>
              <motion.button
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Download className="w-4 h-4" />
                Export Report
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-sm rounded-xl p-6 border border-blue-500/30">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-400" />
              </div>
              <div className="flex items-center gap-1 text-sm font-medium text-green-300">
                <TrendingUp className="w-4 h-4" />
                12%
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">24,563</h3>
            <p className="text-blue-200 text-sm">Total Users</p>
          </div>

          <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 backdrop-blur-sm rounded-xl p-6 border border-green-500/30">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                <Activity className="w-6 h-6 text-green-400" />
              </div>
              <div className="flex items-center gap-1 text-sm font-medium text-green-300">
                <TrendingUp className="w-4 h-4" />
                8%
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">89.2%</h3>
            <p className="text-green-200 text-sm">Engagement Rate</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-purple-400" />
              </div>
              <div className="flex items-center gap-1 text-sm font-medium text-green-300">
                <TrendingUp className="w-4 h-4" />
                15%
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">3,847</h3>
            <p className="text-purple-200 text-sm">Applications</p>
          </div>

          <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 backdrop-blur-sm rounded-xl p-6 border border-orange-500/30">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-orange-400" />
              </div>
              <div className="flex items-center gap-1 text-sm font-medium text-green-300">
                <TrendingUp className="w-4 h-4" />
                23%
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">67.3%</h3>
            <p className="text-orange-200 text-sm">Conversion Rate</p>
          </div>
        </motion.div>

        {/* Main Analytics Dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <AdvancedAnalyticsDashboard />
        </motion.div>
      </div>
    </div>
  )
}
