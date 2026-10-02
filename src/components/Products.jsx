import React, { useState } from 'react';
import { products as defaultProducts } from '../data/products';
import { Layers, ShieldCheck, ArrowRight } from 'lucide-react';

export const Products = ({ currentLang, t, onSelectProduct, items }) => {
  const [activeTab, setActiveTab] = useState('tunikabond');

  const productsToUse = items && items.length > 0 ? items : defaultProducts;

  const getProductCategory = (p) => {
    const cat = String(p?.category || '').toLowerCase().trim();
    if (cat.includes('tunikabond') || cat.includes('tunika')) return 'tunikabond';
    if (cat.includes('alyukabond') || cat.includes('alyuka') || cat.includes('alukabond') || cat.includes('alucobond')) return 'alyukabond';
    if (cat.includes('cornice') || cat.includes('karniz')) return 'cornice';
    if (cat.includes('roofing') || cat.includes('profnastil') || cat.includes('tom')) return 'roofing';
    return cat || 'tunikabond';
  };

  const filteredProducts = productsToUse.filter(p => getProductCategory(p) === activeTab);

  const tabs = [
    { id: 'tunikabond', label: t.products?.tunikabond || "Tunikabond" },
    { id: 'alyukabond', label: t.products?.alyukabond || "Alyukabond" },
    { id: 'cornice', label: t.products?.cornice || "Karnizlar" },
    { id: 'roofing', label: t.products?.roofing || "Profnastil & Tom" },
  ];

  const getCategoryCount = (catId) => {
    return productsToUse.filter(p => getProductCategory(p) === catId).length;
  };

  return (
    <section id="products" className="py-24 relative overflow-hidden bg-brand-surface/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-red/10 border border-brand-red/30 text-brand-red text-xs font-bold uppercase tracking-wider mb-4">
            <Layers className="w-3.5 h-3.5" />
            <span>{t.products.badge}</span>
          </div>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-slate-900 dark:text-white tracking-tight mb-4">
            {t.products.title}
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg">
            {t.products.subtitle}
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-12">
          {tabs.map((tab) => {
            const count = getCategoryCount(tab.id);
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm flex items-center gap-2 ${
                  isActive
                    ? 'bg-brand-red text-white border-2 border-brand-red shadow-glow-red font-extrabold scale-105'
                    : 'bg-white dark:bg-[#13192b] text-slate-800 dark:text-slate-100 hover:text-brand-red hover:border-brand-red/50 border-2 border-slate-200 dark:border-white/15'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-300'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.length === 0 ? (
            <div className="col-span-full py-16 text-center glass-card rounded-3xl p-8 border border-white/10 max-w-md mx-auto">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-brand-red/10 border border-brand-red/20 flex items-center justify-center text-brand-red">
                <Layers className="w-8 h-8" />
              </div>
              <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white mb-2">
                Hozircha mahsulotlar mavjud emas
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Ushbu toifaga yaqin orada yangi modellar qo'shiladi.
              </p>
            </div>
          ) : (
            filteredProducts.map((product) => {
            const name = typeof product.name === 'object' ? (product.name[currentLang] || product.name.uz) : product.name;
            const desc = typeof product.shortDesc === 'object' ? (product.shortDesc[currentLang] || product.shortDesc.uz) : product.shortDesc;

            return (
              <div
                key={product.id}
                className="glass-card rounded-3xl overflow-hidden flex flex-col justify-between group hover:border-brand-red/50"
              >
                <div>
                  {/* Image container */}
                  <div className="relative h-60 overflow-hidden bg-brand-surface">
                    <img
                      src={product.image}
                      alt={name}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-70" />
                    
                    {/* Badge */}
                    <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-brand-red text-white text-xs font-black shadow-md">
                      {product.badge || "Yangi"}
                    </div>

                    <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end text-xs font-bold text-white">
                      <span className="px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-md border border-white/20">
                        {product.thickness}
                      </span>
                      <span className="px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-md border border-white/20 flex items-center gap-1 text-brand-red">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>{product.warranty}</span>
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6">
                    <h3 className="font-display font-bold text-xl text-slate-900 dark:text-white group-hover:text-brand-red transition-colors mb-2 leading-snug">
                      {name}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed mb-6">
                      {desc}
                    </p>

                    {/* Quick Specs List */}
                    <div className="space-y-2 mb-6 text-xs text-slate-700 dark:text-slate-300">
                      <div className="flex justify-between py-1.5 border-b border-slate-200 dark:border-white/10">
                        <span className="text-slate-600 dark:text-slate-400 font-medium">{t.products.thicknessLabel}</span>
                        <span className="font-semibold text-slate-900 dark:text-white">{product.thickness}</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-slate-200 dark:border-white/10">
                        <span className="text-slate-600 dark:text-slate-400 font-medium">{t.products.coatingLabel}</span>
                        <span className="font-semibold text-slate-900 dark:text-white">{product.coating}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer with Price and Button */}
                <div className="p-6 pt-0">
                  <div className="mb-4">
                    <span className="block text-[11px] text-slate-600 dark:text-slate-400 uppercase tracking-wider font-semibold">
                      Zavod narxi:
                    </span>
                    <span className="font-display font-extrabold text-base text-brand-red">
                      {product.priceRange}
                    </span>
                  </div>

                  <button
                    onClick={() => onSelectProduct(product)}
                    className="w-full py-3 px-4 rounded-xl bg-slate-100 dark:bg-brand-surface hover:bg-brand-red hover:text-white border border-slate-200 dark:border-white/10 hover:border-brand-red text-slate-900 dark:text-white font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 group/btn"
                  >
                    <span>{t.products.detailsBtn}</span>
                    <ArrowRight className="w-4 h-4 text-brand-red group-hover/btn:text-white group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>

              </div>
            );
          }))}
        </div>

      </div>
    </section>
  );
};
