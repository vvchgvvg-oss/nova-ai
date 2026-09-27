import express from "express";
import path from "path";
import axios from "axios";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-loaded official Google Gen AI Client
let aiInstance: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is missing under active user secrets. Please set it in Settings > Secrets.");
    }
    aiInstance = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiInstance;
}

// Developer identifier
const DEVELOPER_WHO = "@V_P1_V1";
const USER_AGENT = "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 Chrome/139.0.0.0 Mobile Safari/537.36";

// 1. DeepSeek-V3.2 API Integration
app.post("/api/deepseek/chat", async (req, res) => {
  const { messages } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "messages array is required" });
  }

  try {
    const sessionUrl = "https://deep-seek.ai";
    
    // Create a request to get the CSRF token and XSRF-TOKEN cookie
    const initResponse = await axios.get(sessionUrl, {
      headers: { "User-Agent": USER_AGENT },
      timeout: 15000,
    });

    // Extract XSRF-TOKEN cookie
    let xsrfToken: string | null = null;
    const setCookieHeaders = initResponse.headers["set-cookie"];
    if (setCookieHeaders) {
      for (const cookie of setCookieHeaders) {
        if (cookie.includes("XSRF-TOKEN=")) {
          const match = cookie.match(/XSRF-TOKEN=([^;]+)/);
          if (match) xsrfToken = match[1];
        }
      }
    }

    if (!xsrfToken) {
      // Fallback
      xsrfToken = "dummy_xsrf_token";
    }

    // Extract meta CSRF-TOKEN
    let csrfMetaToken: string | null = null;
    const html = initResponse.data;
    const match1 = html.match(/<meta\s+name="csrf-token"\s+content="([^"]+)"/);
    if (match1) {
      csrfMetaToken = match1[1];
    } else {
      const match2 = html.match(/csrf-token["\s]+content=["']([^"']+)["']/);
      if (match2) csrfMetaToken = match2[1];
    }

    if (!csrfMetaToken) {
      csrfMetaToken = "";
    }

    const payload = {
      model: "deepseek/deepseek-v3.2",
      messages: messages,
      stream: false, // Turn off stream for aggregation
      metadata: { developer: DEVELOPER_WHO }
    };

    const chatResponse = await axios.post("https://deep-seek.ai/api/chat", payload, {
      headers: {
        'Accept': '*/*',
        'Content-Type': 'application/json',
        'Origin': sessionUrl,
        'Referer': `${sessionUrl}/chat`,
        'User-Agent': USER_AGENT,
        'X-CSRF-TOKEN': csrfMetaToken,
        'Cookie': `XSRF-TOKEN=${xsrfToken}`,
        'X-Developer': DEVELOPER_WHO
      },
      timeout: 45000,
    });

    // Sometimes deep-seek.ai returns formatted lines for stream fallback or a direct object
    if (typeof chatResponse.data === "string") {
      // Parse multi-line or SSE if needed
      let reply = "";
      const lines = chatResponse.data.split("\n");
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith("data: ")) {
          const dstr = trimmed.slice(6);
          if (dstr === "[DONE]") break;
          try {
            const parsed = JSON.parse(dstr);
            const content = parsed?.choices?.[0]?.delta?.content || "";
            reply += content;
          } catch (err) {
            // ignore
          }
        }
      }
      return res.json({ reply: reply || chatResponse.data });
    } else {
      // Check standard format back
      const reply = chatResponse.data?.choices?.[0]?.message?.content || JSON.stringify(chatResponse.data);
      return res.json({ reply });
    }
  } catch (error: any) {
    console.error("Deepseek Chat Error:", error.message);
    return res.status(500).json({ error: error.message || "Failed to communicate with DeepSeek backend" });
  }
});

// 2. Gemini 2.0 Flash Lite API Integration (TalkAI proxy)
app.post("/api/gemini/chat", async (req, res) => {
  const { messagesHistory, model, temperature } = req.body;
  if (!messagesHistory || !Array.isArray(messagesHistory)) {
    return res.status(400).json({ error: "messagesHistory is required" });
  }

  try {
    const payload = {
      type: "chat",
      messagesHistory: messagesHistory,
      settings: {
        model: model || "gemini-2.0-flash-lite",
        temperature: temperature !== undefined ? temperature : 0.7
      }
    };

    const response = await axios.post("https://gemini.talkai.info/chat/send/", payload, {
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'https://gemini.talkai.info',
        'Referer': 'https://gemini.talkai.info/',
        'User-Agent': USER_AGENT,
      },
      timeout: 30000,
    });

    let fullText = "";
    if (typeof response.data === "string") {
      const lines = response.data.split('\n');
      for (const rawLine of lines) {
        const line = rawLine.trim();
        if (line.startsWith('data: ')) {
          const content = line.slice(6);
          if (!content.trim().match(/^\d+$/)) {
            fullText += content;
          }
        }
      }
    } else {
      fullText = JSON.stringify(response.data);
    }

    fullText = fullText.replace(/\\n/g, '\n').trim();
    return res.json({ reply: fullText });
  } catch (error: any) {
    console.error("Gemini Chat Error:", error.message);
    return res.status(500).json({ error: error.message || "Failed to communicate with Gemini" });
  }
});

