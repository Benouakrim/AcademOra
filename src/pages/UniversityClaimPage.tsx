import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Building2, School, Mail, User, Phone, Briefcase, FileText, Send, CheckCircle, XCircle, Clock } from 'lucide-react'
import { getCurrentUser } from '../lib/api'
import { universityClaimsAPI, universitiesAPI, universityGroupsAPI } from '../lib/api'

interface University {
  id: string
  name: string
  slug?: string
}

interface UniversityGroup {
  id: string
  name: string
  slug?: string
}

export default function UniversityClaimPage() {
  const navigate = useNavigate()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Form state
  const [claimType, setClaimType] = useState<'university' | 'group'>('university')
  const [selectedUniversityId, setSelectedUniversityId] = useState('')
  const [selectedGroupId, setSelectedGroupId] = useState('')
  const [universities, setUniversities] = useState<University[]>([])
  const [groups, setGroups] = useState<UniversityGroup[]>([])
  const [formData, setFormData] = useState({
    requester_name: '',
    requester_phone: '',
    requester_position: '',
    requester_department: '',
    organization_name: '',
    verification_documents: '',
  })

  useEffect(() => {
    const currentUser = getCurrentUser()
    if (!currentUser) {
      navigate('/login')
      return
    }
    setUser(currentUser)
    fetchUniversities()
    fetchGroups()
    setLoading(false)
  }, [navigate])

  const fetchUniversities = async () => {
    try {
      const data = await universitiesAPI.getUniversities()
      setUniversities(data || [])
    } catch (error: any) {
      console.error('Error fetching universities:', error)
    }
  }

  const fetchGroups = async () => {
    try {
      const data = await universityGroupsAPI.getGroups()
      setGroups(data || [])
    } catch (error: any) {
      console.error('Error fetching groups:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    setSuccess(false)

    try {
      if (claimType === 'university' && !selectedUniversityId) {
        setError('Please select a university')
        setSubmitting(false)
        return
      }

      if (claimType === 'group' && !selectedGroupId) {
        setError('Please select a university group')
        setSubmitting(false)
        return
      }

      if (!formData.requester_name) {
        setError('Your name is required')
        setSubmitting(false)
        return
      }

      // Parse verification documents (comma-separated URLs)
      const verificationDocs = formData.verification_documents
        ? formData.verification_documents.split(',').map(doc => doc.trim()).filter(Boolean)
        : []

      const claimRequest = await universityClaimsAPI.createClaimRequest({
        university_id: claimType === 'university' ? selectedUniversityId : null,
        university_group_id: claimType === 'group' ? selectedGroupId : null,
        requester_name: formData.requester_name,
        requester_phone: formData.requester_phone || null,
        requester_position: formData.requester_position || null,
        requester_department: formData.requester_department || null,
        organization_name: formData.organization_name || null,
        verification_documents: verificationDocs.length > 0 ? { documents: verificationDocs } : null,
      })

      setSuccess(true)
      // Reset form
      setFormData({
        requester_name: '',
        requester_phone: '',
        requester_position: '',
        requester_department: '',
        organization_name: '',
        verification_documents: '',
      })
      setSelectedUniversityId('')
      setSelectedGroupId('')
    } catch (error: any) {
      setError(error.message || 'Failed to submit claim request')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-6 text-sm font-medium"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Claim University Profile</h1>
          <p className="text-gray-600">
            Are you a university representative? Claim your institution's profile to manage and update information directly.
          </p>
        </div>

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-lg">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5" />
              <div>
                <p className="font-semibold">Claim Request Submitted Successfully!</p>
                <p className="text-sm mt-1">
                  Your request has been submitted and is under review. You will receive an email notification once your claim is approved.
                </p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
            <div className="flex items-center gap-3">
              <XCircle className="h-5 w-5" />
              <p>{error}</p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Claim Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                What would you like to claim?
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setClaimType('university')
                    setSelectedGroupId('')
                  }}
                  className={`p-4 border-2 rounded-lg transition-colors ${
                    claimType === 'university'
                      ? 'border-primary-600 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <School className={`h-5 w-5 ${claimType === 'university' ? 'text-primary-600' : 'text-gray-400'}`} />
                    <div className="text-left">
                      <div className="font-semibold text-gray-900">Individual Institution</div>
                      <div className="text-sm text-gray-500">Claim a specific university/campus</div>
                    </div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setClaimType('group')
                    setSelectedUniversityId('')
                  }}
                  className={`p-4 border-2 rounded-lg transition-colors ${
                    claimType === 'group'
                      ? 'border-primary-600 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Building2 className={`h-5 w-5 ${claimType === 'group' ? 'text-primary-600' : 'text-gray-400'}`} />
                    <div className="text-left">
                      <div className="font-semibold text-gray-900">University Group</div>
                      <div className="text-sm text-gray-500">Claim a university system/group</div>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Institution Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {claimType === 'university' ? 'Select University' : 'Select University Group'} *
              </label>
              <select
                required
                value={claimType === 'university' ? selectedUniversityId : selectedGroupId}
                onChange={(e) => {
                  if (claimType === 'university') {
                    setSelectedUniversityId(e.target.value)
                  } else {
                    setSelectedGroupId(e.target.value)
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Select {claimType === 'university' ? 'university' : 'group'}...</option>
                {claimType === 'university'
                  ? universities.map((uni) => (
                      <option key={uni.id} value={uni.id}>
                        {uni.name}
                      </option>
                    ))
                  : groups.map((group) => (
                      <option key={group.id} value={group.id}>
                        {group.name}
                      </option>
                    ))}
              </select>
            </div>

            {/* Requester Information */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User className="h-5 w-5 text-primary-600" />
                Your Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.requester_name}
                    onChange={(e) => setFormData({ ...formData, requester_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={formData.requester_phone}
                    onChange={(e) => setFormData({ ...formData, requester_phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Position/Title</label>
                  <input
                    type="text"
                    value={formData.requester_position}
                    onChange={(e) => setFormData({ ...formData, requester_position: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="e.g., Director of Admissions"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  <input
                    type="text"
                    value={formData.requester_department}
                    onChange={(e) => setFormData({ ...formData, requester_department: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="e.g., Admissions Office"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Organization Name</label>
                  <input
                    type="text"
                    value={formData.organization_name}
                    onChange={(e) => setFormData({ ...formData, organization_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Official university name"
                  />
                </div>
              </div>
            </div>

            {/* Verification Documents */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary-600" />
                Verification Documents
              </h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Document URLs (Optional)
                </label>
                <textarea
                  value={formData.verification_documents}
                  onChange={(e) => setFormData({ ...formData, verification_documents: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter URLs to verification documents (comma-separated). For example: https://example.com/verification.pdf, https://example.com/proof.png"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Provide links to documents that verify your affiliation with the institution (e.g., official letter, email, business card)
                </p>
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-semibold mb-1">What happens next?</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Your claim request will be reviewed by our admin team</li>
                    <li>You'll receive an email notification at {user?.email} once reviewed</li>
                    <li>Approved claims will grant you access to edit your institution's profile</li>
                    <li>Review typically takes 1-3 business days</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary flex items-center gap-2"
              >
                <Send className="h-4 w-4" />
                {submitting ? 'Submitting...' : 'Submit Claim Request'}
              </button>
              <Link
                to="/dashboard"
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

