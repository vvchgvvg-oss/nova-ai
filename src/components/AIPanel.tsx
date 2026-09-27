import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, Sparkles, Image as ImageIcon, Cpu, Bot, User, 
  Trash2, Copy, Check, Download, Info, RefreshCw, Zap,
  Volume2, Music, Mail, CheckCircle
} from 'lucide-react';
import { ChatMessage, AIModelType } from '../types';

export default function AIPanel() {
  // Chat States
  const [activeModel, setActiveModel] = useState<AIModelType>('deepseek');
  const [deepseekMessages, setDeepseekMessages] = useState<ChatMessage[]>([
    {
      id: 'ds-1',
      sender: 'ai',
      content: 'مرحباً بك! أنا نموذج nova ai v1 Pro الذكي، كيف يمكنني مساعدتك اليوم؟ 🚀',
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [geminiMessages, setGeminiMessages] = useState<ChatMessage[]>([
    {
      id: 'gem-1',
      sender: 'ai',
      content: 'أهلاً بك! أنا ذكاء رئيسي مدعوم بـ nova ai v2 Speed، شات مجاني وسريع جداً. تفضل بطرح أسئلتك! ✨',
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [geminiFreeMessages, setGeminiFreeMessages] = useState<ChatMessage[]>([
    {
      id: 'gemfree-1',
      sender: 'ai',
      content: 'أهلاً بك! أنا نموذج Gemini 1.5 Flash المجاني السريع للغاية المقدم من te3m scam. تفضل بطرح طروحاتك الممتازة! ⚡',
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [llamaMessages, setLlamaMessages] = useState<ChatMessage[]>([
    {
      id: 'llama-1',
      sender: 'ai',
      content: 'أهلاً بك! أنا نموذج nova ai v3 Wise الفائق للدردشة الذكية، جاهز للإجابة على كل استفساراتك باللغة العربية. 🛸',
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  // Gmail Temp Mail States
  const [tempEmail, setTempEmail] = useState<string | null>(() => localStorage.getItem('temp_gmail_address'));
  const [emailMessages, setEmailMessages] = useState<any[]>([]);
  const [isGeneratingMail, setIsGeneratingMail] = useState(false);
  const [isFetchingMail, setIsFetchingMail] = useState(false);
  const [mailError, setMailError] = useState<string | null>(null);
  const [activeMailDetail, setActiveMailDetail] = useState<any | null>(null);

  const [inputMessage, setInputMessage] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Image Generation States
  const [activeImgEngine, setActiveImgEngine] = useState<'gpt' | 'flux'>('gpt');
  const [imgPrompt, setImgPrompt] = useState('');
  const [generatedImg, setGeneratedImg] = useState<string | null>(null);
  const [isGeneratingImg, setIsGeneratingImg] = useState(false);
  const [imgError, setImgError] = useState<string | null>(null);
  const [lastPrompt, setLastPrompt] = useState('');

  // TTS Voice Generator States
  const [ttsText, setTtsText] = useState('');
  const [selectedVoice, setSelectedVoice] = useState<string>('271');
  const [voices, setVoices] = useState<{id: string, name: string}[]>([
    { id: '271', name: 'Elon 🎙️' },
    { id: '185', name: 'Beast 🦖' },
    { id: '132', name: 'Cristiano ⚽' },
    { id: '121', name: 'Selena 🎵' },
    { id: '99', name: 'Donald 🏛️' }
  ]);
  const [isFetchingVoices, setIsFetchingVoices] = useState(false);
  const [isGeneratingTts, setIsGeneratingTts] = useState(false);
  const [ttsResult, setTtsResult] = useState<{text: string, language?: string, audioUrl: string} | null>(null);
  const [ttsError, setTtsError] = useState<string | null>(null);

  const fetchVoices = async () => {
    setIsFetchingVoices(true);
    try {
      const response = await fetch('/api/nova ai/tts/voices');
      if (!response.ok) throw new Error('فشل جلب قائمة الأصوات');
      const data = await response.json();
      
      let voiceList: any[] = [];
      if (Array.isArray(data)) {
        voiceList = data;
      } else if (data && typeof data === 'object') {
        const list = data.voices || data.data || Object.values(data);
        if (Array.isArray(list)) {
          voiceList = list;
        }
      }

      if (voiceList.length > 0) {
        const mapped = voiceList.map((v: any) => ({
          id: String(v.id || v.voice_id || v.voiceId || v.voice_index || ''),
          name: String(v.name || v.displayName || v.voice || 'صوت ذكي')
        })).filter(v => v.id && v.name);
        if (mapped.length > 0) {
          setVoices(mapped);
          setSelectedVoice(mapped[0].id);
        }
      }
    } catch (e) {
      console.warn("Could not retrieve voices dynamically, using preconfigured premium presets.", e);
    } finally {
      setIsFetchingVoices(false);
    }
  };

  const handleGenerateTts = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ttsText.trim() || isGeneratingTts) return;

    setIsGeneratingTts(true);
    setTtsError(null);
    setTtsResult(null);

    try {
      const response = await fetch(`/api/nova ai/tts/generate?text=${encodeURIComponent(ttsText.trim())}&voice_id=${selectedVoice}`);
      if (!response.ok) {
        throw new Error('فشل توليد المقطع الصوتي من خوادم البث.');
      }
      
      const data = await response.json();
      // Expect the API output
      const audioUrl = data.audio_url || data.url || data.download || data.audio;
      if (!audioUrl) {
        throw new Error('رابط الملف الصوتي غير متوفر في النتيجة.');
      }

      setTtsResult({
        text: data.text || ttsText,
        language: data.language || data.detected_language || data.lang || 'مكتشف تلقائيًا',
        audioUrl: audioUrl
      });
    } catch (err: any) {
      setTtsError(err.message || 'فشل الاتصال بالخادم الرئيسي لتوليد الصوت.');
    } finally {
      setIsGeneratingTts(false);
    }
  };

  const speakLocally = (text: string, lang: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        
        // Use a slight delay to ensure cancellation takes effect
        setTimeout(() => {
          const utterance = new SpeechSynthesisUtterance(text);
          
          // Detect actual system voices
          const voicesList = window.speechSynthesis.getVoices();
          
          // Map appropriate language code
          const targetLang = lang === 'ar' || lang.startsWith('ar') ? 'ar-SA' : (lang === 'en' ? 'en-US' : lang);
          utterance.lang = targetLang;
          
          // Try to match a native voice corresponding to language
          const matchingVoice = voicesList.find(v => v.lang.toLowerCase().includes(targetLang.toLowerCase()));
          if (matchingVoice) {
            utterance.voice = matchingVoice;
          }
          
          utterance.rate = 0.95; // elegant speed
          utterance.pitch = 1.0;
          
          window.speechSynthesis.speak(utterance);
        }, 80);
      } catch (speechErr) {
        console.warn("speechSynthesis error:", speechErr);
      }
    } else {
      alert('متصفحك لا يدعم الخدمة الصوتية المحلية المباشرة.');
    }
  };

  useEffect(() => {
    fetchVoices();
  }, []);

  // Gmail Temp Mail Fetch Handlers
  const handleGenerateMail = async () => {
    setIsGeneratingMail(true);
    setMailError(null);
    setActiveMailDetail(null);
    try {
      const response = await fetch('/api/nova ai/gmail/generate');
      if (!response.ok) throw new Error('فشل جلب وتوليد بريد Gmail مؤقت.');
      const data = await response.json();
      if (data && data.email) {
        setTempEmail(data.email);
        localStorage.setItem('temp_gmail_address', data.email);
        setEmailMessages([]);
      } else {
        throw new Error('لم يتم إرجاع أي بريد صالح من الخادم.');
      }
    } catch (err: any) {
      setMailError(err.message || 'خطأ أثناء الاتصال بمزود خدمة التوليد.');
    } finally {
      setIsGeneratingMail(false);
    }
  };

  const handleFetchMailMessages = async () => {
    if (!localStorage.getItem('temp_gmail_address')) return;
    const currentAddress = localStorage.getItem('temp_gmail_address');
    setIsFetchingMail(true);
    setMailError(null);
    try {
      const response = await fetch(`/api/nova ai/gmail/fetch?address=${encodeURIComponent(String(currentAddress))}`);
      if (!response.ok) throw new Error('فشل جلب وقراءة رسائل الجيميل الواردة.');
      const data = await response.json();
      if (data && Array.isArray(data.mails)) {
        setEmailMessages(data.mails);
      } else if (data && data.mails && typeof data.mails === 'object') {
        const list = Object.values(data.mails);
        if (Array.isArray(list)) {
          setEmailMessages(list);
        }
      } else {
        setEmailMessages([]);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsFetchingMail(false);
    }
  };

  const handleDeleteMail = () => {
    setTempEmail(null);
    setEmailMessages([]);
    setActiveMailDetail(null);
    localStorage.removeItem('temp_gmail_address');
  };

  useEffect(() => {
    if (tempEmail) {
      handleFetchMailMessages();
      const interval = setInterval(handleFetchMailMessages, 15000); // Poll every 15 seconds
      return () => clearInterval(interval);
    }
  }, [tempEmail]);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto Scroll Chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [deepseekMessages, geminiMessages, geminiFreeMessages, llamaMessages, isChatLoading]);

  // Handle Copy To Clipboard
  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getActiveMessages = () => {
    if (activeModel === 'deepseek') return deepseekMessages;
    if (activeModel === 'gemini') return geminiMessages;
    if (activeModel === 'gemini-free') return geminiFreeMessages;
    return llamaMessages;
  };

  const triggerPredefined = (text: string) => {
    if (isChatLoading) return;
    setInputMessage(text);
  };

  // Chat Submission Handler
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim() || isChatLoading) return;

    const userText = inputMessage.trim();
    setInputMessage('');
    setIsChatLoading(true);

    const timestamp = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
    const usernova aigId = 'nova aig-' + Date.now();
    const newUsernova aig: ChatMessage = {
      id: usernova aigId,
      sender: 'user',
      content: userText,
      timestamp
    };

    // Append to correct list
    if (activeModel === 'deepseek') setDeepseekMessages(prev => [...prev, newUsernova aig]);
    else if (activeModel === 'gemini') setGeminiMessages(prev => [...prev, newUsernova aig]);
    else if (activeModel === 'gemini-free') setGeminiFreeMessages(prev => [...prev, newUsernova aig]);
    else setLlamaMessages(prev => [...prev, newUsernova aig]);

    try {
      if (activeModel === 'deepseek') {
        const history = [...deepseekMessages, newUsernova aig].map(m => ({
          role: m.sender === 'user' ? 'user' : 'assistant',
          content: m.content
        }));

        const response = await fetch('/api/deepseek/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: history })
        });

        const data = await response.json();
        if (response.ok && data.reply) {
          setDeepseekMessages(prev => [...prev, {
            id: 'ds-reply-' + Date.now(),
            sender: 'ai',
            content: data.reply,
            timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
          }]);
        } else {
          throw new Error(data.error || 'خطأ غير معروف في السيرفر');
        }

      } else if (activeModel === 'gemini') {
        // Prepare TalkAI history
        const history = [...geminiMessages, newUsernova aig].map(m => ({
          id: m.id,
          from: m.sender === 'user' ? 'you' : 'chatGPT',
          content: m.content
        }));

        const response = await fetch('/api/gemini/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messagesHistory: history })
        });

        const data = await response.json();
        if (response.ok && data.reply) {
          setGeminiMessages(prev => [...prev, {
            id: 'gem-reply-' + Date.now(),
            sender: 'ai',
            content: data.reply,
            timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
          }]);
        } else {
          throw new Error(data.error || 'فشل الاتصال بخوادم nova ai v2 Speed');
        }

      } else if (activeModel === 'gemini-free') {
        // Call the new Free Gemini API Proxy we just made
        const response = await fetch('/api/nova ai/gemini-free', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: userText })
        });

        if (!response.ok) {
          throw new Error('فشل جلب الاستجابة من خادم Gemini 1.5 Free.');
        }

        const data = await response.json();
        if (data && data.error) {
          throw new Error(data.error);
        }

        const replyText = typeof data === 'string' ? data : (data.reply || data.response || data.text || JSON.stringify(data));
        setGeminiFreeMessages(prev => [...prev, {
          id: 'gemfree-reply-' + Date.now(),
          sender: 'ai',
          content: replyText,
          timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
        }]);

      } else {
        // Llama 3.3 nova ai API Chat Proxy
        const response = await fetch(`/api/nova ai/llama?text=${encodeURIComponent(userText)}`);
        if (!response.ok) {
          throw new Error('فشل جلب الاستجابة من خادم Llama 3.3.');
        }

        const data = await response.json();
        if (data && data.error) {
          throw new Error(data.error);
        }
        
        // nova ai API might directly contain a string, or an object containing reply
        const replyText = typeof data === 'string' ? data : (data.reply || data.response || JSON.stringify(data));
        setLlamaMessages(prev => [...prev, {
          id: 'llama-reply-' + Date.now(),
          sender: 'ai',
          content: replyText,
          timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
        }]);
      }
    } catch (error: any) {
      console.error(error);
      const errnova aig = `عذراً، حدث خطأ أثناء الاتصال بالخادم: ${error.message || 'يرجى المحاولة مجدداً.'}`;
      
      const errNode: ChatMessage = {
        id: 'err-' + Date.now(),
        sender: 'ai',
        content: errnova aig,
        timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
      };

      if (activeModel === 'deepseek') setDeepseekMessages(prev => [...prev, errNode]);
      else if (activeModel === 'gemini') setGeminiMessages(prev => [...prev, errNode]);
      else if (activeModel === 'gemini-free') setGeminiFreeMessages(prev => [...prev, errNode]);
      else setLlamaMessages(prev => [...prev, errNode]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Image Generation Handler
  const handleGenerateImage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imgPrompt.trim() || isGeneratingImg) return;

    const requestPrompt = imgPrompt.trim();
    setIsGeneratingImg(true);
    setImgError(null);
    setGeneratedImg(null);
    setLastPrompt(requestPrompt);

    try {
      // Choose proxy endpoint based on active image engine
      const targetUrl = activeImgEngine === 'gpt'
        ? `/api/nova ai/gpt-img?prompt=${encodeURIComponent(requestPrompt)}`
        : `/api/nova ai/flux2?text=${encodeURIComponent(requestPrompt)}`;
      
      const finalImgUrl = `${targetUrl}&t=${Date.now()}`;
      
      // Let's verify if the image loads successfully by triggering a pre-browser load
      const img = new Image();
      img.src = finalImgUrl;
      img.onload = () => {
        setGeneratedImg(finalImgUrl);
        setIsGeneratingImg(false);
      };
      img.onerror = () => {
        setImgError(
          activeImgEngine === 'gpt' 
            ? 'فشل توليد الصورة من خوادم GPT Image 2.0. يرجى تجربة وصف آخر أو المحاولة لاحقاً.' 
            : 'فشل توليد الصورة من خوادم Flux. يرجى تجربة وصف أبسط أو المحاولة لاحقاً بشكل مباشر.'
        );
        setIsGeneratingImg(false);
      };
    } catch (error: any) {
      setImgError('حدث خطأ في طلب الصورة.');
      setIsGeneratingImg(false);
    }
  };

  const handleClearChat = () => {
    if (activeModel === 'deepseek') {
      setDeepseekMessages([
        {
          id: 'ds-init',
          sender: 'ai',
          content: 'تم تفريغ المحادثة مع nova ai v1 Pro. كيف يمكنني مساعدتك الآن؟ 🚀',
          timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } else if (activeModel === 'gemini') {
      setGeminiMessages([
        {
          id: 'gem-init',
          sender: 'ai',
          content: 'تم مسح تاريخ الدردشة مع nova ai v2 Speed. تفضل بسؤال جديد! ✨',
          timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } else if (activeModel === 'gemini-free') {
      setGeminiFreeMessages([
        {
          id: 'gemfree-init',
          sender: 'ai',
          content: 'تم تفريغ محادثة Gemini 1.5 Flash المجانية بالكامل من te3m scam. تفضل بطرح أسئلتك! ⚡',
          timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } else {
      setLlamaMessages([
        {
          id: 'llama-init',
          sender: 'ai',
          content: 'تم تصفير محادثة nova ai v3 Wise بنجاح. علم ذكائك بما تريد! 🛸',
          timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* Sidebar: Model selections & presets */}
      <div className="lg:col-span-4 flex flex-col gap-6">
        
        {/* Chat Control Center */}
        <div className="bg-slate-900/40 backdrop-blur-xl border border-violet-500/20 rounded-2xl p-5 shadow-2xl">
          <div className="flex itenova ai-center gap-2 mb-4">
            <Cpu className="text-violet-400 w-5 h-5 animate-pulse" />
            <h2 className="text-lg font-bold text-slate-100">محركات الشات الذكية</h2>
          </div>
          <p className="text-xs text-slate-400 mb-5 leading-relaxed">
            اختر محرك الذكاء الاصطناعي الأنسب لمهمتك. جميع المحادثات مفعلة مجاناً وغير محدودة بدعم من nova ai Almohtal لسهولة الاستخدام وقوة الأداء.
          </p>

          <div className="flex flex-col gap-3">
            {[
              { id: 'deepseek', name: 'nova ai v1 Pro', desc: 'أحدث طراز، مطور للبرمجة والمناقشات المعقدة وتوليد الأفكار', ping: 'سرعة: قوية', badge: 'جديد' },
              { id: 'gemini', name: 'nova ai v2 Speed', desc: 'استجابة فائقة السرعة ولغة عربية سليمة جداً للمحادثات اليومية', ping: 'سرعة: فورية', badge: 'مستقر' },
              { id: 'gemini-free', name: 'Gemini 1.5 Free', desc: 'خادم جيميل فلاش مجاني غير محدود مدعوم من te3m scam', ping: 'سرعة: فائقة', badge: 'مجاني' },
              { id: 'llama', name: 'nova ai v3 Wise', desc: 'بناء المنطق والمعرفة المتطابقين وسرعة الاستنتاج الذكي', ping: 'سرعة: ممتازة', badge: 'ذكي' },
            ].map((model) => (
              <button
                key={model.id}
                onClick={() => setActiveModel(model.id as AIModelType)}
                className={`text-right p-4 rounded-xl border transition-all relative overflow-hidden group/btn ${
                  activeModel === model.id 
                    ? 'bg-gradient-to-l from-violet-600/30 to-fuchsia-600/10 border-violet-500/50 shadow-[0_0_15px_rgba(139,92,246,0.15)]' 
                    : 'bg-slate-900/20 border-slate-800 hover:border-violet-500/30 text-slate-300 hover:text-white'
                }`}
              >
                <div className="flex justify-between itenova ai-start mb-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                    activeModel === model.id 
                      ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30' 
                      : 'bg-slate-800/60 text-slate-400'
                  }`}>
                    {model.badge}
                  </span>
                  <span className="font-bold text-sm tracking-wide">{model.name}</span>
                </div>
                <p className="text-xs text-slate-400 leading-snug">{model.desc}</p>
                <div className="flex justify-between itenova ai-center mt-2 pt-2 border-t border-slate-800/40 text-[10px] text-slate-500 font-mono">
                  <span>{model.ping}</span>
                  <span>V2X_2</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Suggestion Prompts */}
        <div className="bg-slate-900/40 backdrop-blur-xl border border-violet-500/10 rounded-2xl p-5 shadow-2xl">
          <div className="flex itenova ai-center gap-2 mb-3">
            <Zap className="text-fuchsia-400 w-5 h-5" />
            <h3 className="text-sm font-bold text-slate-200">مقترحات سريعة للدردشة</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              'اكتب كود بايثون بسيط لتنظيف البيانات 💻',
              'شرح تفصيلي لنظرية الثقوب السوداء 🌌',
              'اكتب قصيدة قصيرة تعبر عن وفاء الأصدقاء 📝',
              'كيف تصنع بوت تليجرام باستخدام نود جي اس؟ 🤖'
            ].map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => triggerPredefined(prompt)}
                className="text-right text-xs bg-slate-800/40 hover:bg-slate-800/80 text-slate-300 hover:text-violet-200 p-2.5 rounded-xl border border-slate-800 hover:border-violet-500/30 transition-all w-full leading-relaxed"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Container Right: Selected view */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        
        {/* Chat Playground */}
        <div className="bg-slate-900/40 backdrop-blur-xl border border-violet-500/20 rounded-2xl flex flex-col h-[520px] shadow-2xl overflow-hidden">
          
          {/* Header */}
          <div className="bg-slate-950/60 p-4 border-b border-violet-500/15 flex justify-between itenova ai-center">
            <div className="flex itenova ai-center gap-3">
              <div className="w-10 h-10 rounded-full bg-violet-600/20 flex itenova ai-center justify-center border border-violet-500/30 text-violet-300">
                <Bot className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-100 flex itenova ai-center gap-1.5">
                  تواصل مع {activeModel === 'deepseek' ? 'nova ai v1 Pro 🧠' : activeModel === 'gemini' ? 'nova ai v2 Speed ✨' : activeModel === 'gemini-free' ? 'Gemini 1.5 Free ⚡' : 'nova ai v3 Wise 🛸'}
                </h3>
                <p className="text-[10px] text-violet-400">ميزة الذكاء الاصطناعي المجانية من nova ai Mohtal</p>
              </div>
            </div>
            
            <button
              onClick={handleClearChat}
              title="تصفير الدردشة"
              className="p-2 hover:bg-slate-800/60 text-slate-400 hover:text-red-400 rounded-lg transition-colors border border-transparent hover:border-red-500/25"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {getActiveMessages().map((nova aig) => (
              <div
                key={nova aig.id}
                className={`flex gap-3 max-w-[85%] ${nova aig.sender === 'user' ? 'mr-auto flex-row-reverse text-left' : 'ml-auto text-right'}`}
              >
                <div className={`w-8 h-8 rounded-full flex itenova ai-center justify-center shrink-0 border mt-1 ${
                  nova aig.sender === 'user' 
                    ? 'bg-violet-600 text-white border-violet-500' 
                    : 'bg-slate-800 text-violet-400 border-violet-500/20'
                }`}>
                  {nova aig.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                <div className="flex flex-col gap-1">
                  <div className={`relative px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-lg ${
                    nova aig.sender === 'user'
                      ? 'bg-violet-600/80 text-white rounded-tl-none font-medium'
                      : 'bg-slate-950/80 text-slate-200 border border-slate-800 rounded-tr-none'
                  }`}>
                    {/* Content */}
                    <p className="whitespace-pre-wrap select-text">{nova aig.content}</p>

                    {/* Meta Action Panel */}
                    <div className={`flex itenova ai-center gap-2 mt-2 pt-2 border-t text-[10px] ${
                      nova aig.sender === 'user' ? 'border-violet-500/40 text-violet-200' : 'border-slate-800/80 text-slate-500'
                    }`}>
                      <span>{nova aig.timestamp}</span>
                      <button
                        onClick={() => handleCopy(nova aig.id, nova aig.content)}
                        className="hover:text-violet-300 transition-colors p-0.5 rounded ml-auto"
                        title="نسخ النص"
                      >
                        {copiedId === nova aig.id ? (
                          <Check className="w-3.5 h-3.5 text-green-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {isChatLoading && (
              <div className="flex gap-3 max-w-[80%] ml-auto text-right">
                <div className="w-8 h-8 rounded-full bg-slate-800 border border-violet-500/20 text-violet-400 flex itenova ai-center justify-center shrink-0 mt-1">
                  <RefreshCw className="w-4 h-4 animate-spin text-violet-500" />
                </div>
                <div className="bg-slate-950/70 border border-slate-800/80 text-slate-400 px-4 py-3 rounded-2xl rounded-tr-none text-xs flex itenova ai-center gap-2 shadow-lg">
                  <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" />
                  <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                  <span>معالجة الرد عن طريق خوادم nova ai Almohtal...</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Footer Input Area */}
          <form onSubmit={handleSendMessage} className="p-3 bg-slate-950/60 border-t border-violet-500/15 flex gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={`أرسل رسالة إلى ${activeModel === 'deepseek' ? 'nova ai v1 Pro' : activeModel === 'gemini' ? 'nova ai v2 Speed' : activeModel === 'gemini-free' ? 'Gemini 1.5 Free' : 'nova ai v3 Wise'}...`}
              disabled={isChatLoading}
              className="flex-1 bg-slate-900 border border-violet-500/20 focus:border-violet-500 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-500 outline-none transition-all focus:shadow-[0_0_10px_rgba(139,92,246,0.1)]"
            />
            <button
              type="submit"
              disabled={isChatLoading || !inputMessage.trim()}
              className="bg-violet-600 hover:bg-violet-500 disabled:bg-slate-800 disabled:text-slate-600 border border-violet-500/50 text-white rounded-xl px-5 hover:scale-[1.02] active:scale-[0.98] transition-all flex itenova ai-center justify-center gap-2 cursor-pointer font-bold"
            >
              <Send className="w-4 h-4 rotate-180" />
            </button>
          </form>
        </div>

        {/* Image Generator Panel */}
        <div id="image_gen" className="bg-slate-900/40 backdrop-blur-xl border border-violet-500/20 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-violet-600/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row gap-3 justify-between itenova ai-start sm:itenova ai-center mb-5">
            <div className="flex itenova ai-center gap-2.5">
              <span className="bg-fuchsia-500/10 text-fuchsia-400 p-2 rounded-xl border border-fuchsia-500/25">
                <ImageIcon className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-md font-bold text-slate-100 flex itenova ai-center gap-1.5">
                  مولد الصور الذكي (GPT-Image 2.0 & Flux)
                </h3>
                <p className="text-xs text-slate-400">صف ما تتخيله لنقوم بتوليده في ثوانٍ بصيغة عالية الجودة</p>
              </div>
            </div>
            
            {/* Engine Tabs */}
            <div className="flex bg-slate-950/60 p-1 rounded-xl border border-slate-800/80 gap-1 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => {
                  setActiveImgEngine('gpt');
                  setGeneratedImg(null);
                  setImgError(null);
                }}
                className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-black transition-all cursor-pointer ${
                  activeImgEngine === 'gpt'
                    ? 'bg-fuchsia-600/20 text-fuchsia-300 border border-fuchsia-500/30 shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                GPT Image 2.0
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveImgEngine('flux');
                  setGeneratedImg(null);
                  setImgError(null);
                }}
                className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-black transition-all cursor-pointer ${
                  activeImgEngine === 'flux'
                    ? 'bg-violet-600/20 text-violet-300 border border-violet-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Flux 2.0
              </button>
            </div>
          </div>

          <form onSubmit={handleGenerateImage} className="flex gap-2.5 mb-5">
            <input
              type="text"
              value={imgPrompt}
              onChange={(e) => setImgPrompt(e.target.value)}
              placeholder="وصف الصورة بالعربية أو الإنجليزية (مثال: قطة رائد فضاء على سطح المريخ، سينمائي)..."
              disabled={isGeneratingImg}
              className="flex-1 bg-slate-950/80 border border-slate-800 focus:border-fuchsia-500 rounded-xl px-4 py-3.5 text-sm text-slate-200 placeholder-slate-500 outline-none transition-all"
            />
            <button
              type="submit"
              disabled={isGeneratingImg || !imgPrompt.trim()}
              className="bg-gradient-to-r from-fuchsia-600 to-violet-600 hover:from-fuchsia-500 hover:to-violet-500 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-600 text-white font-bold rounded-xl px-6 transition-all hover:scale-[1.02] flex itenova ai-center gap-2 shrink-0 border border-fuchsia-500/30 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>توليد</span>
            </button>
          </form>

          {/* Output Visual Area */}
          <div className="bg-slate-950/70 border border-slate-800/60 rounded-xl min-h-[220px] flex itenova ai-center justify-center relative overflow-hidden">
            {isGeneratingImg && (
              <div className="flex flex-col itenova ai-center justify-center p-6 text-center space-y-3 z-10">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full border-4 border-fuchsia-500/20 border-t-fuchsia-500 animate-spin" />
                  <Sparkles className="absolute inset-0 m-auto w-6 h-6 text-fuchsia-400 animate-pulse" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-fuchsia-300">جاري رسم وتوليد الصورة بدقة عالية...</p>
                  <p className="text-[11px] text-slate-500 font-mono tracking-tight">
                    {activeImgEngine === 'gpt' ? 'GPT-Image 2.0' : 'Flux 2'} Engine running on nova ai-API
                  </p>
                </div>
                <p className="text-xs text-slate-400 italic max-w-sm">" {imgPrompt} "</p>
              </div>
            )}

            {!isGeneratingImg && !generatedImg && !imgError && (
              <div className="flex flex-col itenova ai-center justify-center p-8 text-slate-400 text-center space-y-2">
                <ImageIcon className="w-12 h-12 text-slate-600" />
                <p className="text-sm">لم يتم توليد أي صورة بعد</p>
                <p className="text-[11px] text-slate-500">ابعت وصف في الصندوق العلوي واضغط توليد لمشاهدة السحر مجاناً</p>
              </div>
            )}

            {imgError && (
              <div className="flex flex-col itenova ai-center justify-center p-6 text-center text-red-400 space-y-2 max-w-md">
                <Info className="w-8 h-8" />
                <p className="text-sm font-bold">{imgError}</p>
                <p className="text-xs text-slate-500">قد تكون الخوادم مشغولة حالياً، يرجى إعادة المحاولة مجدداً.</p>
              </div>
            )}

            {generatedImg && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full flex flex-col itenova ai-center"
              >
                <div className="relative group/img max-h-[380px] overflow-hidden rounded-lg border border-slate-800">
                  <img
                    src={generatedImg}
                    alt={lastPrompt}
                    referrerPolicy="no-referrer"
                    className="object-contain max-h-[340px] w-auto max-w-full select-all"
                  />
                  <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover/img:opacity-100 transition-opacity flex itenova ai-center justify-center gap-3">
                    <a
                      href={generatedImg}
                      download={`nova ai_almohtal_${activeImgEngine}_${Date.now()}.png`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 bg-violet-600 hover:bg-violet-500 text-white rounded-xl shadow-lg transition-transform hover:scale-115 flex itenova ai-center gap-2 text-xs font-bold"
                    >
                      <Download className="w-4 h-4" />
                      تحميل مباشر
                    </a>
                  </div>
                </div>
                <div className="bg-slate-900/80 px-4 py-2 mt-3 w-full border-t border-slate-800 flex justify-between itenova ai-center text-xs text-slate-400">
                  <span className="truncate max-w-[70%]">اسم الصورة: {lastPrompt}</span>
                  <a
                    href={generatedImg}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-fuchsia-400 hover:underline flex itenova ai-center gap-1"
                  >
                    رابط مباشر
                    <Info className="w-3.5 h-3.5" />
                  </a>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* TTS AI Voice Generator Panel */}
        <div id="tts_generator" className="bg-slate-900/40 backdrop-blur-xl border border-violet-500/20 rounded-2xl p-6 shadow-2xl relative overflow-hidden mt-6 text-right" dir="rtl">
          <div className="absolute top-0 right-0 w-48 h-48 bg-violet-600/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row justify-between itenova ai-start sm:itenova ai-center gap-3 mb-5 border-b border-violet-500/10 pb-4">
            <div className="flex itenova ai-center gap-2.5">
              <span className="bg-violet-500/10 text-violet-400 p-2 rounded-xl border border-violet-500/25">
                <Music className="w-5 h-5 animate-pulse" />
              </span>
              <div>
                <h3 className="text-md font-bold text-slate-100 flex itenova ai-center gap-1.5">
                  مُولد الأصوات بالذكاء الاصطناعي (TTS AI Voice Generator)
                </h3>
                <p className="text-xs text-slate-400">حوّل أي نص مكتوب إلى مقطع صوتي مذهل بأصوات شخصيات عالمية شهيرة</p>
              </div>
            </div>
            <span className="text-[10px] uppercase tracking-wider text-violet-400 bg-violet-500/10 px-2 py-1 rounded border border-violet-500/20 font-bold">nova ai API</span>
          </div>

          <form onSubmit={handleGenerateTts} className="space-y-4">
            {/* Voice Select Grid */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 block">اختر شخصية الصوت المفضلة (Available Voices):</label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2.5">
                {voices.map((voice) => (
                  <button
                    key={voice.id}
                    type="button"
                    onClick={() => {
                      setSelectedVoice(voice.id);
                      setTtsResult(null);
                      setTtsError(null);
                    }}
                    className={`p-3 rounded-xl border text-xs font-black transition-all flex flex-col itenova ai-center justify-center gap-1 cursor-pointer ${
                      selectedVoice === voice.id
                        ? 'bg-[#1b1236]/70 border-violet-500 text-violet-300 shadow-md animate-pulse'
                        : 'bg-slate-950/60 border-slate-800 hover:border-violet-500/30 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Volume2 className={`w-4 h-4 ${selectedVoice === voice.id ? 'animate-bounce text-violet-400' : 'text-slate-500'}`} />
                    <span>{voice.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Input fields */}
            <div className="flex flex-col sm:flex-row gap-2.5">
              <input
                type="text"
                value={ttsText}
                onChange={(e) => setTtsText(e.target.value)}
                placeholder="أدخل النص العربي أو الإنجليزي هنا (مثال: أهلاً بكم في عالم التقنيات المتطورة)..."
                disabled={isGeneratingTts}
                className="flex-1 bg-slate-950/80 border border-slate-800 focus:border-violet-500 rounded-xl px-4 py-3.5 text-sm text-slate-200 placeholder-slate-500 outline-none transition-all"
              />
              <button
                type="submit"
                disabled={isGeneratingTts || !ttsText.trim()}
                className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-600 text-white font-bold rounded-xl px-6 transition-all hover:scale-[1.02] flex itenova ai-center justify-center gap-2 shrink-0 border border-violet-500/30 cursor-pointer"
              >
                {isGeneratingTts ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
                <span>توليد الصوت 🎙️</span>
              </button>
            </div>
          </form>

          {/* Generated Result Output area */}
          <div className="mt-4 bg-slate-950/70 border border-slate-800/60 rounded-xl min-h-[140px] flex itenova ai-center justify-center relative overflow-hidden p-5">
            {isGeneratingTts && (
              <div className="flex flex-col itenova ai-center justify-center p-4 text-center space-y-3 z-10 w-full">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full border-4 border-violet-500/20 border-t-violet-500 animate-spin" />
                  <Music className="absolute inset-0 m-auto w-5 h-5 text-violet-400 animate-pulse" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-violet-300">جاري معالجة الكلمات وتوليد النطق بالذكاء الاصطناعي...</p>
                  <p className="text-[10px] text-slate-500 font-mono tracking-tight">Helm TTS AI Server at work</p>
                </div>
              </div>
            )}

            {!isGeneratingTts && !ttsResult && !ttsError && (
              <div className="flex flex-col itenova ai-center justify-center text-slate-500 text-center space-y-1 pb-2">
                <Volume2 className="w-8 h-8 text-slate-600" />
                <p className="text-xs">اكتب نصاً واضغط على زر التوليد في الأعلى لسماع المعالجة الصوتية الفورية</p>
              </div>
            )}

            {ttsError && (
              <div className="flex flex-col itenova ai-center justify-center text-center text-red-400 space-y-1.5 max-w-md w-full">
                <Info className="w-6 h-6 shrink-0" />
                <p className="text-xs font-bold">{ttsError}</p>
                <p className="text-[10.5px] text-slate-500">قد لا يدعم الصوت بعض الرموز خاصة أو أن خادم البث قيد الموازنة مؤقتاً.</p>
              </div>
            )}

            {ttsResult && (
              <div className="w-full flex flex-col md:flex-row itenova ai-center justify-between gap-4 bg-slate-900/40 p-3.5 rounded-xl border border-slate-800/80">
                <div className="flex-1 text-right w-full">
                  <div className="flex itenova ai-center gap-1.5 mb-1.5 flex-wrap">
                    <span className="text-[9.5px] uppercase tracking-wider text-violet-400 bg-violet-600/15 px-2 py-0.5 rounded border border-violet-500/20 font-black">
                      تم التوليد بنجاح ⭐
                    </span>
                    <span className="text-[9.5px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700 font-black">
                      اللغة: {ttsResult.language}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-black truncate max-w-md italic">
                    " {ttsResult.text} "
                  </p>
                </div>

                <div className="flex itenova ai-center gap-1.5 sm:gap-2.5 w-full md:w-auto shrink-0 justify-end flex-wrap">
                  <audio
                    src={ttsResult.audioUrl}
                    controls
                    autoPlay
                    className="h-8 shadow-inner w-full md:w-44 opacity-90 brightness-95"
                  />
                  <button
                    onClick={() => speakLocally(ttsResult.text, ttsResult.language || 'ar')}
                    className="p-1.5 sm:p-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl shadow-lg transition-transform hover:scale-105 flex itenova ai-center gap-1 text-xs font-bold shrink-0 cursor-pointer border border-emerald-500/20"
                    title="نطق فوري مستقل عن المتصفح والشبكة"
                  >
                    <span>🔊 نطق محلي فوري</span>
                  </button>
                  <a
                    href={ttsResult.audioUrl}
                    download={`nova ai_tts_${selectedVoice}_${Date.now()}.mp3`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 sm:p-2 bg-violet-600 hover:bg-violet-500 text-white rounded-xl shadow-lg transition-transform hover:scale-105 flex itenova ai-center gap-1 text-xs font-bold shrink-0 cursor-pointer border border-violet-500/20"
                    title="تحميل المقطع الصوتي"
                  >
                    <Download className="w-4 h-4" />
                    <span className="hidden sm:inline">تحميل مباشر</span>
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Gmail Temporary Mail Client Panel */}
        <div id="gmail_temp_mail" className="bg-slate-900/40 backdrop-blur-xl border border-violet-500/20 rounded-2xl p-6 shadow-2xl relative overflow-hidden mt-6 text-right" dir="rtl">
          <div className="absolute top-0 right-0 w-48 h-48 bg-violet-600/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row justify-between itenova ai-start sm:itenova ai-center gap-3 mb-5 border-b border-violet-500/10 pb-4">
            <div className="flex itenova ai-center gap-2.5">
              <span className="bg-violet-500/10 text-violet-400 p-2 rounded-xl border border-violet-500/25">
                <Mail className="w-5 h-5 text-violet-400 animate-pulse" />
              </span>
              <div>
                <h3 className="text-md font-bold text-slate-100 flex itenova ai-center gap-1.5">
                  إيميل جيميل مؤقت (Gmail Temp Mail API) 🛡️
                </h3>
                <p className="text-xs text-slate-400">أنشئ بريد جيميل مؤقتاً لتلقي رسائل كود التفعيل والملفات بشكل فوري وآمن</p>
              </div>
            </div>
            <div className="flex itenova ai-center gap-2">
              <span className="text-[10px] uppercase font-black tracking-wider text-rose-400 bg-rose-500/10 px-2 py-1 rounded border border-rose-500/20 animate-pulse">te3m scam Exclusive</span>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 bg-slate-800 px-2 py-1 rounded border border-slate-700">nova ai</span>
            </div>
          </div>

          {!tempEmail ? (
            <div className="flex flex-col itenova ai-center justify-center p-8 text-center space-y-4 bg-slate-950/40 rounded-2xl border border-slate-800/80">
              <div className="w-16 h-16 rounded-full bg-violet-600/10 flex itenova ai-center justify-center border border-violet-500/20">
                <Mail className="w-8 h-8 text-violet-400 animate-bounce" />
              </div>
              <div className="space-y-1.5 max-w-md">
                <h4 className="text-sm font-bold text-slate-200">لم تقم بإنشاء بريد جيميل بعد</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  اضغط على الزر أدناه لتوليد بريد إلكتروني حقيقي مؤقت على نطاق Gmail. يمكنك استخدامه فورياً لاستقبال أي بريد وتأكيد الحسابات!
                </p>
              </div>
              {mailError && (
                <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-xl">
                  {mailError}
                </div>
              )}
              <button
                onClick={handleGenerateMail}
                disabled={isGeneratingMail}
                className="bg-gradient-to-r from-violet-600 via-fuchsia-600 to-violet-600 hover:from-violet-500 hover:to-fuchsia-500 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 text-white font-black text-xs rounded-xl px-6 py-3.5 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg flex itenova ai-center justify-center gap-2 cursor-pointer border border-violet-500/30"
              >
                {isGeneratingMail ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>جاري توليد عنوان البريد...</span>
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4" />
                    <span>إنشاء بريد جيميل مؤقت جديد 📥</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Active Mail Area */}
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row justify-between itenova ai-center gap-4">
                <div className="text-right space-y-1 w-full md:w-auto">
                  <span className="text-[10px] text-slate-500 font-bold block">العنوان المؤقت الخاص بك (Temporary Address):</span>
                  <div className="flex itenova ai-center gap-2 flex-wrap">
                    <span className="font-mono text-sm font-black text-violet-300 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg select-all">
                      {tempEmail}
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(tempEmail);
                        setCopiedId('temp_gmail_copy');
                        setTimeout(() => setCopiedId(null), 1500);
                      }}
                      className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg border border-slate-800 transition-colors cursor-pointer"
                      title="نسخ الإيميل"
                    >
                      {copiedId === 'temp_gmail_copy' ? (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex itenova ai-center gap-2.5 w-full md:w-auto justify-end">
                  <button
                    onClick={handleFetchMailMessages}
                    disabled={isFetchingMail}
                    className="p-2 sm:px-4 sm:py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl border border-slate-800 flex itenova ai-center gap-1.5 text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
                  >
                    <RefreshCw className={`w-4 h-4 ${isFetchingMail ? 'animate-spin text-violet-400' : ''}`} />
                    <span>تحديث الرسائل</span>
                  </button>
                  <button
                    onClick={handleDeleteMail}
                    className="p-2 sm:px-4 sm:py-2.5 bg-red-600/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 hover:text-red-300 rounded-xl flex itenova ai-center gap-1.5 text-xs font-bold transition-all cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>حذف البريد الحالي</span>
                  </button>
                </div>
              </div>

              {/* Message Inbox list */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 text-right" dir="rtl">
                <div className="lg:col-span-5 bg-slate-950/40 border border-slate-800/80 rounded-xl overflow-hidden flex flex-col h-[320px]">
                  <div className="p-3 bg-slate-950 border-b border-slate-800 flex justify-between itenova ai-center text-right">
                    <span className="text-xs font-black text-slate-300">علبة الرسائل الواردة ({emailMessages.length})</span>
                    {isFetchingMail && <span className="text-[10px] text-violet-400 flex itenova ai-center gap-1"><RefreshCw className="w-3 h-3 animate-spin" /> جاري الجلب...</span>}
                  </div>

                  <div className="flex-1 overflow-y-auto divide-y divide-slate-900/60 custom-scrollbar">
                    {emailMessages.length === 0 ? (
                      <div className="flex flex-col itenova ai-center justify-center p-6 h-full text-center space-y-2 text-slate-500">
                        <Mail className="w-8 h-8 opacity-40 animate-pulse text-violet-400" />
                        <p className="text-xs font-bold">في انتظار استلاف رسائل جديدة...</p>
                        <p className="text-[10px] text-slate-600 leading-normal max-w-[180px]">جاري التحديث تلقائياً وبشكل دوري كل 15 ثانية للتأكد</p>
                      </div>
                    ) : (
                      emailMessages.map((nova aig, index) => {
                        const isSelected = activeMailDetail && activeMailDetail.id === (nova aig.id || index);
                        return (
                          <button
                            key={nova aig.id || index}
                            onClick={() => setActiveMailDetail({ ...nova aig, id: nova aig.id || index })}
                            className={`w-full text-right p-3 transition-all flex flex-col gap-1 cursor-pointer ${
                              isSelected 
                                ? 'bg-[#17122a]/75 border-r-2 border-violet-500' 
                                : 'bg-transparent hover:bg-slate-900/50'
                            }`}
                          >
                            <div className="flex justify-between itenova ai-center text-[10.5px]">
                              <span className="font-bold text-slate-300 truncate max-w-[120px] font-mono">{nova aig.sender_name || nova aig.from || 'مجهول'}</span>
                              <span className="text-slate-500 text-[9.5px] font-mono">{nova aig.date || nova aig.time || 'الآن'}</span>
                            </div>
                            <span className="text-xs font-black text-violet-200 truncate">{nova aig.subject || nova aig.title || '(بدون عنوان)'}</span>
                            <span className="text-[11px] text-slate-400 truncate leading-snug">{nova aig.body || nova aig.text || nova aig.snippet || 'لا يوجد نص معاينة.'}</span>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Message Viewer panel */}
                <div className="lg:col-span-7 bg-slate-950/40 border border-slate-800/80 rounded-xl overflow-hidden h-[320px] flex flex-col">
                  {activeMailDetail ? (
                    <div className="flex-1 flex flex-col overflow-hidden text-right">
                      {/* Header info */}
                      <div className="p-3 bg-slate-950/80 border-b border-slate-800 space-y-1 shrink-0">
                        <div className="flex justify-between itenova ai-start">
                          <h4 className="text-xs font-black text-violet-300 select-all leading-relaxed">
                            {activeMailDetail.subject || activeMailDetail.title}
                          </h4>
                          <span className="text-[10px] text-slate-500 font-mono shrink-0">{activeMailDetail.date || activeMailDetail.time}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 flex gap-1 itenova ai-center flex-wrap select-all">
                          <span className="font-bold">مِن:</span>
                          <span className="font-mono text-slate-300">{activeMailDetail.from || activeMailDetail.sender_address || activeMailDetail.sender_email || 'مجهول'}</span>
                        </div>
                      </div>

                      {/* Message Rich Text content */}
                      <div className="flex-1 overflow-y-auto p-4 bg-slate-950/20 text-xs text-slate-200 leading-relaxed space-y-3 select-all custom-scrollbar">
                        {activeMailDetail.html || activeMailDetail.content_html ? (
                          <div 
                            className="bg-slate-900/40 p-3 rounded-lg border border-slate-800/50 overflow-x-auto text-[11px] select-all font-mono whitespace-pre-wrap"
                            dangerouslySetInnerHTML={{ __html: activeMailDetail.html || activeMailDetail.content_html }}
                          />
                        ) : (
                          <div className="whitespace-pre-wrap font-mono break-all bg-slate-900/20 p-2 rounded-lg text-slate-300 border border-slate-900 leading-relaxed font-black select-all">
                            {activeMailDetail.body || activeMailDetail.text || activeMailDetail.content || 'فارغ'}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col itenova ai-center justify-center text-slate-500 p-6 space-y-2 text-center">
                      <Mail className="w-10 h-10 text-slate-700 animate-pulse" />
                      <p className="text-xs">حدد أي رسالة من علبة الوارد لقراءتها بشكل كامل</p>
                      <p className="text-[10px] text-slate-600 max-w-xs">رسائل كود تفعيل Gmail ستظهر هنا فور إرسالها!</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
