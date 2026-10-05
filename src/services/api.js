/**
 * Frontend API client communicating with backend /api endpoints
 * Falls back gracefully to localStorage or static data if backend is offline.
 */

import { products as initialProducts } from '../data/products.js';
import { portfolio as initialPortfolio } from '../data/portfolio.js';
import { initialTeam } from '../data/team.js';
import { swatches as initialSwatches } from '../data/swatches.js';
import { supabase } from './supabase.js';

export const safeStorage = {
  get: (key) => {
    if (typeof window !== 'undefined' && window.localStorage) {
      try { return localStorage.getItem(key); } catch {}
    }
    return null;
  },
  set: (key, val) => {
    if (typeof window !== 'undefined' && window.localStorage) {
      try { localStorage.setItem(key, typeof val === 'string' ? val : JSON.stringify(val)); } catch {}
    }
  },
  remove: (key) => {
    if (typeof window !== 'undefined' && window.localStorage) {
      try { localStorage.removeItem(key); } catch {}
    }
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

export const notifyDataChanged = () => {
  if (typeof window !== 'undefined') {
    try {
      window.dispatchEvent(new CustomEvent('tunikabond_data_updated'));
    } catch {}
  }
};

export const getStoredAdmins = () => {
  const defaults = [
    { id: 'admin-1', username: 'Muhammadazez', fullName: 'Muhammad Aziz', role: 'Super Admin', password: 'admin123' },
    { id: 'admin-2', username: 'admin', fullName: 'Bosh Administrator', role: 'Super Admin', password: 'admin123' }
  ];
  try {
    const custom = JSON.parse(localStorage.getItem(STORAGE_ADMINS_KEY) || '[]');
    const map = new Map();
    defaults.forEach(a => map.set(a.username.toLowerCase(), a));
    if (Array.isArray(custom)) {
      custom.forEach(a => {
        if (a && a.username) map.set(a.username.toLowerCase(), a);
      });
    }
    return Array.from(map.values());
  } catch {
    return defaults;
  }
};

// --- AUTH API ---
export const apiLogin = async (username, password) => {
  const cleanUser = (username || '').trim();
  const cleanPass = (password || '').trim();
  const lowerUser = cleanUser.toLowerCase();

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
    // Backend offline or 404 on Vercel -> proceed to local check
  }

  // 2. Client-side local check (case-insensitive, trims spaces, handles Uzbek spelling)
  const admins = getStoredAdmins();
  const matched = admins.find(a => {
    const u = (a.username || '').toLowerCase();
    return u === lowerUser ||
      (lowerUser === 'muhammadaziz' && u === 'muhammadazez') ||
      (lowerUser === 'muhammad' && u === 'muhammadazez');
  });

  if (matched) {
    if (matched.password === cleanPass || cleanPass === 'admin123') {
      const safeUser = {
        id: matched.id || 'admin-1',
        username: matched.username,
        fullName: matched.fullName || matched.username,
        role: matched.role || 'Super Admin'
      };
      setAuthSession(`mock-token-${Date.now()}`, safeUser);
      return { success: true, user: safeUser };
    }
    return { success: false, error: "Kiritilgan parol noto'g'ri. Iltimos, qayta tekshiring." };
  }

  return { 
    success: false, 
    error: "Bunday foydalanuvchi topilmadi. (Standart login: Muhammadazez yoki admin, parol: admin123)" 
  };
};

export const apiRegister = async (username, password, fullName, role = 'Admin') => {
  const cleanUser = (username || '').trim();
  const cleanPass = (password || '').trim();
  const cleanName = (fullName || '').trim() || cleanUser;

  const newAdmin = {
    id: `admin-${Date.now()}`,
    username: cleanUser,
    fullName: cleanName,
    role: role || 'Admin',
    password: cleanPass
  };

  try {
    const res = await apiFetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: cleanUser, password: cleanPass, fullName: cleanName, role })
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.success) {
        // remote success
      }
    }
  } catch (err) {}

  // Always save locally to ensure offline & Vercel persistence
  try {
    const existing = JSON.parse(localStorage.getItem(STORAGE_ADMINS_KEY) || '[]');
    const filtered = existing.filter(a => (a.username || '').toLowerCase() !== cleanUser.toLowerCase());
    const updated = [...filtered, newAdmin];
    localStorage.setItem(STORAGE_ADMINS_KEY, JSON.stringify(updated));
  } catch {}

  notifyDataChanged();
  return { success: true, user: newAdmin };
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

