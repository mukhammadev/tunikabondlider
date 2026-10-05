import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, Award, ChevronLeft, ChevronRight, CheckCircle2, 
  Phone, Send, Sparkles, X, MapPin, Briefcase, Eye, 
  ShieldCheck, Hammer, Layers, Compass, ArrowRight
} from 'lucide-react';

export const TeamSection = ({ 
  t, 
  currentLang = 'uz',
  teamMembers = [], 
  portfolioList = [], 
  onOpenLeadModalWithMaster,
  activeMasterId = null
}) => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedMaster, setSelectedMaster] = useState(null);
  const [zoomedImage, setZoomedImage] = useState(null);

  // Dynamic localization helpers for team members
  const getMemberRole = (member) => {
    if (!member) return '';
    if (typeof member.role === 'object' && member.role !== null) {
      return member.role[currentLang] || member.role.uz || '';
    }
    if (currentLang === 'ru') {
      if (member.id === 'team-boss') return 'Руководитель & Главный инженер';
      if (member.id === 'team-asst') return 'CEO — Генеральный директор';
      if (member.id === 'team-dilshod') return 'Мастер — Монтаж фасадов и Алюкобонда';
      if (member.id === 'team-sanjar') return 'Мастер — Козырьки и декор фасадов';
      if (member.id === 'team-bobur') return 'Мастер — Металлокаркас и монтаж навесов';
      if (member.id === 'team-akmal') return 'Мастер — Въездные ворота и входные порталы';
    } else if (currentLang === 'en') {
      if (member.id === 'team-boss') return 'Founder & Chief Engineer';
      if (member.id === 'team-asst') return 'CEO — Managing Director';
      if (member.id === 'team-dilshod') return 'Master Craftsman — Facades & Alucobond';
      if (member.id === 'team-sanjar') return 'Master Craftsman — Awnings & Facade Decor';
      if (member.id === 'team-bobur') return 'Master Craftsman — Canopies & Subframes';
      if (member.id === 'team-akmal') return 'Master Craftsman — Gate Portals & Entrances';
    }
    return member.role || '';
  };

  const getMemberBio = (member) => {
    if (!member) return '';
    if (typeof member.bio === 'object' && member.bio !== null) {
      return member.bio[currentLang] || member.bio.uz || '';
    }
    if (currentLang === 'ru') {
      if (member.id === 'team-boss') return 'Руководитель и главный инженер компании Tunikabond Lider. Лично гарантирует прочность конструкций и 10-летнюю гарантию.';
      if (member.id === 'team-asst') return 'CEO компании, ответственный за операционную деятельность, контроль качества и поставку сырья.';
      if (member.id === 'team-dilshod') return 'Ведущий мастер по гибке Алюкобонда, лазерной формовке и монтажу сложных вентилируемых фасадов.';
      if (member.id === 'team-sanjar') return 'Специалист по изготовлению прочных козырьков над входом и окнами в консольном и подвесном стиле.';
      if (member.id === 'team-bobur') return 'Мастер по изготовлению автомобильных и дворовых навесов из усиленных профилей и установке водостоков.';
      if (member.id === 'team-akmal') return 'Мастер по оформлению въездных ворот, колонн и входных арок панелями Туникабонд и карнизами.';
    } else if (currentLang === 'en') {
      if (member.id === 'team-boss') return 'Founder and Chief Engineer of Tunikabond Lider. Personally guarantees structural strength and contractual 10-year warranty.';
      if (member.id === 'team-asst') return 'Company CEO managing international raw material sourcing, field operations, and quality audits.';
      if (member.id === 'team-dilshod') return 'Senior craftsman specializing in alucobond bending, laser profiling, and complex ventilated facades.';
      if (member.id === 'team-sanjar') return 'Specialist in cantilever and suspended awnings over entrances and windows with rock-solid durability.';
      if (member.id === 'team-bobur') return 'Expert in carport and courtyard canopies built with heavy-duty steel profiles and drainage systems.';
      if (member.id === 'team-akmal') return 'Specialist in entrance gatehouses, columns, and entrance portals cladded with Tunikabond and cornice systems.';
    }
    return member.bio || t.team?.defaultBio || '';
  };

  const getMemberLabel = (member) => {
    if (!member) return '';
    if (typeof member.label === 'object' && member.label !== null) {
      return member.label[currentLang] || member.label.uz || '';
    }
    if (member.id === 'team-boss') return t.team?.filterBoss || "Firma Boshlig'i";
    if (member.id === 'team-asst') return t.team?.filterCeo || "CEO";
    return t.team?.filterMasters || "Usta";
  };

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

  // Filter team members based on tabs: Barchasi, Firma Boshlig'i, CEO, Ustalar
  const filteredMembers = teamMembers.filter((m) => {
    if (!m) return false;
    const labelStr = (typeof m.label === 'object' ? (m.label?.uz || '') : (m.label || '')).toLowerCase();
    const roleStr = (typeof m.role === 'object' ? (m.role?.uz || '') : (m.role || '')).toLowerCase();
    const idStr = String(m.id || '').toLowerCase();

    if (activeFilter === 'all') return true;
    if (activeFilter === 'boshliq') {
      return (
        idStr === 'team-boss' ||
        labelStr.includes("boshlig") ||
        roleStr.includes("boshlig")
      );
    }
    if (activeFilter === 'ceo') {
      return (
        idStr === 'team-asst' ||
        labelStr.includes("ceo") ||
        roleStr.includes("ceo")
      );
    }
    if (activeFilter === 'masters') {
      const isBoss = idStr === 'team-boss' || labelStr.includes("boshlig") || roleStr.includes("boshlig");
      const isCeo = idStr === 'team-asst' || labelStr.includes("ceo") || roleStr.includes("ceo");
      return !isBoss && !isCeo && !m.isLeader;
    }
    return true;
  });

  const scrollContainerRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);

  // When filtered members are few (e.g. 1 boss, 1 CEO, or <= 3), show clean centered grid
  // so the same person is NEVER duplicated 4-7 times.
  const isCarousel = activeFilter === 'all' && filteredMembers.length > 3;

  // For carousel smooth loop: duplicate once. For grid mode: strictly unique items.
  const displayMembers = isCarousel
    ? [...filteredMembers, ...filteredMembers]
    : filteredMembers;

  // Continuous auto-rotation via requestAnimationFrame only when in carousel mode
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el || filteredMembers.length === 0 || !isCarousel) return;

    let animId;
    const speed = 0.85;

    const step = () => {
      if (!isPaused && !isInteracting && el) {
        el.scrollLeft += speed;
        if (el.scrollLeft >= el.scrollWidth / 2) {
          el.scrollLeft -= el.scrollWidth / 2;
        }
      }
      animId = requestAnimationFrame(step);
    };

    animId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animId);
  }, [isPaused, isInteracting, filteredMembers.length, isCarousel]);

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
    { id: 'all', label: t.team?.filterAll || "Barchasi" },
    { id: 'boshliq', label: t.team?.filterBoss || "Firma Boshlig'i" },
    { id: 'ceo', label: t.team?.filterCeo || "CEO" },
    { id: 'masters', label: t.team?.filterMasters || "Ustalar" }
  ];

  // Helper to get all completed works for selected master (Catalog works + Direct works)
  const getMasterWorks = (master) => {
    if (!master) return [];

    const getLocalizedCat = (catRaw) => {
      if (currentLang === 'ru') {
        if (catRaw === 'naves') return 'Навес';
        if (catRaw === 'koziryok') return 'Козырек';
        if (catRaw === 'darvozaxona') return 'Ворота';
        if (catRaw === 'cornices') return 'Карниз';
        return 'Фасад';
      }
      if (currentLang === 'en') {
        if (catRaw === 'naves') return 'Canopy';
        if (catRaw === 'koziryok') return 'Awning';
        if (catRaw === 'darvozaxona') return 'Gateway';
        if (catRaw === 'cornices') return 'Cornice';
        return 'Facade';
      }
      if (catRaw === 'naves') return 'Naves';
      if (catRaw === 'koziryok') return 'Koziryok';
      if (catRaw === 'darvozaxona') return 'Darvozaxona';
      if (catRaw === 'cornices') return 'Karniz';
      return 'Fasad';
    };

    const catalogWorks = (portfolioList || [])
      .filter((p) => p.masterId === master.id || p.masterName?.toLowerCase() === master.name?.toLowerCase())
      .map((p) => {
        const title = typeof p.title === 'object' ? (p.title[currentLang] || p.title.uz || p.title) : p.title;
        const cat = getLocalizedCat(p.category);
        return {
          id: p.id,
          title: title,
          category: cat,
          image: p.image,
          location: p.location,
          desc: `${p.material || 'Tunikabond'} • ${p.area ? `${p.area}` : ''}`
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
                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-brand-dark/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:border-brand-red/40 hover:text-brand-red dark:hover:text-white'
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
          ) : isCarousel ? (
            <div className="relative overflow-hidden rounded-3xl">
              {/* Seamless Infinite Gliding Track */}
              <div 
                ref={scrollContainerRef}
                className="flex overflow-x-auto scrollbar-none py-3 select-none cursor-grab active:cursor-grabbing"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {displayMembers.map((member, idx) => {
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
                        className="group glass-panel rounded-3xl overflow-hidden border border-slate-200 dark:border-white/10 hover:border-brand-red/50 transition-all duration-300 hover:shadow-glow-red hover:-translate-y-1.5 cursor-pointer flex flex-col h-full bg-white dark:bg-brand-surface/80"
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
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90 pointer-events-none" />

                          {/* Role Badge */}
                          <div className="absolute top-3.5 left-3.5">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold shadow-md border backdrop-blur-md ${
                              isBoss
                                ? 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/40'
                                : isAssistant
                                ? 'bg-blue-100 text-blue-900 border-blue-300 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/40'
                                : 'bg-white/95 text-brand-red border-brand-red/30 dark:bg-brand-red/20 dark:text-white dark:border-brand-red/50'
                            }`}>
                              <Sparkles className="w-3 h-3 text-brand-red" />
                              <span>{getMemberLabel(member)}</span>
                            </span>
                          </div>

                          {/* Projects Count Pill */}
                          <div className="absolute bottom-3 right-3">
                            <span className="px-2.5 py-1 rounded-xl bg-black/75 backdrop-blur-md border border-white/20 text-white text-[11px] font-bold shadow-sm">
                              {member.completedProjects || `250+ ${t.team?.projectsUnit || "obyekt"}`}
                            </span>
                          </div>

                          {/* Experience Pill */}
                          <div className="absolute bottom-3 left-3">
                            <span className="px-2.5 py-1 rounded-xl bg-brand-red text-white text-[11px] font-black flex items-center gap-1 shadow-sm">
                              <ShieldCheck className="w-3 h-3" />
                              <span>{member.experience || `5+ ${t.team?.expUnit || "yil"}`}</span>
                            </span>
                          </div>
                        </div>

                        {/* Card Content */}
                        <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white group-hover:text-brand-red transition-colors flex items-center gap-1.5">
                                <span>{member.name}</span>
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                              </h3>
                            </div>
                            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 line-clamp-1 mb-2">
                              {getMemberRole(member)}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                              {getMemberBio(member)}
                            </p>
                          </div>

                          {/* Completed works count & Action button */}
                          <div className="pt-3 border-t border-slate-200 dark:border-white/10 flex items-center justify-between">
                            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1.5">
                              <Hammer className="w-3.5 h-3.5 text-brand-red" />
                              <span>{worksCount} {t.team?.worksCountSuffix || "ta katalog ishi"}</span>
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
          ) : (
            /* Clean Static Grid for 1, 2 or filtered categories */
            <div className={`grid gap-6 ${
              filteredMembers.length === 1 
                ? 'grid-cols-1 max-w-md mx-auto' 
                : filteredMembers.length === 2 
                ? 'grid-cols-1 sm:grid-cols-2 max-w-3xl mx-auto' 
                : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
            }`}>
              {filteredMembers.map((member) => {
                const isBoss = member.label?.toLowerCase().includes('boshlig');
                const isAssistant = member.label?.toLowerCase().includes('yordamchi');
                const worksCount = getMasterWorks(member).length;

                return (
                  <div
                    key={member.id}
                    className="p-1"
                  >
                    <div 
                      onClick={() => setSelectedMaster(member)}
                      className="group glass-panel rounded-3xl overflow-hidden border border-slate-200 dark:border-white/10 hover:border-brand-red/50 transition-all duration-300 hover:shadow-glow-red hover:-translate-y-1.5 cursor-pointer flex flex-col h-full bg-white dark:bg-brand-surface/80"
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
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90 pointer-events-none" />

                        {/* Role Badge */}
                        <div className="absolute top-3.5 left-3.5">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold shadow-md border backdrop-blur-md ${
                            isBoss
                              ? 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/40'
                              : isAssistant
                              ? 'bg-blue-100 text-blue-900 border-blue-300 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/40'
                              : 'bg-white/95 text-brand-red border-brand-red/30 dark:bg-brand-red/20 dark:text-white dark:border-brand-red/50'
                          }`}>
                            <Sparkles className="w-3 h-3 text-brand-red" />
                            <span>{getMemberLabel(member)}</span>
                          </span>
                        </div>

                        {/* Projects Count Pill */}
                        <div className="absolute bottom-3 right-3">
                          <span className="px-2.5 py-1 rounded-xl bg-black/75 backdrop-blur-md border border-white/20 text-white text-[11px] font-bold shadow-sm">
                            {member.completedProjects || `250+ ${t.team?.projectsUnit || "obyekt"}`}
                          </span>
                        </div>

                        {/* Experience Pill */}
                        <div className="absolute bottom-3 left-3">
                          <span className="px-2.5 py-1 rounded-xl bg-brand-red text-white text-[11px] font-black flex items-center gap-1 shadow-sm">
                            <ShieldCheck className="w-3 h-3" />
                            <span>{member.experience || `5+ ${t.team?.expUnit || "yil"}`}</span>
                          </span>
                        </div>
                      </div>

                      {/* Card Content */}
                      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white group-hover:text-brand-red transition-colors flex items-center gap-1.5">
                              <span>{member.name}</span>
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                            </h3>
                          </div>
                          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 line-clamp-1 mb-2">
                            {getMemberRole(member)}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                            {getMemberBio(member)}
                          </p>
                        </div>

                        {/* Completed works count & Action button */}
                        <div className="pt-3 border-t border-slate-200 dark:border-white/10 flex items-center justify-between">
                          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1.5">
                            <Hammer className="w-3.5 h-3.5 text-brand-red" />
                            <span>{worksCount} {t.team?.worksCountSuffix || "ta katalog ishi"}</span>
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
          )}

          {/* Slider Navigation Arrows - only show in carousel mode */}
          {isCarousel && (
            <div className="flex items-center justify-between pointer-events-none absolute inset-y-0 -left-3 -right-3 sm:-left-5 sm:-right-5 z-20">
              <button
                type="button"
                onClick={handlePrev}
                className="pointer-events-auto p-3 rounded-full bg-white dark:bg-brand-surface/90 hover:bg-brand-red dark:hover:bg-brand-red text-slate-800 dark:text-white hover:text-white border border-slate-200 dark:border-white/20 shadow-xl transition-all hover:scale-110 active:scale-95 cursor-pointer"
                title="Oldingi"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="pointer-events-auto p-3 rounded-full bg-white dark:bg-brand-surface/90 hover:bg-brand-red dark:hover:bg-brand-red text-slate-800 dark:text-white hover:text-white border border-slate-200 dark:border-white/20 shadow-xl transition-all hover:scale-110 active:scale-95 cursor-pointer"
                title="Keyingi"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Micro status indicator - only show in carousel mode */}
          {isCarousel && (
            <div className="flex items-center justify-center gap-2 mt-6 text-xs text-slate-600 dark:text-slate-400 font-medium text-center px-4">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span>{t.team?.streamNotice || "Doimiy silliq aylanuvchi oqim: Ustalar ustiga olib borilsa to'xtaydi, bosing va ishlarini ko'ring"}</span>
            </div>
          )}
        </div>

      </div>

      {/* --- MASTER DETAIL & PORTFOLIO WORKS MODAL --- */}
      {selectedMaster && (() => {
        const masterWorks = getMasterWorks(selectedMaster);
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-fadeIn">
            <div 
              className="glass-panel w-full max-w-4xl max-h-[90vh] rounded-3xl overflow-hidden border border-slate-200 dark:border-brand-red/30 shadow-glow-red flex flex-col bg-white dark:bg-brand-dark animate-scaleUp"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-white/10 flex items-start justify-between bg-slate-50 dark:bg-brand-surface/90 relative">
                <div className="flex items-center gap-4">
                  <img
                    src={selectedMaster.photo || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80"}
                    alt={selectedMaster.name}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-brand-red/50 shadow-md"
                  />
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-brand-red/20 text-brand-red border border-brand-red/40">
                        {getMemberLabel(selectedMaster)}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-300">
                        {selectedMaster.experience || `5+ ${t.team?.expUnit || "yil tajriba"}`}
                      </span>
                    </div>
                    <h3 className="font-display font-extrabold text-xl sm:text-2xl text-slate-900 dark:text-white mt-1 flex items-center gap-1.5">
                      <span>{selectedMaster.name}</span>
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium">
                      {getMemberRole(selectedMaster)}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedMaster(null)}
                  className="p-2 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                  title="Yopish"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body (Scrollable) */}
              <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
                
                {/* Bio & Guarantees */}
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-brand-red" />
                    <span>{t.team?.aboutMaster || "Usta haqida ma'lumot"}</span>
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                    {getMemberBio(selectedMaster)}
                  </p>

                  {/* Key stats row */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                    <div className="p-3 rounded-xl bg-white dark:bg-brand-dark border border-slate-200 dark:border-white/5 shadow-sm">
                      <span className="block text-[11px] text-slate-500 dark:text-slate-400 font-medium">{t.team?.expLabel || "Ish tajribasi:"}</span>
                      <span className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">{selectedMaster.experience || `6+ ${t.team?.expUnit || "yil"}`}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-white dark:bg-brand-dark border border-slate-200 dark:border-white/5 shadow-sm">
                      <span className="block text-[11px] text-slate-500 dark:text-slate-400 font-medium">{t.team?.projectsLabel || "Topshirgan obyektlari:"}</span>
                      <span className="font-bold text-brand-red text-sm sm:text-base">{selectedMaster.completedProjects || `350+ ${t.team?.projectsUnit || "ta"}`}</span>
                    </div>
                    <div className="col-span-2 sm:col-span-1 p-3 rounded-xl bg-white dark:bg-brand-dark border border-slate-200 dark:border-white/5 shadow-sm">
                      <span className="block text-[11px] text-slate-500 dark:text-slate-400 font-medium">{t.team?.warrantyLabel || "Rasmiy kafolat:"}</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm sm:text-base">{t.team?.warrantyValue || "10 yil shartnoma bilan"}</span>
                    </div>
                  </div>
                </div>

                {/* Specific Completed Works Section */}
                <div>
                  <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                    <h4 className="font-display font-extrabold text-base sm:text-lg text-slate-900 dark:text-white flex items-center gap-2">
                      <Hammer className="w-4 h-4 text-brand-red" />
                      <span>{t.team?.sampleWorksTitle || "Ushbu usta bajargan namunali ishlar"} ({masterWorks.length})</span>
                    </h4>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      {t.team?.worksSub || "(Naves, Koziryok, Darvozaxona, Fasad)"}
                    </span>
                  </div>

                  {masterWorks.length === 0 ? (
                    <div className="text-center py-8 text-slate-500 dark:text-slate-400 text-xs sm:text-sm bg-slate-50 dark:bg-brand-surface/40 rounded-2xl border border-slate-200 dark:border-white/5">
                      {t.team?.noWorks || "Ushbu ustaga biriktirilgan foto hisobotlar yaqin orada yangilanadi."}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {masterWorks.map((work) => (
                        <div
                          key={work.id || work.title}
                          className="glass-panel rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 hover:border-brand-red/50 transition-all group/work bg-white dark:bg-brand-surface/50 shadow-sm"
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
                                <span>{t.team?.zoomText || "Kattalashtirish"}</span>
                              </span>
                            </div>
                          </div>

                          <div className="p-4 space-y-1.5">
                            <h5 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm group-hover/work:text-brand-red transition-colors">
                              {work.title}
                            </h5>
                            {work.location && (
                              <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                                <MapPin className="w-3 h-3 text-brand-red flex-shrink-0" />
                                <span>{work.location}</span>
                              </div>
                            )}
                            {work.desc && (
                              <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-normal pt-1 border-t border-slate-100 dark:border-white/5">
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
              <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-brand-surface/90 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-xs text-slate-600 dark:text-slate-300 text-center sm:text-left">
                  {t.team?.modalFooterNote || "Usta manzilingizga borib o'lchov oladi va smeta tuzib beradi."}
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <a
                    href={`tel:${selectedMaster.phone?.replace(/[^\d+]/g, '') || '+998995333303'}`}
                    className="flex-1 sm:flex-none px-4 py-3 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-white/10 dark:hover:bg-white/20 text-slate-800 dark:text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                  >
                    <Phone className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>{t.team?.callBtn || "Qo'ng'iroq qilish"}</span>
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
                    className="flex-1 sm:flex-none px-5 py-3 rounded-xl bg-gradient-to-r from-brand-redLight to-brand-red hover:from-brand-red hover:to-brand-redHover text-white font-extrabold text-xs sm:text-sm shadow-glow-red flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>{t.team?.callMasterBtn || t.team?.callMaster || "Shu ustani chaqirish (Bepul o'lchov)"}</span>
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
