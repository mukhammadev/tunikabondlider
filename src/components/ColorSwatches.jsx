import React, { useState } from 'react';
import { swatches } from '../data/swatches';
import { Palette, X, ArrowRight } from 'lucide-react';

export const ColorSwatches = ({ currentLang, t, onOpenLeadModalWithSwatch, swatchesList = [] }) => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedSwatch, setSelectedSwatch] = useState(null);

  const allSwatches = (swatchesList && swatchesList.length > 0) ? swatchesList : swatches;

  const filteredSwatches = activeCategory === 'all'
    ? allSwatches
    : allSwatches.filter(item => item.category === activeCategory);

  const getSwatchName = (item) => {
    if (!item || !item.name) return '';
    if (typeof item.name === 'object') {
      return item.name[currentLang] || item.name.uz || item.name.ru || '';
    }
    return String(item.name);
  };

  const categories = [
    { id: 'all', label: t.swatches.all },
    { id: 'wood', label: t.swatches.wood },
    { id: 'metallic', label: t.swatches.metallic },
    { id: 'ral', label: t.swatches.ral },
    { id: 'special', label: t.swatches.special },
  ];

  return (
    <section id="swatches" className="py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-red/10 border border-brand-red/30 text-brand-red text-xs font-bold uppercase tracking-wider mb-4">
            <Palette className="w-3.5 h-3.5" />
            <span>{t.swatches.badge}</span>
          </div>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-slate-900 dark:text-white tracking-tight mb-4">
            {t.swatches.title}
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg">
            {t.swatches.subtitle}
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-12">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeCategory === cat.id
                  ? 'bg-brand-red text-white shadow-glow-red font-bold'
                  : 'bg-slate-100 dark:bg-brand-surface/80 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-brand-card hover:text-brand-red border border-slate-200 dark:border-white/10'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Swatches Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {filteredSwatches.map((item) => {
            const name = getSwatchName(item);
            return (
              <div
                key={item.id}
                onClick={() => setSelectedSwatch(item)}
                className="glass-card rounded-2xl p-4 cursor-pointer group hover:scale-[1.03] transition-all flex flex-col justify-between hover:border-brand-red/50"
              >
                <div>
                  {/* Swatch Sample Box */}
                  <div 
                    className="w-full h-32 sm:h-36 rounded-xl shadow-inner mb-4 relative overflow-hidden border border-white/20 transition-transform group-hover:shadow-glow-red"
                    style={{ 
                      background: item.image 
                        ? `url(${item.image}) center/cover no-repeat` 
                        : (item.bgGradient || item.colorHex || '#444')
                    }}
                  >
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-slate-900/85 backdrop-blur-md text-[10px] font-bold text-white tracking-wider border border-white/20 shadow-sm">
                      {item.code}
                    </div>
                  </div>

                  <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white group-hover:text-brand-red transition-colors leading-snug mb-1">
                    {name}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-medium mb-3">
                    {item.texture}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-200 dark:border-white/10 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  <span>{item.finish}</span>
                  <span className="text-brand-red font-bold">Ko'rish →</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* Swatch Detail Modal */}
      {selectedSwatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-brand-dark/80 backdrop-blur-md animate-fadeIn">
          <div className="glass-panel w-full max-w-lg rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-white/20 shadow-2xl relative">
            
            {/* Close button */}
            <button
              onClick={() => setSelectedSwatch(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/5 dark:bg-white/10 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-black/10 dark:hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal swatch header */}
            <div 
              className="w-full h-44 rounded-2xl mb-6 relative overflow-hidden shadow-inner border border-white/20 flex items-end p-4"
              style={{ 
                background: selectedSwatch.image 
                  ? `url(${selectedSwatch.image}) center/cover no-repeat` 
                  : (selectedSwatch.bgGradient || selectedSwatch.colorHex || '#444')
              }}
            >
              <div className="px-3 py-1 rounded-lg bg-slate-900/85 backdrop-blur-md text-xs font-bold text-white border border-white/20 shadow-sm">
                {selectedSwatch.code}
              </div>
            </div>

            <h3 className="font-display font-extrabold text-2xl text-slate-900 dark:text-white mb-2">
              {getSwatchName(selectedSwatch)}
            </h3>

            {/* Specs Table */}
            <div className="space-y-3 mb-8 text-xs sm:text-sm">
              <div className="flex justify-between py-2 border-b border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300">
                <span>{t.swatches.ralCode}</span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedSwatch.code}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300">
                <span>{t.swatches.coating}</span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedSwatch.coating}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300">
                <span>Faktura / Yuzasi:</span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedSwatch.finish}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300">
                <span>{t.swatches.application}</span>
                <span className="font-bold text-slate-900 dark:text-white text-right max-w-[240px]">{selectedSwatch.application}</span>
              </div>
            </div>

            {/* Action CTA */}
            <button
              onClick={() => {
                const swatchName = getSwatchName(selectedSwatch);
                onOpenLeadModalWithSwatch(`${swatchName} (${selectedSwatch.code})`);
                setSelectedSwatch(null);
              }}
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-brand-redLight via-brand-red to-brand-redHover text-white font-extrabold text-sm shadow-glow-red flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <span>Ushbu rangda namuna so'rash</span>
              <ArrowRight className="w-4 h-4" />
            </button>

          </div>
        </div>
      )}
    </section>
  );
};
