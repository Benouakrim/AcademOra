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

// Public Universities API (no auth required)
export const universitiesAPI = {
  async getUniversities() {
    return fetchAPI('/universities');
  },
  async getUniversityBySlug(slug: string) {
    return fetchAPI(`/universities/${slug}`);
  },
};

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
