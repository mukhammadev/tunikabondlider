/**
 * Frontend API client communicating with backend /api endpoints
 * Falls back gracefully to localStorage or static data if backend is offline.
 */

import { products as initialProducts } from '../data/products.js';
import { portfolio as initialPortfolio } from '../data/portfolio.js';
import { initialTeam } from '../data/team.js';
import { swatches as initialSwatches } from '../data/swatches.js';
import { supabase } from './supabase.js';

const memoryStore = new Map();

export const safeStorage = {
  get: (key) => {
    if (typeof window !== 'undefined' && window.localStorage) {
      try { 
        const val = localStorage.getItem(key);
        if (val !== null) return val;
      } catch {}
    }
    return memoryStore.get(key) || null;
  },
  set: (key, val) => {
    const str = typeof val === 'string' ? val : JSON.stringify(val);
    if (typeof window !== 'undefined' && window.localStorage) {
      try { localStorage.setItem(key, str); } catch {}
    }
    memoryStore.set(key, str);
  },
  remove: (key) => {
    if (typeof window !== 'undefined' && window.localStorage) {
      try { localStorage.removeItem(key); } catch {}
    }
    memoryStore.delete(key);
  }
};

const TOKEN_KEY = 'tl_admin_token';
const USER_KEY = 'tl_admin_user';

export const getAuthToken = () => safeStorage.get(TOKEN_KEY);
export const getStoredUser = () => {
  try {
    return JSON.parse(safeStorage.get(USER_KEY) || 'null');
  } catch {
    return null;
  }
};

export const setAuthSession = (token, user) => {
  safeStorage.set(TOKEN_KEY, token);
  safeStorage.set(USER_KEY, JSON.stringify(user));
};

export const clearAuthSession = () => {
  safeStorage.remove(TOKEN_KEY);
  safeStorage.remove(USER_KEY);
};

export const getApiBase = () => {
  const custom = localStorage.getItem('tl_custom_api_url');
  if (custom && custom.trim()) {
    return custom.trim().replace(/\/$/, '');
  }
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && envUrl.trim()) {
    return envUrl.trim().replace(/\/$/, '');
  }
  return '';
};

export const setCustomApiUrl = (url) => {
  if (url) {
    localStorage.setItem('tl_custom_api_url', url.trim());
  } else {
    localStorage.removeItem('tl_custom_api_url');
  }
};

export const apiFetch = (path, options = {}) => {
  const base = getApiBase();
  const url = base ? `${base}${path}` : path;
  return fetch(url, options);
};

const getHeaders = () => {
  const token = getAuthToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

// --- STORAGE KEYS & SYNC NOTIFIER ---
export const STORAGE_PRODUCTS_KEY = 'tl_dynamic_products';
export const STORAGE_PORTFOLIO_KEY = 'tl_dynamic_portfolio';
export const STORAGE_TEAM_KEY = 'tl_dynamic_team';
export const STORAGE_SWATCHES_KEY = 'tunikabond_custom_swatches';
export const STORAGE_CALC_KEY = 'tl_dynamic_calc_settings';
export const STORAGE_LEADS_KEY = 'tunikabond_leads';
export const STORAGE_DELETED_LEADS_KEY = 'tunikabond_deleted_leads_v1';
export const STORAGE_ADMINS_KEY = 'tunikabond_custom_admins';
export const STORAGE_REVIEWS_KEY = 'tunikabond_reviews_v1';
export const STORAGE_DELETED_REVIEWS_KEY = 'tunikabond_deleted_reviews_v1';

export const notifyDataChanged = () => {
  if (typeof window !== 'undefined') {
    try {
      window.dispatchEvent(new CustomEvent('tunikabond_data_updated'));
    } catch {}
  }
};

export const getStoredAdmins = () => {
  try {
    const raw = safeStorage.get(STORAGE_ADMINS_KEY);
    if (!raw) return [];
    const custom = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (Array.isArray(custom)) {
      return custom.filter(a => a && a.username);
    }
    return [];
  } catch {
    return [];
  }
};

export const apiHasAdmins = () => {
  return getStoredAdmins().length > 0;
};

// --- AUTH API ---
export const apiLogin = async (username, password) => {
  const cleanUser = (username || '').trim();
  const cleanPass = (password || '').trim();
  const lowerUser = cleanUser.toLowerCase();

  if (!cleanUser || !cleanPass) {
    return { success: false, error: "Login va parolni kiriting." };
  }

  // 1. Try remote backend if reachable
  try {
    const res = await apiFetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: cleanUser, password: cleanPass })
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.success) {
        setAuthSession(data.token, data.user);
        return { success: true, user: data.user };
      }
      if (data && data.error) {
        return { success: false, error: data.error };
      }
    }
  } catch (err) {
    // Backend offline -> proceed to local check
  }

  // 2. Client-side local check
  const admins = getStoredAdmins();
  if (admins.length === 0) {
    return { 
      success: false, 
      isUninitialized: true,
      error: "Tizimda administrator hisobi mavjud emas. Iltimos, o'zingiz yangi login va parol yarating." 
    };
  }

  const matched = admins.find(a => (a.username || '').toLowerCase() === lowerUser);

  if (matched) {
    if (matched.password === cleanPass) {
      const safeUser = {
        id: matched.id || `admin-${Date.now()}`,
        username: matched.username,
        fullName: matched.fullName || matched.username,
        role: matched.role || 'Super Admin'
      };
      setAuthSession(`tl-token-${Date.now()}`, safeUser);
      return { success: true, user: safeUser };
    }
    return { success: false, error: "Kiritilgan parol noto'g'ri. Iltimos, qayta tekshiring." };
  }

  return { 
    success: false, 
    error: "Bunday loginli administrator topilmadi." 
  };
};

