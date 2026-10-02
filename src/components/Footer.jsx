import React from 'react';
import { Phone, ArrowUp, Send, UserCheck } from 'lucide-react';

export const Footer = ({ t, onNavigate }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNav = (pageId) => {
    if (onNavigate) {
      onNavigate(pageId);
    } else {
      scrollToTop();
    }
  };

  return (
    <footer className="bg-slate-100 dark:bg-brand-surface/80 border-t border-slate-200 dark:border-white/10 pt-16 pb-12 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          
          {/* Brand Info */}
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => handleNav('home')}
              className="flex items-center gap-3 text-left group cursor-pointer"
            >
              <div className="w-11 h-11 rounded-xl bg-slate-200/60 dark:bg-white/5 border border-brand-red/40 p-1.5 flex items-center justify-center shadow-glow-red group-hover:border-brand-red transition-all">
                <img src="/favi.svg" alt="Tunikabond Lider" className="w-full h-full object-contain filter drop-shadow" />
              </div>
              <div>
                <span className="block font-display font-bold text-xl text-slate-900 dark:text-white group-hover:text-brand-red transition-colors">
                  TUNIKABOND <span className="text-brand-red">LIDER</span>
                </span>
                <span className="block text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-medium">
                  Fasad & Tom Yechimlari
                </span>
              </div>
            </button>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {t.footer.desc}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider mb-4">
              {t.nav.services} & Bo'limlar
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('home')}
                  className="hover:text-brand-red transition-colors text-left cursor-pointer"
                >
                  {t.nav.home || "Bosh sahifa"}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('products')}
                  className="hover:text-brand-red transition-colors text-left cursor-pointer"
                >
                  {t.nav.products} & {t.nav.swatches}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('portfolio')}
                  className="hover:text-brand-red transition-colors text-left cursor-pointer"
                >
                  {t.nav.portfolio} & Ustalar
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('about')}
                  className="hover:text-brand-red transition-colors text-left cursor-pointer"
                >
                  {t.nav.about} & {t.nav.faq}
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => handleNav('contact')}
                  className="hover:text-brand-red transition-colors text-left cursor-pointer"
                >
                  {t.nav.contact}
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Numbers with PROPER tel: links */}
          <div>
            <h4 className="font-display font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider mb-4">
              {t.contact.phoneTitle}
            </h4>
            <ul className="space-y-3 text-xs sm:text-sm">
              <li>
                <a 
                  href="tel:+998995333303"
                  className="text-slate-700 dark:text-slate-200 hover:text-brand-red transition-colors font-semibold flex items-center gap-2"
                >
                  <Phone className="w-3.5 h-3.5 text-brand-red" />
                  <span>+998 (99) 533-33-03</span>
                </a>
              </li>
              <li>
                <a 
                  href="tel:+998981411808"
                  className="text-slate-700 dark:text-slate-200 hover:text-brand-red transition-colors font-semibold flex items-center gap-2"
                >
                  <Phone className="w-3.5 h-3.5 text-brand-red" />
                  <span>+998 (98) 141-18-08</span>
                </a>
              </li>
              <li>
                <a 
                  href="tel:+998990473809"
                  className="text-slate-700 dark:text-slate-200 hover:text-brand-red transition-colors font-semibold flex items-center gap-2"
                >
                  <Phone className="w-3.5 h-3.5 text-brand-red" />
                  <span>+998 (99) 047-38-09</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Telegram Admin & Channels */}
          <div>
            <h4 className="font-display font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider mb-4">
              Telegram & Ijtimoiy tarmoqlar
            </h4>
            <div className="flex flex-col gap-2.5">
              
              {/* Direct Telegram Admin */}
              <a
                href="https://t.me/Muhammadazez"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-2.5 rounded-xl bg-[#0088cc]/10 hover:bg-[#0088cc]/20 border border-[#29b6f6]/30 text-slate-900 dark:text-white transition-all text-xs font-semibold"
              >
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-[#29b6f6]" />
                  <span>Admin: @Muhammadazez</span>
                </div>
                <span className="text-[10px] bg-[#0088cc] px-2 py-0.5 rounded text-white font-bold">Yozish</span>
              </a>

              {/* Telegram Channel */}
              <a
                href="https://t.me/tunikabondLiderkanali"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-200/60 hover:bg-brand-red/10 dark:bg-white/5 dark:hover:bg-brand-red/15 border border-slate-300 dark:border-white/10 hover:border-brand-red/40 text-slate-700 dark:text-slate-200 transition-all text-xs font-semibold"
              >
                <Send className="w-4 h-4 text-brand-red" />
                <span>Kanal: @tunikabondLiderkanali</span>
              </a>

              {/* Instagram */}
              <a
                href="https://www.instagram.com/tunikabond_lider"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-200/60 hover:bg-brand-red/10 dark:bg-white/5 dark:hover:bg-brand-red/15 border border-slate-300 dark:border-white/10 hover:border-brand-red/40 text-slate-700 dark:text-slate-200 transition-all text-xs font-semibold"
              >
                <svg className="w-4 h-4 text-brand-red" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                </svg>
                <span>@tunikabond_lider</span>
              </a>

            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-200 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div>
            © {new Date().getFullYear()} Tunikabond Lider. {t.footer.rights}
          </div>

          <div className="flex items-center gap-6">
            <span>{t.footer.developedWith}</span>
            <button
              onClick={scrollToTop}
              className="p-2 rounded-lg bg-slate-200 hover:bg-brand-red hover:text-white dark:bg-white/5 dark:hover:bg-brand-red text-slate-700 dark:text-slate-300 transition-colors"
              aria-label="Scroll to top"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
