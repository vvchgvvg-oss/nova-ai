import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Send, Bot, Globe, Shield, ExternalLink, MessageCircle, Star, Terminal, 
  Cpu, Award, PlayCircle, Layers, Sliders, Database, Activity, RefreshCw, Crown, CheckCircle 
} from 'lucide-react';
import { TelegramBot, DeveloperWebsite, UserSession } from '../types';

export default function DeveloperPanel() {
  const [session, setSession] = useState<UserSession | null>(() => {
    const saved = localStorage.getItem('mohtal_session');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return null; }
    }
    return null;
  });

  // Admin Controls States
  const [vpsCapacity, setVpsCapacity] = useState(85);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshLog, setRefreshLog] = useState<string[]>(['سجل النظام: جاهز للتحكم والمراقبة الإدارية.']);
  const [activeUsers, setActiveUsers] = useState(14);

  // WormGPT Activity Feed States
  const [wormgptFeed, setWormgptFeed] = useState<{username: string, output: string, created_at: string}[]>([]);
  const [isFeedLoading, setIsFeedLoading] = useState(false);
  const [feedError, setFeedError] = useState<string | null>(null);

  const fetchWormgptFeed = async () => {
    setIsFeedLoading(true);
    setFeedError(null);
    try {
      const response = await fetch('/api/nova ai/wormgpt-activity');
      if (!response.ok) throw new Error('فشل جلب تغذية الأنشطة من خادم WormGPT.');
      const data = await response.json();
      if (Array.isArray(data)) {
        setWormgptFeed(data);
      } else {
        throw new Error('تنسيق البيانات غير صحيح.');
      }
    } catch (err: any) {
      setFeedError(err.message || 'Error loading live feed');
    } finally {
      setIsFeedLoading(false);
    }
  };

  useEffect(() => {
    fetchWormgptFeed();
    const interval = setInterval(fetchWormgptFeed, 30000); // 30 seconds autoupdate
    return () => clearInterval(interval);
  }, []);

  // Random simulation effect
  useEffect(() => {
    if (session?.role !== 'admin') return;
    const interval = setInterval(() => {
      setActiveUsers(prev => Math.max(8, Math.min(48, prev + (Math.random() > 0.5 ? 1 : -1))));
    }, 4500);
    return () => clearInterval(interval);
  }, [session]);

  const triggerGatewaysRefresh = () => {
    setIsRefreshing(true);
    const newLog = `[تحديث] جاري إعادة تهيئة قنوات البوتات وإطلاق خواديم VPS في تمام الساعة ${new Date().toLocaleTimeString()}...`;
    setRefreshLog(prev => [newLog, ...prev.slice(0, 4)]);
    
    setTimeout(() => {
      setIsRefreshing(false);
      setRefreshLog(prev => ['[نجاح] تم تحديث جميع اتصالات API ومسح سجلات التخزين المؤقت.', ...prev]);
    }, 2000);
  };
  
  // Custom categories layout
  const telegramBots: TelegramBot[] = [
    {
      name: "بوت استضافة خوادم مجاني",
      username: "nova ai_free_VPS_bot",
      description: "يوفر استضافة سريعة وصالحة مجانية من خواديم محددة لحلول التطوير والتشغيل الفوري.",
      category: "vps"
    },
    {
      name: "بوت استضافة خوادم عمر",
      username: "vps_FREEnova ai_omar_bot",
      description: "بوت استضافة خوادم عمر المجاني لتوليد وإطلاق البيئات والـ VPS بكل يسر وسهولة.",
      category: "vps"
    },
    {
      name: "بوت كراش استضافة وتوجيه",
      username: "hostingnova aipyBOT",
      description: "بوت الحماية الفعال لخدمات وكراش الاستضافات واختبار الثغرات والأنظمة البرمجية.",
      category: "crash"
    },
    {
      name: "بوت كراش رينج XOX",
      username: "SCAM_XOXbot",
      description: "بوت كراش لحوسبة وفحص الحماية ومعالجة المشاكل الأمنية المعقدة في تليجرام.",
      category: "scam"
    },
    {
      name: "بوت كراش nova ai & XOX المشترك",
      username: "nova aiandSCAM_XOXbot",
      description: "البوت المزدوج لحماية وفحص خواديم التليغرام والتشيكيرز بكفاءة مطلقة.",
      category: "scam"
    },
    {
      name: "مضمار سباق استضافة الـ VPS",
      username: "RACE_nova aibot",
      description: "يوفر أدوات تسريع واستضافة مضمار الخوادم الفوري VPS مجاناً.",
      category: "vps"
    },
    {
      name: "مصنع بوتات nova ai الذكي",
      username: "nova ai_Ai2bot",
      description: "مولد ومصنع البوتات الأول والآلي لتليغرام، يتيح لك إنشاء بوت مخصص في ثوانٍ.",
      category: "ai"
    },
    {
      name: "بوت تلوين nova aicrash",
      username: "nova aicrashSCAMbot",
      description: "بوت تلوين الأكواد ومعالجة الفايل لسهولة الرؤية وتنسيق الألوان الذكية.",
      category: "tool"
    }
  ];

  const websites: DeveloperWebsite[] = [
    {
      title: "موقع توجيه واستضافة nova ai",
      url: "https://ahmedbakkar057-lang.github.io/nova ai/",
      description: "الدليل الشامل والموقع الفعال لتعلم طرق استخلاص وإطلاق خواديم الـ vps والاستضافة مجاناً."
    },
    {
      title: "موقع الاستضافة والحماية الجديد",
      url: "https://jsgsxg-2026--milicapandurovi.replit.app",
      description: "محطة الحماية المتقدمة والخدمات المتكاملة والمحدثة لدعم قنوات ومواقع المطور."
    },
    {
      title: "موقع استضافة الـ VPS الحصري",
      url: "https://nova ai-almohtal-vps--tgsygvb.replit.app",
      description: "المنصة الحصرية المعتمدة لإطلاق وبناء سيناريوهات الـ Replit واستضافة خوادم مجانية."
    }
  ];

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'vps': return 'text-sky-400 bg-sky-500/10 border-sky-500/20';
      case 'crash': return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'scam': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'ai': return 'text-violet-400 bg-violet-500/10 border-violet-500/20';
      default: return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    }
  };

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'vps': return 'بوت استضافة VPS';
      case 'crash': return 'بوت كراش وفحص';
      case 'scam': return 'بوت حماية SCAM';
      case 'ai': return 'صانع ومصنع بوتات AI';
      default: return 'أداة مساعدة مميزة';
    }
  };

  return (
    <div className="space-y-8">

      {/* Secret Admin Dashboard for @wemohammed1 */}
      {session?.role === 'admin' && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-amber-600/10 via-amber-950/20 to-violet-950/15 border-2 border-amber-500/25 rounded-3xl p-6 shadow-[0_0_30px_rgba(245,158,11,0.08)] relative overflow-hidden"
          dir="rtl"
        >
          {/* Neon side ribbon */}
          <div className="absolute top-0 right-0 w-2 h-full bg-gradient-to-b from-amber-400 to-amber-600" />
          
          <div className="flex flex-col lg:flex-row itenova ai-start lg:itenova ai-center justify-between gap-6 relative z-10">
            <div className="space-y-2 text-right">
              <div className="flex itenova ai-center gap-2">
                <span className="p-1.5 bg-amber-500/20 text-amber-300 rounded-lg border border-amber-500/30">
                  <Crown className="w-5 h-5 text-amber-400 animate-pulse" />
                </span>
                <span className="text-xs font-black bg-amber-500/30 text-amber-100 px-2.5 py-0.5 rounded-full border border-amber-500/40">
                  التحكم الإداري السري العام
                </span>
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
              </div>
              <h2 className="text-xl font-black text-white">لوحة تحكم الأستاذ محمد (wemohammed1) 🔥</h2>
              <p className="text-xs text-slate-300 max-w-xl">
                مرحباً بك يا مدير المنصة العام. هذه اللوحة خاصة بحسابك فقط لمراقبة وإدارة قنوات تليجرام، تعديل قدرات خواديم البث الـ VPS ومتابعة تدفق المستخدمين في الوقت الحقيقي.
              </p>
            </div>

            {/* Quick telemetry widget */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full lg:w-auto">
              <div className="bg-[#050308]/90 p-3.5 rounded-2xl border border-amber-500/15 text-center min-w-[120px]">
                <span className="text-[10px] text-slate-400 block font-bold">المستخدمين النشطين</span>
                <span className="text-xl font-black font-mono text-amber-400 flex itenova ai-center justify-center gap-1.5 mt-1">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  {activeUsers} زائر
                </span>
              </div>

              <div className="bg-[#050308]/90 p-3.5 rounded-2xl border border-amber-500/15 text-center min-w-[120px]">
                <span className="text-[10px] text-slate-400 block font-bold">حالة قاعدة البيانات</span>
                <span className="text-xs font-black text-emerald-400 flex itenova ai-center justify-center gap-1 mt-2.5">
                  <Database className="w-3.5 h-3.5" />
                  مؤمنة ونشطة
                </span>
              </div>

              <div className="bg-[#050308]/90 p-3.5 rounded-2xl border border-amber-500/15 text-center min-w-[120px] col-span-2 sm:col-span-1">
                <span className="text-[10px] text-slate-400 block font-bold">قدرة خوادم البث</span>
                <span className="text-sm font-black text-violet-300 font-mono block mt-2 text-center">
                  {vpsCapacity} MB/s
                </span>
              </div>
            </div>
          </div>

          {/* Interactive controls section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-5 border-t border-amber-500/10">
            <div className="space-y-3 bg-[#050308]/60 p-4 rounded-2xl border border-slate-800/40">
              <div className="flex justify-between itenova ai-center">
                <label className="text-xs font-black text-slate-300 flex itenova ai-center gap-1.5">
                  <Sliders className="w-4 h-4 text-amber-400" />
                  تعديل عرض النطاق لخواديم VPS الحرة:
                </label>
                <span className="text-xs font-mono font-bold text-amber-400">{vpsCapacity} MB/s</span>
              </div>
              <input
                type="range"
                min="10"
                max="300"
                value={vpsCapacity}
                onChange={(e) => setVpsCapacity(Number(e.target.value))}
                className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
              />
              <p className="text-[10px] text-slate-400">
                تسريع سرعة الرفع والتحميل للملفات وتدفق البوتات النشطة من خلال توسيع الاتصالات المنفصلة.
              </p>
            </div>

            <div className="space-y-3 bg-[#050308]/60 p-4 rounded-2xl border border-slate-800/40 flex flex-col justify-between">
              <div className="flex justify-between itenova ai-center">
                <span className="text-xs font-black text-slate-300 flex itenova ai-center gap-1.5">
                  <Bot className="w-4 h-4 text-sky-400" />
                  قنوات تليجرام الفعالة للمشتركين:
                </span>
                
                <button
                  type="button"
                  onClick={triggerGatewaysRefresh}
                  disabled={isRefreshing}
                  className="bg-amber-500/10 hover:bg-amber-500 hover:text-slate-950 text-amber-300 text-[10px] font-black px-3 py-1.5 rounded-lg border border-amber-500/30 transition-all flex itenova ai-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
                  <span>تصفية قنوات البوتات</span>
                </button>
              </div>

              {/* Console logs */}
              <div className="bg-[#030205] p-2.5 rounded-xl border border-slate-900 font-mono text-[9px] text-slate-400 h-14 overflow-y-auto space-y-1 block text-right" dir="ltr">
                {refreshLog.map((log, i) => (
                  <div key={i} className={i === 0 ? "text-amber-400 font-bold" : ""}>{log}</div>
                ))}
              </div>
            </div>
          </div>

        </motion.div>
      )}
      
      {/* Dev Profile Banner */}
      <div className="bg-gradient-to-l from-violet-950/40 via-purple-950/20 to-slate-900/40 backdrop-blur-xl border border-violet-500/30 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-fuchsia-600/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row itenova ai-center gap-6 relative z-10 text-center md:text-right">
          
          {/* Futuristic Avatar Globe */}
          <div className="relative">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-violet-600 to-fuchsia-600 p-[2px] shadow-[0_0_25px_rgba(139,92,246,0.3)] group">
              <div className="w-full h-full bg-slate-950 rounded-2xl flex itenova ai-center justify-center relative overflow-hidden">
                <Terminal className="w-10 h-10 text-violet-400 animate-pulse" />
              </div>
            </div>
            {/* Live Indicator */}
            <span className="absolute -top-1.5 -left-1.5 bg-emerald-500 border-2 border-slate-950 rounded-full w-5 h-5 flex itenova ai-center justify-center" title="نشط أونلاين">
              <span className="w-2 h-2 bg-white rounded-full animate-ping" />
            </span>
          </div>

          <div className="space-y-3 flex-1">
            <div className="flex flex-wrap itenova ai-center gap-2 justify-center md:justify-start">
              <span className="bg-violet-500/10 text-violet-300 font-mono text-xs px-3 py-1 rounded-full border border-violet-500/20">صاحب المنصة</span>
              <h1 className="text-2xl font-black text-white">nova ai almohtal (م.س المحتال)</h1>
            </div>
            
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              مرحبًا بكم في قاعة المطور الرسمية. أعمل على ابتكار برمجيات حرة، وبوتات استضافة ذكية (VPS)، وأدوات فحص وحماية على تليغرام لتسهيل إطلاق الخوادم والمشاريع البرمجية بيسر تام.
            </p>

            <div className="flex flex-wrap justify-center md:justify-start gap-3 pt-2">
              <a
                href="https://t.me/V2X_2"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs rounded-xl px-5 py-3 transition-all hover:scale-[1.02] flex itenova ai-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                تواصل مباشر: V2X_2@
              </a>

              <a
                href="https://t.me/nova ai_mohtal"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-violet-300 hover:text-white font-bold text-xs rounded-xl px-5 py-3 transition-colors flex itenova ai-center gap-2"
              >
                <Send className="w-4 h-4 text-sky-400" />
                قناة التليجرام الرسمية للحداثة
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* WormGPT Live Feed Panel / Terminal */}
      <div className="bg-slate-950/40 backdrop-blur-xl border border-rose-500/20 rounded-3xl p-6 shadow-2xl relative overflow-hidden text-right" dir="rtl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row justify-between itenova ai-start sm:itenova ai-center gap-3 mb-5 border-b border-rose-500/15 pb-4">
          <div className="flex itenova ai-center gap-3">
            <span className="p-2 bg-rose-500/10 text-rose-400 rounded-xl border border-rose-500/25 animate-pulse">
              <Activity className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-md font-extrabold text-slate-100 flex itenova ai-center gap-2">
                بث النشاط المباشر لـ WormGPT (WormGPT Live Feed)
                <span className="w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping" />
              </h3>
              <p className="text-xs text-slate-400">آخر العمليات والمناقشات الأمنية الفعالة في الوقت الحقيقي عبر واجهة API</p>
            </div>
          </div>
          
          <button
            onClick={() => fetchWormgptFeed()}
            disabled={isFeedLoading}
            className="px-3.5 py-1.5 bg-rose-600/15 hover:bg-rose-500 hover:text-white text-rose-300 rounded-xl text-xs font-black border border-rose-500/30 transition-all flex itenova ai-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFeedLoading ? 'animate-spin' : ''}`} />
            تحديث البث
          </button>
        </div>

        {/* Live list in terminal style */}
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 font-mono text-xs text-slate-300 relative text-right">
          <div className="flex itenova ai-center justify-between border-b border-slate-800 pb-2 mb-3 text-slate-500 text-[10px]">
            <div className="flex gap-1.5 itenova ai-center mr-0 ml-auto flex-row-reverse">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="mr-0 ml-2 font-black">wormgpt_live_feed.sh</span>
            </div>
            <span>اتصال آمن ونشط 🟢</span>
          </div>

          {isFeedLoading && wormgptFeed.length === 0 ? (
            <div className="flex flex-col itenova ai-center justify-center py-10 space-y-3">
              <RefreshCw className="w-8 h-8 text-rose-500 animate-spin" />
              <span className="text-slate-400">جاري الاتصال وسحب البيانات من WormGPT...</span>
            </div>
          ) : feedError && wormgptFeed.length === 0 ? (
            <div className="text-center py-10 text-rose-400">
              <p className="font-bold">❌ فشل تحميل التغذية للأنشطة</p>
              <p className="text-slate-500 text-[10px] mt-1">{feedError}</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[280px] overflow-y-auto pl-1">
              {wormgptFeed.slice(0, 10).map((item, idx) => (
                <div 
                  key={idx} 
                  className="bg-slate-950/75 p-3.5 rounded-xl border border-slate-800/80 flex flex-col sm:flex-row justify-between itenova ai-start sm:itenova ai-center gap-2 hover:border-rose-500/30 hover:bg-slate-950/90 transition-all"
                >
                  <div className="flex itenova ai-start gap-2.5 text-right w-full sm:w-auto">
                    <span className="text-rose-400 font-bold bg-rose-500/10 px-2.5 py-1 rounded border border-rose-500/15 shrink-0">
                      nova ai-{item.username || "anon"}
                    </span>
                    <div className="text-right">
                      <p className="text-rose-300 font-black text-xs">
                        {item.output || "طلب مجهول"}
                      </p>
                      <span className="text-[10.5px] text-slate-500 mt-1 block">
                        تاريخ الطلب: {item.created_at || "غير محدد"}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex itenova ai-center gap-1.5 mr-auto sm:mr-0 shrink-0">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20 font-black">
                      ACTIVE
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bots GridSection */}
      <div className="space-y-4">
        <div className="flex itenova ai-center gap-2.5 px-1">
          <span className="p-1 px-2.5 bg-sky-500/10 text-sky-400 rounded-lg border border-sky-500/20 text-xs font-bold font-mono">Bots List</span>
          <div>
            <h3 className="text-md font-extrabold text-slate-200">🚀 قائمة البوتات والخدمات الشغالة حالياً على التليغرام</h3>
            <p className="text-xs text-slate-400 mt-0.5">انقر على أي كارت للدخول المباشر إلى البوت عبر تليغرام وبدء الاستخدام</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {telegramBots.map((bot, idx) => (
            <motion.a
              key={idx}
              href={`https://t.me/${bot.username}`}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-slate-900/30 backdrop-blur-md border border-slate-850 hover:border-sky-500/40 p-5 rounded-2xl flex flex-col justify-between hover:bg-slate-900/50 hover:shadow-[0_0_15px_rgba(56,189,248,0.06)] group transition-all"
            >
              <div className="space-y-3">
                <div className="flex justify-between itenova ai-start">
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded border ${getCategoryColor(bot.category)}`}>
                    {getCategoryLabel(bot.category)}
                  </span>
                  <Bot className="w-5 h-5 text-sky-400 opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all" />
                </div>

                <div>
                  <h4 className="font-extrabold text-sm text-slate-100 group-hover:text-white transition-colors leading-snug">{bot.name}</h4>
                  <p className="text-[11px] text-sky-400 font-mono mt-0.5" dir="ltr">@{bot.username}</p>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed font-normal">{bot.description}</p>
              </div>

              <div className="pt-4 border-t border-slate-950 mt-4 flex itenova ai-center justify-between text-[11px] text-slate-500 font-bold">
                <span className="text-sky-400 group-hover:underline flex itenova ai-center gap-1">
                  ابدء الاستخدام
                  <ExternalLink className="w-3 h-3" />
                </span>
                <span className="font-mono">nova ai Mohtal</span>
              </div>
            </motion.a>
          ))}
        </div>
      </div>

      {/* Web portables list */}
      <div className="space-y-4">
        <div className="flex itenova ai-center gap-2.5 px-1">
          <span className="p-1 px-2.5 bg-violet-500/10 text-violet-400 rounded-lg border border-violet-500/20 text-xs font-bold font-mono">Online Portals</span>
          <div>
            <h3 className="text-md font-extrabold text-slate-200">🌐 مواقع الويب الفعالة واستضافة الـ Setup ميرّات</h3>
            <p className="text-xs text-slate-400 mt-0.5">مواقع مخصصة لتثبيت خوادم الـ VPS والملفات التلقائية ومستودعات الأكواد الحرة</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {websites.map((site, idx) => (
            <motion.a
              key={idx}
              href={site.url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-slate-950/40 border border-slate-900 hover:border-violet-500/20 p-5 rounded-2xl flex flex-col justify-between hover:bg-slate-900/30 group transition-all"
            >
              <div className="space-y-3">
                <div className="flex justify-between itenova ai-center">
                  <span className="p-1.5 bg-violet-500/15 rounded-lg border border-violet-500/20 text-violet-400">
                    <Globe className="w-5 h-5" />
                  </span>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Portal Site</span>
                </div>

                <div>
                  <h4 className="font-bold text-sm text-slate-100 group-hover:text-white">{site.title}</h4>
                  <span className="text-[10px] text-violet-400/80 font-mono block truncate" dir="ltr">{site.url}</span>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">{site.description}</p>
              </div>

              <div className="pt-4 mt-3 border-t border-slate-900 flex itenova ai-center justify-between text-[11px] text-slate-500">
                <span className="text-violet-400 hover:underline flex itenova ai-center gap-1 font-bold">
                  زيارة الرابط
                  <ExternalLink className="w-3.5 h-3.5" />
                </span>
                <span className="font-mono">Checked active</span>
              </div>
            </motion.a>
          ))}
        </div>
      </div>

    </div>
  );
}
