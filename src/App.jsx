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

export function App() {
  const [currentLang, setCurrentLang] = useState(() => {
    return localStorage.getItem('tl_lang') || 'uz';
  });

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [leadModalOpen, setLeadModalOpen] = useState(false);
  const [leadModalData, setLeadModalData] = useState(null);

  const t = translations[currentLang] || translations.uz;

  const handleLangChange = (newLang) => {
    setCurrentLang(newLang);
    localStorage.setItem('tl_lang', newLang);
    document.documentElement.lang = newLang;
  };

  useEffect(() => {
    document.documentElement.lang = currentLang;
  }, [currentLang]);

  // Handlers for modal triggers
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

  return (
    <div className="min-h-screen bg-brand-dark text-slate-100 flex flex-col font-sans selection:bg-brand-gold selection:text-brand-dark">
      
      {/* Navigation Header */}
      <Navbar
        currentLang={currentLang}
        setLang={handleLangChange}
        t={t}
        onOpenLeadModal={handleOpenLeadModal}
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

        {/* 2. Products Catalog */}
        <Products
          currentLang={currentLang}
          t={t}
          onSelectProduct={setSelectedProduct}
        />

        {/* 3. Color & Texture Swatches (New Feature) */}
        <ColorSwatches
          currentLang={currentLang}
          t={t}
          onOpenLeadModalWithSwatch={handleOpenSwatchModal}
        />

        {/* 4. Portfolio / Delivered Projects */}
        <Portfolio
          currentLang={currentLang}
          t={t}
        />

        {/* 5. Why Choose Us (6 Pillars) */}
        <WhyUs
          t={t}
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

    </div>
  );
}