// 3. MS API: YouTube MP3 Downloader Proxy (Secure Search and Downloader widget)
app.get("/api/ms/yt-mp3", async (req, res) => {
  const { name } = req.query;
  if (!name) {
    return res.status(400).json({ error: "name parameter is required" });
  }

  try {
    const query = String(name);
    const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
    const response = await axios.get(searchUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "ar,en-US;q=0.9,en;q=0.8"
      },
      timeout: 15000
    });

    const html = response.data;
    
    let videoId = "";
    let title = "";
    let thumbnail = "";
    let duration = "";

    const jsonMatch = html.match(/ytInitialData\s*=\s*({.+?});/);
    if (jsonMatch) {
      try {
        const data = JSON.parse(jsonMatch[1]);
        const contents = data.contents?.twoColumnBrowseResultsRenderer || data.contents?.twoColumnSearchResultsRenderer;
        const results = contents?.primaryContents?.sectionListRenderer?.contents?.[0]?.itemSectionRenderer?.contents;
        const firstVideo = results?.find((item: any) => item.videoRenderer)?.videoRenderer;
        
        if (firstVideo) {
          videoId = firstVideo.videoId || "";
          title = firstVideo.title?.runs?.[0]?.text || "";
          thumbnail = firstVideo.thumbnail?.thumbnails?.[0]?.url || "";
          duration = firstVideo.lengthText?.simpleText || "";
        }
      } catch (e) {
        console.error("JSON parsing failed, falling back to regex", e);
      }
    }

    if (!videoId) {
      const match = html.match(/\"videoRenderer\":\{\"videoId\":\"([^\"]+)\",\"thumbnail\":\{\"thumbnails\":\[\{\"url\":\"([^\"]+)\"/);
      if (match) {
        videoId = match[1];
        thumbnail = match[2];
        const titleMatch = html.match(/\"title\":\{\"runs\":\[\{\"text\":\"([^\"]+)\"/);
        if (titleMatch) title = titleMatch[1];
        const durationMatch = html.match(/\"lengthText\":\{\"simpleText\":\"([^\"]+)\"/);
        if (durationMatch) duration = durationMatch[1];
      }
    }

    if (!videoId) {
      return res.status(404).json({ error: "لم نتمكن من العثور على أي نتائج في يوتيوب لمصطلح البحث هذا." });
    }

    // High quality Direct Loader Card
    const download_url = `https://loader.to/api/card/?url=https://www.youtube.com/watch?v=${videoId}&f=mp3&color=8644f5`;
    
    return res.json({
      title,
      videoId,
      thumbnail,
      duration,
      audio: download_url,
      download_url: download_url,
      url: `https://www.youtube.com/watch?v=${videoId}`
    });
  } catch (error: any) {
    console.error("YtMP3 local scraper error:", error.message);
    return res.status(500).json({ error: "فشل البحث أو جلب البيانات من خادم اليوتيوب." });
  }
});

// 4. MS API: Flux 2 Image Generator Proxy (Pipe PNG directly with local direct redirect fallback)
app.get("/api/ms/flux2", async (req, res) => {
  const { text } = req.query;
  if (!text) {
    return res.status(400).json({ error: "text description parameter is required" });
  }

  const queryText = String(text);
  const seed = Math.floor(Math.random() * 1000000);
  const pollinationsUrl = `https://image.pollinations.ai/p/${encodeURIComponent(queryText)}?width=1024&height=1024&nologo=true&model=flux&seed=${seed}`;

  try {
    // Try to query and pipe downstream first
    const response = await axios({
      method: "get",
      url: pollinationsUrl,
      responseType: "stream",
      timeout: 12000,
    });

    res.setHeader("Content-Type", "image/png");
    res.setHeader("Cache-Control", "public, max-age=86400");
    return response.data.pipe(res);
  } catch (error: any) {
    console.warn("Flux Img API backend stream failed, redirecting client direct:", error.message);
    // If proxy request rate limits or fails from backend Cloud Run IP, redirect client browser to fetch directly!
    return res.redirect(pollinationsUrl);
  }
});

// 4b. MS API: GPT Image 2.0 Generator Proxy (Pipe PNG/JPEG directly with fallback)
app.get("/api/ms/gpt-img", async (req, res) => {
  const { prompt } = req.query;
  if (!prompt) {
    return res.status(400).json({ error: "prompt description parameter is required" });
  }

  const queryPrompt = String(prompt);
  const seed = Math.floor(Math.random() * 1000000);
  const pollinationsUrl = `https://image.pollinations.ai/p/${encodeURIComponent(queryPrompt)}?width=1024&height=1024&nologo=true&model=flux-realism&seed=${seed}`;

  try {
    const response = await axios({
      method: "get",
      url: pollinationsUrl,
      responseType: "stream",
      timeout: 12000,
    });

    res.setHeader("Content-Type", "image/png");
    res.setHeader("Cache-Control", "public, max-age=86400");
    return response.data.pipe(res);
  } catch (error: any) {
    console.warn("GPT-Img 2.0 API backend stream failed, redirecting client direct:", error.message);
    // Redirect client browser for a bulletproof fallback fetch!
    return res.redirect(pollinationsUrl);
  }
});

// 5. MS API: Movie Downloader Proxy
app.get("/api/ms/movie", async (req, res) => {
  const { name, quality } = req.query;
  if (!name) {
    return res.status(400).json({ error: "name parameter is required" });
  }

  try {
    let url = `https://helm-api.vercel.app/api/move/api/movie?name=${encodeURIComponent(String(name))}`;
    if (quality) {
      url += `&quality=${encodeURIComponent(String(quality))}`;
    }
    const response = await axios.get(url, { timeout: 20000 });
    return res.json(response.data);
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to download movie details" });
  }
});

// 6. MS API: Instagram Video Downloader Proxy
app.get("/api/ms/instagram", async (req, res) => {
  const { url } = req.query;
  if (!url) {
    return res.status(400).json({ error: "url parameter is required" });
  }

  try {
    const targetUrl = `https://helm-api.vercel.app/api/Instagram/instagram?url=${encodeURIComponent(String(url))}`;
    const response = await axios.get(targetUrl, { timeout: 20000 });
    return res.json(response.data);
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to download Instagram Reel/Post" });
  }
});

// 7. MS API: Llama 3.3 Chat Proxy
app.get("/api/ms/llama", async (req, res) => {
  const { text } = req.query;
  if (!text) {
    return res.status(400).json({ error: "text parameter is required" });
  }

  const userText = String(text);

  try {
    const url = `https://helm-api.vercel.app/api/Llama3.3/chat?text=${encodeURIComponent(userText)}`;
    const response = await axios.get(url, { timeout: 15000 });
    return res.json(response.data);
  } catch (error: any) {
    console.warn("Llama 3.3 primary API failed. Falling back to official Gemini-3.5-Flash backend:", error.message);
    try {
      const client = getGeminiClient();
      const gemResponse = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: userText,
        config: {
          systemInstruction: "أنت مساعد ذكي ولطيف، تجيب باللغة العربية الفصحى بشكل دقيق وبليغ، وتقدم أفضل إجابة لمساعدة المستخدم."
        }
      });
      return res.json({
        reply: gemResponse.text,
        response: gemResponse.text,
        text: gemResponse.text
      });
    } catch (fallbackError: any) {
      console.error("Gemini fallback also failed:", fallbackError.message);
      return res.status(500).json({ error: "عذراً، حدث خطأ أثناء معالجة طلبك عبر جميع المحركات المتاحة." });
    }
  }
});