export const apiRegister = async (username, password, fullName, role = 'Admin') => {
  const cleanUser = (username || '').trim();
  const cleanPass = (password || '').trim();
  const cleanName = (fullName || '').trim() || cleanUser;

  if (!cleanUser || !cleanPass) {
    return { success: false, error: "Login va maxfiy parol kiritilishi shart." };
  }

  if (cleanPass.length < 4) {
    return { success: false, error: "Parol kamida 4 ta belgidan iborat bo'lishi kerak." };
  }

  const existing = getStoredAdmins();
  const alreadyExists = existing.some(a => (a.username || '').toLowerCase() === cleanUser.toLowerCase());
  if (alreadyExists) {
    return { success: false, error: "Bu logindagi administrator allaqachon mavjud. Iltimos, boshqa login tanlang." };
  }

  const isFirstAdmin = existing.length === 0;

  const newAdmin = {
    id: `admin-${Date.now()}`,
    username: cleanUser,
    fullName: cleanName,
    role: isFirstAdmin ? 'Super Admin' : (role || 'Admin'),
    password: cleanPass,
    createdAt: new Date().toISOString()
  };

  try {
    const res = await apiFetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: cleanUser, password: cleanPass, fullName: cleanName, role: newAdmin.role })
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.success) {
        // remote success
      }
    }
  } catch (err) {}

  // Save to persistent storage
  try {
    const filtered = existing.filter(a => (a.username || '').toLowerCase() !== cleanUser.toLowerCase());
    const updated = [...filtered, newAdmin];
    safeStorage.set(STORAGE_ADMINS_KEY, updated);
  } catch {}

  notifyDataChanged();
  return { success: true, user: newAdmin };
};

export const apiUpdateAdminPassword = async (username, currentPassword, newPassword) => {
  const cleanUser = (username || '').trim().toLowerCase();
  const cleanCurr = (currentPassword || '').trim();
  const cleanNew = (newPassword || '').trim();

  if (!cleanNew || cleanNew.length < 4) {
    return { success: false, error: "Yangi parol kamida 4 ta belgidan iborat bo'lishi kerak." };
  }

  const existing = getStoredAdmins();
  const target = existing.find(a => (a.username || '').toLowerCase() === cleanUser);
  if (!target) {
    return { success: false, error: "Administrator topilmadi." };
  }

  if (target.password !== cleanCurr) {
    return { success: false, error: "Joriy parol noto'g'ri kiritildi." };
  }

  target.password = cleanNew;
  target.updatedAt = new Date().toISOString();

  try {
    safeStorage.set(STORAGE_ADMINS_KEY, existing);
  } catch {}

  notifyDataChanged();
  return { success: true };
};

export const apiGetAdmins = async () => {
  try {
    const res = await apiFetch('/api/auth/admins');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) return data;
    }
  } catch {}

  // Return admins without exposing plaintext passwords
  return getStoredAdmins().map(({ password, ...rest }) => rest);
};

export const apiDeleteAdmin = async (adminId, currentUserId = null) => {
  try {
    const existing = getStoredAdmins();
    const target = existing.find(a => String(a.id) === String(adminId) || a.username === adminId);
    if (!target) {
      return { success: false, error: "Admin topilmadi." };
    }
    if (currentUserId && (String(target.id) === String(currentUserId) || target.username === currentUserId)) {
      return { success: false, error: "O'zingiz kirib turgan hisobni o'chira olmaysiz." };
    }
    const updated = existing.filter(a => String(a.id) !== String(adminId) && a.username !== adminId);
    safeStorage.set(STORAGE_ADMINS_KEY, updated);
    notifyDataChanged();
    return { success: true };
  } catch (err) {
    return { success: false, error: "O'chirishda xatolik yuz berdi" };
  }
};

// --- STATS API ---
export const apiGetStats = async () => {
  try {
    const res = await apiFetch('/api/stats/');
    if (res.ok) {
      const data = await res.json();
      if (data && data.totalLeads !== undefined) return data;
    }
  } catch {}

  const [leads, products, portfolio, admins, team, swatches] = await Promise.all([
    apiGetLeads(),
    apiGetProducts(),
    apiGetPortfolio(),
    apiGetAdmins(),
    apiGetTeam(),
    apiGetSwatches()
  ]);

  return {
    totalLeads: leads.length,
    newLeads: leads.filter(l => l.status === 'new' || !l.status).length,
    totalProducts: products.length,
    totalProjects: portfolio.length,
    totalAdmins: admins.length,
    totalTeam: team.length,
    totalSwatches: swatches.length
  };
};

export const cloudPushLead = async (newLead) => {
  // Primary: Save directly to Supabase leads table
  try {
    const supaLead = {
      id: String(newLead.id || `lead-${Date.now()}`),
      name: newLead.name || '',
      phone: newLead.phone || '',
      service: newLead.service || '',
      message: newLead.message || '',
      source: newLead.source || '',
      status: newLead.status || 'new',
      calc_data: newLead.calcData || newLead.calc_data || null,
      photo_url: newLead.photoUrl || newLead.photo_url || null,
      created_at: newLead.timestamp || newLead.date || new Date().toISOString()
    };
    await supabase.from('leads').upsert(supaLead);
    return true;
  } catch (e) {
    console.warn('Supabase push lead error:', e);
    return false;
  }
};

export const cloudGetCatalogData = async () => null;
export const cloudSaveCatalogData = async () => true;

