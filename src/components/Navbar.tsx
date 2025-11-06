import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Menu, X, User, LogOut, GraduationCap, Settings, Bell } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { authAPI, getCurrentUser, staticPagesAPI, notificationsAPI } from '../lib/api'
import LanguageSwitcher from './LanguageSwitcher'
import { motion, AnimatePresence } from 'framer-motion'

interface User {
  id: string
  email: string
  role?: string
}

interface NavbarProps {
  onAdminMenuToggle?: () => void
  showAdminMenu?: boolean
  isAdmin?: boolean
}

interface StaticPage {
  id: string;
  slug: string;
  title: string;
  visibility_areas: string[];
  sort_order: number;
}

// Permanent features that always appear in navbar
const PERMANENT_FEATURES = [
  { path: '/blog', label: 'Blog' },
  { path: '/orientation', label: 'Orientation' },
];

export default function Navbar({ onAdminMenuToggle, showAdminMenu }: NavbarProps = {}) {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [navbarPages, setNavbarPages] = useState<StaticPage[]>([])
  const [unreadCount, setUnreadCount] = useState<number>(0)
  const [showNotifs, setShowNotifs] = useState(false)
  const [notifications, setNotifications] = useState<any[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    // Get initial user from localStorage
    const currentUser = getCurrentUser()
    setUser(currentUser)
    
    // Fetch pages that should be displayed in navbar
    const fetchNavbarPages = async () => {
      try {
        const pages = await staticPagesAPI.getNavbarPages()
        setNavbarPages(pages || [])
      } catch (err) {
        console.error('Failed to fetch navbar pages:', err)
        setNavbarPages([])
      }
    }
    
    fetchNavbarPages()
  }, [])

  // Notifications polling (lightweight)
  useEffect(() => {
    let mounted = true
    let interval: any
    async function load() {
      try {
        if (!user) { setUnreadCount(0); setNotifications([]); return }
        const [{ count }, list] = await Promise.all([
          notificationsAPI.unreadCount(),
          notificationsAPI.list(),
        ])
        if (!mounted) return
        setUnreadCount(Number(count || 0))
        setNotifications(Array.isArray(list) ? list.slice(0, 10) : [])
      } catch {}
    }
    load()
    interval = setInterval(load, 15000)
    return () => { mounted = false; clearInterval(interval) }
  }, [user])

  // Listen for storage changes (e.g., login/logout from another tab)
  useEffect(() => {
    const handleStorageChange = () => {
      const currentUser = getCurrentUser()
      setUser(currentUser)
    }

    window.addEventListener('storage', handleStorageChange)
    // Also check periodically (in case of same-tab changes)
    const interval = setInterval(() => {
      const currentUser = getCurrentUser()
      if (currentUser?.id !== user?.id) {
        setUser(currentUser)
      }
    }, 1000)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(interval)
    }
  }, [user])

  const handleSignOut = () => {
    authAPI.logout()
    setUser(null)
    navigate('/')
  }

  // Calculate spacing based on number of items
  const permanentFeaturesCount = PERMANENT_FEATURES.length
  const pagesCount = navbarPages.length
  const matcherCount = user ? 1 : 0
  const totalNavItems = permanentFeaturesCount + pagesCount + matcherCount
  
  // Calculate dynamic spacing (more items = less padding, fewer items = more padding)
  const getNavItemSpacing = () => {
    if (totalNavItems <= 3) return 'space-x-4'
    if (totalNavItems <= 5) return 'space-x-3'
    if (totalNavItems <= 7) return 'space-x-2'
    return 'space-x-1'
  }

  const navItemSpacing = getNavItemSpacing()

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white/95 backdrop-blur-md shadow-md sticky top-0 z-50 border-b border-gray-100"
    >
      <div className="w-full px-2 sm:px-3 lg:px-4">
        <div className="flex justify-between items-center h-16 gap-2">
          {/* Left side: Admin Menu Toggle (for admin users) + Logo */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            {/* Admin Menu Toggle Button (far left, only for admin) */}
            {user?.role === 'admin' && (
              <button
                onClick={onAdminMenuToggle}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors group"
                title="Admin Menu"
              >
                <Settings className={`h-5 w-5 transition-colors duration-200 ${
                  showAdminMenu ? 'text-blue-600' : 'text-gray-600 group-hover:text-blue-600'
                }`} />
              </button>
            )}
            
            {/* Logo - Always navigates to home */}
            <Link to="/" className="flex items-center space-x-2 group">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ duration: 0.3 }}
              >
                <GraduationCap className="h-8 w-8 text-primary-600" />
              </motion.div>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                AcademOra
              </span>
            </Link>
          </div>

          {/* Center: Navigation Items */}
          <div className={`hidden md:flex items-center ${navItemSpacing} flex-1 justify-center min-w-0`}>
            {/* Permanent Features Section */}
            {PERMANENT_FEATURES.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="relative text-gray-700 hover:text-primary-600 transition-colors px-1 py-1 group"
              >
                <span className="relative z-10">{item.label}</span>
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600"
                  initial={{ scaleX: 0 }}
                  whileHover={{ scaleX: 1 }}
                  transition={{ duration: 0.3 }}
                />
              </Link>
            ))}

            {/* Static Pages Section (from editor) */}
            {navbarPages.map((page) => (
              <Link
                key={page.id}
                to={`/${page.slug}`}
                className="relative text-gray-700 hover:text-primary-600 transition-colors px-1 py-1 group"
              >
                <span className="relative z-10">{page.title}</span>
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600"
                  initial={{ scaleX: 0 }}
                  whileHover={{ scaleX: 1 }}
                  transition={{ duration: 0.3 }}
                />
              </Link>
            ))}

            {/* Matcher (only for logged-in users) */}
            {user && (
              <Link
                to="/matching-engine"
                className="relative text-gray-700 font-medium hover:text-primary-600 transition-colors px-1 py-1 group"
              >
                <span className="relative z-10">{t('common.matcher')}</span>
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600"
                  initial={{ scaleX: 0 }}
                  whileHover={{ scaleX: 1 }}
                  transition={{ duration: 0.3 }}
                />
              </Link>
            )}
          </div>

          {/* Right side: User Actions */}
          <div className="hidden md:flex items-center space-x-2 flex-shrink-0 relative">
            {user && (
              <div className="relative">
                <button
                  onClick={() => setShowNotifs(!showNotifs)}
                  className="relative flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors group"
                  title="Notifications"
                >
                  <Bell className="h-5 w-5 text-gray-600 group-hover:text-primary-600" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
                {showNotifs && (
                  <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-[60]">
                    <div className="flex items-center justify-between px-3 py-2 border-b">
                      <div className="text-sm font-semibold">Notifications</div>
                      <button className="text-xs text-primary-600 hover:underline" onClick={async()=>{ await notificationsAPI.markAllRead(); setUnreadCount(0) }}>Mark all read</button>
                    </div>
                    <div className="max-h-80 overflow-auto divide-y">
                      {notifications.length === 0 ? (
                        <div className="p-3 text-sm text-gray-500">No notifications</div>
                      ) : notifications.map((n) => (
                        <div key={n.id} className="p-3 text-sm">
                          <div className="font-medium text-gray-900">{n.type}</div>
                          {n.payload?.message && <div className="text-gray-600 mt-0.5">{n.payload.message}</div>}
                          <div className="text-xs text-gray-400 mt-1">{new Date(n.created_at).toLocaleString()}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            {user ? (
              <>
                {/* Sign Out Button with Icon */}
                <button
                  onClick={handleSignOut}
                  className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors group"
                  title="Sign Out"
                >
                  <LogOut className="h-5 w-5 text-gray-600 group-hover:text-red-600 transition-colors" />
                </button>
              </>
            ) : (
              <>
                {/* Sign In Button with Icon */}
                <Link
                  to="/login"
                  className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors group"
                  title="Sign In"
                >
                  <User className="h-5 w-5 text-gray-600 group-hover:text-primary-600 transition-colors" />
                </Link>
              </>
            )}
            <LanguageSwitcher />
          </div>

          {/* Mobile menu button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            className="md:hidden text-gray-700 hover:text-primary-600"
            onClick={() => setIsOpen(!isOpen)}
          >
            <AnimatePresence mode="wait">
              {isOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                >
                  <X className="h-6 w-6" />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                >
                  <Menu className="h-6 w-6" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden border-t border-gray-200 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-3 space-y-1">
              {/* Permanent Features */}
              {PERMANENT_FEATURES.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </Link>
              ))}

              {/* Static Pages */}
              {navbarPages.map((page) => (
                <Link
                  key={page.id}
                  to={`/${page.slug}`}
                  className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                  onClick={() => setIsOpen(false)}
                >
                  {page.title}
                </Link>
              ))}

              {/* Matcher (only for logged-in users) */}
              {user && (
                <Link
                  to="/matching-engine"
                  className="block px-3 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-md"
                  onClick={() => setIsOpen(false)}
                >
                  {t('common.matcher')}
                </Link>
              )}

              {/* User Actions */}
              {user ? (
                <>
                  <button
                    onClick={() => {
                      handleSignOut()
                      setIsOpen(false)
                    }}
                    className="block w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md flex items-center space-x-2"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>{t('common.signOut')}</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md flex items-center space-x-2"
                    onClick={() => setIsOpen(false)}
                  >
                    <User className="h-4 w-4" />
                    <span>{t('common.login')}</span>
                  </Link>
                  <Link
                    to="/signup"
                    className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                    onClick={() => setIsOpen(false)}
                  >
                    {t('common.signup')}
                  </Link>
                </>
              )}
              <div className="pt-2 border-t border-gray-200 mt-2">
                <LanguageSwitcher />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}