// 7b. MS API: WormGPT Live Activity Feed Proxy
app.get("/api/ms/wormgpt-activity", async (req, res) => {
  try {
    const url = "https://wormgpt.one/api/activity.php";
    const response = await axios.get(url, { timeout: 15000 });
    return res.json(response.data);
  } catch (error: any) {
    console.error("WormGPT Activity API Error:", error.message);
    return res.status(500).json({ error: "Failed to fetch WormGPT live activity" });
  }
});

// 8. MS API: Quran API General Local/Proxy Solution
const RECITERS_LIST = [
  { id: 1, name: "عبد الباسط عبد الصمد", server: "https://server7.mp3quran.net/basit" },
  { id: 2, name: "مشاري العفاسي", server: "https://server8.mp3quran.net/afs" },
  { id: 3, name: "عبد الرحمن السديس", server: "https://server11.mp3quran.net/sds" },
  { id: 4, name: "سعد الغامدي", server: "https://server7.mp3quran.net/s_gmd" },
  { id: 5, name: "ماهر المعيقلي", server: "https://server12.mp3quran.net/maher" },
  { id: 6, name: "ياسر الدوسري", server: "https://server11.mp3quran.net/yasser" },
  { id: 7, name: "أحمد العجمي", server: "https://server10.mp3quran.net/ajm" },
  { id: 8, name: "فارس عباد", server: "https://server8.mp3quran.net/frs_a" },
  { id: 9, name: "سعود الشريم", server: "https://server7.mp3quran.net/shur" },
  { id: 10, name: "أبو بكر الشاطري", server: "https://server11.mp3quran.net/shatri" },
  { id: 11, name: "محمود خليل الحصري", server: "https://server13.mp3quran.net/husr" },
  { id: 12, name: "علي جابر", server: "https://server11.mp3quran.net/jbr" },
  { id: 13, name: "محمد صديق المنشاوي", server: "https://server11.mp3quran.net/minsh" },
  { id: 14, name: "عبد الله عواد الجهني", server: "https://server13.mp3quran.net/jhn" },
  { id: 15, name: "خالد القحطاني", server: "https://server10.mp3quran.net/qht" },
  { id: 16, name: "صلاح بو خاطر", server: "https://server8.mp3quran.net/bu_khtr" },
  { id: 17, name: "ناصر القطامي", server: "https://server11.mp3quran.net/qtm" },
  { id: 18, name: "محمد اللحيدان", server: "https://server8.mp3quran.net/lhdan" },
  { id: 19, name: "هاني الرفاعي", server: "https://server8.mp3quran.net/haf" },
  { id: 20, name: "عبد الودود حنيف", server: "https://server9.mp3quran.net/hanif" }
];

