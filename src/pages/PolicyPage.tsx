import { motion } from 'framer-motion'
import SEO from '../components/SEO'
import { Shield, Lock, Eye } from 'lucide-react'

export default function PolicyPage() {
  return (
    <div className="relative bg-black text-white min-h-screen py-20 overflow-hidden">
      <SEO title="Our Policy - AcademOra" description="Learn about AcademOra's privacy policy and terms of service" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="mb-8">
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20"
            >
              <Shield className="w-4 h-4 text-yellow-300" />
              <span className="text-sm font-medium text-yellow-200">Our Policies</span>
            </motion.div>
          </div>

          <h1 className="text-5xl md:text-7xl font-black mb-6">
            <span className="bg-gradient-to-r from-white via-yellow-200 to-orange-200 bg-clip-text text-transparent">
              Our Policy
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto">
            Your privacy and security are our top priorities.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-3xl border border-gray-700/50 p-12 text-center"
        >
          <Lock className="h-16 w-16 text-yellow-400 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-white mb-4">Policy Documentation</h2>
          <p className="text-gray-300 text-lg mb-8">
            Our comprehensive policy documentation is being prepared to ensure complete transparency about how we handle your data and protect your privacy.
          </p>
          <div className="flex justify-center gap-4">
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
              <Eye className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
              <span className="text-gray-300">Privacy Policy</span>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
              <Shield className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
              <span className="text-gray-300">Terms of Service</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
