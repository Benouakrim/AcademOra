// API client for Express.js backend
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Helper function to get auth token from localStorage
function getAuthToken(): string | null {
  return localStorage.getItem('token');
}

// Helper function to set auth token in localStorage
export function setAuthToken(token: string | null): void {
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
}

// Helper function to get current user from localStorage
export function getCurrentUser(): any | null {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
}

// Helper function to set current user in localStorage
export function setCurrentUser(user: any | null): void {
  if (user) {
    localStorage.setItem('user', JSON.stringify(user));
  } else {
    localStorage.removeItem('user');
  }
}

// Generic fetch function with auth
async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ 
        error: response.status === 0 || response.status >= 500 
          ? 'Server is not responding. Make sure the backend server is running on port 3001.' 
          : `HTTP error! status: ${response.status}` 
      }));
      throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  } catch (error: any) {
    // Handle network errors (server not running, CORS, etc.)
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error(`Cannot connect to API at ${API_URL}. Make sure the backend server is running on port 3001.`);
    }
    throw error;
  }
}

// Auth API
export const authAPI = {
  async signup(email: string, password: string) {
    const data = await fetchAPI('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (data.token) {
      setAuthToken(data.token);
      setCurrentUser(data.user);
    }
    return data;
  },

  async login(email: string, password: string) {
    const data = await fetchAPI('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (data.token) {
      setAuthToken(data.token);
      setCurrentUser(data.user);
    }
    return data;
  },

  async getCurrentUser() {
    return fetchAPI('/auth/me');
  },

  logout() {
    setAuthToken(null);
    setCurrentUser(null);
  },
  
  async forgotPassword(email: string) {
    return fetchAPI('/auth/forgot', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  async resetPassword(email: string, token: string, newPassword: string) {
    return fetchAPI('/auth/reset', {
      method: 'POST',
      body: JSON.stringify({ email, token, password: newPassword }),
    });
  },
};

// Blog API
export const blogAPI = {
  async getArticles() {
    return fetchAPI('/blog');
  },

  async getArticle(slug: string) {
    return fetchAPI(`/blog/${slug}`);
  },
};

// Admin API
export const adminAPI = {
  async getAllArticles() {
    return fetchAPI('/admin/articles');
  },

  async getArticleById(id: string) {
    return fetchAPI(`/admin/articles/${id}`);
  },

  async createArticle(articleData: any) {
    return fetchAPI('/admin/articles', {
      method: 'POST',
      body: JSON.stringify(articleData),
    });
  },

  async updateArticle(id: string, articleData: any) {
    return fetchAPI(`/admin/articles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(articleData),
    });
  },

  async deleteArticle(id: string) {
    return fetchAPI(`/admin/articles/${id}`, {
      method: 'DELETE',
    });
  },

  async getUsers() {
    return fetchAPI('/admin/users');
  },
};

// Upload API
export const uploadAPI = {
  async uploadImage(file: File) {
    const formData = new FormData();
    formData.append('image', file);
    
    const token = getAuthToken();
    const headers: Record<string, string> = {};
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${API_URL}/upload/image`, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ 
          error: `HTTP error! status: ${response.status}` 
        }));
        throw new Error(error.error || `HTTP error! status: ${response.status}`);
      }

      return response.json();
    } catch (error: any) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error(`Cannot connect to API at ${API_URL}. Make sure the backend server is running on port 3001.`);
      }
      throw error;
    }
  },

  async deleteImage(filename: string) {
    return fetchAPI(`/upload/image/${filename}`, {
      method: 'DELETE',
    });
  },
};

// Orientation API
export const orientationAPI = {
  async getResources() {
    return fetchAPI('/orientation');
  },

  async getResourcesByCategory(category: string) {
    return fetchAPI(`/orientation/category/${category}`);
  },

  async getResource(category: string, slug: string) {
    return fetchAPI(`/orientation/${category}/${slug}`);
  },
};

// Matching API
export const matchingAPI = {
  async getMatches(criteria: any) {
    return fetchAPI('/matching', {
      method: 'POST',
      body: JSON.stringify(criteria),
    });
  },
};

