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
    <header className="fixed top-3 sm:top-4 left-0 right-0 z-40 px-3 sm:px-5 pointer-events-none">
      <div className="max-w-[1100px] mx-auto pointer-events-auto flex flex-col gap-2">

        {/* ══ PILL BAR ══ */}
        <div
          className={`w-full rounded-2xl overflow-hidden transition-all duration-300 ${
            isLight
              ? isScrolled
                ? 'bg-white/98 border border-black/10 shadow-lg shadow-black/10'
                : 'bg-white/95 backdrop-blur-xl border border-black/8 shadow-md'
              : isScrolled
                ? 'bg-[#0d1120]/95 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/60'
                : 'bg-[#0d1120]/85 backdrop-blur-xl border border-white/8 shadow-xl shadow-black/40'
          }`}
        >
          {/* Red glow line bottom */}
          <div className="absolute bottom-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-brand-red/60 to-transparent pointer-events-none" />

          <div className="flex items-center h-14 px-4 sm:px-5 gap-3">

            {/* ── Logo ── */}
            <a href="#" className="flex items-center gap-2 group shrink-0">
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
            </a>

            {/* ── Desktop nav (only xl, otherwise links are too cramped) ── */}
            <nav className="hidden xl:flex items-center gap-1 mx-auto">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors hover:text-brand-red ${
                    isLight 
                      ? 'text-slate-800 hover:text-brand-red hover:bg-black/5' 
                      : 'text-slate-200 hover:text-brand-red hover:bg-white/10'
                  }`}
                >
                  {link.label}
                </a>
              ))}
            </nav>

            {/* Spacer for md/lg (no nav shown) */}
            <div className="hidden md:flex xl:hidden flex-1" />

            {/* ── Desktop right controls ── */}
            <div className="hidden md:flex items-center gap-1.5 shrink-0 ml-auto xl:ml-0">

              {/* Admin */}
              {currentUser ? (
                <button
                  onClick={onOpenAdmin}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-brand-red text-white text-xs font-bold shadow-glow-red hover:scale-105 transition-all"
                >
                  <Shield className="w-3 h-3" />
                  <span>CMS</span>
                </button>
              ) : (
                <button
                  onClick={onOpenAdmin}
                  className={`p-1.5 rounded-lg transition-colors hover:text-brand-red ${isLight ? 'text-slate-700 hover:bg-black/5' : 'text-slate-300 hover:bg-white/10'}`}
                  title="Admin"
                >
                  <Lock className="w-3.5 h-3.5" />
                </button>
              )}

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
          <div className={`md:hidden rounded-2xl border shadow-2xl px-4 pt-3 pb-4 animate-slideDown ${
            isLight ? 'bg-white/98 border-slate-200 shadow-2xl text-slate-900' : 'bg-[#0d1120]/98 border-white/15 shadow-2xl text-white'
          }`}>

            {/* Language */}
            <div className={`flex items-center justify-between px-2 py-2 rounded-xl border mb-2 ${isLight ? 'bg-slate-100 border-slate-200' : 'bg-white/5 border-white/10'}`}>
              <span className={`text-xs font-semibold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Til:</span>
              <div className={`flex rounded-lg p-0.5 border text-xs font-bold ${isLight ? 'bg-white border-slate-200' : 'bg-white/8 border-white/10'}`}>
                {['uz', 'ru', 'en'].map((lng) => (
                  <button key={lng} onClick={() => setLang(lng)}
                    className={`px-3 py-1 rounded uppercase transition-all ${currentLang === lng ? 'bg-brand-red text-white' : isLight ? 'text-slate-700 hover:text-slate-900' : 'text-slate-400 hover:text-white'}`}
                  >{lng}</button>
                ))}
              </div>
            </div>

            {/* Nav links */}
            <div className="grid grid-cols-2 gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <a key={link.href} href={link.href} onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium hover:text-brand-red transition-colors ${isLight ? 'text-slate-800 hover:bg-slate-100' : 'text-slate-200 hover:bg-white/5'}`}
                  >
                    <Icon className="w-3.5 h-3.5 text-brand-red shrink-0" />
                    <span className="truncate">{link.label}</span>
                  </a>
                );
              })}
            </div>

            {/* Actions */}
            <div className={`mt-3 pt-3 border-t flex flex-col gap-2 ${isLight ? 'border-slate-200' : 'border-white/10'}`}>
              <button
                onClick={() => { setMobileMenuOpen(false); onOpenAdmin(); }}
                className={`w-full py-2 px-4 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 ${isLight ? 'bg-slate-100 border-slate-200 text-slate-800' : 'bg-white/5 border-white/12 text-slate-300'}`}
              >
                <Lock className="w-4 h-4 text-brand-red" />
                Admin / CMS Panel
              </button>
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
