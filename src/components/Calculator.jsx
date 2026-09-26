import React, { useState } from 'react';
import { Calculator as CalcIcon, Check, ArrowRight, Clock, Shield, Sparkles, Building, Layers, Printer, Send } from 'lucide-react';

export const Calculator = ({ t, onOpenLeadModalWithCalc }) => {
  const [buildingType, setBuildingType] = useState('cottage');
  const [materialType, setMaterialType] = useState('tunikabond_premium');
  const [area, setArea] = useState(120);
  const [includeInstallation, setIncludeInstallation] = useState(true);

  // Material unit prices (so'm per sq.m) - Amaldagi aniq bozor narxlari
  const materialPrices = {
    tunikabond_standard: 115000,
    tunikabond_premium: 135000,
    alyukabond_standard: 155000,
    alyukabond_fireproof: 235000,
    profnastil: 75000
  };

  // Installation cost per sq.m (karkas, profil, montaj va usta xizmati)
  const installationRates = {
    cottage: 65000,
    commercial: 75000,
    cornice: 50000,
    roof: 45000
  };

  const currentMatPrice = materialPrices[materialType] || 135000;
  const currentInstallPrice = includeInstallation ? (installationRates[buildingType] || 65000) : 0;
  const totalPricePerSqm = currentMatPrice + currentInstallPrice;
  const calculatedTotal = totalPricePerSqm * area;

  // Work duration logic (in business days)
  let estimatedDays = Math.ceil(area / 25) + 3;
  if (estimatedDays < 3) estimatedDays = 3;

  const handleOrderWithEstimate = () => {
    const formattedCost = new Intl.NumberFormat('uz-UZ').format(calculatedTotal) + " so'm";
    const calcData = {
      buildingType: t.calculator.buildingTypes[buildingType],
      material: t.calculator.materialTypes[materialType],
      area: area,
      cost: formattedCost,
      includeInstallation: includeInstallation
    };
    onOpenLeadModalWithCalc(calcData);
  };

  const handlePrintEstimate = () => {
    const formattedCost = new Intl.NumberFormat('uz-UZ').format(calculatedTotal) + " so'm";
    const formattedPerSqm = new Intl.NumberFormat('uz-UZ').format(totalPricePerSqm) + " so'm / m²";
    const bType = t.calculator.buildingTypes[buildingType];
    const mType = t.calculator.materialTypes[materialType];

    const printWin = window.open('', '_blank');
    if (!printWin) return;
    printWin.document.write(`
      <html>
        <head>
          <title>Tunikabond Lider – Rasmiy Smeta</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #1e293b; max-width: 650px; margin: auto; }
            .header { border-bottom: 2px solid #C40000; padding-bottom: 15px; margin-bottom: 25px; display: flex; justify-content: space-between; align-items: center; }
            .logo { font-size: 22px; font-weight: 900; color: #0f172a; }
            .logo span { color: #C40000; }
            .badge { background: #fee2e2; color: #C40000; padding: 4px 10px; border-radius: 999px; font-size: 11px; font-weight: bold; }
            .title { font-size: 18px; font-weight: bold; margin-bottom: 15px; color: #0f172a; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 25px; font-size: 14px; }
            th, td { padding: 12px; border-bottom: 1px solid #e2e8f0; text-align: left; }
            th { background: #f8fafc; color: #64748b; font-size: 12px; text-transform: uppercase; }
            .total-row { background: #fef2f2; font-weight: bold; font-size: 16px; color: #C40000; }
            .note { font-size: 12px; color: #64748b; margin-top: 20px; line-height: 1.6; }
            .contact { margin-top: 30px; padding: 15px; background: #f8fafc; border-radius: 12px; font-size: 13px; line-height: 1.6; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">TUNIKABOND <span>LIDER</span></div>
            <div class="badge">Dastlabki Smeta</div>
          </div>
          <div class="title">Bino Fasad va Tom Qoplami Taxminiy Smetasi</div>
          <table>
            <tr><th>Ko'rsatkich</th><th>Tafsilot</th></tr>
            <tr><td>Bino turi</td><td><strong>${bType}</strong></td></tr>
            <tr><td>Tanlangan Material</td><td><strong>${mType}</strong></td></tr>
            <tr><td>Umumiy maydon</td><td><strong>${area} m²</strong></td></tr>
            <tr><td>Montaj xizmati</td><td>${includeInstallation ? "Kiritilgan" : "Kiritilmagan"}</td></tr>
            <tr><td>1 m² o'rtacha narxi</td><td>${formattedPerSqm}</td></tr>
            <tr><td>Bajarish muddati</td><td>~${estimatedDays} ish kuni</td></tr>
            <tr><td>Kafolat muddati</td><td>10 yil shartnoma asosida</td></tr>
            <tr class="total-row"><td>Jami Taxminiy Qiymat:</td><td>${formattedCost}</td></tr>
          </table>
          <div class="contact">
            <strong>Kompaniya bilan bog'lanish:</strong><br/>
            Telefon: +998 (99) 533-33-03 | Telegram: @Muhammadazez<br/>
            Veb-sayt: https://tunikabondlider.uz
          </div>
          <div class="note">
            * Mazkur hisob-kitob dastlabki smeta hisoblanadi. Yakuniy aniq narx mutaxassisimiz bino joyiga borib bepul o'lchov olganidan so'ng belgilanadi.
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWin.document.close();
  };

  return (
    <section id="calculator" className="py-24 relative overflow-hidden bg-brand-surface/40">
      {/* Background radial glow */}
      <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-brand-red/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-red/10 border border-brand-red/30 text-brand-red text-xs font-bold uppercase tracking-wider mb-4">
            <CalcIcon className="w-3.5 h-3.5" />
            <span>{t.calculator.badge}</span>
          </div>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight mb-4">
            {t.calculator.title}
          </h2>
          <p className="text-slate-300 text-base sm:text-lg">
            {t.calculator.subtitle}
          </p>
        </div>

        {/* Main Calculator Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Controls Column (7 cols) */}
          <div className="lg:col-span-7 glass-panel p-6 sm:p-8 rounded-3xl space-y-8">
            
            {/* 1. Building Type Selector */}
            <div>
              <label className="block text-sm font-bold text-slate-200 mb-3 flex items-center gap-2">
                <Building className="w-4 h-4 text-brand-red" />
                <span>{t.calculator.buildingType}</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-2 gap-3">
                {Object.entries(t.calculator.buildingTypes).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setBuildingType(key)}
                    className={`p-3.5 rounded-xl border text-left font-medium text-xs sm:text-sm transition-all flex items-center justify-between ${
                      buildingType === key
                        ? 'bg-brand-red/15 border-brand-red text-white font-bold shadow-sm'
                        : 'bg-brand-dark/50 border-white/10 text-slate-300 hover:border-white/20 hover:text-white'
                    }`}
                  >
                    <span>{label}</span>
                    {buildingType === key && <Check className="w-4 h-4 text-brand-red flex-shrink-0" />}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Material Selector */}
            <div>
              <label className="block text-sm font-bold text-slate-200 mb-3 flex items-center gap-2">
                <Layers className="w-4 h-4 text-brand-red" />
                <span>{t.calculator.materialType}</span>
              </label>
              <div className="space-y-2.5">
                {Object.entries(t.calculator.materialTypes).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setMaterialType(key)}
                    className={`w-full p-3.5 rounded-xl border text-left font-medium text-xs sm:text-sm transition-all flex items-center justify-between ${
                      materialType === key
                        ? 'bg-brand-red/15 border-brand-red text-white font-bold'
                        : 'bg-brand-dark/50 border-white/10 text-slate-300 hover:border-white/20 hover:text-white'
                    }`}
                  >
                    <span>{label}</span>
                    {materialType === key && <Check className="w-4 h-4 text-brand-red flex-shrink-0" />}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Area Slider & Number Box */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-bold text-slate-200">
                  {t.calculator.areaLabel}
                </label>
                <div className="flex items-center gap-1.5 bg-brand-dark px-3 py-1.5 rounded-xl border border-white/15">
                  <input
                    type="number"
                    min="10"
                    max="3000"
                    value={area}
                    onChange={(e) => setArea(Math.max(10, Math.min(3000, Number(e.target.value) || 10)))}
                    className="w-16 bg-transparent text-right font-display font-bold text-brand-red text-base focus:outline-none"
                  />
                  <span className="text-xs text-slate-400 font-bold">{t.calculator.sqm}</span>
                </div>
              </div>

              <input
                type="range"
                min="10"
                max="1000"
                step="5"
                value={area}
                onChange={(e) => setArea(Number(e.target.value))}
                className="w-full h-2.5 bg-brand-dark rounded-lg appearance-none cursor-pointer accent-brand-red"
              />

              <div className="flex justify-between text-[11px] text-slate-500 mt-2 font-medium">
                <span>10 m²</span>
                <span>250 m²</span>
                <span>500 m²</span>
                <span>1,000+ m²</span>
              </div>
            </div>

            {/* 4. Installation Toggle */}
            <div className="pt-2">
              <label className="flex items-center gap-3 p-3.5 rounded-xl bg-brand-dark/60 border border-white/10 cursor-pointer hover:border-brand-red/30 transition-colors">
                <input
                  type="checkbox"
                  checked={includeInstallation}
                  onChange={(e) => setIncludeInstallation(e.target.checked)}
                  className="w-5 h-5 rounded border-white/20 text-brand-red focus:ring-brand-red bg-brand-card cursor-pointer accent-brand-red"
                />
                <span className="text-xs sm:text-sm text-slate-200 font-medium">
                  {t.calculator.includeInstallation}
                </span>
              </label>
            </div>

          </div>

          {/* Results Summary Box (5 cols) */}
          <div className="lg:col-span-5 sticky top-28">
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border-brand-red/30 shadow-glow-red relative overflow-hidden">
              
              {/* Highlight badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-red/15 text-brand-red text-xs font-bold mb-6">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Tezkor hisob-kitob</span>
              </div>

              {/* Price Display */}
              <div className="mb-6 pb-6 border-b border-white/10">
                <span className="block text-xs uppercase tracking-wider text-slate-400 font-bold mb-1">
                  {t.calculator.estimatedCost}
                </span>
                <div className="font-display font-extrabold text-3xl sm:text-4xl text-white red-gradient-text tracking-tight">
                  {new Intl.NumberFormat('uz-UZ').format(calculatedTotal)} <span className="text-lg text-slate-300 font-medium">so'm</span>
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  (O'rtacha {new Intl.NumberFormat('uz-UZ').format(totalPricePerSqm)} so'm / m² {includeInstallation ? "tayyor montaji bilan" : "faqat material"})
                </p>
              </div>

              {/* Breakdown details */}
              <div className="space-y-3.5 mb-8 text-xs sm:text-sm">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-brand-red" />
                    <span>{t.calculator.estimatedTime}</span>
                  </span>
                  <span className="font-bold text-white">~{estimatedDays} {t.calculator.days}</span>
                </div>

                <div className="flex items-center justify-between text-slate-300">
                  <span className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-brand-red" />
                    <span>Rasmiy kafolat:</span>
                  </span>
                  <span className="font-bold text-white">10 yil shartnoma bilan</span>
                </div>

                <div className="flex items-center justify-between text-slate-300">
                  <span className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-brand-red" />
                    <span>Mutaxassis o'lchovi:</span>
                  </span>
                  <span className="font-bold text-brand-red">100% Bepul</span>
                </div>
              </div>

              {/* Order with calculation button */}
              <button
                type="button"
                onClick={handleOrderWithEstimate}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-brand-redLight via-brand-red to-brand-redHover text-white font-extrabold text-sm sm:text-base shadow-glow-red hover:shadow-glow-red-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <span>{t.calculator.orderWithCalc}</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              {/* Secondary utility actions */}
              <div className="grid grid-cols-2 gap-2 mt-3">
                <button
                  type="button"
                  onClick={handlePrintEstimate}
                  className="py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                  title="Smetani PDF / Qog'ozga chop etish"
                >
                  <Printer className="w-3.5 h-3.5 text-brand-red" />
                  <span>Smetani chop etish (PDF)</span>
                </button>

                <a
                  href={`https://t.me/Muhammadazez?text=${encodeURIComponent(
                    `Assalomu alaykum @Muhammadazez!\n` +
                    `Kalkulyator orqali hisob-kitob qildim:\n` +
                    `🏢 Bino: ${t.calculator.buildingTypes[buildingType]}\n` +
                    `🧱 Material: ${t.calculator.materialTypes[materialType]}\n` +
                    `📐 Maydon: ${area} m²\n` +
                    `💰 Narx: ${new Intl.NumberFormat('uz-UZ').format(calculatedTotal)} so'm\n` +
                    `⏱ Muddat: ~${estimatedDays} kun\n\n` +
                    `Iltimos, bepul o'lchov uchun bog'lansangiz.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-3 rounded-xl bg-[#0088cc]/20 hover:bg-[#0088cc]/30 border border-[#0088cc]/40 text-[#29b6f6] font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                  title="Hisobni Telegram orqali adminga yuborish"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Telegramga yuborish</span>
                </a>
              </div>

              <p className="text-[11px] text-slate-400 text-center mt-4 leading-normal">
                {t.calculator.consultationNotice}
              </p>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
