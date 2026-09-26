import React, { useState, useEffect } from 'react';
import { Phone, Menu, X, ShieldCheck, Compass, Calculator, Palette, Layers, Info, HelpCircle } from 'lucide-react';

export const Navbar = ({ currentLang, setLang, t, onOpenLeadModal }) => {
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
    { href: "#portfolio", label: t.nav.portfolio, icon: Compass },
    { href: "#why-us", label: t.nav.about, icon: Info },
    { href: "#faq", label: t.nav.faq, icon: HelpCircle },
    { href: "#contact", label: t.nav.contact, icon: Phone },
  ];

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-brand-dark/90 backdrop-blur-md border-b border-white/10 shadow-lg py-3' 
        : 'bg-transparent py-5'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* Brand Logo */}
          <a href="#" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-gold to-brand-goldHover flex items-center justify-center shadow-glow group-hover:scale-105 transition-transform">
              <span className="font-display font-black text-brand-dark text-xl tracking-tighter">TL</span>
            </div>
            <div>
              <span className="block font-display font-bold text-xl sm:text-2xl text-white tracking-tight leading-none group-hover:text-brand-amber transition-colors">
                TUNIKABOND <span className="text-brand-gold">LIDER</span>
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
                className="text-sm font-medium text-slate-300 hover:text-brand-amber transition-colors hover:scale-105"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Right Controls: Phone + Language + CTA */}
          <div className="hidden md:flex items-center gap-4">
            
            {/* Direct Call Link */}
            <a 
              href="tel:+998995333303"
              className="flex items-center gap-2 text-xs font-semibold text-slate-200 hover:text-brand-gold transition-colors py-1.5 px-3 rounded-lg border border-white/10 hover:border-brand-gold/50 bg-white/5"
            >
              <Phone className="w-3.5 h-3.5 text-brand-gold animate-pulse" />
              <span>+998 (99) 533-33-03</span>
            </a>

            {/* Language Switcher */}
            <div className="flex items-center bg-brand-surface rounded-lg p-1 border border-white/10 text-xs font-bold">
              {['uz', 'ru', 'en'].map((lng) => (
                <button
                  key={lng}
                  onClick={() => setLang(lng)}
                  className={`px-2.5 py-1 rounded-md transition-all uppercase ${
                    currentLang === lng
                      ? 'bg-brand-gold text-brand-dark shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {lng}
                </button>
              ))}
            </div>

            {/* Primary Action Button */}
            <button
              onClick={() => onOpenLeadModal(t.nav.requestMeasurement)}
              className="relative inline-flex items-center justify-center p-0.5 overflow-hidden text-xs font-bold text-brand-dark rounded-xl group bg-gradient-to-br from-brand-amber to-brand-gold group-hover:from-brand-amber group-hover:to-brand-goldHover hover:shadow-glow transition-all"
            >
              <span className="px-4 py-2 transition-all ease-in duration-75 rounded-[10px] bg-brand-gold group-hover:bg-opacity-0 font-bold text-brand-dark">
                {t.nav.requestMeasurement}
              </span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <div className="flex bg-brand-surface rounded-lg p-0.5 border border-white/10 text-[11px] font-bold">
              {['uz', 'ru'].map((lng) => (
                <button
                  key={lng}
                  onClick={() => setLang(lng)}
                  className={`px-2 py-0.5 rounded transition-all uppercase ${
                    currentLang === lng
                      ? 'bg-brand-gold text-brand-dark font-bold'
                      : 'text-slate-400'
                  }`}
                >
                  {lng}
                </button>
              ))}
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-brand-surface border border-white/10 text-slate-200 hover:text-brand-gold focus:outline-none"
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
                  className="flex items-center gap-3 p-3 rounded-lg text-slate-200 hover:bg-white/5 hover:text-brand-gold transition-colors font-medium"
                >
                  <Icon className="w-4 h-4 text-brand-gold" />
                  <span>{link.label}</span>
                </a>
              );
            })}

            <div className="pt-4 border-t border-white/10 flex flex-col gap-3">
              <a 
                href="tel:+998995333303"
                className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-brand-gold/40 text-brand-gold font-semibold text-sm bg-brand-gold/10"
              >
                <Phone className="w-4 h-4" />
                <span>+998 (99) 533-33-03</span>
              </a>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenLeadModal(t.nav.requestMeasurement);
                }}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-brand-amber to-brand-gold text-brand-dark font-bold text-sm shadow-glow text-center"
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