// --- LEADS API ---
export const apiGetLeads = async () => {
  // 1. Fetch from Supabase leads table
  let supaLeads = [];
  try {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && Array.isArray(data)) {
      supaLeads = data.map(l => ({
        id: l.id,
        name: l.name,
        phone: l.phone,
        service: l.service,
        message: l.message,
        source: l.source,
        status: l.status || 'new',
        calcData: l.calc_data,
        photoUrl: l.photo_url,
        timestamp: l.created_at
      }));
    }
  } catch (err) {
    console.warn('Supabase fetch leads error:', err);
  }

  let backendLeads = [];
  // 2. Fetch from serverless API /api/leads or /api/leads/
  try {
    let res = await fetch('/api/leads', { headers: getHeaders() });
    if (!res.ok) {
      res = await apiFetch('/api/leads/', { headers: getHeaders() });
    }
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        backendLeads = data;
      }
    }
  } catch {}

  let localLeads = [];
  try {
    localLeads = JSON.parse(localStorage.getItem(STORAGE_LEADS_KEY) || '[]');
  } catch {}

  // Local statuses map so admin status changes are preserved
  const localStatusMap = new Map();
  localLeads.forEach(l => {
    if (l && l.id && l.status) {
      localStatusMap.set(String(l.id), l.status);
      if (l.phone) {
        localStatusMap.set(String(l.phone), l.status);
      }
    }
  });

  // Tombstone filter: avoid resurrecting leads that were deleted by admin
  let deletedSet = new Set();
  try {
    const rawDeleted = JSON.parse(localStorage.getItem(STORAGE_DELETED_LEADS_KEY) || '[]');
    deletedSet = new Set(rawDeleted.map(String));
  } catch {}

  const map = new Map();
  [...supaLeads, ...backendLeads, ...localLeads].forEach(l => {
    if (l && (l.id || l.phone)) {
      if (l.id && deletedSet.has(String(l.id))) {
        return;
      }
      const key = String(l.id || `${l.phone}_${l.timestamp || l.date}`);
      if (deletedSet.has(key)) {
        return;
      }
      if (!map.has(key)) {
        // Restore local status if admin already updated it
        const savedStatus = localStatusMap.get(String(l.id)) || (l.phone && localStatusMap.get(String(l.phone)));
        map.set(key, {
          ...l,
          status: savedStatus || l.status || 'new'
        });
      }
    }
  });

  const validStatuses = ['new', 'in_progress', 'completed', 'cancelled'];
  const normalized = Array.from(map.values()).map((l, index) => {
    let status = l.status;
    if (!status || !validStatuses.includes(status)) {
      status = 'new';
    }
    return {
      ...l,
      id: l.id || `lead-${index}-${Date.now()}`,
      status: status,
      timestamp: l.timestamp || l.date || new Date().toISOString()
    };
  });

  normalized.sort((a, b) => new Date(b.timestamp || b.date) - new Date(a.timestamp || a.date));

  // Heal and sync to local storage
  try {
    localStorage.setItem(STORAGE_LEADS_KEY, JSON.stringify(normalized.slice(0, 100)));
  } catch {}

  return normalized;
};

export const apiUpdateLead = async (leadId, patchData) => {
  // 1. Update in Supabase
  try {
    const supaPatch = { ...patchData };
    if (patchData.calcData) supaPatch.calc_data = patchData.calcData;
    if (patchData.photoUrl) supaPatch.photo_url = patchData.photoUrl;
    delete supaPatch.calcData;
    delete supaPatch.photoUrl;
    await supabase.from('leads').update(supaPatch).eq('id', String(leadId));
  } catch (err) {
    console.warn('Supabase update lead error:', err);
  }

  // 2. Update via serverless API
  try {
    await apiFetch(`/api/leads/${leadId}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(patchData)
    });
  } catch {}

  // Sync to localStorage
  try {
    const existing = JSON.parse(localStorage.getItem(STORAGE_LEADS_KEY) || '[]');
    const updated = existing.map(l => (String(l.id) === String(leadId) ? { ...l, ...patchData } : l));
    localStorage.setItem(STORAGE_LEADS_KEY, JSON.stringify(updated));
  } catch {}

  // Sync to Cloud Storage
  try {
    const cloudRes = await fetch(CLOUD_LEADS_URL);
    if (cloudRes.ok) {
      const json = await cloudRes.json();
      const current = json?.data?.leads || [];
      const updatedCloud = current.map(l => (String(l.id) === String(leadId) ? { ...l, ...patchData } : l));
      await fetch(CLOUD_LEADS_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'tunikabond_leads_v2',
          data: { leads: updatedCloud }
        })
      });
    }
  } catch {}

  notifyDataChanged();
  return true;
};

export const apiDeleteLead = async (leadId) => {
  // 1. Delete from Supabase
  try {
    await supabase.from('leads').delete().eq('id', String(leadId));
  } catch (err) {
    console.warn('Supabase delete lead error:', err);
  }

  try {
    await apiFetch(`/api/leads/${leadId}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
  } catch {}

  // Sync to localStorage
  try {
    const existing = JSON.parse(localStorage.getItem(STORAGE_LEADS_KEY) || '[]');
    const updated = existing.filter(l => String(l.id) !== String(leadId));
    localStorage.setItem(STORAGE_LEADS_KEY, JSON.stringify(updated));
  } catch {}

  // Mark in tombstone set so it is never revived by external feeds or Telegram getUpdates
  try {
    const deletedList = JSON.parse(localStorage.getItem(STORAGE_DELETED_LEADS_KEY) || '[]');
    const strId = String(leadId);
    if (!deletedList.includes(strId)) {
      deletedList.push(strId);
      localStorage.setItem(STORAGE_DELETED_LEADS_KEY, JSON.stringify(deletedList.slice(-300)));
    }
  } catch {}

  // Sync to Cloud Storage
  try {
    const cloudRes = await fetch(CLOUD_LEADS_URL);
    if (cloudRes.ok) {
      const json = await cloudRes.json();
      const current = json?.data?.leads || [];
      const updatedCloud = current.filter(l => String(l.id) !== String(leadId));
      await fetch(CLOUD_LEADS_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'tunikabond_leads_v2',
          data: { leads: updatedCloud }
        })
      });
    }
  } catch {}

  notifyDataChanged();
  return true;
};

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
  // 1. Fetch from Supabase products table (single source of truth)
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: true });
    if (!error && Array.isArray(data)) {
      const formatted = data.map(p => {
        const specs = p.specs || {};
        const shortDesc = p.shortDesc || specs.shortDesc || '';
        const priceRange = p.priceRange || p.price || '';
        return {
          ...p,
          priceRange,
          shortDesc,
          specs,
          isActive: p.is_active !== false
        };
      });
      safeStorage.set(STORAGE_PRODUCTS_KEY, formatted);
      return formatted;
    }
  } catch (e) {
    console.warn('Supabase get products error:', e);
  }

  // Fallbacks only if Supabase connection failed
  try {
    const res = await apiFetch('/api/products/');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) return data;
    }
  } catch {}

  try {
    const saved = localStorage.getItem(STORAGE_PRODUCTS_KEY) || localStorage.getItem('tunikabond_custom_products');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}

  // Only return defaults on first-ever visit (no Supabase data yet)
  return initialProducts;
};