// User Preferences API
export const userPreferencesAPI = {
  async getPreferences() {
    return fetchAPI('/user-preferences');
  },
  async savePreferences(prefs: {
    weight_tuition?: number;
    weight_location?: number;
    weight_ranking?: number;
    weight_program?: number;
    weight_language?: number;
  }) {
    return fetchAPI('/user-preferences', {
      method: 'POST',
      body: JSON.stringify(prefs),
    });
  },
};

// Saved Matches API
export const savedMatchesAPI = {
  async list() {
    return fetchAPI('/saved-matches');
  },
  async isSaved(universityId: string) {
    return fetchAPI(`/saved-matches/check/${universityId}`);
  },
  async save(universityId: string, note?: string) {
    return fetchAPI('/saved-matches', {
      method: 'POST',
      body: JSON.stringify({ university_id: universityId, note }),
    });
  },
  async unsave(universityId: string) {
    return fetchAPI(`/saved-matches/${universityId}`, {
      method: 'DELETE',
    });
  },
};

// Public Universities API (no auth required)
export const universitiesAPI = {
  async getUniversities() {
    return fetchAPI('/universities');
  },
  async getUniversityBySlug(slug: string) {
    return fetchAPI(`/universities/${slug}`);
  },
};

// Reviews API
export const reviewsAPI = {
  async list(universityId: string) {
    return fetchAPI(`/reviews/university/${universityId}`)
  },
  async upsert(universityId: string, rating: number, comment?: string) {
    return fetchAPI(`/reviews/university/${universityId}` , {
      method: 'POST',
      body: JSON.stringify({ rating, comment })
    })
  },
  async remove(universityId: string) {
    return fetchAPI(`/reviews/university/${universityId}`, { method: 'DELETE' })
  }
}

// Public University Groups API (no auth required)
export const universityGroupsAPI = {
  async getGroups() {
    return fetchAPI('/university-groups');
  },
  async getGroupBySlug(slug: string) {
    return fetchAPI(`/university-groups/${slug}`);
  },
};

