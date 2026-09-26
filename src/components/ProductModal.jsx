import React from 'react';
import { X, ShieldCheck, ArrowRight, CheckCircle2, Phone, Calendar } from 'lucide-react';

export const ProductModal = ({ product, currentLang, onClose, onOrderProduct }) => {
  if (!product) return null;

  const name = product.name[currentLang] || product.name.uz;
  const desc = product.shortDesc[currentLang] || product.shortDesc.uz;
  const specsList = product.specs[currentLang] || product.specs.uz || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-dark/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="glass-panel w-full max-w-2xl rounded-3xl p-6 sm:p-8 border border-white/20 shadow-2xl relative my-8 max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-slate-300 hover:text-white hover:bg-white/20 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Product Image Header */}
        <div className="relative h-64 rounded-2xl overflow-hidden mb-6 border border-white/15">
          <img
            src={product.image}
            alt={name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-transparent to-transparent opacity-70" />
          
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
            <span className="px-3 py-1 rounded-full bg-brand-gold text-brand-dark font-black text-xs">
              {product.badge}
            </span>
            <span className="px-3 py-1 rounded-lg bg-black/70 backdrop-blur-md border border-white/15 text-xs text-brand-gold font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              <span>{product.warranty} rasmiy kafolat</span>
            </span>
          </div>
        </div>

        {/* Title and Short Description */}
        <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-white mb-2 leading-snug">
          {name}
        </h2>
        <p className="text-slate-300 text-sm leading-relaxed mb-6">
          {desc}
        </p>

        {/* Technical Specs Table */}
        <div className="mb-8">
          <h4 className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-3">
            Texnik parametrlar:
          </h4>
          <div className="rounded-xl border border-white/10 bg-brand-surface/60 overflow-hidden divide-y divide-white/10 text-xs sm:text-sm">
            {specsList.map((spec, i) => (
              <div key={i} className="flex justify-between p-3 sm:px-4">
                <span className="text-slate-400 font-medium">{spec.label}</span>
                <span className="font-semibold text-white text-right">{spec.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Price and Action Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-brand-surface border border-brand-gold/30 shadow-inner">
          <div>
            <span className="block text-[11px] uppercase tracking-wider text-slate-400 font-bold">
              Zavod narxi:
            </span>
            <div className="font-display font-black text-xl sm:text-2xl text-brand-gold">
              {product.priceRange}
            </div>
          </div>

          <button
            onClick={() => {
              onOrderProduct(name);
              onClose();
            }}
            className="w-full sm:w-auto py-3.5 px-6 rounded-xl bg-gradient-to-r from-brand-amber to-brand-gold text-brand-dark font-extrabold text-sm shadow-glow hover:shadow-glow-lg flex items-center justify-center gap-2 hover:scale-105 active:scale-95 transition-all"
          >
            <span>Ushbu mahsulotga buyurtma berish</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