export const apiCreateProduct = async (productData) => {
  const newProduct = { ...productData, id: productData.id || `prod-${Date.now()}` };

  const specsData = { ...(newProduct.specs || {}) };
  if (newProduct.shortDesc) {
    specsData.shortDesc = newProduct.shortDesc;
  }

  // 1. Save to Supabase (primary source of truth)
  try {
    const { error } = await supabase.from('products').upsert({
      id: String(newProduct.id),
      name: typeof newProduct.name === 'string' ? { uz: newProduct.name, ru: newProduct.name, en: newProduct.name } : newProduct.name,
      category: newProduct.category || '',
      price: newProduct.priceRange || newProduct.price || '',
      thickness: newProduct.thickness || '',
      coating: newProduct.coating || '',
      warranty: newProduct.warranty || '',
      image: newProduct.image || '',
      specs: specsData,
      badge: newProduct.badge || null,
      is_active: newProduct.isActive !== false
    });
    if (error) {
      console.error('Supabase create product error:', error);
      return { success: false, error: error.message || "Bazada saqlashda xatolik yuz berdi" };
    }
  } catch (e) {
    console.warn('Supabase create product exception:', e);
    return { success: false, error: e.message };
  }

  try {
    const saved = localStorage.getItem(STORAGE_PRODUCTS_KEY);
    const current = saved ? JSON.parse(saved) : [];
    const updated = [newProduct, ...(Array.isArray(current) ? current.filter(p => p.id !== newProduct.id) : [])];
    localStorage.setItem(STORAGE_PRODUCTS_KEY, JSON.stringify(updated));
    localStorage.setItem('tunikabond_custom_products', JSON.stringify(updated));
  } catch {}

  notifyDataChanged();
  return { success: true, product: newProduct };
};

export const apiUpdateProduct = async (productId, productData) => {
  try {
    const specsData = { ...(productData.specs || {}) };
    if (productData.shortDesc) {
      specsData.shortDesc = productData.shortDesc;
    }

    const supaPayload = {};
    if (productData.name !== undefined) supaPayload.name = typeof productData.name === 'string' ? { uz: productData.name, ru: productData.name, en: productData.name } : productData.name;
    if (productData.category !== undefined) supaPayload.category = productData.category;
    if (productData.priceRange !== undefined || productData.price !== undefined) {
      supaPayload.price = productData.priceRange || productData.price || '';
    }
    if (productData.thickness !== undefined) supaPayload.thickness = productData.thickness;
    if (productData.coating !== undefined) supaPayload.coating = productData.coating;
    if (productData.warranty !== undefined) supaPayload.warranty = productData.warranty;
    if (productData.image !== undefined) supaPayload.image = productData.image;
    if (productData.specs !== undefined || productData.shortDesc !== undefined) {
      supaPayload.specs = specsData;
    }
    if (productData.badge !== undefined) supaPayload.badge = productData.badge;
    if (productData.isActive !== undefined) supaPayload.is_active = productData.isActive;

    const { error } = await supabase.from('products').update(supaPayload).eq('id', String(productId));
    if (error) {
      console.error('Supabase update product error:', error);
      return { success: false, error: error.message };
    }
  } catch (e) {
    console.warn('Supabase update product error:', e);
    return { success: false, error: e.message };
  }

  try {
    const saved = localStorage.getItem(STORAGE_PRODUCTS_KEY);
    if (saved) {
      const current = JSON.parse(saved);
      const updated = Array.isArray(current) ? current.map(p => p.id === productId ? { ...p, ...productData } : p) : [];
      localStorage.setItem(STORAGE_PRODUCTS_KEY, JSON.stringify(updated));
      localStorage.setItem('tunikabond_custom_products', JSON.stringify(updated));
    }
  } catch {}

  notifyDataChanged();
  return { success: true };
};

export const apiDeleteProduct = async (productId) => {
  // 1. Delete from Supabase
  try {
    const { error } = await supabase.from('products').delete().eq('id', String(productId));
    if (error) console.error('Supabase delete product error:', error);
  } catch (e) {
    console.warn('Supabase delete product error:', e);
  }

  // 2. Update localStorage directly
  try {
    const saved = localStorage.getItem(STORAGE_PRODUCTS_KEY);
    if (saved) {
      const current = JSON.parse(saved);
      const updated = Array.isArray(current) ? current.filter(p => String(p.id) !== String(productId)) : [];
      localStorage.setItem(STORAGE_PRODUCTS_KEY, JSON.stringify(updated));
      localStorage.setItem('tunikabond_custom_products', JSON.stringify(updated));
    }
  } catch {}

  notifyDataChanged();
  return true;
};

// --- PORTFOLIO API ---
export const apiGetPortfolio = async () => {
  // 1. Fetch from Supabase portfolio table (single source of truth)
  try {
    const { data, error } = await supabase
      .from('portfolio')
      .select('*')
      .order('created_at', { ascending: true });
    if (!error && Array.isArray(data)) {
      const formatted = data.map(item => {
        const desc = item.description || item.desc || {};
        return {
          ...item,
          masterId: item.master_id || item.masterId || null,
          masterName: desc.masterName || item.masterName || '',
          masterPhoto: desc.masterPhoto || item.masterPhoto || '',
          masterRole: desc.masterRole || item.masterRole || '',
          material: desc.material || item.material || '',
          area: desc.area || item.area || '',
          time: desc.time || item.duration || '',
          desc
        };
      });
      safeStorage.set(STORAGE_PORTFOLIO_KEY, formatted);
      return formatted;
    }
  } catch (e) {
    console.warn('Supabase get portfolio error:', e);
  }

  try {
    const res = await apiFetch('/api/portfolio/');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) return data;
    }
  } catch {}

  try {
    const saved = localStorage.getItem(STORAGE_PORTFOLIO_KEY) || localStorage.getItem('tunikabond_custom_portfolio');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}

  return initialPortfolio;
};

