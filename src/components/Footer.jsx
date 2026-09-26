import React from 'react';
import { Phone, ArrowUp, Send, UserCheck } from 'lucide-react';

export const Footer = ({ t }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-brand-surface/90 border-t border-white/10 pt-16 pb-12 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          
          {/* Brand Info */}
          <div className="space-y-4">
            <a href="#" className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-white/5 border border-brand-red/40 p-1.5 flex items-center justify-center shadow-glow-red">
                <img src="/favi.svg" alt="Tunikabond Lider" className="w-full h-full object-contain filter drop-shadow" />
              </div>
              <div>
                <span className="block font-display font-bold text-xl text-white">
                  TUNIKABOND <span className="text-brand-red">LIDER</span>
                </span>
                <span className="block text-[10px] text-slate-400 uppercase tracking-widest font-medium">
                  Fasad & Tom Yechimlari
                </span>
              </div>
            </a>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              {t.footer.desc}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-bold text-sm text-white uppercase tracking-wider mb-4">
              {t.nav.services} & Bo'limlar
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-300">
              <li>
                <a href="#calculator" className="hover:text-brand-red transition-colors">
                  {t.nav.calculator}
                </a>
              </li>
              <li>
                <a href="#products" className="hover:text-brand-red transition-colors">
                  {t.nav.products}
                </a>
              </li>
              <li>
                <a href="#swatches" className="hover:text-brand-red transition-colors">
                  {t.nav.swatches}
                </a>
              </li>
              <li>
                <a href="#portfolio" className="hover:text-brand-red transition-colors">
                  {t.nav.portfolio}
                </a>
              </li>
              <li>
                <a href="#why-us" className="hover:text-brand-red transition-colors">
                  {t.nav.about}
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-brand-red transition-colors">
                  {t.nav.faq}
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Numbers with PROPER tel: links */}
          <div>
            <h4 className="font-display font-bold text-sm text-white uppercase tracking-wider mb-4">
              {t.contact.phoneTitle}
            </h4>
            <ul className="space-y-3 text-xs sm:text-sm">
              <li>
                <a 
                  href="tel:+998995333303"
                  className="text-slate-200 hover:text-brand-red transition-colors font-semibold flex items-center gap-2"
                >
                  <Phone className="w-3.5 h-3.5 text-brand-red" />
                  <span>+998 (99) 533-33-03</span>
                </a>
              </li>
              <li>
                <a 
                  href="tel:+998981411808"
                  className="text-slate-200 hover:text-brand-red transition-colors font-semibold flex items-center gap-2"
                >
                  <Phone className="w-3.5 h-3.5 text-brand-red" />
                  <span>+998 (98) 141-18-08</span>
                </a>
              </li>
              <li>
                <a 
                  href="tel:+998990473809"
                  className="text-slate-200 hover:text-brand-red transition-colors font-semibold flex items-center gap-2"
                >
                  <Phone className="w-3.5 h-3.5 text-brand-red" />
                  <span>+998 (99) 047-38-09</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Telegram Admin & Channels */}
          <div>
            <h4 className="font-display font-bold text-sm text-white uppercase tracking-wider mb-4">
              Telegram & Ijtimoiy tarmoqlar
            </h4>
            <div className="flex flex-col gap-2.5">
              
              {/* Direct Telegram Admin */}
              <a
                href="https://t.me/Muhammadazez"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-2.5 rounded-xl bg-[#0088cc]/10 hover:bg-[#0088cc]/20 border border-[#29b6f6]/30 text-white transition-all text-xs font-semibold"
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
                className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/5 hover:bg-brand-red/15 border border-white/10 hover:border-brand-red/40 text-slate-200 hover:text-white transition-all text-xs font-semibold"
              >
                <Send className="w-4 h-4 text-brand-red" />
                <span>Kanal: @tunikabondLiderkanali</span>
              </a>

              {/* Instagram */}
              <a
                href="https://www.instagram.com/tunikabond_lider"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/5 hover:bg-brand-red/15 border border-white/10 hover:border-brand-red/40 text-slate-200 hover:text-white transition-all text-xs font-semibold"
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
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} Tunikabond Lider. {t.footer.rights}
          </div>

          <div className="flex items-center gap-6">
            <span>{t.footer.developedWith}</span>
            <button
              onClick={scrollToTop}
              className="p-2 rounded-lg bg-white/5 hover:bg-brand-red hover:text-white text-slate-300 transition-colors"
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
