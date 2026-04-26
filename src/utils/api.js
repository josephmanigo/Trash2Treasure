const API_BASE = import.meta.env.DEV ? 'http://localhost:3001/api' : '/api';

const getToken = () => localStorage.getItem('t2t_token');

const headers = (includeAuth = true) => {
  const h = { 'Content-Type': 'application/json' };
  if (includeAuth) {
    const token = getToken();
    if (token) h['Authorization'] = `Bearer ${token}`;
  }
  return h;
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
    localStorage.setItem('t2t_token', data.token);
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
    localStorage.setItem('t2t_token', data.token);
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
    localStorage.setItem('t2t_token', data.token);
    return data;
  },

  async guestLogin() {
    const res = await fetch(`${API_BASE}/auth/guest`, {
      method: 'POST',
      headers: headers(false),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    localStorage.setItem('t2t_token', data.token);
    return data;
  },

  async getMe() {
    const token = getToken();
    if (!token) return null;
    const res = await fetch(`${API_BASE}/auth/me`, { headers: headers() });
    if (!res.ok) {
      localStorage.removeItem('t2t_token');
      return null;
    }
    const data = await res.json();
    return data;
  },

  logout() {
    localStorage.removeItem('t2t_token');
  },

  // ── Profile ──
  async updateName(name) {
    const res = await fetch(`${API_BASE}/profile/name`, {
      method: 'PUT',
      headers: headers(),
      body: JSON.stringify({ name }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    return data;
  },

  async uploadAvatar(file) {
    const formData = new FormData();
    formData.append('avatar', file);
    const res = await fetch(`${API_BASE}/profile/avatar`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${getToken()}` },
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    return data;
  },

  async deleteAccount() {
    const res = await fetch(`${API_BASE}/profile`, {
      method: 'DELETE',
      headers: headers(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    localStorage.removeItem('t2t_token');
    return data;
  },

  // Helper to get full avatar URL
  getAvatarUrl(avatar) {
    if (!avatar) return null;
    if (avatar.startsWith('http')) return avatar; // Google avatar
    const baseUrl = import.meta.env.DEV ? 'http://localhost:3001' : '';
    return `${baseUrl}${avatar}`; // Local upload
  },
};
