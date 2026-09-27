import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, Award, ChevronLeft, ChevronRight, CheckCircle2, 
  Phone, Send, Sparkles, X, MapPin, Briefcase, Eye, 
  ShieldCheck, Hammer, Layers, Compass, ArrowRight
} from 'lucide-react';

export const TeamSection = ({ 
  t, 
  teamMembers = [], 
  portfolioList = [], 
  onOpenLeadModalWithMaster,
  activeMasterId = null
}) => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedMaster, setSelectedMaster] = useState(null);
  const [zoomedImage, setZoomedImage] = useState(null);

  // If parent requests opening a master (e.g. from Portfolio catalog click)
  useEffect(() => {
    if (activeMasterId && teamMembers.length > 0) {
      const found = teamMembers.find(
        (m) => m.id === activeMasterId || m.name?.toLowerCase() === activeMasterId?.toLowerCase()
      );
      if (found) {
        setSelectedMaster(found);
      }
    }
  }, [activeMasterId, teamMembers]);

  // Filter team members based on tabs: Barchasi, Ustalar, Firma Rahbariyati
  const filteredMembers = teamMembers.filter((m) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'leadership') {
      return (
        m.isLeader || 
        m.label?.toLowerCase().includes('boshlig') || 
        m.label?.toLowerCase().includes('yordamchi') ||
        m.role?.toLowerCase().includes('boshlig') ||
        m.role?.toLowerCase().includes('yordamchi')
      );
    }
    if (activeFilter === 'masters') {
      return !m.isLeader && !m.label?.toLowerCase().includes('boshlig');
    }
    return true;
  });

  const scrollContainerRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);

  // Helper to ensure infinite seamless loop without gaps
  const getInfiniteMembers = () => {
    if (filteredMembers.length === 0) return [];
    if (filteredMembers.length === 1) return [filteredMembers[0], filteredMembers[0], filteredMembers[0], filteredMembers[0]];
    if (filteredMembers.length === 2) return [...filteredMembers, ...filteredMembers, ...filteredMembers];
    return [...filteredMembers, ...filteredMembers];
  };

  const infiniteMembers = getInfiniteMembers();

  // Continuous auto-rotation via requestAnimationFrame (no sudden stops, no rewind jumps)
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el || filteredMembers.length === 0) return;

    let animId;
    const speed = 0.85; // Silliq va bemalol o'qiladigan doimiy harakat

    const step = () => {
      if (!isPaused && !isInteracting && el) {
        el.scrollLeft += speed;
        // Yarim qismiga borganda, ikkinchi nusxa boshiga silliq va ko'rinmas o'tadi
        if (el.scrollLeft >= el.scrollWidth / 2) {
          el.scrollLeft -= el.scrollWidth / 2;
        }
      }
      animId = requestAnimationFrame(step);
    };

    animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, [isPaused, isInteracting, filteredMembers.length]);

  const handlePrev = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -360, behavior: 'smooth' });
    }
  };

  const handleNext = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 360, behavior: 'smooth' });
    }
  };

  const filterTabs = [
    { id: 'all', label: t.team?.all || "Barchasi" },
    { id: 'masters', label: t.team?.masters || "Ustalar" },
    { id: 'leadership', label: t.team?.leadership || "Firma Rahbariyati" }
  ];

  // Helper to get all completed works for selected master (Catalog works + Direct works)
  const getMasterWorks = (master) => {
    if (!master) return [];

    const catalogWorks = (portfolioList || [])
      .filter((p) => p.masterId === master.id || p.masterName?.toLowerCase() === master.name?.toLowerCase())
      .map((p) => {
        const title = typeof p.title === 'object' ? (p.title.uz || p.title) : p.title;
        const cat = p.category === 'naves' ? 'Naves' : p.category === 'koziryok' ? 'Koziryok' : p.category === 'darvozaxona' ? 'Darvozaxona' : p.category === 'cornices' ? 'Karniz' : 'Fasad';
        return {
          id: p.id,
          title: title,
          category: cat,
          image: p.image,
          location: p.location,
          desc: `${p.material || 'Tunikabond'} • Hajmi: ${p.area || ''} • Bajarish muddati: ${p.time || ''}`
        };
      });

    const directWorks = master.works || [];
    const combined = [
      ...catalogWorks,
      ...directWorks.filter((dw) => !catalogWorks.some((cw) => cw.id === dw.id || cw.title === dw.title))
    ];

    return combined;
  };

  return (
    <section id="team" className="py-24 relative overflow-hidden bg-brand-surface/60 border-t border-white/5">
      {/* Background atmosphere glows */}
      <div className="absolute top-1/3 left-0 w-[500px] h-[500px] bg-brand-red/5 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-10 right-0 w-[400px] h-[400px] bg-brand-redLight/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-red/10 border border-brand-red/30 text-brand-red text-xs font-bold uppercase tracking-wider mb-4">
            <Users className="w-3.5 h-3.5" />
            <span>{t.team?.badge || "Bizning Professional Jamoa"}</span>
          </div>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-slate-900 dark:text-white tracking-tight mb-4">
            {t.team?.title || "Tajribali Ustalar va Rahbariyat"}
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg">
            {t.team?.subtitle || "Ko'p yillik amaliy tajribaga ega bo'lgan o'z sohasining yetakchi ustalari va muhandislari."}
          </p>
        </div>

        {/* Filter Navigation Tabs (Barchasi, Ustalar, Firma Rahbariyati) */}
        <div className="flex items-center justify-center gap-2 mb-10">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap transition-all border ${
                activeFilter === tab.id
                  ? 'bg-brand-red text-white border-brand-red shadow-glow-red scale-105'
                  : 'bg-brand-dark/60 text-slate-300 border-white/10 hover:border-brand-red/40 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Continuous Infinite Auto-rotating Carousel Container */}
        <div 
          className="relative group/carousel"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsInteracting(true)}
          onTouchEnd={() => {
            setTimeout(() => setIsInteracting(false), 2000);
          }}
        >
          {filteredMembers.length === 0 ? (
            <div className="text-center py-16 text-slate-400 glass-panel rounded-3xl">
              Ushbu toifada hozircha xodimlar mavjud emas.
            </div>
          ) : (
            <div className="relative overflow-hidden rounded-3xl">
              
              {/* Seamless Infinite Gliding Track */}
              <div 
                ref={scrollContainerRef}
                className="flex overflow-x-auto scrollbar-none py-3 select-none cursor-grab active:cursor-grabbing"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {infiniteMembers.map((member, idx) => {
                  const isBoss = member.label?.toLowerCase().includes('boshlig');
                  const isAssistant = member.label?.toLowerCase().includes('yordamchi');
                  const worksCount = getMasterWorks(member).length;

                  return (
                    <div
                      key={`${member.id}-${idx}`}
                      className="w-[300px] sm:w-[350px] lg:w-[380px] flex-shrink-0 p-3"
                    >
                      <div 
                        onClick={() => setSelectedMaster(member)}
                        className="group glass-panel rounded-3xl overflow-hidden border-white/10 hover:border-brand-red/50 transition-all duration-300 hover:shadow-glow-red hover:-translate-y-1.5 cursor-pointer flex flex-col h-full bg-brand-surface/80"
                      >
                        {/* Member Photo Box */}
                        <div className="relative aspect-[4/3] overflow-hidden bg-brand-dark">
                          <img
                            src={member.photo || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80"}
                            alt={member.name}
                            className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105 pointer-events-none"
                            onError={(e) => {
                              e.target.src = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80";
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-transparent to-transparent opacity-80 pointer-events-none" />

                          {/* Role Badge */}
                          <div className="absolute top-3.5 left-3.5">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold shadow-md border ${
                              isBoss
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 backdrop-blur-md'
                                : isAssistant
                                ? 'bg-blue-500/20 text-blue-300 border-blue-500/40 backdrop-blur-md'
                                : 'bg-brand-red/20 text-white border-brand-red/50 backdrop-blur-md'
                            }`}>
                              <Sparkles className="w-3 h-3 text-brand-red" />
                              <span>{member.label || member.role}</span>
                            </span>
                          </div>

                          {/* Projects Count Pill */}
                          <div className="absolute bottom-3 right-3">
                            <span className="px-2.5 py-1 rounded-xl bg-brand-dark/80 backdrop-blur-md border border-white/10 text-white text-[11px] font-bold">
                              {member.completedProjects || "250+ obyekt"}
                            </span>
                          </div>

                          {/* Experience Pill */}
                          <div className="absolute bottom-3 left-3">
                            <span className="px-2.5 py-1 rounded-xl bg-brand-red/90 text-white text-[11px] font-black flex items-center gap-1 shadow-sm">
                              <ShieldCheck className="w-3 h-3" />
                              <span>{member.experience || "5+ yil"}</span>
                            </span>
                          </div>
                        </div>

                        {/* Card Content */}
                        <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <h3 className="font-display font-bold text-lg text-white group-hover:text-brand-red transition-colors flex items-center gap-1.5">
                                <span>{member.name}</span>
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                              </h3>
                            </div>
                            <p className="text-xs font-semibold text-slate-300 line-clamp-1 mb-2">
                              {member.role}
                            </p>
                            <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                              {member.bio || "Tunikabond Lider korxonasining tajribali ustasi."}
                            </p>
                          </div>

                          {/* Completed works count & Action button */}
                          <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                            <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                              <Hammer className="w-3.5 h-3.5 text-brand-red" />
                              <span>{worksCount} ta katalog ishi</span>
                            </span>

                            <span className="text-xs font-bold text-brand-red flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                              <span>{t.team?.viewWorks || "Ishlarini ko'rish"}</span>
                              <ChevronRight className="w-4 h-4" />
                            </span>
                          </div>

                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Slider Navigation Arrows */}
          <div className="flex items-center justify-between pointer-events-none absolute inset-y-0 -left-3 -right-3 sm:-left-5 sm:-right-5 z-20">
            <button
              type="button"
              onClick={handlePrev}
              className="pointer-events-auto p-3 rounded-full bg-brand-surface/90 hover:bg-brand-red text-white border border-white/20 shadow-xl transition-all hover:scale-110 active:scale-95"
              title="Oldingi usta"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="pointer-events-auto p-3 rounded-full bg-brand-surface/90 hover:bg-brand-red text-white border border-white/20 shadow-xl transition-all hover:scale-110 active:scale-95"
              title="Keyingi usta"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Micro status indicator */}
          <div className="flex items-center justify-center gap-2 mt-6 text-xs text-slate-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Doimiy silliq aylanuvchi oqim: Ustalar ustiga olib borilsa to'xtaydi, bosing va ishlarini ko'ring</span>
          </div>
        </div>

      </div>

      {/* --- MASTER DETAIL & PORTFOLIO WORKS MODAL --- */}
      {selectedMaster && (() => {
        const masterWorks = getMasterWorks(selectedMaster);
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-fadeIn">
            <div 
              className="glass-panel w-full max-w-4xl max-h-[90vh] rounded-3xl overflow-hidden border-brand-red/30 shadow-glow-red flex flex-col bg-brand-dark animate-scaleUp"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="p-5 sm:p-6 border-b border-white/10 flex items-start justify-between bg-brand-surface/90 relative">
                <div className="flex items-center gap-4">
                  <img
                    src={selectedMaster.photo || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80"}
                    alt={selectedMaster.name}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-brand-red/50 shadow-md"
                  />
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-brand-red/20 text-brand-red border border-brand-red/40">
                        {selectedMaster.label || selectedMaster.role}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-white/10 text-slate-300">
                        {selectedMaster.experience || "5+ yil tajriba"}
                      </span>
                    </div>
                    <h3 className="font-display font-extrabold text-xl sm:text-2xl text-white mt-1 flex items-center gap-1.5">
                      <span>{selectedMaster.name}</span>
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-300 font-medium">
                      {selectedMaster.role}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedMaster(null)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                  title="Yopish"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body (Scrollable) */}
              <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
                
                {/* Bio & Guarantees */}
                <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-brand-red" />
                    <span>Usta haqida ma'lumot</span>
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                    {selectedMaster.bio || "Tunikabond Lider korxonasining rasmiy sertifikatlangan ustasi. Barcha ishlar shartnoma asosida 10 yillik kafolat bilan topshiriladi."}
                  </p>

                  {/* Key stats row */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                    <div className="p-3 rounded-xl bg-brand-dark border border-white/5">
                      <span className="block text-[11px] text-slate-400 font-medium">Ish tajribasi:</span>
                      <span className="font-bold text-white text-sm sm:text-base">{selectedMaster.experience || "6+ yil"}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-brand-dark border border-white/5">
                      <span className="block text-[11px] text-slate-400 font-medium">Topshirgan obyektlari:</span>
                      <span className="font-bold text-brand-red text-sm sm:text-base">{selectedMaster.completedProjects || "350+ ta"}</span>
                    </div>
                    <div className="col-span-2 sm:col-span-1 p-3 rounded-xl bg-brand-dark border border-white/5">
                      <span className="block text-[11px] text-slate-400 font-medium">Rasmiy kafolat:</span>
                      <span className="font-bold text-emerald-400 text-sm sm:text-base">10 yil shartnoma bilan</span>
                    </div>
                  </div>
                </div>

                {/* Specific Completed Works Section */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-display font-extrabold text-base sm:text-lg text-white flex items-center gap-2">
                      <Hammer className="w-4 h-4 text-brand-red" />
                      <span>Ushbu usta bajargan namunali ishlar ({masterWorks.length})</span>
                    </h4>
                    <span className="text-xs text-slate-400 font-medium">
                      (Naves, Koziryok, Darvozaxona, Fasad)
                    </span>
                  </div>

                  {masterWorks.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-xs sm:text-sm bg-brand-surface/40 rounded-2xl border border-white/5">
                      Ushbu ustaga biriktirilgan foto hisobotlar yaqin orada yangilanadi.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {masterWorks.map((work) => (
                        <div
                          key={work.id || work.title}
                          className="glass-panel rounded-2xl overflow-hidden border border-white/10 hover:border-brand-red/50 transition-all group/work bg-brand-surface/50"
                        >
                          <div 
                            className="relative aspect-video overflow-hidden cursor-pointer"
                            onClick={() => setZoomedImage(work.image)}
                          >
                            <img
                              src={work.image}
                              alt={work.title}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover/work:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-70" />
                            
                            <div className="absolute top-2.5 left-2.5">
                              <span className="px-2.5 py-0.5 rounded-lg bg-brand-red text-white text-[11px] font-bold shadow-md">
                                {work.category || "Naves"}
                              </span>
                            </div>

                            <div className="absolute bottom-2.5 right-2.5 opacity-0 group-hover/work:opacity-100 transition-opacity">
                              <span className="p-1.5 rounded-lg bg-black/60 text-white backdrop-blur-sm flex items-center gap-1 text-[11px]">
                                <Eye className="w-3.5 h-3.5" />
                                <span>Kattalashtirish</span>
                              </span>
                            </div>
                          </div>

                          <div className="p-4 space-y-1.5">
                            <h5 className="font-bold text-white text-xs sm:text-sm group-hover/work:text-brand-red transition-colors">
                              {work.title}
                            </h5>
                            {work.location && (
                              <div className="flex items-center gap-1 text-[11px] text-slate-400">
                                <MapPin className="w-3 h-3 text-brand-red flex-shrink-0" />
                                <span>{work.location}</span>
                              </div>
                            )}
                            {work.desc && (
                              <p className="text-[11px] text-slate-300 leading-normal pt-1 border-t border-white/5">
                                {work.desc}
                              </p>
                            )}
                          </div>

                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

              {/* Modal Footer (Action CTAs) */}
              <div className="p-4 sm:p-5 border-t border-white/10 bg-brand-surface/90 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-xs text-slate-300 text-center sm:text-left">
                  Usta manzilingizga borib o'lchov oladi va smeta tuzib beradi.
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <a
                    href={`tel:${selectedMaster.phone?.replace(/[^\d+]/g, '') || '+998995333303'}`}
                    className="flex-1 sm:flex-none px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                  >
                    <Phone className="w-4 h-4 text-emerald-400" />
                    <span>Qo'ng'iroq qilish</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => {
                      const masterName = selectedMaster.name;
                      setSelectedMaster(null);
                      if (onOpenLeadModalWithMaster) {
                        onOpenLeadModalWithMaster(masterName);
                      }
                    }}
                    className="flex-1 sm:flex-none px-5 py-3 rounded-xl bg-gradient-to-r from-brand-redLight to-brand-red hover:from-brand-red hover:to-brand-redHover text-white font-extrabold text-xs sm:text-sm shadow-glow-red flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>{t.team?.callMaster || "Shu ustani chaqirish (Bepul o'lchov)"}</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        );
      })()}

      {/* Full-screen Zoom Preview for Master's Works */}
      {zoomedImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setZoomedImage(null)}
        >
          <div className="relative max-w-5xl max-h-[90vh]">
            <img
              src={zoomedImage}
              alt="Usta bajargan ish"
              className="max-w-full max-h-[85vh] rounded-2xl object-contain border border-white/20 shadow-2xl"
            />
            <button
              onClick={() => setZoomedImage(null)}
              className="absolute -top-12 right-0 p-2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}

    </section>
  );
};