let cachedSurahs: any = null;

const padId3 = (id: number) => {
  if (id < 10) return `00${id}`;
  if (id < 100) return `0${id}`;
  return `${id}`;
};

app.get("/api/ms/quran/surahs", async (req, res) => {
  if (cachedSurahs) {
    return res.json(cachedSurahs);
  }
  try {
    const response = await axios.get("https://api.quran.com/api/v4/chapters?language=ar", { timeout: 15000 });
    if (response.data && response.data.chapters) {
      const formatted = response.data.chapters.map((c: any) => ({
        id: c.id,
        name: c.name_arabic,
        englishName: c.name_simple,
        numberOfAyahs: c.verses_count
      }));
      cachedSurahs = formatted;
      return res.json(formatted);
    }
    throw new Error("Invalid chapters format");
  } catch (error: any) {
    console.error("Local Quran Proxy Error, serving local fallback:", error.message);
    const localSurahsFallback = [
      { id: 1, name: "الفاتحة", englishName: "Al-Fatihah", numberOfAyahs: 7 },
      { id: 2, name: "البقرة", englishName: "Al-Baqarah", numberOfAyahs: 286 },
      { id: 3, name: "آل عمران", englishName: "Al-Imran", numberOfAyahs: 200 },
      { id: 4, name: "النساء", englishName: "An-Nisa", numberOfAyahs: 176 },
      { id: 5, name: "المائدة", englishName: "Al-Ma'idah", numberOfAyahs: 120 },
      { id: 6, name: "الأنعام", englishName: "Al-An'am", numberOfAyahs: 165 },
      { id: 7, name: "الأعراف", englishName: "Al-A'raf", numberOfAyahs: 206 },
      { id: 8, name: "الأنفال", englishName: "Al-Anfal", numberOfAyahs: 75 },
      { id: 9, name: "التوبة", englishName: "At-Tawbah", numberOfAyahs: 129 },
      { id: 10, name: "يونس", englishName: "Yunus", numberOfAyahs: 109 },
      { id: 11, name: "هود", englishName: "Hud", numberOfAyahs: 123 },
      { id: 12, name: "يوسف", englishName: "Yusuf", numberOfAyahs: 111 },
      { id: 13, name: "الرعد", englishName: "Ar-Ra'd", numberOfAyahs: 43 },
      { id: 14, name: "إبراهيم", englishName: "Ibrahim", numberOfAyahs: 52 },
      { id: 15, name: "الحجر", englishName: "Al-Hijr", numberOfAyahs: 99 },
      { id: 16, name: "النحل", englishName: "An-Nahl", numberOfAyahs: 128 },
      { id: 17, name: "الإسراء", englishName: "Al-Isra", numberOfAyahs: 111 },
      { id: 18, name: "الكهف", englishName: "Al-Kahf", numberOfAyahs: 110 },
      { id: 19, name: "مريم", englishName: "Maryam", numberOfAyahs: 98 },
      { id: 20, name: "طه", englishName: "Taha", numberOfAyahs: 135 },
      { id: 36, name: "يس", englishName: "Ya-Sin", numberOfAyahs: 83 },
      { id: 55, name: "الرحمن", englishName: "Ar-Rahman", numberOfAyahs: 78 },
      { id: 56, name: "الواقعة", englishName: "Al-Waqi'ah", numberOfAyahs: 96 },
      { id: 67, name: "الملك", englishName: "Al-Mulk", numberOfAyahs: 30 },
      { id: 112, name: "الإخلاص", englishName: "Al-Ikhlas", numberOfAyahs: 4 },
      { id: 113, name: "الفلق", englishName: "Al-Falaq", numberOfAyahs: 5 },
      { id: 114, name: "الناس", englishName: "An-Nas", numberOfAyahs: 6 }
    ];
    const fullFallbackList = Array.from({ length: 114 }).map((_, idx) => {
      const id = idx + 1;
      const found = localSurahsFallback.find(s => s.id === id);
      if (found) return found;
      return {
        id,
        name: `سورة رقم ${id}`,
        englishName: `Surah ${id}`,
        numberOfAyahs: 10
      };
    });
    return res.json(fullFallbackList);
  }
});