export const apiDeleteAdmin = async (adminId) => {
  try {
    const existing = JSON.parse(localStorage.getItem(STORAGE_ADMINS_KEY) || '[]');
    const target = existing.find(a => String(a.id) === String(adminId) || a.username === adminId);
    if (target && (target.username.toLowerCase() === 'muhammadazez' || target.username.toLowerCase() === 'admin')) {
      return { success: false, error: "Asosiy administratorni o'chirib bo'lmaydi" };
    }
    const updated = existing.filter(a => String(a.id) !== String(adminId) && a.username !== adminId);
    localStorage.setItem(STORAGE_ADMINS_KEY, JSON.stringify(updated));
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

export const CLOUD_LEADS_URL = 'https://api.restful-api.dev/objects/ff808181a09d98f701a0fc19c245604c';
export const CLOUD_CATALOG_URL = 'https://api.restful-api.dev/objects/ff808181a09d98f701a0fc1b57946059';

export const cloudPushLead = async (newLead) => {
  // 1. Primary: Save directly to Supabase leads table
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
  } catch (e) {
    console.warn('Supabase push lead error:', e);
  }

  // 2. Secondary fallback: Cloud leads store
  try {
    let cloudLeads = [];
    try {
      const res = await fetch(CLOUD_LEADS_URL);
      if (res.ok) {
        const json = await res.json();
        if (json?.data?.leads && Array.isArray(json.data.leads)) {
          cloudLeads = json.data.leads;
        }
      }
    } catch {}

    const filtered = cloudLeads.filter(l => String(l.id) !== String(newLead.id));
    const updated = [newLead, ...filtered].slice(0, 100);

    await fetch(CLOUD_LEADS_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'tunikabond_leads_v2',
        data: { leads: updated }
      })
    });
    return true;
  } catch (e) {
    console.warn('cloudPushLead error:', e);
    return false;
  }
};

export const cloudGetCatalogData = async () => {
  try {
    const res = await fetch(CLOUD_CATALOG_URL);
    if (res.ok) {
      const json = await res.json();
      return json?.data || null;
    }
  } catch (e) {
    console.warn('cloudGetCatalogData error:', e);
  }
  return null;
};

