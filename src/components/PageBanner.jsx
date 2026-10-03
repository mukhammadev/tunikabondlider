import React from 'react';
import { ArrowLeft, Sparkles, Home } from 'lucide-react';

export const PageBanner = ({ 
  title, 
  subtitle, 
  badge, 
  breadcrumb, 
  homeText = "Bosh sahifa",
  onBackToHome 
}) => {
  return (
    <div className="relative pt-28 sm:pt-36 pb-10 sm:pb-14 px-4 sm:px-6 lg:px-8 border-b border-slate-200 dark:border-white/10 overflow-hidden bg-gradient-to-b from-slate-100/80 via-white to-white dark:from-[#0d1222]/80 dark:via-brand-dark dark:to-brand-dark">
      {/* Background ambient glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-brand-red/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Breadcrumbs & Return button */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-5">
          <button
            type="button"
            onClick={onBackToHome}
            className="inline-flex items-center gap-1.5 hover:text-brand-red transition-colors cursor-pointer group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
            <span className="flex items-center gap-1">
              <Home className="w-3 h-3 text-brand-red" />
              {homeText}
            </span>
          </button>
          <span className="text-slate-400">/</span>
          <span className="text-brand-red font-bold">{breadcrumb}</span>
        </div>

        {/* Badge */}
        {badge && (
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-red/10 border border-brand-red/30 text-brand-red text-xs font-bold uppercase tracking-wider mb-4 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{badge}</span>
          </div>
        )}

        {/* Main Title */}
        <h1 className="font-display font-extrabold text-3xl sm:text-5xl text-slate-900 dark:text-white tracking-tight mb-4 leading-tight">
          {title}
        </h1>

        {/* Subtitle */}
        {subtitle && (
          <p className="text-sm sm:text-lg text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed">
            {subtitle}
          </p>
        )}

      </div>
    </div>
  );
};
