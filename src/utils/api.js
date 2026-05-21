const API_BASE = import.meta.env.DEV ? 'http://localhost:3001/api' : '/api';
const TOKEN_KEY = 't2t_token';
const REFRESH_TOKEN_KEY = 't2t_refresh_token';

const getToken = () => localStorage.getItem(TOKEN_KEY);
const getRefreshToken = () => localStorage.getItem(REFRESH_TOKEN_KEY);

const clearSession = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

const storeSession = (data) => {
  if (data.token) localStorage.setItem(TOKEN_KEY, data.token);
  if (data.refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
};

const headers = (includeAuth = true) => {
  const h = { 'Content-Type': 'application/json' };
  if (includeAuth) {
    const token = getToken();
    if (token) h['Authorization'] = `Bearer ${token}`;
  }
  return h;
};

const refreshSessionRequest = async () => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: headers(false),
      body: JSON.stringify({ refreshToken }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    storeSession(data);
    return data;
  } catch (err) {
    console.warn('Session refresh failed:', err.message);
    clearSession();
    return null;
  }
};

const fetchWithAuth = async (url, options = {}) => {
  const buildHeaders = () => ({
    ...(options.headers || {}),
    Authorization: `Bearer ${getToken()}`,
  });

  let res = await fetch(url, { ...options, headers: buildHeaders() });
  if (res.status === 401 && getRefreshToken()) {
    const refreshed = await refreshSessionRequest();
    if (refreshed) {
      res = await fetch(url, { ...options, headers: buildHeaders() });
    }
  }
  return res;
};

export const api = {
  // ── Auth ──
  async register(name, email, password) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: headers(false),
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    storeSession(data);
    return data;
  },

  async login(email, password) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: headers(false),
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    storeSession(data);
    return data;
  },

  async googleLogin(credential) {
    const res = await fetch(`${API_BASE}/auth/google`, {
      method: 'POST',
      headers: headers(false),
      body: JSON.stringify({ credential }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    storeSession(data);
    return data;
  },

  async guestLogin() {
    try {
      const res = await fetch(`${API_BASE}/auth/guest`, {
        method: 'POST',
        headers: headers(false),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      storeSession(data);
      return data;
    } catch (err) {
      console.warn('Backend unavailable, using mock guest session:', err.message);
      // Fallback for local development without the backend
      const mockUser = {
        id: 9999,
        name: 'Guest_' + Math.floor(Math.random() * 1000),
        email: 'guest@local.dev',
        avatar: null,
        method: 'guest'
      };
      const mockToken = 'mock_jwt_token_for_local_testing';
      clearSession();
      localStorage.setItem(TOKEN_KEY, mockToken);
      return { user: mockUser, token: mockToken };
    }
  },

  async refreshSession() {
    return refreshSessionRequest();
  },

  async getMe() {
    const token = getToken();
    if (!token) return this.refreshSession();
    
    // Handle local mock session
    if (token === 'mock_jwt_token_for_local_testing') {
      return {
        user: {
          id: 9999,
          name: 'Local Guest',
          email: 'guest@local.dev',
          avatar: null,
          method: 'guest'
        }
      };
    }

    try {
      const res = await fetchWithAuth(`${API_BASE}/auth/me`);
      if (!res.ok) {
        clearSession();
        return null;
      }
      const data = await res.json();
      return data;
    } catch (err) {
      console.warn('Backend unavailable during getMe:', err.message);
      return null;
    }
  },

  logout() {
    clearSession();
  },

  // ── Profile ──
  async updateName(name) {
    const res = await fetchWithAuth(`${API_BASE}/profile/name`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    return data;
  },

  async uploadAvatar(file) {
    const formData = new FormData();
    formData.append('avatar', file);
    const res = await fetchWithAuth(`${API_BASE}/profile/avatar`, {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    return data;
  },

  async deleteAccount() {
    const res = await fetchWithAuth(`${API_BASE}/profile`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    clearSession();
    return data;
  },

  // Helper to get full avatar URL
  getAvatarUrl(avatar) {
    if (!avatar) return null;
    if (avatar.startsWith('http')) return avatar; // Google or Supabase Storage avatar
    const baseUrl = import.meta.env.DEV ? 'http://localhost:3001' : '';
    return `${baseUrl}${avatar}`;
  },
};
