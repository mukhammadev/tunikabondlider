import React, { useState, useEffect } from 'react';
import { getStoredUser, clearAuthSession, apiLogin, apiGetStats } from '../../services/api';
import { AdminDashboard } from './AdminDashboard';
import { 
  Lock, User, LogIn, ShieldAlert, Sparkles, Smartphone, Download, 
  CheckCircle2, ArrowRight, Shield, Layers, HelpCircle, X
} from 'lucide-react';

export const AdminApp = () => {
  const [currentUser, setCurrentUser] = useState(() => getStoredUser());
  const [username, setUsername] = useState('Muhammadazez');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // PWA Install Prompt State
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);

  useEffect(() => {
    // Check if running as standalone PWA
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
      setIsInstalled(true);
    }

    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      // Check if iOS
      const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
      if (isIos) {
        setShowIosGuide(true);
      } else {
        alert("Ilovani o'rnatish uchun brauzer menyusidan (3 nuqta) 'Ilovani o'rnatish' yoki 'Bosh ekranga qo'shish' tugmasini bosing.");
      }
    }
  };

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const cleanUser = (username || '').trim();
      const cleanPass = (password || '').trim();
      const res = await apiLogin(cleanUser, cleanPass);
      setLoading(false);
      if (res.success) {
        setCurrentUser(res.user);
      } else {
        setError(res.error || "Login yoki parol noto'g'ri");
      }
    } catch (err) {
      setLoading(false);
      setError("Server bilan bog'lanishda xatolik");
    }
  };

  const handleLogout = () => {
    clearAuthSession();
    setCurrentUser(null);
  };

  // If user is already authenticated -> Render the Full Responsive Admin Dashboard
  if (currentUser) {
    return (
      <div className="min-h-screen bg-brand-dark text-slate-100 flex flex-col font-sans">
        {/* PWA Install Notification Bar if not yet installed */}
        {!isInstalled && deferredPrompt && (
          <div className="bg-gradient-to-r from-brand-red to-brand-redHover px-4 py-2 text-white text-xs font-bold flex items-center justify-between shadow-md shrink-0 animate-fadeIn">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4" />
              <span>Ilovani telefoningiz bosh ekraniga o'rnating!</span>
            </div>
            <button
              onClick={handleInstallClick}
              className="px-3 py-1 bg-white text-brand-red rounded-lg font-black text-xs hover:bg-slate-100 shadow-sm transition-all"
            >
              O'rnatish
            </button>
          </div>
        )}

        <AdminDashboard
          currentUser={currentUser}
          onLogout={handleLogout}
          onClose={() => {
            if (window.confirm("Sayt bosh sahifasiga qaytmoqchimisiz?")) {
              window.location.href = '/';
            }
          }}
          isStandaloneApp={true}
        />
      </div>
    );
  }

  // --- MOBILE-FIRST LOGIN VIEW ---
  return (
    <div className="min-h-screen bg-brand-dark flex flex-col justify-between p-4 sm:p-6 text-slate-100 selection:bg-brand-red selection:text-white">
      
      {/* Top App Status Bar */}
      <div className="flex items-center justify-between py-2 px-1 text-xs text-slate-400">
        <div className="flex items-center gap-2 font-mono font-bold text-brand-red">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>TL Admin App v2.0</span>
        </div>

        {/* Install Button on Login Screen */}
        {!isInstalled && (
          <button
            onClick={handleInstallClick}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-white border border-white/10 transition-all"
          >
            <Download className="w-3.5 h-3.5 text-brand-red" />
            <span>Ilovani o'rnatish</span>
          </button>
        )}
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-md mx-auto my-auto py-6">
        <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-brand-red/30 shadow-2xl relative overflow-hidden">
          
          {/* Ambient Glow */}
          <div className="absolute -top-20 -right-20 w-44 h-44 bg-brand-red/20 rounded-full blur-3xl pointer-events-none"></div>

          {/* App Branding */}
          <div className="text-center mb-8 relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-red to-brand-redHover flex items-center justify-center mx-auto mb-4 shadow-glow-red text-white font-black text-2xl">
              TL
            </div>
            <h1 className="font-display font-black text-2xl text-white tracking-tight">
              Tunikabond Lider
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Boshqaruv Mobil Ilovasi (CMS)
            </p>
          </div>

          {/* Error alert */}
          {error && (
            <div className="p-3.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs font-semibold mb-4 flex items-center gap-2 animate-shake">
              <ShieldAlert className="w-4 h-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Admin Logini
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck="false"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Loginni kiriting"
                  className="w-full px-4 py-3 pl-11 rounded-xl bg-brand-dark/80 border border-white/15 text-white text-sm focus:outline-none focus:border-brand-red transition-colors"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Maxfiy Parol
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Parolni kiriting"
                  className="w-full px-4 py-3 pl-11 rounded-xl bg-brand-dark/80 border border-white/15 text-white text-sm focus:outline-none focus:border-brand-red transition-colors"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Quick Profile Selector Buttons */}
            <div className="pt-1">
              <span className="text-[11px] text-slate-400 font-medium block mb-2">
                Tezkor tanlash:
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => { setUsername('Muhammadazez'); setPassword('admin123'); }}
                  className={`p-2 rounded-xl border text-xs font-bold text-left transition-all ${
                    username === 'Muhammadazez'
                      ? 'border-brand-red bg-brand-red/15 text-white shadow-sm'
                      : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  <span className="block truncate font-bold">Muhammad Aziz</span>
                  <span className="text-[10px] text-brand-red">Super Admin</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setUsername('admin'); setPassword('admin123'); }}
                  className={`p-2 rounded-xl border text-xs font-bold text-left transition-all ${
                    username === 'admin'
                      ? 'border-brand-red bg-brand-red/15 text-white shadow-sm'
                      : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  <span className="block truncate font-bold">Bosh Admin</span>
                  <span className="text-[10px] text-slate-400">Admin paneli</span>
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-brand-red via-brand-red to-brand-redHover hover:scale-[1.02] active:scale-[0.98] text-white font-bold text-sm shadow-glow-red flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Ilovaga Kirish</span>
                </>
              )}
            </button>
          </form>

        </div>
      </div>

      {/* iOS Install Guide Modal */}
      {showIosGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="glass-panel w-full max-w-sm rounded-3xl p-6 border border-brand-red/30 shadow-2xl relative text-center">
            <button
              onClick={() => setShowIosGuide(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-slate-300 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
            <Smartphone className="w-12 h-12 text-brand-red mx-auto mb-3" />
            <h3 className="font-display font-bold text-lg text-white mb-2">
              iPhone'ga o'rnatish
            </h3>
            <p className="text-xs text-slate-300 space-y-2 text-left bg-white/5 p-4 rounded-2xl mb-4 border border-white/10 leading-relaxed">
              1. Safari brauzerining pastidagi <strong>Ulashish (Share)</strong> tugmasini bosing.<br/>
              2. Chiqqan ro'yxatdan <strong>"Bosh ekranga qo'shish" (Add to Home Screen)</strong> bandini tanlang.<br/>
              3. <strong>"Qo'shish" (Add)</strong> tugmasini bosing. Ilova telefoningiz ekranida paydo bo'ladi!
            </p>
            <button
              onClick={() => setShowIosGuide(false)}
              className="w-full py-2.5 rounded-xl bg-brand-red text-white text-xs font-bold"
            >
              Tushundim
            </button>
          </div>
        </div>
      )}

      {/* Bottom Footer Information */}
      <div className="text-center py-2 text-[11px] text-slate-400">
        <span>© 2026 Tunikabond Lider. Faqat korxona xodimlari uchun.</span>
      </div>

    </div>
  );
};
