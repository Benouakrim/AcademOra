import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { 
  Menu, X, User, LogOut, Sparkles, Settings, Bell, ChevronDown, BookOpen, FileText, 
  Gift, LayoutDashboard, GitCompare, Users, Building2, BarChart3, Sliders, UserCog
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { authAPI, getCurrentUser, staticPagesAPI, notificationsAPI } from '../lib/api'
import LanguageSwitcher from './LanguageSwitcher'
import { motion, AnimatePresence } from 'framer-motion'
import LogoutConfirmDialog from './LogoutConfirmDialog'
import ThemeModeToggle from './ThemeModeToggle'

interface User {
  id: string
  email: string
  role?: string
  avatar_url?: string
}

interface Notification {
  id: string
  title?: string
  message?: string
  type?: string
  created_at?: string
  is_read?: boolean
  action_url?: string
  metadata?: {
    title?: string
    message?: string
  }
}

interface NavbarProps {
  onAdminMenuToggle?: () => void
  showAdminMenu?: boolean
  onUserMenuToggle?: () => void
  showUserMenu?: boolean
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
  { path: '/orientation', label: 'Services' },
  { path: '/explore', label: 'Features' },
  { path: '/our-company', label: 'Our Company' },
  { path: '/pricing', label: 'Pricing' },
];

export default function Navbar({ onAdminMenuToggle, showAdminMenu, onUserMenuToggle, showUserMenu }: NavbarProps = {}) {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [isDashboardDropdownOpen, setIsDashboardDropdownOpen] = useState(false)
  const [isAdminDropdownOpen, setIsAdminDropdownOpen] = useState(false)
  const [isMobileDashboardOpen, setIsMobileDashboardOpen] = useState(false)
  const [isMobileAdminOpen, setIsMobileAdminOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [navbarPages, setNavbarPages] = useState<StaticPage[]>([])
  const [unreadCount, setUnreadCount] = useState<number>(0)
  const [showNotifs, setShowNotifs] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const navigate = useNavigate()
  const isAdminUser = user?.role === 'admin'
  const canToggleUserMenu = !!user && !isAdminUser

  useEffect(() => {
    // Get initial user from localStorage
    const currentUser = getCurrentUser() as User | null
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
      } catch (err) {
        if (!mounted) return
        console.warn('Notifications unavailable:', err)
        setUnreadCount(0)
        setNotifications([])
      }
    }
    load()
    const intervalId = setInterval(load, 15000)
    return () => { mounted = false; clearInterval(intervalId) }
  }, [user])

  // Listen for storage changes (e.g., login/logout from another tab)
  useEffect(() => {
    const handleStorageChange = () => {
      const currentUser = getCurrentUser() as User | null
      setUser(currentUser)
    }

    window.addEventListener('storage', handleStorageChange)
    // Also check periodically (in case of same-tab changes)
    const interval = setInterval(() => {
      const currentUser = getCurrentUser() as User | null
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
    setShowLogoutConfirm(true)
  }

  const confirmSignOut = () => {
    setShowLogoutConfirm(false)
    authAPI.logout()
    setUser(null)
    navigate('/')
  }

  const cancelSignOut = () => {
    setShowLogoutConfirm(false)
  }

  return (
    <>
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-[var(--color-bg-primary)]/80 backdrop-blur-md shadow-2xl sticky top-0 z-50"
    >
      {/* Animated background glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-accent-secondary)]/10 via-[var(--color-bg-primary)] to-[var(--color-accent-primary)]/10" />
      
      <div className="relative w-full px-2 sm:px-3 lg:px-4">
        <div className="flex justify-between items-center h-16 gap-2">
          {/* Left side: Admin Menu Toggle + Logo */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            {/* User Menu Toggle Button */}
            {canToggleUserMenu && (
              <motion.button
                onClick={onUserMenuToggle}
                className="p-2 rounded-lg bg-[var(--color-interactive-bg)] backdrop-blur-sm border border-[var(--color-border-primary)] hover:bg-[var(--color-interactive-bg-hover)] transition-all duration-300 group"
                title="User Menu"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Menu
                  className={`h-5 w-5 transition-colors duration-200 ${
                    showUserMenu ? 'text-[var(--color-accent-secondary)]' : 'text-[var(--color-text-tertiary)] group-hover:text-[var(--color-accent-secondary)]'
                  }`}
                />
              </motion.button>
            )}
            {/* Admin Menu Toggle Button */}
            {isAdminUser && (
              <motion.button
                onClick={onAdminMenuToggle}
                className="p-2 rounded-lg bg-[var(--color-interactive-bg)] backdrop-blur-sm border border-[var(--color-border-primary)] hover:bg-[var(--color-interactive-bg-hover)] transition-all duration-300 group"
                title="Admin Menu"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Settings className={`h-5 w-5 transition-colors duration-200 ${
                  showAdminMenu ? 'text-[var(--color-accent-secondary)]' : 'text-[var(--color-text-tertiary)] group-hover:text-[var(--color-accent-secondary)]'
                }`} />
              </motion.button>
            )}
            
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 group">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ duration: 0.3 }}
                className="relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-accent-secondary)] to-[var(--color-accent-primary)] rounded-lg blur-md opacity-50 group-hover:opacity-75 transition-opacity" />
                <Sparkles className="h-8 w-8 text-[var(--color-accent-secondary)] relative z-10" />
              </motion.div>
              <span className="text-2xl font-black bg-gradient-to-r from-[var(--color-accent-secondary)] via-[var(--color-accent-primary)] to-[var(--color-accent-primary)] bg-clip-text text-transparent">
                AcademOra
              </span>
            </Link>
          </div>

          {/* Center: Navigation Items */}
          <div className="hidden md:flex items-center space-x-8 flex-1 justify-center min-w-0">
            {PERMANENT_FEATURES.map((item) => (
              <motion.div
                key={item.path}
                whileHover={{ y: -2 }}
                transition={{ duration: 0.2 }}
                className="relative"
              >
                <Link
                  to={item.path}
                  className="relative text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors px-3 py-2 group"
                >
                  <span className="relative z-10 font-medium">{item.label}</span>
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[var(--color-accent-secondary)] to-[var(--color-accent-primary)]"
                    initial={{ scaleX: 0 }}
                    whileHover={{ scaleX: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                </Link>
              </motion.div>
            ))}

            {/* Static Pages */}
            {navbarPages.filter(page => page.slug !== 'about').map((page) => (
              <motion.div
                key={page.id}
                whileHover={{ y: -2 }}
                transition={{ duration: 0.2 }}
              >
                <Link
                  to={`/${page.slug}`}
                  className="relative text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors px-3 py-2 group"
                >
                  <span className="relative z-10 font-medium">{page.title}</span>
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[var(--color-accent-secondary)] to-[var(--color-accent-primary)]"
                    initial={{ scaleX: 0 }}
                    whileHover={{ scaleX: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Right side: User Actions */}
          <div className="hidden md:flex items-center space-x-3 flex-shrink-0 relative">
            {/* Theme mode toggle (public) */}
            <ThemeModeToggle />
            {user && (
              <div className="relative">
                <motion.button
                  onClick={() => setShowNotifs(!showNotifs)}
                  className="relative flex items-center justify-center w-10 h-10 rounded-full bg-[var(--color-interactive-bg)] backdrop-blur-sm border border-[var(--color-border-primary)] hover:bg-[var(--color-interactive-bg-hover)] transition-all duration-300 group"
                  title="Notifications"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Bell className="h-5 w-5 text-[var(--color-text-tertiary)] group-hover:text-[var(--color-accent-secondary)]" />
                  {unreadCount > 0 && (
                    <motion.span 
                      className="absolute -top-1 -right-1 bg-gradient-to-r from-[var(--color-accent-secondary)] to-[var(--color-accent-primary)] text-[var(--color-text-primary)] text-[10px] px-1.5 py-0.5 rounded-full"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </motion.span>
                  )}
                </motion.button>
                
                <AnimatePresence>
                  {showNotifs && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-80 bg-[var(--color-bg-secondary)]/95 backdrop-blur-md border border-[var(--color-border-secondary)] rounded-lg shadow-2xl z-[60]"
                    >
                      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border-secondary)]">
                        <div className="text-sm font-semibold text-[var(--color-text-primary)]">Notifications</div>
                        <button 
                          className="text-xs text-[var(--color-accent-secondary)] hover:text-[var(--color-accent-primary)] transition-colors" 
                          onClick={async()=>{ 
                            await notificationsAPI.markAllRead();
                            setUnreadCount(0);
                            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
                          }}
                        >
                          Mark all read
                        </button>
                      </div>
                      <div className="max-h-80 overflow-auto divide-y divide-[var(--color-border-secondary)]">
                        {notifications.length === 0 ? (
                          <div className="p-4 text-sm text-[var(--color-text-tertiary)]">No notifications</div>
                        ) : notifications.map((n) => {
                          const title = n.title || n.metadata?.title || n.type || 'Notification'
                          const message = n.message || n.metadata?.message
                          const createdAt = n.created_at ? new Date(n.created_at).toLocaleString() : ''

                          return (
                            <div key={n.id} className={`p-4 text-sm space-y-2 ${n.is_read ? '' : 'bg-[var(--color-interactive-bg)]'}`}>
                              <div className="flex items-center justify-between gap-3">
                                <div className="font-medium text-[var(--color-text-primary)] truncate" title={title}>{title}</div>
                                {!n.is_read && <span className="text-[10px] uppercase text-[var(--color-accent-secondary)]">New</span>}
                              </div>
                              {message && <div className="text-[var(--color-text-secondary)] leading-snug">{message}</div>}
                              {n.action_url && (
                                <Link
                                  to={n.action_url}
                                  className="inline-flex items-center gap-1 text-xs text-[var(--color-accent-secondary)] hover:text-[var(--color-accent-primary)] transition-colors"
                                  onClick={() => setShowNotifs(false)}
                                >
                                  View
                                  <ChevronDown className="h-3 w-3 rotate-[-90deg]" />
                                </Link>
                              )}
                              {createdAt && <div className="text-xs text-[var(--color-text-tertiary)]">{createdAt}</div>}
                            </div>
                          )
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
            
            {user && (
              <div
                className="relative"
                onMouseEnter={() => setIsDashboardDropdownOpen(true)}
                onMouseLeave={() => setIsDashboardDropdownOpen(false)}
              >
                <button
                  className="flex items-center gap-2 px-4 py-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors duration-300 group"
                >
                  {user?.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt="Profile"
                      className="w-8 h-8 rounded-full object-cover border-2 border-[var(--color-border-primary)] group-hover:border-[var(--color-accent-secondary)] transition-all"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none'
                      }}
                    />
                  ) : (
                    <LayoutDashboard className="h-5 w-5" />
                  )}
                  <span className="text-sm font-medium">Dashboard</span>
                  <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${isDashboardDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {isDashboardDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full right-0 mt-2 w-56 bg-[var(--color-bg-secondary)] backdrop-blur-xl rounded-2xl border border-[var(--color-border-secondary)] shadow-2xl overflow-hidden z-50"
                    >
                      <div className="py-2">
                        <Link
                          to="/dashboard"
                          className="flex items-center gap-3 px-4 py-3 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-interactive-bg-hover)] transition-all duration-200"
                          onClick={() => setIsDashboardDropdownOpen(false)}
                        >
                          <User className="h-4 w-4" />
                          <span className="text-sm font-semibold">Profile & Settings</span>
                        </Link>
                        <Link
                          to="/matching-engine"
                          className="flex items-center gap-3 px-4 py-3 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-interactive-bg-hover)] transition-all duration-200"
                          onClick={() => setIsDashboardDropdownOpen(false)}
                        >
                          <Sparkles className="h-4 w-4" />
                          <span className="text-sm font-semibold">Find Match</span>
                        </Link>
                        <Link
                          to="/compare"
                          className="flex items-center gap-3 px-4 py-3 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-interactive-bg-hover)] transition-all duration-200"
                          onClick={() => setIsDashboardDropdownOpen(false)}
                        >
                          <GitCompare className="h-4 w-4" />
                          <span className="text-sm font-semibold">Compare Universities</span>
                        </Link>
                        <Link
                          to="/referrals"
                          className="flex items-center gap-3 px-4 py-3 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-interactive-bg-hover)] transition-all duration-200"
                          onClick={() => setIsDashboardDropdownOpen(false)}
                        >
                          <Gift className="h-4 w-4" />
                          <span className="text-sm font-semibold">Referrals</span>
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {user?.role === 'admin' && (
              <div
                className="relative"
                onMouseEnter={() => setIsAdminDropdownOpen(true)}
                onMouseLeave={() => setIsAdminDropdownOpen(false)}
              >
                <button
                  className="flex items-center gap-2 px-4 py-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors duration-300 group"
                >
                  <UserCog className="h-5 w-5" />
                  <span className="text-sm font-medium">Admin</span>
                  <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${isAdminDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {isAdminDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full right-0 mt-2 w-56 bg-[var(--color-bg-secondary)] backdrop-blur-xl rounded-2xl border border-[var(--color-border-secondary)] shadow-2xl overflow-hidden z-50"
                    >
                      <div className="py-2">
                        <Link
                          to="/admin"
                          className="flex items-center gap-3 px-4 py-3 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-interactive-bg-hover)] transition-all duration-200"
                          onClick={() => setIsAdminDropdownOpen(false)}
                        >
                          <Sliders className="h-4 w-4" />
                          <span className="text-sm font-semibold">Dashboard</span>
                        </Link>
                        <Link
                          to="/admin/users"
                          className="flex items-center gap-3 px-4 py-3 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-interactive-bg-hover)] transition-all duration-200"
                          onClick={() => setIsAdminDropdownOpen(false)}
                        >
                          <Users className="h-4 w-4" />
                          <span className="text-sm font-semibold">Users</span>
                        </Link>
                        <Link
                          to="/admin/universities"
                          className="flex items-center gap-3 px-4 py-3 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-interactive-bg-hover)] transition-all duration-200"
                          onClick={() => setIsAdminDropdownOpen(false)}
                        >
                          <Building2 className="h-4 w-4" />
                          <span className="text-sm font-semibold">Universities</span>
                        </Link>
                        <Link
                          to="/admin/articles"
                          className="flex items-center gap-3 px-4 py-3 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-interactive-bg-hover)] transition-all duration-200"
                          onClick={() => setIsAdminDropdownOpen(false)}
                        >
                          <BookOpen className="h-4 w-4" />
                          <span className="text-sm font-semibold">Articles</span>
                        </Link>
                        <Link
                          to="/admin/analytics"
                          className="flex items-center gap-3 px-4 py-3 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-interactive-bg-hover)] transition-all duration-200"
                          onClick={() => setIsAdminDropdownOpen(false)}
                        >
                          <BarChart3 className="h-4 w-4" />
                          <span className="text-sm font-semibold">Analytics</span>
                        </Link>
                        <Link
                          to="/admin/pages"
                          className="flex items-center gap-3 px-4 py-3 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-interactive-bg-hover)] transition-all duration-200"
                          onClick={() => setIsAdminDropdownOpen(false)}
                        >
                          <FileText className="h-4 w-4" />
                          <span className="text-sm font-semibold">Pages</span>
                        </Link>
                        <Link
                          to="/admin/media"
                          className="flex items-center gap-3 px-4 py-3 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-interactive-bg-hover)] transition-all duration-200"
                          onClick={() => setIsAdminDropdownOpen(false)}
                        >
                          <Settings className="h-4 w-4" />
                          <span className="text-sm font-semibold">Media</span>
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {user ? (
              <motion.button
                onClick={handleSignOut}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-[var(--color-interactive-bg)] backdrop-blur-sm border border-[var(--color-border-primary)] hover:bg-[var(--heatmap-risk)]/20 hover:border-[var(--heatmap-risk)] transition-all duration-300 group"
                title="Sign Out"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <LogOut className="h-5 w-5 text-[var(--color-text-tertiary)] group-hover:text-[var(--heatmap-risk)] transition-colors" />
              </motion.button>
            ) : (
              <>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to="/login"
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-[var(--color-interactive-bg)] backdrop-blur-sm border border-[var(--color-border-primary)] hover:bg-[var(--color-accent-secondary)]/20 hover:border-[var(--color-accent-secondary)] transition-all duration-300 group"
                    title="Sign In"
                  >
                    <User className="h-5 w-5 text-[var(--color-text-tertiary)] group-hover:text-[var(--color-accent-secondary)] transition-colors" />
                  </Link>
                </motion.div>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[var(--color-accent-secondary)] to-[var(--color-accent-primary)] px-4 py-2 text-sm font-semibold text-[var(--color-text-primary)] shadow-lg transition hover:opacity-90"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Create Account</span>
                </Link>
              </>
            )}
            
            <div className="bg-[var(--color-interactive-bg)] backdrop-blur-sm border border-[var(--color-border-primary)] rounded-lg px-3 py-2">
              <LanguageSwitcher />
            </div>
          </div>

          {/* Mobile menu button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            className="md:hidden text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] p-2 rounded-lg bg-[var(--color-interactive-bg)] backdrop-blur-sm border border-[var(--color-border-primary)]"
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
            className="md:hidden overflow-hidden bg-[var(--color-bg-primary)]/80 backdrop-blur-md"
          >
            <div className="px-4 pt-4 pb-3 space-y-2">
              {/* Permanent Features */}
              {PERMANENT_FEATURES.map((item) => (
                <motion.div
                  key={item.path}
                  whileHover={{ x: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <Link
                    to={item.path}
                    className="block px-4 py-3 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-interactive-bg)] rounded-lg transition-all duration-300 font-medium"
                    onClick={() => setIsOpen(false)}
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}

              {/* Static Pages */}
              {navbarPages.filter(page => page.slug !== 'about').map((page) => (
                <motion.div
                  key={page.id}
                  whileHover={{ x: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <Link
                    to={`/${page.slug}`}
                    className="block px-4 py-3 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-interactive-bg)] rounded-lg transition-all duration-300 font-medium"
                    onClick={() => setIsOpen(false)}
                  >
                    {page.title}
                  </Link>
                </motion.div>
              ))}

              <div className="pt-3 border-t border-gray-800/50 mt-3">
                {/* User Actions */}
                {user ? (
                  <>
                    {/* Dashboard Menu */}
                    <motion.div
                      whileHover={{ x: 5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <button
                        onClick={() => setIsMobileDashboardOpen(!isMobileDashboardOpen)}
                        className="w-full text-left px-4 py-3 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-interactive-bg)] rounded-lg transition-all duration-300 font-medium flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-3">
                          <LayoutDashboard className="h-5 w-5" />
                          <span>Dashboard</span>
                        </div>
                        <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${isMobileDashboardOpen ? 'rotate-180' : ''}`} />
                      </button>
                      <AnimatePresence>
                        {isMobileDashboardOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden bg-[var(--color-interactive-bg)] rounded-lg ml-4 mt-1"
                          >
                            <Link
                              to="/dashboard"
                              className="px-4 py-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-interactive-bg-hover)] transition-all flex items-center space-x-3 rounded"
                              onClick={() => setIsOpen(false)}
                            >
                              <User className="h-4 w-4" />
                              <span className="font-semibold">Profile & Settings</span>
                            </Link>
                            <Link
                              to="/matching-engine"
                              className="px-4 py-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-interactive-bg-hover)] transition-all flex items-center space-x-3 rounded"
                              onClick={() => setIsOpen(false)}
                            >
                              <Sparkles className="h-4 w-4" />
                              <span className="font-semibold">Find Match</span>
                            </Link>
                            <Link
                              to="/compare"
                              className="px-4 py-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-interactive-bg-hover)] transition-all flex items-center space-x-3 rounded"
                              onClick={() => setIsOpen(false)}
                            >
                              <GitCompare className="h-4 w-4" />
                              <span className="font-semibold">Compare Universities</span>
                            </Link>
                            <Link
                              to="/referrals"
                              className="px-4 py-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-interactive-bg-hover)] transition-all flex items-center space-x-3 rounded"
                              onClick={() => setIsOpen(false)}
                            >
                              <Gift className="h-4 w-4" />
                              <span className="font-semibold">Referrals</span>
                            </Link>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                    
                    {/* Admin Menu */}
                    {user?.role === 'admin' && (
                      <motion.div
                        whileHover={{ x: 5 }}
                        transition={{ duration: 0.2 }}
                      >
                        <button
                          onClick={() => setIsMobileAdminOpen(!isMobileAdminOpen)}
                          className="w-full text-left px-4 py-3 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-interactive-bg)] rounded-lg transition-all duration-300 font-medium flex items-center justify-between"
                        >
                          <div className="flex items-center space-x-3">
                            <UserCog className="h-5 w-5" />
                            <span>Admin</span>
                          </div>
                          <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${isMobileAdminOpen ? 'rotate-180' : ''}`} />
                        </button>
                        <AnimatePresence>
                          {isMobileAdminOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden bg-[var(--color-interactive-bg)] rounded-lg ml-4 mt-1"
                            >
                              <Link
                                to="/admin"
                                className="px-4 py-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-interactive-bg-hover)] transition-all flex items-center space-x-3 rounded"
                                onClick={() => setIsOpen(false)}
                              >
                                <Sliders className="h-4 w-4" />
                                <span className="font-semibold">Dashboard</span>
                              </Link>
                              <Link
                                to="/admin/users"
                                className="px-4 py-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-interactive-bg-hover)] transition-all flex items-center space-x-3 rounded"
                                onClick={() => setIsOpen(false)}
                              >
                                <Users className="h-4 w-4" />
                                <span className="font-semibold">Users</span>
                              </Link>
                              <Link
                                to="/admin/universities"
                                className="px-4 py-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-interactive-bg-hover)] transition-all flex items-center space-x-3 rounded"
                                onClick={() => setIsOpen(false)}
                              >
                                <Building2 className="h-4 w-4" />
                                <span className="font-semibold">Universities</span>
                              </Link>
                              <Link
                                to="/admin/articles"
                                className="px-4 py-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-interactive-bg-hover)] transition-all flex items-center space-x-3 rounded"
                                onClick={() => setIsOpen(false)}
                              >
                                <BookOpen className="h-4 w-4" />
                                <span className="font-semibold">Articles</span>
                              </Link>
                              <Link
                                to="/admin/analytics"
                                className="px-4 py-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-interactive-bg-hover)] transition-all flex items-center space-x-3 rounded"
                                onClick={() => setIsOpen(false)}
                              >
                                <BarChart3 className="h-4 w-4" />
                                <span className="font-semibold">Analytics</span>
                              </Link>
                              <Link
                                to="/admin/pages"
                                className="px-4 py-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-interactive-bg-hover)] transition-all flex items-center space-x-3 rounded"
                                onClick={() => setIsOpen(false)}
                              >
                                <FileText className="h-4 w-4" />
                                <span className="font-semibold">Pages</span>
                              </Link>
                              <Link
                                to="/admin/media"
                                className="px-4 py-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-interactive-bg-hover)] transition-all flex items-center space-x-3 rounded"
                                onClick={() => setIsOpen(false)}
                              >
                                <Settings className="h-4 w-4" />
                                <span className="font-semibold">Media</span>
                              </Link>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    )}
                    
                    <motion.div
                      whileHover={{ x: 5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Link
                        to="/referrals"
                        className="w-full text-left px-4 py-3 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-interactive-bg)] rounded-lg transition-all duration-300 font-medium flex items-center space-x-3"
                        onClick={() => setIsOpen(false)}
                      >
                        <Gift className="h-5 w-5" />
                        <span>Referrals</span>
                      </Link>
                    </motion.div>
                    <motion.button
                      whileHover={{ x: 5 }}
                      transition={{ duration: 0.2 }}
                      onClick={() => {
                        handleSignOut()
                        setIsOpen(false)
                      }}
                      className="w-full text-left px-4 py-3 text-[var(--color-text-secondary)] hover:text-[var(--heatmap-risk)] hover:bg-[var(--heatmap-risk)]/10 rounded-lg transition-all duration-300 font-medium flex items-center space-x-3"
                    >
                      <LogOut className="h-5 w-5" />
                      <span>{t('common.signOut')}</span>
                    </motion.button>
                  </>
                ) : (
                  <>
                    <motion.div
                      whileHover={{ x: 5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Link
                        to="/login"
                        className="px-4 py-3 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-interactive-bg)] rounded-lg transition-all duration-300 font-medium flex items-center space-x-3"
                        onClick={() => setIsOpen(false)}
                      >
                        <User className="h-5 w-5" />
                        <span>{t('common.login')}</span>
                      </Link>
                    </motion.div>
                    <motion.div
                      whileHover={{ x: 5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Link
                        to="/login"
                        className="block px-4 py-3 rounded-lg bg-gradient-to-r from-[var(--color-accent-secondary)] to-[var(--color-accent-primary)] text-[var(--color-text-primary)] font-semibold shadow-lg transition-all duration-300 hover:opacity-90"
                        onClick={() => setIsOpen(false)}
                      >
                        {t('common.signup')}
                      </Link>
                    </motion.div>
                  </>
                )}
                
                <div className="pt-3 mt-3">
                  <div className="bg-[var(--color-interactive-bg)] backdrop-blur-sm border border-[var(--color-border-primary)] rounded-lg p-3">
                    <LanguageSwitcher />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
      <LogoutConfirmDialog
        open={showLogoutConfirm}
        onConfirm={confirmSignOut}
        onCancel={cancelSignOut}
      />
    </>
  )
}