export const apiCreatePortfolio = async (itemData) => {
  const newItem = { ...itemData, id: itemData.id || ('port-' + Date.now()) };

  const descData = typeof newItem.desc === 'object' ? { ...newItem.desc } : {};
  if (newItem.material) descData.material = newItem.material;
  if (newItem.area) descData.area = newItem.area;
  if (newItem.time) descData.time = newItem.time;
  if (newItem.masterName) descData.masterName = newItem.masterName;
  if (newItem.masterPhoto) descData.masterPhoto = newItem.masterPhoto;
  if (newItem.masterRole) descData.masterRole = newItem.masterRole;

  // 1. Save to Supabase
  try {
    const { error } = await supabase.from('portfolio').upsert({
      id: String(newItem.id),
      title: typeof newItem.title === 'string' ? { uz: newItem.title, ru: newItem.title, en: newItem.title } : newItem.title,
      category: newItem.category || '',
      image: newItem.image || '',
      master_id: newItem.masterId ? String(newItem.masterId) : null,
      duration: newItem.duration || newItem.time || '',
      location: newItem.location || '',
      description: descData
    });
    if (error) {
      console.error('Supabase create portfolio error:', error);
      return { success: false, error: error.message };
    }
  } catch (e) {
    console.warn('Supabase create portfolio exception:', e);
    return { success: false, error: e.message };
  }

  try {
    const saved = localStorage.getItem(STORAGE_PORTFOLIO_KEY);
    const current = saved ? JSON.parse(saved) : [];
    const updated = [newItem, ...(Array.isArray(current) ? current.filter(i => i.id !== newItem.id) : [])];
    localStorage.setItem(STORAGE_PORTFOLIO_KEY, JSON.stringify(updated));
    localStorage.setItem('tunikabond_custom_portfolio', JSON.stringify(updated));
  } catch {}

  notifyDataChanged();
  return { success: true, item: newItem };
};

export const apiUpdatePortfolio = async (itemId, itemData) => {
  try {
    const descData = typeof itemData.desc === 'object' ? { ...itemData.desc } : {};
    if (itemData.material) descData.material = itemData.material;
    if (itemData.area) descData.area = itemData.area;
    if (itemData.time) descData.time = itemData.time;
    if (itemData.masterName) descData.masterName = itemData.masterName;
    if (itemData.masterPhoto) descData.masterPhoto = itemData.masterPhoto;
    if (itemData.masterRole) descData.masterRole = itemData.masterRole;

    const supaPayload = {};
    if (itemData.title !== undefined) supaPayload.title = typeof itemData.title === 'string' ? { uz: itemData.title, ru: itemData.title, en: itemData.title } : itemData.title;
    if (itemData.category !== undefined) supaPayload.category = itemData.category;
    if (itemData.image !== undefined) supaPayload.image = itemData.image;
    if (itemData.masterId !== undefined) supaPayload.master_id = itemData.masterId ? String(itemData.masterId) : null;
    if (itemData.duration !== undefined || itemData.time !== undefined) {
      supaPayload.duration = itemData.duration || itemData.time || '';
    }
    if (itemData.location !== undefined) supaPayload.location = itemData.location;
    supaPayload.description = descData;

    const { error } = await supabase.from('portfolio').update(supaPayload).eq('id', String(itemId));
    if (error) {
      console.error('Supabase update portfolio error:', error);
      return { success: false, error: error.message };
    }
  } catch (e) {
    console.warn('Supabase update portfolio error:', e);
    return { success: false, error: e.message };
  }

  try {
    const saved = localStorage.getItem(STORAGE_PORTFOLIO_KEY);
    if (saved) {
      const current = JSON.parse(saved);
      const updated = Array.isArray(current) ? current.map(item => item.id === itemId ? { ...item, ...itemData } : item) : [];
      localStorage.setItem(STORAGE_PORTFOLIO_KEY, JSON.stringify(updated));
      localStorage.setItem('tunikabond_custom_portfolio', JSON.stringify(updated));
    }
  } catch {}

  notifyDataChanged();
  return { success: true };
};

export const apiDeletePortfolio = async (itemId) => {
  // 1. Delete from Supabase
  try {
    const { error } = await supabase.from('portfolio').delete().eq('id', String(itemId));
    if (error) console.error('Supabase delete portfolio error:', error);
  } catch (e) {
    console.warn('Supabase delete portfolio error:', e);
  }

  // 2. Update localStorage directly
  try {
    const saved = localStorage.getItem(STORAGE_PORTFOLIO_KEY);
    if (saved) {
      const current = JSON.parse(saved);
      const updated = Array.isArray(current) ? current.filter(item => String(item.id) !== String(itemId)) : [];
      localStorage.setItem(STORAGE_PORTFOLIO_KEY, JSON.stringify(updated));
      localStorage.setItem('tunikabond_custom_portfolio', JSON.stringify(updated));
    }
  } catch {}

  notifyDataChanged();
  return true;
};

// --- TEAM & MASTERS API ---
export const apiGetTeam = async () => {
  // 1. Fetch from Supabase team table (single source of truth)
  try {
    const { data, error } = await supabase
      .from('team')
      .select('*')
      .order('created_at', { ascending: true });
    if (!error && Array.isArray(data)) {
      const formatted = data.map(m => ({
        ...m,
        completedProjects: m.completed_projects || m.completedProjects || '',
        isLeader: m.is_leader !== undefined ? m.is_leader : (m.isLeader || false)
      }));
      safeStorage.set(STORAGE_TEAM_KEY, formatted);
      return formatted;
    }
  } catch (e) {
    console.warn('Supabase get team error:', e);
  }

  try {
    const saved = localStorage.getItem(STORAGE_TEAM_KEY) || localStorage.getItem('tunikabond_custom_team');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}

  return initialTeam;
};