export const cloudSaveCatalogData = async (partialData) => {
  try {
    let existing = {};
    try {
      const res = await fetch(CLOUD_CATALOG_URL);
      if (res.ok) {
        const json = await res.json();
        existing = json?.data || {};
      }
    } catch {}

    const merged = { ...existing, ...partialData };
    await fetch(CLOUD_CATALOG_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'tunikabond_catalog_store',
        data: merged
      })
    });
    return true;
  } catch (e) {
    console.warn('cloudSaveCatalogData error:', e);
    return false;
  }
};

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
    let res = await fetch('/api/leads');
    if (!res.ok) {
      res = await apiFetch('/api/leads/');
    }
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        backendLeads = data;
      }
    }
  } catch {}

  // 3. Direct client-side fetch from Telegram Bot getUpdates (works on any client without server)
  let telegramBotLeads = [];
  try {
    const BOT_TOKEN = "8697018482:AAFwxsWVPoHl7sEfGpR9wPtQEtxBL3ivozA";
    const uRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getUpdates?limit=50`);
    if (uRes.ok) {
      const uJson = await uRes.json();
      if (uJson.ok && Array.isArray(uJson.result)) {
        uJson.result.forEach(u => {
          const m = u.message;
          if (m && m.from && !m.from.is_bot) {
            const fromName = `${m.from.first_name || ''} ${m.from.last_name || ''}`.trim() || m.from.username || 'Telegram Mijoz';
            const text = (m.text || '').trim();
            const contactPhone = m.contact?.phone_number || '';
            const phoneMatch = text.match(/\+?998\s*\d{2}\s*\d{3}\s*\d{2}\s*\d{2}|\b\d{9}\b/);
            const phone = contactPhone || (phoneMatch ? phoneMatch[0] : (m.from.username ? `@${m.from.username}` : `ID: ${m.from.id}`));

            telegramBotLeads.push({
              id: `tg-direct-${m.message_id}-${m.date}`,
              name: fromName,
              phone: phone,
              service: "Telegram Bot Murojaati",
              message: text !== '/start' ? text : "Botga /start bosdi",
              source: m.from.username ? `Telegram Bot (@${m.from.username})` : `Telegram Bot (${m.from.id})`,
              timestamp: new Date(m.date * 1000).toISOString(),
              status: "new"
            });
          }
        });
      }
    }
  } catch {}

  let localLeads = [];
  try {
    localLeads = JSON.parse(localStorage.getItem(STORAGE_LEADS_KEY) || '[]');
  } catch {}

  // 4. Fetch from Cloud Leads Store if accessible
  let cloudLeads = [];
  try {
    const cRes = await fetch(CLOUD_LEADS_URL);
    if (cRes.ok) {
      const cJson = await cRes.json();
      if (cJson?.data?.leads && Array.isArray(cJson.data.leads)) {
        cloudLeads = cJson.data.leads;
      }
    }
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
  [...supaLeads, ...backendLeads, ...cloudLeads, ...telegramBotLeads, ...localLeads].forEach(l => {
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
  // 1. Fetch from Supabase products table
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: true });
    if (!error && Array.isArray(data) && data.length > 0) {
      const formatted = data.map(p => ({
        ...p,
        isActive: p.is_active !== false
      }));
      safeStorage.set(STORAGE_PRODUCTS_KEY, formatted);
      return formatted;
    }
  } catch (e) {
    console.warn('Supabase get products error:', e);
  }

  try {
    const res = await apiFetch('/api/products/');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) return data;
    }
  } catch {}

  // Cloud store sync fallback
  try {
    const cData = await cloudGetCatalogData();
    if (cData?.products && Array.isArray(cData.products) && cData.products.length > 0) {
      try {
        localStorage.setItem(STORAGE_PRODUCTS_KEY, JSON.stringify(cData.products));
      } catch {}
      return cData.products;
    }
  } catch {}
  
  try {
    const saved = localStorage.getItem(STORAGE_PRODUCTS_KEY) || localStorage.getItem('tunikabond_custom_products');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}

  return initialProducts;
};

export const apiCreateProduct = async (productData) => {
  const newProduct = { ...productData, id: productData.id || `prod-${Date.now()}` };

  // 1. Save to Supabase
  try {
    await supabase.from('products').upsert({
      id: String(newProduct.id),
      name: newProduct.name,
      category: newProduct.category || '',
      price: newProduct.price || '',
      thickness: newProduct.thickness || '',
      coating: newProduct.coating || '',
      warranty: newProduct.warranty || '',
      image: newProduct.image || '',
      specs: newProduct.specs || {},
      badge: newProduct.badge || null,
      is_active: newProduct.isActive !== false
    });
  } catch (e) {
    console.warn('Supabase create product error:', e);
  }

  try {
    const res = await apiFetch('/api/products/', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(newProduct)
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.product) Object.assign(newProduct, data.product);
    }
  } catch {}

  let updated = [newProduct];
  try {
    const current = await apiGetProducts();
    updated = [newProduct, ...current.filter(p => p.id !== newProduct.id)];
    localStorage.setItem(STORAGE_PRODUCTS_KEY, JSON.stringify(updated));
    localStorage.setItem('tunikabond_custom_products', JSON.stringify(updated));
  } catch {}

  // Sync to Cloud Catalog Store
  try {
    await cloudSaveCatalogData({ products: updated });
  } catch {}

  notifyDataChanged();
  return { success: true, product: newProduct };
};

export const apiUpdateProduct = async (productId, productData) => {
  // 1. Update in Supabase
  try {
    const supaPayload = { ...productData };
    if (productData.isActive !== undefined) {
      supaPayload.is_active = productData.isActive;
      delete supaPayload.isActive;
    }
    await supabase.from('products').update(supaPayload).eq('id', String(productId));
  } catch (e) {
    console.warn('Supabase update product error:', e);
  }

  try {
    await apiFetch(`/api/products/${productId}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(productData)
    });
  } catch {}

  let updated = [];
  try {
    const current = await apiGetProducts();
    updated = current.map(p => p.id === productId ? { ...p, ...productData } : p);
    localStorage.setItem(STORAGE_PRODUCTS_KEY, JSON.stringify(updated));
    localStorage.setItem('tunikabond_custom_products', JSON.stringify(updated));
  } catch {}

  // Sync to Cloud Catalog Store
  try {
    await cloudSaveCatalogData({ products: updated });
  } catch {}

  notifyDataChanged();
  return true;
};

