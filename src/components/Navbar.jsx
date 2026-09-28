import React, { useState, useEffect } from 'react';
import { Phone, Menu, X, Calculator, Layers, Info, HelpCircle, Lock, Shield, Sun, Moon, Home, Compass } from 'lucide-react';

export const Navbar = ({ 
  currentLang, 
  setLang, 
  t, 
  onOpenLeadModal, 
  currentUser, 
  onOpenAdmin, 
  theme, 
  toggleTheme,
  currentPage = 'home',
  onNavigate
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { id: 'home',       label: t.nav.home || "Bosh sahifa",       icon: Home },
    { id: 'calculator', label: t.nav.calculator || "Kalkulyator", icon: Calculator },
    { id: 'products',   label: t.nav.products || "Katalog",       icon: Layers },
    { id: 'portfolio',  label: t.nav.portfolio || "Loyihalar",    icon: Compass },
    { id: 'about',      label: t.nav.about || "Biz haqimizda",    icon: Info },
    { id: 'contact',    label: t.nav.contact || "Aloqa",          icon: Phone },
  ];

  const isLight = theme === 'light';

  const handleLinkClick = (pageId) => {
    setMobileMenuOpen(false);
    if (onNavigate) {
      onNavigate(pageId);
    }
  };

  return (
    <header className="fixed top-3 sm:top-4 left-0 right-0 z-50 px-3 sm:px-5 pointer-events-none">
      <div className="max-w-[1150px] mx-auto pointer-events-auto flex flex-col gap-2">

        {/* ══ PILL BAR ══ */}
        <div
          className={`w-full rounded-2xl overflow-hidden transition-all duration-300 ${
            isLight
              ? isScrolled
                ? 'bg-white border border-slate-200 shadow-xl shadow-slate-900/10'
                : 'bg-white/95 backdrop-blur-xl border border-black/8 shadow-md'
              : isScrolled
                ? 'bg-[#0d1120] border border-white/15 shadow-2xl shadow-black/80'
                : 'bg-[#0d1120]/90 backdrop-blur-xl border border-white/10 shadow-xl shadow-black/40'
          }`}
        >
          <div className="flex items-center h-14 px-4 sm:px-5 gap-3">

            {/* ── Logo ── */}
            <button
              type="button"
              onClick={() => handleLinkClick('home')}
              className="flex items-center gap-2 group shrink-0 text-left cursor-pointer"
            >
              <div className={`w-8 h-8 rounded-lg border border-brand-red/50 p-1 flex items-center justify-center group-hover:border-brand-red transition-all ${isLight ? 'bg-black/5' : 'bg-white/8'}`}>
                <img src="/favi.svg" alt="Logo" className="w-full h-full object-contain" />
              </div>
              <div className="leading-none">
                <span className={`block font-display font-extrabold text-sm tracking-wide whitespace-nowrap group-hover:text-brand-red transition-colors ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  TUNIKABOND <span className="text-brand-red">LIDER</span>
                </span>
                <span className={`hidden xl:block text-[9px] uppercase tracking-[0.15em] font-medium mt-0.5 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                  Fasad &amp; Tom
                </span>
              </div>
            </button>

            {/* ── Desktop nav ── */}
            <nav className="hidden lg:flex items-center gap-1 mx-auto">
              {navLinks.map((link) => {
                const isActive = currentPage === link.id;
                return (
                  <button
                    key={link.id}
                    type="button"
                    onClick={() => handleLinkClick(link.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      isActive
                        ? 'bg-brand-red text-white shadow-glow-red font-bold'
                        : isLight 
                          ? 'text-slate-800 hover:text-brand-red hover:bg-black/5' 
                          : 'text-slate-200 hover:text-brand-red hover:bg-white/10'
                    }`}
                  >
                    {link.label}
                  </button>
                );
              })}
            </nav>

            {/* Spacer for md/lg (no nav shown) */}
            <div className="hidden md:flex xl:hidden flex-1" />

            {/* ── Desktop right controls ── */}
            <div className="hidden md:flex items-center gap-1.5 shrink-0 ml-auto xl:ml-0">

              {/* Language */}
              <div className={`flex items-center rounded-lg p-0.5 border text-[11px] font-bold ${isLight ? 'bg-black/5 border-slate-200' : 'bg-white/10 border-white/15'}`}>
                {['uz', 'ru', 'en'].map((lng) => (
                  <button
                    key={lng}
                    onClick={() => setLang(lng)}
                    className={`px-2 py-1 rounded-md transition-all uppercase ${
                      currentLang === lng
                        ? 'bg-brand-red text-white'
                        : isLight ? 'text-slate-700 hover:text-slate-900' : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    {lng}
                  </button>
                ))}
              </div>

              {/* Theme */}
              <button
                type="button"
                onClick={toggleTheme}
                className={`p-1.5 rounded-lg border transition-all hover:border-brand-red/50 active:scale-95 ${
                  isLight ? 'bg-black/5 border-slate-200 text-slate-800' : 'bg-white/10 border-white/15 text-slate-200'
                }`}
                title={isLight ? "Tungi rejim" : "Kunduzgi rejim"}
              >
                {isLight ? <Moon className="w-3.5 h-3.5 text-indigo-500" /> : <Sun className="w-3.5 h-3.5 text-amber-400" />}
              </button>

              {/* CTA */}
              <button
                onClick={() => onOpenLeadModal(t.nav.requestMeasurement)}
                className="px-3 py-1.5 text-xs font-bold text-white rounded-lg bg-gradient-to-r from-brand-red to-brand-redHover hover:shadow-glow-red hover:scale-105 active:scale-95 transition-all whitespace-nowrap"
              >
                {t.nav.requestMeasurement}
              </button>
            </div>

            {/* ── Mobile right controls ── */}
            <div className="flex md:hidden items-center gap-1.5 ml-auto">
              <button
                type="button"
                onClick={toggleTheme}
                className={`p-2 rounded-xl border active:scale-95 transition-all ${isLight ? 'bg-black/5 border-slate-200 text-slate-800' : 'bg-white/10 border-white/15 text-slate-200'}`}
                aria-label="Kun/Tun"
              >
                {isLight ? <Moon className="w-4 h-4 text-indigo-500" /> : <Sun className="w-4 h-4 text-amber-400" />}
              </button>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={`p-2 rounded-xl border active:scale-95 transition-all hover:text-brand-red ${isLight ? 'bg-black/5 border-slate-200 text-slate-800' : 'bg-white/10 border-white/15 text-slate-200'}`}
                aria-label="Menyu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5 text-brand-red" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>

          </div>{/* end h-14 row */}
        </div>{/* end PILL */}

        {/* ══ MOBILE DRAWER ══ */}
        {mobileMenuOpen && (
          <div className={`md:hidden rounded-2xl border-2 shadow-2xl px-4 pt-3.5 pb-4 animate-slideDown ${
            isLight ? 'bg-white border-slate-300 shadow-2xl text-slate-900' : 'bg-[#0c1122] border-white/20 shadow-2xl text-white'
          }`}>

            {/* Language */}
            <div className={`flex items-center justify-between px-3 py-2 rounded-xl border mb-3 ${isLight ? 'bg-slate-100 border-slate-200' : 'bg-white/5 border-white/10'}`}>
              <span className={`text-xs font-bold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Tilni tanlang:</span>
              <div className={`flex rounded-lg p-0.5 border text-xs font-bold ${isLight ? 'bg-white border-slate-200' : 'bg-white/8 border-white/10'}`}>
                {['uz', 'ru', 'en'].map((lng) => (
                  <button key={lng} onClick={() => setLang(lng)}
                    className={`px-3 py-1 rounded uppercase transition-all ${currentLang === lng ? 'bg-brand-red text-white' : isLight ? 'text-slate-700 hover:text-slate-900' : 'text-slate-400 hover:text-white'}`}
                  >{lng}</button>
                ))}
              </div>
            </div>

            {/* Nav links */}
            <div className="grid grid-cols-2 gap-2">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = currentPage === link.id;
                return (
                  <button
                    key={link.id}
                    type="button"
                    onClick={() => handleLinkClick(link.id)}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all text-left border shadow-sm ${
                      isActive
                        ? 'bg-brand-red text-white border-brand-red shadow-glow-red'
                        : isLight
                          ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-900'
                          : 'bg-[#151c30] hover:bg-[#1d2642] border-white/10 text-white'
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : isLight
                          ? 'bg-white text-brand-red shadow-sm'
                          : 'bg-white/10 text-brand-red'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="truncate">{link.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Actions */}
            <div className={`mt-3 pt-3 border-t flex flex-col gap-2 ${isLight ? 'border-slate-200' : 'border-white/10'}`}>
              <button
                onClick={() => { setMobileMenuOpen(false); onOpenLeadModal(t.nav.requestMeasurement); }}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-red to-brand-redHover text-white font-bold text-sm shadow-glow-red"
              >
                {t.nav.requestMeasurement}
              </button>
            </div>
          </div>
        )}

      </div>
    </header>
  );
};