export const apiCreateTeamMember = async (memberData) => {
  const newMember = { ...memberData, id: memberData.id || ('team-' + Date.now()) };

  // 1. Save to Supabase
  try {
    const { error } = await supabase.from('team').upsert({
      id: String(newMember.id),
      name: newMember.name,
      role: newMember.role || '',
      label: newMember.label || '',
      phone: newMember.phone || '',
      photo: newMember.photo || '',
      experience: newMember.experience || '',
      completed_projects: newMember.completedProjects || newMember.completed_projects || '',
      bio: newMember.bio || '',
      works: newMember.works || [],
      is_leader: newMember.isLeader || newMember.is_leader || false
    });
    if (error) {
      console.error('Supabase create team error:', error);
      return { success: false, error: error.message };
    }
  } catch (e) {
    console.warn('Supabase create team member error:', e);
    return { success: false, error: e.message };
  }

  try {
    const saved = localStorage.getItem(STORAGE_TEAM_KEY);
    const current = saved ? JSON.parse(saved) : [];
    const updated = [newMember, ...(Array.isArray(current) ? current.filter(m => m.id !== newMember.id) : [])];
    localStorage.setItem(STORAGE_TEAM_KEY, JSON.stringify(updated));
    localStorage.setItem('tunikabond_custom_team', JSON.stringify(updated));
  } catch {}

  notifyDataChanged();
  return { success: true, member: newMember };
};

export const apiUpdateTeamMember = async (memberId, memberData) => {
  try {
    const supaPayload = {};
    if (memberData.name !== undefined) supaPayload.name = memberData.name;
    if (memberData.role !== undefined) supaPayload.role = memberData.role;
    if (memberData.label !== undefined) supaPayload.label = memberData.label;
    if (memberData.phone !== undefined) supaPayload.phone = memberData.phone;
    if (memberData.photo !== undefined) supaPayload.photo = memberData.photo;
    if (memberData.experience !== undefined) supaPayload.experience = memberData.experience;
    if (memberData.completedProjects !== undefined || memberData.completed_projects !== undefined) {
      supaPayload.completed_projects = memberData.completedProjects || memberData.completed_projects || '';
    }
    if (memberData.bio !== undefined) supaPayload.bio = memberData.bio;
    if (memberData.works !== undefined) supaPayload.works = memberData.works;
    if (memberData.isLeader !== undefined || memberData.is_leader !== undefined) {
      supaPayload.is_leader = memberData.isLeader !== undefined ? memberData.isLeader : memberData.is_leader;
    }

    const { error } = await supabase.from('team').update(supaPayload).eq('id', String(memberId));
    if (error) {
      console.error('Supabase update team error:', error);
      return { success: false, error: error.message };
    }
  } catch (e) {
    console.warn('Supabase update team error:', e);
    return { success: false, error: e.message };
  }

  try {
    const saved = localStorage.getItem(STORAGE_TEAM_KEY);
    if (saved) {
      const current = JSON.parse(saved);
      const updated = Array.isArray(current) ? current.map(m => m.id === memberId ? { ...m, ...memberData } : m) : [];
      localStorage.setItem(STORAGE_TEAM_KEY, JSON.stringify(updated));
      localStorage.setItem('tunikabond_custom_team', JSON.stringify(updated));
    }
  } catch {}

  notifyDataChanged();
  return { success: true };
};

export const apiDeleteTeamMember = async (memberId) => {
  // 1. Delete from Supabase
  try {
    const { error } = await supabase.from('team').delete().eq('id', String(memberId));
    if (error) console.error('Supabase delete team error:', error);
  } catch (e) {
    console.warn('Supabase delete team error:', e);
  }

  // 2. Update localStorage directly
  try {
    const saved = localStorage.getItem(STORAGE_TEAM_KEY);
    if (saved) {
      const current = JSON.parse(saved);
      const updated = Array.isArray(current) ? current.filter(m => String(m.id) !== String(memberId)) : [];
      localStorage.setItem(STORAGE_TEAM_KEY, JSON.stringify(updated));
      localStorage.setItem('tunikabond_custom_team', JSON.stringify(updated));
    }
  } catch {}

  notifyDataChanged();
  return true;
};

export const apiGetReviews = async () => {
  // Tombstone filter: avoid resurrecting reviews that were deleted by admin
  let deletedSet = new Set();
  try {
    const rawDeleted = JSON.parse(safeStorage.get(STORAGE_DELETED_REVIEWS_KEY) || '[]');
    deletedSet = new Set(rawDeleted.map(String));
  } catch {}

  // 1. Fetch from Supabase (Persistent multi-user cross-device database)
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && Array.isArray(data)) {
      const filtered = data.filter(r => r && r.id && !deletedSet.has(String(r.id)));
      safeStorage.set(STORAGE_REVIEWS_KEY, filtered);
      return filtered;
    }
  } catch (err) {
    console.warn('Supabase fetch reviews error:', err);
  }

  // 2. Fetch from serverless API /api/reviews fallback
  try {
    const res = await fetch('/api/reviews');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const filtered = data.filter(r => r && r.id && !deletedSet.has(String(r.id)));
        safeStorage.set(STORAGE_REVIEWS_KEY, filtered);
        return filtered;
      }
    }
  } catch {}

  // 3. Check local storage
  try {
    const saved = safeStorage.get(STORAGE_REVIEWS_KEY);
    if (saved) {
      const parsed = typeof saved === 'string' ? JSON.parse(saved) : saved;
      if (Array.isArray(parsed)) {
        return parsed.filter(r => r && r.id && !deletedSet.has(String(r.id)));
      }
    }
  } catch {}

  return [];
};

