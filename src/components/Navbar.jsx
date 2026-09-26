import React, { useState, useEffect } from 'react';
import { Phone, Menu, X, Calculator, Palette, Layers, Info, HelpCircle, Lock, Shield, Sun, Moon } from 'lucide-react';

export const Navbar = ({ currentLang, setLang, t, onOpenLeadModal, currentUser, onOpenAdmin, theme, toggleTheme }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '#calculator', label: t.nav.calculator, icon: Calculator },
    { href: '#products',   label: t.nav.products,   icon: Layers },
    { href: '#swatches',   label: t.nav.swatches,   icon: Palette },
    { href: '#portfolio',  label: t.nav.portfolio,  icon: Layers },
    { href: '#why-us',     label: t.nav.about,      icon: Info },
    { href: '#faq',        label: t.nav.faq,        icon: HelpCircle },
    { href: '#contact',    label: t.nav.contact,    icon: Phone },
  ];

  const isLight = theme === 'light';

  return (
    <header className="fixed top-3 sm:top-5 left-0 right-0 z-40 px-3 sm:px-6 pointer-events-none">
      {/* Outer wrapper: flex column so pill + drawer stack vertically */}
      <div className="max-w-5xl mx-auto pointer-events-auto flex flex-col gap-2">

        {/* ══════════════ PILL NAVBAR ══════════════ */}
        <div
          className={`w-full rounded-full relative overflow-hidden transition-all duration-300 ${
            isLight
              ? isScrolled
                ? 'bg-white border border-black/10 shadow-xl py-2 px-4 sm:px-6'
                : 'bg-white/92 backdrop-blur-lg border border-black/8 shadow-lg py-2.5 px-4 sm:px-6'
              : isScrolled
                ? 'bg-brand-surface/95 backdrop-blur-xl border border-brand-red/40 shadow-2xl shadow-black/50 py-2 px-4 sm:px-6'
                : 'bg-brand-surface/80 backdrop-blur-lg border border-white/15 shadow-xl shadow-black/30 py-2.5 px-4 sm:px-6'
          }`}
        >
          {/* Ambient bottom line */}
          <div className="absolute bottom-0 left-10 right-10 h-[1.5px] bg-gradient-to-r from-transparent via-brand-red to-transparent opacity-60 pointer-events-none" />

          {/* Inner flex row */}
          <div className="flex items-center justify-between">

            {/* Logo */}
            <a href="#" className="flex items-center gap-2.5 sm:gap-3 group">
              <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl border border-brand-red/40 p-1.5 flex items-center justify-center shadow-glow-red group-hover:scale-105 group-hover:border-brand-red transition-all ${isLight ? 'bg-black/4' : 'bg-white/5'}`}>
                <img src="/favi.svg" alt="Tunikabond Lider" className="w-full h-full object-contain" />
              </div>
              <div>
                <span className={`block font-display font-bold text-base sm:text-xl tracking-tight leading-none group-hover:text-brand-red transition-colors whitespace-nowrap ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  TUNIKABOND <span className="text-brand-red">LIDER</span>
                </span>
                <span className={`hidden sm:block text-[10px] uppercase tracking-widest font-medium mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                  Fasad &amp; Tom Yechimlari
                </span>
              </div>
            </a>

            {/* Desktop nav links */}
            <nav className="hidden lg:flex items-center gap-5 xl:gap-7">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-semibold transition-colors hover:text-brand-red ${isLight ? 'text-slate-700' : 'text-slate-300'}`}
                >
                  {link.label}
                </a>
              ))}
            </nav>

            {/* Desktop right controls */}
            <div className="hidden md:flex items-center gap-2 xl:gap-3">

              {/* Admin */}
              {currentUser ? (
                <button
                  onClick={onOpenAdmin}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-red text-white text-xs font-bold shadow-glow-red hover:scale-105 transition-all"
                  title="Boshqaruv paneli"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>CMS</span>
                </button>
              ) : (
                <button
                  onClick={onOpenAdmin}
                  className={`p-2 rounded-lg transition-colors hover:text-brand-red ${isLight ? 'bg-black/4 text-slate-600 hover:bg-black/8' : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'}`}
                  title="Admin"
                >
                  <Lock className="w-4 h-4" />
                </button>
              )}

              {/* Language switcher */}
              <div className={`flex items-center rounded-lg p-0.5 border text-xs font-bold ${isLight ? 'bg-black/4 border-black/8' : 'bg-brand-surface border-white/10'}`}>
                {['uz', 'ru', 'en'].map((lng) => (
                  <button
                    key={lng}
                    onClick={() => setLang(lng)}
                    className={`px-2.5 py-1 rounded-md transition-all uppercase ${
                      currentLang === lng
                        ? 'bg-brand-red text-white font-bold'
                        : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {lng}
                  </button>
                ))}
              </div>

              {/* Theme toggle */}
              <button
                type="button"
                onClick={toggleTheme}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all hover:scale-105 active:scale-95 hover:border-brand-red/40 ${
                  isLight
                    ? 'bg-black/4 border-black/8 text-slate-700'
                    : 'bg-brand-surface border-white/10 text-slate-300 hover:text-white'
                }`}
                title={isLight ? "Tungi rejimga o'tish" : "Kunduzgi rejimga o'tish"}
              >
                {isLight ? (
                  <Moon className="w-4 h-4 text-indigo-500" />
                ) : (
                  <Sun className="w-4 h-4 text-amber-400" />
                )}
                <span className="hidden xl:inline">
                  {isLight ? (t.nav?.themeNight || 'Tun') : (t.nav?.themeDay || 'Kun')}
                </span>
              </button>

              {/* CTA */}
              <button
                onClick={() => onOpenLeadModal(t.nav.requestMeasurement)}
                className="inline-flex items-center justify-center px-4 py-2 text-xs font-bold text-white rounded-xl bg-gradient-to-r from-brand-redLight via-brand-red to-brand-redHover hover:shadow-glow-red hover:scale-105 active:scale-95 transition-all"
              >
                {t.nav.requestMeasurement}
              </button>
            </div>

            {/* Mobile right controls */}
            <div className="flex md:hidden items-center gap-1.5">
              {/* Theme toggle */}
              <button
                type="button"
                onClick={toggleTheme}
                className={`p-2 rounded-xl border active:scale-95 transition-all ${
                  isLight ? 'bg-black/4 border-black/8 text-slate-700' : 'bg-brand-surface border-white/10 text-slate-300'
                }`}
                aria-label="Kun/Tun rejimi"
              >
                {isLight ? (
                  <Moon className="w-4 h-4 text-indigo-500" />
                ) : (
                  <Sun className="w-4 h-4 text-amber-400" />
                )}
              </button>

              {/* Hamburger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={`p-2 rounded-xl border active:scale-95 transition-all hover:text-brand-red ${
                  isLight ? 'bg-black/4 border-black/8 text-slate-700' : 'bg-brand-surface border-white/10 text-slate-200'
                }`}
                aria-label="Menyu"
              >
                {mobileMenuOpen
                  ? <X className="w-5 h-5 text-brand-red" />
                  : <Menu className="w-5 h-5" />
                }
              </button>
            </div>

          </div>{/* end inner flex row */}
        </div>{/* end PILL */}

        {/* ══════════════ MOBILE DRAWER (sibling below pill) ══════════════ */}
        {mobileMenuOpen && (
          <div
            className={`md:hidden backdrop-blur-xl shadow-2xl rounded-2xl border px-4 pt-4 pb-5 animate-slideDown ${
              isLight ? 'bg-white border-black/8' : 'bg-brand-surface/97 border-white/10'
            }`}
          >
            {/* Language row */}
            <div className={`flex items-center justify-between p-2.5 rounded-xl border mb-2 ${isLight ? 'bg-black/4 border-black/6' : 'bg-white/5 border-white/10'}`}>
              <span className={`text-xs font-semibold ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>Til / Язык:</span>
              <div className={`flex rounded-lg p-0.5 border text-xs font-bold ${isLight ? 'bg-black/5 border-black/8' : 'bg-brand-surface border-white/10'}`}>
                {['uz', 'ru', 'en'].map((lng) => (
                  <button
                    key={lng}
                    onClick={() => setLang(lng)}
                    className={`px-3 py-1 rounded transition-all uppercase ${
                      currentLang === lng
                        ? 'bg-brand-red text-white font-bold'
                        : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {lng}
                  </button>
                ))}
              </div>
            </div>

            {/* Nav links */}
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl hover:text-brand-red transition-colors font-medium text-sm ${
                      isLight ? 'text-slate-700 hover:bg-black/4' : 'text-slate-200 hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-4 h-4 text-brand-red shrink-0" />
                    <span>{link.label}</span>
                  </a>
                );
              })}
            </div>

            {/* Bottom actions */}
            <div className={`mt-3 pt-3 border-t flex flex-col gap-2 ${isLight ? 'border-black/6' : 'border-white/10'}`}>
              <button
                onClick={() => { setMobileMenuOpen(false); onOpenAdmin(); }}
                className={`w-full py-2.5 px-4 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 ${
                  isLight ? 'bg-black/4 border-black/8 text-slate-700' : 'bg-white/5 border-white/15 text-slate-200'
                }`}
              >
                <Lock className="w-4 h-4 text-brand-red" />
                <span>Admin Boshqaruv Paneli (CMS)</span>
              </button>

              <button
                onClick={() => { setMobileMenuOpen(false); onOpenLeadModal(t.nav.requestMeasurement); }}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-brand-red via-brand-red to-brand-redHover text-white font-bold text-sm shadow-glow-red"
              >
                {t.nav.requestMeasurement}
              </button>
            </div>
          </div>
        )}{/* end DRAWER */}

      </div>{/* end flex-col wrapper */}
    </header>
  );
};
