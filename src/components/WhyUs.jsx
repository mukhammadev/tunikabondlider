import React from 'react';
import { ShieldCheck, Ruler, Clock, Banknote, SunMedium, Eye, CheckCircle2, Sparkles, ArrowRight } from 'lucide-react';

export const WhyUs = ({ t }) => {
  return (
    <section id="why-us" className="py-16 sm:py-24 relative overflow-hidden bg-brand-surface/40">
      {/* Ambient background glows */}
      <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-brand-red/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-brand-amber/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-red/10 border border-brand-red/30 text-brand-red text-xs font-bold uppercase tracking-wider mb-4">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{t.whyUs.badge}</span>
          </div>
          <h2 className="font-display font-extrabold text-2xl sm:text-4xl lg:text-5xl light:text-slate-900 text-white tracking-tight mb-4">
            {t.whyUs.title}
          </h2>
          <p className="light:text-slate-600 text-slate-300 text-sm sm:text-lg">
            {t.whyUs.subtitle}
          </p>
        </div>

        {/* Bento Grid Layout (Gcore video style frame 00:16-00:17) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          
          {/* Bento Card 1: 10 Yillik Kafolat (Spans 2 cols on md/lg) */}
          <div className="md:col-span-2 glass-panel p-5 sm:p-8 rounded-3xl relative overflow-hidden group hover:border-brand-red/50 transition-all hover:-translate-y-1">
            <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-brand-red/10 rounded-full blur-2xl group-hover:bg-brand-red/20 transition-colors pointer-events-none" />
            
            <div className="flex items-center justify-between mb-6">
              <div className="w-14 h-14 rounded-2xl bg-brand-red/15 flex items-center justify-center text-brand-red shadow-glow-red group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <span className="px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-brand-red/20 text-brand-red border border-brand-red/30">
                10 YIL KAFOLAT
              </span>
            </div>

            <h3 className="font-display font-bold text-xl sm:text-2xl light:text-slate-900 text-white mb-3 group-hover:text-brand-red transition-colors">
              {t.whyUs.p1Title}
            </h3>
            <p className="light:text-slate-600 text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl">
              {t.whyUs.p1Desc}
            </p>

            <div className="mt-6 pt-4 light:border-black/5 border-t border-white/5 flex flex-wrap items-center gap-4 text-xs light:text-slate-500 text-slate-400">
              <span className="flex items-center gap-1.5 font-bold light:text-slate-900 text-white">
                <Sparkles className="w-3.5 h-3.5 text-brand-red" />
                Yuridik Shartnoma
              </span>
              <span>•</span>
              <span>Zavod Sertifikati</span>
              <span>•</span>
              <span className="text-emerald-400 font-bold">100% Ishonch</span>
            </div>
          </div>

          {/* Bento Card 2: Lazerli O'lchov (Spans 1 col) */}
          <div className="glass-panel p-5 sm:p-8 rounded-3xl relative overflow-hidden group hover:border-brand-red/50 transition-all hover:-translate-y-1">
            <div className="w-14 h-14 rounded-2xl bg-brand-red/15 flex items-center justify-center text-brand-red shadow-glow-red group-hover:scale-110 transition-transform mb-6">
              <Ruler className="w-7 h-7" />
            </div>

            <div className="inline-block px-2.5 py-0.5 rounded text-[10px] font-mono font-bold light:bg-black/5 bg-white/5 light:text-slate-500 text-slate-400 light:border-black/10 border border-white/10 mb-3">
              MILLIMETR ANIKLIK
            </div>

            <h3 className="font-display font-bold text-lg sm:text-xl light:text-slate-900 text-white mb-2 group-hover:text-brand-red transition-colors">
              {t.whyUs.p2Title}
            </h3>
            <p className="light:text-slate-600 text-slate-300 text-sm leading-relaxed">
              {t.whyUs.p2Desc}
            </p>
          </div>

          {/* Bento Card 3: Tezkor Montaj (Spans 1 col) */}
          <div className="glass-panel p-5 sm:p-8 rounded-3xl relative overflow-hidden group hover:border-brand-red/50 transition-all hover:-translate-y-1">
            <div className="w-14 h-14 rounded-2xl bg-brand-red/15 flex items-center justify-center text-brand-red shadow-glow-red group-hover:scale-110 transition-transform mb-6">
              <Clock className="w-7 h-7" />
            </div>

            <div className="inline-block px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-3">
              O'Z VAQTIDA
            </div>

            <h3 className="font-display font-bold text-lg sm:text-xl light:text-slate-900 text-white mb-2 group-hover:text-brand-red transition-colors">
              {t.whyUs.p3Title}
            </h3>
            <p className="light:text-slate-600 text-slate-300 text-sm leading-relaxed">
              {t.whyUs.p3Desc}
            </p>
          </div>

          {/* Bento Card 4: Zavod Narxi (Spans 2 cols on md/lg) */}
          <div className="md:col-span-2 glass-panel p-5 sm:p-8 rounded-3xl relative overflow-hidden group hover:border-brand-red/50 transition-all hover:-translate-y-1">
            <div className="flex items-center justify-between mb-6">
              <div className="w-14 h-14 rounded-2xl bg-brand-red/15 flex items-center justify-center text-brand-red shadow-glow-red group-hover:scale-110 transition-transform">
                <Banknote className="w-7 h-7" />
              </div>
              <span className="px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                O'RTAKASHLARSIZ
              </span>
            </div>

            <h3 className="font-display font-bold text-xl sm:text-2xl light:text-slate-900 text-white mb-3 group-hover:text-brand-red transition-colors">
              {t.whyUs.p4Title}
            </h3>
            <p className="light:text-slate-600 text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl">
              {t.whyUs.p4Desc}
            </p>

            <div className="mt-6 pt-4 light:border-black/5 border-t border-white/5 flex flex-wrap items-center gap-4 text-xs light:text-slate-500 text-slate-400">
              <span className="light:text-slate-900 text-white font-bold">1 m² 75 000 so'mdan</span>
              <span>•</span>
              <span>Halol hisob-kitob</span>
              <span>•</span>
              <span className="text-brand-red font-bold">Zavod kafolati</span>
            </div>
          </div>

          {/* Bento Card 5: Ob-havoga Chidamlilik (Spans 1 col) */}
          <div className="glass-panel p-5 sm:p-8 rounded-3xl relative overflow-hidden group hover:border-brand-red/50 transition-all hover:-translate-y-1">
            <div className="w-14 h-14 rounded-2xl bg-brand-red/15 flex items-center justify-center text-brand-red shadow-glow-red group-hover:scale-110 transition-transform mb-6">
              <SunMedium className="w-7 h-7" />
            </div>

            <div className="inline-block px-2.5 py-0.5 rounded text-[10px] font-mono font-bold light:bg-black/5 bg-white/5 light:text-slate-500 text-slate-400 light:border-black/10 border border-white/10 mb-3">
              -40°C DAN +60°C GACHA
            </div>

            <h3 className="font-display font-bold text-lg sm:text-xl light:text-slate-900 text-white mb-2 group-hover:text-brand-red transition-colors">
              {t.whyUs.p5Title}
            </h3>
            <p className="light:text-slate-600 text-slate-300 text-sm leading-relaxed">
              {t.whyUs.p5Desc}
            </p>
          </div>

          {/* Bento Card 6: 3D Vizualizatsiya (Spans 2 cols on md/lg) */}
          <div className="md:col-span-2 glass-panel p-5 sm:p-8 rounded-3xl relative overflow-hidden group hover:border-brand-red/50 transition-all hover:-translate-y-1">
            <div className="flex items-center justify-between mb-6">
              <div className="w-14 h-14 rounded-2xl bg-brand-red/15 flex items-center justify-center text-brand-red shadow-glow-red group-hover:scale-110 transition-transform">
                <Eye className="w-7 h-7" />
              </div>
              <span className="px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-sky-500/20 text-sky-400 border border-sky-500/30">
                3D MODELLASHTIRISH
              </span>
            </div>

            <h3 className="font-display font-bold text-xl sm:text-2xl light:text-slate-900 text-white mb-3 group-hover:text-brand-red transition-colors">
              {t.whyUs.p6Title}
            </h3>
            <p className="light:text-slate-600 text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl">
              {t.whyUs.p6Desc}
            </p>

            <div className="mt-6 pt-4 light:border-black/5 border-t border-white/5 flex items-center gap-2 text-xs text-brand-red font-bold">
              <span>Binongizni qurilishdan oldin ko'ring</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
