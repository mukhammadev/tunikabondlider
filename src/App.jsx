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
import { BeforeAfter } from './components/BeforeAfter';
import { TrustAndReviews } from './components/TrustAndReviews';
import { TeamSection } from './components/TeamSection';
import { BrandIntro } from './components/BrandIntro';
import { AdminAuthModal } from './components/admin/AdminAuthModal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { getStoredUser, clearAuthSession, apiGetProducts, apiGetPortfolio, apiGetTeam } from './services/api';

export function App() {
  const [currentLang, setCurrentLang] = useState(() => {
    return localStorage.getItem('tl_lang') || 'uz';
  });

  // Splash Brand Intro animation on site load & refresh
  const [showBrandIntro, setShowBrandIntro] = useState(true);

  // Dynamic products, portfolio & team state from CMS
  const [productsList, setProductsList] = useState([]);
  const [portfolioList, setPortfolioList] = useState([]);
  const [teamList, setTeamList] = useState([]);

  // Modals state
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [leadModalOpen, setLeadModalOpen] = useState(false);
  const [leadModalData, setLeadModalData] = useState(null);

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

  // Fetch dynamic products, portfolio and team members
  const loadDynamicData = async () => {
    const [prods, ports, teams] = await Promise.all([
      apiGetProducts(),
      apiGetPortfolio(),
      apiGetTeam()
    ]);
    setProductsList(prods);
    setPortfolioList(ports);
    setTeamList(teams);
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
    <div className="min-h-screen bg-brand-dark text-slate-100 flex flex-col font-sans selection:bg-brand-red selection:text-white">
      
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
      />

      {/* Main Content Sections */}
      <main className="flex-grow">
        
        {/* Hero Section */}
        <Hero
          t={t}
          onOpenLeadModal={handleOpenLeadModal}
        />

        {/* 1. Calculator (New Feature) */}
        <Calculator
          t={t}
          onOpenLeadModalWithCalc={handleOpenCalcModal}
        />

        {/* 2. Products Catalog (Dynamic CMS) */}
        <Products
          currentLang={currentLang}
          t={t}
          items={productsList}
          onSelectProduct={setSelectedProduct}
        />

        {/* 3. Color & Texture Swatches */}
        <ColorSwatches
          currentLang={currentLang}
          t={t}
          onOpenLeadModalWithSwatch={handleOpenSwatchModal}
        />

        {/* 4. Portfolio / Delivered Projects (Dynamic CMS) */}
        <Portfolio
          currentLang={currentLang}
          t={t}
          items={portfolioList}
        />

        {/* 4.1 Interactive Before & After Facade Slider */}
        <BeforeAfter
          onOpenLeadModal={handleOpenLeadModal}
        />

        {/* 4.2 Bizning Professional Jamoa & Ustalar (Naves, Darvozaxona, Koziryok, Fasad) */}
        <TeamSection
          t={t}
          teamMembers={teamList}
          onOpenLeadModalWithMaster={handleOpenMasterModal}
        />

        {/* 5. Why Choose Us (6 Pillars) */}
        <WhyUs
          t={t}
        />

        {/* 5.1 Official Warranty & Customer Reviews */}
        <TrustAndReviews
          onOpenLeadModal={handleOpenLeadModal}
        />

        {/* 6. Process / Workflow (4 Steps) */}
        <Process
          t={t}
        />

        {/* 7. FAQ Section */}
        <FAQ
          currentLang={currentLang}
          t={t}
        />

        {/* 8. Contact Section & Form */}
        <ContactSection
          t={t}
        />

      </main>

      {/* Footer */}
      <Footer
        t={t}
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
        />
      )}

    </div>
  );
}
