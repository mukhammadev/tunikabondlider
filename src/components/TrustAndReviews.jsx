import React, { useState } from 'react';
import { ShieldCheck, Award, Star, CheckCircle, FileText, ExternalLink, ThumbsUp, Quote } from 'lucide-react';

export const TrustAndReviews = ({ t, currentLang = 'uz', onOpenLeadModal }) => {
  const [selectedCert, setSelectedCert] = useState(null);

  const tr = t?.trustReviews || {};

  const certIcons = [Award, FileText, ShieldCheck];

  const certificates = (tr.certificates || []).map((c, idx) => ({
    ...c,
    icon: certIcons[idx] || Award
  }));

  const reviews = tr.reviews || [];

  return (
    <section id="trust-reviews" className="py-20 sm:py-28 relative overflow-hidden bg-brand-surface/30">
      
      {/* Background ambient red glow */}
      <div className="absolute top-1/3 left-0 w-[500px] h-[500px] bg-brand-red/5 rounded-full blur-[140px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section 1: Official Warranty & Certifications */}
        <div className="mb-20">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-300 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-4">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{tr.badgeWarranty || "Ishonch va Kafolat"}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
              {tr.titleWarrantyStart || "Rasmiy Kafolat va"}{' '}
              <span className="red-gradient-text">{tr.titleWarrantyHighlight || "Sifat Sertifikatlari"}</span>
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg">
              {tr.subtitleWarranty || "Biz faqat so'zda emas, balki qonuniy kuchga ega 10 yillik rasmiy shartnoma va sifat sertifikatlari bilan xizmat ko'rsatamiz."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {certificates.map((cert, idx) => {
              const Icon = cert.icon;
              return (
                <div
                  key={idx}
                  className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-white/10 hover:border-brand-red/40 hover:shadow-glow-red/20 transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-brand-red/10 border border-brand-red/30 flex items-center justify-center text-brand-red group-hover:scale-110 transition-transform">
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-100 dark:bg-white/10 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-white/10">
                        {cert.badge}
                      </span>
                    </div>

                    <h3 className="font-display font-bold text-lg sm:text-xl text-slate-900 dark:text-white mb-3">
                      {cert.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      {cert.desc}
                    </p>
                  </div>

                  <div className="pt-6 mt-6 border-t border-slate-200 dark:border-white/10 flex items-center gap-2 text-xs font-semibold text-brand-red">
                    <CheckCircle className="w-4 h-4" />
                    <span>{tr.contractRecorded || "Har bir shartnomada qayd etiladi"}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 2: Real Customer Reviews */}
        <div>
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-red/10 border border-brand-red/30 text-brand-red text-xs font-bold uppercase tracking-wider mb-4">
              <ThumbsUp className="w-3.5 h-3.5" />
              <span>{tr.badgeReviews || "Mijozlarimiz Fikrlari"}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
              {tr.titleReviewsStart || "Mijozlarimiz Biz Haqimizda"}{' '}
              <span className="red-gradient-text">{tr.titleReviewsHighlight || "Nima Deydi?"}</span>
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg">
              {tr.subtitleReviews || "Yuzlab muvaffaqiyatli topshirilgan fasad va tom loyihalarimiz egalarining samimiy baholari."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {reviews.map((rev, idx) => (
              <div
                key={idx}
                className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-white/10 flex flex-col justify-between relative hover:border-brand-red/40 transition-all shadow-lg hover:shadow-glow-red/10"
              >
                <div>
                  {/* Rating Stars */}
                  <div className="flex items-center gap-1 mb-4 text-amber-500 dark:text-amber-400">
                    {[...Array(rev.rating || 5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-500 dark:fill-amber-400" />
                    ))}
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400 ml-2">5.0 / 5.0</span>
                  </div>

                  {/* Comment with clean styling and no overlapping icon */}
                  <div className="mb-6 pl-3.5 border-l-2 border-brand-red/70 py-1 bg-slate-100/80 dark:bg-white/[0.02] rounded-r-xl">
                    <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                      {rev.comment}
                    </p>
                  </div>
                </div>

                {/* Author Info */}
                <div className="pt-4 border-t border-slate-200 dark:border-white/10 flex items-center justify-between">
                  <div>
                    <h4 className="font-display font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                      {rev.name}
                    </h4>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">{rev.role}</p>
                    <p className="text-[10px] text-brand-red font-semibold mt-0.5">{rev.project}</p>
                  </div>
                  <span className="text-[10px] text-slate-600 dark:text-slate-400 font-medium">{rev.date}</span>
                </div>
              </div>
            ))}
          </div>

          {/* CTA Box */}
          <div className="mt-14 p-8 rounded-3xl bg-white dark:bg-gradient-to-r dark:from-brand-surface dark:via-brand-surface/90 dark:to-brand-surface border border-slate-200 dark:border-brand-red/30 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="font-display font-bold text-xl sm:text-2xl text-slate-900 dark:text-white">
                {tr.ctaBoxTitle || "Binongiz uchun eng sifatli fasad yechimini xohlaysizmi?"}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1">
                {tr.ctaBoxSubtitle || "Katalog va hisob-kitob bilan tanishish uchun usta-muhandisimiz bilan bepul bog'laning."}
              </p>
            </div>
            <button
              onClick={() => onOpenLeadModal(tr.ctaBoxBtn || "Bepul O'lchashga Buyurtma")}
              className="px-6 py-3.5 rounded-2xl bg-brand-red hover:bg-brand-redHover text-white text-sm font-bold shadow-glow-red hover:scale-105 active:scale-95 transition-all shrink-0 cursor-pointer"
            >
              {tr.ctaBoxBtn || "Bepul O'lchashga Buyurtma"}
            </button>
          </div>

        </div>

      </div>
    </section>
  );
};
