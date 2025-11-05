import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Search, Building, DollarSign, Book, Flag } from 'lucide-react';
import { adminUniversityAPI } from '../../lib/api';
import { getCurrentUser } from '../../lib/api';
import { useTranslation } from 'react-i18next';

interface University {
  id: string;
  name: string;
  country: string;
  avg_tuition_per_year: number;
  min_gpa: number;
  interests: string[];
}

export default function AdminUniversitiesPage() {
  const { t } = useTranslation();
  const [universities, setUniversities] = useState<University[]>([]);
  const [filteredUniversities, setFilteredUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      navigate('/login');
      return;
    }
    fetchUniversities();
  }, [navigate]);

  const fetchUniversities = async () => {
    try {
      setLoading(true);
      const data = await adminUniversityAPI.getUniversities();
      setUniversities(data);
      setFilteredUniversities(data);
    } catch (err: any) {
      console.error('Failed to fetch universities:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = universities;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (uni) =>
          uni.name.toLowerCase().includes(term) ||
          uni.country.toLowerCase().includes(term) ||
          uni.interests.join(', ').toLowerCase().includes(term)
      );
    }
    setFilteredUniversities(filtered);
  }, [universities, searchTerm]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This is irreversible.`)) {
      return;
    }
    try {
      await adminUniversityAPI.deleteUniversity(id);
      fetchUniversities(); // Refetch
    } catch (err: any) {
      alert('Failed to delete university: ' + err.message);
    }
  };

  const stats = {
    total: universities.length,
    usa: universities.filter(u => u.country === 'USA').length,
    canada: universities.filter(u => u.country === 'Canada').length,
    france: universities.filter(u => u.country === 'France').length,
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
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">University Management</h1>
              <p className="text-gray-600">Manage university data for the matching engine</p>
            </div>
            <Link to="/admin/universities/new" className="btn-primary flex items-center space-x-2">
              <Plus className="h-5 w-5" />
              <span>Add New University</span>
            </Link>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Universities</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <Building className="h-8 w-8 text-primary-600" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">USA</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.usa}</p>
                </div>
                <Flag className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Canada</p>
                  <p className="text-2xl font-bold text-red-600">{stats.canada}</p>
                </div>
                <Flag className="h-8 w-8 text-red-600" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">France</p>
                  <p className="text-2xl font-bold text-indigo-600">{stats.france}</p>
                </div>
                <Flag className="h-8 w-8 text-indigo-600" />
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, country, or interest..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          {/* Universities Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Country</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tuition</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Min. GPA</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUniversities.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                        No universities found.
                      </td>
                    </tr>
                  ) : (
                    filteredUniversities.map((uni) => (
                      <tr key={uni.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{uni.name}</div>
                          <div className="text-xs text-gray-500">{uni.interests.join(', ')}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            {uni.country}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          ${uni.avg_tuition_per_year.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{uni.min_gpa}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <Link
                              to={`/admin/universities/edit/${uni.id}`}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <Edit className="h-5 w-5" />
                            </Link>
                            <button
                              onClick={() => handleDelete(uni.id, uni.name)}
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