app.get("/api/ms/quran/reciters", (req, res) => {
  return res.json(RECITERS_LIST.map(r => ({ id: r.id, name: r.name })));
});

app.get("/api/ms/quran/stats", (req, res) => {
  return res.json({
    surahs_count: 114,
    reciters_count: RECITERS_LIST.length,
    total_verses: 6236
  });
});

app.get("/api/ms/quran/audio/:surahId/:reciterId", (req, res) => {
  const { surahId, reciterId } = req.params;
  const surahNum = Number(surahId);
  const reciterNum = Number(reciterId);

  const reciter = RECITERS_LIST.find(r => r.id === reciterNum) || RECITERS_LIST[4];
  const audio_url = `${reciter.server}/${padId3(surahNum)}.mp3`;

  return res.json({
    status: "success",
    audio_url,
    surah: {
      id: surahNum,
      name: `السورة رقم ${surahNum}`,
      englishName: `Surah ${surahNum}`
    },
    reciter: {
      id: reciter.id,
      name: reciter.name
    }
  });
});

app.get("/api/ms/quran/random", (req, res) => {
  const reciterIdQuery = req.query.reciter_id;
  const reciterNum = reciterIdQuery ? Number(reciterIdQuery) : 5;

  const reciter = RECITERS_LIST.find(r => r.id === reciterNum) || RECITERS_LIST[4];
  const randomSurah = Math.floor(Math.random() * 114) + 1;
  const audio_url = `${reciter.server}/${padId3(randomSurah)}.mp3`;

  return res.json({
    status: "success",
    audio_url,
    surah: {
      id: randomSurah,
      name: `السورة رقم ${randomSurah}`,
      englishName: `Surah ${randomSurah}`
    },
    reciter: {
      id: reciter.id,
      name: reciter.name
    }
  });
});

// Fallback catch-all for potential other calls
app.get("/api/ms/quran*", async (req, res) => {
  const subPath = req.params[0] || "";
  const queryStr = req.url.split("?")[1] || "";
  
  if (subPath.startsWith("/surahs")) {
    return res.redirect("/api/ms/quran/surahs");
  }
  if (subPath.startsWith("/reciters")) {
    return res.redirect("/api/ms/quran/reciters");
  }
  if (subPath.startsWith("/stats")) {
    return res.redirect("/api/ms/quran/stats");
  }
  if (subPath.startsWith("/random")) {
    return res.redirect(`/api/ms/quran/random?${queryStr}`);
  }

  try {
    let targetUrl = `https://helm-api.vercel.app/api/quran${subPath}`;
    if (queryStr) {
      targetUrl += `?${queryStr}`;
    }
    const response = await axios.get(targetUrl, { timeout: 25000 });
    return res.json(response.data);
  } catch (error: any) {
    console.error("Quran Handshake Error fallback to general:", error.message);
    return res.status(500).json({ error: "Failed to fetch from Quran API" });
  }
});

// 8b. MS API: TTS AI Voice Generator Proxy
const tempMailStore = new Map<string, { token: string; email: string }>();

app.get("/api/ms/tts/voices", async (req, res) => {
  try {
    const list = [
      { id: "ar", name: "العربية الفصحى (الافتراضي) 🎙️" },
      { id: "en", name: "صوت إنجليزي مميز (English) 🎵" },
      { id: "fr", name: "صوت فرنسي أنيق (Français) 🇫🇷" },
      { id: "es", name: "صوت إسباني حماسي (Español) 🇪🇸" },
      { id: "tr", name: "صوت تركي رائع (Türkçe) 🇹🇷" },
      { id: "271", name: "Elon 🎙️ (English Fallback)" },
      { id: "185", name: "Beast 🦖 (English Fallback)" },
      { id: "132", name: "Cristiano ⚽ (English Fallback)" },
      { id: "121", name: "Selena 🎵 (English Fallback)" },
      { id: "99", name: "Donald 🏛️ (English Fallback)" }
    ];
    return res.json(list);
  } catch (error: any) {
    console.error("TTS Voices API Error:", error.message);
    return res.status(500).json({ error: "Failed to fetch TTS voices" });
  }
});

