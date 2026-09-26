import React, { useState, useEffect } from 'react';
import { Sparkles, Shield, ArrowRight } from 'lucide-react';

/**
 * Architectural Composite Shutter & Laser Facade Reveal
 * Realistic mechanical opening inspired by luxury architectural facade studios (Awwwards standard).
 * Replaces fake percent loading bars with a genuine physical split-panel reveal.
 */
export const BrandIntro = ({ onComplete }) => {
  const [stage, setStage] = useState('sealed'); // 'sealed' -> 'cutting' -> 'parting' -> 'complete'

  useEffect(() => {
    // Stage 1: Laser seam ignition at 250ms
    const t1 = setTimeout(() => {
      setStage('cutting');
    }, 250);

    // Stage 2: Mechanical shutter parting at 850ms
    const t2 = setTimeout(() => {
      setStage('parting');
    }, 850);

    // Stage 3: Fully unmount at 1800ms
    const t3 = setTimeout(() => {
      setStage('complete');
      if (onComplete) onComplete();
    }, 1800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onComplete]);

  // Fast skip on click or keypress
  const handleImmediateOpen = () => {
    if (stage !== 'parting' && stage !== 'complete') {
      setStage('parting');
      setTimeout(() => {
        setStage('complete');
        if (onComplete) onComplete();
      }, 700);
    }
  };

  if (stage === 'complete') return null;

  const isParting = stage === 'parting';
  const isCutting = stage === 'cutting' || stage === 'parting';

  return (
    <div
      onClick={handleImmediateOpen}
      className={`fixed inset-0 z-[9999] overflow-hidden select-none cursor-pointer transition-opacity duration-500 ${
        isParting ? 'pointer-events-none' : 'pointer-events-auto'
      }`}
      aria-label="Tunikabond Lider arxitektura panellari ochilishi"
    >
      {/* ================= LEFT ARCHITECTURAL SHUTTER PANEL ================= */}
      <div
        className="absolute top-0 left-0 bottom-0 w-1/2 bg-[#080B11] border-r border-brand-red/30 z-20 flex flex-col justify-between p-6 sm:p-12 overflow-hidden shadow-[25px_0_50px_rgba(0,0,0,0.8)]"
        style={{
          transform: isParting ? 'translateX(-102%)' : 'translateX(0%)',
          transition: 'transform 0.95s cubic-bezier(0.77, 0, 0.175, 1)',
          willChange: 'transform',
          backgroundImage: `
            linear-gradient(135deg, rgba(255,255,255,0.03) 0%, transparent 60%),
            linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)
          `,
          backgroundSize: '100% 100%, 32px 32px, 32px 32px',
        }}
      >
        {/* Brushed metal sheen overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent pointer-events-none" />

        {/* Top-left corner technical mark */}
        <div className="flex items-center gap-2 text-slate-500 font-mono text-[10px] tracking-widest uppercase">
          <span className="w-2 h-2 rounded-full bg-brand-red animate-ping" />
          <span>FASAD TIZIMLARI • STANDART ISO 9001</span>
        </div>

        {/* Left half branding text */}
        <div className="my-auto self-end text-right pr-4 sm:pr-8">
          <span className="text-[11px] font-mono tracking-[0.25em] text-brand-red uppercase block mb-1">
            Premium Fasad & Naves
          </span>
          <div className="text-3xl sm:text-5xl md:text-6xl font-black font-display text-white tracking-wider">
            TUNIKABOND
          </div>
        </div>

        {/* Bottom indicator */}
        <div className="text-slate-500 text-[11px] font-medium flex items-center gap-2">
          <Shield className="w-3.5 h-3.5 text-brand-red" />
          <span>10 Yillik Kafolatlangan Sifat</span>
        </div>
      </div>

      {/* ================= RIGHT ARCHITECTURAL SHUTTER PANEL ================= */}
      <div
        className="absolute top-0 right-0 bottom-0 w-1/2 bg-[#080B11] border-l border-brand-red/30 z-20 flex flex-col justify-between p-6 sm:p-12 overflow-hidden shadow-[-25px_0_50px_rgba(0,0,0,0.8)]"
        style={{
          transform: isParting ? 'translateX(102%)' : 'translateX(0%)',
          transition: 'transform 0.95s cubic-bezier(0.77, 0, 0.175, 1)',
          willChange: 'transform',
          backgroundImage: `
            linear-gradient(225deg, rgba(255,255,255,0.03) 0%, transparent 60%),
            linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)
          `,
          backgroundSize: '100% 100%, 32px 32px, 32px 32px',
        }}
      >
        {/* Brushed metal sheen overlay */}
        <div className="absolute inset-0 bg-gradient-to-l from-transparent via-white/[0.02] to-transparent pointer-events-none" />

        {/* Top-right skip hint */}
        <div className="self-end flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-slate-400 hover:text-white text-xs font-semibold transition-all">
          <span>Ochish</span>
          <ArrowRight className="w-3.5 h-3.5 text-brand-red" />
        </div>

        {/* Right half branding text */}
        <div className="my-auto self-start pl-4 sm:pr-8">
          <span className="text-[11px] font-mono tracking-[0.25em] text-slate-400 uppercase block mb-1">
            Zavod Narxlari
          </span>
          <div className="text-3xl sm:text-5xl md:text-6xl font-black font-display text-brand-red tracking-wider">
            LIDER
          </div>
        </div>

        {/* Bottom indicator */}
        <div className="self-end text-slate-500 font-mono text-[11px] tracking-wider">
          O'ZBEKISTON BO'YICHA #1
        </div>
      </div>

      {/* ================= CENTER VERTICAL LASER CUT SEAM ================= */}
      <div
        className={`absolute top-0 bottom-0 left-1/2 -translate-x-1/2 z-30 pointer-events-none transition-all duration-300 ${
          isParting ? 'opacity-0 scale-y-125' : 'opacity-100 scale-y-100'
        }`}
      >
        {/* Glowing laser line */}
        <div
          className={`w-[2px] h-full bg-gradient-to-b from-transparent via-white to-transparent transition-all duration-500 ${
            isCutting
              ? 'shadow-[0_0_20px_#ff2222,0_0_40px_#ff2222,0_0_60px_#ffffff]'
              : 'shadow-none opacity-40'
          }`}
        />

        {/* Laser beam spark point moving down */}
        {isCutting && (
          <div
            className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white shadow-[0_0_30px_#ff0000,0_0_50px_#ffffff] animate-ping"
          />
        )}
      </div>

      {/* ================= CENTER METALLIC EMBLEM MEDALLION ================= */}
      <div
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 flex flex-col items-center pointer-events-none transition-all duration-700 ease-out ${
          isParting ? 'opacity-0 scale-125 blur-sm' : 'opacity-100 scale-100'
        }`}
      >
        <div className="relative flex items-center justify-center">
          {/* Subtle glowing halo */}
          <div className="absolute w-36 h-36 rounded-full bg-brand-red/30 blur-2xl animate-pulse" />

          {/* Precision outer metallic ring */}
          <div className="absolute w-28 h-28 rounded-full border border-brand-red/50 shadow-[0_0_25px_rgba(196,0,0,0.4)]" />

          {/* Emblem container */}
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-[#1c2433] via-[#0c1017] to-black border-2 border-brand-red shadow-glow-red flex items-center justify-center p-3 relative overflow-hidden">
            {/* Real specular shimmer beam sweeping across */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_1.8s_infinite]" />

            <img
              src="/favi.svg"
              alt="Tunikabond Lider Emblem"
              className="w-12 h-12 sm:w-16 sm:h-16 object-contain drop-shadow-[0_4px_12px_rgba(196,0,0,0.8)]"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
        </div>

        {/* Sub-label under medallion */}
        <div className="mt-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 border border-brand-red/40 backdrop-blur-md text-[11px] font-bold text-slate-300 shadow-lg">
          <Sparkles className="w-3 h-3 text-brand-red" />
          <span>Zamonaviy Fasad Arxitekturasi</span>
        </div>
      </div>
    </div>
  );
};
