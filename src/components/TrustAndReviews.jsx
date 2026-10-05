import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Award, Star, CheckCircle, FileText, 
  ThumbsUp, MessageSquarePlus, ChevronDown, ChevronUp, X, 
  Send, Sparkles, User, MapPin, Briefcase 
} from 'lucide-react';
import { apiGetReviews, apiAddReview } from '../services/api';
import { dispatchToTelegram } from '../services/telegram';

export const TrustAndReviews = ({ t, currentLang = 'uz', onOpenLeadModal }) => {
  const tr = t?.trustReviews || {};

  const certIcons = [Award, FileText, ShieldCheck];
  const certificates = (tr.certificates || []).map((c, idx) => ({
    ...c,
    icon: certIcons[idx] || Award
  }));

  // Initial reviews fallback from translations
  const defaultReviews = tr.reviews || [];

  // Dynamic reviews state: combined user reviews + default translation reviews
  const [allReviews, setAllReviews] = useState(defaultReviews);
  const [showAll, setShowAll] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successNotice, setSuccessNotice] = useState(false);

  // Form state
  const [form, setForm] = useState({
    name: '',
    role: '',
    location: '',
    project: '',
    rating: 5,
    comment: ''
  });

  // Load reviews on mount and when changed
  const loadReviews = async () => {
    try {
      const storedUserReviews = await apiGetReviews();
      const userList = Array.isArray(storedUserReviews) ? storedUserReviews : [];
      // Combine user submitted reviews at the top, followed by default reviews
      // Ensure no duplicates by ID or name+comment
      const combined = [...userList];
      const seen = new Set(userList.map(r => r.id || `${r.name}_${r.comment}`));

      defaultReviews.forEach((dr, idx) => {
        const key = dr.id || `default-${idx}-${dr.name}`;
        if (!seen.has(key) && !seen.has(`${dr.name}_${dr.comment}`)) {
          combined.push({ ...dr, id: key });
        }
      });

      setAllReviews(combined.length > 0 ? combined : defaultReviews);
    } catch {
      setAllReviews(defaultReviews);
    }
  };

  useEffect(() => {
    loadReviews();
    const handleUpdate = () => loadReviews();
    window.addEventListener('tunikabond_data_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('tunikabond_data_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [currentLang, tr.reviews]);

  // First 3 reviews by default, all when showAll is true
  const displayedReviews = showAll ? allReviews : allReviews.slice(0, 3);
  const hasMoreThanThree = allReviews.length > 3;

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.comment.trim()) {
      alert(currentLang === 'ru' ? "Пожалуйста, укажите имя и напишите отзыв" : "Iltimos, ismingiz va fikringizni kiriting");
      return;
    }

    setSubmitting(true);
    try {
      const reviewPayload = {
        name: form.name.trim(),
        role: form.role.trim() || (currentLang === 'ru' ? "Заказчик" : "Mijoz"),
        location: form.location.trim() || (currentLang === 'ru' ? "г. Ташкент" : "Toshkent shahri"),
        project: form.project.trim() || (currentLang === 'ru' ? "Монтаж фасада / навеса" : "Fasad / Naves montaji"),
        rating: Number(form.rating) || 5,
        comment: form.comment.trim(),
        date: new Date().toLocaleDateString(currentLang === 'ru' ? 'ru-RU' : 'uz-UZ', { month: 'long', year: 'numeric' })
      };

      const res = await apiAddReview(reviewPayload);
      if (res?.success) {
        // Also dispatch to Telegram channel for admin awareness
        try {
          await dispatchToTelegram({
            name: reviewPayload.name,
            phone: reviewPayload.role || "Mijoz fikri",
            service: `⭐ Yangi Fikr (${reviewPayload.rating}/5): ${reviewPayload.comment.slice(0, 80)}...`,
            source: "Mijozlar Fikrlari Bo'limi (Saytdan izoh)",
            note: `Loyiha: ${reviewPayload.project} | Manzil: ${reviewPayload.location} | Baho: ${reviewPayload.rating} yulduz`
          });
        } catch {}

        setForm({
          name: '',
          role: '',
          location: '',
          project: '',
          rating: 5,
          comment: ''
        });
        setIsModalOpen(false);
        setSuccessNotice(true);
        setTimeout(() => setSuccessNotice(false), 5000);
        await loadReviews();
      }
    } catch (err) {
      console.error(err);
      alert(currentLang === 'ru' ? "Произошла ошибка при отправке отзыва" : "Fikrni yuborishda xatolik yuz berdi");
    } finally {
      setSubmitting(false);
    }
  };

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
          <div className="text-center max-w-3xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-red/10 border border-brand-red/30 text-brand-red text-xs font-bold uppercase tracking-wider mb-4">
              <ThumbsUp className="w-3.5 h-3.5" />
              <span>{tr.badgeReviews || "Mijozlarimiz Fikrlari"}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
              {tr.titleReviewsStart || "Mijozlarimiz Biz Haqimizda"}{' '}
              <span className="red-gradient-text">{tr.titleReviewsHighlight || "Nima Deydi?"}</span>
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg mb-6">
              {tr.subtitleReviews || "Yuzlab muvaffaqiyatli topshirilgan fasad va tom loyihalarimiz egalarining samimiy baholari."}
            </p>

            {/* Leave Review Action Button */}
            <div className="flex items-center justify-center">
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white dark:bg-brand-surface/90 hover:bg-slate-50 dark:hover:bg-brand-surface border-2 border-brand-red/50 hover:border-brand-red text-slate-900 dark:text-white font-extrabold text-sm shadow-lg hover:shadow-glow-red transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                <MessageSquarePlus className="w-4 h-4 text-brand-red" />
                <span>{tr.leaveReviewBtn || "Fikr qoldirish"}</span>
                <span className="px-2 py-0.5 rounded-full bg-brand-red/10 text-brand-red text-xs font-bold">
                  {allReviews.length}
                </span>
              </button>
            </div>

            {/* Success toast notice */}
            {successNotice && (
              <div className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs sm:text-sm font-bold animate-fadeIn">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>{tr.reviewSuccessMsg || "Rahmat! Fikringiz muvaffaqiyatli qabul qilindi."}</span>
              </div>
            )}
          </div>

          {/* Reviews Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {displayedReviews.map((rev, idx) => (
              <div
                key={rev.id || idx}
                className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-white/10 flex flex-col justify-between relative hover:border-brand-red/40 transition-all shadow-lg hover:shadow-glow-red/10 animate-fadeIn"
              >
                <div>
                  {/* Rating Stars */}
                  <div className="flex items-center gap-1 mb-4 text-amber-500 dark:text-amber-400">
                    {[...Array(Number(rev.rating) || 5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-500 dark:fill-amber-400" />
                    ))}
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400 ml-2">
                      {(Number(rev.rating) || 5).toFixed(1)} / 5.0
                    </span>
                  </div>

                  {/* Comment */}
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
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                      {rev.role} {rev.location ? `• ${rev.location}` : ''}
                    </p>
                    {rev.project && (
                      <p className="text-[10px] text-brand-red font-semibold mt-0.5">
                        {rev.project}
                      </p>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-600 dark:text-slate-400 font-medium">
                    {rev.date}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Load More Button (only if > 3 reviews) */}
          {hasMoreThanThree && (
            <div className="mt-10 text-center">
              <button
                type="button"
                onClick={() => setShowAll(!showAll)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white dark:bg-brand-surface hover:bg-slate-50 dark:hover:bg-brand-card border border-slate-200 dark:border-white/10 hover:border-brand-red text-slate-800 dark:text-white font-bold text-xs sm:text-sm shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                <span>
                  {showAll 
                    ? (tr.hideMoreBtn || "Kamroq ko'rsatish") 
                    : `${tr.loadMoreBtn || "Ko'proq izoh o'qish"} (${allReviews.length - 3})`
                  }
                </span>
                {showAll ? (
                  <ChevronUp className="w-4 h-4 text-brand-red" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-brand-red" />
                )}
              </button>
            </div>
          )}

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

      {/* --- LEAVE REVIEW MODAL --- */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-fadeIn"
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            className="glass-panel w-full max-w-md rounded-2xl overflow-hidden border border-slate-200 dark:border-brand-red/30 shadow-2xl flex flex-col bg-white dark:bg-brand-dark max-h-[92vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-white/10 flex items-start justify-between bg-slate-50 dark:bg-brand-surface/90">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-brand-red/10 border border-brand-red/30 flex items-center justify-center text-brand-red shrink-0">
                  <MessageSquarePlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base sm:text-lg text-slate-900 dark:text-white">
                    {tr.reviewModalTitle || "Fikr va Sharh Qoldirish"}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {tr.reviewModalSubtitle || "Xizmatimiz haqidagi fikringiz biz uchun muhim!"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitReview} className="p-4 sm:p-5 space-y-3.5 overflow-y-auto">
              
              {/* Rating selection (Interactive stars) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {tr.ratingLabel || "Bahoingiz:"}
                </label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((starVal) => (
                    <button
                      type="button"
                      key={starVal}
                      onClick={() => setForm({ ...form, rating: starVal })}
                      className="p-0.5 hover:scale-125 transition-transform cursor-pointer"
                      title={`${starVal} yulduz`}
                    >
                      <Star
                        className={`w-6 h-6 ${
                          starVal <= form.rating
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-300 dark:text-slate-600'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400 ml-2">
                    {form.rating} / 5
                  </span>
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {tr.nameLabel || "Ismingiz *"}
                </label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder={tr.namePlaceholder || "Jasur Aliyev"}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-brand-surface text-slate-900 dark:text-white text-xs sm:text-sm focus:border-brand-red focus:ring-1 focus:ring-brand-red outline-none"
                  />
                </div>
              </div>

              {/* Project / Location row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {tr.projectLabel || "Obyekt / ish turi"}
                  </label>
                  <div className="relative">
                    <Briefcase className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={form.project}
                      onChange={(e) => setForm({ ...form, project: e.target.value })}
                      placeholder={tr.projectPlaceholder || "Hovli navesi"}
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-brand-surface text-slate-900 dark:text-white text-xs sm:text-sm focus:border-brand-red focus:ring-1 focus:ring-brand-red outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {currentLang === 'ru' ? "Город / Район" : "Shahar / Tuman"}
                  </label>
                  <div className="relative">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={form.location}
                      onChange={(e) => setForm({ ...form, location: e.target.value })}
                      placeholder={currentLang === 'ru' ? "г. Ташкент" : "Toshkent shahri"}
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-brand-surface text-slate-900 dark:text-white text-xs sm:text-sm focus:border-brand-red focus:ring-1 focus:ring-brand-red outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Comment text */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {tr.commentLabel || "Fikringiz va taassurotlaringiz *"}
                </label>
                <textarea
                  required
                  rows={3}
                  value={form.comment}
                  onChange={(e) => setForm({ ...form, comment: e.target.value })}
                  placeholder={tr.commentPlaceholder || "Ish sifati, ustalar muomalasi va natija haqida yozing..."}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-brand-surface text-slate-900 dark:text-white text-xs sm:text-sm focus:border-brand-red focus:ring-1 focus:ring-brand-red outline-none resize-none leading-relaxed"
                />
              </div>

              {/* Form Buttons */}
              <div className="pt-1 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors cursor-pointer"
                >
                  {currentLang === 'ru' ? "Отмена" : "Bekor qilish"}
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-brand-redLight to-brand-red hover:from-brand-red hover:to-brand-redHover text-white text-xs font-bold shadow-glow-red hover:scale-105 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>
                    {submitting 
                      ? (tr.submittingReview || "Yuborilmoqda...") 
                      : (tr.submitReviewBtn || "Fikrni yuborish")}
                  </span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </section>
  );
};
