import React, { useState } from 'react';
import { submitLead } from '../services/telegram';
import { apiUploadFile } from '../services/api';
import confetti from 'canvas-confetti';
import { X, Send, CheckCircle2, ShieldCheck, Ruler, Camera, Image as ImageIcon } from 'lucide-react';

export const LeadModal = ({ isOpen, onClose, initialData, t }) => {
  if (!isOpen) return null;

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+998');
  const [note, setNote] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [photoName, setPhotoName] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handlePhoneChange = (e) => {
    let val = e.target.value;
    if (!val.startsWith('+998')) {
      val = '+998';
    }
    setPhone(val);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (phone.length < 13) {
      alert("Iltimos, telefon raqamingizni to'liq kiriting: +998 (XX) XXX-XX-XX");
      return;
    }

    setLoading(true);
    const res = await submitLead({
      name,
      phone,
      service: initialData?.service || "Bepul o'lchash va konsultatsiya",
      calcData: initialData?.calcData,
      message: note,
      photoUrl,
      source: initialData?.source || "Modal oynasi"
    });
    setLoading(false);

    if (res.success) {
      setSuccess(true);
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 }
      });
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 4000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-brand-dark/85 backdrop-blur-md animate-fadeIn">
      <div className="glass-panel w-full max-w-lg rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-white/20 shadow-2xl relative">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 text-slate-600 dark:text-slate-300 hover:text-brand-red dark:hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {success ? (
          <div className="py-8 text-center animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-brand-red/20 text-brand-red flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="font-display font-extrabold text-2xl text-slate-900 dark:text-white mb-2">
              Arizangiz qabul qilindi!
            </h3>
            <p className="text-slate-600 dark:text-slate-300 text-sm max-w-sm mx-auto">
              Mutaxassisimiz va admin <strong className="text-brand-red font-bold">@Muhammadazez</strong> tez orada siz bilan bog'lanadi.
            </p>
          </div>
        ) : (
          <div>
            
            <div className="flex items-center gap-2 text-xs font-bold text-brand-red uppercase tracking-wider mb-2">
              <Ruler className="w-4 h-4" />
              <span>Bepul o'lchov va smeta</span>
            </div>

            <h3 className="font-display font-extrabold text-2xl text-slate-900 dark:text-white mb-2">
              {initialData?.service ? initialData.service : "Bepul Usta Chaqirish"}
            </h3>

            {initialData?.calcData && (
              <div className="p-3.5 rounded-xl bg-brand-red/10 border border-brand-red/30 mb-6 text-xs text-slate-700 dark:text-slate-200">
                <span className="font-bold text-brand-red block mb-1">Hisoblangan xarajat:</span>
                <div>Hajmi: <strong className="text-slate-900 dark:text-white">{initialData.calcData.area} m²</strong> | Material: <strong className="text-slate-900 dark:text-white">{initialData.calcData.material}</strong></div>
                <div>Taxminiy summa: <strong className="text-brand-red font-bold">{initialData.calcData.cost}</strong></div>
              </div>
            )}

            <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm mb-6 leading-relaxed">
              Raqamingizni qoldiring, mutaxassisimiz bepul namuna va lazerli o'lchov asbobi bilan tashrif buyuradi.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Ismingiz *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Jasur Aliyev"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-brand-dark/80 border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Telefon raqamingiz *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+998 (90) 123-45-67"
                  value={phone}
                  onChange={handlePhoneChange}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-brand-dark/80 border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red text-sm font-semibold tracking-wide"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Manzilingiz yoki qo'shimcha izoh
                </label>
                <input
                  type="text"
                  placeholder="Masalan: Yunusobod 14-mavze, kottedj"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-brand-dark/80 border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red text-sm"
                />
              </div>

              {/* Optional Photo Attachment */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>Bino yoki uy rasmi (ixtiyoriy)</span>
                  {uploadingPhoto && <span className="text-[10px] text-brand-red animate-pulse">Yuklanmoqda...</span>}
                </label>
                <div className="flex items-center gap-2">
                  <label className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-slate-300 dark:border-white/20 hover:border-brand-red/60 bg-slate-100 dark:bg-white/5 cursor-pointer transition-colors text-xs text-slate-700 dark:text-slate-300">
                    <Camera className="w-4 h-4 text-brand-red" />
                    <span className="truncate">{photoName ? photoName : "Rasmni tanlang yoki suratga oling"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files[0];
                        if (file) {
                          setPhotoName(file.name);
                          setUploadingPhoto(true);
                          const res = await apiUploadFile(file);
                          setUploadingPhoto(false);
                          if (res.success) {
                            setPhotoUrl(res.url);
                          } else {
                            alert(res.error || "Rasm yuklashda xatolik");
                          }
                        }
                      }}
                    />
                  </label>
                  {photoUrl && (
                    <button
                      type="button"
                      onClick={() => { setPhotoUrl(''); setPhotoName(''); }}
                      className="p-2 rounded-xl bg-white/10 hover:bg-brand-red/30 text-slate-300 hover:text-white transition-colors"
                      title="Rasmni o'chirish"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-brand-redLight via-brand-red to-brand-redHover text-white font-extrabold text-sm shadow-glow-red hover:shadow-glow-red-lg flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 mt-6"
              >
                {loading ? (
                  <span>Yuborilmoqda...</span>
                ) : (
                  <>
                    <span>Arizani tasdiqlash</span>
                    <Send className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 pt-2">
                <ShieldCheck className="w-3.5 h-3.5 text-brand-red" />
                <span>100% Bepul va majburiyatlarsiz</span>
              </div>
            </form>

          </div>
        )}

      </div>
    </div>
  );
};
