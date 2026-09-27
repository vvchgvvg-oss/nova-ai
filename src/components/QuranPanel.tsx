import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, Music, Users, Search, Play, Volume2, Shield, Info, Sparkles, 
  RefreshCw, BarChart2, Star, Disc, AudioLines, Award 
} from 'lucide-react';
import { Surah, Reciter, QuranAudioResponse, QuranStats } from '../types';

export default function QuranPanel() {
  // Lists
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [reciters, setReciters] = useState<Reciter[]>([]);
  const [filteredSurahs, setFilteredSurahs] = useState<Surah[]>([]);
  const [filteredReciters, setFilteredReciters] = useState<Reciter[]>([]);
  const [stats, setStats] = useState<QuranStats | null>(null);

  // Selections
  const [selectedSurahId, setSelectedSurahId] = useState<number>(1); // Default Fatiha
  const [selectedReciterId, setSelectedReciterId] = useState<number>(5); // Default Maher Al-Muaiqly (usually 5 or similar)
  
  // Audio state
  const [audioResult, setAudioResult] = useState<QuranAudioResponse | null>(null);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);

  // UI state
  const [surahSearch, setSurahSearch] = useState('');
  const [reciterSearch, setReciterSearch] = useState('');
  const [activeSubTab, setActiveSubTab] = useState<'surahs' | 'reciters' | 'stats'>('surahs');
  const [isInitializing, setIsInitializing] = useState(true);

  // Fetch initial Lists & Stats on Mount
  useEffect(() => {
    async function loadQuranMetadata() {
      setIsInitializing(true);
      try {
        // Fetch Surahs
        const surahsResponse = await fetch('/api/ms/quran/surahs');
        const surahsData = await surahsResponse.json();
        
        // Fetch Reciters
        const recitersResponse = await fetch('/api/ms/quran/reciters');
        const recitersData = await recitersResponse.json();

        // Fetch Stats
        const statsResponse = await fetch('/api/ms/quran/stats');
        const statsData = await statsResponse.json();

        // Ensure we gracefully format and store them
        if (Array.isArray(surahsData)) {
          setSurahs(surahsData);
          setFilteredSurahs(surahsData);
        } else if (surahsData.surahs) {
          setSurahs(surahsData.surahs);
          setFilteredSurahs(surahsData.surahs);
        }

        if (Array.isArray(recitersData)) {
          setReciters(recitersData);
          setFilteredReciters(recitersData);
        } else if (recitersData.reciters) {
          setReciters(recitersData.reciters);
          setFilteredReciters(recitersData.reciters);
        }

        if (statsData) {
          setStats(statsData);
        } else {
          setStats({ surahs_count: 114, reciters_count: 20, total_verses: 6235 });
        }
      } catch (err: any) {
        console.error("Failed to load initial Quran metadata:", err.message);
        // Feed offline fallback if necessary
        const fallbackSurahs = Array.from({ length: 114 }).map((_, i) => ({
          id: i + 1,
          name: `سورة الرقم ${i + 1}`,
          englishName: `Surah ${i + 1}`,
          numberOfAyahs: 7
        }));
        setSurahs(fallbackSurahs);
        setFilteredSurahs(fallbackSurahs);
      } finally {
        setIsInitializing(false);
      }
    }
    loadQuranMetadata();
  }, []);

  // Sync Search filters
  useEffect(() => {
    let output = surahs;
    if (surahSearch.trim()) {
      const q = surahSearch.toLowerCase().trim();
      output = surahs.filter(s => 
        s.name.includes(q) || 
        s.englishName.toLowerCase().includes(q) || 
        String(s.id) === q
      );
    }
    setFilteredSurahs(output);
  }, [surahSearch, surahs]);

  useEffect(() => {
    let output = reciters;
    if (reciterSearch.trim()) {
      const q = reciterSearch.toLowerCase().trim();
      output = reciters.filter(r => 
        r.name.includes(q) || 
        String(r.id) === q
      );
    }
    setFilteredReciters(output);
  }, [reciterSearch, reciters]);

  // Fetch Audio callback
  const fetchRecitation = async (surahId: number, reciterId: number) => {
    setIsLoadingAudio(true);
    setAudioError(null);
    setAudioResult(null);

    try {
      // Endpoint: /api/ms/quran/audio/:surah_id/:reciter_id?play=false
      const url = `/api/ms/quran/audio/${surahId}/${reciterId}?play=false`;
      const response = await fetch(url);
      const data = await response.json();

      if (response.ok && data && (data.audio_url || data.url)) {
        // Normalize response object
        const audioUrl = data.audio_url || data.url || data.download;
        const normalized: QuranAudioResponse = {
          status: 'success',
          surah: {
            id: surahId,
            name: data.surah?.name || surahs.find(s => s.id === surahId)?.name || `السورة ${surahId}`,
            englishName: data.surah?.englishName || surahs.find(s => s.id === surahId)?.englishName || `Surah ${surahId}`
          },
          reciter: {
            id: reciterId,
            name: data.reciter?.name || reciters.find(r => r.id === reciterId)?.name || `القارئ ${reciterId}`
          },
          audio_url: audioUrl
        };
        setAudioResult(normalized);
      } else {
        throw new Error('لم يعثر على ملف صوتي لهذا القارئ أو السورة.');
      }
    } catch (err: any) {
      setAudioError(err.message || 'حدث خطأ في تحميل ملف التلاوة.');
    } finally {
      setIsLoadingAudio(false);
    }
  };

  // Quick helper to activate selection
  const handleSelectSurah = (surahId: number) => {
    setSelectedSurahId(surahId);
    fetchRecitation(surahId, selectedReciterId);
  };

  const handleSelectReciter = (reciterId: number) => {
    setSelectedReciterId(reciterId);
    fetchRecitation(selectedSurahId, reciterId);
  };

  // Trigger Random recitation
  const handleRandomRecitation = async () => {
    setIsLoadingAudio(true);
    setAudioError(null);
    setAudioResult(null);

    try {
      // Endpoint: /api/ms/quran/random?reciter_id=<id>
      const url = `/api/ms/quran/random?reciter_id=${selectedReciterId}`;
      const response = await fetch(url);
      const data = await response.json();

      if (response.ok && data && (data.audio_url || data.url)) {
        const audioUrl = data.audio_url || data.url;
        const surahId = data.surah?.id || Math.floor(Math.random() * 114) + 1;
        
        setSelectedSurahId(surahId);
        
        const normalized: QuranAudioResponse = {
          status: 'success',
          surah: {
            id: surahId,
            name: data.surah?.name || surahs.find(s => s.id === surahId)?.name || `السورة ${surahId}`,
            englishName: data.surah?.englishName || surahs.find(s => s.id === surahId)?.englishName || `Surah ${surahId}`
          },
          reciter: {
            id: selectedReciterId,
            name: data.reciter?.name || reciters.find(r => r.id === selectedReciterId)?.name || `القارئ`
          },
          audio_url: audioUrl
        };
        setAudioResult(normalized);
      } else {
        // Pick dynamic local random and fetch
        const randomSurah = Math.floor(Math.random() * 114) + 1;
        handleSelectSurah(randomSurah);
      }
    } catch (err: any) {
      // fallback
      const randomSurah = Math.floor(Math.random() * 114) + 1;
      handleSelectSurah(randomSurah);
    } finally {
      setIsLoadingAudio(false);
    }
  };

  // Trigger default Fatiha on load if nothing fetched
  useEffect(() => {
    if (surahs.length > 0 && reciters.length > 0 && !audioResult && !isLoadingAudio) {
      fetchRecitation(1, 5); // Default Al-Fatihah, Maher Al-Muaiqly
    }
  }, [surahs, reciters]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

      {/* Grid Left: Visual Player (Always highlighted on top/left) */}
      <div className="lg:col-span-12 xl:col-span-5 flex flex-col gap-6">
        
        {/* Visual Streaming Player Card */}
        <div className="bg-slate-900/40 backdrop-blur-xl border border-emerald-500/20 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-600/5 rounded-full blur-3xl" />
          
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <span className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
                <BookOpen className="w-5 h-5" />
              </span>
              <h2 className="text-md font-bold text-slate-100">بث التلاوة المباشرة</h2>
            </div>
            
            <button
              onClick={handleRandomRecitation}
              className="text-xs bg-emerald-600/15 border border-emerald-500/30 text-emerald-300 hover:text-white hover:bg-emerald-600/30 px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 font-bold cursor-pointer"
              title="تلاوة عشوائية للقارئ المحدد"
              disabled={isLoadingAudio}
            >
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              <span>صوت عشوائي</span>
            </button>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center text-center relative overflow-hidden min-h-[250px] shadow-inner">
            <div className="absolute top-0 left-0 w-32 h-32 bg-emerald-600/5 rounded-full blur-2xl pointer-events-none" />
            
            {isLoadingAudio && (
              <div className="space-y-3 z-10 py-5">
                <div className="relative flex justify-center">
                  <div className="w-16 h-16 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin" />
                  <Music className="absolute inset-0 m-auto w-6 h-6 text-emerald-400 animate-pulse" />
                </div>
                <p className="text-xs text-emerald-300 font-semibold">تحضير البث المباشر لقراء القرآن الكريم...</p>
                <p className="text-[10px] text-slate-500">جلب تلاوة MP3 سريعة</p>
              </div>
            )}

            {audioError && !isLoadingAudio && (
              <div className="p-4 text-center text-red-400 space-y-2 max-w-sm">
                <Info className="w-8 h-8 mx-auto" />
                <p className="text-xs leading-relaxed font-bold">{audioError}</p>
                <button
                  onClick={() => fetchRecitation(selectedSurahId, selectedReciterId)}
                  className="mx-auto text-xs bg-red-500/10 text-red-300 px-3 py-1 rounded-lg border border-red-500/20"
                >
                  إعادة المحاولة
                </button>
              </div>
            )}

            {audioResult && !isLoadingAudio && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full space-y-6 flex flex-col items-center"
              >
                {/* Audio Waves design */}
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-emerald-600/20 to-teal-500/10 border-2 border-emerald-500/40 flex items-center justify-center shadow-lg relative z-10 group/disc">
                    <Disc className="w-12 h-12 text-emerald-400 group-hover/disc:rotate-180 transition-transform duration-1000" />
                  </div>
                  {/* Ripple elements */}
                  <div className="absolute inset-0 w-24 h-24 rounded-full bg-emerald-500/10 animate-ping -z-10" />
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] text-emerald-400 font-mono tracking-wider uppercase bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    رقم السورة: {audioResult.surah.id}
                  </span>
                  <h3 className="text-lg font-extrabold text-slate-100 mt-1">{audioResult.surah.name}</h3>
                  <p className="text-xs text-slate-400">{audioResult.surah.englishName}</p>
                  
                  <div className="flex items-center gap-1.5 justify-center text-slate-500 text-xs pt-1.5">
                    <Users className="w-3.5 h-3.5 text-emerald-500/80" />
                    <span className="text-slate-200 font-medium">القارئ: {audioResult.reciter.name}</span>
                  </div>
                </div>

                {/* Styled Native HTML Audio */}
                <div className="w-full max-w-md pt-2">
                  <audio
                    src={audioResult.audio_url}
                    controls
                    autoPlay
                    className="w-full h-11 rounded-lg outline-none opacity-90 select-none border border-emerald-500/10"
                  />
                </div>
              </motion.div>
            )}
          </div>

          <div className="text-[10px] text-slate-500 font-mono mt-4 flex justify-between items-center border-t border-slate-900 pt-3">
            <span className="flex items-center gap-1">
              <Shield className="w-3 h-3 text-emerald-500" />
              تراخيص الصوتية: سريعة التحميل
            </span>
            <span>Developer: MS 🛸</span>
          </div>

        </div>

        {/* Selected parameters logs / hints */}
        <div className="bg-slate-900/20 border border-slate-800 p-4 rounded-xl flex items-center gap-3">
          <AudioLines className="w-5 h-5 text-emerald-500 shrink-0" />
          <div className="text-xs text-slate-400 leading-relaxed">
            <span className="text-slate-200 font-bold">تلميح ذكي:</span> اختر القارئ المناسب أولاً من علامة التبويب "قائمة القراء"، ثم انقر على السورة التي تريد سماعها تالياً لتتولى الخوادم ربط البث فوراً.
          </div>
        </div>

      </div>

      {/* Grid Right: Surahs Browser and Reciters selection */}
      <div className="lg:col-span-12 xl:col-span-7 flex flex-col gap-6">
        
        {/* Encyclopedia Card */}
        <div className="bg-slate-900/40 backdrop-blur-xl border border-emerald-500/20 rounded-2xl shadow-2xl overflow-hidden min-h-[450px] flex flex-col">
          
          {/* Internal subtab selectors */}
          <div className="flex border-b border-emerald-500/15 bg-slate-950/60 p-1.5 gap-1.5">
            <button
              onClick={() => setActiveSubTab('surahs')}
              className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeSubTab === 'surahs'
                  ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 font-extrabold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/45'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>فهرس السور (114 سورة)</span>
            </button>

            <button
              onClick={() => setActiveSubTab('reciters')}
              className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeSubTab === 'reciters'
                  ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/45'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>قائمة القراء الكرم (20 قارئ)</span>
            </button>

            <button
              onClick={() => setActiveSubTab('stats')}
              className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeSubTab === 'stats'
                  ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/45'
              }`}
            >
              <BarChart2 className="w-4 h-4" />
              <span>إحصائيات المنصة</span>
            </button>
          </div>

          <div className="p-5 flex-1 flex flex-col">
            
            {/* 1. Surahs View */}
            {activeSubTab === 'surahs' && (
              <div className="flex-1 flex flex-col space-y-4">
                {/* Search Bar */}
                <div className="relative">
                  <input
                    type="text"
                    value={surahSearch}
                    onChange={(e) => setSurahSearch(e.target.value)}
                    placeholder="ابحث عن السورة بالاسم أو رقمها..."
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl pl-4 pr-11 py-2.5 text-xs text-slate-200 placeholder-slate-500 outline-none transition-all"
                  />
                  <Search className="absolute right-4 top-3.5 w-4 h-4 text-slate-500" />
                </div>

                {isInitializing ? (
                  <div className="flex-1 flex flex-col items-center justify-center py-20 gap-2">
                    <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin" />
                    <span className="text-xs text-slate-400">جاري تحميل الفهرس الكامل للقرآن الكريم...</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[290px] overflow-y-auto pr-1">
                    {filteredSurahs.map((surah) => (
                      <button
                        key={surah.id}
                        onClick={() => handleSelectSurah(surah.id)}
                        className={`text-right p-3 rounded-xl border transition-all flex justify-between items-center cursor-pointer group/item ${
                          selectedSurahId === surah.id
                            ? 'bg-emerald-600/15 border-emerald-500/40 text-emerald-300'
                            : 'bg-slate-950/40 border-slate-900 hover:border-emerald-500/20 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className={`w-7 h-7 rounded-lg text-xs font-mono font-bold flex items-center justify-center border ${
                            selectedSurahId === surah.id
                              ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                              : 'bg-slate-900 border-slate-800 text-slate-400 group-hover/item:border-emerald-500/40'
                          }`}>
                            {surah.id}
                          </span>
                          <div>
                            <span className="font-extrabold text-sm block">{surah.name}</span>
                            <span className="text-[10px] text-slate-500 font-mono italic block">{surah.englishName}</span>
                          </div>
                        </div>

                        <div className="text-left">
                          <span className="text-[10px] text-slate-400 bg-slate-900/80 px-2 py-1 rounded border border-slate-800/80 block">
                            {surah.numberOfAyahs} آية
                          </span>
                        </div>
                      </button>
                    ))}

                    {filteredSurahs.length === 0 && (
                      <div className="col-span-2 text-center text-slate-500 py-10 text-xs">
                        لم نعثر على أي نتائج مطابقة لبحثك "{surahSearch}"
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* 2. Reciters View */}
            {activeSubTab === 'reciters' && (
              <div className="flex-1 flex flex-col space-y-4">
                {/* Search Bar */}
                <div className="relative">
                  <input
                    type="text"
                    value={reciterSearch}
                    onChange={(e) => setReciterSearch(e.target.value)}
                    placeholder="ابحث عن القارئ بالاسم..."
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl pl-4 pr-11 py-2.5 text-xs text-slate-200 placeholder-slate-500 outline-none transition-all"
                  />
                  <Search className="absolute right-4 top-3.5 w-4 h-4 text-slate-500" />
                </div>

                {isInitializing ? (
                  <div className="flex-1 flex flex-col items-center justify-center py-20 gap-2">
                    <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin" />
                    <span className="text-xs text-slate-400">جاري جلب قائمة كبار شيوخ القراء...</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[290px] overflow-y-auto pr-1">
                    {filteredReciters.map((r) => (
                      <button
                        key={r.id}
                        onClick={() => handleSelectReciter(r.id)}
                        className={`text-right p-3.5 rounded-xl border transition-all flex items-center gap-3 cursor-pointer group/rec ${
                          selectedReciterId === r.id
                            ? 'bg-emerald-600/15 border-emerald-500/40 text-emerald-300'
                            : 'bg-slate-950/40 border-slate-900 hover:border-emerald-500/20 text-slate-300 hover:text-white'
                        }`}
                      >
                        <span className={`w-8 h-8 rounded-full border flex items-center justify-center transition-transform shrink-0 ${
                          selectedReciterId === r.id
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                            : 'bg-slate-900 border-slate-850 text-slate-500 group-hover/rec:scale-105'
                        }`}>
                          <Star className="w-4 h-4 fill-current opacity-80" />
                        </span>
                        
                        <div className="flex-1 min-w-0">
                          <span className="font-extrabold text-sm block truncate">{r.name}</span>
                          <span className="text-[10px] text-slate-500 block font-mono">الرقم المتسلسل: #{r.id}</span>
                        </div>
                      </button>
                    ))}

                    {filteredReciters.length === 0 && (
                      <div className="col-span-2 text-center text-slate-500 py-10 text-xs">
                        لم نعثر على أي قارئ لـ "{reciterSearch}"
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* 3. Stats View */}
            {activeSubTab === 'stats' && (
              <div className="flex-1 flex flex-col justify-center text-center space-y-6 max-w-lg mx-auto py-4">
                
                <div className="flex items-center justify-center gap-3.5 mb-2">
                  <Award className="w-8 h-8 text-emerald-400 animate-pulse" />
                  <span className="text-lg font-extrabold text-slate-100">إحصائيات واجهة القراء والقرآن الكريم</span>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-slate-950 p-4 border border-slate-850 rounded-xl space-y-1">
                    <div className="text-emerald-400 font-extrabold text-xl font-mono">{stats?.surahs_count || 114}</div>
                    <div className="text-[10px] text-slate-400">سورة كاملة بالبيانات</div>
                  </div>

                  <div className="bg-slate-950 p-4 border border-slate-850 rounded-xl space-y-1">
                    <div className="text-emerald-400 font-extrabold text-xl font-mono">{stats?.reciters_count || 20}</div>
                    <div className="text-[10px] text-slate-400">من كوكبة القراء العرب</div>
                  </div>

                  <div className="bg-slate-950 p-4 border border-slate-850 rounded-xl space-y-1">
                    <div className="text-emerald-400 font-extrabold text-xl font-mono">{stats?.total_verses || 6235}</div>
                    <div className="text-[10px] text-slate-400">آية محكمة موثقة</div>
                  </div>
                </div>

                <div className="bg-emerald-950/10 border border-emerald-500/10 rounded-xl p-4 text-xs text-slate-400 leading-relaxed text-right">
                  <p className="font-bold text-slate-200 mb-1">🔥 ميزات واجهات الاستعلام عن القرآن الكريم:</p>
                  • محرك دقة عالي وسرعة اتصال فورية من Helm.<br />
                  • صوتيات مدمجة وسيرفرات تشغيل بجودة MP3 نقية.<br />
                  • تحديث فوري للمحتوى وجميع السور عشوائية وسهلة الدمج لتسهيل العبادة.
                </div>
              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
}