// Admin University Groups CRUD API
export const adminUniversityGroupsAPI = {
  async getGroups() {
    return fetchAPI('/admin/university-groups');
  },
  async getGroupById(id: string) {
    return fetchAPI(`/admin/university-groups/${id}`);
  },
  async createGroup(data: any) {
    return fetchAPI('/admin/university-groups', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  async updateGroup(id: string, data: any) {
    return fetchAPI(`/admin/university-groups/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  async deleteGroup(id: string) {
    return fetchAPI(`/admin/university-groups/${id}`, {
      method: 'DELETE',
    });
  },
};

// Admin University CRUD API
export const adminUniversityAPI = {
  async getUniversities() {
    return fetchAPI('/admin/universities');
  },
  async getUniversityById(id: string) {
    return fetchAPI(`/admin/universities/${id}`);
  },
  async createUniversity(data: any) {
    return fetchAPI('/admin/universities', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  async updateUniversity(id: string, data: any) {
    return fetchAPI(`/admin/universities/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  async deleteUniversity(id: string) {
    return fetchAPI(`/admin/universities/${id}`, {
      method: 'DELETE',
    });
  },
};

// User Profile API
export const profileAPI = {
  async getProfile() {
    return fetchAPI('/profile');
  },
  async updateProfile(data: any) {
    return fetchAPI('/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  async updatePassword(currentPassword: string, newPassword: string) {
    return fetchAPI('/profile/password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },
};

// Saved Items API
export const savedItemsAPI = {
  async getSavedItems(type?: string) {
    const url = type ? `/saved-items?type=${type}` : '/saved-items';
    return fetchAPI(url);
  },
  async getSavedItemsCount() {
    return fetchAPI('/saved-items/count');
  },
  async checkIfSaved(type: string, id: string) {
    return fetchAPI(`/saved-items/check/${type}/${id}`);
  },
  async saveItem(type: string, id: string, data?: any) {
    return fetchAPI('/saved-items', {
      method: 'POST',
      body: JSON.stringify({ item_type: type, item_id: id, item_data: data }),
    });
  },
  async unsaveItem(type: string, id: string) {
    return fetchAPI(`/saved-items/${type}/${id}`, {
      method: 'DELETE',
    });
  },
};

// University Claims API
export const universityClaimsAPI = {
  async createClaimRequest(data: any) {
    return fetchAPI('/university-claims/request', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  async getMyClaimRequests() {
    return fetchAPI('/university-claims/my-requests');
  },
  async getMyClaims() {
    return fetchAPI('/university-claims/my-claims');
  },
  async getClaimRequest(id: string) {
    return fetchAPI(`/university-claims/request/${id}`);
  },
};

// Admin University Claims API
export const adminUniversityClaimsAPI = {
  async getClaimRequests(status?: string) {
    const url = status ? `/admin/university-claims?status=${status}` : '/admin/university-claims';
    return fetchAPI(url);
  },
  async getClaimRequest(id: string) {
    return fetchAPI(`/admin/university-claims/${id}`);
  },
  async updateClaimRequestStatus(id: string, status: string, adminNotes?: string) {
    return fetchAPI(`/admin/university-claims/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, admin_notes: adminNotes }),
    });
  },
  async updateClaimStatus(id: string, status: string) {
    return fetchAPI(`/admin/university-claims/claim/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },
};

// Admin Analytics API
export const adminAnalyticsAPI = {
  async overview() {
    return fetchAPI('/admin/analytics/overview');
  },
  async registrationsLast7() {
    return fetchAPI('/admin/analytics/registrations/last7');
  },
};

// Public Users API
export const usersPublicAPI = {
  async getPublicProfile(usernameOrId: string) {
    return fetchAPI(`/users/${usernameOrId}`);
  },
};

// Profile Sections API (authenticated)
export const profileSectionsAPI = {
  async list(kind: 'experiences'|'education'|'projects'|'certifications') {
    return fetchAPI(`/profile-sections/${kind}`);
  },
  async create(kind: 'experiences'|'education'|'projects'|'certifications', payload: any) {
    return fetchAPI(`/profile-sections/${kind}`, { method: 'POST', body: JSON.stringify(payload) });
  },
  async update(kind: 'experiences'|'education'|'projects'|'certifications', id: string, payload: any) {
    return fetchAPI(`/profile-sections/${kind}/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
  },
  async remove(kind: 'experiences'|'education'|'projects'|'certifications', id: string) {
    return fetchAPI(`/profile-sections/${kind}/${id}`, { method: 'DELETE' });
  },
};

// Static Pages API (public)
export const staticPagesAPI = {
  async getPage(slug: string) {
    return fetchAPI(`/pages/${slug}`);
  },
  async getNavbarPages() {
    return fetchAPI('/pages/navbar/list');
  },
};

// Admin Static Pages API
export const adminStaticPagesAPI = {
  async getAllPages() {
    return fetchAPI('/admin/pages');
  },
  async getPage(slug: string) {
    return fetchAPI(`/admin/pages/${slug}`);
  },
  async updatePage(slug: string, data: { 
    title: string; 
    content: string; 
    meta_title?: string; 
    meta_description?: string;
    status?: 'published' | 'draft';
    visibility_areas?: string[];
    sort_order?: number;
  }) {
    return fetchAPI(`/admin/pages/${slug}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  async deletePage(slug: string) {
    return fetchAPI(`/admin/pages/${slug}`, {
      method: 'DELETE',
    });
  },
};

// Notifications API
export const notificationsAPI = {
  async list() {
    return fetchAPI('/notifications');
  },
  async unreadCount() {
    return fetchAPI('/notifications/unread/count');
  },
  async markRead(id: string) {
    return fetchAPI(`/notifications/${id}/read`, { method: 'POST' });
  },
  async markAllRead() {
    return fetchAPI('/notifications/read-all', { method: 'POST' });
  },
};
