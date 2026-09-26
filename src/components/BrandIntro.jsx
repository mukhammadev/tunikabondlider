import React, { useState, useEffect } from 'react';
import { Sparkles, Shield, ChevronRight } from 'lucide-react';

export const BrandIntro = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [isFading, setIsFading] = useState(false);
  const [statusText, setStatusText] = useState("Tizim ishga tushirilmoqda...");

  useEffect(() => {
    // Smooth progress counter over ~1.8 seconds
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        // Organic acceleration
        const increment = Math.max(1, Math.floor(Math.random() * 8) + 3);
        const next = Math.min(100, prev + increment);

        if (next < 30) {
          setStatusText("Premium materiallar tekshirilmoqda...");
        } else if (next < 65) {
          setStatusText("Usta va muhandislar bazasi yuklanmoqda...");
        } else if (next < 90) {
          setStatusText("3D fasad va smeta hisoblagich faollashmoqda...");
        } else {
          setStatusText("Tunikabond Lider brendiga xush kelibsiz!");
        }

        return next;
      });
    }, 45);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (progress === 100) {
      const fadeTimer = setTimeout(() => {
        setIsFading(true);
      }, 350);

      const finishTimer = setTimeout(() => {
        if (onComplete) onComplete();
      }, 950);

      return () => {
        clearTimeout(fadeTimer);
        clearTimeout(finishTimer);
      };
    }
  }, [progress, onComplete]);

  const handleSkip = () => {
    setIsFading(true);
    setTimeout(() => {
      if (onComplete) onComplete();
    }, 300);
  };

  return (
    <div
      className={`fixed inset-0 z-[9999] bg-[#070A0F] flex flex-col items-center justify-center transition-all duration-700 ease-out select-none ${
        isFading ? 'opacity-0 pointer-events-none scale-105' : 'opacity-100 scale-100'
      }`}
    >
      {/* Background Architectural Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(circle at 50% 50%, rgba(196, 0, 0, 0.25) 0%, transparent 60%),
            linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)
          `,
          backgroundSize: '100% 100%, 40px 40px, 40px 40px'
        }}
      />

      {/* Atmospheric Neon Red Glows */}
      <div className="absolute w-[500px] h-[500px] bg-brand-red/20 rounded-full blur-[140px] pointer-events-none animate-pulse" />

      {/* Skip Button */}
      <button
        type="button"
        onClick={handleSkip}
        className="absolute top-6 right-6 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-xs font-bold border border-white/10 transition-all flex items-center gap-1 z-20"
      >
        <span>O'tkazib yuborish</span>
        <ChevronRight className="w-3.5 h-3.5" />
      </button>

      {/* Central Content Box */}
      <div className="relative z-10 flex flex-col items-center max-w-sm px-6 text-center">
        
        {/* Animated Emblem / Logo Box */}
        <div className="relative mb-8 flex items-center justify-center">
          
          {/* Dual Pulsing Laser Rings */}
          <div className="absolute w-28 h-28 rounded-full border border-brand-red/40 animate-ping opacity-30 pointer-events-none" />
          <div 
            className="absolute w-36 h-36 rounded-full border border-dashed border-brand-red/30 pointer-events-none"
            style={{ animation: 'spin 12s linear infinite' }}
          />
          <div 
            className="absolute w-44 h-44 rounded-full border border-dotted border-white/15 pointer-events-none"
            style={{ animation: 'spin 20s linear infinite reverse' }}
          />

          {/* Core Logo Container */}
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-br from-brand-surface via-brand-dark to-black border-2 border-brand-red/60 shadow-glow-red-lg flex items-center justify-center p-3 relative overflow-hidden group">
            {/* Shimmer light sweep */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
            
            <img
              src="/favi.svg"
              alt="Tunikabond Lider"
              className="w-16 h-16 sm:w-20 sm:h-20 object-contain drop-shadow-[0_4px_12px_rgba(196,0,0,0.6)]"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
        </div>

        {/* Brand Name Typography Reveal */}
        <div className="space-y-1 mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-red/10 border border-brand-red/30 text-brand-red text-[11px] font-black tracking-widest uppercase mb-2">
            <Sparkles className="w-3 h-3" />
            <span>Rasmiy Brend</span>
          </div>

          <h1 className="font-display font-black text-2xl sm:text-3xl text-white tracking-wider flex items-center justify-center gap-2">
            <span>TUNIKABOND</span>
            <span className="text-brand-red font-black">LIDER</span>
          </h1>

          <p className="text-xs text-slate-400 font-medium tracking-wide">
            Fasad • Naves • Darvozaxona • Koziryok
          </p>
        </div>

        {/* Progress Bar & Percentage */}
        <div className="w-full space-y-2.5">
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden relative">
            <div
              className="h-full bg-gradient-to-r from-brand-redLight via-brand-red to-brand-redHover shadow-glow-red transition-all duration-100 ease-out rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] font-bold">
            <span className="text-slate-400 font-mono transition-all">
              {statusText}
            </span>
            <span className="text-brand-red font-mono">
              {progress}%
            </span>
          </div>
        </div>

        {/* Guarantee micro-badge */}
        <div className="mt-8 flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
          <Shield className="w-3.5 h-3.5 text-emerald-400" />
          <span>10 Yillik Rasmiy Kafolat va Zavod Narxlari</span>
        </div>

      </div>
    </div>
  );
};
