import React, { useState, useEffect } from 'react';
import { translations } from './data/translations';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Calculator } from './components/Calculator';
import { Products } from './components/Products';
import { ColorSwatches } from './components/ColorSwatches';
import { Portfolio } from './components/Portfolio';
import { WhyUs } from './components/WhyUs';
import { Process } from './components/Process';
import { FAQ } from './components/FAQ';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { ProductModal } from './components/ProductModal';
import { LeadModal } from './components/LeadModal';
import { QuickActions } from './components/QuickActions';
import { TrustAndReviews } from './components/TrustAndReviews';
import { TeamSection } from './components/TeamSection';
import { BrandIntro } from './components/BrandIntro';
import { HomeNavigationBento } from './components/HomeNavigationBento';
import { PageBanner } from './components/PageBanner';
import { AdminAuthModal } from './components/admin/AdminAuthModal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { getStoredUser, clearAuthSession, apiGetProducts, apiGetPortfolio, apiGetTeam, apiGetCalcSettings, DEFAULT_CALC_SETTINGS, apiGetSwatches } from './services/api';

const VALID_PAGES = ['home', 'calculator', 'products', 'portfolio', 'about', 'contact'];

export function App() {
  const getPageFromHash = () => {
    const hash = window.location.hash.replace('#', '').toLowerCase();
    if (hash === 'admin') {
      window.location.href = '/admin.html';
      return 'home';
    }
    if (VALID_PAGES.includes(hash)) return hash;
    return 'home';
  };

  const [currentPage, setCurrentPage] = useState(getPageFromHash);

  const navigateToPage = (pageId) => {
    if (VALID_PAGES.includes(pageId)) {
      setCurrentPage(pageId);
      window.location.hash = pageId;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '').toLowerCase();
      if (hash === 'admin') {
        window.location.href = '/admin.html';
        return;
      }
      const page = getPageFromHash();
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const [currentLang, setCurrentLang] = useState(() => {
    return localStorage.getItem('tl_lang') || 'uz';
  });

  // Day & Night mode — uses Tailwind's standard darkMode: 'class'
  // dark class present = dark mode; no dark class = light mode
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('tl_theme');
    return saved || 'dark'; // default dark
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light'); // keep for our CSS overrides
    }
    localStorage.setItem('tl_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Splash Brand Intro animation on site load & refresh
  const [showBrandIntro, setShowBrandIntro] = useState(true);

  // Dynamic products, portfolio, team, swatches & calculator state from CMS
  const [productsList, setProductsList] = useState([]);
  const [portfolioList, setPortfolioList] = useState([]);
  const [teamList, setTeamList] = useState([]);
  const [swatchesList, setSwatchesList] = useState([]);
  const [calcSettings, setCalcSettings] = useState(DEFAULT_CALC_SETTINGS);

  // Modals state
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [leadModalOpen, setLeadModalOpen] = useState(false);
  const [leadModalData, setLeadModalData] = useState(null);
  const [activeMasterId, setActiveMasterId] = useState(null);

  // Admin CMS state
  const [currentUser, setCurrentUser] = useState(() => getStoredUser());
  const [adminAuthModalOpen, setAdminAuthModalOpen] = useState(false);
  const [adminDashboardOpen, setAdminDashboardOpen] = useState(false);

  const t = translations[currentLang] || translations.uz;

  const handleLangChange = (newLang) => {
    setCurrentLang(newLang);
    localStorage.setItem('tl_lang', newLang);
    document.documentElement.lang = newLang;
  };

  useEffect(() => {
    document.documentElement.lang = currentLang;
  }, [currentLang]);

  // Fetch dynamic products, portfolio, team members, swatches and calculator pricing
  const loadDynamicData = async () => {
    const [prods, ports, teams, cSettings, swt] = await Promise.all([
      apiGetProducts(),
      apiGetPortfolio(),
      apiGetTeam(),
      apiGetCalcSettings(),
      apiGetSwatches()
    ]);
    setProductsList(prods);
    setPortfolioList(ports);
    setTeamList(teams);
    if (swt && Array.isArray(swt) && swt.length > 0) {
      setSwatchesList(swt);
    }
    if (cSettings && cSettings.materialPrices) {
      setCalcSettings(cSettings);
    }
  };

  useEffect(() => {
    loadDynamicData();
  }, []);

  // Admin handlers
  const handleOpenAdmin = () => {
    if (currentUser) {
      setAdminDashboardOpen(true);
    } else {
      setAdminAuthModalOpen(true);
    }
  };

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    setAdminDashboardOpen(true);
  };

  const handleLogout = () => {
    clearAuthSession();
    setCurrentUser(null);
    setAdminDashboardOpen(false);
  };

  // Modals handlers
  const handleOpenLeadModal = (serviceName = "Bepul o'lchash va konsultatsiya") => {
    setLeadModalData({ service: serviceName, source: "Tezkor tugma" });
    setLeadModalOpen(true);
  };

  const handleOpenCalcModal = (calcData) => {
    setLeadModalData({
      service: `Kalkulyator buyurtmasi (${calcData.buildingType}, ${calcData.area} m²)`,
      calcData: calcData,
      source: "Kalkulyator hisoblagich"
    });
    setLeadModalOpen(true);
  };

  const handleOpenSwatchModal = (swatchName) => {
    setLeadModalData({
      service: `Rang namunasi: ${swatchName}`,
      source: "Ranglar va teksturalar palitrasi"
    });
    setLeadModalOpen(true);
  };

  const handleOpenProductOrder = (productName) => {
    setLeadModalData({
      service: `Mahsulot buyurtmasi: ${productName}`,
      source: "Mahsulotlar katalogi"
    });
    setLeadModalOpen(true);
  };

  const handleOpenMasterModal = (masterName) => {
    setLeadModalData({
      service: `Usta chaqirish: ${masterName} (Bepul o'lchov)`,
      source: "Bizning Jamoa & Ustalar"
    });
    setLeadModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-brand-dark text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-brand-red selection:text-white">
      
      {/* Brand Intro & Splash Screen Animation on Site Load & Refresh */}
      {showBrandIntro && (
        <BrandIntro onComplete={() => setShowBrandIntro(false)} />
      )}

      {/* Navigation Header */}
      <Navbar
        currentLang={currentLang}
        setLang={handleLangChange}
        t={t}
        onOpenLeadModal={handleOpenLeadModal}
        currentUser={currentUser}
        onOpenAdmin={handleOpenAdmin}
        theme={theme}
        toggleTheme={toggleTheme}
        currentPage={currentPage}
        onNavigate={navigateToPage}
      />

      {/* Main Content Sections */}
      <main className="flex-grow">
        
        {/* ═══ 1. BOSH SAHIFA (HOME) ═══ */}
        {currentPage === 'home' && (
          <div className="animate-fadeIn">
            {/* Hero Section */}
            <Hero
              t={t}
              onOpenLeadModal={handleOpenLeadModal}
              onNavigate={navigateToPage}
            />

            {/* Quick Navigation Hub / Bento */}
            <HomeNavigationBento
              t={t}
              onNavigate={navigateToPage}
            />

            {/* Why Choose Us */}
            <WhyUs
              t={t}
            />

            {/* Warranty & Reviews */}
            <TrustAndReviews
              onOpenLeadModal={handleOpenLeadModal}
            />

            {/* Contact / Location */}
            <ContactSection
              t={t}
            />
          </div>
        )}

        {/* ═══ 2. KALKULYATOR PAGE ═══ */}
        {currentPage === 'calculator' && (
          <div className="animate-fadeIn">
            <PageBanner
              title="Fasad va Tom Narxini Hisoblang"
              subtitle="Bino parametrlari va kerakli materialni tanlang. Tizim taxminiy xarajat va muddatni bir zumda hisoblab beradi."
              badge="Interaktiv hisoblagich"
              breadcrumb="Kalkulyator"
              onBackToHome={() => navigateToPage('home')}
            />
            <Calculator
              t={t}
              onOpenLeadModalWithCalc={handleOpenCalcModal}
              calcSettings={calcSettings}
            />
            <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-20 text-center">
              <div className="p-6 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-brand-surface/40 shadow-sm">
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                  Hisoblagich natijalari taxminiy xarakterga ega. Mutaxassisimiz obyektga borib bepul aniq o'lchov olganidan so'ng, smeta va shartnoma tuziladi.
                </p>
                <button
                  type="button"
                  onClick={() => handleOpenLeadModal("Bepul usta o'lchovi va smeta")}
                  className="mt-4 px-6 py-2.5 rounded-xl bg-brand-red text-white text-xs sm:text-sm font-bold shadow-glow-red hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  Bepul mutaxassis chaqirish
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ═══ 3. MAHSULOTLAR VA KATALOG PAGE ═══ */}
        {currentPage === 'products' && (
          <div className="animate-fadeIn">
            <PageBanner
              title="Mahsulotlar Katalogi va Ranglar"
              subtitle="Rossiya va Xitoyning sertifikatlangan Tunikabond, Alyukabond panellari, naves va karnizlar palitrasi."
              badge="Katalog & Ranglar"
              breadcrumb="Katalog"
              onBackToHome={() => navigateToPage('home')}
            />
            <Products
              currentLang={currentLang}
              t={t}
              items={productsList}
              onSelectProduct={setSelectedProduct}
            />
            <ColorSwatches
              currentLang={currentLang}
              t={t}
              onOpenLeadModalWithSwatch={handleOpenSwatchModal}
              swatchesList={swatchesList}
            />
          </div>
        )}

        {/* ═══ 4. LOYIHALAR VA USTARLAR PAGE ═══ */}
        {currentPage === 'portfolio' && (
          <div className="animate-fadeIn">
            <PageBanner
              title="Bajarilgan Loyihalar va Professional Ustalar"
              subtitle="2000+ muvaffaqiyatli topshirilgan kottedj, savdo binosi va shaxsiy xonadonlar fasadlari hamda tajribali ustalar jamoasi."
              badge="Loyihalar & Ustalar"
              breadcrumb="Loyihalar"
              onBackToHome={() => navigateToPage('home')}
            />
            <Portfolio
              currentLang={currentLang}
              t={t}
              items={portfolioList}
              onSelectMaster={(masterIdOrName) => {
                setActiveMasterId(masterIdOrName);
                const teamEl = document.getElementById('team');
                if (teamEl) {
                  teamEl.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            />
            <TeamSection
              t={t}
              teamMembers={teamList}
              portfolioList={portfolioList}
              activeMasterId={activeMasterId}
              onOpenLeadModalWithMaster={handleOpenMasterModal}
            />
          </div>
        )}

        {/* ═══ 5. BIZ HAQIMIZDA & FAQ PAGE ═══ */}
        {currentPage === 'about' && (
          <div className="animate-fadeIn">
            <PageBanner
              title="Biz Haqimizda & 10 Yil Rasmiy Kafolat"
              subtitle="Tunikabond Lider — O'zbekiston bo'ylab 6 yildan ortiq vaqt davomida yuqori sifatli fasad va tom yechimlarini yetkazib beruvchi yetakchi kompaniya."
              badge="Biz haqimizda"
              breadcrumb="Biz haqimizda"
              onBackToHome={() => navigateToPage('home')}
            />
            <WhyUs
              t={t}
            />
            <TrustAndReviews
              onOpenLeadModal={handleOpenLeadModal}
            />
            <Process
              t={t}
            />
            <FAQ
              currentLang={currentLang}
              t={t}
            />
          </div>
        )}

        {/* ═══ 6. ALOQA & USTAXONA PAGE ═══ */}
        {currentPage === 'contact' && (
          <div className="animate-fadeIn">
            <PageBanner
              title="Bog'lanish & Ustaxona Manzili"
              subtitle="Siz uchun to'xtovsiz xizmatdamiz! Savollaringiz bormi yoki bepul o'lchov kerakmi? Istalgan vaqtda murojaat qiling."
              badge="24/7 Aloqa"
              breadcrumb="Aloqa"
              onBackToHome={() => navigateToPage('home')}
            />
            <ContactSection
              t={t}
            />
          </div>
        )}

      </main>

      {/* Footer */}
      <Footer
        t={t}
        onNavigate={navigateToPage}
      />

      {/* Product Detail Modal */}
      <ProductModal
        product={selectedProduct}
        currentLang={currentLang}
        onClose={() => setSelectedProduct(null)}
        onOrderProduct={handleOpenProductOrder}
      />

      {/* Lead / Order Modal */}
      <LeadModal
        isOpen={leadModalOpen}
        onClose={() => setLeadModalOpen(false)}
        initialData={leadModalData}
        t={t}
      />

      {/* Floating Call & Telegram Quick Action Buttons */}
      <QuickActions
        onOpenLeadModal={handleOpenLeadModal}
      />

      {/* Admin Auth Modal (Login / Register) */}
      <AdminAuthModal
        isOpen={adminAuthModalOpen}
        onClose={() => setAdminAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Admin CMS Dashboard */}
      {adminDashboardOpen && (
        <AdminDashboard
          currentUser={currentUser}
          onLogout={handleLogout}
          onClose={() => setAdminDashboardOpen(false)}
          onDataChanged={loadDynamicData}
          calcSettings={calcSettings}
          onCalcSettingsChanged={(newSettings) => setCalcSettings(newSettings)}
          swatchesList={swatchesList}
        />
      )}

    </div>
  );
}
