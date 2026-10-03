import React, { useState, useEffect } from 'react';
import { 
  apiGetStats, apiGetLeads, apiUpdateLead, apiDeleteLead,
  apiGetProducts, apiCreateProduct, apiUpdateProduct, apiDeleteProduct,
  apiGetPortfolio, apiCreatePortfolio, apiUpdatePortfolio, apiDeletePortfolio,
  apiGetTeam, apiCreateTeamMember, apiUpdateTeamMember, apiDeleteTeamMember,
  apiGetAdmins, apiRegister, apiDeleteAdmin, apiUploadFile,
  apiGetSwatches, apiCreateSwatch, apiUpdateSwatch, apiDeleteSwatch,
  apiExportAllData, apiImportData
} from '../../services/api';
import {
  getTelegramConfig,
  saveTelegramConfig,
  testTelegramRecipient,
  DEFAULT_TELEGRAM_CONFIG
} from '../../services/telegram';
import { 
  LayoutDashboard, Inbox, Package, Briefcase, Users, LogOut, 
  Plus, Trash2, Edit3, CheckCircle2, Clock, Phone, Send, X, 
  ExternalLink, Search, RefreshCw, Shield, AlertCircle,
  Upload, Download, FileText, Image as ImageIcon, Hammer, UserCheck,
  Palette, Bot, MessageSquare, Check, Save, Radio,
  ShieldCheck, Layers, Eye, Filter, TrendingUp, Sparkles
} from 'lucide-react';

