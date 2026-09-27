import React, { useState } from 'react';
import { apiLogin, apiRegister } from '../../services/api';
import { X, Lock, User, UserPlus, LogIn, ShieldAlert, CheckCircle2 } from 'lucide-react';

export const AdminAuthModal = ({ isOpen, onClose, onLoginSuccess }) => {
  if (!isOpen) return null;

  const [isRegisterTab, setIsRegisterTab] = useState(false);
  const [username, setUsername] = useState('Muhammadazez');
  const [password, setPassword] = useState('admin123');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    if (isRegisterTab) {
      const res = await apiRegister(username, password, fullName);
      setLoading(false);
      if (res.success) {
        setSuccessMsg("Yangi admin muvaffaqiyatli ro'yxatdan o'tdi! Endi kirishingiz mumkin.");
        setIsRegisterTab(false);
      } else {
        setError(res.error || "Ro'yxatdan o'tishda xatolik");
      }
    } else {
      const res = await apiLogin(username, password);
      setLoading(false);
      if (res.success) {
        onLoginSuccess(res.user);
        onClose();
      } else {
        setError(res.error || "Login yoki parol noto'g'ri");
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-brand-dark/90 backdrop-blur-md animate-fadeIn">
      <div className="glass-panel w-full max-w-md rounded-3xl p-6 sm:p-8 border border-brand-red/30 shadow-glow-red relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-300 hover:text-brand-red dark:hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-brand-red/20 text-brand-red flex items-center justify-center mx-auto mb-3 shadow-glow-red">
            <Lock className="w-7 h-7" />
          </div>
          <h3 className="font-display font-black text-2xl text-slate-900 dark:text-white">
            Tunikabond Lider CMS
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Boshqaruv paneli va admin tizimi
          </p>
        </div>

        {/* Tabs: Login / Register */}
        <div className="flex bg-slate-100 dark:bg-brand-dark rounded-xl p-1 border border-slate-200 dark:border-white/10 mb-6">
          <button
            type="button"
            onClick={() => { setIsRegisterTab(false); setError(''); }}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              !isRegisterTab 
                ? 'bg-brand-red text-white shadow-sm' 
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Tizimga kirish</span>
          </button>
          <button
            type="button"
            onClick={() => { setIsRegisterTab(true); setError(''); }}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              isRegisterTab 
                ? 'bg-brand-red text-white shadow-sm' 
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Yangi admin</span>
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-600 dark:text-red-300 text-xs font-medium mb-4 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-medium mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {isRegisterTab && (
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Ism va familiya *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="Masalan: Muhammad Aziz"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-brand-dark/80 border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-brand-red text-sm"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Login (Username) *
            </label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="Muhammadazez yoki admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-brand-dark/80 border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-brand-red text-sm font-semibold"
              />
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Parol *
            </label>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-brand-dark/80 border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-brand-red text-sm"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          {/* Quick helper tip */}
          {!isRegisterTab && (
            <div className="p-3 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-[11px] text-slate-600 dark:text-slate-400">
              <span className="font-bold text-brand-red">Standart Super Admin:</span> Login: <code className="text-slate-900 dark:text-white font-mono">Muhammadazez</code> | Parol: <code className="text-slate-900 dark:text-white font-mono">admin123</code>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-brand-red via-brand-red to-brand-redHover text-white font-extrabold text-sm shadow-glow-red hover:shadow-glow-red-lg flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 mt-4"
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
  );
};
