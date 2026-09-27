import React, { useState, useEffect } from 'react';
import { ArrowRight, ShieldCheck, Award, Ruler, Building2, Sparkles, CheckCircle2 } from 'lucide-react';

export const Hero = ({ t, onOpenLeadModal, onNavigate }) => {
  // Animated counters for trust metrics
  const [counts, setCounts] = useState({ exp: 0, projects: 0, warranty: 0, measure: 0 });

  useEffect(() => {
    const duration = 1200; // ms
    const steps = 30;
    const intervalTime = duration / steps;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      // Ease-out cubic
      const ease = 1 - Math.pow(1 - progress, 3);

      setCounts({
        exp: Math.round(6 * ease),
        projects: Math.round(2000 * ease),
        warranty: Math.round(10 * ease),
        measure: Math.round(100 * ease),
      });

      if (step >= steps) {
        clearInterval(timer);
        setCounts({ exp: 6, projects: 2000, warranty: 10, measure: 100 });
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, []);

  const handleCalcClick = (e) => {
    e.preventDefault();
    if (onNavigate) {
      onNavigate('calculator');
    } else {
      const el = document.getElementById('calculator');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleCatalogClick = (e) => {
    e.preventDefault();
    if (onNavigate) {
      onNavigate('products');
    } else {
      const el = document.getElementById('products');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
      {/* Background Decorative Ambient Gradients (Clean, zero lines) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-red/10 rounded-full blur-[150px]" />
        <div className="absolute -top-40 right-10 w-[400px] h-[400px] bg-brand-amber/5 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          
          {/* Top Magnetic Availability Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-surface/90 border border-brand-red/40 text-xs sm:text-sm font-semibold mb-6 shadow-glow backdrop-blur-md">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-slate-600 dark:text-slate-300 font-medium">Bugun navbatsiz bepul o'lchov:</span>
            <span className="text-brand-red font-bold font-mono">3 ta bo'sh vaqt</span>
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          </div>

          {/* Main Headline */}
          <h1 className="font-display font-extrabold text-3xl sm:text-5xl md:text-6xl text-slate-900 dark:text-white tracking-tight leading-[1.15] mb-6">
            {t.hero.titleStart}{' '}
            <span className="red-gradient-text block sm:inline">
              {t.hero.titleHighlight}
            </span>{' '}
            {t.hero.titleEnd}
          </h1>

          {/* Subheadline (John Caples Rule) */}
          <p className="text-base sm:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed mb-10 font-normal">
            {t.hero.subtitle}
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <button
              type="button"
              onClick={handleCalcClick}
              className="w-full sm:w-auto relative group overflow-hidden inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-brand-redLight via-brand-red to-brand-redHover text-white font-bold text-base shadow-glow-red hover:shadow-glow-red-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              {/* Metallic specular light sweep */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
              <span>{t.hero.ctaCalculate}</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              type="button"
              onClick={handleCatalogClick}
              className="w-full sm:w-auto relative group overflow-hidden inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-slate-100 dark:bg-brand-surface/80 hover:bg-slate-200 dark:hover:bg-brand-surface border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-semibold text-base hover:border-brand-red/40 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Building2 className="w-5 h-5 text-brand-red" />
              <span>{t.hero.ctaCatalog}</span>
            </button>
          </div>

          {/* 4 Hard Numbers / Trust Proof Cards with Dynamic Count-Up */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 pt-4 text-left">
            
            <div className="glass-card p-4 sm:p-5 rounded-2xl relative overflow-hidden group hover:border-brand-red/50">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-brand-red/15 flex items-center justify-center text-brand-red group-hover:scale-110 transition-transform">
                  <Award className="w-5 h-5" />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-display">
                  {counts.exp}+
                </div>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">{t.hero.statExp}</p>
            </div>

            <div className="glass-card p-4 sm:p-5 rounded-2xl relative overflow-hidden group hover:border-brand-red/50">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-brand-red/15 flex items-center justify-center text-brand-red group-hover:scale-110 transition-transform">
                  <Building2 className="w-5 h-5" />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-display">
                  {counts.projects}+
                </div>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">{t.hero.statProjects}</p>
            </div>

            <div className="glass-card p-4 sm:p-5 rounded-2xl relative overflow-hidden group hover:border-brand-red/50">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-brand-red/15 flex items-center justify-center text-brand-red group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-display">
                  {counts.warranty} Yil
                </div>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">{t.hero.statWarranty}</p>
            </div>

            <div className="glass-card p-4 sm:p-5 rounded-2xl relative overflow-hidden group hover:border-brand-red/50">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-brand-red/15 flex items-center justify-center text-brand-red group-hover:scale-110 transition-transform">
                  <Ruler className="w-5 h-5" />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-brand-red font-display">
                  {counts.measure}%
                </div>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">{t.hero.statMeasurement}</p>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};
