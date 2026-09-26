import React, { useState, useEffect } from 'react';
import { Phone, Menu, X, Send, Calculator, Palette, Layers, Info, HelpCircle } from 'lucide-react';

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
    { href: "#portfolio", label: t.nav.portfolio, icon: Layers },
    { href: "#why-us", label: t.nav.about, icon: Info },
    { href: "#faq", label: t.nav.faq, icon: HelpCircle },
    { href: "#contact", label: t.nav.contact, icon: Phone },
  ];

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-brand-dark/95 backdrop-blur-md border-b border-white/10 shadow-lg py-3' 
        : 'bg-transparent py-5'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* Brand Logo with Tunikabond Red Accent */}
          <a href="#" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-red to-brand-redHover flex items-center justify-center shadow-glow-red group-hover:scale-105 transition-transform">
              <span className="font-display font-black text-white text-xl tracking-tighter">TL</span>
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
            
            {/* Telegram Admin quick link */}
            <a
              href="https://t.me/Muhammadazez"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-200 hover:text-brand-red transition-colors py-1.5 px-3 rounded-lg border border-white/10 hover:border-brand-red/50 bg-white/5"
              title="Admin bilan bog'lanish"
            >
              <Send className="w-3.5 h-3.5 text-[#29b6f6]" />
              <span className="hidden xl:inline text-slate-400">Admin:</span>
              <span className="font-bold">@Muhammadazez</span>
            </a>

            {/* Direct Call Link */}
            <a 
              href="tel:+998995333303"
              className="flex items-center gap-2 text-xs font-semibold text-slate-200 hover:text-brand-red transition-colors py-1.5 px-3 rounded-lg border border-white/10 hover:border-brand-red/50 bg-white/5"
            >
              <Phone className="w-3.5 h-3.5 text-brand-red animate-pulse" />
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
                      ? 'bg-brand-red text-white shadow-sm'
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
              className="inline-flex items-center justify-center px-4 py-2 text-xs font-bold text-white rounded-xl bg-gradient-to-r from-brand-redLight via-brand-red to-brand-redHover hover:shadow-glow-red hover:scale-105 active:scale-95 transition-all"
            >
              {t.nav.requestMeasurement}
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
              <a 
                href="https://t.me/Muhammadazez"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-[#29b6f6]/40 text-[#29b6f6] font-semibold text-sm bg-[#0088cc]/10"
              >
                <Send className="w-4 h-4" />
                <span>Admin bilan Telegram: @Muhammadazez</span>
              </a>

              <a 
                href="tel:+998995333303"
                className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-brand-red/40 text-brand-red font-semibold text-sm bg-brand-red/10"
              >
                <Phone className="w-4 h-4" />
                <span>+998 (99) 533-33-03</span>
              </a>

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
