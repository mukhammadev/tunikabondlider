import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';

/**
 * Cinematic Luxury Intro Reveal (Apple & Porsche Architecture Style):
 * 1. Deep Matte Obsidian Space with subtle Red Core Ambient Glow
 * 2. Glassmorphic Emblem with Metallic Specular Laser Sweep
 * 3. Minimalist Brand Typography ("TUNIKABOND LIDER")
 * 4. Dual-Curtain Architectural Aperture Reveal (Top shutter up, Bottom shutter down)
 * 5. Ultra-snappy 1.25s duration: creates instant luxury without user boredom
 */
export const BrandIntro = ({ onComplete, t }) => {
  const [phase, setPhase] = useState('init'); // 'init' -> 'shimmer' -> 'reveal' -> 'done'

  useEffect(() => {
    // 1. Shimmer sweep starts at 200ms
    const t1 = setTimeout(() => {
      setPhase('shimmer');
    }, 200);

    // 2. Dual-curtain aperture separation starts at 750ms
    const t2 = setTimeout(() => {
      setPhase('reveal');
    }, 750);

    // 3. Unmount completely at 1350ms
    const t3 = setTimeout(() => {
      setPhase('done');
      if (onComplete) onComplete();
    }, 1350);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onComplete]);

  // Click or touch immediately triggers opening
  const handleSkip = (e) => {
    if (e) e.stopPropagation();
    if (phase !== 'reveal' && phase !== 'done') {
      setPhase('reveal');
      setTimeout(() => {
        setPhase('done');
        if (onComplete) onComplete();
      }, 450);
    }
  };

  if (phase === 'done') return null;

  const isRevealing = phase === 'reveal';

  return (
    <div
      onClick={handleSkip}
      className="fixed inset-0 z-[9999] overflow-hidden select-none cursor-pointer"
      aria-label="Tunikabond Lider"
    >
      {/* ═══ TOP SHUTTER CURTAIN ═══ */}
      <div
        className="absolute inset-x-0 top-0 h-1/2 bg-[#06080D] border-b border-white/5"
        style={{
          transform: isRevealing ? 'translateY(-100%)' : 'translateY(0%)',
          transition: 'transform 0.65s cubic-bezier(0.77, 0, 0.175, 1)',
          willChange: 'transform'
        }}
      >
        {/* Subtle top ambient red gradient */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-[250px] bg-brand-red/10 rounded-full blur-[100px] pointer-events-none" />
      </div>

      {/* ═══ BOTTOM SHUTTER CURTAIN ═══ */}
      <div
        className="absolute inset-x-0 bottom-0 h-1/2 bg-[#06080D] border-t border-white/5"
        style={{
          transform: isRevealing ? 'translateY(100%)' : 'translateY(0%)',
          transition: 'transform 0.65s cubic-bezier(0.77, 0, 0.175, 1)',
          willChange: 'transform'
        }}
      >
        {/* Subtle bottom ambient red gradient */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[250px] bg-brand-red/10 rounded-full blur-[100px] pointer-events-none" />

        {/* Minimalist Bottom Brand Tagline */}
        <div className="absolute bottom-6 inset-x-0 text-center pointer-events-none">
          <span className="text-[10px] sm:text-[11px] font-mono tracking-[0.3em] uppercase text-slate-500">
            {t?.brandIntro?.tagline || "Arxitektura • Fasad • Sifat"}
          </span>
        </div>
      </div>

      {/* ═══ SKIP BUTTON ═══ */}
      <button
        type="button"
        onClick={handleSkip}
        className="absolute top-6 right-6 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-xs font-semibold border border-white/10 backdrop-blur-md transition-all z-30"
      >
        <span>{t?.brandIntro?.skipBtn || "O'tkazish"}</span>
        <ArrowRight className="w-3.5 h-3.5 text-brand-red" />
      </button>

      {/* ═══ CENTER BRAND EMBLEM & TYPOGRAPHY ═══ */}
      <div 
        className="absolute inset-0 flex flex-col items-center justify-center p-6 z-20 pointer-events-none transition-all duration-500 ease-out"
        style={{
          opacity: isRevealing ? 0 : 1,
          transform: isRevealing ? 'scale(1.08) translateY(-8px)' : 'scale(1) translateY(0)',
          willChange: 'opacity, transform'
        }}
      >
        {/* Horizontal Laser Line Accent */}
        <div className="h-[1.5px] bg-gradient-to-r from-transparent via-brand-red to-transparent mb-6 animate-laser-glow" />

        {/* Frosted Glass Emblem */}
        <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-b from-white/12 to-white/5 border border-white/20 p-4 flex items-center justify-center backdrop-blur-2xl shadow-[0_0_50px_rgba(196,0,0,0.45)] overflow-hidden">
          {/* Metallic Specular Shimmer Sweep */}
          <div 
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none"
            style={{
              animation: 'specular-sweep 1.1s cubic-bezier(0.4, 0, 0.2, 1) forwards',
              animationDelay: '150ms',
              animationFillMode: 'both'
            }}
          />
          <img
            src="/favi.svg"
            alt="Tunikabond Lider"
            className="w-full h-full object-contain filter drop-shadow-[0_4px_16px_rgba(196,0,0,0.8)]"
          />
        </div>

        {/* Brand Typography */}
        <div className="text-center mt-5 space-y-1">
          <h1 className="font-display font-black text-2xl sm:text-4xl text-white tracking-[0.16em] flex items-center justify-center gap-2.5">
            <span>TUNIKABOND</span>
            <span className="text-brand-red">LIDER</span>
          </h1>
          <p className="text-[10px] sm:text-xs font-mono uppercase tracking-[0.3em] text-slate-400">
            {t?.brandIntro?.subTagline || "Premium Fasad & Naves Tizimlari"}
          </p>
        </div>

        {/* Subtle Horizontal Laser Bottom Accent */}
        <div className="h-[1.5px] bg-gradient-to-r from-transparent via-brand-red to-transparent mt-6 animate-laser-glow" />
      </div>
    </div>
  );
};
