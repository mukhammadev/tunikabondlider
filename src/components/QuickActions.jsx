import React from 'react';
import { Phone, Send, Calculator } from 'lucide-react';

export const QuickActions = ({ onOpenLeadModal }) => {
  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-3">
      
      {/* Telegram button */}
      <a
        href="https://t.me/tunikabondLiderkanali"
        target="_blank"
        rel="noopener noreferrer"
        className="w-12 h-12 rounded-full bg-[#229ED9] text-white flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all hover:shadow-[#229ED9]/50"
        aria-label="Telegram orqali bog'lanish"
      >
        <Send className="w-5 h-5 ml-[-2px] mt-[1px]" />
      </a>

      {/* Direct Call button */}
      <a
        href="tel:+998995333303"
        className="w-14 h-14 rounded-full bg-gradient-to-r from-brand-amber to-brand-gold text-brand-dark flex items-center justify-center shadow-glow-lg hover:scale-110 active:scale-95 transition-all animate-bounce"
        aria-label="Tezkor qo'ng'iroq"
      >
        <Phone className="w-6 h-6" />
      </a>

    </div>
  );
};
