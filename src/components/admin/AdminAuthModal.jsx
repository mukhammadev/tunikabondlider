import React, { useState } from 'react';
import { apiLogin, apiRegister, apiHasAdmins } from '../../services/api';
import { 
  X, Lock, User, UserPlus, LogIn, ShieldAlert, CheckCircle2, 
  ArrowLeft, Eye, EyeOff, ShieldCheck, Sparkles 
} from 'lucide-react';

export const AdminAuthModal = ({ isOpen, onClose, onLoginSuccess }) => {
  if (!isOpen) return null;

  const [hasAdmins, setHasAdmins] = useState(() => apiHasAdmins());
  const [isRegisterTab, setIsRegisterTab] = useState(() => !apiHasAdmins());
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    const cleanUser = (username || '').trim();
    const cleanPass = (password || '').trim();

    if (isRegisterTab) {
      const res = await apiRegister(cleanUser, cleanPass, fullName.trim(), hasAdmins ? 'Admin' : 'Super Admin');
      setLoading(false);
      if (res.success) {
        setHasAdmins(true);
        const loginRes = await apiLogin(cleanUser, cleanPass);
        if (loginRes.success) {
          onLoginSuccess(loginRes.user);
        } else {
          setSuccessMsg("Yangi admin muvaffaqiyatli ro'yxatdan o'tdi! Endi tizimga kirishingiz mumkin.");
          setIsRegisterTab(false);
        }
      } else {
        setError(res.error || "Ro'yxatdan o'tishda xatolik yuz berdi");
      }
    } else {
      const res = await apiLogin(cleanUser, cleanPass);
      setLoading(false);
      if (res.success) {
        onLoginSuccess(res.user);
      } else {
        setError(res.error || "Login yoki parol noto'g'ri");
      }
    }
  };

  return (
    <div className="dark fixed inset-0 z-50 flex flex-col justify-between p-4 sm:p-6 bg-brand-dark text-slate-100 animate-fadeIn overflow-y-auto selection:bg-brand-red selection:text-white">
      
      {/* Top Header Navigation */}
      <div className="w-full max-w-4xl mx-auto flex items-center justify-between py-2 shrink-0">
        <div className="flex items-center gap-2 font-mono text-xs font-bold text-slate-400">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-glow"></span>
          <span className="text-white">TL Admin Portal</span>
          <span className="text-[10px] bg-brand-red/20 text-brand-red border border-brand-red/30 px-2 py-0.5 rounded-full uppercase tracking-wider">v2.0</span>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white text-xs font-bold transition-all border border-white/10 cursor-pointer group"
          title="Asosiy veb-saytga qaytish"
        >
          <ArrowLeft className="w-4 h-4 text-brand-red group-hover:-translate-x-0.5 transition-transform" />
          <span>Saytga qaytish</span>
        </button>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-md mx-auto my-auto py-4">
        <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-brand-red/30 shadow-2xl relative overflow-hidden bg-brand-surface/90">
          
          {/* Ambient Glow */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-brand-red/25 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-brand-red/15 rounded-full blur-3xl pointer-events-none"></div>

          {/* App Branding */}
          <div className="text-center mb-6 relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-red to-brand-redHover flex items-center justify-center mx-auto mb-3 shadow-glow-red text-white font-black text-2xl">
              TL
            </div>
            <h1 className="font-display font-black text-2xl text-white tracking-tight">
              Tunikabond Lider
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Boshqaruv Paneli & CMS Tizimi
            </p>
          </div>

          {/* Tabs: Login / Register */}
          <div className="flex bg-brand-dark/80 rounded-xl p-1 border border-white/10 mb-6 relative z-10">
            <button
              type="button"
              onClick={() => { setIsRegisterTab(false); setError(''); }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                !isRegisterTab 
                  ? 'bg-brand-red text-white shadow-sm' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Tizimga kirish</span>
            </button>
            <button
              type="button"
              onClick={() => { setIsRegisterTab(true); setError(''); }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                isRegisterTab 
                  ? 'bg-brand-red text-white shadow-sm' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Yangi admin</span>
            </button>
          </div>

          {/* Alerts */}
          {error && (
            <div className="p-3.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs font-medium mb-4 flex items-center gap-2.5 animate-fadeIn">
              <ShieldAlert className="w-4 h-4 flex-shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-medium mb-4 flex items-center gap-2.5 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
            
            {isRegisterTab && (
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Ism va familiya *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="Masalan: Azizbek Rahimov"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-brand-dark/90 border border-white/15 text-white placeholder-slate-500 focus:outline-none focus:border-brand-red text-sm"
                  />
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Login (Username) *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck="false"
                  placeholder="admin yoki login"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-brand-dark/90 border border-white/15 text-white placeholder-slate-500 focus:outline-none focus:border-brand-red text-sm font-semibold"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Parol *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-11 py-3 rounded-xl bg-brand-dark/90 border border-white/15 text-white placeholder-slate-500 focus:outline-none focus:border-brand-red text-sm"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  title={showPassword ? "Parolni yashirish" : "Parolni ko'rsatish"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Quick security notice */}
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-[11px] text-slate-400 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-brand-red shrink-0" />
              <span>Faqat korxona xodimlari va administratorlar uchun mo'ljallangan.</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-brand-red via-brand-red to-brand-redHover text-white font-extrabold text-sm shadow-glow-red hover:shadow-glow-red-lg flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 mt-4 cursor-pointer"
            >
              {loading ? (
                <span>Tekshirilmoqda...</span>
              ) : isRegisterTab ? (
                <>
                  <span>Admin sifatida ro'yxatdan o'tish</span>
                  <UserPlus className="w-4 h-4" />
                </>
              ) : (
                <>
                  <span>Boshqaruv paneliga kirish</span>
                  <LogIn className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

        </div>
      </div>

      {/* Bottom Footer Information */}
      <div className="w-full max-w-4xl mx-auto text-center py-2 text-[11px] text-slate-500 shrink-0">
        <span>© 2026 Tunikabond Lider. Barcha huquqlar himoyalangan.</span>
      </div>

    </div>
  );
};
