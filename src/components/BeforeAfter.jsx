import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Sparkles, MoveHorizontal, Upload, Wand2, Download,
  CheckCircle2, ArrowRight, ShieldCheck, Flame, Clock,
  ImagePlus, Loader2, RefreshCcw, X
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════
   Canvas-based AI Facade Transformation
   Converts any building photo into Tunikabond ACM style
   ═══════════════════════════════════════════════════════════ */
function applyTunikabondTransform(sourceCanvas, outputCanvas) {
  const w = sourceCanvas.width;
  const h = sourceCanvas.height;
  outputCanvas.width = w;
  outputCanvas.height = h;

  const ctx = outputCanvas.getContext('2d');

  // 1. Draw original
  ctx.drawImage(sourceCanvas, 0, 0);

  // 2. Pixel-level metallic transformation
  const imgData = ctx.getImageData(0, 0, w, h);
  const d = imgData.data;

  for (let i = 0; i < d.length; i += 4) {
    const r = d[i], g = d[i + 1], b = d[i + 2];
    // Luma
    const luma = 0.299 * r + 0.587 * g + 0.114 * b;
    // Metallic silver-gray with slight cool blue tint
    d[i]     = Math.min(255, luma * 0.82 + 45);  // R
    d[i + 1] = Math.min(255, luma * 0.86 + 42);  // G
    d[i + 2] = Math.min(255, luma * 0.98 + 52);  // B — slightly cool
  }
  ctx.putImageData(imgData, 0, 0);

  // 3. ACM Panel grid overlay
  ctx.save();
  const panelW = Math.round(w / 10);
  const panelH = Math.round(h / 8);

  // Vertical seams
  ctx.strokeStyle = 'rgba(90, 100, 115, 0.22)';
  ctx.lineWidth = 1.5;
  for (let x = panelW; x < w; x += panelW) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
  }
  // Horizontal seams
  for (let y = panelH; y < h; y += panelH) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
  }

  // 4. Metallic specular sheen (top-left highlight)
  const sheen = ctx.createLinearGradient(0, 0, w * 0.6, h * 0.4);
  sheen.addColorStop(0, 'rgba(255,255,255,0.12)');
  sheen.addColorStop(0.5, 'rgba(255,255,255,0.04)');
  sheen.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = sheen;
  ctx.fillRect(0, 0, w, h);

  // 5. Brand red accent at base
  const base = ctx.createLinearGradient(0, h - 55, 0, h);
  base.addColorStop(0, 'rgba(196,0,0,0)');
  base.addColorStop(1, 'rgba(196,0,0,0.35)');
  ctx.fillStyle = base;
  ctx.fillRect(0, h - 55, w, 55);

  // 6. Slight vignette for depth
  const vig = ctx.createRadialGradient(w / 2, h / 2, h * 0.3, w / 2, h / 2, h * 0.9);
  vig.addColorStop(0, 'rgba(0,0,0,0)');
  vig.addColorStop(1, 'rgba(0,0,0,0.22)');
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, w, h);

  // 7. Watermark logo text
  ctx.font = `bold ${Math.max(11, Math.round(w / 52))}px Outfit, system-ui, sans-serif`;
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = 4;
  ctx.fillText('TUNIKABOND LIDER © ', 14, h - 14);

  ctx.restore();
}

/* ═══════════════════════════════════════════════════════════
   AI Uploader Tab Component
   ═══════════════════════════════════════════════════════════ */
