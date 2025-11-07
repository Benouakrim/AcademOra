import { motion, AnimatePresence } from 'framer-motion'
import { X, ArrowRight, BookOpen } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface Feature {
  icon: React.ReactNode
  title: string
  description: string
  detailedDescription: string
  benefits: string[]
  docSlug: string
  color: string
}

interface FeatureModalProps {
  feature: Feature | null
  isOpen: boolean
  onClose: () => void
}

export default function FeatureModal({ feature, isOpen, onClose }: FeatureModalProps) {
  const navigate = useNavigate()

  const handleViewDocumentation = () => {
    if (!feature) return
    window.scrollTo(0, 0)
    navigate(`/docs/${feature.docSlug}`)
    onClose()
  }

  if (!feature) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3 }}
            className="relative bg-gradient-to-br from-gray-900 to-black border border-purple-500/20 rounded-3xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl shadow-purple-500/20"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-2 rounded-full bg-gray-800/50 hover:bg-gray-700/50 transition-colors duration-200"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
              <div className={`p-3 rounded-2xl bg-gradient-to-r ${feature.color.replace('text-', 'from-').replace('-600', '-500').replace('-600', '-500')}`}>
                {feature.icon}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">{feature.title}</h2>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            </div>

            {/* Detailed Description */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-white mb-3">Overview</h3>
              <p className="text-gray-300 leading-relaxed">{feature.detailedDescription}</p>
            </div>

            {/* Benefits */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-white mb-3">Key Benefits</h3>
              <ul className="space-y-2">
                {feature.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 mt-2 flex-shrink-0" />
                    <span className="text-gray-300">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Action Button */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-800">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <BookOpen className="w-4 h-4" />
                <span>Detailed documentation available</span>
              </div>
              <button
                onClick={handleViewDocumentation}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full font-semibold text-white hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 flex items-center gap-2"
              >
                View Full Documentation
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
