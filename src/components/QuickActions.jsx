import React from 'react';
import { Phone, Send } from 'lucide-react';

export const QuickActions = () => {
  return (
    <div className="fixed bottom-3 right-3 sm:bottom-5 sm:right-5 z-40 flex flex-row items-center gap-2.5 sm:gap-3">
      {/* Telegram Button */}
      <a
        href="https://t.me/Mukhammad_azez"
        target="_blank"
        rel="noopener noreferrer"
        className="group relative w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-gradient-to-tr from-[#0088cc] to-[#29b6f6] text-white flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all shadow-[#0088cc]/50"
        aria-label="Telegram orqali bog'lanish: @Mukhammad_azez"
      >
        <Send className="w-5 h-5 ml-[-2px] mt-[1px] group-hover:rotate-12 transition-transform" />
        
        {/* Glowing aura */}
        <span className="absolute inset-0 rounded-full bg-[#29b6f6]/35 animate-ping -z-10" />

        {/* Floating badge */}
        <span className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full bg-[#0088cc] text-white text-[8px] font-black uppercase tracking-wider shadow-sm">
          TG
        </span>
      </a>

      {/* Direct Phone Call Button */}
      <a
        href="tel:+998995333303"
        className="group relative w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-gradient-to-r from-brand-redLight via-brand-red to-brand-redHover text-white flex items-center justify-center shadow-glow-red hover:scale-110 active:scale-95 transition-all"
        aria-label="Tezkor qo'ng'iroq qilish: +998 (99) 533-33-03"
      >
        <Phone className="w-5 h-5 group-hover:rotate-12 transition-transform" />
        
        {/* Glowing aura */}
        <span className="absolute inset-0 rounded-full bg-brand-red/35 animate-ping -z-10" />

        <span className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full bg-emerald-500 text-white text-[8px] font-black uppercase tracking-wider shadow-sm">
          24/7
        </span>
      </a>

    </div>
  );
};
