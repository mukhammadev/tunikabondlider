import React, { useState } from 'react';
import { Phone, Send, MessageCircle, X } from 'lucide-react';

export const QuickActions = () => {
  const [showTooltip, setShowTooltip] = useState(true);

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3.5">
      
      {/* Tooltip bubble introducing Admin @Muhammadazez */}
      {showTooltip && (
        <div className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-brand-surface/95 backdrop-blur-md border border-brand-red/40 shadow-glow-red text-xs text-white animate-fadeIn mb-1">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>Admin online: <strong className="text-brand-red font-bold">@Muhammadazez</strong></span>
          <button 
            onClick={() => setShowTooltip(false)}
            className="text-slate-400 hover:text-white p-0.5 ml-1"
            aria-label="Yopish"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Telegram Admin Button - WIGGLING & BOUNCING JUST LIKE PHONE */}
      <a
        href="https://t.me/Muhammadazez"
        target="_blank"
        rel="noopener noreferrer"
        className="group relative w-14 h-14 rounded-full bg-gradient-to-tr from-[#0088cc] to-[#29b6f6] text-white flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all shadow-[#0088cc]/50 animate-bounce"
        aria-label="Telegram Admin @Muhammadazez bilan bog'lanish"
      >
        <Send className="w-6 h-6 ml-[-2px] mt-[1px] group-hover:rotate-12 transition-transform" />
        
        {/* Glowing aura */}
        <span className="absolute inset-0 rounded-full bg-[#29b6f6]/40 animate-ping -z-10" />

        {/* Floating badge */}
        <span className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full bg-brand-red text-white text-[9px] font-black uppercase tracking-wider shadow-sm">
          Admin
        </span>
      </a>

      {/* Direct Phone Call Button - ANIMATING */}
      <a
        href="tel:+998995333303"
        className="group relative w-14 h-14 rounded-full bg-gradient-to-r from-brand-redLight via-brand-red to-brand-redHover text-white flex items-center justify-center shadow-glow-red hover:scale-110 active:scale-95 transition-all animate-bounce [animation-delay:200ms]"
        aria-label="Tezkor qo'ng'iroq qilish: +998 (99) 533-33-03"
      >
        <Phone className="w-6 h-6 group-hover:rotate-12 transition-transform" />
        
        {/* Glowing aura */}
        <span className="absolute inset-0 rounded-full bg-brand-red/40 animate-ping -z-10" />

        <span className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full bg-emerald-500 text-white text-[9px] font-black uppercase tracking-wider shadow-sm">
          24/7
        </span>
      </a>

    </div>
  );
};
