import React from 'react';
import { PhoneCall, Ruler, Truck, ShieldCheck } from 'lucide-react';

export const Process = ({ t }) => {
  const steps = [
    {
      num: "01",
      icon: PhoneCall,
      title: t.process.s1Title,
      desc: t.process.s1Desc
    },
    {
      num: "02",
      icon: Ruler,
      title: t.process.s2Title,
      desc: t.process.s2Desc
    },
    {
      num: "03",
      icon: Truck,
      title: t.process.s3Title,
      desc: t.process.s3Desc
    },
    {
      num: "04",
      icon: ShieldCheck,
      title: t.process.s4Title,
      desc: t.process.s4Desc
    }
  ];

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-red/10 border border-brand-red/30 text-brand-red text-xs font-bold uppercase tracking-wider mb-4">
            <span>{t.process.badge}</span>
          </div>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight mb-4">
            {t.process.title}
          </h2>
          <p className="text-slate-300 text-base sm:text-lg">
            {t.process.subtitle}
          </p>
        </div>

        {/* 4 Steps Timeline Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div 
                key={idx} 
                className="glass-card p-6 rounded-3xl relative flex flex-col justify-between group hover:border-brand-red/40"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-brand-red/15 flex items-center justify-center text-brand-red group-hover:bg-brand-red group-hover:text-white transition-all shadow-glow-red">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="font-display font-black text-2xl text-slate-600 group-hover:text-brand-red transition-colors">
                      {step.num}
                    </span>
                  </div>

                  <h3 className="font-display font-bold text-lg text-white mb-2 group-hover:text-brand-red transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {step.desc}
                  </p>
                </div>

                <div className="pt-4 mt-6 border-t border-white/10 flex items-center text-xs font-semibold text-brand-red">
                  <span>Qadam {idx + 1} / 4</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
