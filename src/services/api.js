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

  const [leads, products, portfolio, admins] = await Promise.all([
    apiGetLeads(),
    apiGetProducts(),
    apiGetPortfolio(),
    apiGetAdmins()
  ]);

  return {
    totalLeads: leads.length,
    newLeads: leads.filter(l => l.status === 'new' || !l.status).length,
    totalProducts: products.length,
    totalProjects: portfolio.length,
    totalAdmins: admins.length
  };
};

// --- LEADS API ---
export const apiGetLeads = async () => {
  let leads = [];
  try {
    const res = await fetch('/api/leads/');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        leads = data;
      }
    }
  } catch {}

  if (!leads.length) {
    try {
      leads = JSON.parse(localStorage.getItem('tunikabond_leads') || '[]');
    } catch {}
  }

  const validStatuses = ['new', 'in_progress', 'completed', 'cancelled'];
  const normalized = leads.map((l, index) => {
    // Crucial: If status is undefined, null, or empty string, default strictly to 'new'
    let status = l.status;
    if (!status || !validStatuses.includes(status)) {
      status = 'new';
    }
    return {
      ...l,
      id: l.id || `lead-local-${index}-${Date.now()}`,
      status: status,
      timestamp: l.timestamp || l.date || new Date().toISOString()
    };
  });

  // Heal corrupt items in localStorage
  try {
    localStorage.setItem('tunikabond_leads', JSON.stringify(normalized));
  } catch {}

  return normalized;
};

