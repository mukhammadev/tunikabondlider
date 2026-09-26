/**
 * Frontend API client communicating with backend /api endpoints
 * Falls back gracefully to localStorage or static data if backend is offline.
 */

import { products as initialProducts } from '../data/products';
import { portfolio as initialPortfolio } from '../data/portfolio';
import { initialTeam } from '../data/team';

const TOKEN_KEY = 'tl_admin_token';
const USER_KEY = 'tl_admin_user';

export const getAuthToken = () => localStorage.getItem(TOKEN_KEY);
export const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || 'null');
  } catch {
    return null;
  }
};

export const setAuthSession = (token, user) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const clearAuthSession = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

const getHeaders = () => {
  const token = getAuthToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

// --- AUTH API ---
export const apiLogin = async (username, password) => {
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (res.ok && data.success) {
      setAuthSession(data.token, data.user);
      return { success: true, user: data.user };
    }
    return { success: false, error: data.error || "Kirishda xatolik yuz berdi" };
  } catch (err) {
    // Client-side local fallback
    if ((username === 'Muhammadazez' || username === 'admin') && password === 'admin123') {
      const mockUser = {
        id: 'admin-1',
        username: username,
        fullName: username === 'Muhammadazez' ? 'Muhammad Aziz' : 'Bosh Admin',
        role: 'Super Admin'
      };
      setAuthSession('mock-token', mockUser);
      return { success: true, user: mockUser };
    }
    return { success: false, error: "Server bilan bog'lanishda xatolik yuz berdi" };
  }
};

export const apiRegister = async (username, password, fullName, role = 'Admin') => {
  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, fullName, role })
    });
    const data = await res.json();
    if (res.ok && data.success) {
      return { success: true, user: data.user };
    }
    return { success: false, error: data.error || "Ro'yxatdan o'tishda xatolik" };
  } catch (err) {
    return { success: false, error: "Server bilan bog'lanishda xatolik" };
  }
};

export const apiGetAdmins = async () => {
  try {
    const res = await fetch('/api/auth/admins');
    if (res.ok) return await res.json();
  } catch {}
  return [
    { id: '1', username: 'Muhammadazez', fullName: 'Muhammad Aziz', role: 'Super Admin' },
    { id: '2', username: 'admin', fullName: 'Bosh Administrator', role: 'Super Admin' }
  ];
};

// --- STATS API ---
export const apiGetStats = async () => {
  try {
    const res = await fetch('/api/stats/');
    if (res.ok) return await res.json();
  } catch {}
  return { totalLeads: 0, newLeads: 0, totalProducts: 6, totalProjects: 3, totalAdmins: 2 };
};

// --- LEADS API ---
export const apiGetLeads = async () => {
  try {
    const res = await fetch('/api/leads/');
    if (res.ok) return await res.json();
  } catch {}
  try {
    return JSON.parse(localStorage.getItem('tunikabond_leads') || '[]');
  } catch {
    return [];
  }
};

export const apiUpdateLead = async (leadId, patchData) => {
  try {
    const res = await fetch(`/api/leads/${leadId}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(patchData)
    });
    if (res.ok) return true;
  } catch {}
  return true;
};

export const apiDeleteLead = async (leadId) => {
  try {
    const res = await fetch(`/api/leads/${leadId}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (res.ok) return true;
  } catch {}
  return true;
};

// --- PRODUCTS API ---
export const apiGetProducts = async () => {
  try {
    const res = await fetch('/api/products/');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) return data;
    }
  } catch {}
  return initialProducts;
};

export const apiCreateProduct = async (productData) => {
  try {
    const res = await fetch('/api/products/', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(productData)
    });
    if (res.ok) return await res.json();
  } catch {}
  return { success: true, product: { ...productData, id: `prod-${Date.now()}` } };
};

export const apiUpdateProduct = async (productId, productData) => {
  try {
    const res = await fetch(`/api/products/${productId}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(productData)
    });
    if (res.ok) return true;
  } catch {}
  return true;
};

export const apiDeleteProduct = async (productId) => {
  try {
    const res = await fetch(`/api/products/${productId}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (res.ok) return true;
  } catch {}
  return true;
};

// --- PORTFOLIO API ---
export const apiGetPortfolio = async () => {
  try {
    const res = await fetch('/api/portfolio/');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) return data;
    }
  } catch {}
  return initialPortfolio;
};

export const apiCreatePortfolio = async (itemData) => {
  try {
    const res = await fetch('/api/portfolio/', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(itemData)
    });
    if (res.ok) return await res.json();
  } catch {}
  return { success: true, item: { ...itemData, id: `port-${Date.now()}` } };
};

export const apiUpdatePortfolio = async (itemId, itemData) => {
  try {
    const res = await fetch(`/api/portfolio/${itemId}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(itemData)
    });
    if (res.ok) return true;
  } catch {}
  return true;
};

export const apiDeletePortfolio = async (itemId) => {
  try {
    const res = await fetch(`/api/portfolio/${itemId}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (res.ok) return true;
  } catch {}
  return true;
};

// --- TEAM & MASTERS API ---
export const apiGetTeam = async () => {
  try {
    const res = await fetch('/api/team/');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) return data;
    }
  } catch {}
  return initialTeam;
};

export const apiCreateTeamMember = async (memberData) => {
  try {
    const res = await fetch('/api/team/', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(memberData)
    });
    if (res.ok) return await res.json();
  } catch {}
  return { success: true, member: { ...memberData, id: `team-${Date.now()}` } };
};

export const apiUpdateTeamMember = async (memberId, memberData) => {
  try {
    const res = await fetch(`/api/team/${memberId}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(memberData)
    });
    if (res.ok) return true;
  } catch {}
  return true;
};

export const apiDeleteTeamMember = async (memberId) => {
  try {
    const res = await fetch(`/api/team/${memberId}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (res.ok) return true;
  } catch {}
  return true;
};

// --- FILE UPLOAD API ---
export const apiUploadFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  try {
    const res = await fetch('/api/upload/', {
      method: 'POST',
      body: formData
    });
    const data = await res.json();
    if (res.ok && data.success) {
      return { success: true, url: data.url, filename: data.filename };
    }
    return { success: false, error: data.error || "Fayl yuklashda xatolik" };
  } catch (err) {
    return { success: false, error: "Server bilan bog'lanishda xatolik" };
  }
};

export const apiExportLeadsUrl = () => '/api/leads/export';
