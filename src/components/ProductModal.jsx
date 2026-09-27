import React from 'react';
import { X, ShieldCheck, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';

export const ProductModal = ({ product, currentLang = 'uz', onClose, onOrderProduct }) => {
  if (!product) return null;

  // Safe localized name resolution
  const name = typeof product.name === 'object' && product.name !== null
    ? (product.name[currentLang] || product.name.uz || Object.values(product.name)[0] || "Mahsulot")
    : (product.name || "Mahsulot");

  // Safe localized description resolution
  const desc = typeof product.shortDesc === 'object' && product.shortDesc !== null
    ? (product.shortDesc[currentLang] || product.shortDesc.uz || Object.values(product.shortDesc)[0] || "")
    : (product.shortDesc || "");

  // Safe specs resolution
  let specsList = [];
  if (product.specs) {
    if (Array.isArray(product.specs)) {
      specsList = product.specs;
    } else if (typeof product.specs === 'object' && product.specs !== null) {
      specsList = product.specs[currentLang] || product.specs.uz || Object.values(product.specs)[0] || [];
    }
  }

  // Comprehensive fallback specs if specsList is empty
  if (!Array.isArray(specsList) || specsList.length === 0) {
    specsList = [
      { label: "Qalinlik", value: product.thickness || "Standart" },
      { label: "Qoplama", value: product.coating || "PVDF polimer" },
      { label: "Kafolat muddati", value: product.warranty || "10 yil" },
      { label: "Toifasi", value: product.category ? product.category.toUpperCase() : "Fasad paneli" },
      { label: "Yetkazib berish", value: "Toshkent va barcha viloyatlar bo'ylab bepul" }
    ];
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-brand-dark/85 backdrop-blur-md animate-fadeIn overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="glass-panel w-full max-w-2xl rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-white/20 shadow-2xl relative my-8 max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-300 hover:text-brand-red dark:hover:text-white transition-all z-10"
          aria-label="Yopish"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Product Image Header */}
        <div className="relative h-64 sm:h-72 rounded-2xl overflow-hidden mb-6 border border-slate-200 dark:border-white/15 bg-slate-100 dark:bg-brand-surface">
          <img
            src={product.image || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80"}
            alt={name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-80" />
          
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-2">
            <span className="px-3 py-1 rounded-full bg-brand-red text-white font-black text-xs shadow-glow-red uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>{product.badge || "Ommabop"}</span>
            </span>
            <span className="px-3 py-1 rounded-lg bg-black/70 backdrop-blur-md border border-white/15 text-xs text-brand-red font-bold flex items-center gap-1.5 shadow-sm">
              <ShieldCheck className="w-4 h-4" />
              <span>{product.warranty || "10 yil"} rasmiy kafolat</span>
            </span>
          </div>
        </div>

        {/* Title and Short Description */}
        <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white mb-2 leading-snug">
          {name}
        </h2>
        {desc && (
          <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-6">
            {desc}
          </p>
        )}

        {/* Technical Specs Table */}
        <div className="mb-8">
          <h4 className="text-xs uppercase tracking-wider font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-brand-red" />
            <span>Texnik parametrlar va afzalliklari:</span>
          </h4>
          <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-brand-surface/70 overflow-hidden divide-y divide-slate-200 dark:divide-white/10 text-xs sm:text-sm">
            {specsList.map((spec, i) => (
              <div key={i} className="flex justify-between p-3.5 sm:px-4 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">
                <span className="text-slate-600 dark:text-slate-400 font-medium">{spec.label || spec.name}</span>
                <span className="font-semibold text-slate-900 dark:text-white text-right">{spec.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Price and Action Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-slate-100 dark:bg-brand-surface border border-slate-200 dark:border-brand-red/30 shadow-inner">
          <div>
            <span className="block text-[11px] uppercase tracking-wider text-slate-600 dark:text-slate-400 font-bold">
              Amaldagi zavod narxi:
            </span>
            <div className="font-display font-black text-xl sm:text-2xl text-brand-red">
              {product.priceRange || "Kelishilgan narxda"}
            </div>
          </div>

          <button
            onClick={() => {
              onOrderProduct(name);
              onClose();
            }}
            className="w-full sm:w-auto py-3.5 px-6 rounded-xl bg-gradient-to-r from-brand-redLight via-brand-red to-brand-redHover text-white font-extrabold text-sm shadow-glow-red hover:shadow-glow-red-lg flex items-center justify-center gap-2 hover:scale-105 active:scale-95 transition-all"
          >
            <span>Ushbu mahsulotga buyurtma berish</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
