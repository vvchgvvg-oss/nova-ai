import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Youtube, Video, Instagram, Search, Download, Music, Film, Clapperboard, 
  ExternalLink, Play, AlertCircle, RefreshCw, Layers, CheckCircle 
} from 'lucide-react';
import { YoutubeTrack, MovieResponse, InstagramResponse } from '../types';

export default function MediaPanel() {
  const [activeTab, setActiveTab] = useState<'youtube' | 'movie' | 'instagram'>('youtube');

  // YouTube Downloader States
  const [ytQuery, setYtQuery] = useState('');
  const [ytTrack, setYtTrack] = useState<YoutubeTrack | null>(null);
  const [isYtLoading, setIsYtLoading] = useState(false);
  const [ytError, setYtError] = useState<string | null>(null);

  // Movie Downloader States
  const [movieName, setMovieName] = useState('');
  const [movieResult, setMovieResult] = useState<MovieResponse | null>(null);
  const [isMovieLoading, setIsMovieLoading] = useState(false);
  const [movieError, setMovieError] = useState<string | null>(null);
  const [selectedQualityIdx, setSelectedQualityIdx] = useState<number | null>(null);
  const [downloadLink, setDownloadLink] = useState<string | null>(null);
  const [isFetchLinkLoading, setIsFetchLinkLoading] = useState(false);

  // Instagram States
  const [igUrl, setIgUrl] = useState('');
  const [igData, setIgData] = useState<InstagramResponse | null>(null);
  const [isIgLoading, setIsIgLoading] = useState(false);
  const [igError, setIgError] = useState<string | null>(null);

  // Handle YouTube Fetch
  const handleYoutubeDL = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ytQuery.trim() || isYtLoading) return;

    setIsYtLoading(true);
    setYtError(null);
    setYtTrack(null);

    try {
      const response = await fetch(`/api/ms/yt-mp3?name=${encodeURIComponent(ytQuery.trim())}`);
      const data = await response.json();
      
      if (response.ok && data) {
        // Helm API format outputs title, video_id, and maybe download_url or direct mp3 link
        // Let's normalize it
        if (!data.title && !data.audio) {
          throw new Error('لم نعثر على أي نتائج مطابقة لهذا البحث.');
        }
        setYtTrack(data);
      } else {
        throw new Error(data.error || 'فشل التنزيل من خوادم اليوتيوب.');
      }
    } catch (error: any) {
      setYtError(error.message || 'حدث خطأ غير متوقع أثناء المعالجة.');
    } finally {
      setIsYtLoading(false);
    }
  };

  // Handle Movie Search
  const handleMovieSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!movieName.trim() || isMovieLoading) return;

    setIsMovieLoading(true);
    setMovieError(null);
    setMovieResult(null);
    setDownloadLink(null);
    setSelectedQualityIdx(null);

    try {
      const response = await fetch(`/api/ms/movie?name=${encodeURIComponent(movieName.trim())}`);
      const data = await response.json();
      
      if (response.ok && data && data.status !== 'error') {
        setMovieResult(data);
      } else {
        throw new Error(data.error || 'تعذر العثور على معلومات الفيلم المطلوب.');
      }
    } catch (error: any) {
      setMovieError(error.message || 'خطأ في جلب بيانات الفيلم من السينما.');
    } finally {
      setIsMovieLoading(false);
    }
  };

  // Handle Movie Quality Download link retrieval
  const handleGetMovieDownloadLink = async (qualityIndex: number) => {
    if (!movieResult || isFetchLinkLoading) return;
    setSelectedQualityIdx(qualityIndex);
    setIsFetchLinkLoading(true);
    setDownloadLink(null);

    try {
      // quality index is 1-based or 0-based index. Helm API accepts quality indicator (e.g. 1, 2, 3) 
      // Let's map qualityIndex (0 to qualities.length-1) to quality (1-based index e.g. qualityIndex + 1)
      const qualityParam = qualityIndex + 1;
      const response = await fetch(
        `/api/ms/movie?name=${encodeURIComponent(movieResult.movie_name)}&quality=${qualityParam}`
      );
      const data = await response.json();

      if (response.ok && data && data.download) {
        setDownloadLink(data.download);
      } else {
        throw new Error('فشل جلب رابط التحميل لهذه الجودة.');
      }
    } catch (error: any) {
      setMovieError(error.message || 'خطأ في جلب الرابط.');
    } finally {
      setIsFetchLinkLoading(false);
    }
  };

  // Handle Instagram DL
  const handleInstagramDL = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!igUrl.trim() || isIgLoading) return;

    setIsIgLoading(true);
    setIgError(null);
    setIgData(null);

    try {
      const response = await fetch(`/api/ms/instagram?url=${encodeURIComponent(igUrl.trim())}`);
      const data = await response.json();

      if (response.ok && data) {
        setIgData(data);
      } else {
        throw new Error(data.error || 'فشل التنزيل. تأكد من أن الحساب عام والرابط صحيح.');
      }
    } catch (error: any) {
      setIgError(error.message || 'حدث خطأ في تحميل الريبلز من انستقرام.');
    } finally {
      setIsIgLoading(false);
    }
  };

  return (
    <div className="bg-slate-900/40 backdrop-blur-xl border border-violet-500/20 rounded-2xl shadow-2xl overflow-hidden">
      
      {/* Tab Selectors */}
      <div className="flex border-b border-violet-500/15 bg-slate-950/60 p-1 bg-opacity-90 gap-1 sm:p-2 sm:gap-2">
        <button
          onClick={() => setActiveTab('youtube')}
          className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2.5 py-2.5 sm:py-3 rounded-xl transition-all cursor-pointer font-black relative overflow-hidden ${
            activeTab === 'youtube'
              ? 'bg-violet-600/20 text-violet-300 border border-violet-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <Youtube className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
          <span className="text-[10px] sm:text-xs">يوتيوب MP3</span>
          {activeTab === 'youtube' && (
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-violet-400 rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('movie')}
          className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2.5 py-2.5 sm:py-3 rounded-xl transition-all cursor-pointer font-black relative overflow-hidden ${
            activeTab === 'movie'
              ? 'bg-violet-600/20 text-violet-300 border border-violet-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <Film className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />
          <span className="text-[10px] sm:text-xs">الأفلام</span>
          {activeTab === 'movie' && (
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-violet-400 rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('instagram')}
          className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2.5 py-2.5 sm:py-3 rounded-xl transition-all cursor-pointer font-black relative overflow-hidden ${
            activeTab === 'instagram'
              ? 'bg-violet-600/20 text-violet-300 border border-violet-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <Instagram className="w-4 h-4 sm:w-5 sm:h-5 text-pink-500" />
          <span className="text-[10px] sm:text-xs">انستجرام</span>
          {activeTab === 'instagram' && (
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-violet-400 rounded-full" />
          )}
        </button>
      </div>

      {/* Main Container Content */}
      <div className="p-6">
        
        {/* Youtube Tab */}
        {activeTab === 'youtube' && (
          <div className="space-y-6">
            <div className="bg-slate-950/40 border border-red-500/10 p-4 rounded-xl flex items-start gap-3">
              <Youtube className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-slate-100">محمل صوتيات يوتيوب MP3 فائق السرعة</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  اكتب اسم الأغنية أو الكلمة الدلالية للبحث عنها لتتولى محركات MS جلب رابط تحميل مباشر MP3 وصورة الغلاف في ثوانٍ.
                </p>
              </div>
            </div>

            <form onSubmit={handleYoutubeDL} className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={ytQuery}
                  onChange={(e) => setYtQuery(e.target.value)}
                  placeholder="ابحث عن اسم الأغنية أو التراك يوتيوب (مثال: حكومه)..."
                  disabled={isYtLoading}
                  className="w-full bg-slate-950 border border-slate-800/80 focus:border-red-500 rounded-xl pl-4 pr-11 py-3.5 text-sm text-slate-200 placeholder-slate-500 outline-none transition-all"
                />
                <Search className="absolute right-4 top-4 w-4 h-4 text-slate-500" />
              </div>
              <button
                type="submit"
                disabled={isYtLoading || !ytQuery.trim()}
                className="bg-red-600 hover:bg-red-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-bold rounded-xl px-6 transition-all border border-red-500/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isYtLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                <span>بحث وجلب</span>
              </button>
            </form>

            <AnimatePresence mode="wait">
              {isYtLoading && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-10 space-y-3"
                >
                  <div className="w-12 h-12 rounded-full border-4 border-red-500/20 border-t-red-500 animate-spin" />
                  <p className="text-sm text-red-300 font-semibold">جاري البحث وتحرير روابط البث المباشر MP3...</p>
                  <p className="text-xs text-slate-500">مقدم من MS API</p>
                </motion.div>
              )}

              {ytError && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-950/20 border border-red-500/20 rounded-xl p-4 flex gap-3 text-red-300"
                >
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-sm">خطأ في الإتمام</span>
                    <p className="text-xs text-red-400/90 mt-1 leading-relaxed">{ytError}</p>
                  </div>
                </motion.div>
              )}

              {ytTrack && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-slate-950/80 border border-slate-800 p-6 rounded-2xl space-y-6 shadow-xl relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-violet-600/5 rounded-full blur-2xl pointer-events-none" />
                  
                  {/* Video Metadata Header */}
                  <div className="flex flex-col sm:flex-row gap-5 items-center">
                    {/* Thumbnail Cover */}
                    <div className="w-28 h-28 rounded-xl border border-slate-800 overflow-hidden shrink-0 relative group">
                      <img 
                        src={ytTrack.cover || ytTrack.thumbnail || "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300"} 
                        alt={ytTrack.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                      />
                      <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Music className="w-8 h-8 text-violet-400 animate-pulse" />
                      </div>
                    </div>

                    {/* Details */}
                    <div className="flex-1 text-center sm:text-right space-y-2.5 w-full">
                      <span className="text-[10px] text-violet-400 font-mono font-bold tracking-wide bg-violet-500/10 px-2.5 py-1 rounded-full border border-violet-500/20">
                        متاح للاستماع والتحميل الفوري
                      </span>
                      <h3 className="text-base sm:text-lg font-black text-slate-100 leading-snug">{ytTrack.title || "تراك يوتيوب صوتي"}</h3>
                      <div className="flex items-center justify-center sm:justify-start gap-4 text-xs font-medium text-slate-500">
                        {ytTrack.duration && <span>المدة: {ytTrack.duration}</span>}
                        <span>•</span>
                        <span className="text-violet-400/80">خادم فائق السرعة جاهز</span>
                      </div>
                    </div>
                  </div>

                  {/* Dual Grid - Preview & Downloader */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 pt-2">
                    
                    {/* Live Preview Player Panel */}
                    <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-4 space-y-3.5">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                        <Play className="w-4 h-4 text-violet-400 fill-violet-400/10" />
                        <span>مشغل البث الفوري (الاستجابة الفورية)</span>
                      </div>
                      <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-slate-800 bg-slate-950">
                        <iframe
                          src={`https://www.youtube-nocookie.com/embed/${ytTrack.videoId}?autoplay=0&rel=0`}
                          title="Instant Listen Preview"
                          className="absolute inset-0 w-full h-full"
                          style={{ border: 'none' }}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    </div>

                    {/* Quality Downloader Panel */}
                    <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between space-y-3.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                          <Download className="w-4 h-4 text-emerald-400" />
                          <span>بوابة سحب وتحميل ملفات MP3 / MP4</span>
                        </div>
                        <span className="text-[10px] text-emerald-400 font-mono">بدون إعلانات</span>
                      </div>

                      {/* Loader Card integration */}
                      <div className="flex-1 min-h-[145px] rounded-lg overflow-hidden border border-slate-800 bg-slate-950/80 flex items-center justify-center">
                        <iframe
                          src={`https://loader.to/api/card/?url=https://www.youtube.com/watch?v=${ytTrack.videoId}&f=mp3&color=8644f5`}
                          title="Universal Download Widget"
                          className="w-full h-full min-h-[145px]"
                          scrolling="no"
                          style={{ border: 'none' }}
                        />
                      </div>

                      <p className="text-[10px] text-slate-500 text-center leading-relaxed">
                        اختر الصيغة المفضلة لديك (MP3 أو جودة الفيديو حتى 1080p) من القائمة المنسدلة في الأعلى ثم اضغط على زر التحميل.
                      </p>
                    </div>

                  </div>

                  <div className="text-[10px] text-slate-500 text-left pt-2 border-t border-slate-900/40 flex justify-between items-center">
                    <span>Developer: MS 🛸</span>
                    <a 
                      href={`https://www.youtube.com/watch?v=${ytTrack.videoId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-400 hover:text-slate-200 transition-colors flex items-center gap-1"
                    >
                      <span>المصدر في يوتيوب</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Movie Tab */}
        {activeTab === 'movie' && (
          <div className="space-y-6">
            <div className="bg-slate-950/40 border border-amber-500/10 p-4 rounded-xl flex items-start gap-3">
              <Film className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-slate-100">محرك بحث وسحب الأفلام المباشر</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  اكتب اسم الفيلم للبحث وعرض الجودات المتوفرة (سحب من Hla Sinma)، ثم قم باختيار الدقة التي تناسبك لتحضير رابط التحميل التلقائي!
                </p>
              </div>
            </div>

            <form onSubmit={handleMovieSearch} className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={movieName}
                  onChange={(e) => setMovieName(e.target.value)}
                  placeholder="اكتب اسم الفيلم العربي أو الأجنبي (مثال: اللمبي)..."
                  disabled={isMovieLoading}
                  className="w-full bg-slate-950 border border-slate-800/80 focus:border-amber-500 rounded-xl pl-4 pr-11 py-3.5 text-sm text-slate-200 placeholder-slate-500 outline-none transition-all"
                />
                <Film className="absolute right-4 top-4 w-4 h-4 text-slate-500" />
              </div>
              <button
                type="submit"
                disabled={isMovieLoading || !movieName.trim()}
                className="bg-amber-600 hover:bg-amber-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-bold rounded-xl px-6 transition-all border border-amber-500/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isMovieLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                <span>ابحث الآن</span>
              </button>
            </form>

            <AnimatePresence mode="wait">
              {isMovieLoading && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-10 space-y-3"
                >
                  <div className="w-12 h-12 rounded-full border-4 border-amber-500/20 border-t-amber-500 animate-spin" />
                  <p className="text-sm text-amber-300 font-semibold">جاري البحث عن جودات الفيلم وروابط السيرفرات المتاحة...</p>
                  <p className="text-xs text-slate-500">V2X_2 Cinema Hub</p>
                </motion.div>
              )}

              {movieError && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-950/20 border border-red-500/20 rounded-xl p-4 flex gap-3 text-red-300"
                >
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-sm">خطأ في جلب الفيلم</span>
                    <p className="text-xs text-red-400 mt-1 leading-relaxed">{movieError}</p>
                  </div>
                </motion.div>
              )}

              {movieResult && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-slate-950/60 border border-slate-800 p-6 rounded-2xl space-y-5 shadow-xl"
                >
                  <div className="flex items-center gap-3">
                    <span className="p-2 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/35">
                      <Clapperboard className="w-6 h-6 animate-pulse" />
                    </span>
                    <div>
                      <h3 className="text-lg font-bold text-slate-100">{movieResult.movie_name}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">تم العثور على جودات متعددة جاهزة للاستخراج المباشر</p>
                    </div>
                  </div>

                  {/* Quality selector */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-300">اختر الجودة المطلوبة:</span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {movieResult.qualities && movieResult.qualities.map((q, idx) => (
                        <button
                          key={idx}
                          disabled={isFetchLinkLoading}
                          onClick={() => handleGetMovieDownloadLink(idx)}
                          className={`p-3 text-center rounded-xl border text-xs font-bold transition-all flex flex-col justify-center items-center gap-1 cursor-pointer ${
                            selectedQualityIdx === idx
                              ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                              : 'bg-slate-900/50 border-slate-800 hover:border-amber-500/30 text-slate-300 hover:text-white'
                          }`}
                        >
                          <Layers className="w-4 h-4 opacity-80" />
                          <span>{q}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Loading Link */}
                  {isFetchLinkLoading && (
                    <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800/80 flex items-center justify-center gap-3">
                      <RefreshCw className="w-4 h-4 animate-spin text-amber-500" />
                      <span className="text-xs text-amber-300">جاري استخراج رابط التحميل السريع للجودة المحددة...</span>
                    </div>
                  )}

                  {/* Direct Download button ready */}
                  {downloadLink && !isFetchLinkLoading && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-green-500/10 border border-green-500/25 p-4 rounded-xl space-y-3"
                    >
                      <div className="flex items-center gap-2 text-green-400">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-xs font-bold">تم تحضير رابط سينما للتحميل وتنزيل الميديا بنجاح!</span>
                      </div>
                      <div className="flex gap-2">
                        <a
                          href={downloadLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 bg-green-600 hover:bg-green-500 border border-green-500/40 text-white font-bold text-xs p-3 rounded-xl transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Download className="w-4 h-4" />
                          تحميل الفيلم مباشرة
                        </a>
                        <a
                          href={downloadLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-3 bg-slate-900 border border-slate-700 text-slate-300 hover:text-white rounded-xl transition-colors hover:bg-slate-800 flex items-center justify-center select-all"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </motion.div>
                  )}

                  <div className="flex justify-between items-center pt-4 border-t border-slate-900 text-[10px] text-slate-500 font-mono">
                    <span>Developer: {movieResult.developer?.name || 'حلم'}</span>
                    <span>Contact: {movieResult.developer?.contact || '@xzc_w'}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Instagram Tab */}
        {activeTab === 'instagram' && (
          <div className="space-y-6">
            <div className="bg-slate-950/40 border border-pink-500/10 p-4 rounded-xl flex items-start gap-3">
              <Instagram className="w-6 h-6 text-pink-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-slate-100">محمل وريلز إنستغرام بجودة عالية</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  ألصق رابط ريلز أو منشور إنستغرام العام (Reels, Posts) لتتولى واجهاتنا البرمجية جلب الفيديوهات والصور بجودة MP4 الأصلية لتخزينها بسهولة.
                </p>
              </div>
            </div>

            <form onSubmit={handleInstagramDL} className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={igUrl}
                  onChange={(e) => setIgUrl(e.target.value)}
                  placeholder="https://www.instagram.com/reel/..."
                  disabled={isIgLoading}
                  className="w-full bg-slate-950 border border-slate-800/80 focus:border-pink-500 rounded-xl pl-4 pr-11 py-3.5 text-sm text-slate-200 placeholder-slate-500 outline-none transition-all"
                />
                <Instagram className="absolute right-4 top-4 w-4 h-4 text-slate-500" />
              </div>
              <button
                type="submit"
                disabled={isIgLoading || !igUrl.trim()}
                className="bg-pink-600 hover:bg-pink-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-bold rounded-xl px-6 transition-all border border-pink-500/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isIgLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                <span>تحميل</span>
              </button>
            </form>

            <AnimatePresence mode="wait">
              {isIgLoading && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-10 space-y-3"
                >
                  <div className="w-12 h-12 rounded-full border-4 border-pink-500/20 border-t-pink-500 animate-spin" />
                  <p className="text-sm text-pink-300 font-semibold">جاري تحرير ريلز إنستغرام واستخراج الفيديو السريع...</p>
                  <p className="text-xs text-slate-500">V2X_2 Instagram Extractor</p>
                </motion.div>
              )}

              {igError && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-950/20 border border-red-500/20 rounded-xl p-4 flex gap-3 text-red-300"
                >
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-sm">خطأ في جلب الانستقرام</span>
                    <p className="text-xs text-red-400 mt-1 leading-relaxed">{igError}</p>
                  </div>
                </motion.div>
              )}

              {igData && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-slate-950/60 border border-slate-800 p-6 rounded-2xl space-y-5 shadow-xl relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-32 h-32 bg-pink-600/5 rounded-full blur-2xl pointer-events-none" />
                  
                  <div className="flex items-center gap-3">
                    <span className="p-2 bg-pink-500/10 text-pink-400 rounded-xl border border-pink-500/35">
                      <Instagram className="w-6 h-6 animate-pulse" />
                    </span>
                    <div>
                      <h3 className="text-md font-bold text-slate-100">{igData.title || "منشور انستقرام المحمل"}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">تم العثور على روابط الوسائط المتعددة مباشرة</p>
                    </div>
                  </div>

                  {/* Single stream option or list layout */}
                  <div className="space-y-4">
                    {/* Media download URLs */}
                    {(igData.download_url || igData.url) && (
                      <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800/80 flex flex-col md:flex-row justify-between items-center gap-3">
                        <span className="text-xs text-slate-300">رابط الفيديو/الريل الرئيسي جاهز</span>
                        <a
                          href={igData.download_url || igData.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs p-2.5 rounded-lg flex items-center gap-1.5 transition-transform hover:scale-102 cursor-pointer w-full md:w-auto justify-center"
                        >
                          <Download className="w-3.5 h-3.5" />
                          تحميل ملف MP4 مباشر
                        </a>
                      </div>
                    )}

                    {/* Array of multi media objects */}
                    {igData.videos && Array.isArray(igData.videos) && igData.videos.map((vid, idx) => (
                      <div key={idx} className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row justify-between items-center gap-3">
                        <span className="text-xs text-slate-300 font-mono">Video Clip #{idx + 1}</span>
                        <a
                          href={vid}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs p-2 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          تحميل مباشر
                        </a>
                      </div>
                    ))}

                    {igData.images && Array.isArray(igData.images) && igData.images.map((img, idx) => (
                      <div key={idx} className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row justify-between items-center gap-3">
                        <div className="flex items-center gap-2">
                          <img src={img} alt="gram" className="w-10 h-10 object-cover rounded border border-slate-700" />
                          <span className="text-xs text-slate-300">صورة #{idx + 1}</span>
                        </div>
                        <a
                          href={img}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs p-2 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          تحميل الصورة
                        </a>
                      </div>
                    ))}
                  </div>

                  <div className="text-[10px] text-slate-500 text-left pt-2 border-t border-slate-900/40">
                    <span>Developer: MS 🛸</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

      </div>
    
    </div>
  );
}
