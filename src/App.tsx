import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { trackRoutePath as track } from './devtools/routeRegistry'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import BlogPage from './pages/BlogPage'
import ArticlePage from './pages/ArticlePage'
import OrientationPage from './pages/OrientationPage'
import OrientationCategoryPage from './pages/OrientationCategoryPage'
import OrientationDetailPage from './pages/OrientationDetailPage'
import LoginPage from './pages/LoginPage'
import SignUpPage from './pages/SignUpPage'
import PasswordResetRequest from './pages/PasswordResetRequest'
import PasswordReset from './pages/PasswordReset'
import NotFound from './pages/NotFound'
import DashboardPage from './pages/DashboardPage'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminClaimsPage from './pages/admin/AdminClaimsPage'
import ArticleEditor from './pages/ArticleEditor'
import ArticlesList from './pages/admin/ArticlesList'
import CategoriesPage from './pages/admin/CategoriesPage'
import TagsPage from './pages/admin/TagsPage'
import AdminUsersPage from './pages/AdminUsersPage'
import AboutUsPage from './pages/AboutUsPage'
import ContactUsPage from './pages/ContactUsPage'
import UnifiedPageEditor from './pages/admin/UnifiedPageEditor'
import PagesManagementPage from './pages/PagesManagementPage'
import MatchingDashboardPage from './pages/MatchingDashboardPage' // Future Mixer dashboard
import AdminUniversitiesPage from './pages/admin/AdminUniversitiesPage'
import UniversityEditor from './pages/admin/UniversityEditor'
import UniversityDetailPage from './pages/UniversityDetailPage'
import UniversityGroupDetailPage from './pages/UniversityGroupDetailPage'
import AdminGroupsPage from './pages/admin/AdminGroupsPage'
import GroupEditor from './pages/admin/GroupEditor'
import UniversityClaimPage from './pages/UniversityClaimPage'
import AdminAboutPage from './pages/admin/AdminAboutPage'
import AdminContactPage from './pages/admin/AdminContactPage'
import UniversityComparePage from './pages/UniversityComparePage'
import PublicUserProfilePage from './pages/PublicUserProfilePage'
import DevDashboard from './pages/DevDashboard'

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path={track("/")} element={<HomePage />} />
          <Route path={track("/login")} element={<LoginPage />} />
          <Route path={track("/signup")} element={<SignUpPage />} />
          <Route path={track("/password/forgot")} element={<PasswordResetRequest />} />
          <Route path={track("/password/reset")} element={<PasswordReset />} />
          <Route path={track("/dashboard")} element={<DashboardPage />} />
          <Route path={track("/matching-engine")} element={<MatchingDashboardPage />} />
          <Route path={track("/admin")} element={<AdminDashboard />} />
          <Route path={track("/admin/users")} element={<AdminUsersPage />} />
          <Route path={track("/admin/university-claims")} element={<AdminClaimsPage />} />
          <Route path={track("/admin/university-claims/:id")} element={<AdminClaimsPage />} />
          <Route path={track("/admin/universities")} element={<AdminUniversitiesPage />} />
          <Route path={track("/admin/universities/new")} element={<UniversityEditor />} />
          <Route path={track("/admin/universities/edit/:id")} element={<UniversityEditor />} />
          <Route path={track("/admin/university-groups")} element={<AdminGroupsPage />} />
          <Route path={track("/admin/university-groups/new")} element={<GroupEditor />} />
          <Route path={track("/admin/university-groups/edit/:id")} element={<GroupEditor />} />
          <Route path={track("/admin/articles")} element={<ArticlesList />} />
          <Route path={track("/admin/articles/new")} element={<ArticleEditor />} />
          <Route path={track("/admin/articles/edit/:id")} element={<ArticleEditor />} />
          <Route path={track("/admin/pages")} element={<PagesManagementPage />} />
          <Route path={track("/admin/pages/new")} element={<UnifiedPageEditor />} />
          <Route path={track("/admin/pages/:slug/edit")} element={<UnifiedPageEditor />} />
          <Route path={track("/admin/about")} element={<AdminAboutPage />} />
          <Route path={track("/admin/contact")} element={<AdminContactPage />} />
          <Route path={track("/admin/categories")} element={<CategoriesPage />} />
          <Route path={track("/admin/tags")} element={<TagsPage />} />
          <Route path={track("/about")} element={<AboutUsPage />} />
          <Route path={track("/contact")} element={<ContactUsPage />} />
          <Route path={track("/blog")} element={<BlogPage />} />
          <Route path={track("/blog/:slug")} element={<ArticlePage />} />
          <Route path={track("/orientation")} element={<OrientationPage />} />
          <Route path={track("/orientation/:category")} element={<OrientationCategoryPage />} />
          <Route path={track("/orientation/:category/:slug")} element={<OrientationDetailPage />} />
          <Route path={track("/universities/:slug")} element={<UniversityDetailPage />} />
          <Route path={track("/university-groups/:slug")} element={<UniversityGroupDetailPage />} />
          <Route path={track("/compare")} element={<UniversityComparePage />} />
          <Route path={track("/u/:username")} element={<PublicUserProfilePage />} />
          {import.meta.env.DEV && (
            <Route path={track("/__dev")} element={<DevDashboard />} />
          )}
          <Route path={track("/university-claims/claim")} element={<UniversityClaimPage />} />
          <Route path={track("*")} element={<NotFound />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App

