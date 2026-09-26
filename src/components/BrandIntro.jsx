import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';

/**
 * Gcore-inspired Minimalist Luxury Intro Reveal (Awwwards video style):
 * 1. Concentric pulsing ring in deep black space
 * 2. Smooth morph & expansion into Tunikabond Lider emblem & typography
 * 3. Fluid upward curtain wipe reveal (translateY(-100%)) with luxury cubic-bezier easing
 */
export const BrandIntro = ({ onComplete }) => {
  const [phase, setPhase] = useState('ring'); // 'ring' -> 'logo' -> 'wipe' -> 'done'

  useEffect(() => {
    // Phase 1: Ring pulses, then morphs into logo at 450ms
    const t1 = setTimeout(() => {
      setPhase('logo');
    }, 450);

    // Phase 2: Upward curtain wipe begins at 1000ms
    const t2 = setTimeout(() => {
      setPhase('wipe');
    }, 1000);

    // Phase 3: Complete & unmount at 1700ms
    const t3 = setTimeout(() => {
      setPhase('done');
      if (onComplete) onComplete();
    }, 1700);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onComplete]);

  // Click or touch immediately triggers upward wipe
  const handleSkip = () => {
    if (phase !== 'wipe' && phase !== 'done') {
      setPhase('wipe');
      setTimeout(() => {
        setPhase('done');
        if (onComplete) onComplete();
      }, 650);
    }
  };

  if (phase === 'done') return null;

  const isWiping = phase === 'wipe';
  const showLogo = phase === 'logo' || phase === 'wipe';

  return (
    <div
      onClick={handleSkip}
      className="fixed inset-0 z-[9999] overflow-hidden select-none cursor-pointer"
      style={{
        transform: isWiping ? 'translateY(-100%)' : 'translateY(0%)',
        transition: 'transform 0.75s cubic-bezier(0.86, 0, 0.07, 1)',
        willChange: 'transform',
      }}
      aria-label="Tunikabond Lider brendining ochilish animatsiyasi"
    >
      {/* Background Matte Dark Void */}
      <div className="absolute inset-0 bg-[#080B10] flex flex-col items-center justify-center p-6">
        
        {/* Subtle Warm Halo in Center */}
        <div 
          className="absolute w-[450px] h-[450px] rounded-full bg-brand-red/15 blur-[120px] pointer-events-none transition-opacity duration-700"
          style={{ opacity: showLogo ? 0.6 : 0.2 }}
        />

        {/* Skip button in top right */}
        <button
          type="button"
          onClick={handleSkip}
          className="absolute top-6 right-6 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-xs font-semibold border border-white/10 transition-all z-20"
        >
          <span>O'tkazish</span>
          <ArrowRight className="w-3.5 h-3.5 text-brand-red" />
        </button>

        {/* Central Animation Stage */}
        <div className="relative flex flex-col items-center justify-center z-10">
          
          {/* 1. Pulsing Concentric Rings (Phase: Ring) */}
          <div 
            className={`relative flex items-center justify-center transition-all duration-500 ${
              showLogo ? 'scale-110 opacity-0 absolute pointer-events-none' : 'scale-100 opacity-100'
            }`}
          >
            {/* Outer expanding ring */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 border-white/80 animate-ping opacity-30 absolute" />
            
            {/* Concentric middle ring with red glow */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border border-white/40 shadow-[0_0_20px_rgba(255,255,255,0.4)] flex items-center justify-center">
              {/* Inner solid white core dot */}
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white shadow-[0_0_15px_#ffffff]" />
            </div>
          </div>

          {/* 2. Logo & Brand Typography Reveal (Phase: Logo) */}
          <div 
            className={`flex flex-col items-center gap-4 transition-all duration-500 ease-out ${
              showLogo ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-90 translate-y-3 pointer-events-none'
            }`}
          >
            {/* Logo Emblem Icon */}
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-white/10 to-transparent border border-white/15 p-3 flex items-center justify-center shadow-[0_0_30px_rgba(196,0,0,0.5)]">
              <img
                src="/favi.svg"
                alt="Tunikabond Lider"
                className="w-full h-full object-contain filter drop-shadow-[0_4px_12px_rgba(196,0,0,0.8)]"
              />
            </div>

            {/* Typography */}
            <div className="text-center space-y-1">
              <h1 className="font-display font-extrabold text-2xl sm:text-4xl text-white tracking-widest flex items-center justify-center gap-2">
                <span>TUNIKABOND</span>
                <span className="text-brand-red font-black">LIDER</span>
              </h1>
              <p className="text-[11px] sm:text-xs font-mono uppercase tracking-[0.25em] text-slate-400">
                Arxitektura • Fasad • Naves
              </p>
            </div>
          </div>

        </div>

        {/* Bottom subtle brand tagline */}
        <div className="absolute bottom-8 text-center">
          <span className="text-[10px] font-mono tracking-widest uppercase text-slate-500">
            Premium Fasad Tizimlari
          </span>
        </div>

      </div>
    </div>
  );
};