export const apiAddReview = async (reviewData) => {
  const newReview = {
    id: reviewData.id || `rev-${Date.now()}`,
    name: reviewData.name?.trim() || "Mijoz",
    role: reviewData.role?.trim() || "Buyurtmachi",
    project: reviewData.project?.trim() || "Fasad yoki naves montaji",
    location: reviewData.location?.trim() || "Toshkent shahri",
    rating: Number(reviewData.rating) || 5,
    comment: reviewData.comment?.trim() || "",
    date: reviewData.date || new Date().toLocaleDateString('uz-UZ', { month: 'long', year: 'numeric' })
  };

  // 1. Save directly to Supabase reviews table (Instant & permanent for all users!)
  try {
    await supabase.from('reviews').upsert({
      id: String(newReview.id),
      name: newReview.name,
      role: newReview.role,
      project: newReview.project,
      location: newReview.location,
      rating: newReview.rating,
      comment: newReview.comment,
      date: newReview.date,
      created_at: new Date().toISOString()
    });
  } catch (e) {
    console.warn('Supabase upsert review error:', e);
  }

  // 2. Forward to serverless API /api/reviews for Telegram notification
  try {
    fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newReview)
    }).catch(() => {});
  } catch {}

  // 3. Save locally immediately
  try {
    const raw = safeStorage.get(STORAGE_REVIEWS_KEY);
    const current = raw ? (typeof raw === 'string' ? JSON.parse(raw) : raw) : [];
    const updated = [newReview, ...current.filter(r => String(r.id) !== String(newReview.id))];
    safeStorage.set(STORAGE_REVIEWS_KEY, updated);
  } catch {}

  notifyDataChanged();
  return { success: true, review: newReview };
};

export const apiDeleteReview = async (reviewId) => {
  const strId = String(reviewId);
  const numId = parseInt(strId, 10);

  // 1. Mark in tombstone set so it can NEVER be revived locally
  try {
    const deletedList = JSON.parse(safeStorage.get(STORAGE_DELETED_REVIEWS_KEY) || '[]');
    if (!deletedList.includes(strId)) {
      deletedList.push(strId);
      safeStorage.set(STORAGE_DELETED_REVIEWS_KEY, JSON.stringify(deletedList.slice(-500)));
    }
  } catch {}

  // 2. Delete from Supabase — try both string and numeric ID forms
  try {
    // Try string id first
    const { error } = await supabase.from('reviews').delete().eq('id', strId);
    // If that fails or no rows affected, try numeric id
    if (error && !isNaN(numId)) {
      await supabase.from('reviews').delete().eq('id', numId);
    }
  } catch (e) {
    console.warn('Supabase delete review error:', e);
    // Try numeric fallback on exception
    try {
      if (!isNaN(numId)) {
        await supabase.from('reviews').delete().eq('id', numId);
      }
    } catch {}
  }

  // 3. Delete via serverless API (also deletes from Supabase on server-side)
  try {
    fetch('/api/reviews?id=' + encodeURIComponent(strId), { method: 'DELETE' }).catch(() => {});
  } catch {}

  // 4. Immediately clean local cache
  try {
    const raw = safeStorage.get(STORAGE_REVIEWS_KEY);
    const existing = raw ? (typeof raw === 'string' ? JSON.parse(raw) : raw) : [];
    if (Array.isArray(existing)) {
      const updated = existing.filter(r => String(r.id) !== strId);
      safeStorage.set(STORAGE_REVIEWS_KEY, updated);
    }
  } catch {}

  notifyDataChanged();
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

      const res = await apiFetch('/api/upload/', {
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

// --- CALCULATOR SETTINGS API ---
export const DEFAULT_CALC_SETTINGS = {
  materialPrices: {
    tunikabond_standard: 115000,
    tunikabond_premium: 135000,
    alyukabond_standard: 155000,
    alyukabond_fireproof: 235000,
    profnastil: 75000
  },
  installationRates: {
    cottage: 65000,
    commercial: 75000,
    cornice: 50000,
    roof: 45000
  }
};

export const apiGetCalcSettings = async () => {
  try {
    const res = await apiFetch('/api/calculator/settings');
    if (res.ok) {
      const data = await res.json();
      if (data && data.materialPrices) return data;
    }
  } catch {}

  // Cloud sync
  try {
    const cData = await cloudGetCatalogData();
    if (cData?.calcSettings?.materialPrices) {
      try {
        localStorage.setItem(STORAGE_CALC_KEY, JSON.stringify(cData.calcSettings));
      } catch {}
      return cData.calcSettings;
    }
  } catch {}

  try {
    const saved = localStorage.getItem(STORAGE_CALC_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.materialPrices) return parsed;
    }
  } catch {}

  return DEFAULT_CALC_SETTINGS;
};

export const apiUpdateCalcSettings = async (settings) => {
  try {
    await apiFetch('/api/calculator/settings', {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(settings)
    });
  } catch {}

  try {
    localStorage.setItem(STORAGE_CALC_KEY, JSON.stringify(settings));
  } catch {}

  try {
    await cloudSaveCatalogData({ calcSettings: settings });
  } catch {}

  notifyDataChanged();
  return { success: true, settings };
};

// --- SWATCHES (RANGLAR VA TEKSTURALAR) API ---
export const apiGetSwatches = async () => {
  // 1. Fetch from Supabase swatches table (single source of truth)
  try {
    const { data, error } = await supabase
      .from('swatches')
      .select('*')
      .order('created_at', { ascending: true });
    if (!error && Array.isArray(data)) {
      const formatted = data.map(s => ({
        ...s,
        colorHex: s.color_hex || s.colorHex,
        bgGradient: s.bg_gradient || s.bgGradient
      }));
      safeStorage.set(STORAGE_SWATCHES_KEY, formatted);
      return formatted;
    }
  } catch (e) {
    console.warn('Supabase get swatches error:', e);
  }

  try {
    const res = await apiFetch('/api/swatches/');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) return data;
    }
  } catch {}

  try {
    const saved = localStorage.getItem(STORAGE_SWATCHES_KEY) || localStorage.getItem('tl_dynamic_swatches');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}

  return initialSwatches;
};

