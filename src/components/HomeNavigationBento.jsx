import React from 'react';
import { 
  Layers, 
  Sparkles, 
  ArrowRight, 
  Palette, 
  ShieldCheck, 
  PhoneCall, 
  Compass, 
  Users,
  CheckCircle2,
  Clock
} from 'lucide-react';

export const HomeNavigationBento = ({ t, onNavigate }) => {
  const b = t.bento || {};

  const cards = [
    {
      id: 'products',
      title: b.products?.title || "Tunikabond & Alyukabond Katalogi",
      subtitle: b.products?.subtitle || "Rossiya va Xitoyning sertifikatlangan Tunikabond, Alyukabond panellari, 30+ ranglar va karniz turlari.",
      badge: b.products?.badge || "To'g'ridan-to'g'ri ishlab chiqaruvchi",
      badgeColor: "bg-brand-red/10 text-brand-red border-brand-red/30",
      icon: Layers,
      ctaText: b.products?.cta || "Katalogni ko'rish",
      gradient: "from-brand-red/20 via-transparent to-transparent",
      accentBorder: "group-hover:border-brand-red/50",
      featured: true,
    },
    {
      id: 'portfolio',
      title: b.portfolio?.title || "2000+ Bajarilgan Loyihalar",
      subtitle: b.portfolio?.subtitle || "Naveslar, fasadlar, darvozaxonalar va karnizlar bo'yicha tayyor obyektlar fotogalereyasi.",
      badge: b.portfolio?.badge || "Tayyor ishlar",
      badgeColor: "bg-blue-500/10 text-blue-500 border-blue-500/30",
      icon: Compass,
      ctaText: b.portfolio?.cta || "Galereyani ko'rish",
      gradient: "from-blue-500/15 via-transparent to-transparent",
      accentBorder: "group-hover:border-blue-500/50",
      featured: false,
    },
    {
      id: 'about',
      title: b.about?.title || "Biz haqimizda & 10 Yil Kafolat",
      subtitle: b.about?.subtitle || "6 yillik tajriba, rasmiy kafolat shartnomasi, mijozlarning video va matnli sharhlari hamda tez-tez beriladigan savollar.",
      badge: b.about?.badge || "Ishonch va sifat",
      badgeColor: "bg-amber-500/10 text-amber-500 border-amber-500/30",
      icon: ShieldCheck,
      ctaText: b.about?.cta || "Kompaniya haqida",
      gradient: "from-amber-500/15 via-transparent to-transparent",
      accentBorder: "group-hover:border-amber-500/50",
      featured: false,
    },
    {
      id: 'contact',
      title: b.contact?.title || "24/7 Aloqa & Bepul O'lchash",
      subtitle: b.contact?.subtitle || "Siz uchun to'xtovsiz xizmatdamiz! Bepul o'lchovga buyurtma bering yoki ustaxonamiz xaritasini ko'ring.",
      badge: b.contact?.badge || "To'xtovsiz xizmat",
      badgeColor: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30",
      icon: Clock,
      ctaText: b.contact?.cta || "Bog'lanish & Xarita",
      gradient: "from-emerald-500/15 via-transparent to-transparent",
      accentBorder: "group-hover:border-emerald-500/50",
      featured: true,
    }
  ];

  return (
    <section className="py-14 sm:py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-red/10 border border-brand-red/30 text-brand-red text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{b.badge || "Sayt bo'limlari va xizmatlar"}</span>
          </div>
          <h2 className="font-display font-extrabold text-2xl sm:text-4xl text-slate-900 dark:text-white tracking-tight mb-4">
            {b.title || "Kerakli Bo'limni Tanlang"}
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300">
            {b.subtitle || "Har bir bo'lim alohida sahifa sifatida qulay ajratilgan. Qiziqqan yo'nalishingiz bo'yicha to'liq ma'lumot oling."}
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.id}
                onClick={() => onNavigate(card.id)}
                className={`group relative rounded-2xl p-6 sm:p-7 border-2 border-slate-200 dark:border-white/15 bg-white dark:bg-[#0f1423] shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer overflow-hidden flex flex-col justify-between ${
                  card.accentBorder
                }`}
              >
                {/* Background glow gradient */}
                <div 
                  className={`absolute -top-24 -right-24 w-48 h-48 rounded-full bg-gradient-to-br ${card.gradient} blur-3xl pointer-events-none group-hover:scale-150 transition-transform duration-700`}
                />

                <div>
                  {/* Top Row: Icon + Badge */}
                  <div className="flex items-center justify-between gap-3 mb-5">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/10 flex items-center justify-center text-brand-red group-hover:scale-110 group-hover:bg-brand-red group-hover:text-white transition-all shadow-md">
                      <Icon className="w-6 h-6 transition-colors" />
                    </div>
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${card.badgeColor}`}>
                      {card.badge}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="font-display font-extrabold text-lg sm:text-xl text-slate-900 dark:text-white mb-2 group-hover:text-brand-red transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6 font-medium">
                    {card.subtitle}
                  </p>
                </div>

                {/* Bottom CTA Button */}
                <div className="pt-4 border-t border-slate-200 dark:border-white/10 flex items-center justify-between text-xs sm:text-sm font-extrabold text-slate-900 dark:text-slate-100 group-hover:text-brand-red transition-colors">
                  <span>{card.ctaText}</span>
                  <div className="w-8 h-8 rounded-xl bg-brand-red/10 dark:bg-brand-red/20 border border-brand-red/30 text-brand-red flex items-center justify-center group-hover:bg-brand-red group-hover:text-white group-hover:border-brand-red transition-all shadow-sm">
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