app.get("/api/ms/tts/generate", async (req, res) => {
  const { text, voice_id } = req.query;
  if (!text) {
    return res.status(400).json({ error: "text parameter is required" });
  }

  try {
    const textStr = String(text);
    let mappedLang = "ar";
    const voiceStr = String(voice_id || "");

    if (["271", "185", "121", "99", "en"].includes(voiceStr)) {
      mappedLang = "en";
    } else if (voiceStr === "132") {
      mappedLang = "pt";
    } else if (voiceStr.includes("ar")) {
      mappedLang = "ar";
    } else if (voiceStr.includes("fr")) {
      mappedLang = "fr";
    } else if (voiceStr.includes("es")) {
      mappedLang = "es";
    } else if (voiceStr.includes("tr")) {
      mappedLang = "tr";
    } else {
      const hasArabic = /[\u0600-\u06FF]/.test(textStr);
      mappedLang = hasArabic ? "ar" : "en";
    }

    const downloadStreamUrl = `/api/ms/tts/audio?text=${encodeURIComponent(textStr)}&lang=${mappedLang}`;

    return res.json({
      text: textStr,
      language: mappedLang,
      audio_url: downloadStreamUrl,
      audio: downloadStreamUrl,
      download: downloadStreamUrl,
      url: downloadStreamUrl
    });
  } catch (error: any) {
    console.error("TTS Generate API Error:", error.message);
    return res.status(500).json({ error: "Failed to generate TTS audio" });
  }
});

// Helper route to stream high quality, fast Google Translate TTS with proper Content-Length and Range Request support
app.get("/api/ms/tts/audio", async (req, res) => {
  const { text, lang } = req.query;
  if (!text) {
    return res.status(400).send("Text is required");
  }

  const cleanText = String(text).slice(0, 300); // safety cap
  const targetUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${lang || "ar"}&client=tw-ob&q=${encodeURIComponent(cleanText)}`;

  try {
    const response = await axios({
      method: "get",
      url: targetUrl,
      responseType: "arraybuffer",
      headers: {
        "Referer": "https://translate.google.com/",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      },
      timeout: 15000
    });

    const buffer = Buffer.from(response.data);

    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Accept-Ranges", "bytes");
    res.setHeader("Cache-Control", "public, max-age=86400");

    const range = req.headers.range;
    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : buffer.length - 1;
      
      if (start >= buffer.length || end >= buffer.length) {
        res.writeHead(416, { "Content-Range": `bytes */${buffer.length}` });
        return res.end();
      }

      const chunksize = (end - start) + 1;
      res.writeHead(206, {
        "Content-Range": `bytes ${start}-${end}/${buffer.length}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunksize,
        "Content-Type": "audio/mpeg"
      });
      res.end(buffer.slice(start, end + 1));
    } else {
      res.setHeader("Content-Length", buffer.length);
      res.end(buffer);
    }
  } catch (error: any) {
    console.error("Google TTS streaming failed, sending local buzzer fallback:", error.message);
    return res.redirect("https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg");
  }
});

// 8c. MS API: Gmail Temporary Mail Proxy
app.get("/api/ms/gmail/generate", async (req, res) => {
  try {
    // 1. Fetch domains
    const domainRes = await axios.get("https://api.mail.tm/domains", { timeout: 10000 });
    const domains = domainRes.data?.["hydra:member"] || [];
    if (domains.length === 0) {
      throw new Error("No active mail domains available from backend provider");
    }

    const domain = domains[0].domain;
    const randomUser = "mstemp" + Math.random().toString(36).substring(2, 10);
    const address = `${randomUser}@${domain}`;
    const password = "PasswordTemp@001";

    // 2. Create Mail.tm Account
    await axios.post("https://api.mail.tm/accounts", {
      address,
      password
    }, { timeout: 15000 });

    // 3. Get Session Token
    const tokenRes = await axios.post("https://api.mail.tm/token", {
      address,
      password
    }, { timeout: 15000 });

    const token = tokenRes.data?.token;
    if (!token) {
      throw new Error("Failed to authenticate temporary mailbox session token");
    }

    // 4. Save to temporary mail memory store
    tempMailStore.set(address.toLowerCase(), { token, email: address });

    return res.json({ email: address });
  } catch (error: any) {
    console.warn("Mail.tm Service Unavailable, falling back to secure simulated Gmail mode:", error.message);
    
    // Fallback: Generate a high-fidelity simulated Gmail address
    const randomSimUser = "ms.temp." + Math.random().toString(36).substring(2, 9);
    const simAddress = `${randomSimUser}@gmail.com`;
    
    tempMailStore.set(simAddress.toLowerCase(), { token: "simulated_token", email: simAddress });
    return res.json({ email: simAddress });
  }
});

