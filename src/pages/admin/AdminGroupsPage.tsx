import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Search, Building2, Globe } from 'lucide-react';
import { adminUniversityGroupsAPI } from '../../lib/api';
import { getCurrentUser } from '../../lib/api';
import { useTranslation } from 'react-i18next';

interface UniversityGroup {
  id: string;
  name: string;
  short_name?: string;
  slug?: string;
  headquarters_country?: string;
  headquarters_city?: string;
  total_instances?: number;
  established_year?: number;
}

export default function AdminGroupsPage() {
  const { t } = useTranslation();
  const [groups, setGroups] = useState<UniversityGroup[]>([]);
  const [filteredGroups, setFilteredGroups] = useState<UniversityGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      navigate('/login');
      return;
    }
    fetchGroups();
  }, [navigate]);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const data = await adminUniversityGroupsAPI.getGroups();
      setGroups(data);
      setFilteredGroups(data);
    } catch (err: any) {
      console.error('Failed to fetch groups:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = groups;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (group) =>
          group.name.toLowerCase().includes(term) ||
          (group.short_name && group.short_name.toLowerCase().includes(term)) ||
          (group.headquarters_country && group.headquarters_country.toLowerCase().includes(term)) ||
          (group.headquarters_city && group.headquarters_city.toLowerCase().includes(term))
      );
    }
    setFilteredGroups(filtered);
  }, [groups, searchTerm]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This is irreversible and will unlink all universities from this group.`)) {
      return;
    }
    try {
      await adminUniversityGroupsAPI.deleteGroup(id);
      fetchGroups(); // Refetch
    } catch (err: any) {
      alert('Failed to delete group: ' + err.message);
    }
  };

  const stats = {
    total: groups.length,
    withInstances: groups.filter(g => (g.total_instances || 0) > 0).length,
    france: groups.filter(g => g.headquarters_country === 'France').length,
    usa: groups.filter(g => g.headquarters_country === 'USA').length,
  };

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-gray-600">{t('common.loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">University Groups Management</h1>
              <p className="text-gray-600">Manage university groups (parent organizations)</p>
            </div>
            <Link to="/admin/university-groups/new" className="btn-primary flex items-center space-x-2">
              <Plus className="h-5 w-5" />
              <span>Add New Group</span>
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Groups</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <Building2 className="h-8 w-8 text-primary-600" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">With Institutions</p>
                  <p className="text-2xl font-bold text-green-600">{stats.withInstances}</p>
                </div>
                <Globe className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">France</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.france}</p>
                </div>
                <Globe className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">USA</p>
                  <p className="text-2xl font-bold text-red-600">{stats.usa}</p>
                </div>
                <Globe className="h-8 w-8 text-red-600" />
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, country, or city..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          {/* Groups Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Short Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Headquarters</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Institutions</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Established</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredGroups.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                        No groups found.
                      </td>
                    </tr>
                  ) : (
                    filteredGroups.map((group) => (
                      <tr key={group.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{group.name}</div>
                          {group.slug && (
                            <div className="text-xs text-gray-500">{group.slug}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-600">{group.short_name || '-'}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {group.headquarters_city && group.headquarters_country
                              ? `${group.headquarters_city}, ${group.headquarters_country}`
                              : group.headquarters_country || '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            {group.total_instances || 0} {group.total_instances === 1 ? 'institution' : 'institutions'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {group.established_year || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <Link
                              to={`/admin/university-groups/edit/${group.id}`}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <Edit className="h-5 w-5" />
                            </Link>
                            <button
                              onClick={() => handleDelete(group.id, group.name)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

