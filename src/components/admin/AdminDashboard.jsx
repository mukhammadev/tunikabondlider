import React, { useState, useEffect } from 'react';
import { 
  apiGetStats, apiGetLeads, apiUpdateLead, apiDeleteLead,
  apiGetProducts, apiCreateProduct, apiUpdateProduct, apiDeleteProduct,
  apiGetPortfolio, apiCreatePortfolio, apiUpdatePortfolio, apiDeletePortfolio,
  apiGetTeam, apiCreateTeamMember, apiUpdateTeamMember, apiDeleteTeamMember,
  apiGetAdmins, apiRegister, apiUploadFile
} from '../../services/api';
import { 
  LayoutDashboard, Inbox, Package, Briefcase, Users, LogOut, 
  Plus, Trash2, Edit3, CheckCircle2, Clock, Phone, Send, X, 
  ExternalLink, Search, RefreshCw, Shield, AlertCircle,
  Upload, Download, FileText, Image as ImageIcon, Hammer, UserCheck
} from 'lucide-react';

export const AdminDashboard = ({ currentUser, onLogout, onClose, onDataChanged }) => {
  const [activeTab, setActiveTab] = useState('leads'); // stats | leads | products | portfolio | team | admins
  const [stats, setStats] = useState(null);
  const [leads, setLeads] = useState([]);
  const [productsList, setProductsList] = useState([]);
  const [portfolioList, setPortfolioList] = useState([]);
  const [teamList, setTeamList] = useState([]);
  const [adminsList, setAdminsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

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
    label: 'Naves Ustasi',
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

  // Load all initial data
  const loadData = async () => {
    setLoading(true);
    const [st, ld, pr, pf, ad, tm] = await Promise.all([
      apiGetStats(),
      apiGetLeads(),
      apiGetProducts(),
      apiGetPortfolio(),
      apiGetAdmins(),
      apiGetTeam()
    ]);
    setStats(st);
    setLeads(ld);
    setProductsList(pr);
    setPortfolioList(pf);
    setAdminsList(ad);
    setTeamList(tm);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // --- LEADS ACTIONS ---
  const handleLeadStatusChange = async (leadId, newStatus) => {
    await apiUpdateLead(leadId, { status: newStatus });
    setLeads(leads.map(l => l.id === leadId ? { ...l, status: newStatus } : l));
  };

  const handleDeleteLead = async (leadId) => {
    if (window.confirm("Haqiqatan ham ushbu arizani o'chirmoqchimisiz?")) {
      await apiDeleteLead(leadId);
      setLeads(leads.filter(l => l.id !== leadId));
    }
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
    if (onDataChanged) onDataChanged();
  };

  const handleDeleteProduct = async (prodId) => {
    if (window.confirm("Ushbu mahsulotni o'chirmoqchimisiz?")) {
      await apiDeleteProduct(prodId);
      setProductsList(productsList.filter(p => p.id !== prodId));
      if (onDataChanged) onDataChanged();
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
    if (onDataChanged) onDataChanged();
  };

  const handleDeletePortfolio = async (itemId) => {
    if (window.confirm("Ushbu loyihani o'chirmoqchimisiz?")) {
      await apiDeletePortfolio(itemId);
      setPortfolioList(portfolioList.filter(p => p.id !== itemId));
      if (onDataChanged) onDataChanged();
    }
  };

  // --- TEAM & MASTERS CRUD ---
  const handleOpenTeamCreate = () => {
    setEditingTeamMember(null);
    setTeamForm({
      name: '',
      role: 'Usta Mutaxassis — Zamonaviy Naveslar',
      label: 'Naves Ustasi',
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
      label: member.label || 'Naves Ustasi',
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
    if (onDataChanged) onDataChanged();
  };

  const handleDeleteTeamMember = async (memberId) => {
    if (window.confirm("Haqiqatan ham ushbu ustani o'chirmoqchimisiz?")) {
      await apiDeleteTeamMember(memberId);
      setTeamList(teamList.filter(m => m.id !== memberId));
      if (onDataChanged) onDataChanged();
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
      alert("Yangi admin muvaffaqiyatli qo'shildi!");
    } else {
      alert(res.error || "Xatolik yuz berdi");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-brand-dark/95 backdrop-blur-xl flex flex-col overflow-hidden text-slate-100 animate-fadeIn">
      
      {/* Top Navbar */}
      <div className="bg-brand-surface border-b border-white/10 px-6 py-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-red to-brand-redHover flex items-center justify-center shadow-glow-red text-white font-black text-xl">
            TL
          </div>
          <div>
            <h1 className="font-display font-black text-lg sm:text-xl text-white flex items-center gap-2">
              <span>Tunikabond Lider Boshqaruv Paneli</span>
              <span className="text-[10px] bg-brand-red text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                CMS v2.0
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Admin: <strong className="text-white">{currentUser?.fullName || currentUser?.username}</strong> ({currentUser?.role || 'Admin'})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
            title="Yangilash"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={onClose}
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Saytga qaytish</span>
          </button>

          <button
            onClick={onLogout}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-red/20 hover:bg-brand-red text-brand-red hover:text-white text-xs font-bold transition-all border border-brand-red/40"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Chiqish</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Sidebar Tabs */}
        <aside className="w-56 sm:w-64 bg-brand-surface/70 border-r border-white/10 p-4 flex flex-col justify-between flex-shrink-0">
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
              {leads.filter(l => l.status === 'new').length > 0 && (
                <span className="w-5 h-5 rounded-full bg-white text-brand-red text-[11px] font-black flex items-center justify-center">
                  {leads.filter(l => l.status === 'new').length}
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
        <main className="flex-1 p-6 overflow-y-auto bg-brand-dark/50">
          
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
                    Yangi arizalar: <strong className="text-brand-red font-bold">{leads.filter(l => l.status === 'new').length} ta</strong>
                  </span>
                  <a
                    href="/api/leads/export"
                    download
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm transition-all"
                    title="Barcha arizalarni Excel formatida yuklab olish"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Excel (.csv)</span>
                  </a>
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
                        lead.status === 'new' 
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
                              lead.status === 'new' 
                                ? 'bg-brand-red text-white' 
                                : lead.status === 'in_progress' 
                                ? 'bg-amber-500 text-black' 
                                : lead.status === 'completed'
                                ? 'bg-emerald-500 text-white'
                                : 'bg-slate-600 text-white'
                            }`}>
                              {lead.status === 'new' ? 'Yangi' : lead.status === 'in_progress' ? 'Jarayonda' : lead.status === 'completed' ? 'Bajarildi' : 'Bekor qilindi'}
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
            </div>
          )}

        </main>
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
                        const file = e.target.files[0];
                        if (file) {
                          setUploadingImage(true);
                          const res = await apiUploadFile(file);
                          setUploadingImage(false);
                          if (res.success) {
                            setProductForm(prev => ({ ...prev, image: res.url }));
                          } else {
                            alert(res.error || "Rasm yuklashda xatolik yuz berdi");
                          }
                        }
                      }}
                    />
                  </label>
                </div>
                {productForm.image && (
                  <div className="mt-2 flex items-center gap-2">
                    <img src={productForm.image} alt="Preview" className="w-10 h-10 object-cover rounded-lg border border-white/20" />
                    <span className="text-[11px] text-slate-400 truncate max-w-xs">{productForm.image}</span>
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
                        const file = e.target.files[0];
                        if (file) {
                          setUploadingImage(true);
                          const res = await apiUploadFile(file);
                          setUploadingImage(false);
                          if (res.success) {
                            setPortfolioForm(prev => ({ ...prev, image: res.url }));
                          } else {
                            alert(res.error || "Rasm yuklashda xatolik yuz berdi");
                          }
                        }
                      }}
                    />
                  </label>
                </div>
                {portfolioForm.image && (
                  <div className="mt-2 flex items-center gap-2">
                    <img src={portfolioForm.image} alt="Preview" className="w-10 h-10 object-cover rounded-lg border border-white/20" />
                    <span className="text-[11px] text-slate-400 truncate max-w-xs">{portfolioForm.image}</span>
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
                    className="w-full px-3 py-2.5 rounded-xl bg-brand-dark/80 border border-white/15 text-white text-sm focus:outline-none focus:border-brand-red"
                  >
                    <option value="Naves Ustasi">Naves Ustasi</option>
                    <option value="Darvozaxona Ustasi">Darvozaxona Ustasi</option>
                    <option value="Koziryok Ustasi">Koziryok Ustasi</option>
                    <option value="Bosh Usta">Bosh Usta</option>
                    <option value="Firma Boshlig'i">Firma Boshlig'i</option>
                    <option value="Boshliq Yordamchisi">Boshliq Yordamchisi</option>
                    <option value="Fasad & Alyukabond">Fasad & Alyukabond</option>
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
                        const file = e.target.files[0];
                        if (file) {
                          setUploadingImage(true);
                          const res = await apiUploadFile(file);
                          setUploadingImage(false);
                          if (res.success) {
                            setTeamForm(prev => ({ ...prev, photo: res.url }));
                          } else {
                            alert(res.error || "Rasm yuklashda xatolik yuz berdi");
                          }
                        }
                      }}
                    />
                  </label>
                </div>
                {teamForm.photo && (
                  <div className="mt-2 flex items-center gap-2">
                    <img src={teamForm.photo} alt="Preview" className="w-10 h-10 object-cover rounded-lg border border-white/20" />
                    <span className="text-[11px] text-slate-400 truncate max-w-xs">{teamForm.photo}</span>
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

    </div>
  );
};