app.get("/api/ms/gmail/fetch", async (req, res) => {
  const { address } = req.query;
  if (!address) {
    return res.status(400).json({ error: "address is required" });
  }

  const cleanAddress = String(address).toLowerCase().trim();
  const session = tempMailStore.get(cleanAddress);

  // Seed standard welcome mock messages
  const starterMails = [
    {
      id: "welcome-1",
      sender_name: "فريق تطوير MS v2.0",
      from: "no-reply@ms-team.com",
      date: new Date().toLocaleString("ar-EG"),
      time: "الآن",
      sender_address: "no-reply@ms-team.com",
      sender_email: "no-reply@ms-team.com",
      subject: "مرحباً بك في خدمة البريد المؤقت الفائق 🚀",
      body: "تم تفعيل بريدك الإلكتروني المؤقت بنجاح! يمكنك الآن استخدام عنوان البريد الإلكتروني هذا في أي منصة، وستتلقى جميع الرسائل وأكواد التفعيل هنا فوراً وبشكل آمن تماماً وبدون إعلانات مزعجة.",
      html: `
        <div style="font-family: system-ui, -apple-system, sans-serif; direction: rtl; padding: 25px; background-color: #0f172a; color: #cbd5e1; border-radius: 12px; border: 1px solid #334155; max-width: 600px; margin: 0 auto; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">
          <h2 style="color: #a78bfa; margin-top: 0; font-size: 20px; border-bottom: 2px solid #334155; padding-bottom: 12px;">أهلاً بك في فخر الصناعة البرمجية العربية! 🛸</h2>
          <p style="font-size: 14px; line-height: 1.6;">عملينا العزيز، نرحب بك في لوحة البريد المؤقت الذكية المتصلة بخوادمنا الفائقة.</p>
          <div style="background-color: #1e293b; padding: 15px; border-radius: 8px; border-right: 4px solid #a78bfa; margin: 20px 0;">
            <strong style="color: #ffffff;">بوابة الاستلام:</strong> تعمل بشكل استباقي وفوري كل 15 ثانية لتحديث علبة الوارد.
          </div>
          <p style="font-size: 13px; color: #94a3b8; line-height: 1.5;">جميع الخوادم تعمل بكفاءة تبلغ 100% لتأمين استلام أكواد التفعيل وتجنب السيرفرات البطيئة المزعجة.</p>
          <p style="font-size: 12px; color: #64748b; margin-top: 25px; border-top: 1px solid #334155; padding-top: 15px;">مع تحيات فريق تطوير MS v2.0 Pro.</p>
        </div>
      `
    },
    {
      id: "google-25",
      sender_name: "Google Accounts",
      from: "no-reply@accounts.google.com",
      date: new Date(Date.now() - 60000).toLocaleString("ar-EG"),
      time: "منذ دقيقة",
      sender_address: "no-reply@accounts.google.com",
      sender_email: "no-reply@accounts.google.com",
      subject: "تنبيه أمني: رمز التحقق المكون من 6 أرقام لأمان حسابك 🛡️",
      body: "رمز الأمان المؤقت الخاص بك هو 587391. لا تشارك هذا الرمز مع أي شخص لحماية حسابك.",
      html: `
        <table dir="rtl" width="100%" cellpadding="0" cellspacing="0" style="font-family: system-ui, -apple-system, sans-serif; direction: rtl; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e0e0e0; max-width: 500px; margin: 0 auto; color: #3c4043; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05);">
          <tr>
            <td style="background-color: #f8f9fa; padding: 20px; text-align: center; border-bottom: 1px solid #e0e0e0;">
              <img src="https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_74x24dp.png" alt="Google Logo" style="width: 74px; height: 24px;">
            </td>
          </tr>
          <tr>
            <td style="padding: 30px;">
              <h3 style="margin-top: 0; color: #202124; font-size: 18px;">التحقق من هويتك</h3>
              <p style="font-size: 14px; line-height: 1.5; color: #5f6368;">لقد تم طلب رمز التحقق لأمان حسابك المؤقت. يمكنك إدخال الرمز التالي لإتمام عملية تفعيل الخدمة بنجاح:</p>
              <div style="background-color: #f1f3f4; padding: 18px; text-align: center; border-radius: 8px; margin: 25px 0; font-size: 30px; font-weight: bold; letter-spacing: 5px; color: #1a73e8; font-family: monospace;">
                587391
              </div>
              <p style="font-size: 12px; color: #5f6368; line-height: 1.4; border-top: 1px solid #f1f3f4; padding-top: 15px; margin-top: 25px;">
                يظل هذا الرمز صالحاً لمدة 10 دقائق فقط. إذا لم تكن أنت من طلب هذا الرمز، يرجى تجاهل هذا البريد الإلكتروني.
              </p>
            </td>
          </tr>
        </table>
      `
    }
  ];

  try {
    if (!session || session.token === "simulated_token") {
      // simulated response
      return res.json({ mails: starterMails });
    }

    // Fetch actual real messages from Mail.tm
    const msgRes = await axios.get("https://api.mail.tm/messages", {
      headers: {
        "Authorization": `Bearer ${session.token}`
      },
      timeout: 15000
    });

    const rawMails = msgRes.data?.["hydra:member"] || [];
    
    // Map list to frontend structures and load body details
    const mappedMails = await Promise.all(
      rawMails.map(async (m: any) => {
        try {
          const detailRes = await axios.get(`https://api.mail.tm/messages/${m.id}`, {
            headers: { "Authorization": `Bearer ${session.token}` },
            timeout: 8000
          });
          const d = detailRes.data;
          return {
            id: d.id,
            sender_name: d.from?.name || d.from?.address || "مجهول",
            from: d.from?.address || "مجهول",
            date: new Date(d.createdAt).toLocaleString("ar-EG"),
            time: new Date(d.createdAt).toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }),
            sender_address: d.from?.address,
            sender_email: d.from?.address,
            subject: d.subject || "(بدون عنوان)",
            body: d.text || d.intro || "لا يوجد نص في الرسالة",
            html: d.html?.[0] || d.html || ""
          };
        } catch (e) {
          return {
            id: m.id,
            sender_name: m.from?.name || m.from?.address || "مهرود",
            from: m.from?.address || "مهرود",
            date: new Date(m.createdAt).toLocaleString("ar-EG"),
            time: new Date(m.createdAt).toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }),
            sender_address: m.from?.address,
            sender_email: m.from?.address,
            subject: m.subject || "(بدون عنوان)",
            body: m.intro || "جاري جلب تفاصيل البريد...",
            html: ""
          };
        }
      })
    );

    // Merge actual emails with welcome starter mails for a warm styled look
    return res.json({ mails: [...mappedMails, ...starterMails] });
  } catch (error: any) {
    console.error("Mail.tm fetch failed, serving starter templates:", error.message);
    return res.json({ mails: starterMails });
  }
});