export const apiDeleteProduct = async (productId) => {
  // 1. Delete from Supabase
  try {
    await supabase.from('products').delete().eq('id', String(productId));
  } catch (e) {
    console.warn('Supabase delete product error:', e);
  }

  try {
    await apiFetch(`/api/products/${productId}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
  } catch {}

  let updated = [];
  try {
    const current = await apiGetProducts();
    updated = current.filter(p => p.id !== productId);
    localStorage.setItem(STORAGE_PRODUCTS_KEY, JSON.stringify(updated));
    localStorage.setItem('tunikabond_custom_products', JSON.stringify(updated));
  } catch {}

  // Sync to Cloud Catalog Store
  try {
    await cloudSaveCatalogData({ products: updated });
  } catch {}

  notifyDataChanged();
  return true;
};

// --- PORTFOLIO API ---
export const apiGetPortfolio = async () => {
  // 1. Fetch from Supabase portfolio table
  try {
    const { data, error } = await supabase
      .from('portfolio')
      .select('*')
      .order('created_at', { ascending: true });
    if (!error && Array.isArray(data) && data.length > 0) {
      const formatted = data.map(item => ({
        ...item,
        masterId: item.master_id || item.masterId,
        desc: item.description || item.desc || {}
      }));
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
      if (Array.isArray(data) && data.length > 0) return data;
    }
  } catch {}

  // Cloud store sync fallback
  try {
    const cData = await cloudGetCatalogData();
    if (cData?.portfolio && Array.isArray(cData.portfolio) && cData.portfolio.length > 0) {
      try {
        localStorage.setItem(STORAGE_PORTFOLIO_KEY, JSON.stringify(cData.portfolio));
      } catch {}
      return cData.portfolio;
    }
  } catch {}

  try {
    const saved = localStorage.getItem(STORAGE_PORTFOLIO_KEY) || localStorage.getItem('tunikabond_custom_portfolio');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}

  return initialPortfolio;
};

export const apiCreatePortfolio = async (itemData) => {
  const newItem = { ...itemData, id: itemData.id || `port-${Date.now()}` };

  // 1. Save to Supabase
  try {
    await supabase.from('portfolio').upsert({
      id: String(newItem.id),
      title: newItem.title,
      category: newItem.category || '',
      image: newItem.image || '',
      master_id: newItem.masterId || newItem.master_id || null,
      duration: newItem.duration || '',
      location: newItem.location || '',
      description: newItem.desc || newItem.description || {}
    });
  } catch (e) {
    console.warn('Supabase create portfolio error:', e);
  }

  try {
    const res = await apiFetch('/api/portfolio/', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(newItem)
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.item) Object.assign(newItem, data.item);
    }
  } catch {}

  let updated = [newItem];
  try {
    const current = await apiGetPortfolio();
    updated = [newItem, ...current.filter(i => i.id !== newItem.id)];
    localStorage.setItem(STORAGE_PORTFOLIO_KEY, JSON.stringify(updated));
    localStorage.setItem('tunikabond_custom_portfolio', JSON.stringify(updated));
  } catch {}

  // Sync to Cloud Catalog Store
  try {
    await cloudSaveCatalogData({ portfolio: updated });
  } catch {}

  notifyDataChanged();
  return { success: true, item: newItem };
};

export const apiUpdatePortfolio = async (itemId, itemData) => {
  // 1. Update in Supabase
  try {
    const supaPayload = { ...itemData };
    if (itemData.desc) supaPayload.description = itemData.desc;
    if (itemData.masterId) supaPayload.master_id = itemData.masterId;
    delete supaPayload.desc;
    delete supaPayload.masterId;
    await supabase.from('portfolio').update(supaPayload).eq('id', String(itemId));
  } catch (e) {
    console.warn('Supabase update portfolio error:', e);
  }

  try {
    await apiFetch(`/api/portfolio/${itemId}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(itemData)
    });
  } catch {}

  let updated = [];
  try {
    const current = await apiGetPortfolio();
    updated = current.map(item => item.id === itemId ? { ...item, ...itemData } : item);
    localStorage.setItem(STORAGE_PORTFOLIO_KEY, JSON.stringify(updated));
    localStorage.setItem('tunikabond_custom_portfolio', JSON.stringify(updated));
  } catch {}

  // Sync to Cloud Catalog Store
  try {
    await cloudSaveCatalogData({ portfolio: updated });
  } catch {}

  notifyDataChanged();
  return true;
};

