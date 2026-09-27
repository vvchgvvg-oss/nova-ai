import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Lock, User, Shield, ArrowLeft, Key, Sparkles, AlertCircle, HelpCircle, 
  Send, Eye, EyeOff, CheckCircle 
} from 'lucide-react';
import { UserSession } from '../types';

interface LoginGateProps {
  onLoginSuccess: (session: UserSession) => void;
}

export default function LoginGate({ onLoginSuccess }: LoginGateProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [guestName, setGuestName] = useState('');
  
  const [isActiveTab, setIsActiveTab] = useState<'admin' | 'guest'>('admin');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('يرجى ملء جميع الحقول المطلوبة.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          password: password.trim(),
          isGuest: false
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'فشل تسجيل الدخول للآدمن.');
      }

      setSuccessMsg('تم تسجيل الدخول بنجاح! جاري تحويلك بصفتك المدير العام...');
      
      // Keep it sweet: small artificial delay for animation
      setTimeout(() => {
        onLoginSuccess(data.user);
      }, 1500);

    } catch (err: any) {
      setError(err?.message || 'اسم المستخدم أو كلمة المرور غير صحيحة.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalGuestName = guestName.trim() || 'زائر البوابة';
    
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isGuest: true,
          guestName: finalGuestName
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'فشل الدخول كزائر.');
      }

      setSuccessMsg(`أهلاً بك يا ${finalGuestName}! جاري الدخول للبوابة...`);
      
      setTimeout(() => {
        onLoginSuccess(data.user);
      }, 1200);

    } catch (err: any) {
      setError(err?.message || 'فشل الدخول كزائر.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#06040a] text-slate-100 flex flex-col justify-center items-center p-4 relative overflow-hidden selection:bg-violet-600 selection:text-white">
      
      {/* Background Ornaments */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-violet-950/15 via-[#0c0914]/5 to-transparent pointer-events-none -z-10" />
      <div className="absolute top-[20%] right-[10%] w-[300px] h-[300px] bg-violet-600/10 rounded-full blur-[100px] pointer-events-none -z-10 animate-pulse" />
      <div className="absolute bottom-[20%] left-[10%] w-[300px] h-[300px] bg-fuchsia-600/10 rounded-full blur-[100px] pointer-events-none -z-10 animate-pulse" />

      {/* Brand logo container */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8 text-center flex flex-col items-center"
      >
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-violet-600 to-fuchsia-600 p-[2px] shadow-[0_0_30px_rgba(139,92,246,0.25)] mb-4">
          <div className="w-full h-full bg-[#06040a] rounded-2xl flex items-center justify-center font-mono font-black text-sm text-violet-400">
            Mohtal
          </div>
        </div>
        <h1 className="text-3xl font-black text-white tracking-widest flex flex-col items-center gap-1.5">
          <div className="flex items-center gap-2">
            <span>nova ai</span>
            <span className="text-xs bg-violet-600/35 text-violet-200 font-bold px-2 py-0.5 rounded-full border border-violet-500/40">بوابة الدخول</span>
          </div>
          <div className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-amber-400 text-xs font-black tracking-wider uppercase">
            Powered by te3m scam 🛸
          </div>
        </h1>
        <p className="text-sm text-slate-400 mt-2 font-medium">الرجاء إثبات الهوية أو المتابعة كزائر لتفادي تداخل العمليات</p>
      </motion.div>

      {/* Main Glassmorphic Panel Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="w-full max-w-md bg-[#090611]/80 backdrop-blur-2xl border border-violet-500/15 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-violet-500 via-fuchsia-500 to-violet-500" />
        
        {/* Navigation Tabs between Admin vs Visitor */}
        <div className="grid grid-cols-2 gap-2 bg-slate-950/80 p-1.5 border border-violet-500/10 rounded-2xl mb-6">
          <button
            onClick={() => { setIsActiveTab('admin'); setError(''); }}
            className={`flex items-center justify-center gap-2 py-2.5 text-xs font-black rounded-xl transition-all ${
              isActiveTab === 'admin'
                ? 'bg-gradient-to-r from-violet-600/90 to-fuchsia-600/90 text-white shadow-lg shadow-violet-600/10'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>تسجيل دخول الإدارة</span>
          </button>
          
          <button
            onClick={() => { setIsActiveTab('guest'); setError(''); }}
            className={`flex items-center justify-center gap-2 py-2.5 text-xs font-black rounded-xl transition-all ${
              isActiveTab === 'guest'
                ? 'bg-gradient-to-r from-violet-600/90 to-fuchsia-600/90 text-white shadow-lg shadow-violet-600/10'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-4 h-4" />
            <span>الدخول كزائر</span>
          </button>
        </div>

        {/* Display System Feedback Messages */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-xl p-3.5 text-xs font-semibold flex items-start gap-2 text-right"
              dir="rtl"
            >
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <span>{error}</span>
            </motion.div>
          )}

          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 rounded-xl p-3.5 text-xs font-semibold flex items-start gap-2 text-right animate-pulse"
              dir="rtl"
            >
              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
              <span>{successMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form Body switcher */}
        <AnimatePresence mode="wait">
          {isActiveTab === 'admin' ? (
            <motion.form
              key="admin-form"
              onSubmit={handleAdminLogin}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-4"
              dir="rtl"
            >
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 block">اسم مستخدم المدير الأمني</label>
                <div className="relative">
                  <span className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-violet-400">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="أدخل معرف الأدمن الخاص بك..."
                    className="w-full bg-[#050308]/90 border border-violet-500/15 focus:border-violet-500 text-xs font-bold rounded-xl pr-10 pl-4 py-3 text-slate-100 outline-none transition-all placeholder:text-slate-600 text-right"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 block">كلمة المرور المشفرة</label>
                <div className="relative">
                  <span className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-violet-400">
                    <Key className="w-4 h-4" />
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="أدخل رمز المرور السري..."
                    className="w-full bg-[#050308]/90 border border-violet-500/15 focus:border-violet-500 text-xs font-mono rounded-xl pr-10 pl-11 py-3 text-slate-100 outline-none transition-all placeholder:text-slate-600 text-right"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-black text-xs py-3.5 rounded-xl transition-all shadow-lg shadow-violet-600/15 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>{loading ? 'جاري التحقق...' : 'تسجيل دخول الإدارة الفيدرالية'}</span>
                {!loading && <ArrowLeft className="w-4 h-4 text-white" />}
              </button>

              <div className="text-[10px] text-slate-500 text-center flex items-center justify-center gap-1.5 mt-2 font-medium">
                <Lock className="w-3 h-3 text-violet-500/60" />
                <span>حماية ثنائية مطبقة لتأمين الجلسة التبادلية</span>
              </div>
            </motion.form>
          ) : (
            <motion.form
              key="guest-form"
              onSubmit={handleGuestLogin}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-4"
              dir="rtl"
            >
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 block">لقب الزائر الفخري (اختياري)</label>
                <div className="relative">
                  <span className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-violet-400">
                    <Sparkles className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="اكتوب اسمك أو اتركها فارغة..."
                    className="w-full bg-[#050308]/90 border border-violet-500/15 focus:border-violet-500 text-xs font-bold rounded-xl pr-10 pl-4 py-3 text-slate-100 outline-none transition-all placeholder:text-slate-600 text-right"
                  />
                </div>
              </div>

              <div className="bg-violet-600/5 border border-violet-500/10 rounded-xl p-3.5 text-[11px] text-slate-400 leading-relaxed text-right">
                <span className="font-extrabold text-violet-400 block mb-1">الولوج السريع الفوري</span>
                كصديق أو زائر للبوابة، لا تحتاج إلى تشفير كلمة مرور للبدء وتستطيع استكشاف جميع خدمات الشات، الصوتيات، التحميل، وقراءة القرآن بدون قيد.
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-900 border border-slate-700/80 hover:bg-slate-800 text-white font-black text-xs py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>{loading ? 'جاري التحضير...' : 'دخول سريع للبوابة العاصفة'}</span>
                {!loading && <ArrowLeft className="w-4 h-4 text-violet-400" />}
              </button>
            </motion.form>
          )}
        </AnimatePresence>

      </motion.div>

      {/* Security Credits Footer */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="mt-8 text-center"
      >
        <p className="text-[11px] text-slate-600 font-mono">
          nova ai Protection Layer v1.42 • SECURE AES CLIENT GATEWAY
        </p>
        <div className="flex gap-4 justify-center items-center mt-2.5 text-xs text-slate-500" dir="rtl">
          <a href="https://t.me/MS_mohtal" target="_blank" rel="noopener noreferrer" className="hover:text-violet-400 transition-colors flex items-center gap-1 font-bold">
            <Send className="w-3 h-3 text-sky-400" />
            <span>قناة التليجرام الرسمية</span>
          </a>
          <span className="text-slate-800">•</span>
          <span className="flex items-center gap-1">
            <Shield className="w-3.5 h-3.5 text-emerald-500" />
            <span>شفرات مشددة</span>
          </span>
        </div>
      </motion.div>

    </div>
  );
}