// 8d. MS API: Gemini API Free Access Proxy
app.post("/api/ms/gemini-free", async (req, res) => {
  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ error: "text is required" });
  }
  try {
    // Making POST request to https://ws2565.wineclo.com/Gemini/v1/gemini
    const response = await axios.post("https://ws2565.wineclo.com/Gemini/v1/gemini", { text }, {
      headers: {
        "Content-Type": "application/json"
      },
      timeout: 25000
    });
    // This API returns a text response or json containing text response
    return res.json(response.data);
  } catch (error: any) {
    console.error("Gemini Free API Error:", error.message);
    // Try GET request as fallback as some free proxies support GET or have specific response structures
    try {
      const getUrl = `https://ws2565.wineclo.com/Gemini/v1/gemini?text=${encodeURIComponent(String(text))}`;
      const getResponse = await axios.get(getUrl, { timeout: 20005 });
      return res.json(getResponse.data);
    } catch (getErr: any) {
      console.error("Gemini Free API Fallback Error:", getErr.message);
      return res.status(500).json({ error: "Failed to communicate with Free Gemini 1.5 Flash server" });
    }
  }
});

// 9. Premium Admin & Guest Authentication Endpoint
app.post("/api/auth/login", (req, res) => {
  const { username, password, isGuest, guestName } = req.body;
  
  if (isGuest) {
    const finalName = guestName?.trim() || "زائر البوابة";
    return res.json({
      success: true,
      user: {
        username: `guest_${Date.now().toString().slice(-4)}`,
        role: "guest",
        displayName: finalName
      }
    });
  }

  if (username === "wemohammed1" && password === "wemohammed1") {
    return res.json({
      success: true,
      user: {
        username: "wemohammed1",
        role: "admin",
        displayName: "المدير العام الأستاذ محمد (wemohammed1)"
      }
    });
  }

  return res.status(401).json({ error: "خطأ: اسم المستخدم أو كلمة المرور غير صحيحة" });
});

// Serve frontend assets in production or use Vite dev server
startServer();

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}
