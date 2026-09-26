import React, { useState, useRef, useCallback } from 'react';
import { Sparkles, MoveHorizontal, CheckCircle2, ArrowRight, ShieldCheck, Flame, Clock } from 'lucide-react';

export const BeforeAfter = ({ onOpenLeadModal }) => {
  const [sliderPos, setSliderPos] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [activeProject, setActiveProject] = useState(0);
  const containerRef = useRef(null);

  const projects = [
    {
      title: "Tijorat Majmuasi va Ofis Markazi",
      location: "Toshkent shahri, Chilonzor",
      area: "1,200 m²",
      duration: "18 kun",
      material: "Premium Tunikabond & PVDF Alyukabond",
      beforeImg: "https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=1200&q=80",
      afterImg: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
      beforeLabel: "Eski, eskirgan g'isht fasadi",
      afterLabel: "Zamonaviy Tunikabond Lider fasadi"
    },
    {
      title: "Zamonaviy Xususiy Kottej va Villa",
      location: "Toshkent viloyati, Qibray",
      area: "480 m²",
      duration: "10 kun",
      material: "Yog'och teksturali Tunikabond + Neoklassik Karniz",
      beforeImg: "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?auto=format&fit=crop&w=1200&q=80",
      afterImg: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
      beforeLabel: "Suvoq qilingan eski devor",
      afterLabel: "Yog'och fakturali hashamatli fasad"
    }
  ];

  const current = projects[activeProject];

  const handleMove = useCallback((clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = Math.max(0, Math.min((x / rect.width) * 100, 100));
    setSliderPos(percent);
  }, []);

  const handleTouchMove = (e) => {
    handleMove(e.touches[0].clientX);
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      handleMove(e.clientX);
    }
  };

  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);

  return (
    <section id="transformation" className="py-20 sm:py-28 relative overflow-hidden bg-brand-surface/40">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-red/10 blur-[140px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-red/10 border border-brand-red/30 text-brand-red text-xs font-bold uppercase tracking-wider mb-4 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Haqiqiy Natijalar</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold text-white tracking-tight mb-4">
            Bino Fasadini <span className="text-gradient-red">Oldin va Keyin</span> Taqqoslang
          </h2>
          <p className="text-base sm:text-lg text-slate-300">
            Slayderni chapga va o'ngga surib, Tunikabond Lider bilan eskirgan binolar qanday zamonaviy, obro'li va mustahkam ko'rinishga kirishini jonli ko'ring.
          </p>

          {/* Project Switcher Tabs */}
          <div className="flex items-center justify-center gap-2 sm:gap-3 mt-8">
            {projects.map((proj, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setActiveProject(idx);
                  setSliderPos(50);
                }}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  activeProject === idx
                    ? 'bg-brand-red text-white shadow-glow-red scale-105'
                    : 'bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
                }`}
              >
                {proj.title}
              </button>
            ))}
          </div>
        </div>

        {/* Interactive Comparison Container */}
        <div className="relative max-w-5xl mx-auto rounded-3xl overflow-hidden border border-white/15 shadow-2xl shadow-black/80 bg-brand-dark">
          
          <div
            ref={containerRef}
            className="relative h-[380px] sm:h-[480px] lg:h-[540px] select-none cursor-ew-resize overflow-hidden"
            onMouseMove={handleMouseMove}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onTouchMove={handleTouchMove}
            onClick={(e) => handleMove(e.clientX)}
          >
            {/* AFTER Image (Full background) */}
            <div className="absolute inset-0">
              <img
                src={current.afterImg}
                alt="Tunikabond Lider bilan yangilangan"
                className="w-full h-full object-cover"
                draggable={false}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
              
              {/* After Badge */}
              <div className="absolute top-4 right-4 sm:top-6 sm:right-6 px-3.5 py-1.5 rounded-full bg-brand-red/90 backdrop-blur-md text-white text-xs sm:text-sm font-black shadow-glow-red uppercase tracking-wide flex items-center gap-1.5 pointer-events-none">
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                <span>KEYIN: Tunikabond Lider</span>
              </div>
            </div>

            {/* BEFORE Image (Clipped overlay) */}
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${sliderPos}%` }}
            >
              <img
                src={current.beforeImg}
                alt="Eski bino holati"
                className="absolute inset-0 w-full h-full object-cover max-w-none"
                style={{ width: containerRef.current ? `${containerRef.current.clientWidth}px` : '100%' }}
                draggable={false}
              />
              <div className="absolute inset-0 bg-black/40 pointer-events-none" />
              
              {/* Before Badge */}
              <div className="absolute top-4 left-4 sm:top-6 sm:left-6 px-3.5 py-1.5 rounded-full bg-black/70 backdrop-blur-md text-slate-300 text-xs sm:text-sm font-black border border-white/20 uppercase tracking-wide pointer-events-none">
                <span>OLDIN: Eskirgan bino</span>
              </div>
            </div>

            {/* Vertical Splitter Handle */}
            <div
              className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize shadow-[0_0_12px_rgba(255,255,255,0.8)] z-20"
              style={{ left: `${sliderPos}%` }}
            >
              <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-brand-red text-white flex items-center justify-center shadow-glow-red border-2 border-white hover:scale-110 active:scale-95 transition-transform">
                <MoveHorizontal className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            </div>

            {/* Floating helper hint */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3.5 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white text-[11px] sm:text-xs font-medium pointer-events-none flex items-center gap-1.5">
              <MoveHorizontal className="w-3.5 h-3.5 text-brand-red" />
              <span>Slayderni suring</span>
            </div>
          </div>

          {/* Project Details Footer Strip */}
          <div className="p-6 sm:p-8 bg-brand-surface border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            <div>
              <span className="block text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Joylashuvi</span>
              <span className="block text-sm sm:text-base font-bold text-white mt-0.5">{current.location}</span>
            </div>
            <div>
              <span className="block text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Umumiy Maydon</span>
              <span className="block text-sm sm:text-base font-bold text-brand-red mt-0.5">{current.area}</span>
            </div>
            <div>
              <span className="block text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Montaj Vaqti</span>
              <span className="block text-sm sm:text-base font-bold text-emerald-400 mt-0.5 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 inline" /> {current.duration}
              </span>
            </div>
            <div>
              <span className="block text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Ishlatilgan Mahsulot</span>
              <span className="block text-xs sm:text-sm font-semibold text-slate-200 mt-0.5 truncate" title={current.material}>
                {current.material}
              </span>
            </div>
          </div>

        </div>

        {/* Value Highlights & CTA */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-4">
            <div className="p-2.5 rounded-xl bg-brand-red/10 text-brand-red shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm sm:text-base">10 Yillik Rasmiy Kafolat</h4>
              <p className="text-xs text-slate-400 mt-1">Rang o'chmasligi, chidamlilik va havo injiqliklariga rasmiy shartnoma bilan kafolat.</p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-4">
            <div className="p-2.5 rounded-xl bg-brand-red/10 text-brand-red shrink-0">
              <Flame className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm sm:text-base">Olovga & Suvga 100% Chidamli</h4>
              <p className="text-xs text-slate-400 mt-1">A2 sinfidagi yonmaydigan materiallar va mustahkam gidroizolyatsiya.</p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-gradient-to-br from-brand-red/20 to-brand-red/5 border border-brand-red/30 flex flex-col justify-between">
            <div>
              <h4 className="font-bold text-white text-sm sm:text-base">Sizning binongiz ham shunday bo'lsinmi?</h4>
              <p className="text-xs text-slate-300 mt-1">Mutaxassisimiz 1 kunda borib bepul o'lchab beradi.</p>
            </div>
            <button
              onClick={() => onOpenLeadModal("Oldin-Keyin bo'limidan buyurtma")}
              className="mt-3 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-red hover:bg-brand-redHover text-white text-xs font-bold shadow-glow-red transition-all"
            >
              <span>Bepul o'lchashga chaqirish</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};
