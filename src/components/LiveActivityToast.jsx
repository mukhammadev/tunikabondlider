import React, { useState, useEffect } from 'react';
import { ShieldCheck, MapPin, Wrench, Calculator, Sparkles, X, ArrowRight } from 'lucide-react';

const REALTIME_ACTIVITIES = [
  {
    id: 1,
    icon: MapPin,
    iconColor: 'text-rose-400 bg-rose-500/15',
    tag: 'Yangi Ariza',
    title: 'Toshkent sh., Yunusobod tumani',
    description: 'Naves va 3D fasad uchun mutaxassis bepul lazerli o\'lchovga chaqirildi.',
    time: '2 daqiqa oldin',
    cta: 'Bepul o\'lchov olish',
    service: 'Naves va Fasad o\'lchovi (Yunusobod)',
  },
  {
    id: 2,
    icon: Wrench,
    iconColor: 'text-amber-400 bg-amber-500/15',
    tag: 'Obyekt Topshirildi',
    title: 'Usta Sanjar va brigadasi',
    description: 'Mirzo Ulug\'bekda 48 m² zamonaviy Koziryok montajini to\'liq topshirdi.',
    time: '14 daqiqa oldin',
    cta: 'Ustalarimizni ko\'rish',
    service: 'Usta Sanjar bilan ishlash',
  },
  {
    id: 3,
    icon: ShieldCheck,
    iconColor: 'text-emerald-400 bg-emerald-500/15',
    tag: 'Rasmiy Kafolat',
    title: 'Toshkent sh., Chilonzor tumani',
    description: 'Alyukabond fasad qoplamasi uchun 10 yillik rasmiy shartnoma imzolandi.',
    time: '28 daqiqa oldin',
    cta: 'Kafolat shartlari',
    service: '10 Yillik Kafolatli Fasad',
  },
  {
    id: 4,
    icon: Calculator,
    iconColor: 'text-sky-400 bg-sky-500/15',
    tag: 'Tezkor Hisob-kitob',
    title: 'Onlayn Kalkulyator',
    description: 'Mijoz 125 m² Darvozaxona va Tunikabond materiallar narxini hisoblab chiqdi.',
    time: 'Hozirgina',
    cta: 'Smeta hisoblash',
    service: 'Onlayn kalkulyator smetasi',
  },
  {
    id: 5,
    icon: Sparkles,
    iconColor: 'text-brand-red bg-brand-red/15',
    tag: 'Katta Loyiha',
    title: 'Samarqand viloyati',
    description: 'Ikki qavatli kottej uchun premium Tunikabond fasad loyihasi tasdiqlandi.',
    time: '42 daqiqa oldin',
    cta: 'Loyihani buyurtma qilish',
    service: 'Kottej fasad loyihasi (Samarqand)',
  },
];

export const LiveActivityToast = ({ onOpenLeadModal }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    if (isDismissed) return;

    // Initial popup after 2.5 seconds
    const initialTimer = setTimeout(() => {
      setIsVisible(true);
    }, 2500);

    return () => clearTimeout(initialTimer);
  }, [isDismissed]);

  useEffect(() => {
    if (isDismissed) return;

    let hideTimer;
    let nextTimer;

    if (isVisible) {
      // Stay visible for 6 seconds
      hideTimer = setTimeout(() => {
        setIsVisible(false);
      }, 6500);
    } else {
      // Wait 7 seconds before showing next activity
      nextTimer = setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % REALTIME_ACTIVITIES.length);
        setIsVisible(true);
      }, 7000);
    }

    return () => {
      clearTimeout(hideTimer);
      clearTimeout(nextTimer);
    };
  }, [isVisible, isDismissed]);

  if (isDismissed) return null;

  const current = REALTIME_ACTIVITIES[currentIndex];
  const IconComponent = current.icon;

  const handleCtaClick = () => {
    if (onOpenLeadModal) {
      onOpenLeadModal(current.service);
    }
  };

  return (
    <div
      className={`fixed bottom-4 left-4 z-40 max-w-sm sm:max-w-md w-[calc(100vw-2rem)] sm:w-auto transition-all duration-500 ease-out ${
        isVisible
          ? 'translate-y-0 opacity-100 scale-100 pointer-events-auto'
          : 'translate-y-12 opacity-0 scale-95 pointer-events-none'
      }`}
    >
      <div className="relative rounded-2xl bg-[#0F141F]/90 backdrop-blur-xl border border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.6)] p-3.5 sm:p-4 overflow-hidden group hover:border-brand-red/50 transition-colors">
        
        {/* Subtle moving laser sweep inside card */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent -translate-x-full animate-[shimmer_3s_infinite] pointer-events-none" />

        {/* Top bar: live indicator & dismiss button */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="uppercase tracking-wider font-mono text-[10px]">Jonli Faollik</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400 font-mono text-[10px]">{current.time}</span>
          </div>

          <button
            type="button"
            onClick={() => setIsDismissed(true)}
            className="text-slate-500 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Yopish"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Middle content: icon + details */}
        <div className="flex items-start gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${current.iconColor}`}>
            <IconComponent className="w-4 h-4" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-bold text-white truncate">{current.title}</span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-brand-red/20 text-brand-red border border-brand-red/30">
                {current.tag}
              </span>
            </div>
            <p className="text-[11px] text-slate-300 mt-0.5 line-clamp-2 leading-relaxed">
              {current.description}
            </p>
          </div>
        </div>

        {/* Action button inside toast */}
        <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between gap-2">
          <span className="text-[10px] text-slate-400 font-medium">
            10 yillik rasmiy kafolat bilan
          </span>
          <button
            type="button"
            onClick={handleCtaClick}
            className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-red hover:text-white hover:bg-brand-red px-2.5 py-1 rounded-lg transition-all"
          >
            <span>{current.cta}</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Progress timer bar */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/5">
          <div
            className={`h-full bg-brand-red transition-all duration-[6500ms] ease-linear ${
              isVisible ? 'w-full' : 'w-0'
            }`}
          />
        </div>

      </div>
    </div>
  );
};
