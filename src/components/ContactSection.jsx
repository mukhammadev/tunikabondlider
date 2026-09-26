import React, { useState } from 'react';
import { submitLead } from '../services/telegram';
import confetti from 'canvas-confetti';
import { Phone, MapPin, Clock, Send, CheckCircle2, ShieldCheck, UserCheck } from 'lucide-react';

export const ContactSection = ({ t }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '+998',
    service: 'Tunikabond Fasad',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handlePhoneChange = (e) => {
    let val = e.target.value;
    if (!val.startsWith('+998')) {
      val = '+998';
    }
    setFormData({ ...formData, phone: val });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.phone.length < 13) {
      alert("Iltimos, telefon raqamingizni to'liq kiriting: +998 (XX) XXX-XX-XX");
      return;
    }

    setLoading(true);
    const res = await submitLead({
      ...formData,
      source: "Bog'lanish bo'limi formasi"
    });
    setLoading(false);

    if (res.success) {
      setSuccess(true);
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
      setFormData({
        name: '',
        phone: '+998',
        service: 'Tunikabond Fasad',
        message: ''
      });
    }
  };

  return (
    <section id="contact" className="py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-red/10 border border-brand-red/30 text-brand-red text-xs font-bold uppercase tracking-wider mb-4">
            <Phone className="w-3.5 h-3.5" />
            <span>{t.contact.badge}</span>
          </div>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight mb-4">
            {t.contact.title}
          </h2>
          <p className="text-slate-300 text-base sm:text-lg">
            {t.contact.subtitle}
          </p>
        </div>

        {/* Contact Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Info & Map Column (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Quick Contacts Box */}
            <div className="glass-panel p-6 sm:p-8 rounded-3xl space-y-6 border-brand-red/20 shadow-glow-red">
              
              {/* Telegram Admin Highlight Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-[#0088cc]/15 to-[#29b6f6]/10 border border-[#29b6f6]/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-[#0088cc] flex items-center justify-center text-white shadow-md">
                    <UserCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="block text-[11px] text-slate-300 uppercase tracking-wider font-semibold">
                      Telegram Admin & Menejer
                    </span>
                    <a 
                      href="https://t.me/Muhammadazez" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="font-display font-black text-base text-white hover:text-brand-red transition-colors flex items-center gap-1.5"
                    >
                      <span>@Muhammadazez</span>
                    </a>
                  </div>
                </div>

                <a
                  href="https://t.me/Muhammadazez"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 rounded-xl bg-[#0088cc] hover:bg-[#0077b5] text-white text-xs font-bold transition-all shadow-sm"
                >
                  Yozish
                </a>
              </div>

              {/* Phone numbers */}
              <div>
                <span className="block text-xs uppercase tracking-wider font-bold text-slate-400 mb-2">
                  {t.contact.phoneTitle}
                </span>
                <div className="space-y-2">
                  <a 
                    href="tel:+998995333303" 
                    className="flex items-center gap-3 text-base sm:text-lg font-bold text-white hover:text-brand-red transition-colors"
                  >
                    <div className="w-9 h-9 rounded-xl bg-brand-red/15 flex items-center justify-center text-brand-red">
                      <Phone className="w-4 h-4" />
                    </div>
                    <span>+998 (99) 533-33-03</span>
                  </a>
                  <a 
                    href="tel:+998981411808" 
                    className="flex items-center gap-3 text-base font-semibold text-slate-200 hover:text-brand-red transition-colors"
                  >
                    <div className="w-9 h-9 rounded-xl bg-brand-red/15 flex items-center justify-center text-brand-red">
                      <Phone className="w-4 h-4" />
                    </div>
                    <span>+998 (98) 141-18-08</span>
                  </a>
                  <a 
                    href="tel:+998990473809" 
                    className="flex items-center gap-3 text-base font-semibold text-slate-200 hover:text-brand-red transition-colors"
                  >
                    <div className="w-9 h-9 rounded-xl bg-brand-red/15 flex items-center justify-center text-brand-red">
                      <Phone className="w-4 h-4" />
                    </div>
                    <span>+998 (99) 047-38-09</span>
                  </a>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10">
                <span className="block text-xs uppercase tracking-wider font-bold text-slate-400 mb-2">
                  {t.contact.addressTitle}
                </span>
                <div className="flex items-start gap-3 text-sm text-slate-300">
                  <MapPin className="w-5 h-5 text-brand-red flex-shrink-0 mt-0.5" />
                  <span>{t.contact.addressText}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10">
                <span className="block text-xs uppercase tracking-wider font-bold text-slate-400 mb-2">
                  {t.contact.workHoursTitle}
                </span>
                <div className="flex items-start gap-3 text-sm text-slate-300">
                  <Clock className="w-5 h-5 text-brand-red flex-shrink-0 mt-0.5" />
                  <span>{t.contact.workHoursText}</span>
                </div>
              </div>

              {/* Social Channels */}
              <div className="pt-4 border-t border-white/10">
                <span className="block text-xs uppercase tracking-wider font-bold text-slate-400 mb-3">
                  {t.contact.socialsTitle}
                </span>
                <div className="flex items-center gap-3">
                  <a
                    href="https://t.me/tunikabondLiderkanali"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-surface border border-white/15 text-slate-200 hover:text-brand-red hover:border-brand-red transition-all text-xs font-bold"
                  >
                    <span>Telegram Kanal</span>
                  </a>
                  <a
                    href="https://www.instagram.com/tunikabond_lider"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-surface border border-white/15 text-slate-200 hover:text-brand-red hover:border-brand-red transition-all text-xs font-bold"
                  >
                    <span>Instagram</span>
                  </a>
                </div>
              </div>

            </div>

            {/* Google Map Box */}
            <div className="rounded-3xl overflow-hidden border border-white/10 shadow-lg h-56 bg-brand-surface">
              <iframe
                title="Office Location"
                src="https://www.google.com/maps/embed?pb=!1m13!1m8!1m3!1d6002.201579445047!2d69.285698!3d41.219574!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zNDHCsDEzJzEwLjUiTiA2OcKwMTcnMDguNSJF!5e0!3m2!1sru!2s!4v1764096417694!5m2!1sru!2s"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

          </div>

          {/* Form Column (7 cols) */}
          <div className="lg:col-span-7">
            <div className="glass-panel p-6 sm:p-10 rounded-3xl border-brand-red/30 shadow-glow-red relative">
              
              {success ? (
                <div className="py-12 text-center animate-fadeIn">
                  <div className="w-16 h-16 rounded-full bg-brand-red/20 text-brand-red flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h3 className="font-display font-extrabold text-2xl text-white mb-2">
                    {t.contact.successTitle}
                  </h3>
                  <p className="text-slate-300 text-sm max-w-md mx-auto mb-8">
                    {t.contact.successDesc}
                  </p>
                  <button
                    onClick={() => setSuccess(false)}
                    className="px-6 py-2.5 rounded-xl bg-white/10 text-white font-bold text-xs hover:bg-white/20 transition-all"
                  >
                    Yana yangi ariza qoldirish
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  
                  <div className="flex items-center gap-2 text-xs font-bold text-brand-red uppercase tracking-wider mb-2">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Tezkor qayta aloqa (15 daqiqada)</span>
                  </div>

                  {/* Name field */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                      {t.contact.formName} *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={t.contact.formNamePlaceholder}
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3.5 rounded-xl bg-brand-dark/70 border border-white/15 text-white placeholder-slate-500 focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red transition-all text-sm"
                    />
                  </div>

                  {/* Phone field */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                      {t.contact.formPhone} *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+998 (90) 123-45-67"
                      value={formData.phone}
                      onChange={handlePhoneChange}
                      className="w-full px-4 py-3.5 rounded-xl bg-brand-dark/70 border border-white/15 text-white placeholder-slate-500 focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red transition-all text-sm font-semibold tracking-wide"
                    />
                  </div>

                  {/* Desired Service */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                      {t.contact.formService}
                    </label>
                    <select
                      value={formData.service}
                      onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                      className="w-full px-4 py-3.5 rounded-xl bg-brand-dark/70 border border-white/15 text-white focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red transition-all text-sm"
                    >
                      <option value="Tunikabond Fasad Paneli">Tunikabond Fasad Panellari</option>
                      <option value="Alyukabond Kompozit">Alyukabond Kompozit Panellari</option>
                      <option value="Zamonaviy Karnizlar">Zamonaviy Karnizlar</option>
                      <option value="Profnastil va Tom Yopish">Profnastil va Tom Yopish</option>
                      <option value="Bepul O'lchash va Smeta">Bepul Usta Chaqirish (O'lchash)</option>
                    </select>
                  </div>

                  {/* Message field */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                      {t.contact.formMessage}
                    </label>
                    <textarea
                      rows={4}
                      placeholder={t.contact.formMessagePlaceholder}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-4 py-3.5 rounded-xl bg-brand-dark/70 border border-white/15 text-white placeholder-slate-500 focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red transition-all text-sm resize-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-brand-redLight via-brand-red to-brand-redHover text-white font-extrabold text-base shadow-glow-red hover:shadow-glow-red-lg flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50"
                  >
                    {loading ? (
                      <span>{t.contact.submitting}</span>
                    ) : (
                      <>
                        <span>{t.contact.submitBtn}</span>
                        <Send className="w-5 h-5" />
                      </>
                    )}
                  </button>

                  <p className="text-[11px] text-slate-500 text-center">
                    Tugmani bosish orqali siz shaxsiy ma'lumotlaringizni qayta ishlashga rozilik bildirasiz.
                  </p>

                </form>
              )}

            </div>
          </div>

        </div>

      </div>

      {/* Massive Curved Cosmic Horizon Glow (Gcore video style frame 00:36-00:38) */}
      <div className="absolute -bottom-36 left-1/2 -translate-x-1/2 w-[1400px] h-[360px] pointer-events-none overflow-hidden z-0">
        <div 
          className="w-full h-full rounded-[100%] opacity-85"
          style={{
            background: 'radial-gradient(ellipse at 50% 100%, rgba(255, 255, 255, 0.9) 0%, rgba(245, 158, 11, 0.75) 25%, rgba(196, 0, 0, 0.6) 55%, transparent 75%)',
            filter: 'blur(30px)'
          }}
        />
      </div>
    </section>
  );
};