export const apiCreateSwatch = async (swatchData) => {
  const newSwatch = {
    ...swatchData,
    id: swatchData.id || `swatch-${Date.now()}`
  };

  // 1. Save to Supabase
  try {
    const { error } = await supabase.from('swatches').upsert({
      id: String(newSwatch.id),
      name: typeof newSwatch.name === 'string' ? { uz: newSwatch.name, ru: newSwatch.name, en: newSwatch.name } : newSwatch.name,
      category: newSwatch.category || '',
      code: newSwatch.code || '',
      color_hex: newSwatch.colorHex || newSwatch.color_hex || '',
      bg_gradient: newSwatch.bgGradient || newSwatch.bg_gradient || '',
      image: newSwatch.image || '',
      texture: newSwatch.texture || '',
      finish: newSwatch.finish || '',
      coating: newSwatch.coating || '',
      application: newSwatch.application || ''
    });
    if (error) {
      console.error('Supabase create swatch error:', error);
      return { success: false, error: error.message };
    }
  } catch (e) {
    console.warn('Supabase create swatch error:', e);
    return { success: false, error: e.message };
  }

  let updated = [newSwatch];
  try {
    const existing = await apiGetSwatches();
    updated = [newSwatch, ...existing.filter(s => String(s.id) !== String(newSwatch.id))];
    localStorage.setItem(STORAGE_SWATCHES_KEY, JSON.stringify(updated));
    localStorage.setItem('tl_dynamic_swatches', JSON.stringify(updated));
  } catch {}

  notifyDataChanged();
  return { success: true, swatch: newSwatch };
};

export const apiUpdateSwatch = async (swatchId, swatchData) => {
  // 1. Update in Supabase
  try {
    const supaPayload = {};
    if (swatchData.name !== undefined) supaPayload.name = typeof swatchData.name === 'string' ? { uz: swatchData.name, ru: swatchData.name, en: swatchData.name } : swatchData.name;
    if (swatchData.category !== undefined) supaPayload.category = swatchData.category;
    if (swatchData.code !== undefined) supaPayload.code = swatchData.code;
    if (swatchData.colorHex !== undefined || swatchData.color_hex !== undefined) {
      supaPayload.color_hex = swatchData.colorHex || swatchData.color_hex;
    }
    if (swatchData.bgGradient !== undefined || swatchData.bg_gradient !== undefined) {
      supaPayload.bg_gradient = swatchData.bgGradient || swatchData.bg_gradient;
    }
    if (swatchData.image !== undefined) supaPayload.image = swatchData.image;
    if (swatchData.texture !== undefined) supaPayload.texture = swatchData.texture;
    if (swatchData.finish !== undefined) supaPayload.finish = swatchData.finish;
    if (swatchData.coating !== undefined) supaPayload.coating = swatchData.coating;
    if (swatchData.application !== undefined) supaPayload.application = swatchData.application;

    const { error } = await supabase.from('swatches').update(supaPayload).eq('id', String(swatchId));
    if (error) {
      console.error('Supabase update swatch error:', error);
      return { success: false, error: error.message };
    }
  } catch (e) {
    console.warn('Supabase update swatch error:', e);
    return { success: false, error: e.message };
  }

  let updated = [];
  try {
    const existing = await apiGetSwatches();
    updated = existing.map(s => String(s.id) === String(swatchId) ? { ...s, ...swatchData } : s);
    localStorage.setItem(STORAGE_SWATCHES_KEY, JSON.stringify(updated));
    localStorage.setItem('tl_dynamic_swatches', JSON.stringify(updated));
  } catch {}

  notifyDataChanged();
  return { success: true };
};

export const apiDeleteSwatch = async (swatchId) => {
  // 1. Delete from Supabase
  try {
    await supabase.from('swatches').delete().eq('id', String(swatchId));
  } catch (e) {
    console.warn('Supabase delete swatch error:', e);
  }

  // 2. Update localStorage directly
  try {
    const saved = localStorage.getItem(STORAGE_SWATCHES_KEY);
    if (saved) {
      const current = JSON.parse(saved);
      const updated = Array.isArray(current) ? current.filter(s => String(s.id) !== String(swatchId)) : [];
      localStorage.setItem(STORAGE_SWATCHES_KEY, JSON.stringify(updated));
      localStorage.setItem('tl_dynamic_swatches', JSON.stringify(updated));
    }
  } catch {}

  notifyDataChanged();
  return { success: true };
};

// --- DATA BACKUP & RESTORE API ---
export const apiExportAllData = async () => {
  const [leads, products, portfolio, team, swatchesList, calcSettings] = await Promise.all([
    apiGetLeads(),
    apiGetProducts(),
    apiGetPortfolio(),
    apiGetTeam(),
    apiGetSwatches(),
    apiGetCalcSettings()
  ]);

  const backup = {
    appName: "Tunikabond Lider CMS",
    version: "2.0",
    exportedAt: new Date().toISOString(),
    data: {
      leads,
      products,
      portfolio,
      team,
      swatches: swatchesList,
      calcSettings
    }
  };

  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `tunikabond_lider_backup_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const apiImportData = async (jsonData) => {
  try {
    const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
    const payload = data.data || data;

    if (payload.calcSettings) {
      await apiUpdateCalcSettings(payload.calcSettings);
    }
    if (Array.isArray(payload.products)) {
      const json = JSON.stringify(payload.products);
      localStorage.setItem(STORAGE_PRODUCTS_KEY, json);
      localStorage.setItem('tunikabond_custom_products', json);
    }
    if (Array.isArray(payload.portfolio)) {
      const json = JSON.stringify(payload.portfolio);
      localStorage.setItem(STORAGE_PORTFOLIO_KEY, json);
      localStorage.setItem('tunikabond_custom_portfolio', json);
    }
    if (Array.isArray(payload.team)) {
      const json = JSON.stringify(payload.team);
      localStorage.setItem(STORAGE_TEAM_KEY, json);
      localStorage.setItem('tunikabond_custom_team', json);
    }
    if (Array.isArray(payload.swatches)) {
      const json = JSON.stringify(payload.swatches);
      localStorage.setItem(STORAGE_SWATCHES_KEY, json);
      localStorage.setItem('tl_dynamic_swatches', json);
    }
    if (Array.isArray(payload.leads)) {
      localStorage.setItem(STORAGE_LEADS_KEY, JSON.stringify(payload.leads));
    }
    notifyDataChanged();
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

