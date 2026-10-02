import React, { useState, useEffect } from 'react';
import { 
  apiGetStats, apiGetLeads, apiUpdateLead, apiDeleteLead,
  apiGetProducts, apiCreateProduct, apiUpdateProduct, apiDeleteProduct,
  apiGetPortfolio, apiCreatePortfolio, apiUpdatePortfolio, apiDeletePortfolio,
  apiGetTeam, apiCreateTeamMember, apiUpdateTeamMember, apiDeleteTeamMember,
  apiGetAdmins, apiRegister, apiUploadFile,
  apiGetCalcSettings, apiUpdateCalcSettings, DEFAULT_CALC_SETTINGS,
  apiGetSwatches, apiCreateSwatch, apiUpdateSwatch, apiDeleteSwatch,
  apiExportAllData, apiImportData
} from '../../services/api';
import { 
  LayoutDashboard, Inbox, Package, Briefcase, Users, LogOut, 
  Plus, Trash2, Edit3, CheckCircle2, Clock, Phone, Send, X, 
  ExternalLink, Search, RefreshCw, Shield, AlertCircle,
  Upload, Download, FileText, Image as ImageIcon, Hammer, UserCheck,
  Calculator as CalculatorIcon, Check, DollarSign, RotateCcw, Save, Sparkles, Building2,
  Palette
} from 'lucide-react';

