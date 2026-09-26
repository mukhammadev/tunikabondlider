import React from 'react';
import { ArrowRight, ShieldCheck, Award, Ruler, CheckCircle2, Sparkles, Building2 } from 'lucide-react';

export const Hero = ({ t, onOpenLeadModal }) => {
  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
      {/* Background Decorative Gradients & Grid */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-gold/10 rounded-full blur-[140px]" />
        <div className="absolute -top-40 right-10 w-[400px] h-[400px] bg-brand-blue/10 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293710_1px,transparent_1px),linear-gradient(to_bottom,#1f293710_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          
          {/* Top Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-gold/10 border border-brand-gold/30 text-brand-gold text-xs sm:text-sm font-semibold mb-6 animate-pulse">
            <Sparkles className="w-4 h-4 text-brand-amber" />
            <span>{t.hero.badge}</span>
          </div>

          {/* Main Headline */}
          <h1 className="font-display font-extrabold text-3xl sm:text-5xl md:text-6xl text-white tracking-tight leading-[1.15] mb-6">
            {t.hero.titleStart}{' '}
            <span className="gold-gradient-text block sm:inline">
              {t.hero.titleHighlight}
            </span>{' '}
            {t.hero.titleEnd}
          </h1>

          {/* Subheadline (John Caples Rule) */}
          <p className="text-base sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed mb-10 font-normal">
            {t.hero.subtitle}
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <a
              href="#calculator"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-brand-amber to-brand-gold text-brand-dark font-bold text-base shadow-glow hover:shadow-glow-lg hover:scale-105 active:scale-95 transition-all"
            >
              <span>{t.hero.ctaCalculate}</span>
              <ArrowRight className="w-5 h-5" />
            </a>

            <a
              href="#products"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-brand-surface/80 hover:bg-brand-surface border border-white/10 text-white font-semibold text-base hover:border-brand-gold/40 transition-all hover:scale-105 active:scale-95"
            >
              <Building2 className="w-5 h-5 text-brand-gold" />
              <span>{t.hero.ctaCatalog}</span>
            </a>
          </div>

          {/* 4 Hard Numbers / Trust Proof Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 pt-8 border-t border-white/10 text-left">
            
            <div className="glass-card p-4 sm:p-5 rounded-2xl">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-brand-gold/15 flex items-center justify-center text-brand-gold">
                  <Award className="w-5 h-5" />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-white font-display">6+</div>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 font-medium">{t.hero.statExp}</p>
            </div>

            <div className="glass-card p-4 sm:p-5 rounded-2xl">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-brand-gold/15 flex items-center justify-center text-brand-gold">
                  <Building2 className="w-5 h-5" />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-white font-display">350+</div>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 font-medium">{t.hero.statProjects}</p>
            </div>

            <div className="glass-card p-4 sm:p-5 rounded-2xl">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-brand-gold/15 flex items-center justify-center text-brand-gold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-white font-display">10 Yil</div>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 font-medium">{t.hero.statWarranty}</p>
            </div>

            <div className="glass-card p-4 sm:p-5 rounded-2xl">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-brand-gold/15 flex items-center justify-center text-brand-gold">
                  <Ruler className="w-5 h-5" />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-brand-gold font-display">100%</div>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 font-medium">{t.hero.statMeasurement}</p>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};
