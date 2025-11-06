import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { adminAPI, getCurrentUser } from '../lib/api'

interface AdminUser {
  id: string
  email: string
  role?: string
  created_at: string
  full_name?: string
  username?: string
  avatar_url?: string
  last_seen?: string
}

export default function AdminUsersPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const user = getCurrentUser()
    if (!user) {
      navigate('/login')
      return
    }

    const load = async () => {
      try {
        setLoading(true)
        const data = await adminAPI.getUsers()
        setUsers(Array.isArray(data) ? data : [])
        setError(null)
      } catch (e: any) {
        setError(e?.message || 'Failed to load users')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [navigate])

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Users</h1>
            <p className="text-gray-600">Admin view of registered users</p>
          </div>
          <Link to="/admin" className="text-primary-600 hover:text-primary-700 font-semibold">Back to Admin</Link>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">{error}</div>
        )}

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
            <p className="mt-4 text-gray-600">{t('common.loading')}</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Seen</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-500">No users found.</td>
                    </tr>
                  ) : (
                    users.map(u => (
                      <tr key={u.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center gap-3">
                            {u.avatar_url ? (
                              <img src={u.avatar_url} className="w-8 h-8 rounded-full object-cover border" onError={(e)=>{(e.target as HTMLImageElement).style.display='none'}} />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold">{(u.full_name || u.email)?.slice(0,1)?.toUpperCase()}</div>
                            )}
                            <div>
                              <div className="font-medium text-gray-900">
                                {u.username ? (
                                  <Link className="text-primary-600 hover:underline" to={`/u/${u.username}`}>{u.full_name || u.email}</Link>
                                ) : (
                                  <span className="text-gray-500">{u.full_name || u.email} (no username)</span>
                                )}
                              </div>
                              <div className="text-xs text-gray-500">{u.email}{u.username ? ` • @${u.username}` : ''}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${u.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-primary-100 text-primary-800'}`}>
                            {u.role || 'user'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(u.created_at).toLocaleDateString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u.last_seen ? new Date(u.last_seen).toLocaleString() : '—'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center justify-end gap-2">
                            {u.username ? (
                              <Link to={`/u/${u.username}`} className="px-2 py-1 border rounded text-xs">View Profile</Link>
                            ) : (
                              <span className="px-2 py-1 border rounded text-xs text-gray-400 cursor-not-allowed" title="Username required">View Profile</span>
                            )}
                            <button className="px-2 py-1 border rounded text-xs" onClick={()=> navigator.clipboard.writeText(u.email)}>Copy Email</button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}


