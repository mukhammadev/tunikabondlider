import React from 'react';
import { ShieldCheck, Ruler, Clock, Banknote, SunMedium, Eye, CheckCircle2 } from 'lucide-react';

export const WhyUs = ({ t }) => {
  const pillars = [
    {
      icon: ShieldCheck,
      title: t.whyUs.p1Title,
      desc: t.whyUs.p1Desc,
    },
    {
      icon: Ruler,
      title: t.whyUs.p2Title,
      desc: t.whyUs.p2Desc,
    },
    {
      icon: Clock,
      title: t.whyUs.p3Title,
      desc: t.whyUs.p3Desc,
    },
    {
      icon: Banknote,
      title: t.whyUs.p4Title,
      desc: t.whyUs.p4Desc,
    },
    {
      icon: SunMedium,
      title: t.whyUs.p5Title,
      desc: t.whyUs.p5Desc,
    },
    {
      icon: Eye,
      title: t.whyUs.p6Title,
      desc: t.whyUs.p6Desc,
    },
  ];

  return (
    <section id="why-us" className="py-24 relative overflow-hidden bg-brand-surface/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-red/10 border border-brand-red/30 text-brand-red text-xs font-bold uppercase tracking-wider mb-4">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{t.whyUs.badge}</span>
          </div>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight mb-4">
            {t.whyUs.title}
          </h2>
          <p className="text-slate-300 text-base sm:text-lg">
            {t.whyUs.subtitle}
          </p>
        </div>

        {/* 6 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {pillars.map((item, i) => {
            const Icon = item.icon;
            return (
              <div 
                key={i} 
                className="glass-card p-8 rounded-3xl group hover:border-brand-red/50 transition-all hover:translate-y-[-4px]"
              >
                <div className="w-14 h-14 rounded-2xl bg-brand-red/15 flex items-center justify-center text-brand-red mb-6 group-hover:scale-110 group-hover:bg-brand-red group-hover:text-white transition-all shadow-glow-red">
                  <Icon className="w-7 h-7" />
                </div>
                <h3 className="font-display font-bold text-xl text-white mb-3 group-hover:text-brand-red transition-colors">
                  {item.title}
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
