import React, { useState, useEffect } from 'react';
import { Phone, Menu, X, Calculator, Palette, Layers, Info, HelpCircle, Lock, Shield, Sun, Moon } from 'lucide-react';

export const Navbar = ({ currentLang, setLang, t, onOpenLeadModal, currentUser, onOpenAdmin, theme, toggleTheme }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: "#calculator", label: t.nav.calculator, icon: Calculator },
    { href: "#products", label: t.nav.products, icon: Layers },
    { href: "#swatches", label: t.nav.swatches, icon: Palette },
    { href: "#portfolio", label: t.nav.portfolio, icon: Layers },
    { href: "#why-us", label: t.nav.about, icon: Info },
    { href: "#faq", label: t.nav.faq, icon: HelpCircle },
    { href: "#contact", label: t.nav.contact, icon: Phone },
  ];

  return (
    <header className="fixed top-3 sm:top-4 left-0 right-0 z-40 px-3 sm:px-6 pointer-events-none transition-all duration-300">
      <div className={`max-w-7xl mx-auto rounded-2xl transition-all duration-300 pointer-events-auto relative overflow-hidden ${
        isScrolled 
          ? 'bg-brand-dark/95 backdrop-blur-xl border border-brand-red/40 shadow-2xl shadow-black/80 shadow-glow-red/20 py-2.5 px-4 sm:px-6' 
          : 'bg-brand-surface/80 backdrop-blur-lg border border-white/15 shadow-xl shadow-black/40 py-3 px-4 sm:px-6'
      }`}>
        {/* Subtle red ambient glow line along bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-brand-red to-transparent opacity-80" />

        <div className="flex items-center justify-between">
          
          {/* Brand Logo with Original Tunikabond Icon */}
          <a href="#" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-xl bg-white/5 border border-brand-red/40 p-1.5 flex items-center justify-center shadow-glow-red group-hover:scale-105 group-hover:border-brand-red transition-all">
              <img src="/favi.svg" alt="Tunikabond Lider" className="w-full h-full object-contain filter drop-shadow" />
            </div>
            <div>
              <span className="block font-display font-bold text-xl sm:text-2xl text-white tracking-tight leading-none group-hover:text-brand-red transition-colors">
                TUNIKABOND <span className="text-brand-red">LIDER</span>
              </span>
              <span className="block text-[10px] text-slate-400 uppercase tracking-widest font-medium mt-1">
                Fasad & Tom Yechimlari
              </span>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-semibold text-slate-300 hover:text-brand-red transition-colors hover:scale-105"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Right Controls: Phone + Admin + Language + CTA */}
          <div className="hidden md:flex items-center gap-3 xl:gap-4">
            
            {/* Admin entry point */}
            {currentUser ? (
              <button
                onClick={onOpenAdmin}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-red text-white text-xs font-bold shadow-glow-red hover:scale-105 transition-all"
                title="Boshqaruv paneli"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>CMS Panel</span>
              </button>
            ) : (
              <button
                onClick={onOpenAdmin}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                title="Admin sifatida kirish"
              >
                <Lock className="w-4 h-4" />
              </button>
            )}

            {/* Language Switcher */}
            <div className="flex items-center bg-brand-surface rounded-lg p-1 border border-white/10 text-xs font-bold">
              {['uz', 'ru', 'en'].map((lng) => (
                <button
                  key={lng}
                  onClick={() => setLang(lng)}
                  className={`px-2.5 py-1 rounded-md transition-all uppercase ${
                    currentLang === lng
                      ? 'bg-brand-red text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {lng}
                </button>
              ))}
            </div>

            {/* Kun / Tun Rejimi (Day / Night Mode Toggle) */}
            <button
              type="button"
              onClick={toggleTheme}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-surface border border-white/10 hover:border-brand-red/40 text-xs font-bold text-slate-300 hover:text-white transition-all hover:scale-105 active:scale-95"
              title={theme === 'dark' ? "Kunduzgi rejimga o'tish (Light mode)" : "Tungi rejimga o'tish (Dark mode)"}
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span className="hidden xl:inline">{t.nav?.themeDay || "Kun"}</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-sky-500" />
                  <span className="hidden xl:inline">{t.nav?.themeNight || "Tun"}</span>
                </>
              )}
            </button>

            {/* Primary Action Button */}
            <button
              onClick={() => onOpenLeadModal(t.nav.requestMeasurement)}
              className="inline-flex items-center justify-center px-4 py-2 text-xs font-bold text-white rounded-xl bg-gradient-to-r from-brand-redLight via-brand-red to-brand-redHover hover:shadow-glow-red hover:scale-105 active:scale-95 transition-all"
            >
              {t.nav.requestMeasurement}
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            {/* Mobile Day/Night toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-1.5 rounded-lg bg-brand-surface border border-white/10 text-slate-300 hover:text-white"
              title={theme === 'dark' ? "Kunduzgi rejim" : "Tungi rejim"}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-sky-500" />
              )}
            </button>

            <button
              onClick={onOpenAdmin}
              className="p-1.5 rounded-lg bg-brand-surface border border-white/10 text-slate-300 hover:text-brand-red"
              title="Admin Panel"
            >
              <Lock className="w-4 h-4" />
            </button>

            <div className="flex bg-brand-surface rounded-lg p-0.5 border border-white/10 text-[11px] font-bold">
              {['uz', 'ru'].map((lng) => (
                <button
                  key={lng}
                  onClick={() => setLang(lng)}
                  className={`px-2 py-0.5 rounded transition-all uppercase ${
                    currentLang === lng
                      ? 'bg-brand-red text-white font-bold'
                      : 'text-slate-400'
                  }`}
                >
                  {lng}
                </button>
              ))}
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-brand-surface border border-white/10 text-slate-200 hover:text-brand-red focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-brand-surface/95 backdrop-blur-xl border-b border-white/10 shadow-2xl px-4 pt-4 pb-6 mt-3 transition-all animate-fadeIn">
          <div className="flex flex-col gap-3">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 p-3 rounded-lg text-slate-200 hover:bg-white/5 hover:text-brand-red transition-colors font-medium"
                >
                  <Icon className="w-4 h-4 text-brand-red" />
                  <span>{link.label}</span>
                </a>
              );
            })}

            <div className="pt-4 border-t border-white/10 flex flex-col gap-3">
              {/* Mobile theme toggle row */}
              <button
                type="button"
                onClick={toggleTheme}
                className="w-full py-2.5 px-4 rounded-xl border border-white/10 text-slate-200 hover:text-white font-bold text-xs flex items-center justify-between bg-white/5"
              >
                <span className="flex items-center gap-2">
                  {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-sky-400" />}
                  <span>{theme === 'dark' ? (t.nav?.themeDay || "Kunduzgi rejim") : (t.nav?.themeNight || "Tungi rejim")}</span>
                </span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-brand-red/20 text-brand-red">
                  {theme === 'dark' ? "Kun" : "Tun"}
                </span>
              </button>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAdmin();
                }}
                className="w-full py-2.5 px-4 rounded-xl border border-white/20 text-slate-200 hover:text-white font-bold text-xs flex items-center justify-center gap-2 bg-white/5"
              >
                <Lock className="w-4 h-4 text-brand-red" />
                <span>Admin Boshqaruv Paneli (CMS)</span>
              </button>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenLeadModal(t.nav.requestMeasurement);
                }}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-brand-red via-brand-red to-brand-redHover text-white font-bold text-sm shadow-glow-red text-center"
              >
                {t.nav.requestMeasurement}
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