const AIFacadeTab = ({ onOpenLeadModal }) => {
  const [uploadedSrc, setUploadedSrc] = useState(null);
  const [resultSrc, setResultSrc]     = useState(null);
  const [status, setStatus]           = useState('idle'); // idle | processing | done | error
  const [sliderPos, setSliderPos]     = useState(50);
  const [isDragging, setIsDragging]   = useState(false);
  const containerRef = useRef(null);
  const fileRef      = useRef(null);
  const sourceCanvas = useRef(document.createElement('canvas'));
  const outputCanvas = useRef(document.createElement('canvas'));

  const processImage = useCallback((file) => {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target.result;
      setUploadedSrc(src);
      setResultSrc(null);
      setStatus('processing');
      setSliderPos(50);

      const img = new Image();
      img.onload = () => {
        // Limit canvas size for performance
        const MAX = 900;
        let cw = img.width, ch = img.height;
        if (cw > MAX) { ch = Math.round(ch * MAX / cw); cw = MAX; }
        sourceCanvas.current.width  = cw;
        sourceCanvas.current.height = ch;
        const sCtx = sourceCanvas.current.getContext('2d');
        sCtx.drawImage(img, 0, 0, cw, ch);

        // Simulate slight delay for "processing" UX
        setTimeout(() => {
          applyTunikabondTransform(sourceCanvas.current, outputCanvas.current);
          setResultSrc(outputCanvas.current.toDataURL('image/jpeg', 0.92));
          setStatus('done');
        }, 1800);
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  }, []);

  const onFilePick = (e) => { processImage(e.target.files[0]); e.target.value = ''; };
  const onDrop = (e) => {
    e.preventDefault();
    processImage(e.dataTransfer.files[0]);
  };

  const handleSliderMove = useCallback((clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const pct = Math.max(2, Math.min(98, ((clientX - rect.left) / rect.width) * 100));
    setSliderPos(pct);
  }, []);

  const downloadResult = () => {
    if (!resultSrc) return;
    const a = document.createElement('a');
    a.href = resultSrc;
    a.download = 'tunikabond-fasad-preview.jpg';
    a.click();
  };

  const reset = () => { setUploadedSrc(null); setResultSrc(null); setStatus('idle'); setSliderPos(50); };

  return (
    <div className="space-y-6">
      {/* Upload area */}
      {!uploadedSrc && (
        <div
          className="relative border-2 border-dashed border-brand-red/40 light:border-brand-red/30 rounded-3xl p-10 text-center cursor-pointer hover:border-brand-red/70 hover:bg-brand-red/5 transition-all group"
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={onDrop}
        >
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFilePick} />
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-brand-red/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ImagePlus className="w-8 h-8 text-brand-red" />
            </div>
            <div>
              <p className="font-display font-bold text-lg light:text-slate-900 text-white mb-1">
                Bino rasmini yuklang
              </p>
              <p className="text-sm light:text-slate-500 text-slate-400">
                JPG, PNG, WEBP — 20 MB gacha. Rasmni shu yerga tashlang yoki bosing
              </p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-red text-white text-sm font-bold hover:bg-brand-redHover transition-colors">
              <Upload className="w-4 h-4" />
              Rasm tanlash
            </div>
          </div>
        </div>
      )}

      {/* Processing state */}
      {status === 'processing' && (
        <div className="rounded-3xl overflow-hidden border light:border-black/10 border-white/10 bg-brand-surface/40 light:bg-slate-50">
          <div className="relative h-64 sm:h-80">
            <img src={uploadedSrc} alt="Original" className="w-full h-full object-cover opacity-40" />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/30">
              <div className="w-14 h-14 rounded-2xl bg-brand-red/90 flex items-center justify-center shadow-glow-red">
                <Loader2 className="w-7 h-7 text-white animate-spin" />
              </div>
              <div className="text-center">
                <p className="font-bold text-white text-base">AI tahlil qilinmoqda…</p>
                <p className="text-slate-300 text-sm mt-1">Tunikabond fasadi qo'llanilmoqda</p>
              </div>
              <div className="flex gap-1.5">
                {[0,1,2].map(i => (
                  <div key={i} className="w-2 h-2 rounded-full bg-brand-red animate-bounce" style={{ animationDelay: `${i*0.15}s` }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Result — before/after slider */}
      {status === 'done' && uploadedSrc && resultSrc && (
        <div className="space-y-4">
          {/* Slider */}
          <div
            ref={containerRef}
            className="relative h-72 sm:h-[420px] rounded-3xl overflow-hidden border light:border-black/10 border-white/15 shadow-2xl cursor-ew-resize select-none"
            onMouseMove={(e) => { if (isDragging) handleSliderMove(e.clientX); }}
            onMouseDown={() => setIsDragging(true)}
            onMouseUp={() => setIsDragging(false)}
            onMouseLeave={() => setIsDragging(false)}
            onTouchMove={(e) => handleSliderMove(e.touches[0].clientX)}
            onClick={(e) => handleSliderMove(e.clientX)}
          >
            {/* AFTER = AI result (full) */}
            <img src={resultSrc} alt="Tunikabond fasadi" className="absolute inset-0 w-full h-full object-cover" draggable={false} />
            <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-brand-red/90 text-white text-xs font-black uppercase tracking-wide flex items-center gap-1 shadow-glow-red pointer-events-none">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
              KEYIN: Tunikabond
            </div>

            {/* BEFORE = original (clipped) */}
            <div className="absolute inset-0 overflow-hidden" style={{ width: `${sliderPos}%` }}>
              <img
                src={uploadedSrc}
                alt="Asl rasm"
                className="absolute inset-0 h-full object-cover max-w-none"
                style={{ width: containerRef.current ? `${containerRef.current.clientWidth}px` : '100%' }}
                draggable={false}
              />
              <div className="absolute inset-0 bg-black/30 pointer-events-none" />
              <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/70 text-slate-300 text-xs font-black uppercase tracking-wide border border-white/20 pointer-events-none">
                OLDIN: Asl holat
              </div>
            </div>

            {/* Divider handle */}
            <div className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_10px_rgba(255,255,255,0.9)] z-20" style={{ left: `${sliderPos}%` }}>
              <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-11 h-11 rounded-full bg-brand-red text-white flex items-center justify-center shadow-glow-red border-2 border-white hover:scale-110 transition-transform">
                <MoveHorizontal className="w-5 h-5" />
              </div>
            </div>

            {/* Hint */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white text-[11px] font-medium pointer-events-none flex items-center gap-1.5">
              <MoveHorizontal className="w-3 h-3 text-brand-red" />
              Slayderni suring
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={downloadResult}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold transition-all shadow-md"
            >
              <Download className="w-4 h-4" />
              Natijani yuklab olish
            </button>
            <button
              onClick={() => onOpenLeadModal("AI Preview — Bepul hisob-kitob va o\u02BClchov")}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-red hover:bg-brand-redHover text-white text-sm font-bold shadow-glow-red transition-all"
            >
              <ArrowRight className="w-4 h-4" />
              Bepul o'lchash chaqirish
            </button>
            <button
              onClick={reset}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl light:bg-black/6 light:text-slate-700 bg-white/8 text-slate-300 border light:border-black/10 border-white/10 text-sm font-semibold hover:text-brand-red transition-all"
            >
              <RefreshCcw className="w-4 h-4" />
              Boshqa rasm
            </button>
          </div>

          {/* Notice */}
          <p className="text-center text-xs light:text-slate-400 text-slate-500 px-4">
            Bu preview avtomatik AI-transformatsiya. Haqiqiy natija materialga, rangga va bino strukturasiga qarab farq qilishi mumkin.
          </p>
        </div>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   Demo Project Slider Tab
   ═══════════════════════════════════════════════════════════ */
const DemoSliderTab = ({ onOpenLeadModal }) => {
  const [sliderPos, setSliderPos]   = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [activeIdx, setActiveIdx]   = useState(0);
  const containerRef = useRef(null);

  const projects = [
    {
      title: 'Tijorat Majmuasi',
      location: 'Toshkent, Chilonzor',
      area: '1,200 m²', duration: '18 kun',
      material: 'Premium Tunikabond & PVDF Alyukabond',
      beforeImg: 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=1200&q=80',
      afterImg:  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
    },
    {
      title: 'Xususiy Kottej',
      location: 'Toshkent viloyati, Qibray',
      area: '480 m²', duration: '10 kun',
      material: "Yog'och teksturali Tunikabond + Karniz",
      beforeImg: 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?auto=format&fit=crop&w=1200&q=80',
      afterImg:  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    },
  ];

  const cur = projects[activeIdx];

  const handleMove = useCallback((clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setSliderPos(Math.max(2, Math.min(98, ((clientX - rect.left) / rect.width) * 100)));
  }, []);

  return (
    <div className="space-y-6">
      {/* Project tabs */}
      <div className="flex gap-2 justify-center flex-wrap">
        {projects.map((p, i) => (
          <button key={i} onClick={() => { setActiveIdx(i); setSliderPos(50); }}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              activeIdx === i
                ? 'bg-brand-red text-white shadow-glow-red scale-105'
                : 'light:bg-black/6 light:border-black/10 light:text-slate-600 bg-white/5 border border-white/10 text-slate-400 hover:text-brand-red'
            }`}>
            {p.title}
          </button>
        ))}
      </div>

      {/* Slider */}
      <div
        ref={containerRef}
        className="relative h-[360px] sm:h-[460px] lg:h-[520px] rounded-3xl overflow-hidden border light:border-black/10 border-white/15 shadow-2xl cursor-ew-resize select-none"
        onMouseMove={(e) => { if (isDragging) handleMove(e.clientX); }}
        onMouseDown={() => setIsDragging(true)}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}
        onTouchMove={(e) => handleMove(e.touches[0].clientX)}
        onClick={(e) => handleMove(e.clientX)}
      >
        <img src={cur.afterImg} alt="Keyin" className="absolute inset-0 w-full h-full object-cover" draggable={false} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-brand-red/90 text-white text-xs font-black uppercase tracking-wide flex items-center gap-1.5 shadow-glow-red pointer-events-none">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
          KEYIN: Tunikabond Lider
        </div>

        <div className="absolute inset-0 overflow-hidden" style={{ width: `${sliderPos}%` }}>
          <img src={cur.beforeImg} alt="Oldin" className="absolute inset-0 h-full object-cover max-w-none"
            style={{ width: containerRef.current ? `${containerRef.current.clientWidth}px` : '100%' }} draggable={false} />
          <div className="absolute inset-0 bg-black/40 pointer-events-none" />
          <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-black/70 backdrop-blur-md text-slate-300 text-xs font-black border border-white/20 uppercase tracking-wide pointer-events-none">
            OLDIN: Eskirgan bino
          </div>
        </div>

        <div className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_12px_rgba(255,255,255,0.8)] z-20" style={{ left: `${sliderPos}%` }}>
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-brand-red text-white flex items-center justify-center shadow-glow-red border-2 border-white hover:scale-110 transition-transform">
            <MoveHorizontal className="w-5 h-5" />
          </div>
        </div>

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3.5 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white text-xs font-medium pointer-events-none flex items-center gap-1.5">
          <MoveHorizontal className="w-3.5 h-3.5 text-brand-red" />
          Slayderni suring
        </div>
      </div>

      {/* Project info strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 sm:p-6 rounded-2xl light:bg-slate-50/80 light:border-black/8 bg-brand-surface/60 border border-white/10">
        <div>
          <span className="block text-[11px] light:text-slate-400 text-slate-400 uppercase tracking-wider font-semibold">Joylashuvi</span>
          <span className="block text-sm font-bold light:text-slate-800 text-white mt-0.5">{cur.location}</span>
        </div>
        <div>
          <span className="block text-[11px] light:text-slate-400 text-slate-400 uppercase tracking-wider font-semibold">Maydon</span>
          <span className="block text-sm font-bold text-brand-red mt-0.5">{cur.area}</span>
        </div>
        <div>
          <span className="block text-[11px] light:text-slate-400 text-slate-400 uppercase tracking-wider font-semibold">Montaj vaqti</span>
          <span className="block text-sm font-bold text-emerald-400 light:text-emerald-600 mt-0.5 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 inline" /> {cur.duration}
          </span>
        </div>
        <div>
          <span className="block text-[11px] light:text-slate-400 text-slate-400 uppercase tracking-wider font-semibold">Mahsulot</span>
          <span className="block text-xs font-semibold light:text-slate-700 text-slate-300 mt-0.5 truncate" title={cur.material}>{cur.material}</span>
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   Main Export
   ═══════════════════════════════════════════════════════════ */
export const BeforeAfter = ({ onOpenLeadModal }) => {
  const [activeTab, setActiveTab] = useState('demo'); // 'demo' | 'ai'

  return (
    <section id="transformation" className="py-20 sm:py-28 relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-brand-red/8 blur-[160px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-red/10 border border-brand-red/30 text-brand-red text-xs font-bold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Haqiqiy Natijalar</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold light:text-slate-900 text-white tracking-tight mb-4">
            Bino Fasadini{' '}
            <span className="red-gradient-text">Oldin va Keyin</span>{' '}
            Taqqoslang
          </h2>
          <p className="text-base sm:text-lg light:text-slate-600 text-slate-300">
            Tayyor loyihalarimizni ko'ring yoki <strong className="light:text-slate-800 text-white">o'z bino rasmingizni yuklang</strong> — AI orqali Tunikabond qilingan holatini ko'rasiz.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 justify-center mb-8">
          <button
            onClick={() => setActiveTab('demo')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold transition-all ${
              activeTab === 'demo'
                ? 'bg-brand-red text-white shadow-glow-red scale-105'
                : 'light:bg-black/5 light:border-black/10 light:text-slate-600 bg-white/8 border border-white/15 text-slate-300 hover:text-white'
            }`}
          >
            <MoveHorizontal className="w-4 h-4" />
            Loyihalarimiz
          </button>
          <button
            onClick={() => setActiveTab('ai')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold transition-all ${
              activeTab === 'ai'
                ? 'bg-gradient-to-r from-brand-red to-brand-redHover text-white shadow-glow-red scale-105'
                : 'light:bg-black/5 light:border-black/10 light:text-slate-600 bg-white/8 border border-white/15 text-slate-300 hover:text-white'
            }`}
          >
            <Wand2 className="w-4 h-4" />
            AI Preview — Rasmingizni yuklang
            <span className="ml-1 px-1.5 py-0.5 rounded-md bg-amber-400 text-amber-900 text-[10px] font-black uppercase tracking-wide">YANGI</span>
          </button>
        </div>

        {/* Tab content */}
        <div className="animate-fadeIn">
          {activeTab === 'demo'
            ? <DemoSliderTab onOpenLeadModal={onOpenLeadModal} />
            : <AIFacadeTab  onOpenLeadModal={onOpenLeadModal} />
          }
        </div>

        {/* Value prop cards */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl mx-auto">
          <div className="p-5 rounded-2xl light:bg-slate-50 light:border-black/8 bg-white/5 border border-white/10 flex items-start gap-4">
            <div className="p-2.5 rounded-xl bg-brand-red/10 text-brand-red shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold light:text-slate-900 text-white text-sm">10 Yillik Rasmiy Kafolat</h4>
              <p className="text-xs light:text-slate-500 text-slate-400 mt-1">Rang, chidamlilik va havo injiqliklariga.</p>
            </div>
          </div>
          <div className="p-5 rounded-2xl light:bg-slate-50 light:border-black/8 bg-white/5 border border-white/10 flex items-start gap-4">
            <div className="p-2.5 rounded-xl bg-brand-red/10 text-brand-red shrink-0">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold light:text-slate-900 text-white text-sm">Olov va Suvga Chidamli</h4>
              <p className="text-xs light:text-slate-500 text-slate-400 mt-1">A2 sinfidagi yonmaydigan materiallar.</p>
            </div>
          </div>
          <div className="p-5 rounded-2xl bg-gradient-to-br from-brand-red/20 to-brand-red/5 border border-brand-red/30 flex flex-col justify-between">
            <div>
              <h4 className="font-bold text-white text-sm">Sizning binongiz ham?</h4>
              <p className="text-xs text-slate-300 mt-1">Mutaxassis 1 kunda bepul o'lchab beradi.</p>
            </div>
            <button
              onClick={() => onOpenLeadModal("Oldin-Keyin bo'limidan buyurtma")}
              className="mt-3 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-red hover:bg-brand-redHover text-white text-xs font-bold shadow-glow-red transition-all"
            >
              Bepul o'lchash
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};
