import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Terminal, Bot, Film, BookOpen, User, Send, ExternalLink, Clock, Calendar, 
  Sparkles, Music, Youtube, Globe, Heart, Shield, HelpCircle, ArrowLeft, ArrowRight,
  LogOut, Crown, CheckCircle
} from 'lucide-react';

// Sub components
import AIPanel from './components/AIPanel';
import MediaPanel from './components/MediaPanel';
import QuranPanel from './components/QuranPanel';
import DeveloperPanel from './components/DeveloperPanel';
import LoginGate from './components/LoginGate';
import { UserSession } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'ai' | 'media' | 'quran' | 'dev'>('home');
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  
  // Load session from local storage immediately on mount
  const [session, setSession] = useState<UserSession | null>(() => {
    const saved = localStorage.getItem('mohtal_session');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  // Update time widget
  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setCurrentDate(now.toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
    };
    updateDateTime();
    const timer = setInterval(updateDateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLoginSuccess = (newSession: UserSession) => {
    setSession(newSession);
    localStorage.setItem('mohtal_session', JSON.stringify(newSession));
  };

  const handleLogout = () => {
    setSession(null);
    localStorage.removeItem('mohtal_session');
  };

  // Guard the entire interface under the Login / Admin Gate
  if (!session) {
    return <LoginGate onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-[#06040a] text-slate-100 flex flex-col relative overflow-hidden selection:bg-violet-600 selection:text-white">
      
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-violet-950/15 via-[#0c0914]/5 to-transparent pointer-events-none -z-10" />
      <div className="absolute top-[10%] left-[5%] w-[350px] h-[350px] bg-violet-600/5 rounded-full blur-[120px] pointer-events-none -z-10 animate-pulse" />
      <div className="absolute bottom-[15%] right-[2%] w-[400px] h-[400px] bg-fuchsia-600/5 rounded-full blur-[140px] pointer-events-none -z-10" />

      {/* Main Layout Header */}
      <header className="sticky top-0 bg-[#06040a]/80 backdrop-blur-xl border-b border-violet-500/10 z-50">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          
          {/* Logo Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 to-fuchsia-600 p-[1.5px] shadow-[0_0_15px_rgba(139,92,246,0.15)]">
              <div className="w-full h-full bg-[#06040a] rounded-xl flex items-center justify-center font-mono font-black text-xs text-violet-400">
                Mohtal
              </div>
            </div>
            
            <div className="text-right">
              <h1 className="text-lg font-black tracking-wider text-slate-100 flex items-center gap-1.5 flex-wrap justify-end leading-none">
                <span>Nova ai</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-rose-400 text-xs font-black">x te3m scam 🛸</span>
                <span className="text-[10px] bg-violet-600/20 text-violet-300 font-bold px-2 py-0.5 rounded-full border border-violet-500/30">الإصدار الذكي {new Date().getFullYear()}</span>
              </h1>
              <span className="text-[11px] text-slate-400 block font-medium mt-1">بوابة الأدوات الذكية، الشات، القرآن والتحميل</span>
            </div>
          </div>

          {/* Navigation Controls */}
          <nav className="flex items-center gap-1 bg-[#0b0816] p-1.5 border border-violet-500/10 rounded-xl overflow-x-auto whitespace-nowrap scrollbar-none max-w-full justify-start md:justify-center">
            {[
              { id: 'home', label: 'الرئيسية', icon: Globe },
              { id: 'ai', label: 'الدردشة والصور', icon: Bot },
              { id: 'media', label: 'تحميل وسينما', icon: Film },
              { id: 'quran', label: 'المصحف الشريف', icon: BookOpen },
              { id: 'dev', label: 'قاعة المطور', icon: User }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 text-[11px] sm:text-xs font-black rounded-lg sm:rounded-xl transition-all cursor-pointer shrink-0 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Header Quick Support Link & Secured Auth Session Controls */}
          <div className="flex items-center flex-wrap gap-2.5">
            
            {/* Session Indicator Pill */}
            <div className={`text-xs px-3 py-1.5 rounded-xl flex items-center gap-1.5 border ${
              session.role === 'admin' 
                ? 'bg-amber-500/10 border-amber-500/25 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.05)]' 
                : 'bg-[#0b0816] border-violet-500/10 text-slate-300'
            }`}>
              {session.role === 'admin' ? (
                <>
                  <Crown className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
                  <span className="font-black">أهلاً يا مديرنا: {session.displayName}</span>
                </>
              ) : (
                <>
                  <User className="w-3.5 h-3.5 text-violet-400" />
                  <span className="font-bold">مرحباً الزائر: {session.displayName}</span>
                </>
              )}
            </div>

            {/* Logout Action Button */}
            <button
              onClick={handleLogout}
              className="text-xs font-bold text-rose-400 hover:text-white transition-colors bg-rose-500/10 border border-rose-500/15 hover:bg-rose-600 px-3 py-1.5 rounded-xl flex items-center gap-1.5 cursor-pointer"
              title="تسجيل الخروج الآمن"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">خروج</span>
            </button>

            {/* Support link */}
            <a
              href="https://t.me/MS_mohtal"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold text-violet-400 hover:text-violet-300 transition-colors bg-violet-500/10 border border-violet-500/20 px-3 py-1.5 rounded-xl flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden md:inline">قناة التليجرام</span>
            </a>
          </div>

        </div>
      </header>

      {/* Main Body Content Space */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 z-10">
        
        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="space-y-8 text-right"
            >
              
              {/* Hero Banner Grid Section */}
              <div className="bg-gradient-to-l from-violet-950/30 via-[#0c0914]/5 to-slate-900/40 border border-violet-500/15 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 left-0 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
                
                <div className="space-y-4 flex-1 text-center md:text-right">
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
                    <span className="p-1 px-3 bg-fuchsia-500/15 text-fuchsia-300 text-xs font-black rounded-lg border border-fuchsia-500/25">منصة متكاملة</span>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1 font-bold">
                      <Shield className="w-3.5 h-3.5 text-emerald-400" />
                      روابط وسائط آمنة 100%
                    </span>
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                    مرحباً بك في بوابة <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">Nova ai & te3m scam 🛸</span> للخدمات الإلكترونية الذكية
                  </h1>
                  
                  <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
                    استكشف مجموعة مجانية لا محدودة من أدوات الشات مع أحدث نماذج الذكاء الاصطناعي (DeepSeek v3.2 & Gemini)، محمل صوتيات يوتيوب MP3، محمل الأفلام وجوداتها، القرآن الكريم والعديد من خوادم VPS للتطبيقات بلمسة واحدة.
                  </p>

                  <div className="flex flex-wrap justify-center md:justify-start gap-3 pt-3">
                    <button
                      onClick={() => setActiveTab('ai')}
                      className="bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs rounded-xl px-5.5 py-3.5 shadow-lg shadow-violet-600/20 transition-all hover:scale-[1.02] cursor-pointer"
                    >
                      ابدء تجربة الذكاء الاصطناعي
                    </button>
                    <button
                      onClick={() => setActiveTab('quran')}
                      className="bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-xs rounded-xl px-5.5 py-3.5 transition-colors cursor-pointer"
                    >
                      تصفح مجمع المصحف
                    </button>
                  </div>
                </div>

                {/* Clock & Interactive Date Widget */}
                <div className="w-full md:w-auto shrink-0 z-10">
                  <div className="bg-[#050308]/90 border border-violet-500/25 rounded-2xl p-5 w-full md:w-80 min-h-[160px] flex flex-col justify-between shadow-xl relative overflow-hidden text-center">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-fuchsia-500/5 rounded-full blur-2xl pointer-events-none" />
                    
                    <div className="flex justify-between items-center text-[10px] text-violet-400 border-b border-violet-500/10 pb-2 mb-2 font-mono" dir="ltr">
                      <span>Developer: @V2X_2</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        UTC REGION
                      </span>
                    </div>

                    <div className="space-y-1.5 py-2">
                      <span className="text-3xl font-black font-mono tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-300">
                        {currentTime || "00:00:00"}
                      </span>
                      <p className="text-xs text-slate-300 font-bold mt-1">
                        {currentDate || "غاري جلب التاريخ..."}
                      </p>
                    </div>

                    <div className="text-[10px] text-slate-500 pt-1 flex items-center justify-between border-t border-slate-900" dir="ltr">
                      <span>MS_mohtal Portal</span>
                      <span>ACTIVE GATEWAY</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Grid 4 Columns Quick access cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  {
                    title: "شات ومكالمات الذكاء الاصطناعي",
                    desc: "دردش مع DeepSeek-V3.2 و Gemini 2.0 Flash Lite مجاناً بالكامل مع توليد صور ممتازة.",
                    tab: "ai",
                    color: "border-violet-500/20",
                    glow: "from-violet-500/5",
                    icon: Bot
                  },
                  {
                    title: "محمل يوتيوب وسينما مجاني",
                    desc: "ابحث عن الأغاني وجلب روابط MP3 وصور الغلاف الفونولوجية وجلب جودات الأفلام فوراً.",
                    tab: "media",
                    color: "border-red-500/20",
                    glow: "from-red-500/5",
                    icon: Youtube
                  },
                  {
                    title: "مجمع المصحف تشغيل وبث",
                    desc: "فهرس تفاعلي لـ 114 سورة و 20 من مشاهير القراء العرب ببث صوتيات عشوائية ومباشرة.",
                    tab: "quran",
                    color: "border-emerald-500/20",
                    glow: "from-emerald-500/5",
                    icon: BookOpen
                  },
                  {
                    title: "صالة المطور والبوتات العاملة",
                    desc: "تواصل مباشر مع @V2X_2 وزيارة قنوات وشروحات وتثبيت VPS للاستضافة الحرة.",
                    tab: "dev",
                    color: "border-sky-500/20",
                    glow: "from-sky-500/5",
                    icon: User
                  }
                ].map((card, idx) => {
                  const Icon = card.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => setActiveTab(card.tab as any)}
                      className={`text-right bg-[#090610]/40 backdrop-blur-md border ${card.color} p-5 rounded-2xl flex flex-col justify-between hover:bg-[#090610]/70 hover:shadow-[0_0_15px_rgba(139,92,246,0.05)] transition-all group cursor-pointer h-52`}
                    >
                      <div className="space-y-3.5">
                        <div className={`p-2 w-10 h-10 rounded-xl bg-gradient-to-b ${card.glow} to-transparent border border-slate-800/80 flex items-center justify-center shrink-0`}>
                          <Icon className="w-5 h-5 text-violet-400 group-hover:scale-110 transition-transform" />
                        </div>
                        <div>
                          <h3 className="font-extrabold text-sm text-slate-200 group-hover:text-white transition-colors">{card.title}</h3>
                          <p className="text-xs text-slate-400 mt-1 lines-clamp-3 leading-relaxed font-normal">{card.desc}</p>
                        </div>
                      </div>

                      <div className="text-xs text-violet-400 font-bold flex items-center gap-1 group-hover:underline">
                        <span>انقر للدخول</span>
                        <ArrowLeft className="w-3.5 h-3.5 shrink-0 rotate-180" />
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Informative Platform Quick FAQ / Details */}
              <div className="bg-[#090610]/40 border border-slate-800 rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <span className="p-1 px-2.5 bg-violet-600/15 border border-violet-500/20 text-xs font-black rounded-lg text-violet-400 font-mono">Platform FAQ</span>
                  <h3 className="text-sm font-bold text-slate-100">تفاصيل عامة عن تشغيل الموقع واستخدامه</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-400 leading-relaxed">
                  <div className="bg-slate-950/40 border border-slate-900 p-4 rounded-xl space-y-1.5">
                    <span className="font-bold text-slate-200 flex items-center gap-1">
                      <Sparkles className="w-4 h-4 text-violet-400" />
                      هل واجهات الذكاء الاصطناعي مجانية بالكامل؟
                    </span>
                    <p>
                      نعم وبكل فخر، تواصل مباشر مع DeepSeek و Gemini بالتخاطب والذاكرة وبدون حد أقصى للرسائل بفضل ترتيب القنوات الآلية ومجهودات فريق MS Mohtal.
                    </p>
                  </div>

                  <div className="bg-slate-950/40 border border-slate-900 p-4 rounded-xl space-y-1.5">
                    <span className="font-bold text-slate-200 flex items-center gap-1">
                      <Music className="w-4 h-4 text-rose-400" />
                      كيف أتحصل على روابط الأفلام بالدقة المناسبة؟
                    </span>
                    <p>
                      ابحث فقط بوضع اسم الفيلم في صفحة "التحميل"، ستجلب لك الخوادم الدقات المتاحة، انقر على أي دقة وسيقوم السيرفر بجلب رابط مباشر وصورة الغلاف في ثوانٍ.
                    </p>
                  </div>
                </div>
              </div>

            </motion.div>
          )}

          {activeTab === 'ai' && (
            <motion.div
              key="ai"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
            >
              <AIPanel />
            </motion.div>
          )}

          {activeTab === 'media' && (
            <motion.div
              key="media"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
            >
              <MediaPanel />
            </motion.div>
          )}

          {activeTab === 'quran' && (
            <motion.div
              key="quran"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
            >
              <QuranPanel />
            </motion.div>
          )}

          {activeTab === 'dev' && (
            <motion.div
              key="dev"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
            >
              <DeveloperPanel />
            </motion.div>
          )}
        </AnimatePresence>

      </main>

      {/* Footer Branding Area */}
      <footer className="border-t border-violet-500/10 bg-[#040207]/80 backdrop-blur-md py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-1.5">
            <Globe className="text-violet-400 w-4 h-4" />
            <span>بوابة  للخدمات المفتوحة © {new Date().getFullYear()}</span>
          </div>

          <p className="flex items-center gap-1">
            مُطور بكل 💜 بواسطة <a href="https://t.me/V2X_2" target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:underline font-bold">@Nova ai</a>
          </p>

          <p className="text-[11px] text-slate-600 font-mono">
            Powered by nova API Gateway Services
          </p>
        </div>
      </footer>

    </div>
  );
}