export const AdminDashboard = ({ 
  currentUser, 
  onLogout, 
  onClose, 
  onDataChanged, 
  calcSettings, 
  onCalcSettingsChanged,
  isStandaloneApp = false,
  swatchesList: propSwatchesList
}) => {
  const [activeTab, setActiveTab] = useState('leads'); // stats | leads | products | portfolio | team | swatches | calculator | admins
  const [stats, setStats] = useState(null);
  const [leads, setLeads] = useState([]);
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

  // Calculator pricing form state
  const [calcForm, setCalcForm] = useState(() => {
    return calcSettings || DEFAULT_CALC_SETTINGS;
  });
  const [calcSaving, setCalcSaving] = useState(false);
  const [calcSuccessMsg, setCalcSuccessMsg] = useState(false);

  // Live calculator preview state in Admin
  const [previewMat, setPreviewMat] = useState('tunikabond_premium');
  const [previewInstall, setPreviewInstall] = useState('cottage');
  const [previewArea, setPreviewArea] = useState(100);

  // Load all initial data
  const loadData = async () => {
    setLoading(true);
    const [st, ld, pr, pf, ad, tm, cSet, swt] = await Promise.all([
      apiGetStats(),
      apiGetLeads(),
      apiGetProducts(),
      apiGetPortfolio(),
      apiGetAdmins(),
      apiGetTeam(),
      apiGetCalcSettings(),
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
    if (cSet && cSet.materialPrices) {
      setCalcForm(cSet);
      if (onCalcSettingsChanged) onCalcSettingsChanged(cSet);
    }
    setLoading(false);
  };

  const notifyChange = () => {
    if (onDataChanged) onDataChanged();
    loadData();
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => {
      loadData();
    };
    window.addEventListener('tunikabond_data_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('tunikabond_data_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  useEffect(() => {
    if (propSwatchesList && Array.isArray(propSwatchesList) && propSwatchesList.length > 0) {
      setSwatchesList(propSwatchesList);
    }
  }, [propSwatchesList]);

  useEffect(() => {
    if (calcSettings && calcSettings.materialPrices) {
      setCalcForm(calcSettings);
    }
  }, [calcSettings]);

  // --- CALCULATOR ACTIONS ---
  const handleMaterialPriceChange = (key, val) => {
    const num = Math.max(0, parseInt(val.replace(/\D/g, ''), 10) || 0);
    setCalcForm(prev => ({
      ...prev,
      materialPrices: {
        ...prev.materialPrices,
        [key]: num
      }
    }));
  };

  const handleInstallRateChange = (key, val) => {
    const num = Math.max(0, parseInt(val.replace(/\D/g, ''), 10) || 0);
    setCalcForm(prev => ({
      ...prev,
      installationRates: {
        ...prev.installationRates,
        [key]: num
      }
    }));
  };

  const handleSaveCalcSettings = async (e) => {
    if (e) e.preventDefault();
    setCalcSaving(true);
    try {
      const res = await apiUpdateCalcSettings(calcForm);
      if (res.success) {
        if (onCalcSettingsChanged) onCalcSettingsChanged(res.settings);
        if (onDataChanged) onDataChanged();
        setCalcSuccessMsg(true);
        setTimeout(() => setCalcSuccessMsg(false), 3500);
      } else {
        alert(res.error || "Xatolik yuz berdi");
      }
    } catch (err) {
      console.error(err);
      alert("Xatolik yuz berdi");
    } finally {
      setCalcSaving(false);
    }
  };

  const handleResetCalcSettings = async () => {
    if (window.confirm("Barcha kalkulyator narxlarini standart zavod qiymatlariga qaytarmoqchimisiz?")) {
      setCalcSaving(true);
      try {
        const res = await apiUpdateCalcSettings(DEFAULT_CALC_SETTINGS);
        if (res.success) {
          setCalcForm(DEFAULT_CALC_SETTINGS);
          if (onCalcSettingsChanged) onCalcSettingsChanged(DEFAULT_CALC_SETTINGS);
          if (onDataChanged) onDataChanged();
          setCalcSuccessMsg(true);
          setTimeout(() => setCalcSuccessMsg(false), 3500);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setCalcSaving(false);
      }
    }
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
              onClick={() => setActiveTab('calculator')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'calculator' 
                  ? 'bg-brand-red text-white shadow-glow-red' 
                  : 'text-slate-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <CalculatorIcon className="w-4 h-4" />
                <span>Kalkulyator Narxlari</span>
              </div>
              <span className="text-[10px] bg-white/10 text-amber-300 px-2 py-0.5 rounded font-bold">
                1 m²
              </span>
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

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-xs text-slate-400">
            <span className="block font-bold text-white mb-1">Telegram Bot:</span>
            <span>Arizalar avtomatik tarzda Telegram va serverga tushadi.</span>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 p-3 sm:p-6 overflow-y-auto bg-brand-dark/50 pb-28 md:pb-6">
          
          {/* TAB 1: LEADS (Arizalar) */}
          {activeTab === 'leads' && (
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

                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-300">
                    Yangi arizalar: <strong className="text-brand-red font-bold">{leads.filter(l => l.status === 'new' || !l.status).length} ta</strong>
                  </span>
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

              {leads.length === 0 ? (
                <div className="p-12 text-center rounded-3xl glass-card border border-white/10">
                  <Inbox className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400 text-sm">Hozircha arizalar mavjud emas</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {leads.map((lead) => (
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
                          <div className="flex items-center gap-3">
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
                          </div>

                          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300">
                            <span className="font-bold text-white">📞 {lead.phone}</span>
                            <span>🛠 {lead.service}</span>
                            <span className="text-slate-500">⏰ {lead.timestamp ? new Date(lead.timestamp).toLocaleString('uz-UZ') : ''}</span>
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
                          <a
                            href={`tel:${lead.phone}`}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                            title="Telefon qilish"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            <span>Qo'ng'iroq</span>
                          </a>

                          {/* Status Dropdown */}
                          <select
                            value={lead.status || 'new'}
                            onChange={(e) => handleLeadStatusChange(lead.id, e.target.value)}
                            className="px-3 py-1.5 rounded-xl bg-brand-surface border border-white/20 text-xs font-semibold text-white focus:outline-none focus:border-brand-red"
                          >
                            <option value="new">Yangi</option>
                            <option value="in_progress">Jarayonda</option>
                            <option value="completed">Bajarildi</option>
                            <option value="cancelled">Bekor qilindi</option>
                          </select>

                          {/* Delete Lead */}
                          <button
                            onClick={() => handleDeleteLead(lead.id)}
                            className="p-2 rounded-xl bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
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
          )}

          {/* TAB 2: PRODUCTS CRUD */}
          {activeTab === 'products' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display font-extrabold text-2xl text-white">
                    Mahsulotlar Katalogi ({productsList.length})
                  </h2>
                  <p className="text-xs text-slate-400">
                    Saytdagi mahsulotlarni tahrirlash, yangi qo'shish yoki o'chirish
                  </p>
                </div>

                <button
                  onClick={handleOpenProductCreate}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-red to-brand-redHover text-white text-xs sm:text-sm font-bold shadow-glow-red flex items-center gap-2 hover:scale-105 active:scale-95 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Yangi mahsulot qo'shish</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {productsList.map((prod) => (
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
                        className="flex-1 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Tahrirlash</span>
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(prod.id)}
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

          {/* TAB 3: PORTFOLIO CRUD */}
          {activeTab === 'portfolio' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display font-extrabold text-2xl text-white">
                    Portfolio / Obyektlar ({portfolioList.length})
                  </h2>
                  <p className="text-xs text-slate-400">
                    Bajarilgan ishlar galereyasiga loyiha qo'shish va yangilash
                  </p>
                </div>

                <button
                  onClick={handleOpenPortfolioCreate}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-red to-brand-redHover text-white text-xs sm:text-sm font-bold shadow-glow-red flex items-center gap-2 hover:scale-105 active:scale-95 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Yangi loyiha qo'shish</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {portfolioList.map((item) => (
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
                        className="flex-1 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Tahrirlash</span>
                      </button>
                      <button
                        onClick={() => handleDeletePortfolio(item.id)}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {swatchesList
                  .filter(s => swatchCategoryFilter === 'all' || s.category === swatchCategoryFilter)
                  .map((swatch) => {
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

                    <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                      Faol
                    </span>
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

          {/* TAB 6: CALCULATOR PRICING SETTINGS */}
          {activeTab === 'calculator' && (
            <div className="space-y-6">
              {/* Header and Action Buttons */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-display font-extrabold text-2xl text-white flex items-center gap-2.5">
                    <CalculatorIcon className="w-6 h-6 text-brand-red" />
                    <span>Kalkulyator Narxlari va Tariflar</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Saytdagi hisoblagichda 1 m² material va montaj xizmatlari narxlarini bevosita shu yerdan boshqaring.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleResetCalcSettings}
                    disabled={calcSaving}
                    className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-all border border-white/10"
                    title="Standart narxlarga qaytarish"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Standartga qaytarish</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveCalcSettings}
                    disabled={calcSaving}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-red to-brand-redHover hover:scale-105 active:scale-95 text-white text-xs sm:text-sm font-bold shadow-glow-red flex items-center gap-2 transition-all disabled:opacity-50"
                  >
                    {calcSaving ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    <span>{calcSaving ? "Saqlanmoqda..." : "Narxlarni saqlash"}</span>
                  </button>
                </div>
              </div>

              {/* Success Notification Alert */}
              {calcSuccessMsg && (
                <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-sm font-bold flex items-center justify-between animate-fadeIn">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                    <span>Kalkulyator narxlari muvaffaqiyatli saqlandi va saytda yangilandi!</span>
                  </div>
                  <span className="text-xs text-emerald-500 font-mono">Saqlandi ✓</span>
                </div>
              )}

              {/* Main Content Grid: Materials & Installation */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* 1. MATERIAL NARXLARI */}
                <div className="glass-card rounded-2xl p-5 border border-white/10 bg-brand-surface/70 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <div>
                      <h3 className="font-display font-bold text-lg text-white flex items-center gap-2">
                        <Package className="w-4 h-4 text-brand-red" />
                        <span>1. Materiallar narxi (1 m² uchun)</span>
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Mijoz tanlagan material bo'yicha 1 m² xomashyo narxi (so'mda)
                      </p>
                    </div>
                    <span className="text-[11px] font-mono text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                      5 ta material
                    </span>
                  </div>

                  <div className="space-y-3.5">
                    {/* Tunikabond Standart */}
                    <div className="p-3.5 rounded-xl bg-brand-dark/60 border border-white/5 hover:border-white/15 transition-all">
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span>Tunikabond Standart (0.40 mm)</span>
                          <span className="text-[10px] text-slate-400 font-normal">Ekonomik fasad/naves</span>
                        </label>
                        <span className="text-[11px] font-mono text-slate-400">
                          {new Intl.NumberFormat('uz-UZ').format(calcForm.materialPrices?.tunikabond_standard || 0)} so'm
                        </span>
                      </div>
                      <div className="relative">
                        <input
                          type="number"
                          value={calcForm.materialPrices?.tunikabond_standard || 0}
                          onChange={(e) => handleMaterialPriceChange('tunikabond_standard', e.target.value)}
                          className="w-full px-4 py-2.5 pr-20 rounded-xl bg-brand-dark/90 border border-white/15 text-white font-mono text-sm focus:outline-none focus:border-brand-red"
                        />
                        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">
                          so'm / m²
                        </span>
                      </div>
                    </div>

                    {/* Tunikabond Premium */}
                    <div className="p-3.5 rounded-xl bg-brand-dark/60 border border-brand-red/30 bg-gradient-to-r from-brand-red/5 to-transparent">
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span>Tunikabond Premium (0.45 mm)</span>
                          <span className="text-[10px] bg-brand-red text-white px-1.5 py-0.2 rounded font-bold">Xit</span>
                        </label>
                        <span className="text-[11px] font-mono text-brand-red font-bold">
                          {new Intl.NumberFormat('uz-UZ').format(calcForm.materialPrices?.tunikabond_premium || 0)} so'm
                        </span>
                      </div>
                      <div className="relative">
                        <input
                          type="number"
                          value={calcForm.materialPrices?.tunikabond_premium || 0}
                          onChange={(e) => handleMaterialPriceChange('tunikabond_premium', e.target.value)}
                          className="w-full px-4 py-2.5 pr-20 rounded-xl bg-brand-dark/90 border border-white/15 text-white font-mono text-sm focus:outline-none focus:border-brand-red"
                        />
                        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">
                          so'm / m²
                        </span>
                      </div>
                    </div>

                    {/* Alyukabond Standart */}
                    <div className="p-3.5 rounded-xl bg-brand-dark/60 border border-white/5 hover:border-white/15 transition-all">
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span>Alyukabond Standart (3 mm)</span>
                          <span className="text-[10px] text-slate-400 font-normal">Alyuminiy kompozit panel</span>
                        </label>
                        <span className="text-[11px] font-mono text-slate-400">
                          {new Intl.NumberFormat('uz-UZ').format(calcForm.materialPrices?.alyukabond_standard || 0)} so'm
                        </span>
                      </div>
                      <div className="relative">
                        <input
                          type="number"
                          value={calcForm.materialPrices?.alyukabond_standard || 0}
                          onChange={(e) => handleMaterialPriceChange('alyukabond_standard', e.target.value)}
                          className="w-full px-4 py-2.5 pr-20 rounded-xl bg-brand-dark/90 border border-white/15 text-white font-mono text-sm focus:outline-none focus:border-brand-red"
                        />
                        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">
                          so'm / m²
                        </span>
                      </div>
                    </div>

                    {/* Alyukabond Fireproof */}
                    <div className="p-3.5 rounded-xl bg-brand-dark/60 border border-white/5 hover:border-white/15 transition-all">
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span>Alyukabond A2 Olovbardosh (4 mm)</span>
                          <span className="text-[10px] text-amber-300 font-normal">Yong'inga chidamli FR/A2</span>
                        </label>
                        <span className="text-[11px] font-mono text-slate-400">
                          {new Intl.NumberFormat('uz-UZ').format(calcForm.materialPrices?.alyukabond_fireproof || 0)} so'm
                        </span>
                      </div>
                      <div className="relative">
                        <input
                          type="number"
                          value={calcForm.materialPrices?.alyukabond_fireproof || 0}
                          onChange={(e) => handleMaterialPriceChange('alyukabond_fireproof', e.target.value)}
                          className="w-full px-4 py-2.5 pr-20 rounded-xl bg-brand-dark/90 border border-white/15 text-white font-mono text-sm focus:outline-none focus:border-brand-red"
                        />
                        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">
                          so'm / m²
                        </span>
                      </div>
                    </div>

                    {/* Profnastil */}
                    <div className="p-3.5 rounded-xl bg-brand-dark/60 border border-white/5 hover:border-white/15 transition-all">
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span>Profnastil / Tom tunuka</span>
                          <span className="text-[10px] text-slate-400 font-normal">Tom va yengil naves</span>
                        </label>
                        <span className="text-[11px] font-mono text-slate-400">
                          {new Intl.NumberFormat('uz-UZ').format(calcForm.materialPrices?.profnastil || 0)} so'm
                        </span>
                      </div>
                      <div className="relative">
                        <input
                          type="number"
                          value={calcForm.materialPrices?.profnastil || 0}
                          onChange={(e) => handleMaterialPriceChange('profnastil', e.target.value)}
                          className="w-full px-4 py-2.5 pr-20 rounded-xl bg-brand-dark/90 border border-white/15 text-white font-mono text-sm focus:outline-none focus:border-brand-red"
                        />
                        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">
                          so'm / m²
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. MONTAJ & O'RNATISH NARXLARI */}
                <div className="glass-card rounded-2xl p-5 border border-white/10 bg-brand-surface/70 space-y-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
                      <div>
                        <h3 className="font-display font-bold text-lg text-white flex items-center gap-2">
                          <Hammer className="w-4 h-4 text-brand-red" />
                          <span>2. Montaj & O'rnatish narxi (1 m² uchun)</span>
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Bino toifasiga qarab ustalarning o'rnatish xizmati haqi (so'mda)
                        </p>
                      </div>
                      <span className="text-[11px] font-mono text-sky-400 bg-sky-500/10 px-2.5 py-1 rounded-full border border-sky-500/20">
                        4 ta toifa
                      </span>
                    </div>

                    <div className="space-y-3.5">
                      {/* Hovli / Kottedj */}
                      <div className="p-3.5 rounded-xl bg-brand-dark/60 border border-white/5 hover:border-white/15 transition-all">
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-xs font-bold text-white flex items-center gap-1.5">
                            <span>Hovli va Kottedj fasadi</span>
                            <span className="text-[10px] text-slate-400 font-normal">Turar-joy uylari</span>
                          </label>
                          <span className="text-[11px] font-mono text-slate-400">
                            {new Intl.NumberFormat('uz-UZ').format(calcForm.installationRates?.cottage || 0)} so'm
                          </span>
                        </div>
                        <div className="relative">
                          <input
                            type="number"
                            value={calcForm.installationRates?.cottage || 0}
                            onChange={(e) => handleInstallRateChange('cottage', e.target.value)}
                            className="w-full px-4 py-2.5 pr-20 rounded-xl bg-brand-dark/90 border border-white/15 text-white font-mono text-sm focus:outline-none focus:border-brand-red"
                          />
                          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">
                            so'm / m²
                          </span>
                        </div>
                      </div>

                      {/* Savdo markazi / Ofis */}
                      <div className="p-3.5 rounded-xl bg-brand-dark/60 border border-white/5 hover:border-white/15 transition-all">
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-xs font-bold text-white flex items-center gap-1.5">
                            <span>Savdo markazi va Ofis binolari</span>
                            <span className="text-[10px] text-slate-400 font-normal">Baland tijoriy bino</span>
                          </label>
                          <span className="text-[11px] font-mono text-slate-400">
                            {new Intl.NumberFormat('uz-UZ').format(calcForm.installationRates?.commercial || 0)} so'm
                          </span>
                        </div>
                        <div className="relative">
                          <input
                            type="number"
                            value={calcForm.installationRates?.commercial || 0}
                            onChange={(e) => handleInstallRateChange('commercial', e.target.value)}
                            className="w-full px-4 py-2.5 pr-20 rounded-xl bg-brand-dark/90 border border-white/15 text-white font-mono text-sm focus:outline-none focus:border-brand-red"
                          />
                          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">
                            so'm / m²
                          </span>
                        </div>
                      </div>

                      {/* Karniz / Shift */}
                      <div className="p-3.5 rounded-xl bg-brand-dark/60 border border-white/5 hover:border-white/15 transition-all">
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-xs font-bold text-white flex items-center gap-1.5">
                            <span>Karniz, Shift va Koziryok</span>
                            <span className="text-[10px] text-slate-400 font-normal">Podshivka, karniz</span>
                          </label>
                          <span className="text-[11px] font-mono text-slate-400">
                            {new Intl.NumberFormat('uz-UZ').format(calcForm.installationRates?.cornice || 0)} so'm
                          </span>
                        </div>
                        <div className="relative">
                          <input
                            type="number"
                            value={calcForm.installationRates?.cornice || 0}
                            onChange={(e) => handleInstallRateChange('cornice', e.target.value)}
                            className="w-full px-4 py-2.5 pr-20 rounded-xl bg-brand-dark/90 border border-white/15 text-white font-mono text-sm focus:outline-none focus:border-brand-red"
                          />
                          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">
                            so'm / m²
                          </span>
                        </div>
                      </div>

                      {/* Naves / Tom */}
                      <div className="p-3.5 rounded-xl bg-brand-dark/60 border border-white/5 hover:border-white/15 transition-all">
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-xs font-bold text-white flex items-center gap-1.5">
                            <span>Naves va Tom qismi</span>
                            <span className="text-[10px] text-slate-400 font-normal">Karkas usti yopish</span>
                          </label>
                          <span className="text-[11px] font-mono text-slate-400">
                            {new Intl.NumberFormat('uz-UZ').format(calcForm.installationRates?.roof || 0)} so'm
                          </span>
                        </div>
                        <div className="relative">
                          <input
                            type="number"
                            value={calcForm.installationRates?.roof || 0}
                            onChange={(e) => handleInstallRateChange('roof', e.target.value)}
                            className="w-full px-4 py-2.5 pr-20 rounded-xl bg-brand-dark/90 border border-white/15 text-white font-mono text-sm focus:outline-none focus:border-brand-red"
                          />
                          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">
                            so'm / m²
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 p-3.5 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-400">
                    <span className="text-slate-300 font-bold block mb-1">💡 Eslatma:</span>
                    Agar mijoz hisoblagichda "Faqat material (o'rnatishsiz)" ni tanlasa, montaj narxi 0 so'm deb olinadi.
                  </div>
                </div>
              </div>

              {/* 3. JONLI SINOV & FORMULA TEKSHIRUV PANEL (Live Preview) */}
              <div className="glass-card rounded-2xl p-5 sm:p-6 border border-brand-red/20 bg-brand-surface/70 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-brand-red/20 text-brand-red flex items-center justify-center font-bold">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-base sm:text-lg text-white">
                        Jonli Hisob Sinovi (Real-time Smeta Preview)
                      </h3>
                      <p className="text-xs text-slate-400">
                        Yuqoridagi narxlar asosida mijozga ko'rinadigan natijani darhol tekshiring
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 font-bold">
                    Faol formula
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      Sinov materiali
                    </label>
                    <select
                      value={previewMat}
                      onChange={(e) => setPreviewMat(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-brand-dark/90 border border-white/15 text-white text-xs sm:text-sm focus:outline-none focus:border-brand-red"
                    >
                      <option value="tunikabond_standard">Tunikabond Standart (0.40 mm)</option>
                      <option value="tunikabond_premium">Tunikabond Premium (0.45 mm)</option>
                      <option value="alyukabond_standard">Alyukabond Standart (3 mm)</option>
                      <option value="alyukabond_fireproof">Alyukabond A2 Olovbardosh (4 mm)</option>
                      <option value="profnastil">Profnastil / Tom tunuka</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      Sinov bino toifasi
                    </label>
                    <select
                      value={previewInstall}
                      onChange={(e) => setPreviewInstall(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-brand-dark/90 border border-white/15 text-white text-xs sm:text-sm focus:outline-none focus:border-brand-red"
                    >
                      <option value="cottage">Hovli va Kottedj</option>
                      <option value="commercial">Savdo markazi / Ofis</option>
                      <option value="cornice">Karniz va Shift</option>
                      <option value="roof">Naves va Tom</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                      Maydon hajmi: {previewArea} m²
                    </label>
                    <input
                      type="range"
                      min={10}
                      max={500}
                      step={5}
                      value={previewArea}
                      onChange={(e) => setPreviewArea(Number(e.target.value))}
                      className="w-full h-2 bg-brand-dark rounded-lg appearance-none cursor-pointer accent-brand-red mt-3"
                    />
                  </div>
                </div>

                {/* Calculation formula breakdown */}
                {(() => {
                  const mPrice = Number(calcForm.materialPrices?.[previewMat] || 0);
                  const iPrice = Number(calcForm.installationRates?.[previewInstall] || 0);
                  const perSqm = mPrice + iPrice;
                  const grandTotal = perSqm * previewArea;

                  return (
                    <div className="p-4 rounded-xl bg-brand-dark/80 border border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                      <div className="p-2 rounded-lg bg-white/5">
                        <span className="text-[11px] text-slate-400 block mb-0.5">Material (1 m²)</span>
                        <span className="font-mono font-bold text-white text-sm sm:text-base">
                          {new Intl.NumberFormat('uz-UZ').format(mPrice)} so'm
                        </span>
                      </div>

                      <div className="p-2 rounded-lg bg-white/5">
                        <span className="text-[11px] text-slate-400 block mb-0.5">Montaj (1 m²)</span>
                        <span className="font-mono font-bold text-white text-sm sm:text-base">
                          {new Intl.NumberFormat('uz-UZ').format(iPrice)} so'm
                        </span>
                      </div>

                      <div className="p-2 rounded-lg bg-white/5">
                        <span className="text-[11px] text-slate-400 block mb-0.5">Jami 1 m² narxi</span>
                        <span className="font-mono font-bold text-amber-300 text-sm sm:text-base">
                          {new Intl.NumberFormat('uz-UZ').format(perSqm)} so'm
                        </span>
                      </div>

                      <div className="p-2 rounded-lg bg-brand-red/20 border border-brand-red/30">
                        <span className="text-[11px] text-red-200 block mb-0.5">Jami smeta ({previewArea} m²)</span>
                        <span className="font-mono font-black text-white text-sm sm:text-base">
                          {new Intl.NumberFormat('uz-UZ').format(grandTotal)} so'm
                        </span>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Bottom Save Action Bar */}
              <div className="p-4 rounded-2xl bg-brand-surface/90 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 sticky bottom-4 shadow-2xl backdrop-blur-xl">
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Narxlarni o'zgartirgach, saqlash tugmasini bosing. Mijozlar yangi narxlarni ko'radi.</span>
                </div>

                <div className="flex items-center gap-2.5 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={handleResetCalcSettings}
                    disabled={calcSaving}
                    className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 hover:text-white text-xs font-bold transition-all border border-white/10"
                  >
                    Standartga qaytarish
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveCalcSettings}
                    disabled={calcSaving}
                    className="flex-1 sm:flex-initial px-6 py-2.5 rounded-xl bg-gradient-to-r from-brand-red via-brand-red to-brand-redHover hover:scale-105 active:scale-95 text-white text-xs sm:text-sm font-bold shadow-glow-red flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                  >
                    {calcSaving ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    <span>{calcSaving ? "Saqlanmoqda..." : "Narxlarni saqlash"}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

        </main>

        {/* Mobile Bottom Navigation Bar (Visible on mobile/tablet screens only) */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-brand-surface/95 backdrop-blur-xl border-t border-white/10 px-1 py-1.5 flex items-center justify-between shadow-2xl safe-area-bottom overflow-x-auto no-scrollbar">
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
            onClick={() => setActiveTab('calculator')}
            className={`flex-1 min-w-[42px] flex flex-col items-center gap-0.5 py-1 px-0.5 rounded-xl transition-all ${
              activeTab === 'calculator' ? 'text-brand-red font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <CalculatorIcon className="w-5 h-5" />
            <span className="text-[10px] truncate w-full text-center">Narxlar</span>
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

    </div>
  );
};