export const AdminDashboard = ({ 
  currentUser, 
  onLogout, 
  onClose, 
  onDataChanged, 
  isStandaloneApp = false,
  swatchesList: propSwatchesList
}) => {
  const [activeTab, setActiveTab] = useState('overview'); // overview | leads | products | portfolio | team | swatches | telegram | admins
  const [stats, setStats] = useState(null);
  const [leads, setLeads] = useState([]);
  const [leadSearch, setLeadSearch] = useState('');
  const [leadStatusFilter, setLeadStatusFilter] = useState('all');
  const [productsList, setProductsList] = useState([]);
  const [portfolioList, setPortfolioList] = useState([]);
  const [teamList, setTeamList] = useState([]);
  const [swatchesList, setSwatchesList] = useState(propSwatchesList || []);
  const [adminsList, setAdminsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Swatch CRUD state
  const [swatchModalOpen, setSwatchModalOpen] = useState(false);
  const [editingSwatch, setEditingSwatch] = useState(null);
  const [swatchCategoryFilter, setSwatchCategoryFilter] = useState('all');
  const [swatchForm, setSwatchForm] = useState({
    nameUz: '',
    nameRu: '',
    category: 'wood',
    code: '',
    colorHex: '#A05A2C',
    bgGradient: '',
    image: '',
    texture: "Yog'och teksturasi (Bo'rtma)",
    finish: 'Mat / Strukturaviy',
    coating: 'PVDF 3-qavat',
    application: "Hovli uylari, karnizlar, darvoza atrofi"
  });

  // Modals for CRUD
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    nameUz: '',
    category: 'tunikabond',
    thickness: '0.45 mm',
    coating: 'PVDF polimer',
    warranty: '10 yil',
    badge: 'Yangi',
    priceRange: "150,000 so'm / m²",
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
    descUz: ''
  });

  const [portfolioModalOpen, setPortfolioModalOpen] = useState(false);
  const [editingPortfolio, setEditingPortfolio] = useState(null);
  const [portfolioForm, setPortfolioForm] = useState({
    titleUz: '',
    category: 'residential',
    location: 'Toshkent shahri',
    material: 'Tunikabond 0.45mm',
    area: '250 m²',
    time: '10 ish kuni',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1000&q=80'
  });

  const [teamModalOpen, setTeamModalOpen] = useState(false);
  const [editingTeamMember, setEditingTeamMember] = useState(null);
  const [teamForm, setTeamForm] = useState({
    name: '',
    role: 'Usta Mutaxassis',
    label: 'Usta',
    experience: '6+ yil tajriba',
    completedProjects: '300+ obyekt',
    phone: '+998 99 533-33-03',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
    bio: "Tunikabond Lider korxonasining rasmiy ustasi. 10 yillik kafolat bilan sifatli montaj.",
    specialties: ['naves']
  });

  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [adminForm, setAdminForm] = useState({
    username: '',
    fullName: '',
    password: '',
    role: 'Admin'
  });

  const [adminProductCat, setAdminProductCat] = useState('all');
  const [adminPortfolioCat, setAdminPortfolioCat] = useState('all');

  // Load all initial data
  const loadData = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const [st, ld, pr, pf, ad, tm, swt] = await Promise.all([
        apiGetStats(),
        apiGetLeads(),
        apiGetProducts(),
        apiGetPortfolio(),
        apiGetAdmins(),
        apiGetTeam(),
        apiGetSwatches()
      ]);
      setStats(st);
      setLeads(ld);
      setProductsList(pr);
      setPortfolioList(pf);
      setAdminsList(ad);
      setTeamList(tm);
      if (swt && Array.isArray(swt)) {
        setSwatchesList(swt);
      }
      setTelegramConfig(getTelegramConfig());
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  const notifyChange = () => {
    if (onDataChanged) onDataChanged();
    loadData(true);
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => {
      loadData(true);
    };
    window.addEventListener('tunikabond_data_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    // Auto-poll cloud every 10 seconds for real-time lead reception from external visitors
    const interval = setInterval(() => {
      loadData(true);
    }, 10000);

    return () => {
      clearInterval(interval);
      window.removeEventListener('tunikabond_data_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  useEffect(() => {
    if (propSwatchesList && Array.isArray(propSwatchesList) && propSwatchesList.length > 0) {
      setSwatchesList(propSwatchesList);
    }
  }, [propSwatchesList]);

  // Telegram Bot Settings state
  const [telegramConfig, setTelegramConfig] = useState(() => getTelegramConfig());
  const [telegramSaving, setTelegramSaving] = useState(false);
  const [telegramSuccess, setTelegramSuccess] = useState(false);
  const [telegramTesting, setTelegramTesting] = useState(false);
  const [testResults, setTestResults] = useState({});
  const [newRecipientModalOpen, setNewRecipientModalOpen] = useState(false);
  const [newRecipientForm, setNewRecipientForm] = useState({
    id: '',
    label: '',
    type: 'user'
  });

  // --- TELEGRAM ACTIONS ---
  const handleSaveTelegram = (e) => {
    if (e) e.preventDefault();
    setTelegramSaving(true);
    const ok = saveTelegramConfig(telegramConfig);
    setTelegramSaving(false);
    if (ok) {
      setTelegramSuccess(true);
      setTimeout(() => setTelegramSuccess(false), 3000);
    }
  };

  const handleTestAllTelegram = async () => {
    setTelegramTesting(true);
    const results = {};
    for (const r of telegramConfig.recipients) {
      if (!r.enabled) continue;
      const res = await testTelegramRecipient(telegramConfig.botToken, r.id);
      results[r.id] = res;
    }
    setTestResults(results);
    setTelegramTesting(false);
  };

  const handleTestSingleTelegram = async (chatId) => {
    setTestResults(prev => ({ ...prev, [chatId]: { loading: true } }));
    const res = await testTelegramRecipient(telegramConfig.botToken, chatId);
    setTestResults(prev => ({ ...prev, [chatId]: res }));
  };

  const handleToggleRecipient = (index) => {
    const nextRecipients = [...telegramConfig.recipients];
    nextRecipients[index] = {
      ...nextRecipients[index],
      enabled: !nextRecipients[index].enabled
    };
    const updated = { ...telegramConfig, recipients: nextRecipients };
    setTelegramConfig(updated);
    saveTelegramConfig(updated);
  };

  const handleDeleteRecipient = (index) => {
    if (window.confirm("Ushbu qabul qiluvchini o'chirmoqchimisiz?")) {
      const nextRecipients = telegramConfig.recipients.filter((_, i) => i !== index);
      const updated = { ...telegramConfig, recipients: nextRecipients };
      setTelegramConfig(updated);
      saveTelegramConfig(updated);
    }
  };

  const handleAddRecipient = (e) => {
    e.preventDefault();
    if (!newRecipientForm.id.trim()) {
      alert("Iltimos, Chat ID yoki Foydalanuvchi ID raqamini kiriting");
      return;
    }
    const updated = {
      ...telegramConfig,
      recipients: [
        ...telegramConfig.recipients,
        {
          id: newRecipientForm.id.trim(),
          label: newRecipientForm.label.trim() || `Qabul qiluvchi (${newRecipientForm.id.trim()})`,
          type: newRecipientForm.type || 'user',
          enabled: true
        }
      ]
    };
    setTelegramConfig(updated);
    saveTelegramConfig(updated);
    setNewRecipientForm({ id: '', label: '', type: 'user' });
    setNewRecipientModalOpen(false);
  };

  // --- LEADS ACTIONS ---
  const handleLeadStatusChange = async (leadId, newStatus) => {
    await apiUpdateLead(leadId, { status: newStatus });
    setLeads(leads.map(l => String(l.id) === String(leadId) ? { ...l, status: newStatus } : l));
    if (onDataChanged) onDataChanged();
  };

  const handleDeleteLead = async (leadId) => {
    if (window.confirm("Haqiqatan ham ushbu arizani o'chirmoqchimisiz?")) {
      await apiDeleteLead(leadId);
      setLeads(leads.filter(l => String(l.id) !== String(leadId)));
      if (onDataChanged) onDataChanged();
    }
  };

  const handleExportCsv = () => {
    if (!leads.length) {
      alert("Yuklab olish uchun arizalar mavjud emas");
      return;
    }
    const headers = ["ID", "Vaqti", "Mijoz", "Telefon", "Xizmat", "Holati", "Xabar"];
    const rows = leads.map(l => [
      l.id,
      l.timestamp ? new Date(l.timestamp).toLocaleString('uz-UZ') : '',
      `"${(l.name || '').replace(/"/g, '""')}"`,
      `"${l.phone || ''}"`,
      `"${(l.service || '').replace(/"/g, '""')}"`,
      l.status === 'in_progress' ? 'Jarayonda' : l.status === 'completed' ? 'Bajarildi' : l.status === 'cancelled' ? 'Bekor qilindi' : 'Yangi',
      `"${(l.message || '').replace(/"/g, '""')}"`
    ]);
    const csvContent = "\uFEFF" + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `tunikabond_arizalar_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // --- PRODUCTS CRUD ---
  const handleOpenProductCreate = () => {
    setEditingProduct(null);
    setProductForm({
      nameUz: '',
      category: 'tunikabond',
      thickness: '0.45 mm',
      coating: 'PVDF polimer',
      warranty: '10 yil',
      badge: 'Yangi',
      priceRange: "150,000 so'm / m²",
      image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
      descUz: ''
    });
    setProductModalOpen(true);
  };

  const handleOpenProductEdit = (prod) => {
    setEditingProduct(prod);
    setProductForm({
      nameUz: prod.name?.uz || prod.name || '',
      category: prod.category || 'tunikabond',
      thickness: prod.thickness || '',
      coating: prod.coating || '',
      warranty: prod.warranty || '',
      badge: prod.badge || '',
      priceRange: prod.priceRange || '',
      image: prod.image || '',
      descUz: prod.shortDesc?.uz || prod.shortDesc || ''
    });
    setProductModalOpen(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    const productPayload = {
      name: { uz: productForm.nameUz, ru: productForm.nameUz, en: productForm.nameUz },
      shortDesc: { uz: productForm.descUz, ru: productForm.descUz, en: productForm.descUz },
      category: productForm.category,
      thickness: productForm.thickness,
      coating: productForm.coating,
      warranty: productForm.warranty,
      badge: productForm.badge,
      priceRange: productForm.priceRange,
      image: productForm.image,
      specs: {
        uz: [
          { label: "Qalinlik", value: productForm.thickness },
          { label: "Qoplama", value: productForm.coating },
          { label: "Kafolat", value: productForm.warranty }
        ]
      }
    };

    if (editingProduct) {
      await apiUpdateProduct(editingProduct.id, productPayload);
      setProductsList(productsList.map(p => p.id === editingProduct.id ? { ...p, ...productPayload } : p));
    } else {
      const res = await apiCreateProduct(productPayload);
      if (res.product) {
        setProductsList([...productsList, res.product]);
      }
    }
    setProductModalOpen(false);
    notifyChange();
  };

  const handleDeleteProduct = async (prodId) => {
    if (window.confirm("Ushbu mahsulotni o'chirmoqchimisiz?")) {
      await apiDeleteProduct(prodId);
      setProductsList(productsList.filter(p => p.id !== prodId));
      notifyChange();
    }
  };

  // --- PORTFOLIO CRUD ---
  const handleOpenPortfolioCreate = () => {
    setEditingPortfolio(null);
    setPortfolioForm({
      titleUz: '',
      category: 'naves',
      masterId: '',
      masterName: '',
      masterPhoto: '',
      masterRole: '',
      location: 'Toshkent shahri',
      material: 'Tunikabond 0.45mm',
      area: '140 m²',
      time: '5 ish kuni',
      image: 'https://images.unsplash.com/photo-1541888946425-d0fbb1861563?auto=format&fit=crop&w=1000&q=80'
    });
    setPortfolioModalOpen(true);
  };

  const handleOpenPortfolioEdit = (item) => {
    setEditingPortfolio(item);
    setPortfolioForm({
      titleUz: item.title?.uz || item.title || '',
      category: item.category || 'naves',
      masterId: item.masterId || '',
      masterName: item.masterName || '',
      masterPhoto: item.masterPhoto || '',
      masterRole: item.masterRole || '',
      location: item.location || '',
      material: item.material || '',
      area: item.area || '',
      time: item.time || '',
      image: item.image || ''
    });
    setPortfolioModalOpen(true);
  };

  const handleSavePortfolio = async (e) => {
    e.preventDefault();
    const portfolioPayload = {
      title: { uz: portfolioForm.titleUz, ru: portfolioForm.titleUz, en: portfolioForm.titleUz },
      category: portfolioForm.category,
      masterId: portfolioForm.masterId || '',
      masterName: portfolioForm.masterName || '',
      masterPhoto: portfolioForm.masterPhoto || '',
      masterRole: portfolioForm.masterRole || '',
      location: portfolioForm.location,
      material: portfolioForm.material,
      area: portfolioForm.area,
      time: portfolioForm.time,
      image: portfolioForm.image
    };

    if (editingPortfolio) {
      await apiUpdatePortfolio(editingPortfolio.id, portfolioPayload);
      setPortfolioList(portfolioList.map(p => p.id === editingPortfolio.id ? { ...p, ...portfolioPayload } : p));
    } else {
      const res = await apiCreatePortfolio(portfolioPayload);
      if (res.item) {
        setPortfolioList([...portfolioList, res.item]);
      }
    }
    setPortfolioModalOpen(false);
    notifyChange();
  };

  const handleDeletePortfolio = async (itemId) => {
    if (window.confirm("Ushbu loyihani o'chirmoqchimisiz?")) {
      await apiDeletePortfolio(itemId);
      setPortfolioList(portfolioList.filter(p => p.id !== itemId));
      notifyChange();
    }
  };

  // --- TEAM & MASTERS CRUD ---
  const handleOpenTeamCreate = () => {
    setEditingTeamMember(null);
    setTeamForm({
      name: '',
      role: 'Usta Mutaxassis',
      label: 'Usta',
      experience: '6+ yil tajriba',
      completedProjects: '300+ obyekt',
      phone: '+998 99 533-33-03',
      photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
      bio: "Tunikabond Lider korxonasining rasmiy ustasi. 10 yillik kafolat bilan sifatli montaj.",
      specialties: ['naves']
    });
    setTeamModalOpen(true);
  };

  const handleOpenTeamEdit = (member) => {
    setEditingTeamMember(member);
    setTeamForm({
      name: member.name || '',
      role: member.role || '',
      label: member.label || 'Usta',
      experience: member.experience || '',
      completedProjects: member.completedProjects || '',
      phone: member.phone || '',
      photo: member.photo || '',
      bio: member.bio || '',
      specialties: member.specialties || ['naves']
    });
    setTeamModalOpen(true);
  };

  const handleSaveTeamMember = async (e) => {
    e.preventDefault();
    if (!teamForm.name) {
      alert("Iltimos, usta ismini kiriting");
      return;
    }

    const payload = {
      ...teamForm,
      works: editingTeamMember?.works || [
        {
          id: `w-${Date.now()}-1`,
          title: `${teamForm.label} — Namuna Loyihasi`,
          category: teamForm.label.includes('Naves') ? 'Naves' : teamForm.label.includes('Darvoza') ? 'Darvozaxona' : teamForm.label.includes('Kozir') ? 'Koziryok' : 'Fasad',
          image: teamForm.photo || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
          location: 'Toshkent shahri',
          desc: 'Yuqori sifatli materiallar va 10 yillik kafolat bilan topshirilgan obyekt.'
        }
      ]
    };

    if (editingTeamMember) {
      await apiUpdateTeamMember(editingTeamMember.id, payload);
      setTeamList(teamList.map(m => m.id === editingTeamMember.id ? { ...m, ...payload } : m));
    } else {
      const res = await apiCreateTeamMember(payload);
      if (res.member) {
        setTeamList([...teamList, res.member]);
      }
    }
    setTeamModalOpen(false);
    notifyChange();
  };

  const handleDeleteTeamMember = async (memberId) => {
    if (window.confirm("Haqiqatan ham ushbu ustani o'chirmoqchimisiz?")) {
      await apiDeleteTeamMember(memberId);
      setTeamList(teamList.filter(m => m.id !== memberId));
      notifyChange();
    }
  };

  // --- ADMIN REGISTRATION ---
  const handleRegisterAdmin = async (e) => {
    e.preventDefault();
    const res = await apiRegister(adminForm.username, adminForm.password, adminForm.fullName, adminForm.role);
    if (res.success) {
      setAdminsList([...adminsList, res.user]);
      setAdminModalOpen(false);
      setAdminForm({ username: '', fullName: '', password: '', role: 'Admin' });
      notifyChange();
      alert("Yangi admin muvaffaqiyatli qo'shildi!");
    } else {
      alert(res.error || "Xatolik yuz berdi");
    }
  };

  const handleDeleteAdmin = async (adminId) => {
    if (window.confirm("Haqiqatan ham ushbu adminni tizimdan o'chirmoqchimisiz?")) {
      const res = await apiDeleteAdmin(adminId);
      if (res.success) {
        setAdminsList(adminsList.filter(a => String(a.id) !== String(adminId) && a.username !== adminId));
        notifyChange();
      } else {
        alert(res.error || "Adminni o'chirishda xatolik yuz berdi");
      }
    }
  };

  // --- SWATCHES (RANGLAR) ACTIONS ---
  const handleOpenSwatchCreate = () => {
    setEditingSwatch(null);
    setSwatchForm({
      nameUz: '',
      nameRu: '',
      category: 'wood',
      code: 'WOOD-801',
      colorHex: '#A05A2C',
      bgGradient: 'linear-gradient(135deg, #b06a3b 0%, #7d3f18 100%)',
      image: '',
      texture: "Yog'och teksturasi (Bo'rtma)",
      finish: 'Mat / Strukturaviy',
      coating: 'PVDF 3-qavat',
      application: "Hovli uylari, karnizlar, darvoza atrofi"
    });
    setSwatchModalOpen(true);
  };

  const handleOpenSwatchEdit = (swatch) => {
    setEditingSwatch(swatch);
    const nameUz = typeof swatch.name === 'object' ? (swatch.name.uz || swatch.name.ru || '') : (swatch.name || '');
    const nameRu = typeof swatch.name === 'object' ? (swatch.name.ru || '') : '';
    setSwatchForm({
      nameUz: nameUz,
      nameRu: nameRu,
      category: swatch.category || 'wood',
      code: swatch.code || '',
      colorHex: swatch.colorHex || '#A05A2C',
      bgGradient: swatch.bgGradient || '',
      image: swatch.image || '',
      texture: swatch.texture || '',
      finish: swatch.finish || 'Mat',
      coating: swatch.coating || 'PVDF 3-qavat',
      application: swatch.application || ''
    });
    setSwatchModalOpen(true);
  };

  const handleSaveSwatch = async (e) => {
    e.preventDefault();
    if (!swatchForm.nameUz) {
      alert("Iltimos, rang yoki tekstura nomini kiriting");
      return;
    }
    if (!swatchForm.code) {
      alert("Iltimos, rang kodini (masalan: WOOD-801 yoki RAL 7016) kiriting");
      return;
    }

    let finalGradient = swatchForm.bgGradient;
    if (!finalGradient && swatchForm.colorHex) {
      finalGradient = `linear-gradient(135deg, ${swatchForm.colorHex} 0%, #1e1e1e 100%)`;
    }

    const payload = {
      category: swatchForm.category,
      name: {
        uz: swatchForm.nameUz,
        ru: swatchForm.nameRu || swatchForm.nameUz,
        en: swatchForm.nameUz
      },
      code: swatchForm.code,
      colorHex: swatchForm.colorHex,
      bgGradient: finalGradient,
      image: swatchForm.image,
      texture: swatchForm.texture,
      finish: swatchForm.finish,
      coating: swatchForm.coating,
      application: swatchForm.application
    };

    if (editingSwatch) {
      await apiUpdateSwatch(editingSwatch.id, payload);
      setSwatchesList(swatchesList.map(s => s.id === editingSwatch.id ? { ...s, ...payload } : s));
    } else {
      const res = await apiCreateSwatch(payload);
      if (res.swatch) {
        setSwatchesList([res.swatch, ...swatchesList]);
      }
    }
    setSwatchModalOpen(false);
    notifyChange();
  };

  const handleDeleteSwatch = async (swatchId) => {
    if (window.confirm("Haqiqatan ham ushbu rang namunasini o'chirmoqchimisiz?")) {
      await apiDeleteSwatch(swatchId);
      setSwatchesList(swatchesList.filter(s => s.id !== swatchId));
      notifyChange();
    }
  };

  return (
    <div className="dark fixed inset-0 z-50 bg-brand-dark/95 backdrop-blur-xl flex flex-col overflow-hidden text-slate-100 animate-fadeIn">
      
      {/* Top Navbar */}
      <div className="bg-brand-surface border-b border-white/10 px-3 sm:px-6 py-2.5 sm:py-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-brand-red to-brand-redHover flex items-center justify-center shadow-glow-red text-white font-black text-sm sm:text-xl shrink-0">
            TL
          </div>
          <div className="min-w-0">
            <h1 className="font-display font-black text-sm sm:text-xl text-white flex items-center gap-1.5 sm:gap-2 truncate">
              <span className="truncate hidden sm:inline">Tunikabond Lider Boshqaruv Paneli</span>
              <span className="truncate sm:hidden">TL Admin Paneli</span>
              <span className="text-[9px] sm:text-[10px] bg-brand-red text-white px-1.5 sm:px-2 py-0.5 rounded-full font-bold uppercase tracking-wider shrink-0">
                v2.0
              </span>
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-400 truncate">
              Admin: <strong className="text-white">{currentUser?.fullName || currentUser?.username}</strong>
              <span className="hidden sm:inline"> ({currentUser?.role || 'Admin'})</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          <button
            onClick={loadData}
            className="p-1.5 sm:p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
            title="Yangilash"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {isStandaloneApp ? (
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Saytni ochish</span>
            </a>
          ) : (
            <button
              onClick={onClose}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Saytga qaytish</span>
            </button>
          )}

          <button
            onClick={onLogout}
            className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-brand-red/20 hover:bg-brand-red text-brand-red hover:text-white text-xs font-bold transition-all border border-brand-red/40"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Chiqish</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Sidebar Tabs (Hidden on mobile screens, shown on tablets & desktop) */}
        <aside className="hidden md:flex w-64 bg-brand-surface/70 border-r border-white/10 p-4 flex-col justify-between flex-shrink-0">
          <nav className="space-y-1.5">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'overview' 
                  ? 'bg-brand-red text-white shadow-glow-red' 
                  : 'text-slate-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <LayoutDashboard className="w-4 h-4" />
                <span>Umumiy Ko'rinish</span>
              </div>
              <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-slate-300">Asosiy</span>
            </button>

            <button
              onClick={() => setActiveTab('leads')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'leads' 
                  ? 'bg-brand-red text-white shadow-glow-red' 
                  : 'text-slate-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Inbox className="w-4 h-4" />
                <span>Arizalar & Buyurtmalar</span>
              </div>
              {leads.filter(l => l.status === 'new' || !l.status).length > 0 && (
                <span className="w-5 h-5 rounded-full bg-white text-brand-red text-[11px] font-black flex items-center justify-center">
                  {leads.filter(l => l.status === 'new' || !l.status).length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('products')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'products' 
                  ? 'bg-brand-red text-white shadow-glow-red' 
                  : 'text-slate-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Package className="w-4 h-4" />
                <span>Mahsulotlar</span>
              </div>
              <span className="text-xs text-slate-400">{productsList.length}</span>
            </button>

            <button
              onClick={() => setActiveTab('portfolio')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'portfolio' 
                  ? 'bg-brand-red text-white shadow-glow-red' 
                  : 'text-slate-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Briefcase className="w-4 h-4" />
                <span>Portfolio / Obyektlar</span>
              </div>
              <span className="text-xs text-slate-400">{portfolioList.length}</span>
            </button>

            <button
              onClick={() => setActiveTab('team')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'team' 
                  ? 'bg-brand-red text-white shadow-glow-red' 
                  : 'text-slate-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Hammer className="w-4 h-4" />
                <span>Jamoa & Ustalar</span>
              </div>
              <span className="text-xs text-slate-400">{teamList.length}</span>
            </button>

            <button
              onClick={() => setActiveTab('swatches')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'swatches' 
                  ? 'bg-brand-red text-white shadow-glow-red' 
                  : 'text-slate-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Palette className="w-4 h-4" />
                <span>Ranglar & Teksturalar</span>
              </div>
              <span className="text-xs text-slate-400">{swatchesList.length}</span>
            </button>

            <button
              onClick={() => setActiveTab('telegram')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'telegram' 
                  ? 'bg-brand-red text-white shadow-glow-red' 
                  : 'text-slate-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Send className="w-4 h-4 text-sky-400" />
                <span>Telegram Bot & Arizalar</span>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </button>

            <button
              onClick={() => setActiveTab('admins')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'admins' 
                  ? 'bg-brand-red text-white shadow-glow-red' 
                  : 'text-slate-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Users className="w-4 h-4" />
                <span>Adminlar ro'yxati</span>
              </div>
              <span className="text-xs text-slate-400">{adminsList.length}</span>
            </button>
          </nav>

          <button
            onClick={() => setActiveTab('telegram')}
            className="p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-300 text-left transition-colors group cursor-pointer block w-full"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Send className="w-3.5 h-3.5 text-sky-400" />
                Telegram Bot
              </span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-1.5 py-0.5 rounded">Faol</span>
            </div>
            <p className="text-[11px] text-slate-400 group-hover:text-slate-200">
              Kanal va shaxsiy akkaunt sozlamalari &rarr;
            </p>
          </button>
        </aside>

        {/* Content Area */}
        <main className="flex-1 p-3 sm:p-6 overflow-y-auto bg-brand-dark/50 pb-28 md:pb-6">
          
          {/* TAB 0: OVERVIEW (Umumiy Ko'rinish / Statistika) */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Welcome & Banner */}
              <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 relative overflow-hidden bg-gradient-to-br from-brand-surface/90 via-brand-surface/60 to-brand-dark/90">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-brand-red/20 text-brand-red border border-brand-red/30 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" /> Tunikabond Lider Admin v2.0
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        Tizim faol
                      </span>
                    </div>
                    <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-white">
                      Xush kelibsiz, {currentUser?.fullName || currentUser?.username}!
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-300 mt-1">
                      Sayt faoliyati, yangi arizalar, mahsulotlar va telegram botingiz monitoringi.
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5 flex-wrap">
                    <button
                      type="button"
                      onClick={() => loadData(false)}
                      className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs sm:text-sm font-bold flex items-center gap-2 border border-white/15 transition-all cursor-pointer"
                    >
                      <RefreshCw className={`w-4 h-4 text-sky-400 ${loading ? 'animate-spin' : ''}`} />
                      <span>Yangilash</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('leads')}
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-red to-brand-redHover hover:scale-105 active:scale-95 text-white text-xs sm:text-sm font-bold shadow-glow-red flex items-center gap-2 transition-all cursor-pointer"
                    >
                      <Inbox className="w-4 h-4 text-white" />
                      <span>Arizalarni ko'rish</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* KPI Stat Cards Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
                {/* 1. Leads */}
                <div 
                  onClick={() => setActiveTab('leads')}
                  className="glass-card p-4 rounded-2xl border border-white/10 hover:border-brand-red/50 cursor-pointer transition-all hover:scale-[1.02] flex flex-col justify-between group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-9 h-9 rounded-xl bg-brand-red/20 text-brand-red flex items-center justify-center font-bold">
                      <Inbox className="w-4 h-4" />
                    </div>
                    {leads.filter(l => l.status === 'new' || !l.status).length > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-brand-red text-white animate-pulse">
                        +{leads.filter(l => l.status === 'new' || !l.status).length} yangi
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="font-display font-black text-2xl text-white">{leads.length}</div>
                    <div className="text-xs text-slate-400 group-hover:text-white transition-colors">Arizalar</div>
                  </div>
                </div>

                {/* 2. Products */}
                <div 
                  onClick={() => setActiveTab('products')}
                  className="glass-card p-4 rounded-2xl border border-white/10 hover:border-brand-red/50 cursor-pointer transition-all hover:scale-[1.02] flex flex-col justify-between group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold">
                      <Package className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <div className="font-display font-black text-2xl text-white">{productsList.length}</div>
                    <div className="text-xs text-slate-400 group-hover:text-white transition-colors">Mahsulotlar</div>
                  </div>
                </div>

                {/* 3. Portfolio */}
                <div 
                  onClick={() => setActiveTab('portfolio')}
                  className="glass-card p-4 rounded-2xl border border-white/10 hover:border-brand-red/50 cursor-pointer transition-all hover:scale-[1.02] flex flex-col justify-between group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
                      <Briefcase className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <div className="font-display font-black text-2xl text-white">{portfolioList.length}</div>
                    <div className="text-xs text-slate-400 group-hover:text-white transition-colors">Obyektlar</div>
                  </div>
                </div>

                {/* 4. Team */}
                <div 
                  onClick={() => setActiveTab('team')}
                  className="glass-card p-4 rounded-2xl border border-white/10 hover:border-brand-red/50 cursor-pointer transition-all hover:scale-[1.02] flex flex-col justify-between group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                      <Hammer className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <div className="font-display font-black text-2xl text-white">{teamList.length}</div>
                    <div className="text-xs text-slate-400 group-hover:text-white transition-colors">Ustalar</div>
                  </div>
                </div>

                {/* 5. Swatches */}
                <div 
                  onClick={() => setActiveTab('swatches')}
                  className="glass-card p-4 rounded-2xl border border-white/10 hover:border-brand-red/50 cursor-pointer transition-all hover:scale-[1.02] flex flex-col justify-between group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                      <Palette className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <div className="font-display font-black text-2xl text-white">{swatchesList.length}</div>
                    <div className="text-xs text-slate-400 group-hover:text-white transition-colors">Ranglar</div>
                  </div>
                </div>

                {/* 6. Telegram Channel */}
                <div 
                  onClick={() => setActiveTab('telegram')}
                  className="glass-card p-4 rounded-2xl border border-white/10 hover:border-sky-500/50 cursor-pointer transition-all hover:scale-[1.02] flex flex-col justify-between group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold">
                      <Send className="w-4 h-4" />
                    </div>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  </div>
                  <div>
                    <div className="font-display font-black text-lg text-emerald-400">Faol</div>
                    <div className="text-xs text-slate-400 group-hover:text-white transition-colors">Telegram Bot</div>
                  </div>
                </div>
              </div>

              {/* Quick Actions Shortcuts */}
              <div className="glass-panel p-5 rounded-2xl border border-white/10">
                <h3 className="font-bold text-white text-sm mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-brand-red" />
                  <span>Tezkor Amallar</span>
                </h3>
                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={handleOpenProductCreate}
                    className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-brand-red" />
                    <span>Yangi Mahsulot</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleOpenPortfolioCreate}
                    className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-brand-red" />
                    <span>Yangi Obyekt</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleOpenTeamCreate}
                    className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-brand-red" />
                    <span>Yangi Usta</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleOpenSwatchCreate}
                    className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-brand-red" />
                    <span>Yangi Rang</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleExportCsv}
                    className="px-3.5 py-2 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Excel (.csv)</span>
                  </button>
                </div>
              </div>

              {/* Recent Leads Preview */}
              <div className="glass-panel p-5 sm:p-6 rounded-2xl border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-white text-base flex items-center gap-2">
                      <Inbox className="w-5 h-5 text-brand-red" />
                      <span>So'nggi Kelib Tushgan Arizalar</span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      Eng so'nggi murojaat qilgan mijozlar ro'yxati
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('leads')}
                    className="text-xs text-brand-red hover:underline font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <span>Barchasini ko'rish ({leads.length})</span>
                    <span>&rarr;</span>
                  </button>
                </div>

                {leads.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 text-xs">
                    Hozircha arizalar mavjud emas.
                  </div>
                ) : (
                  <div className="divide-y divide-white/10">
                    {leads.slice(0, 5).map((lead) => (
                      <div key={lead.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-white text-sm">
                              {lead.name || "Noma'lum mijoz"}
                            </span>
                            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                              lead.status === 'in_progress' ? 'bg-amber-500 text-black' :
                              lead.status === 'completed' ? 'bg-emerald-500 text-white' :
                              lead.status === 'cancelled' ? 'bg-slate-600 text-white' :
                              'bg-brand-red text-white'
                            }`}>
                              {lead.status === 'in_progress' ? 'Jarayonda' :
                               lead.status === 'completed' ? 'Bajarildi' :
                               lead.status === 'cancelled' ? 'Bekor qilindi' : 'Yangi'}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-slate-300">
                            <span>📞 {lead.phone}</span>
                            <span>🛠 {lead.service}</span>
                            <span className="text-slate-400">⏰ {lead.timestamp ? (lead.timestamp.includes('T') ? new Date(lead.timestamp).toLocaleDateString('uz-UZ') : lead.timestamp) : ''}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {lead.phone && !lead.phone.startsWith('@') && (
                            <a
                              href={`tel:${lead.phone.replace(/[^\d+]/g, '')}`}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600/30 text-emerald-400 text-xs font-bold hover:bg-emerald-600 hover:text-white transition-colors"
                            >
                              Tel
                            </a>
                          )}
                          <button
                            type="button"
                            onClick={() => setActiveTab('leads')}
                            className="px-2.5 py-1 rounded-lg bg-white/10 text-slate-200 text-xs font-bold hover:bg-white/20 transition-colors cursor-pointer"
                          >
                            Batafsil
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 1: LEADS (Arizalar) */}
          {activeTab === 'leads' && (() => {
            const displayedLeads = leads.filter(l => {
              const status = l.status || 'new';
              if (leadStatusFilter !== 'all' && status !== leadStatusFilter) return false;
              if (leadSearch.trim()) {
                const q = leadSearch.toLowerCase().trim();
                const n = (l.name || '').toLowerCase();
                const p = (l.phone || '').toLowerCase();
                const srv = (l.service || '').toLowerCase();
                const m = (l.message || '').toLowerCase();
                const src = (l.source || '').toLowerCase();
                return n.includes(q) || p.includes(q) || srv.includes(q) || m.includes(q) || src.includes(q);
              }
              return true;
            });

            const newCount = leads.filter(l => l.status === 'new' || !l.status).length;
            const inProgressCount = leads.filter(l => l.status === 'in_progress').length;
            const completedCount = leads.filter(l => l.status === 'completed').length;
            const cancelledCount = leads.filter(l => l.status === 'cancelled').length;

            return (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="font-display font-extrabold text-2xl text-white">
                      Kelib tushgan arizalar ({leads.length})
                    </h2>
                    <p className="text-xs text-slate-400">
                      Mijozlar qoldirgan aloqa raqamlari va hisob-kitoblar
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="text-xs text-slate-300">
                      Yangi arizalar: <strong className="text-brand-red font-bold">{newCount} ta</strong>
                    </span>

                    <button
                      type="button"
                      onClick={() => loadData(false)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 hover:text-white border border-sky-500/30 text-xs font-bold shadow-sm transition-all cursor-pointer"
                      title="Telegram va bulutdan arizalarni qayta yuklash"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                      <span>Telegramdan Yangilash</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleExportCsv}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
                      title="Barcha arizalarni Excel formatida yuklab olish"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Excel (.csv)</span>
                    </button>
                  </div>
                </div>

                {/* Search Bar & Status Filter Pills */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  {/* Status Pills */}
                  <div className="flex flex-wrap items-center gap-2">
                    {[
                      { id: 'all', label: 'Barchasi', count: leads.length },
                      { id: 'new', label: 'Yangi', count: newCount },
                      { id: 'in_progress', label: 'Jarayonda', count: inProgressCount },
                      { id: 'completed', label: 'Bajarildi', count: completedCount },
                      { id: 'cancelled', label: 'Bekor qilindi', count: cancelledCount }
                    ].map((tab) => {
                      const isActive = leadStatusFilter === tab.id;
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setLeadStatusFilter(tab.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                            isActive
                              ? 'bg-brand-red text-white shadow-glow-red font-black'
                              : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
                          }`}
                        >
                          <span>{tab.label}</span>
                          <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${isActive ? 'bg-white/20' : 'bg-white/10'}`}>
                            {tab.count}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Search Input */}
                  <div className="relative min-w-[240px] sm:w-72">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={leadSearch}
                      onChange={(e) => setLeadSearch(e.target.value)}
                      placeholder="Mijoz ismi, tel yoki xizmat..."
                      className="w-full pl-9 pr-8 py-2 rounded-xl bg-brand-surface border border-white/15 text-white text-xs focus:outline-none focus:border-brand-red transition-colors"
                    />
                    {leadSearch && (
                      <button
                        type="button"
                        onClick={() => setLeadSearch('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-0.5 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {displayedLeads.length === 0 ? (
                  <div className="p-12 text-center rounded-3xl glass-card border border-white/10">
                    <Inbox className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-300 text-sm font-semibold mb-1">
                      {leads.length === 0 ? "Hozircha arizalar mavjud emas" : "Qidiruv yoki tanlangan holat bo'yicha ariza topilmadi"}
                    </p>
                    {leadSearch && (
                      <button
                        type="button"
                        onClick={() => { setLeadSearch(''); setLeadStatusFilter('all'); }}
                        className="mt-2 text-xs text-brand-red hover:underline font-bold cursor-pointer"
                      >
                        Filtrlarni tozalash
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {displayedLeads.map((lead) => (
                      <div 
                        key={lead.id} 
                        className={`glass-panel p-5 rounded-2xl border transition-all ${
                          (lead.status === 'new' || !lead.status) 
                            ? 'border-brand-red/50 shadow-glow-red bg-brand-red/5' 
                            : 'border-white/10'
                        }`}
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                          
                          {/* Customer Info */}
                          <div className="space-y-1">
                            <div className="flex items-center gap-2.5 flex-wrap">
                              <span className="font-display font-bold text-lg text-white">
                                {lead.name || "Noma'lum mijoz"}
                              </span>
                              
                              <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                                lead.status === 'in_progress' 
                                  ? 'bg-amber-500 text-black' 
                                  : lead.status === 'completed' 
                                  ? 'bg-emerald-500 text-white' 
                                  : lead.status === 'cancelled'
                                  ? 'bg-slate-600 text-white'
                                  : 'bg-brand-red text-white'
                              }`}>
                                {lead.status === 'in_progress' 
                                  ? 'Jarayonda' 
                                  : lead.status === 'completed' 
                                  ? 'Bajarildi' 
                                  : lead.status === 'cancelled' 
                                  ? 'Bekor qilindi' 
                                  : 'Yangi'}
                              </span>

                              {lead.source && (
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                                  lead.source.includes('Telegram')
                                    ? 'bg-sky-500/20 text-sky-400 border-sky-500/30'
                                    : 'bg-white/10 text-slate-300 border-white/10'
                                }`}>
                                  <Send className="w-2.5 h-2.5" />
                                  <span>{lead.source}</span>
                                </span>
                              )}
                            </div>

                            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-1">
                              <span className="font-bold text-white flex items-center gap-1">
                                <span>📞</span>
                                <span>{lead.phone}</span>
                              </span>
                              <span>🛠 {lead.service}</span>
                              <span className="text-slate-400">⏰ {lead.timestamp ? (lead.timestamp.includes('T') ? new Date(lead.timestamp).toLocaleString('uz-UZ') : lead.timestamp) : ''}</span>
                            </div>

                            {lead.calcData && (
                              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-200 mt-2">
                                <strong>Kalkulyator:</strong> {lead.calcData.buildingType} | Maydon: {lead.calcData.area} m² | Narx: <span className="text-brand-red font-bold">{lead.calcData.cost}</span>
                              </div>
                            )}

                            {lead.message && (
                              <p className="text-xs text-slate-300 italic pt-1">
                                💬 "{lead.message}"
                              </p>
                            )}

                            {lead.photoUrl && (
                              <div className="pt-2 flex items-center gap-2">
                                <span className="text-[11px] text-slate-400">Biriktirilgan rasm:</span>
                                <a
                                  href={lead.photoUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-brand-red/20 text-brand-red font-bold text-xs border border-brand-red/30 transition-colors"
                                >
                                  <ImageIcon className="w-3.5 h-3.5" />
                                  <span>Rasmni ko'rish</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              </div>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2 flex-wrap">
                            
                            {/* Direct Phone Dial */}
                            {lead.phone && !lead.phone.startsWith('@') && (
                              <a
                                href={`tel:${lead.phone.replace(/[^\d+]/g, '')}`}
                                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                                title="Telefon qilish"
                              >
                                <Phone className="w-3.5 h-3.5" />
                                <span>Qo'ng'iroq</span>
                              </a>
                            )}

                            {/* Telegram Direct Chat */}
                            <a
                              href={
                                lead.phone && lead.phone.startsWith('@')
                                  ? `https://t.me/${lead.phone.replace('@', '')}`
                                  : `https://t.me/+${(lead.phone || '').replace(/\D/g, '')}`
                              }
                              target="_blank"
                              rel="noreferrer"
                              className="px-3 py-1.5 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 hover:text-white border border-sky-500/30 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                              title="Telegram orqali yozish"
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>Telegram</span>
                            </a>

                            {/* Status Dropdown */}
                            <select
                              value={lead.status || 'new'}
                              onChange={(e) => handleLeadStatusChange(lead.id, e.target.value)}
                              className="px-3 py-1.5 rounded-xl bg-brand-surface border border-white/20 text-xs font-semibold text-white focus:outline-none focus:border-brand-red cursor-pointer"
                            >
                              <option value="new">Yangi</option>
                              <option value="in_progress">Jarayonda</option>
                              <option value="completed">Bajarildi</option>
                              <option value="cancelled">Bekor qilindi</option>
                            </select>

                            {/* Delete Lead */}
                            <button
                              onClick={() => handleDeleteLead(lead.id)}
                              className="p-2 rounded-xl bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
                              title="O'chirish"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>

                          </div>

                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })()}

          {/* TAB 2: PRODUCTS CRUD */}
          {activeTab === 'products' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-display font-extrabold text-2xl text-white">
                    Mahsulotlar Katalogi ({productsList.length})
                  </h2>
                  <p className="text-xs text-slate-400">
                    Saytdagi mahsulotlarni tahrirlash, yangi qo'shish yoki toifalar bo'yicha saralash
                  </p>
                </div>

                <button
                  onClick={handleOpenProductCreate}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-red to-brand-redHover text-white text-xs sm:text-sm font-bold shadow-glow-red flex items-center gap-2 hover:scale-105 active:scale-95 transition-all self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Yangi mahsulot qo'shish</span>
                </button>
              </div>

              {/* Category Pills Filter */}
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { id: 'all', label: 'Barchasi' },
                  { id: 'tunikabond', label: 'Tunikabond' },
                  { id: 'alyukabond', label: 'Alyukabond' },
                  { id: 'cornice', label: 'Karnizlar' },
                  { id: 'roofing', label: 'Profnastil & Tom' }
                ].map((t) => {
                  const getProdCat = (p) => {
                    const c = String(p?.category || '').toLowerCase().trim();
                    if (c.includes('tunikabond') || c.includes('tunika')) return 'tunikabond';
                    if (c.includes('alyukabond') || c.includes('alyuka') || c.includes('alukabond') || c.includes('alucobond')) return 'alyukabond';
                    if (c.includes('cornice') || c.includes('karniz')) return 'cornice';
                    if (c.includes('roofing') || c.includes('profnastil') || c.includes('tom')) return 'roofing';
                    return c || 'tunikabond';
                  };
                  const count = t.id === 'all'
                    ? productsList.length
                    : productsList.filter(p => getProdCat(p) === t.id).length;
                  const isActive = adminProductCat === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setAdminProductCat(t.id)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                        isActive
                          ? 'bg-brand-red text-white shadow-glow-red font-black'
                          : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
                      }`}
                    >
                      <span>{t.label}</span>
                      <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${isActive ? 'bg-white/20' : 'bg-white/10'}`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {(() => {
                const filteredProducts = productsList.filter((prod) => {
                  if (adminProductCat === 'all') return true;
                  const c = String(prod?.category || '').toLowerCase().trim();
                  if (adminProductCat === 'tunikabond') return c.includes('tunikabond') || c.includes('tunika');
                  if (adminProductCat === 'alyukabond') return c.includes('alyukabond') || c.includes('alyuka') || c.includes('alukabond') || c.includes('alucobond');
                  if (adminProductCat === 'cornice') return c.includes('cornice') || c.includes('karniz');
                  if (adminProductCat === 'roofing') return c.includes('roofing') || c.includes('profnastil') || c.includes('tom');
                  return c === adminProductCat;
                });

                if (filteredProducts.length === 0) {
                  return (
                    <div className="p-12 text-center rounded-3xl glass-card border border-white/10">
                      <Package className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                      <p className="text-slate-400 text-sm">Ushbu toifada mahsulot topilmadi</p>
                    </div>
                  );
                }

                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProducts.map((prod) => (
                      <div key={prod.id} className="glass-card rounded-2xl p-4 flex flex-col justify-between border border-white/10 group hover:border-brand-red/40">
                        <div>
                          <div className="relative h-44 rounded-xl overflow-hidden mb-3 bg-brand-surface">
                            <img src={prod.image} alt="" className="w-full h-full object-cover" />
                            <span className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full bg-brand-red text-white text-[10px] font-black">
                              {prod.badge || prod.category}
                            </span>
                          </div>

                          <h3 className="font-display font-bold text-base text-white mb-1">
                            {prod.name?.uz || prod.name}
                          </h3>
                          <p className="text-xs text-slate-400 mb-3 line-clamp-2">
                            {prod.shortDesc?.uz || prod.shortDesc}
                          </p>

                          <div className="space-y-1 text-xs text-slate-300 border-t border-white/10 pt-2 mb-3">
                            <div className="flex justify-between">
                              <span className="text-slate-400">Qalinlik:</span>
                              <span className="font-semibold text-white">{prod.thickness}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Narx:</span>
                              <span className="font-bold text-brand-red">{prod.priceRange}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                          <button
                            onClick={() => handleOpenProductEdit(prod)}
                            className="flex-1 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Tahrirlash</span>
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(prod.id)}
                            className="p-2 rounded-xl bg-red-500/20 hover:bg-red-500 text-red-300 hover:text-white transition-colors cursor-pointer"
                            title="O'chirish"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          )}

          {/* TAB 3: PORTFOLIO CRUD */}
          {activeTab === 'portfolio' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-display font-extrabold text-2xl text-white">
                    Portfolio / Obyektlar ({portfolioList.length})
                  </h2>
                  <p className="text-xs text-slate-400">
                    Bajarilgan ishlar galereyasiga loyiha qo'shish va toifalar bo'yicha ko'rish
                  </p>
                </div>

                <button
                  onClick={handleOpenPortfolioCreate}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-red to-brand-redHover text-white text-xs sm:text-sm font-bold shadow-glow-red flex items-center gap-2 hover:scale-105 active:scale-95 transition-all self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Yangi loyiha qo'shish</span>
                </button>
              </div>

              {/* Portfolio Category Filter */}
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { id: 'all', label: 'Barchasi' },
                  { id: 'naves', label: 'Naveslar' },
                  { id: 'koziryok', label: 'Koziryoklar' },
                  { id: 'darvozaxona', label: 'Darvozaxonalar' },
                  { id: 'fasad', label: 'Fasadlar' },
                  { id: 'cornices', label: 'Karniz va Shift' }
                ].map((f) => {
                  const getPortCat = (item) => {
                    const c = String(item?.category || '').toLowerCase().trim();
                    if (c.includes('naves')) return 'naves';
                    if (c.includes('kozir')) return 'koziryok';
                    if (c.includes('darvoza')) return 'darvozaxona';
                    if (c.includes('fasad') || c.includes('tunikabond') || c.includes('alyukabond') || c.includes('residential') || c.includes('commercial')) return 'fasad';
                    if (c.includes('cornice') || c.includes('karniz') || c.includes('shift')) return 'cornices';
                    return c || 'naves';
                  };
                  const count = f.id === 'all'
                    ? portfolioList.length
                    : portfolioList.filter(item => getPortCat(item) === f.id).length;
                  const isActive = adminPortfolioCat === f.id;
                  return (
                    <button
                      key={f.id}
                      onClick={() => setAdminPortfolioCat(f.id)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                        isActive
                          ? 'bg-brand-red text-white shadow-glow-red font-black'
                          : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
                      }`}
                    >
                      <span>{f.label}</span>
                      <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${isActive ? 'bg-white/20' : 'bg-white/10'}`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {(() => {
                const filteredPortfolio = portfolioList.filter((item) => {
                  if (adminPortfolioCat === 'all') return true;
                  const c = String(item?.category || '').toLowerCase().trim();
                  if (adminPortfolioCat === 'naves') return c.includes('naves');
                  if (adminPortfolioCat === 'koziryok') return c.includes('kozir');
                  if (adminPortfolioCat === 'darvozaxona') return c.includes('darvoza');
                  if (adminPortfolioCat === 'fasad') return c.includes('fasad') || c.includes('tunikabond') || c.includes('alyukabond') || c.includes('residential') || c.includes('commercial');
                  if (adminPortfolioCat === 'cornices') return c.includes('cornice') || c.includes('karniz') || c.includes('shift');
                  return c === adminPortfolioCat;
                });

                if (filteredPortfolio.length === 0) {
                  return (
                    <div className="p-12 text-center rounded-3xl glass-card border border-white/10">
                      <Briefcase className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                      <p className="text-slate-400 text-sm">Ushbu toifada loyiha topilmadi</p>
                    </div>
                  );
                }

                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredPortfolio.map((item) => (
                      <div key={item.id} className="glass-card rounded-2xl p-4 flex flex-col justify-between border border-white/10">
                        <div>
                          <div className="relative h-44 rounded-xl overflow-hidden mb-3 bg-brand-surface">
                            <img src={item.image} alt="" className="w-full h-full object-cover" />
                            <span className="absolute top-2 left-2 px-2.5 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-white text-[10px] font-bold">
                              {item.location}
                            </span>
                          </div>

                          <h3 className="font-display font-bold text-base text-white mb-2 line-clamp-2">
                            {item.title?.uz || item.title}
                          </h3>

                          <div className="space-y-1 text-xs text-slate-300 mb-4">
                            <div>📁 Yo'nalish: <strong className="text-brand-red font-bold uppercase">{item.category}</strong></div>
                            <div>🛠 Material: {item.material}</div>
                            <div>📐 Hajmi: {item.area} | ⏱ Muddat: {item.time}</div>
                            <div className="flex items-center gap-1.5 pt-1 text-slate-200">
                              <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Mas'ul usta: <strong className="text-white">{item.masterName || "Biriktirilmagan"}</strong></span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                          <button
                            onClick={() => handleOpenPortfolioEdit(item)}
                            className="flex-1 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Tahrirlash</span>
                          </button>
                          <button
                            onClick={() => handleDeletePortfolio(item.id)}
                            className="p-2 rounded-xl bg-red-500/20 hover:bg-red-500 text-red-300 hover:text-white transition-colors cursor-pointer"
                            title="O'chirish"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          )}

          {/* TAB 4: TEAM & CRAFTSMEN */}
          {activeTab === 'team' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-display font-extrabold text-2xl text-white">
                    Jamoa va Ustalar ({teamList.length})
                  </h2>
                  <p className="text-xs text-slate-400">
                    Firma rahbariyati, naves, darvozaxona, koziryok va fasad ustalari
                  </p>
                </div>

                <button
                  onClick={handleOpenTeamCreate}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-red to-brand-redHover text-white text-xs sm:text-sm font-bold shadow-glow-red flex items-center gap-2 hover:scale-105 active:scale-95 transition-all self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Yangi usta qo'shish</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {teamList.map((member) => (
                  <div key={member.id} className="glass-card rounded-2xl p-4 flex flex-col justify-between border border-white/10 bg-brand-surface/70">
                    <div>
                      <div className="relative h-48 rounded-xl overflow-hidden mb-3 bg-brand-surface">
                        <img 
                          src={member.photo || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80"} 
                          alt="" 
                          className="w-full h-full object-cover object-top" 
                        />
                        <span className="absolute top-2 left-2 px-2.5 py-0.5 rounded-md bg-brand-red text-white text-[11px] font-black shadow-md">
                          {member.label || member.role}
                        </span>
                        <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md text-white text-[10px] font-bold">
                          {member.completedProjects || "300+ obyekt"}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 mb-1">
                        <h3 className="font-display font-bold text-base text-white">
                          {member.name}
                        </h3>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      </div>

                      <p className="text-xs font-semibold text-slate-300 mb-2">
                        {member.role}
                      </p>

                      <div className="space-y-1 text-xs text-slate-400 mb-4">
                        <div>🎖 Tajriba: <strong className="text-white">{member.experience}</strong></div>
                        <div>📞 Tel: <strong className="text-white">{member.phone || "+998 99 533-33-03"}</strong></div>
                        <div>🛠 Namunaviy ishlar: <strong className="text-brand-red">{member.works?.length || 0} ta</strong></div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                      <button
                        onClick={() => handleOpenTeamEdit(member)}
                        className="flex-1 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Tahrirlash</span>
                      </button>
                      <button
                        onClick={() => handleDeleteTeamMember(member.id)}
                        className="p-2 rounded-xl bg-red-500/20 hover:bg-red-500 text-red-300 hover:text-white transition-colors"
                        title="O'chirish"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: COLOR SWATCHES (RANGLAR VA TEKSTURALAR) */}
          {activeTab === 'swatches' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-display font-extrabold text-2xl text-white flex items-center gap-2.5">
                    <span>Ranglar & Teksturalar ({swatchesList.length})</span>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-brand-red/20 text-brand-red border border-brand-red/30">
                      Katalog
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    Saytdagi ranglar va teksturalar palitrasini boshqarish, yangi ranglar qo'shish yoki o'chirish
                  </p>
                </div>

                <button
                  onClick={handleOpenSwatchCreate}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-red to-brand-redHover text-white text-xs sm:text-sm font-bold shadow-glow-red flex items-center gap-2 hover:scale-105 active:scale-95 transition-all self-start sm:self-auto cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Yangi rang qo'shish</span>
                </button>
              </div>

              {/* Filter pills */}
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'all', label: "Barchasi" },
                  { id: 'wood', label: "Yog'och teksturali" },
                  { id: 'metallic', label: "Metallik" },
                  { id: 'ral', label: "RAL klassik" },
                  { id: 'special', label: "Maxsus / Xrom" }
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSwatchCategoryFilter(cat.id)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      swatchCategoryFilter === cat.id
                        ? 'bg-brand-red text-white shadow-glow-red'
                        : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
                    }`}
                  >
                    {cat.label} ({
                      cat.id === 'all' 
                        ? swatchesList.length 
                        : swatchesList.filter(s => s.category === cat.id).length
                    })
                  </button>
                ))}
              </div>

              {/* Swatches Grid */}
              {(() => {
                const filteredSwatches = swatchesList.filter(s => swatchCategoryFilter === 'all' || s.category === swatchCategoryFilter);

                if (filteredSwatches.length === 0) {
                  return (
                    <div className="p-12 text-center rounded-3xl glass-card border border-white/10">
                      <Palette className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                      <p className="text-slate-400 text-sm">Ushbu toifada rang namunasi topilmadi</p>
                    </div>
                  );
                }

                return (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                    {filteredSwatches.map((swatch) => {
                      const name = typeof swatch.name === 'object' ? (swatch.name.uz || swatch.name.ru || '') : (swatch.name || '');
                      return (
                        <div 
                          key={swatch.id} 
                          className="glass-card rounded-2xl p-4 flex flex-col justify-between border border-white/10 group hover:border-brand-red/40 bg-brand-surface/70 transition-all"
                        >
                          <div>
                            {/* Sample Box */}
                            <div 
                              className="relative h-36 rounded-xl overflow-hidden mb-3 border border-white/15 shadow-inner"
                              style={{
                                background: swatch.image 
                                  ? `url(${swatch.image}) center/cover no-repeat` 
                                  : (swatch.bgGradient || swatch.colorHex || '#444')
                              }}
                            >
                              <span className="absolute top-2 right-2 px-2.5 py-0.5 rounded-md bg-slate-900/85 backdrop-blur-md text-[10px] font-black text-white border border-white/20 shadow">
                                {swatch.code}
                              </span>
                              <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-brand-red/90 text-white text-[9px] font-bold uppercase tracking-wider">
                                {swatch.category === 'wood' ? "Yog'och" : swatch.category === 'metallic' ? "Metallik" : swatch.category === 'ral' ? "RAL" : "Maxsus"}
                              </span>
                            </div>

                            <h3 className="font-display font-bold text-sm sm:text-base text-white mb-1 group-hover:text-brand-red transition-colors">
                              {name}
                            </h3>
                            {typeof swatch.name === 'object' && swatch.name.ru && (
                              <p className="text-[11px] text-slate-400 mb-2 italic">
                                {swatch.name.ru}
                              </p>
                            )}
                            <p className="text-xs text-slate-300 font-medium mb-3">
                              {swatch.texture}
                            </p>

                            <div className="space-y-1.5 text-xs text-slate-300 border-t border-white/10 pt-2.5 mb-3">
                              <div className="flex justify-between">
                                <span className="text-slate-400">Yuzasi / Faktura:</span>
                                <span className="font-semibold text-white">{swatch.finish}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-400">Qoplama:</span>
                                <span className="font-semibold text-white">{swatch.coating}</span>
                              </div>
                              {swatch.application && (
                                <div className="pt-1 text-[11px] text-slate-400 line-clamp-2">
                                  <span className="text-slate-400 font-medium">Qo'llanishi: </span>
                                  {swatch.application}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 pt-2.5 border-t border-white/10">
                            <button
                              onClick={() => handleOpenSwatchEdit(swatch)}
                              className="flex-1 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>Tahrirlash</span>
                            </button>
                            <button
                              onClick={() => handleDeleteSwatch(swatch.id)}
                              className="p-2 rounded-xl bg-red-500/20 hover:bg-red-500 text-red-300 hover:text-white transition-colors cursor-pointer"
                              title="O'chirish"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          )}

          {/* TAB 5: ADMINS LIST & REGISTER */}
          {activeTab === 'admins' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display font-extrabold text-2xl text-white">
                    Tizim Adminlari ({adminsList.length})
                  </h2>
                  <p className="text-xs text-slate-400">
                    Sayt boshqaruviga ega bo'lgan foydalanuvchilar
                  </p>
                </div>

                <button
                  onClick={() => setAdminModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-red to-brand-redHover text-white text-xs sm:text-sm font-bold shadow-glow-red flex items-center gap-2 hover:scale-105 active:scale-95 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Yangi admin qo'shish</span>
                </button>
              </div>

              <div className="rounded-2xl border border-white/10 bg-brand-surface/70 overflow-hidden divide-y divide-white/10">
                {adminsList.map((a) => (
                  <div key={a.id} className="p-4 sm:px-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-brand-red/20 text-brand-red flex items-center justify-center font-bold">
                        <Shield className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-white text-sm sm:text-base flex items-center gap-2">
                          <span>{a.fullName || a.username}</span>
                          <span className="text-[10px] bg-white/10 text-brand-red px-2 py-0.5 rounded font-mono font-bold">
                            @{a.username}
                          </span>
                        </div>
                        <span className="text-xs text-slate-400">{a.role}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                        Faol
                      </span>
                      {a.username?.toLowerCase() !== 'muhammadazez' && 
                       a.username?.toLowerCase() !== 'admin' && 
                       a.username?.toLowerCase() !== (currentUser?.username || '').toLowerCase() && (
                        <button
                          type="button"
                          onClick={() => handleDeleteAdmin(a.id)}
                          className="p-1.5 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
                          title="Adminni o'chirish"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Data Backup & Restore */}
              <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-3">
                <div className="flex items-center gap-2.5">
                  <Download className="w-5 h-5 text-brand-red" />
                  <div>
                    <h3 className="font-bold text-white text-sm">Ma'lumotlar zaxirasi (Backup & Restore)</h3>
                    <p className="text-xs text-slate-400">
                      Saytdagi barcha arizalar, mahsulotlar, obyektlar, ustalar, ranglar va narxlarni JSON fayl qilib saqlang yoki boshqa telefonga o'tkazing.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={apiExportAllData}
                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold flex items-center gap-2 border border-white/10 transition-colors"
                  >
                    <Download className="w-4 h-4 text-emerald-400" />
                    <span>Zaxira nusxani yuklab olish (.json)</span>
                  </button>

                  <label className="cursor-pointer px-4 py-2 rounded-xl bg-brand-red/20 hover:bg-brand-red/30 border border-brand-red/40 text-xs font-bold text-white flex items-center gap-2 transition-colors">
                    <Upload className="w-4 h-4 text-brand-red" />
                    <span>Zaxiradan tiklash (Import)</span>
                    <input
                      type="file"
                      accept=".json"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          try {
                            const text = await file.text();
                            const res = await apiImportData(text);
                            if (res.success) {
                              notifyChange();
                              alert("Barcha ma'lumotlar muvaffaqiyatli tiklandi!");
                            } else {
                              alert("Xatolik: " + (res.error || "Fayl formati noto'g'ri"));
                            }
                          } catch (err) {
                            alert("Faylni o'qishda xatolik yuz berdi");
                          }
                          e.target.value = '';
                        }
                      }}
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB: TELEGRAM BOT & ARIZALAR */}
          {activeTab === 'telegram' && (
            <div className="space-y-6 animate-fadeIn max-w-5xl mx-auto">
              
              {/* Top Header Card */}
              <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 relative overflow-hidden bg-gradient-to-br from-brand-surface/90 via-brand-surface/60 to-brand-dark/90">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/20 shrink-0">
                      <Send className="w-7 h-7" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h2 className="text-xl sm:text-2xl font-bold text-white">Telegram Bot & Arizalar</h2>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                          Avtomatik tarqatish faol
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-300 mt-1">
                        Saytdan kelgan har bir yangi ariza darhol Telegram kanalga, botga va shaxsiy menejer akkauntiga yuboriladi.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 flex-wrap">
                    <button
                      type="button"
                      onClick={handleTestAllTelegram}
                      disabled={telegramTesting}
                      className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs sm:text-sm font-bold flex items-center gap-2 border border-white/15 transition-all active:scale-95 disabled:opacity-50"
                    >
                      <RefreshCw className={`w-4 h-4 text-sky-400 ${telegramTesting ? 'animate-spin' : ''}`} />
                      <span>{telegramTesting ? "Sinov xabari yuborilmoqda..." : "Barchasiga sinov xabari"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleSaveTelegram}
                      disabled={telegramSaving}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-red to-brand-redHover hover:scale-105 active:scale-95 text-white text-xs sm:text-sm font-bold shadow-glow-red flex items-center gap-2 transition-all"
                    >
                      {telegramSuccess ? <Check className="w-4 h-4 text-white" /> : <Save className="w-4 h-4 text-white" />}
                      <span>{telegramSuccess ? "Saqlandi!" : "Saqlash"}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Bot Info & Token Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Bot Profile Card */}
                <div className="glass-panel p-5 rounded-2xl border border-white/10 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Rasmiy Bot</span>
                      <span className="text-[10px] bg-sky-500/20 text-sky-400 px-2 py-0.5 rounded font-mono font-bold">@tunikabondlider_rasmiy_bot</span>
                    </div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold">
                        <Bot className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-white text-sm">Tunikabond Lider Bot</div>
                        <div className="text-xs text-slate-400">Telegram integratsiya boti</div>
                      </div>
                    </div>
                    <p className="text-xs text-slate-300">
                      Ushbu bot barcha arizalarni mijoz telefon raqami va ma'lumotlari bilan kanalga va akkauntingizga yetkazadi.
                    </p>
                  </div>

                  <a
                    href="https://t.me/tunikabondlider_rasmiy_bot"
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 w-full py-2 px-3 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 hover:text-white text-xs font-bold flex items-center justify-center gap-1.5 border border-sky-500/30 transition-colors"
                  >
                    <span>Botni Telegramda ochish</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                {/* Bot Token Configuration */}
                <div className="glass-panel p-5 rounded-2xl border border-white/10 md:col-span-2 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                        Telegram Bot Token (HTTP API)
                      </label>
                      <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Ulanish o'rnatilgan
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mb-3">
                      BotFather orqali olingan token. Odatda o'zgartirish talab etilmaydi.
                    </p>
                    <input
                      type="text"
                      value={telegramConfig.botToken || ''}
                      onChange={(e) => setTelegramConfig({ ...telegramConfig, botToken: e.target.value.trim() })}
                      placeholder="Masalan: 8697018482:AAFw..."
                      className="w-full px-4 py-2.5 rounded-xl bg-brand-dark/90 border border-white/15 text-white font-mono text-xs sm:text-sm focus:outline-none focus:border-brand-red transition-colors"
                    />
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <UserCheck className="w-4 h-4 text-emerald-400" />
                      Mas'ul admin: <strong className="text-white">@{telegramConfig.adminUsername || 'Mukhammad_azez'}</strong>
                    </span>
                    <span className="text-slate-500 font-mono text-[11px]">
                      Format: HTML (Xatosiz yetkazish kafolatlangan)
                    </span>
                  </div>
                </div>
              </div>

              {/* Recipients List Card */}
              <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-white text-base flex items-center gap-2">
                      <Radio className="w-5 h-5 text-brand-red" />
                      <span>Arizalar yetkaziladigan manzillar (Kanal va Shaxsiy Akkountlar)</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Saytdan kelgan har bir ariza bir vaqtning o'zida quyidagi faol joylarga parallel yuboriladi:
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setNewRecipientModalOpen(true)}
                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold flex items-center gap-1.5 border border-white/15 transition-colors self-start sm:self-auto"
                  >
                    <Plus className="w-4 h-4 text-brand-red" />
                    <span>Qabul qiluvchi qo'shish</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {telegramConfig.recipients.map((rec, idx) => {
                    const testStatus = testResults[rec.id];
                    return (
                      <div
                        key={rec.id + '-' + idx}
                        className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                          rec.enabled 
                            ? 'bg-brand-dark/70 border-white/15' 
                            : 'bg-white/5 border-white/5 opacity-60'
                        }`}
                      >
                        <div className="flex items-start sm:items-center gap-3.5">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                            rec.type === 'channel'
                              ? 'bg-sky-500/20 text-sky-400'
                              : rec.type === 'group'
                              ? 'bg-purple-500/20 text-purple-400'
                              : 'bg-emerald-500/20 text-emerald-400'
                          }`}>
                            {rec.type === 'channel' ? (
                              <Radio className="w-5 h-5" />
                            ) : rec.type === 'group' ? (
                              <Users className="w-5 h-5" />
                            ) : (
                              <UserCheck className="w-5 h-5" />
                            )}
                          </div>

                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-white text-sm">{rec.label}</span>
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-slate-300">
                                ID: {rec.id}
                              </span>
                              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-brand-red/20 text-brand-red border border-brand-red/30">
                                {rec.type === 'channel' ? "Kanal" : rec.type === 'group' ? "Guruh" : "Shaxsiy Akkount"}
                              </span>
                            </div>

                            {/* Test status notice */}
                            {testStatus && (
                              <div className="mt-1.5 text-xs">
                                {testStatus.loading ? (
                                  <span className="text-amber-300 flex items-center gap-1 font-semibold">
                                    <RefreshCw className="w-3 h-3 animate-spin" /> Sinov xabari yuborilmoqda...
                                  </span>
                                ) : testStatus.ok ? (
                                  <span className="text-emerald-400 flex items-center gap-1 font-bold">
                                    <CheckCircle2 className="w-3.5 h-3.5" /> Sinov xabari muvaffaqiyatli yetkazildi!
                                  </span>
                                ) : (
                                  <div className="text-amber-400 flex flex-col gap-0.5">
                                    <span className="flex items-center gap-1 font-semibold">
                                      <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                                      {testStatus.error?.includes("bot can't initiate conversation")
                                        ? "Foydalanuvchi botga hali Start bosmagan!"
                                        : `Telegram xatosi: ${testStatus.error}`}
                                    </span>
                                    {testStatus.error?.includes("bot can't initiate conversation") && (
                                      <a
                                        href="https://t.me/tunikabondlider_rasmiy_bot"
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-sky-400 underline font-bold text-[11px]"
                                      >
                                        Iltimos, @tunikabondlider_rasmiy_bot ga kirib bir marta Start bosing &rarr;
                                      </a>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center">
                          <button
                            type="button"
                            onClick={() => handleTestSingleTelegram(rec.id)}
                            className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors flex items-center gap-1"
                          >
                            <Send className="w-3 h-3 text-sky-400" />
                            <span>Sinash</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleToggleRecipient(idx)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                              rec.enabled
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'bg-slate-700/50 text-slate-400'
                            }`}
                          >
                            {rec.enabled ? 'Faol' : 'O\'chiq'}
                          </button>

                          {telegramConfig.recipients.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleDeleteRecipient(idx)}
                              className="p-1.5 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
                              title="O'chirish"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Quick Instructions & Help Card */}
              <div className="glass-panel p-6 rounded-3xl border border-white/10 bg-brand-surface/40 space-y-4">
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <span>Qanday qilib yangi shaxsiy akkaunt yoki guruh qo'shiladi?</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300">
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                    <div className="w-7 h-7 rounded-lg bg-brand-red/20 text-brand-red flex items-center justify-center font-bold">1</div>
                    <h4 className="font-bold text-white">Shaxsiy akkauntga ulash</h4>
                    <p className="text-slate-400">
                      Telegram qoidasiga ko'ra, bot shaxsga birinchi bo'lib yoza olmaydi. Shuning uchun menejer avval <a href="https://t.me/tunikabondlider_rasmiy_bot" target="_blank" rel="noreferrer" className="text-sky-400 underline font-bold">@tunikabondlider_rasmiy_bot</a> ga kirib <strong>Start</strong> tugmasini bosishi shart.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                    <div className="w-7 h-7 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold">2</div>
                    <h4 className="font-bold text-white">Chat ID ni aniqlash</h4>
                    <p className="text-slate-400">
                      O'zingizning Telegram raqamli ID raqamingizni bilish uchun Telegramda <a href="https://t.me/userinfobot" target="_blank" rel="noreferrer" className="text-sky-400 underline font-bold">@userinfobot</a> ga kirsangiz, u sizga raqamli IDingizni beradi (masalan: <code>6481310196</code>).
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">3</div>
                    <h4 className="font-bold text-white">Guruhga ulash</h4>
                    <p className="text-slate-400">
                      Telegramda yangi guruh ochib, unga <strong className="text-white">@tunikabondlider_rasmiy_bot</strong> ni va barcha ustalarni qo'shing. Botga admin bering va guruh ID sini (odatda -100 bilan boshlanadi) ro'yxatga qo'shing.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          )}

        </main>

        {/* Mobile Bottom Navigation Bar (Visible on mobile/tablet screens only) */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-brand-surface/95 backdrop-blur-xl border-t border-white/10 px-1 py-1.5 flex items-center justify-between shadow-2xl safe-area-bottom overflow-x-auto no-scrollbar gap-1">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 min-w-[42px] flex flex-col items-center gap-0.5 py-1 px-0.5 rounded-xl transition-all ${
              activeTab === 'overview' ? 'text-brand-red font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-[10px] truncate w-full text-center">Asosiy</span>
          </button>

          <button
            onClick={() => setActiveTab('leads')}
            className={`flex-1 min-w-[42px] flex flex-col items-center gap-0.5 py-1 px-0.5 rounded-xl transition-all relative ${
              activeTab === 'leads' ? 'text-brand-red font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <div className="relative">
              <Inbox className="w-5 h-5" />
              {leads.filter(l => l.status === 'new' || !l.status).length > 0 && (
                <span className="absolute -top-1.5 -right-2.5 w-4 h-4 rounded-full bg-brand-red text-white text-[9px] font-black flex items-center justify-center">
                  {leads.filter(l => l.status === 'new' || !l.status).length}
                </span>
              )}
            </div>
            <span className="text-[10px] truncate w-full text-center">Arizalar</span>
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`flex-1 min-w-[42px] flex flex-col items-center gap-0.5 py-1 px-0.5 rounded-xl transition-all ${
              activeTab === 'products' ? 'text-brand-red font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Package className="w-5 h-5" />
            <span className="text-[10px] truncate w-full text-center">Mahsulot</span>
          </button>

          <button
            onClick={() => setActiveTab('portfolio')}
            className={`flex-1 min-w-[42px] flex flex-col items-center gap-0.5 py-1 px-0.5 rounded-xl transition-all ${
              activeTab === 'portfolio' ? 'text-brand-red font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Briefcase className="w-5 h-5" />
            <span className="text-[10px] truncate w-full text-center">Obyekt</span>
          </button>

          <button
            onClick={() => setActiveTab('team')}
            className={`flex-1 min-w-[42px] flex flex-col items-center gap-0.5 py-1 px-0.5 rounded-xl transition-all ${
              activeTab === 'team' ? 'text-brand-red font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Hammer className="w-5 h-5" />
            <span className="text-[10px] truncate w-full text-center">Ustalar</span>
          </button>

          <button
            onClick={() => setActiveTab('swatches')}
            className={`flex-1 min-w-[42px] flex flex-col items-center gap-0.5 py-1 px-0.5 rounded-xl transition-all ${
              activeTab === 'swatches' ? 'text-brand-red font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Palette className="w-5 h-5" />
            <span className="text-[10px] truncate w-full text-center">Ranglar</span>
          </button>

          <button
            onClick={() => setActiveTab('telegram')}
            className={`flex-1 min-w-[42px] flex flex-col items-center gap-0.5 py-1 px-0.5 rounded-xl transition-all ${
              activeTab === 'telegram' ? 'text-brand-red font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Send className="w-5 h-5 text-sky-400" />
            <span className="text-[10px] truncate w-full text-center">Telegram</span>
          </button>

          <button
            onClick={() => setActiveTab('admins')}
            className={`flex-1 min-w-[42px] flex flex-col items-center gap-0.5 py-1 px-0.5 rounded-xl transition-all ${
              activeTab === 'admins' ? 'text-brand-red font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-5 h-5" />
            <span className="text-[10px] truncate w-full text-center">Admin</span>
          </button>
        </div>
      </div>

      {/* --- PRODUCT CREATE/EDIT MODAL --- */}
      {productModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-dark/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
          <div className="glass-panel w-full max-w-lg rounded-3xl p-6 sm:p-8 border border-brand-red/30 shadow-2xl relative my-8 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setProductModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-slate-300 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-display font-extrabold text-2xl text-white mb-4">
              {editingProduct ? "Mahsulotni tahrirlash" : "Yangi mahsulot qo'shish"}
            </h3>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Mahsulot nomi (O'zbekcha) *
                </label>
                <input
                  type="text"
                  required
                  value={productForm.nameUz}
                  onChange={(e) => setProductForm({ ...productForm, nameUz: e.target.value })}
                  placeholder="Masalan: Tunikabond Premium Grafit (0.45 mm)"
                  className="w-full px-4 py-2.5 rounded-xl bg-brand-dark/80 border border-white/15 text-white text-sm focus:outline-none focus:border-brand-red"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Toifasi
                  </label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-brand-dark/80 border border-white/15 text-white text-sm focus:outline-none focus:border-brand-red"
                  >
                    <option value="tunikabond">Tunikabond</option>
                    <option value="alyukabond">Alyukabond</option>
                    <option value="cornice">Karnizlar</option>
                    <option value="roofing">Profnastil & Tom</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Qalinligi
                  </label>
                  <input
                    type="text"
                    value={productForm.thickness}
                    onChange={(e) => setProductForm({ ...productForm, thickness: e.target.value })}
                    placeholder="0.45 mm"
                    className="w-full px-4 py-2.5 rounded-xl bg-brand-dark/80 border border-white/15 text-white text-sm focus:outline-none focus:border-brand-red"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Kafolat
                  </label>
                  <input
                    type="text"
                    value={productForm.warranty}
                    onChange={(e) => setProductForm({ ...productForm, warranty: e.target.value })}
                    placeholder="10 yil"
                    className="w-full px-4 py-2.5 rounded-xl bg-brand-dark/80 border border-white/15 text-white text-sm focus:outline-none focus:border-brand-red"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Narxi (diapazon)
                  </label>
                  <input
                    type="text"
                    value={productForm.priceRange}
                    onChange={(e) => setProductForm({ ...productForm, priceRange: e.target.value })}
                    placeholder="145,000 - 180,000 so'm / m²"
                    className="w-full px-4 py-2.5 rounded-xl bg-brand-dark/80 border border-white/15 text-white text-sm focus:outline-none focus:border-brand-red"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Mahsulot Rasmi (URL yoki Qurilmadan yuklash)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={productForm.image}
                    onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                    placeholder="https://... yoki yonidagi tugma orqali fayl tanlang"
                    className="flex-1 px-4 py-2.5 rounded-xl bg-brand-dark/80 border border-white/15 text-white text-sm focus:outline-none focus:border-brand-red"
                  />
                  <label className="cursor-pointer px-4 py-2.5 rounded-xl bg-brand-red/20 hover:bg-brand-red/30 border border-brand-red/40 text-xs font-bold text-white flex items-center gap-1.5 transition-colors shrink-0">
                    <Upload className="w-4 h-4 text-brand-red" />
                    <span>{uploadingImage ? "Yuklanmoqda..." : "Fayl"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setUploadingImage(true);
                          try {
                            const res = await apiUploadFile(file);
                            if (res.success && res.url) {
                              setProductForm(prev => ({ ...prev, image: res.url }));
                            } else {
                              alert(res.error || "Rasm yuklashda xatolik yuz berdi");
                            }
                          } catch (err) {
                            console.error("Product upload error:", err);
                          } finally {
                            setUploadingImage(false);
                            e.target.value = '';
                          }
                        }
                      }}
                    />
                  </label>
                </div>
                {productForm.image && (
                  <div className="mt-2.5 flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <img src={productForm.image} alt="Preview" className="w-12 h-12 object-cover rounded-lg border border-white/20 shrink-0 shadow-sm" />
                      <div className="overflow-hidden">
                        <span className="text-xs font-bold text-white block truncate">
                          {productForm.image.startsWith('data:') ? 'Qurilmadan yuklangan rasm' : 'Tanlangan rasm'}
                        </span>
                        <span className="text-[11px] text-emerald-400 font-semibold block">✓ Rasm muvaffaqiyatli tanlandi</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setProductForm(prev => ({ ...prev, image: '' }))}
                      className="px-2.5 py-1 text-xs text-rose-400 hover:text-white hover:bg-rose-500/20 rounded-lg transition-colors shrink-0"
                    >
                      O'chirish
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Qisqacha tavsif
                </label>
                <textarea
                  rows={3}
                  value={productForm.descUz}
                  onChange={(e) => setProductForm({ ...productForm, descUz: e.target.value })}
                  placeholder="Mahsulot afzalliklari..."
                  className="w-full px-4 py-2.5 rounded-xl bg-brand-dark/80 border border-white/15 text-white text-sm focus:outline-none focus:border-brand-red resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-brand-red via-brand-red to-brand-redHover text-white font-bold text-sm shadow-glow-red hover:shadow-glow-red-lg transition-all"
              >
                {editingProduct ? "O'zgarishlarni saqlash" : "Mahsulotni qo'shish"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- PORTFOLIO CREATE/EDIT MODAL --- */}
      {portfolioModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-dark/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
          <div className="glass-panel w-full max-w-lg rounded-3xl p-6 sm:p-8 border border-brand-red/30 shadow-2xl relative my-8 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setPortfolioModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-slate-300 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-display font-extrabold text-2xl text-white mb-4">
              {editingPortfolio ? "Loyihani tahrirlash" : "Yangi loyiha qo'shish"}
            </h3>

            <form onSubmit={handleSavePortfolio} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Loyiha sarlavhasi *
                </label>
                <input
                  type="text"
                  required
                  value={portfolioForm.titleUz}
                  onChange={(e) => setPortfolioForm({ ...portfolioForm, titleUz: e.target.value })}
                  placeholder="Masalan: Mirzo Ulug'bek tumanidagi 2 qavatli kottedj"
                  className="w-full px-4 py-2.5 rounded-xl bg-brand-dark/80 border border-white/15 text-white text-sm focus:outline-none focus:border-brand-red"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Katalog Kategoriya *
                  </label>
                  <select
                    value={portfolioForm.category}
                    onChange={(e) => setPortfolioForm({ ...portfolioForm, category: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-brand-dark/80 border border-white/15 text-white text-sm focus:outline-none focus:border-brand-red font-semibold"
                  >
                    <option value="naves">Naveslar</option>
                    <option value="koziryok">Koziryoklar</option>
                    <option value="darvozaxona">Darvozaxonalar</option>
                    <option value="fasad">Fasadlar (Tunikabond & Alyukabond)</option>
                    <option value="cornices">Karniz va Shift</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Joylashuv (Manzil)
                  </label>
                  <input
                    type="text"
                    value={portfolioForm.location}
                    onChange={(e) => setPortfolioForm({ ...portfolioForm, location: e.target.value })}
                    placeholder="Toshkent, Sergeli"
                    className="w-full px-4 py-2.5 rounded-xl bg-brand-dark/80 border border-white/15 text-white text-sm focus:outline-none focus:border-brand-red"
                  />
                </div>
              </div>

              {/* Master assignment dropdown */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1 flex items-center justify-between">
                  <span>Mas'ul Usta (Biriktirish) *</span>
                  <span className="text-[11px] text-brand-red">katalogda va usta profilida aks etadi</span>
                </label>
                <select
                  value={portfolioForm.masterId || ''}
                  onChange={(e) => {
                    const selectedM = teamList.find(m => m.id === e.target.value);
                    setPortfolioForm({
                      ...portfolioForm,
                      masterId: e.target.value,
                      masterName: selectedM ? selectedM.name : '',
                      masterPhoto: selectedM ? selectedM.photo : '',
                      masterRole: selectedM ? selectedM.role : ''
                    });
                  }}
                  className="w-full px-3 py-2.5 rounded-xl bg-brand-dark/80 border border-brand-red/40 text-white text-sm focus:outline-none focus:border-brand-red font-bold"
                >
                  <option value="">Ustani tanlang...</option>
                  {teamList.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.label || m.role})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Ishlatilgan material
                  </label>
                  <input
                    type="text"
                    value={portfolioForm.material}
                    onChange={(e) => setPortfolioForm({ ...portfolioForm, material: e.target.value })}
                    placeholder="Tunikabond Dark Walnut"
                    className="w-full px-4 py-2.5 rounded-xl bg-brand-dark/80 border border-white/15 text-white text-sm focus:outline-none focus:border-brand-red"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Hajmi (m²)
                  </label>
                  <input
                    type="text"
                    value={portfolioForm.area}
                    onChange={(e) => setPortfolioForm({ ...portfolioForm, area: e.target.value })}
                    placeholder="280 m²"
                    className="w-full px-4 py-2.5 rounded-xl bg-brand-dark/80 border border-white/15 text-white text-sm focus:outline-none focus:border-brand-red"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Loyiha Rasmi (URL yoki Qurilmadan yuklash)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={portfolioForm.image}
                    onChange={(e) => setPortfolioForm({ ...portfolioForm, image: e.target.value })}
                    placeholder="https://... yoki yonidagi tugma orqali fayl tanlang"
                    className="flex-1 px-4 py-2.5 rounded-xl bg-brand-dark/80 border border-white/15 text-white text-sm focus:outline-none focus:border-brand-red"
                  />
                  <label className="cursor-pointer px-4 py-2.5 rounded-xl bg-brand-red/20 hover:bg-brand-red/30 border border-brand-red/40 text-xs font-bold text-white flex items-center gap-1.5 transition-colors shrink-0">
                    <Upload className="w-4 h-4 text-brand-red" />
                    <span>{uploadingImage ? "Yuklanmoqda..." : "Fayl"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setUploadingImage(true);
                          try {
                            const res = await apiUploadFile(file);
                            if (res.success && res.url) {
                              setPortfolioForm(prev => ({ ...prev, image: res.url }));
                            } else {
                              alert(res.error || "Rasm yuklashda xatolik yuz berdi");
                            }
                          } catch (err) {
                            console.error("Portfolio upload error:", err);
                          } finally {
                            setUploadingImage(false);
                            e.target.value = '';
                          }
                        }
                      }}
                    />
                  </label>
                </div>
                {portfolioForm.image && (
                  <div className="mt-2.5 flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <img src={portfolioForm.image} alt="Preview" className="w-12 h-12 object-cover rounded-lg border border-white/20 shrink-0 shadow-sm" />
                      <div className="overflow-hidden">
                        <span className="text-xs font-bold text-white block truncate">
                          {portfolioForm.image.startsWith('data:') ? 'Qurilmadan yuklangan rasm' : 'Tanlangan rasm'}
                        </span>
                        <span className="text-[11px] text-emerald-400 font-semibold block">✓ Rasm muvaffaqiyatli tanlandi</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPortfolioForm(prev => ({ ...prev, image: '' }))}
                      className="px-2.5 py-1 text-xs text-rose-400 hover:text-white hover:bg-rose-500/20 rounded-lg transition-colors shrink-0"
                    >
                      O'chirish
                    </button>
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-brand-red via-brand-red to-brand-redHover text-white font-bold text-sm shadow-glow-red hover:shadow-glow-red-lg transition-all"
              >
                {editingPortfolio ? "O'zgarishlarni saqlash" : "Loyihani qo'shish"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- TEAM MEMBER CREATE/EDIT MODAL --- */}
      {teamModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-dark/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
          <div className="glass-panel w-full max-w-lg rounded-3xl p-6 sm:p-8 border border-brand-red/30 shadow-2xl relative my-8 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setTeamModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-slate-300 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-display font-extrabold text-2xl text-white mb-4">
              {editingTeamMember ? "Usta ma'lumotlarini tahrirlash" : "Yangi Usta / Xodim qo'shish"}
            </h3>

            <form onSubmit={handleSaveTeamMember} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Ism va Familiya *
                </label>
                <input
                  type="text"
                  required
                  value={teamForm.name}
                  onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })}
                  placeholder="Masalan: Dilshodbek Usta"
                  className="w-full px-4 py-2.5 rounded-xl bg-brand-dark/80 border border-white/15 text-white text-sm focus:outline-none focus:border-brand-red"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Label / Toifa *
                  </label>
                  <select
                    value={teamForm.label}
                    onChange={(e) => setTeamForm({ ...teamForm, label: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-brand-dark/80 border border-white/15 text-white text-sm focus:outline-none focus:border-brand-red font-bold"
                  >
                    <option value="Firma Boshlig'i">Firma Boshlig'i</option>
                    <option value="CEO">CEO</option>
                    <option value="Usta">Usta</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Ish tajribasi
                  </label>
                  <input
                    type="text"
                    value={teamForm.experience}
                    onChange={(e) => setTeamForm({ ...teamForm, experience: e.target.value })}
                    placeholder="7+ yil tajriba"
                    className="w-full px-4 py-2.5 rounded-xl bg-brand-dark/80 border border-white/15 text-white text-sm focus:outline-none focus:border-brand-red"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Mutaxassislik / Kasbi
                </label>
                <input
                  type="text"
                  value={teamForm.role}
                  onChange={(e) => setTeamForm({ ...teamForm, role: e.target.value })}
                  placeholder="Katta Usta — Tunikabond va Alyukabond Montaji"
                  className="w-full px-4 py-2.5 rounded-xl bg-brand-dark/80 border border-white/15 text-white text-sm focus:outline-none focus:border-brand-red"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Topshirgan obyektlar soni
                  </label>
                  <input
                    type="text"
                    value={teamForm.completedProjects}
                    onChange={(e) => setTeamForm({ ...teamForm, completedProjects: e.target.value })}
                    placeholder="350+ obyekt"
                    className="w-full px-4 py-2.5 rounded-xl bg-brand-dark/80 border border-white/15 text-white text-sm focus:outline-none focus:border-brand-red"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Telefon raqami
                  </label>
                  <input
                    type="text"
                    value={teamForm.phone}
                    onChange={(e) => setTeamForm({ ...teamForm, phone: e.target.value })}
                    placeholder="+998 99 533-33-03"
                    className="w-full px-4 py-2.5 rounded-xl bg-brand-dark/80 border border-white/15 text-white text-sm focus:outline-none focus:border-brand-red"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Usta Rasmi (URL yoki Qurilmadan yuklash)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={teamForm.photo}
                    onChange={(e) => setTeamForm({ ...teamForm, photo: e.target.value })}
                    placeholder="https://... yoki yonidagi tugma orqali rasm tanlang"
                    className="flex-1 px-4 py-2.5 rounded-xl bg-brand-dark/80 border border-white/15 text-white text-sm focus:outline-none focus:border-brand-red"
                  />
                  <label className="cursor-pointer px-4 py-2.5 rounded-xl bg-brand-red/20 hover:bg-brand-red/30 border border-brand-red/40 text-xs font-bold text-white flex items-center gap-1.5 transition-colors shrink-0">
                    <Upload className="w-4 h-4 text-brand-red" />
                    <span>{uploadingImage ? "Yuklanmoqda..." : "Fayl"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setUploadingImage(true);
                          try {
                            const res = await apiUploadFile(file);
                            if (res.success && res.url) {
                              setTeamForm(prev => ({ ...prev, photo: res.url }));
                            } else {
                              alert(res.error || "Rasm yuklashda xatolik yuz berdi");
                            }
                          } catch (err) {
                            console.error("Team upload error:", err);
                          } finally {
                            setUploadingImage(false);
                            e.target.value = '';
                          }
                        }
                      }}
                    />
                  </label>
                </div>
                {teamForm.photo && (
                  <div className="mt-2.5 flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <img src={teamForm.photo} alt="Preview" className="w-12 h-12 object-cover rounded-lg border border-white/20 shrink-0 shadow-sm" />
                      <div className="overflow-hidden">
                        <span className="text-xs font-bold text-white block truncate">
                          {teamForm.photo.startsWith('data:') ? 'Qurilmadan yuklangan rasm' : 'Tanlangan rasm'}
                        </span>
                        <span className="text-[11px] text-emerald-400 font-semibold block">✓ Rasm muvaffaqiyatli tanlandi</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setTeamForm(prev => ({ ...prev, photo: '' }))}
                      className="px-2.5 py-1 text-xs text-rose-400 hover:text-white hover:bg-rose-500/20 rounded-lg transition-colors shrink-0"
                    >
                      O'chirish
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Usta haqida qisqacha ma'lumot
                </label>
                <textarea
                  rows="3"
                  value={teamForm.bio}
                  onChange={(e) => setTeamForm({ ...teamForm, bio: e.target.value })}
                  placeholder="Naves va fasad bo'yicha ko'p yillik tajribaga ega..."
                  className="w-full px-4 py-2.5 rounded-xl bg-brand-dark/80 border border-white/15 text-white text-sm focus:outline-none focus:border-brand-red"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-brand-red via-brand-red to-brand-redHover text-white font-bold text-sm shadow-glow-red hover:shadow-glow-red-lg transition-all"
              >
                {editingTeamMember ? "O'zgarishlarni saqlash" : "Ustani qo'shish"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- ADD ADMIN MODAL --- */}
      {adminModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-dark/85 backdrop-blur-md animate-fadeIn">
          <div className="glass-panel w-full max-w-md rounded-3xl p-6 sm:p-8 border border-brand-red/30 shadow-2xl relative">
            <button
              onClick={() => setAdminModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-slate-300 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-display font-extrabold text-2xl text-white mb-4">
              Yangi Admin qo'shish
            </h3>

            <form onSubmit={handleRegisterAdmin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Ism va familiya *
                </label>
                <input
                  type="text"
                  required
                  value={adminForm.fullName}
                  onChange={(e) => setAdminForm({ ...adminForm, fullName: e.target.value })}
                  placeholder="Jasur Rahimov"
                  className="w-full px-4 py-2.5 rounded-xl bg-brand-dark/80 border border-white/15 text-white text-sm focus:outline-none focus:border-brand-red"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Login (Username) *
                </label>
                <input
                  type="text"
                  required
                  value={adminForm.username}
                  onChange={(e) => setAdminForm({ ...adminForm, username: e.target.value })}
                  placeholder="jasur_admin"
                  className="w-full px-4 py-2.5 rounded-xl bg-brand-dark/80 border border-white/15 text-white text-sm focus:outline-none focus:border-brand-red"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Parol (kamida 6 belgi) *
                </label>
                <input
                  type="password"
                  required
                  value={adminForm.password}
                  onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-xl bg-brand-dark/80 border border-white/15 text-white text-sm focus:outline-none focus:border-brand-red"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Roli
                </label>
                <select
                  value={adminForm.role}
                  onChange={(e) => setAdminForm({ ...adminForm, role: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-brand-dark/80 border border-white/15 text-white text-sm focus:outline-none focus:border-brand-red"
                >
                  <option value="Admin">Menejer / Admin</option>
                  <option value="Super Admin">Bosh Administrator</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-brand-red via-brand-red to-brand-redHover text-white font-bold text-sm shadow-glow-red hover:shadow-glow-red-lg transition-all"
              >
                Adminni ro'yxatga olish
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- ADD / EDIT SWATCH MODAL --- */}
      {swatchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-dark/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
          <div className="glass-panel w-full max-w-lg rounded-3xl p-6 sm:p-8 border border-brand-red/30 shadow-2xl relative my-8 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSwatchModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-slate-300 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-display font-extrabold text-2xl text-white mb-2 flex items-center gap-2">
              <Palette className="w-6 h-6 text-brand-red" />
              <span>{editingSwatch ? "Rangni tahrirlash" : "Yangi rang / tekstura qo'shish"}</span>
            </h3>
            <p className="text-xs text-slate-400 mb-5">
              Ushbu namuna saytdagi "Ranglar va Teksturalar" katalogida ko'rinadi
            </p>

            <form onSubmit={handleSaveSwatch} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Rang yoki tekstura nomi (O'zbekcha) *
                </label>
                <input
                  type="text"
                  required
                  value={swatchForm.nameUz}
                  onChange={(e) => setSwatchForm({ ...swatchForm, nameUz: e.target.value })}
                  placeholder="Masalan: Oltin Eman (Golden Oak) yoki Grafit"
                  className="w-full px-4 py-2.5 rounded-xl bg-brand-dark/80 border border-white/15 text-white text-sm focus:outline-none focus:border-brand-red"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Nomi (Ruscha - ixtiyoriy)
                </label>
                <input
                  type="text"
                  value={swatchForm.nameRu}
                  onChange={(e) => setSwatchForm({ ...swatchForm, nameRu: e.target.value })}
                  placeholder="Золотой Дуб или Графит"
                  className="w-full px-4 py-2.5 rounded-xl bg-brand-dark/80 border border-white/15 text-white text-sm focus:outline-none focus:border-brand-red"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Toifasi *
                  </label>
                  <select
                    value={swatchForm.category}
                    onChange={(e) => setSwatchForm({ ...swatchForm, category: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-brand-dark/80 border border-white/15 text-white text-sm focus:outline-none focus:border-brand-red"
                  >
                    <option value="wood">Yog'och teksturali</option>
                    <option value="metallic">Metallik</option>
                    <option value="ral">RAL klassik</option>
                    <option value="special">Maxsus / Oyna / Xrom</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Kodi (RAL yoki kod) *
                  </label>
                  <input
                    type="text"
                    required
                    value={swatchForm.code}
                    onChange={(e) => setSwatchForm({ ...swatchForm, code: e.target.value })}
                    placeholder="RAL 7016 yoki WOOD-801"
                    className="w-full px-4 py-2.5 rounded-xl bg-brand-dark/80 border border-white/15 text-white text-sm focus:outline-none focus:border-brand-red"
                  />
                </div>
              </div>

              {/* LIVE SAMPLE PREVIEW */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Namuna ko'rinishi (Jonli oldindan ko'rish)
                </label>
                <div 
                  className="w-full h-28 rounded-2xl relative overflow-hidden border border-white/20 shadow-inner flex items-end p-3 transition-all"
                  style={{
                    background: swatchForm.image 
                      ? `url(${swatchForm.image}) center/cover no-repeat` 
                      : (swatchForm.bgGradient || swatchForm.colorHex || '#444')
                  }}
                >
                  <span className="px-3 py-1 rounded-lg bg-slate-900/85 backdrop-blur-md text-xs font-bold text-white border border-white/20 shadow-sm">
                    {swatchForm.code || "KOD-001"}
                  </span>
                </div>
              </div>

              {/* Color Picker & Hex */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Rang palitrasi (Hex / Tanlash)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={swatchForm.colorHex.startsWith('#') ? swatchForm.colorHex : '#A05A2C'}
                      onChange={(e) => {
                        const hex = e.target.value;
                        setSwatchForm({ 
                          ...swatchForm, 
                          colorHex: hex,
                          bgGradient: `linear-gradient(135deg, ${hex} 0%, #1e1e1e 100%)`
                        });
                      }}
                      className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-0"
                    />
                    <input
                      type="text"
                      value={swatchForm.colorHex}
                      onChange={(e) => {
                        const hex = e.target.value;
                        setSwatchForm({ 
                          ...swatchForm, 
                          colorHex: hex,
                          bgGradient: hex ? `linear-gradient(135deg, ${hex} 0%, #1e1e1e 100%)` : swatchForm.bgGradient
                        });
                      }}
                      placeholder="#373F43"
                      className="flex-1 px-3 py-2 rounded-xl bg-brand-dark/80 border border-white/15 text-white text-sm focus:outline-none focus:border-brand-red font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Faktura / Yuzasi
                  </label>
                  <input
                    type="text"
                    value={swatchForm.finish}
                    onChange={(e) => setSwatchForm({ ...swatchForm, finish: e.target.value })}
                    placeholder="Mat / Yaltiroq / Strukturaviy"
                    className="w-full px-4 py-2.5 rounded-xl bg-brand-dark/80 border border-white/15 text-white text-sm focus:outline-none focus:border-brand-red"
                  />
                </div>
              </div>

              {/* Upload sample texture photo */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Yoki haqiqiy tunikabond namunasi rasmini yuklang
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={swatchForm.image}
                    onChange={(e) => setSwatchForm({ ...swatchForm, image: e.target.value })}
                    placeholder="https://... yoki yonidagi tugma orqali fayl tanlang"
                    className="flex-1 px-4 py-2.5 rounded-xl bg-brand-dark/80 border border-white/15 text-white text-sm focus:outline-none focus:border-brand-red"
                  />
                  <label className="cursor-pointer px-4 py-2.5 rounded-xl bg-brand-red/20 hover:bg-brand-red/30 border border-brand-red/40 text-xs font-bold text-white flex items-center gap-1.5 transition-colors shrink-0">
                    <Upload className="w-4 h-4 text-brand-red" />
                    <span>{uploadingImage ? "Yuklanmoqda..." : "Rasm"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setUploadingImage(true);
                          try {
                            const res = await apiUploadFile(file);
                            if (res.success && res.url) {
                              setSwatchForm(prev => ({ ...prev, image: res.url }));
                            } else {
                              alert(res.error || "Rasm yuklashda xatolik yuz berdi");
                            }
                          } catch (err) {
                            console.error("Swatch upload error:", err);
                          } finally {
                            setUploadingImage(false);
                            e.target.value = '';
                          }
                        }
                      }}
                    />
                  </label>
                </div>
                {swatchForm.image && (
                  <div className="mt-2 flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/10">
                    <span className="text-[11px] text-emerald-400 font-semibold">✓ Namuna rasmi muvaffaqiyatli tanlandi</span>
                    <button
                      type="button"
                      onClick={() => setSwatchForm(prev => ({ ...prev, image: '' }))}
                      className="text-xs text-red-400 hover:text-red-300"
                    >
                      Rasmni olib tashlash
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Tekstura tavsifi
                  </label>
                  <input
                    type="text"
                    value={swatchForm.texture}
                    onChange={(e) => setSwatchForm({ ...swatchForm, texture: e.target.value })}
                    placeholder="Yog'och tomirlari / Silliq mat"
                    className="w-full px-4 py-2.5 rounded-xl bg-brand-dark/80 border border-white/15 text-white text-sm focus:outline-none focus:border-brand-red"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Qoplama turi
                  </label>
                  <input
                    type="text"
                    value={swatchForm.coating}
                    onChange={(e) => setSwatchForm({ ...swatchForm, coating: e.target.value })}
                    placeholder="PVDF 3-qavat / Poliester"
                    className="w-full px-4 py-2.5 rounded-xl bg-brand-dark/80 border border-white/15 text-white text-sm focus:outline-none focus:border-brand-red"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Qo'llaniladigan joylar (Tavsiya)
                </label>
                <input
                  type="text"
                  value={swatchForm.application}
                  onChange={(e) => setSwatchForm({ ...swatchForm, application: e.target.value })}
                  placeholder="Kottedj fasadlari, tom karnizlari, darvoza atrofi..."
                  className="w-full px-4 py-2.5 rounded-xl bg-brand-dark/80 border border-white/15 text-white text-sm focus:outline-none focus:border-brand-red"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-brand-red via-brand-red to-brand-redHover text-white font-bold text-sm shadow-glow-red hover:shadow-glow-red-lg transition-all cursor-pointer"
              >
                {editingSwatch ? "O'zgarishlarni saqlash" : "Rangni katalogga qo'shish"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- TELEGRAM NEW RECIPIENT MODAL --- */}
      {newRecipientModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-dark/85 backdrop-blur-md animate-fadeIn">
          <div className="glass-panel w-full max-w-md rounded-3xl p-6 sm:p-8 border border-white/20 shadow-2xl relative">
            <button
              onClick={() => setNewRecipientModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-slate-300 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-bold text-xl text-white mb-1 flex items-center gap-2">
              <Plus className="w-5 h-5 text-brand-red" />
              <span>Yangi Qabul Qiluvchi Qo'shish</span>
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Arizalar kelib tushishi kerak bo'lgan yangi kanal, shaxsiy akkaunt yoki guruh chat ID sini kiriting.
            </p>

            <form onSubmit={handleAddRecipient} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Nomi / Mas'ul shaxs
                </label>
                <input
                  type="text"
                  required
                  value={newRecipientForm.label}
                  onChange={(e) => setNewRecipientForm({ ...newRecipientForm, label: e.target.value })}
                  placeholder="Masalan: Usta Alisher yoki Arizalar Guruhi"
                  className="w-full px-4 py-2.5 rounded-xl bg-brand-dark/90 border border-white/15 text-white text-sm focus:outline-none focus:border-brand-red"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Telegram Chat ID / User ID
                </label>
                <input
                  type="text"
                  required
                  value={newRecipientForm.id}
                  onChange={(e) => setNewRecipientForm({ ...newRecipientForm, id: e.target.value })}
                  placeholder="Masalan: 6481310196 yoki -1004415750690"
                  className="w-full px-4 py-2.5 rounded-xl bg-brand-dark/90 border border-white/15 text-white font-mono text-sm focus:outline-none focus:border-brand-red"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Kanal/guruhlar IDsi odatda -100 bilan boshlanadi. Shaxsiy ID esa musbat son bo'ladi.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Turi
                </label>
                <select
                  value={newRecipientForm.type}
                  onChange={(e) => setNewRecipientForm({ ...newRecipientForm, type: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-brand-dark/90 border border-white/15 text-white text-sm focus:outline-none focus:border-brand-red"
                >
                  <option value="user">Shaxsiy Akkount (User ID)</option>
                  <option value="channel">Telegram Kanal (-100...)</option>
                  <option value="group">Telegram Guruh (-...)</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setNewRecipientModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 text-xs font-bold transition-colors"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand-red hover:bg-brand-redHover text-white text-xs font-bold shadow-glow-red transition-all"
                >
                  Qo'shish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
