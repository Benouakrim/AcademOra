import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { User, BookOpen, GraduationCap, LogOut, Compass, Settings, Lock, Mail, Crown, Save, X, Eye, EyeOff } from 'lucide-react'
import { authAPI, getCurrentUser, profileAPI, savedItemsAPI, savedMatchesAPI } from '../lib/api'
import { profileSectionsAPI } from '../lib/api'

interface UserProfile {
  id: string
  email: string
  role?: string
  full_name?: string
  phone?: string
  bio?: string
  avatar_url?: string
  subscription_status?: string
  subscription_expires_at?: string
}

interface SavedItem {
  id: string
  item_type: string
  item_id: string
  item_data?: any
  created_at: string
}

export default function DashboardPage() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [savedItems, setSavedItems] = useState<SavedItem[]>([])
  const [savedItemsCount, setSavedItemsCount] = useState(0)
  const [savedUniversities, setSavedUniversities] = useState<{id:string, university_id:string, note?:string, created_at:string}[]>([])
  const [experiences, setExperiences] = useState<any[]>([])
  const [education, setEducation] = useState<any[]>([])
  const [newExperience, setNewExperience] = useState({ title: '', company: '', location: '', start_date: '', end_date: '', current: false, description: '' })
  const [newEducation, setNewEducation] = useState({ school: '', degree: '', field: '', start_year: '', end_year: '', description: '' })
  const [showProfileEditor, setShowProfileEditor] = useState(false)
  const [showPasswordEditor, setShowPasswordEditor] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    email: '',
    full_name: '',
    username: '',
    title: '',
    headline: '',
    location: '',
    phone: '',
    bio: '',
    website_url: '',
    linkedin_url: '',
    github_url: '',
    twitter_url: '',
    portfolio_url: '',
    is_profile_public: true,
    show_email: false,
    show_saved: false,
    show_reviews: true,
    show_socials: true,
    show_activity: true,
    subscription_status: 'free',
  })

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  useEffect(() => {
    const currentUser = getCurrentUser()
    if (!currentUser) {
      navigate('/login')
      return
    }
    fetchProfile()
    fetchSavedItems()
    fetchSavedUniversities()
    fetchSections()
  }, [navigate])

  const fetchProfile = async () => {
    try {
      const profile = await profileAPI.getProfile()
      setUser(profile)
      setProfileForm({
        email: profile.email || '',
        full_name: profile.full_name || '',
        username: profile.username || '',
        title: profile.title || '',
        headline: profile.headline || '',
        location: profile.location || '',
        phone: profile.phone || '',
        bio: profile.bio || '',
        website_url: profile.website_url || '',
        linkedin_url: profile.linkedin_url || '',
        github_url: profile.github_url || '',
        twitter_url: profile.twitter_url || '',
        portfolio_url: profile.portfolio_url || '',
        is_profile_public: profile.is_profile_public !== false,
        show_email: !!profile.show_email,
        show_saved: !!profile.show_saved,
        show_reviews: profile.show_reviews !== false,
        show_socials: profile.show_socials !== false,
        show_activity: profile.show_activity !== false,
        subscription_status: profile.subscription_status || 'free',
      })
    } catch (error: any) {
      console.error('Error fetching profile:', error)
      // Fallback to current user from token
      const currentUser = getCurrentUser()
      if (currentUser) {
        setUser({
          id: currentUser.id,
          email: currentUser.email,
          role: currentUser.role,
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const fetchSections = async () => {
    try {
      const [ex, ed] = await Promise.all([
        profileSectionsAPI.list('experiences'),
        profileSectionsAPI.list('education'),
      ])
      setExperiences(Array.isArray(ex) ? ex : [])
      setEducation(Array.isArray(ed) ? ed : [])
    } catch {}
  }

  const fetchSavedUniversities = async () => {
    try {
      const list = await savedMatchesAPI.list()
      setSavedUniversities(Array.isArray(list) ? list : [])
    } catch (e) {
      setSavedUniversities([])
    }
  }

  const fetchSavedItems = async () => {
    try {
      const items = await savedItemsAPI.getSavedItems()
      setSavedItems(items)
      
      // Count by type
      const articlesCount = items.filter((i: SavedItem) => i.item_type === 'article').length
      const resourcesCount = items.filter((i: SavedItem) => i.item_type === 'resource').length
      setSavedItemsCount(items.length)
    } catch (error: any) {
      console.error('Error fetching saved items:', error)
    }
  }

  const handleSignOut = () => {
    authAPI.logout()
    navigate('/')
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      const updated = await profileAPI.updateProfile(profileForm)
      setUser(updated)
      setShowProfileEditor(false)
      alert('Profile updated successfully!')
    } catch (error: any) {
      setError(error.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('New passwords do not match')
      setSaving(false)
      return
    }

    if (passwordForm.newPassword.length < 6) {
      setError('Password must be at least 6 characters')
      setSaving(false)
      return
    }

    try {
      await profileAPI.updatePassword(passwordForm.currentPassword, passwordForm.newPassword)
      setShowPasswordEditor(false)
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      alert('Password updated successfully!')
    } catch (error: any) {
      setError(error.message || 'Failed to update password')
    } finally {
      setSaving(false)
    }
  }

  const handleUnsaveItem = async (type: string, id: string) => {
    try {
      await savedItemsAPI.unsaveItem(type, id)
      fetchSavedItems()
    } catch (error: any) {
      alert('Failed to unsave item: ' + error.message)
    }
  }

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  const articlesCount = savedItems.filter(i => i.item_type === 'article').length
  const resourcesCount = savedItems.filter(i => i.item_type === 'resource').length

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.full_name || user?.email}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Card */}
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  {user?.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.full_name || user.email}
                      className="w-16 h-16 rounded-full mr-4 object-cover"
                    />
                  ) : (
                    <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mr-4">
                      <User className="h-8 w-8 text-primary-600" />
                    </div>
                  )}
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Profile</h2>
                    <p className="text-gray-600">{user?.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowProfileEditor(!showProfileEditor)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary-600 hover:text-primary-700 border border-primary-300 rounded-lg hover:bg-primary-50 transition-colors"
                >
                  <Settings className="h-4 w-4" />
                  {showProfileEditor ? 'Cancel' : 'Edit Profile'}
                </button>
              </div>

              {showProfileEditor ? (
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                      {error}
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Public Username</label>
                    <input
                      type="text"
                      value={profileForm.username}
                      onChange={(e) => setProfileForm({ ...profileForm, username: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="e.g. ayoub"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={profileForm.full_name}
                      onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                      <input type="text" value={profileForm.title} onChange={(e)=> setProfileForm({ ...profileForm, title: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500" placeholder="e.g. Computer Science Student" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Headline</label>
                      <input type="text" value={profileForm.headline} onChange={(e)=> setProfileForm({ ...profileForm, headline: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500" placeholder="e.g. Interested in AI/ML, looking for internships" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <input type="text" value={profileForm.location} onChange={(e)=> setProfileForm({ ...profileForm, location: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500" placeholder="City, Country" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                    <input
                      type="email"
                      required
                      value={profileForm.email}
                      onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                    <textarea
                      value={profileForm.bio}
                      onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Tell us about yourself..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Links</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input type="url" placeholder="Website" value={profileForm.website_url} onChange={(e)=> setProfileForm({ ...profileForm, website_url: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
                      <input type="url" placeholder="LinkedIn" value={profileForm.linkedin_url} onChange={(e)=> setProfileForm({ ...profileForm, linkedin_url: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
                      <input type="url" placeholder="GitHub" value={profileForm.github_url} onChange={(e)=> setProfileForm({ ...profileForm, github_url: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
                      <input type="url" placeholder="Twitter / X" value={profileForm.twitter_url} onChange={(e)=> setProfileForm({ ...profileForm, twitter_url: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
                      <input type="url" placeholder="Portfolio" value={profileForm.portfolio_url} onChange={(e)=> setProfileForm({ ...profileForm, portfolio_url: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 md:col-span-2" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Privacy</label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                      <label className="flex items-center gap-2"><input type="checkbox" checked={profileForm.is_profile_public} onChange={(e)=> setProfileForm({ ...profileForm, is_profile_public: e.target.checked })} /> Public Profile</label>
                      <label className="flex items-center gap-2"><input type="checkbox" checked={profileForm.show_email} onChange={(e)=> setProfileForm({ ...profileForm, show_email: e.target.checked })} /> Show Email</label>
                      <label className="flex items-center gap-2"><input type="checkbox" checked={profileForm.show_socials} onChange={(e)=> setProfileForm({ ...profileForm, show_socials: e.target.checked })} /> Show Socials</label>
                      <label className="flex items-center gap-2"><input type="checkbox" checked={profileForm.show_reviews} onChange={(e)=> setProfileForm({ ...profileForm, show_reviews: e.target.checked })} /> Show Reviews</label>
                      <label className="flex items-center gap-2"><input type="checkbox" checked={profileForm.show_saved} onChange={(e)=> setProfileForm({ ...profileForm, show_saved: e.target.checked })} /> Show Saved Items</label>
                      <label className="flex items-center gap-2"><input type="checkbox" checked={profileForm.show_activity} onChange={(e)=> setProfileForm({ ...profileForm, show_activity: e.target.checked })} /> Show Activity</label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subscription Status</label>
                    <select
                      value={profileForm.subscription_status}
                      onChange={(e) => setProfileForm({ ...profileForm, subscription_status: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="free">Free</option>
                      <option value="premium">Premium</option>
                      <option value="enterprise">Enterprise</option>
                    </select>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={saving}
                      className="btn-primary flex items-center gap-2"
                    >
                      <Save className="h-4 w-4" />
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowProfileEditor(false)}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <p className="text-gray-900">{user?.full_name || 'Not set'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <p className="text-gray-900">{user?.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <p className="text-gray-900">{user?.phone || 'Not set'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                    <p className="text-gray-900">{user?.bio || 'Not set'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subscription</label>
                    <div className="flex items-center gap-2">
                      <Crown className={`h-4 w-4 ${user?.subscription_status === 'premium' ? 'text-yellow-500' : 'text-gray-400'}`} />
                      <span className="text-gray-900 capitalize">{user?.subscription_status || 'free'}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Password Management */}
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Lock className="h-6 w-6 text-primary-600" />
                  <h2 className="text-xl font-bold text-gray-900">Password Management</h2>
                </div>
                <button
                  onClick={() => setShowPasswordEditor(!showPasswordEditor)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary-600 hover:text-primary-700 border border-primary-300 rounded-lg hover:bg-primary-50 transition-colors"
                >
                  <Lock className="h-4 w-4" />
                  {showPasswordEditor ? 'Cancel' : 'Change Password'}
                </button>
              </div>

              {showPasswordEditor && (
                <form onSubmit={handlePasswordUpdate} className="space-y-4">
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                      {error}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? 'text' : 'password'}
                        required
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 pr-10"
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">Must be at least 6 characters</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      minLength={6}
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={saving}
                      className="btn-primary flex items-center gap-2"
                    >
                      <Lock className="h-4 w-4" />
                      {saving ? 'Updating...' : 'Update Password'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowPasswordEditor(false)
                        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
                        setError(null)
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Saved Items */}
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Save className="h-6 w-6 text-primary-600" />
                  <h2 className="text-xl font-bold text-gray-900">Saved Items</h2>
                </div>
                <span className="text-sm text-gray-500">{savedItemsCount} items</span>
              </div>

              {savedItems.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Save className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>No saved items yet</p>
                  <p className="text-sm mt-1">Save articles, resources, and universities to access them here</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {savedItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs px-2 py-1 bg-primary-100 text-primary-700 rounded-full capitalize">
                            {item.item_type}
                          </span>
                          <span className="text-sm text-gray-600 font-mono">
                            {item.item_id.slice(0, 8)}...
                          </span>
                        </div>
                        {item.item_data?.title && (
                          <p className="text-sm font-medium text-gray-900 mt-1">{item.item_data.title}</p>
                        )}
                      </div>
                      <button
                        onClick={() => handleUnsaveItem(item.item_type, item.item_id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        title="Unsave"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="card">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link
                  to="/matching-engine"
                  className="flex items-center p-4 border-2 border-gray-200 rounded-lg hover:border-primary-600 hover:bg-primary-50 transition-colors"
                >
                  <Compass className="h-6 w-6 text-primary-600 mr-3" />
                  <span className="font-semibold">University Matcher</span>
                </Link>
                <Link
                  to="/orientation"
                  className="flex items-center p-4 border-2 border-gray-200 rounded-lg hover:border-primary-600 hover:bg-primary-50 transition-colors"
                >
                  <GraduationCap className="h-6 w-6 text-primary-600 mr-3" />
                  <span className="font-semibold">Browse Orientation</span>
                </Link>
                <Link
                  to="/blog"
                  className="flex items-center p-4 border-2 border-gray-200 rounded-lg hover:border-primary-600 hover:bg-primary-50 transition-colors"
                >
                  <BookOpen className="h-6 w-6 text-primary-600 mr-3" />
                  <span className="font-semibold">Read Articles</span>
                </Link>
                <Link
                  to="/university-claims/claim"
                  className="flex items-center p-4 border-2 border-gray-200 rounded-lg hover:border-primary-600 hover:bg-primary-50 transition-colors"
                >
                  <GraduationCap className="h-6 w-6 text-primary-600 mr-3" />
                  <span className="font-semibold">Claim University</span>
                </Link>
                {user?.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="flex items-center p-4 border-2 border-gray-200 rounded-lg hover:border-primary-600 hover:bg-primary-50 transition-colors"
                  >
                    <Settings className="h-6 w-6 text-primary-600 mr-3" />
                    <span className="font-semibold">Admin Dashboard</span>
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Experiences & Education */}
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Experience</h2>
            <div className="space-y-3 mb-6">
              {experiences.length === 0 && <div className="text-sm text-gray-500">No experiences yet</div>}
              {experiences.map((e) => (
                <div key={e.id} className="p-3 border rounded-lg flex items-start justify-between">
                  <div>
                    <div className="font-semibold text-sm text-gray-900">{e.title} {e.company ? `• ${e.company}` : ''}</div>
                    <div className="text-xs text-gray-500">{e.location || ''}</div>
                    <div className="text-xs text-gray-500">{e.start_date || ''} {e.end_date ? `- ${e.end_date}` : e.current ? '- Present' : ''}</div>
                    {e.description && <div className="text-sm text-gray-700 mt-1 whitespace-pre-line">{e.description}</div>}
                  </div>
                  <button className="text-xs text-red-600" onClick={async()=>{ await profileSectionsAPI.remove('experiences', e.id); fetchSections(); }}>Remove</button>
                </div>
              ))}
            </div>

            <h3 className="text-sm font-semibold text-gray-700 mb-2">Add Experience</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input className="border rounded px-2 py-1 text-sm" placeholder="Title" value={newExperience.title} onChange={(e)=> setNewExperience({ ...newExperience, title: e.target.value })} />
              <input className="border rounded px-2 py-1 text-sm" placeholder="Company" value={newExperience.company} onChange={(e)=> setNewExperience({ ...newExperience, company: e.target.value })} />
              <input className="border rounded px-2 py-1 text-sm" placeholder="Location" value={newExperience.location} onChange={(e)=> setNewExperience({ ...newExperience, location: e.target.value })} />
              <div className="grid grid-cols-2 gap-2">
                <input className="border rounded px-2 py-1 text-sm" type="date" value={newExperience.start_date} onChange={(e)=> setNewExperience({ ...newExperience, start_date: e.target.value })} />
                <input className="border rounded px-2 py-1 text-sm" type="date" value={newExperience.end_date} onChange={(e)=> setNewExperience({ ...newExperience, end_date: e.target.value })} />
              </div>
              <div className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={newExperience.current} onChange={(e)=> setNewExperience({ ...newExperience, current: e.target.checked })} /> Current
              </div>
              <textarea className="border rounded px-2 py-1 text-sm md:col-span-2" placeholder="Description" value={newExperience.description} onChange={(e)=> setNewExperience({ ...newExperience, description: e.target.value })} />
            </div>
            <div className="mt-3">
              <button className="btn-primary text-sm" onClick={async()=>{ if(!newExperience.title) return; await profileSectionsAPI.create('experiences', newExperience); setNewExperience({ title:'', company:'', location:'', start_date:'', end_date:'', current:false, description:''}); fetchSections(); }}>Add Experience</button>
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Education</h2>
            <div className="space-y-3 mb-6">
              {education.length === 0 && <div className="text-sm text-gray-500">No education yet</div>}
              {education.map((ed) => (
                <div key={ed.id} className="p-3 border rounded-lg flex items-start justify-between">
                  <div>
                    <div className="font-semibold text-sm text-gray-900">{ed.school}</div>
                    <div className="text-xs text-gray-700">{ed.degree} {ed.field ? `— ${ed.field}` : ''}</div>
                    <div className="text-xs text-gray-500">{ed.start_year || ''}{ed.end_year ? ` - ${ed.end_year}` : ''}</div>
                    {ed.description && <div className="text-sm text-gray-700 mt-1 whitespace-pre-line">{ed.description}</div>}
                  </div>
                  <button className="text-xs text-red-600" onClick={async()=>{ await profileSectionsAPI.remove('education', ed.id); fetchSections(); }}>Remove</button>
                </div>
              ))}
            </div>

            <h3 className="text-sm font-semibold text-gray-700 mb-2">Add Education</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input className="border rounded px-2 py-1 text-sm" placeholder="School" value={newEducation.school} onChange={(e)=> setNewEducation({ ...newEducation, school: e.target.value })} />
              <input className="border rounded px-2 py-1 text-sm" placeholder="Degree" value={newEducation.degree} onChange={(e)=> setNewEducation({ ...newEducation, degree: e.target.value })} />
              <input className="border rounded px-2 py-1 text-sm" placeholder="Field" value={newEducation.field} onChange={(e)=> setNewEducation({ ...newEducation, field: e.target.value })} />
              <div className="grid grid-cols-2 gap-2">
                <input className="border rounded px-2 py-1 text-sm" placeholder="Start Year" value={newEducation.start_year} onChange={(e)=> setNewEducation({ ...newEducation, start_year: e.target.value })} />
                <input className="border rounded px-2 py-1 text-sm" placeholder="End Year" value={newEducation.end_year} onChange={(e)=> setNewEducation({ ...newEducation, end_year: e.target.value })} />
              </div>
              <textarea className="border rounded px-2 py-1 text-sm md:col-span-2" placeholder="Description" value={newEducation.description} onChange={(e)=> setNewEducation({ ...newEducation, description: e.target.value })} />
            </div>
            <div className="mt-3">
              <button className="btn-primary text-sm" onClick={async()=>{ if(!newEducation.school) return; await profileSectionsAPI.create('education', { ...newEducation, start_year: newEducation.start_year ? Number(newEducation.start_year) : null, end_year: newEducation.end_year ? Number(newEducation.end_year) : null }); setNewEducation({ school:'', degree:'', field:'', start_year:'', end_year:'', description:''}); fetchSections(); }}>Add Education</button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Saved Universities */}
            <div className="card">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Saved Universities</h3>
              {savedUniversities.length === 0 ? (
                <p className="text-sm text-gray-600">No universities saved yet.</p>
              ) : (
                <ul className="space-y-2">
                  {savedUniversities.slice(0, 6).map((s) => (
                    <li key={s.id} className="text-sm text-gray-700 flex items-center justify-between">
                      <span className="truncate mr-2">{s.university_id}</span>
                      <button
                        onClick={async ()=> { await savedMatchesAPI.unsave(s.university_id); fetchSavedUniversities(); }}
                        className="text-xs text-red-600 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {/* Account Info */}
            <div className="card">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Account</h3>
              <button
                onClick={handleSignOut}
                className="w-full flex items-center justify-center space-x-2 text-red-600 hover:text-red-700 font-semibold py-2 px-4 rounded-lg border-2 border-red-200 hover:border-red-300 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
            </div>

            {/* Stats */}
            <div className="card">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Your Activity</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Articles Read</span>
                  <span className="font-semibold">{articlesCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Resources Saved</span>
                  <span className="font-semibold">{resourcesCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Saved</span>
                  <span className="font-semibold">{savedItemsCount}</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                  <span className="text-gray-600 flex items-center gap-2">
                    <Crown className={`h-4 w-4 ${user?.subscription_status === 'premium' ? 'text-yellow-500' : 'text-gray-400'}`} />
                    Premium Content
                  </span>
                  <span className={`font-semibold ${user?.subscription_status === 'premium' ? 'text-primary-600' : 'text-gray-500'}`}>
                    {user?.subscription_status === 'premium' ? 'Accessible' : 'Upgrade'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
