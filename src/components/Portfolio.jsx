import React, { useState } from 'react';
import { portfolio as defaultPortfolio } from '../data/portfolio';
import { Compass, MapPin, Clock, Layers, Maximize2, X, CheckCircle2, ArrowRight, UserCheck } from 'lucide-react';

export const Portfolio = ({ currentLang, t, items, onSelectMaster }) => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedImage, setSelectedImage] = useState(null);

  const portfolioToUse = items && items.length > 0 ? items : defaultPortfolio;

  // Filter items matching structure category (naves, koziryok, darvozaxona, fasad, cornices)
  const filteredItems = activeFilter === 'all'
    ? portfolioToUse
    : portfolioToUse.filter(item => {
        if (item.category === activeFilter) return true;
        // Backward compatibility: map residential/commercial to fasad
        if (activeFilter === 'fasad' && (item.category === 'residential' || item.category === 'commercial')) {
          return true;
        }
        return false;
      });

  const filters = [
    { id: 'all', label: t.portfolio?.all || "Barchasi" },
    { id: 'naves', label: t.portfolio?.naves || "Naveslar" },
    { id: 'koziryok', label: t.portfolio?.koziryok || "Koziryoklar" },
    { id: 'darvozaxona', label: t.portfolio?.darvozaxona || "Darvozaxonalar" },
    { id: 'fasad', label: t.portfolio?.fasad || "Fasadlar" },
    { id: 'cornices', label: t.portfolio?.cornices || "Karniz va Shift" }
  ];

  const getCategoryLabel = (cat) => {
    switch (cat) {
      case 'naves': return 'Naves';
      case 'koziryok': return 'Koziryok';
      case 'darvozaxona': return 'Darvozaxona';
      case 'fasad': return 'Fasad';
      case 'cornices': return 'Karniz';
      default: return 'Fasad';
    }
  };

  return (
    <section id="portfolio" className="py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-red/10 border border-brand-red/30 text-brand-red text-xs font-bold uppercase tracking-wider mb-4">
            <Compass className="w-3.5 h-3.5" />
            <span>{t.portfolio?.badge || "Konstruksiyalar & Ishlar Katalogi"}</span>
          </div>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl light:text-slate-900 text-white tracking-tight mb-4">
            {t.portfolio?.title || "Naveslar, Koziryoklar, Darvozaxonalar va Fasadlar"}
          </h2>
          <p className="light:text-slate-600 text-slate-300 text-base sm:text-lg">
            {t.portfolio?.subtitle || "Kerakli yo'nalishni tanlang va namunali ishlarni ko'ring. Har bir loyiha korxonamizning ma'sul ustasiga biriktirilgan."}
          </p>
        </div>

        {/* Filter Pills (Naves, Koziryok, Darvozaxona, Fasad, Karniz) */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-14">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              className={`px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeFilter === f.id
                  ? 'bg-brand-red text-white shadow-glow-red font-bold scale-105'
                  : 'bg-brand-surface/80 text-slate-300 hover:text-white hover:bg-brand-card border border-white/10'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Portfolio / Catalog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredItems.map((item) => {
            const title = typeof item.title === 'object' ? (item.title[currentLang] || item.title.uz) : item.title;
            return (
              <div
                key={item.id}
                onClick={() => setSelectedImage(item)}
                className="glass-card rounded-3xl overflow-hidden cursor-pointer group flex flex-col justify-between hover:border-brand-red/50 transition-all duration-300 hover:-translate-y-1 bg-brand-surface/70"
              >
                <div>
                  <div className="relative h-64 overflow-hidden bg-brand-surface">
                    <img
                      src={item.image}
                      alt={title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-transparent to-transparent opacity-60" />

                    {/* Category Label Badge */}
                    <div className="absolute top-3.5 left-3.5">
                      <span className="px-3 py-1 rounded-xl bg-brand-red text-white text-xs font-black shadow-lg">
                        {getCategoryLabel(item.category)}
                      </span>
                    </div>

                    <div className="absolute top-4 right-4 p-2 rounded-xl bg-black/60 backdrop-blur-md text-white opacity-0 group-hover:opacity-100 transition-opacity">
                      <Maximize2 className="w-4 h-4 text-brand-red" />
                    </div>

                    <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs text-white">
                      <span className="flex items-center gap-1 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/10">
                        <MapPin className="w-3.5 h-3.5 text-brand-red" />
                        <span>{item.location}</span>
                      </span>
                      <span className="bg-brand-red text-white font-black px-2.5 py-1 rounded-md">
                        {item.area}
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="font-display font-bold text-lg text-white group-hover:text-brand-red transition-colors leading-snug mb-3">
                      {title}
                    </h3>
                    
                    <div className="space-y-1.5 text-xs text-slate-400">
                      <div className="flex items-center gap-2">
                        <Layers className="w-3.5 h-3.5 text-brand-red flex-shrink-0" />
                        <span className="truncate">{item.material}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-brand-red flex-shrink-0" />
                        <span>Muddat: {item.time}</span>
                      </div>
                    </div>

                    {/* Assigned Master Card Link */}
                    {item.masterName && (
                      <div 
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onSelectMaster) {
                            onSelectMaster(item.masterId || item.masterName);
                          }
                        }}
                        className="mt-4 pt-3.5 border-t border-white/10 flex items-center justify-between group/master hover:bg-white/[0.04] p-2 rounded-xl transition-all cursor-pointer"
                        title="Usta profili va ishlarini ko'rish"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={item.masterPhoto || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80"}
                            alt={item.masterName}
                            className="w-9 h-9 rounded-full object-cover border-2 border-brand-red/60 shadow-sm flex-shrink-0"
                          />
                          <div className="min-w-0">
                            <span className="block text-[10px] text-slate-400 font-medium">Mas'ul usta:</span>
                            <span className="text-xs font-bold text-white group-hover/master:text-brand-red transition-colors flex items-center gap-1 truncate">
                              <span>{item.masterName}</span>
                              <CheckCircle2 className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                            </span>
                          </div>
                        </div>

                        <span className="text-[11px] font-bold text-brand-red flex items-center gap-0.5 flex-shrink-0 group-hover/master:translate-x-1 transition-transform">
                          <span>Usta profili</span>
                          <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    )}

                  </div>
                </div>

                <div className="px-6 pb-6 pt-0 flex items-center justify-between text-xs text-brand-red font-bold">
                  <span className="group-hover:underline flex items-center gap-1">
                    {t.portfolio?.clickToZoom || "Kattalashtirish"} →
                  </span>
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div 
          onClick={() => setSelectedImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="max-w-4xl w-full rounded-3xl overflow-hidden glass-panel border border-brand-red/30 relative bg-brand-dark"
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/60 text-white hover:bg-brand-red transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="relative aspect-video max-h-[60vh] bg-black">
              <img
                src={selectedImage.image}
                alt=""
                className="w-full h-full object-contain"
              />
            </div>

            <div className="p-6 bg-brand-surface flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="px-2.5 py-0.5 rounded-lg bg-brand-red text-white text-[11px] font-bold">
                  {getCategoryLabel(selectedImage.category)}
                </span>
                <h3 className="font-display font-bold text-xl light:text-slate-900 text-white">
                  {typeof selectedImage.title === 'object' ? (selectedImage.title[currentLang] || selectedImage.title.uz) : selectedImage.title}
                </h3>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
                  <span>📍 {selectedImage.location}</span>
                  <span>📐 {selectedImage.area}</span>
                  <span>🛠 {selectedImage.material}</span>
                  <span>⏱ {selectedImage.time}</span>
                </div>
              </div>

              {selectedImage.masterName && (
                <div 
                  onClick={() => {
                    const mId = selectedImage.masterId || selectedImage.masterName;
                    setSelectedImage(null);
                    if (onSelectMaster) onSelectMaster(mId);
                  }}
                  className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 cursor-pointer transition-colors"
                >
                  <img
                    src={selectedImage.masterPhoto || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80"}
                    alt=""
                    className="w-10 h-10 rounded-full object-cover border-2 border-brand-red"
                  />
                  <div>
                    <span className="block text-[10px] text-slate-400">Mas'ul usta:</span>
                    <span className="font-bold text-sm text-white hover:text-brand-red flex items-center gap-1">
                      {selectedImage.masterName} <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </section>
  );
};
