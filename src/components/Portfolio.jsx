import React, { useState } from 'react';
import { portfolio } from '../data/portfolio';
import { Compass, MapPin, Clock, Layers, Maximize2, X } from 'lucide-react';

export const Portfolio = ({ currentLang, t }) => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedImage, setSelectedImage] = useState(null);

  const filteredItems = activeFilter === 'all'
    ? portfolio
    : portfolio.filter(item => item.category === activeFilter);

  const filters = [
    { id: 'all', label: t.portfolio.all },
    { id: 'residential', label: t.portfolio.residential },
    { id: 'commercial', label: t.portfolio.commercial },
    { id: 'cornices', label: t.portfolio.cornices },
  ];

  return (
    <section id="portfolio" className="py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-gold/10 border border-brand-gold/30 text-brand-gold text-xs font-semibold uppercase tracking-wider mb-4">
            <Compass className="w-3.5 h-3.5" />
            <span>{t.portfolio.badge}</span>
          </div>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight mb-4">
            {t.portfolio.title}
          </h2>
          <p className="text-slate-300 text-base sm:text-lg">
            {t.portfolio.subtitle}
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-14">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              className={`px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeFilter === f.id
                  ? 'bg-brand-gold text-brand-dark shadow-glow'
                  : 'bg-brand-surface/80 text-slate-300 hover:text-white hover:bg-brand-card border border-white/10'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Portfolio Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredItems.map((item) => {
            const title = item.title[currentLang] || item.title.uz;
            return (
              <div
                key={item.id}
                onClick={() => setSelectedImage(item)}
                className="glass-card rounded-3xl overflow-hidden cursor-pointer group flex flex-col justify-between"
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

                    <div className="absolute top-4 right-4 p-2 rounded-xl bg-black/60 backdrop-blur-md text-white opacity-0 group-hover:opacity-100 transition-opacity">
                      <Maximize2 className="w-4 h-4 text-brand-gold" />
                    </div>

                    <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs text-white">
                      <span className="flex items-center gap-1 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/10">
                        <MapPin className="w-3.5 h-3.5 text-brand-gold" />
                        <span>{item.location}</span>
                      </span>
                      <span className="bg-brand-gold/90 text-brand-dark font-black px-2.5 py-1 rounded-md">
                        {item.area}
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="font-display font-bold text-lg text-white group-hover:text-brand-gold transition-colors leading-snug mb-3">
                      {title}
                    </h3>
                    
                    <div className="space-y-1.5 text-xs text-slate-400">
                      <div className="flex items-center gap-2">
                        <Layers className="w-3.5 h-3.5 text-brand-gold flex-shrink-0" />
                        <span className="truncate">{item.material}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-brand-gold flex-shrink-0" />
                        <span>Muddat: {item.time}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="px-6 pb-6 pt-0">
                  <span className="text-xs text-brand-gold font-bold group-hover:underline flex items-center gap-1">
                    {t.portfolio.clickToZoom} →
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
            className="max-w-4xl w-full rounded-3xl overflow-hidden glass-panel border border-white/20 relative"
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-white hover:bg-black/90 transition-colors z-10"
            >
              <X className="w-6 h-6" />
            </button>

            <img
              src={selectedImage.image}
              alt="Expanded project view"
              className="w-full max-h-[70vh] object-cover"
            />

            <div className="p-6 bg-brand-surface">
              <h3 className="font-display font-bold text-xl text-white mb-2">
                {selectedImage.title[currentLang] || selectedImage.title.uz}
              </h3>
              <div className="flex flex-wrap gap-4 text-xs text-slate-300">
                <span>📍 {selectedImage.location}</span>
                <span>🛠 {selectedImage.material}</span>
                <span>📐 Hajmi: {selectedImage.area}</span>
                <span>⏱ Bajarilish vaqti: {selectedImage.time}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
