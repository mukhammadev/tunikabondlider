import React, { useState } from 'react';
import { faqs } from '../data/faq';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

export const FAQ = ({ currentLang, t }) => {
  const [openIndex, setOpenIndex] = useState(0);

  const toggle = (idx) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-24 relative overflow-hidden bg-brand-surface/30">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-red/10 border border-brand-red/30 text-brand-red text-xs font-bold uppercase tracking-wider mb-4">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>{t.faq.badge}</span>
          </div>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-slate-900 dark:text-white tracking-tight mb-4">
            {t.faq.title}
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg">
            {t.faq.subtitle}
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-4">
          {faqs.map((item, i) => {
            const isOpen = openIndex === i;
            const q = item.q[currentLang] || item.q.uz;
            const a = item.a[currentLang] || item.a.uz;

            return (
              <div 
                key={i}
                className="glass-card rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 transition-colors hover:border-brand-red/40"
              >
                <button
                  type="button"
                  onClick={() => toggle(i)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 font-display font-bold text-base sm:text-lg text-slate-900 dark:text-white hover:text-brand-red transition-colors"
                >
                  <span>{q}</span>
                  <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center flex-shrink-0 text-brand-red">
                    {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-6 sm:px-6 text-slate-600 dark:text-slate-300 text-sm leading-relaxed border-t border-slate-200 dark:border-white/5 pt-4 animate-fadeIn">
                    {a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