export const apiUpdateLead = async (leadId, patchData) => {
  try {
    const res = await fetch(`/api/leads/${leadId}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(patchData)
    });
    if (res.ok) {
      // Backend updated
    }
  } catch {}

  // Sync to localStorage for static host / offline persistence
  try {
    const existing = JSON.parse(localStorage.getItem('tunikabond_leads') || '[]');
    const updated = existing.map(l => (String(l.id) === String(leadId) ? { ...l, ...patchData } : l));
    localStorage.setItem('tunikabond_leads', JSON.stringify(updated));
  } catch {}

  return true;
};

export const apiDeleteLead = async (leadId) => {
  try {
    const res = await fetch(`/api/leads/${leadId}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (res.ok) {
      // Backend deleted
    }
  } catch {}

  // Sync to localStorage for static host / offline persistence
  try {
    const existing = JSON.parse(localStorage.getItem('tunikabond_leads') || '[]');
    const updated = existing.filter(l => String(l.id) !== String(leadId));
    localStorage.setItem('tunikabond_leads', JSON.stringify(updated));
  } catch {}

  return true;
};

// LocalStorage Keys for Offline / Vercel persistence
const STORAGE_PRODUCTS_KEY = 'tl_dynamic_products';
const STORAGE_PORTFOLIO_KEY = 'tl_dynamic_portfolio';
const STORAGE_TEAM_KEY = 'tl_dynamic_team';

// Helper for client-side image compression (Max 1000px, 85% JPEG)
export const compressImageFile = (file, maxWidth = 1000, maxHeight = 1000, quality = 0.85) => {
  return new Promise((resolve) => {
    if (!file) return resolve(null);
    if (!file.type.startsWith('image/') || file.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = () => resolve(e.target.result);
      img.src = e.target.result;
    };
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
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
  
  try {
    const saved = localStorage.getItem(STORAGE_PRODUCTS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}

  return initialProducts;
};

export const apiCreateProduct = async (productData) => {
  const newProduct = { ...productData, id: productData.id || `prod-${Date.now()}` };
  try {
    const res = await fetch('/api/products/', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(newProduct)
    });
    if (res.ok) return await res.json();
  } catch {}

  try {
    const current = await apiGetProducts();
    const updated = [newProduct, ...current];
    localStorage.setItem(STORAGE_PRODUCTS_KEY, JSON.stringify(updated));
  } catch {}

  return { success: true, product: newProduct };
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

  try {
    const current = await apiGetProducts();
    const updated = current.map(p => p.id === productId ? { ...p, ...productData } : p);
    localStorage.setItem(STORAGE_PRODUCTS_KEY, JSON.stringify(updated));
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

  try {
    const current = await apiGetProducts();
    const updated = current.filter(p => p.id !== productId);
    localStorage.setItem(STORAGE_PRODUCTS_KEY, JSON.stringify(updated));
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

  try {
    const saved = localStorage.getItem(STORAGE_PORTFOLIO_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}

  return initialPortfolio;
};

export const apiCreatePortfolio = async (itemData) => {
  const newItem = { ...itemData, id: itemData.id || `port-${Date.now()}` };
  try {
    const res = await fetch('/api/portfolio/', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(newItem)
    });
    if (res.ok) return await res.json();
  } catch {}

  try {
    const current = await apiGetPortfolio();
    const updated = [newItem, ...current];
    localStorage.setItem(STORAGE_PORTFOLIO_KEY, JSON.stringify(updated));
  } catch {}

  return { success: true, item: newItem };
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

  try {
    const current = await apiGetPortfolio();
    const updated = current.map(item => item.id === itemId ? { ...item, ...itemData } : item);
    localStorage.setItem(STORAGE_PORTFOLIO_KEY, JSON.stringify(updated));
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

  try {
    const current = await apiGetPortfolio();
    const updated = current.filter(item => item.id !== itemId);
    localStorage.setItem(STORAGE_PORTFOLIO_KEY, JSON.stringify(updated));
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

  try {
    const saved = localStorage.getItem(STORAGE_TEAM_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}

  return initialTeam;
};

export const apiCreateTeamMember = async (memberData) => {
  const newMember = { ...memberData, id: memberData.id || `team-${Date.now()}` };
  try {
    const res = await fetch('/api/team/', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(newMember)
    });
    if (res.ok) return await res.json();
  } catch {}

  try {
    const current = await apiGetTeam();
    const updated = [newMember, ...current];
    localStorage.setItem(STORAGE_TEAM_KEY, JSON.stringify(updated));
  } catch {}

  return { success: true, member: newMember };
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

  try {
    const current = await apiGetTeam();
    const updated = current.map(m => m.id === memberId ? { ...m, ...memberData } : m);
    localStorage.setItem(STORAGE_TEAM_KEY, JSON.stringify(updated));
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

  try {
    const current = await apiGetTeam();
    const updated = current.filter(m => m.id !== memberId);
    localStorage.setItem(STORAGE_TEAM_KEY, JSON.stringify(updated));
  } catch {}

  return true;
};

// --- BULLETPROOF FILE UPLOAD API ---
// Works instantly on static hosts (Vercel, GitHub Pages) and Flask backend
export const apiUploadFile = async (file) => {
  if (!file) return { success: false, error: "Fayl tanlanmadi" };

  // 1. Create client-side optimized Base64 preview instantly
  let localDataUrl = null;
  try {
    localDataUrl = await compressImageFile(file, 1000, 1000, 0.85);
  } catch (e) {
    console.error("Compression error:", e);
  }

  // Fallback to raw FileReader if compression failed
  if (!localDataUrl) {
    try {
      localDataUrl = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result || null);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(file);
      });
    } catch {}
  }

  // 2. Only attempt server upload if on localhost / local Flask backend
  const isLocalhost = typeof window !== 'undefined' && 
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

  if (isLocalhost) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1200);

      const res = await fetch('/api/upload/', {
        method: 'POST',
        body: formData,
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data && data.success && data.url) {
          return { success: true, url: data.url, filename: data.filename || file.name };
        }
      }
    } catch (err) {
      // Backend not running on localhost, fallback to Data URL
    }
  }

  // 3. Guaranteed instant result (zero network latency, works 100% on Vercel)
  if (localDataUrl) {
    return { 
      success: true, 
      url: localDataUrl, 
      filename: file.name,
      isLocal: true 
    };
  }

  return { success: false, error: "Rasmni o'qishda xatolik yuz berdi" };
};

export const apiExportLeadsUrl = () => '/api/leads/export';