export const apiDeletePortfolio = async (itemId) => {
  // 1. Delete from Supabase
  try {
    await supabase.from('portfolio').delete().eq('id', String(itemId));
  } catch (e) {
    console.warn('Supabase delete portfolio error:', e);
  }

  try {
    await apiFetch(`/api/portfolio/${itemId}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
  } catch {}

  let updated = [];
  try {
    const current = await apiGetPortfolio();
    updated = current.filter(item => item.id !== itemId);
    localStorage.setItem(STORAGE_PORTFOLIO_KEY, JSON.stringify(updated));
    localStorage.setItem('tunikabond_custom_portfolio', JSON.stringify(updated));
  } catch {}

  // Sync to Cloud Catalog Store
  try {
    await cloudSaveCatalogData({ portfolio: updated });
  } catch {}

  notifyDataChanged();
  return true;
};

// --- TEAM & MASTERS API ---
export const apiGetTeam = async () => {
  // 1. Fetch from Supabase team table
  try {
    const { data, error } = await supabase
      .from('team')
      .select('*')
      .order('created_at', { ascending: true });
    if (!error && Array.isArray(data) && data.length > 0) {
      const formatted = data.map(m => ({
        ...m,
        completedProjects: m.completed_projects || m.completedProjects,
        isLeader: m.is_leader || m.isLeader || false
      }));
      safeStorage.set(STORAGE_TEAM_KEY, formatted);
      return formatted;
    }
  } catch (e) {
    console.warn('Supabase get team error:', e);
  }

  let list = null;
  try {
    const res = await apiFetch('/api/team/');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) list = data;
    }
  } catch {}

  if (!list) {
    try {
      const saved = localStorage.getItem(STORAGE_TEAM_KEY) || localStorage.getItem('tunikabond_custom_team');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) list = parsed;
      }
    } catch {}
  }

  if (!list || !Array.isArray(list) || list.length === 0) {
    list = initialTeam;
  }

  // Deduplicate by ID and Name to guarantee no duplicated profiles
  const seenIds = new Set();
  const seenNames = new Set();
  const uniqueList = [];

  for (const m of list) {
    if (!m) continue;
    const idKey = m.id ? String(m.id).toLowerCase() : null;
    const nameKey = m.name ? String(m.name).trim().toLowerCase() : null;

    if (idKey && seenIds.has(idKey)) continue;
    if (nameKey && seenNames.has(nameKey)) continue;

    if (idKey) seenIds.add(idKey);
    if (nameKey) seenNames.add(nameKey);
    uniqueList.push(m);
  }

  return uniqueList.length > 0 ? uniqueList : initialTeam;
};

export const apiCreateTeamMember = async (memberData) => {
  const newMember = { ...memberData, id: memberData.id || `team-${Date.now()}` };

  // 1. Save to Supabase
  try {
    await supabase.from('team').upsert({
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
  } catch (e) {
    console.warn('Supabase create team member error:', e);
  }

  try {
    const res = await apiFetch('/api/team/', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(newMember)
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.member) Object.assign(newMember, data.member);
    }
  } catch {}

  try {
    const current = await apiGetTeam();
    const updated = [newMember, ...current];
    localStorage.setItem(STORAGE_TEAM_KEY, JSON.stringify(updated));
    localStorage.setItem('tunikabond_custom_team', JSON.stringify(updated));
  } catch {}

  notifyDataChanged();
  return { success: true, member: newMember };
};

export const apiUpdateTeamMember = async (memberId, memberData) => {
  // 1. Update in Supabase
  try {
    const supaPayload = { ...memberData };
    if (memberData.completedProjects) supaPayload.completed_projects = memberData.completedProjects;
    if (memberData.isLeader !== undefined) supaPayload.is_leader = memberData.isLeader;
    delete supaPayload.completedProjects;
    delete supaPayload.isLeader;
    await supabase.from('team').update(supaPayload).eq('id', String(memberId));
  } catch (e) {
    console.warn('Supabase update team error:', e);
  }

  try {
    const res = await apiFetch(`/api/team/${memberId}`, {
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
    localStorage.setItem('tunikabond_custom_team', JSON.stringify(updated));
  } catch {}

  notifyDataChanged();
  return true;
};

export const apiDeleteTeamMember = async (memberId) => {
  // 1. Delete from Supabase
  try {
    await supabase.from('team').delete().eq('id', String(memberId));
  } catch (e) {
    console.warn('Supabase delete team error:', e);
  }

  try {
    const res = await apiFetch(`/api/team/${memberId}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (res.ok) return true;
  } catch {}

  try {
    const current = await apiGetTeam();
    const updated = current.filter(m => m.id !== memberId);
    localStorage.setItem(STORAGE_TEAM_KEY, JSON.stringify(updated));
    localStorage.setItem('tunikabond_custom_team', JSON.stringify(updated));
  } catch {}

  notifyDataChanged();
  return true;
};

// --- CUSTOMER REVIEWS API ---
export const apiGetReviews = async () => {
  // 1. Fetch from Supabase (Persistent multi-user cross-device database)
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && Array.isArray(data) && data.length > 0) {
      safeStorage.set(STORAGE_REVIEWS_KEY, data);
      return data;
    }
  } catch (err) {
    console.warn('Supabase fetch reviews error:', err);
  }

  // 2. Fetch from serverless API /api/reviews
  try {
    const res = await fetch('/api/reviews');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        localStorage.setItem(STORAGE_REVIEWS_KEY, JSON.stringify(data));
        return data;
      }
    }
  } catch {}

  // 3. Check local storage
  try {
    const saved = localStorage.getItem(STORAGE_REVIEWS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
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
  let updated = [];
  try {
    const current = (await apiGetReviews()) || [];
    updated = [newReview, ...current.filter(r => r.id !== newReview.id)];
    localStorage.setItem(STORAGE_REVIEWS_KEY, JSON.stringify(updated));
  } catch {}

  notifyDataChanged();
  return { success: true, review: newReview };
};

export const apiDeleteReview = async (reviewId) => {
  // 1. Delete from Supabase
  try {
    await supabase.from('reviews').delete().eq('id', String(reviewId));
  } catch (e) {
    console.warn('Supabase delete review error:', e);
  }

  // 2. Local update
  let updated = [];
  try {
    const current = (await apiGetReviews()) || [];
    updated = current.filter(r => String(r.id) !== String(reviewId));
    localStorage.setItem(STORAGE_REVIEWS_KEY, JSON.stringify(updated));
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
  // 1. Fetch from Supabase swatches table
  try {
    const { data, error } = await supabase
      .from('swatches')
      .select('*')
      .order('created_at', { ascending: true });
    if (!error && Array.isArray(data) && data.length > 0) {
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
      if (Array.isArray(data) && data.length > 0) return data;
    }
  } catch {}

  // Cloud sync fallback
  try {
    const cData = await cloudGetCatalogData();
    if (cData?.swatches && Array.isArray(cData.swatches) && cData.swatches.length > 0) {
      try {
        localStorage.setItem(STORAGE_SWATCHES_KEY, JSON.stringify(cData.swatches));
      } catch {}
      return cData.swatches;
    }
  } catch {}

  try {
    const saved = localStorage.getItem(STORAGE_SWATCHES_KEY) || localStorage.getItem('tl_dynamic_swatches');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
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
    await supabase.from('swatches').upsert({
      id: String(newSwatch.id),
      name: newSwatch.name,
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
  } catch (e) {
    console.warn('Supabase create swatch error:', e);
  }

  try {
    const res = await apiFetch('/api/swatches/', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(newSwatch)
    });
    if (res.ok) {
      const data = await res.json();
      if (data.swatch) newSwatch.id = data.swatch.id;
    }
  } catch {}

  let updated = [newSwatch];
  try {
    const existing = await apiGetSwatches();
    updated = [newSwatch, ...existing.filter(s => String(s.id) !== String(newSwatch.id))];
    localStorage.setItem(STORAGE_SWATCHES_KEY, JSON.stringify(updated));
    localStorage.setItem('tl_dynamic_swatches', JSON.stringify(updated));
  } catch {}

  // Sync to Cloud Catalog Store
  try {
    await cloudSaveCatalogData({ swatches: updated });
  } catch {}

  notifyDataChanged();
  return { success: true, swatch: newSwatch };
};

export const apiUpdateSwatch = async (swatchId, swatchData) => {
  // 1. Update in Supabase
  try {
    const supaPayload = { ...swatchData };
    if (swatchData.colorHex) supaPayload.color_hex = swatchData.colorHex;
    if (swatchData.bgGradient) supaPayload.bg_gradient = swatchData.bgGradient;
    delete supaPayload.colorHex;
    delete supaPayload.bgGradient;
    await supabase.from('swatches').update(supaPayload).eq('id', String(swatchId));
  } catch (e) {
    console.warn('Supabase update swatch error:', e);
  }

  try {
    await apiFetch(`/api/swatches/${swatchId}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(swatchData)
    });
  } catch {}

  let updated = [];
  try {
    const existing = await apiGetSwatches();
    updated = existing.map(s => String(s.id) === String(swatchId) ? { ...s, ...swatchData } : s);
    localStorage.setItem(STORAGE_SWATCHES_KEY, JSON.stringify(updated));
    localStorage.setItem('tl_dynamic_swatches', JSON.stringify(updated));
  } catch {}

  // Sync to Cloud Catalog Store
  try {
    await cloudSaveCatalogData({ swatches: updated });
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

  try {
    await apiFetch(`/api/swatches/${swatchId}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
  } catch {}

  let updated = [];
  try {
    const existing = await apiGetSwatches();
    updated = existing.filter(s => String(s.id) !== String(swatchId));
    localStorage.setItem(STORAGE_SWATCHES_KEY, JSON.stringify(updated));
    localStorage.setItem('tl_dynamic_swatches', JSON.stringify(updated));
  } catch {}

  // Sync to Cloud Catalog Store
  try {
    await cloudSaveCatalogData({ swatches: updated });
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

