import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
    Star,
    Flame,
    Sparkles,
    Search,
    ExternalLink,
    Loader2,
    ChevronUp,
    Plus,
    Tv,
    Film,
    Send,
    MessageSquare,
    Volume2,
    Cpu,
    Zap,
} from "lucide-react";

// --- Formateador de texto ---
const FormattedText = ({ text }) => {
    if (!text) return null;
    const cleanText = text.replace(/###/g, "").replace(/##/g, "");
    const lines = cleanText.split("\n").filter((l) => l.trim() !== "");

    return (
        <div className="space-y-4">
            {lines.map((line, i) => {
                const parts = line.split(/(\*\*.*?\*\*)/g);
                return (
                    <p
                        key={i}
                        className="leading-relaxed text-slate-300 text-base"
                    >
                        {parts.map((part, j) => {
                            if (part.startsWith("**") && part.endsWith("**")) {
                                return (
                                    <span
                                        key={j}
                                        className="text-pink-400 font-bold"
                                    >
                                        {part.slice(2, -2)}
                                    </span>
                                );
                            }
                            return part;
                        })}
                    </p>
                );
            })}
        </div>
    );
};

export default function App() {
    // --- Estados ---
    const [activeTab, setActiveTab] = useState("bypopularity");
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showScrollTop, setShowScrollTop] = useState(false);

    const [animeData, setAnimeData] = useState({
        bypopularity: [],
        favorite: [],
        airing: [],
    });
    const [pages, setPages] = useState({
        bypopularity: 1,
        favorite: 1,
        airing: 1,
    });

    // --- Estados Senpai ---
    const [chatInput, setChatInput] = useState("");
    const [chatResponse, setChatResponse] = useState("");
    const [isChatting, setIsChatting] = useState(false);
    const [analysisTarget, setAnalysisTarget] = useState(null);
    const [analysisText, setAnalysisText] = useState("");
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isPlayingAudio, setIsPlayingAudio] = useState(false);

    // --- Refs ---
    const messagesEndRef = useRef(null);
    const initLoadRef = useRef(false);

    const tabs = useMemo(
        () => ({
            bypopularity: {
                label: "Popularidad",
                icon: Flame,
                color: "from-pink-500 to-rose-600",
            },
            favorite: {
                label: "Top Ratings",
                icon: Star,
                color: "from-yellow-400 to-orange-500",
            },
            airing: {
                label: "En Emisión",
                icon: Zap,
                color: "from-cyan-400 to-blue-500",
            },
        }),
        [],
    );

    // --- Efectos ---
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chatResponse]);

    // --- Audio ---
    const speak = (text) => {
        if (isPlayingAudio) {
            window.speechSynthesis.cancel();
            setIsPlayingAudio(false);
            return;
        }
        const cleanText = text.replace(/\*\*/g, "");
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = "es-ES";
        utterance.rate = 1.1;
        utterance.onstart = () => setIsPlayingAudio(true);
        utterance.onend = () => setIsPlayingAudio(false);
        utterance.onerror = () => setIsPlayingAudio(false);
        window.speechSynthesis.speak(utterance);
    };

    // --- Chat ---
    const handleChat = async () => {
        if (!chatInput.trim() || isChatting) return;
        setIsChatting(true);
        setChatResponse("");
        try {
            const response = await fetch(
                `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(
                    chatInput,
                )}&limit=3&order_by=score&sort=desc`,
            );
            const data = await response.json();

            if (data.data?.length > 0) {
                let msg = `¡Hecho nakama! Buscando en la base de datos sobre "${chatInput}", te recomiendo estos títulos:\n\n`;
                data.data.forEach((a, i) => {
                    msg += `${i + 1}. **${a.title}** (Nota: ${
                        a.score || "N/A"
                    }). ${
                        a.synopsis
                            ? a.synopsis.substring(0, 100) + "..."
                            : "Sin descripción."
                    }\n\n`;
                });
                msg += "¡Son series increíbles!";
                setChatResponse(msg);
            } else {
                setChatResponse(
                    "Lo siento, no encontré animes que coincidan con eso. Intenta con algo más general.",
                );
            }
        } catch {
            setChatResponse(
                "Error de conexión con el servidor. Inténtalo de nuevo.",
            );
        } finally {
            setIsChatting(false);
        }
    };

    // --- Análisis ---
    const handleAnalyze = (anime) => {
        setAnalysisTarget(anime);
        setIsAnalyzing(true);
        setTimeout(() => {
            const genres =
                anime.genres?.map((g) => g.name).join(", ") || "Desconocido";
            const status =
                anime.status === "Finished Airing"
                    ? "Finalizado"
                    : "En Emisión";
            const studio = anime.studios?.[0]?.name || "Estudio Desconocido";

            const res = `Informe técnico: **${anime.title}**.\n\nProducido por **${studio}**, esta obra pertenece a los géneros: **${genres}**. Estado actual: **${status}**.\n\nCon un ranking mundial de #**${anime.rank}** y una puntuación de **${anime.score}**, ha demostrado un impacto cultural significativo.`;

            setAnalysisText(res);
            setIsAnalyzing(false);
        }, 1200);
    };

    // --- Fetch ---
    const fetchAnime = useCallback(async (cat, pg = 1, clear = false) => {
        setLoading(true);
        let retries = 3;
        let delay = 1000;

        while (retries > 0) {
            try {
                const res = await fetch(
                    `https://api.jikan.moe/v4/top/anime?filter=${cat}&page=${pg}`,
                );
                if (res.status === 429) throw new Error("RATE_LIMIT");
                if (!res.ok) throw new Error("API_ERROR");

                const json = await res.json();
                if (json.data) {
                    setAnimeData((prev) => ({
                        ...prev,
                        [cat]: clear ? json.data : [...prev[cat], ...json.data],
                    }));
                    setError(null);
                }
                break;
            } catch (err) {
                if (err.message === "RATE_LIMIT") {
                    retries--;
                    await new Promise((r) => setTimeout(r, delay));
                    delay *= 2;
                } else {
                    setError("Error de conexión con Jikan API");
                    break;
                }
            }
        }
        setLoading(false);
    }, []);

    // --- Init ---
    useEffect(() => {
        if (initLoadRef.current) return;
        initLoadRef.current = true;

        const loadAll = async () => {
            await fetchAnime("bypopularity", 1, true);
            await new Promise((r) => setTimeout(r, 1200));
            await fetchAnime("favorite", 1, true);
            await new Promise((r) => setTimeout(r, 1200));
            await fetchAnime("airing", 1, true);
        };
        loadAll();

        const handleScroll = () => setShowScrollTop(window.scrollY > 400);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [fetchAnime]);

    const filtered = useMemo(() => {
        const list = animeData[activeTab] || [];
        if (!searchTerm) return list;
        return list.filter((a) =>
            a.title.toLowerCase().includes(searchTerm.toLowerCase()),
        );
    }, [animeData, activeTab, searchTerm]);

    return (
        <div className="min-h-screen bg-background text-slate-100 font-sans selection:bg-pink-500/40 pb-20 overflow-x-hidden">
            {/* Fondo Neón */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-20%] left-[-10%] w-[80vw] h-[80vw] bg-pink-900/10 blur-[150px] rounded-full mix-blend-screen" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[80vw] h-[80vw] bg-indigo-900/10 blur-[150px] rounded-full mix-blend-screen" />
            </div>

            {/* Header */}
            <header className="relative z-10 pt-24 px-6 text-center">
                <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/3 border border-white/10 text-pink-500 text-[10px] font-black uppercase tracking-[0.4em] mb-8 shadow-xl">
                    <Sparkles size={14} /> Otaku Discovery v8.0
                </div>
                <h1 className="text-6xl md:text-9xl font-black tracking-tighter mb-6 text-white uppercase italic leading-none drop-shadow-2xl">
                    ANIME
                    <span className="text-pink-600 drop-shadow-[0_0_25px_rgba(219,39,119,0.4)]">
                        DB
                    </span>
                </h1>
                <p className="text-slate-500 max-w-lg mx-auto font-medium text-lg leading-relaxed">
                    Ranking Top 100 interactivo por{" "}
                    <span className="text-pink-500 font-bold decoration-pink-500/20 underline-offset-4 underline">
                        Feryael Justice
                    </span>
                    .
                </p>
            </header>

            {/* Chat Senpai */}
            <div className="container mx-auto px-6 mt-20 relative z-20">
                <div className="max-w-4xl mx-auto bg-slate-900/40 backdrop-blur-2xl border border-white/10 p-8 md:p-12 rounded-[3rem] shadow-2xl overflow-hidden">
                    <div className="flex items-center gap-5 mb-8">
                        <div className="bg-linear-to-br from-indigo-600 to-violet-600 p-4 rounded-3xl shadow-lg shadow-indigo-500/20">
                            <MessageSquare className="text-white" size={28} />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black uppercase tracking-tighter italic">
                                Senpai AI
                            </h2>
                            <p className="text-slate-400 text-sm font-medium">
                                Recomendaciones inteligentes.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            <input
                                className="flex-1 bg-black/40 border border-white/5 rounded-2xl px-8 py-5 outline-none focus:border-pink-500/50 transition-all font-medium text-white shadow-inner placeholder:text-slate-600"
                                placeholder="Ej: Fantasía oscura, Cyberpunk, Romance..."
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                onKeyDown={(e) =>
                                    e.key === "Enter" && handleChat()
                                }
                            />
                            <button
                                onClick={handleChat}
                                className="bg-pink-600 hover:bg-pink-500 text-white px-10 py-5 rounded-2xl font-black uppercase text-xs tracking-widest transition-all disabled:opacity-50 flex items-center justify-center shadow-lg shadow-pink-600/20"
                                disabled={isChatting}
                            >
                                {isChatting ? (
                                    <Loader2 className="animate-spin" />
                                ) : (
                                    <Send size={20} />
                                )}
                            </button>
                        </div>

                        {chatResponse && (
                            <div className="mt-6 p-8 md:p-10 bg-white/2 border border-white/5 rounded-[2.5rem] border-l-8 border-l-pink-600 relative">
                                <FormattedText text={chatResponse} />
                                <div ref={messagesEndRef} />
                                <div className="mt-8 pt-6 border-t border-white/5 flex justify-end">
                                    <button
                                        onClick={() => speak(chatResponse)}
                                        className={`flex items-center gap-3 text-[10px] font-black uppercase tracking-widest px-6 py-4 rounded-xl transition-all ${
                                            isPlayingAudio
                                                ? "bg-pink-600 text-white shadow-lg"
                                                : "text-indigo-400 hover:bg-white/5 border border-indigo-500/20"
                                        }`}
                                    >
                                        <Volume2 size={16} />{" "}
                                        {isPlayingAudio
                                            ? "Silenciar"
                                            : "Escuchar a Senpai"}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Nav Sticky */}
            <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-3xl border-b border-white/5 shadow-2xl mt-24">
                <div className="container mx-auto px-6 py-5 flex flex-col lg:flex-row items-center justify-between gap-6">
                    <nav className="flex gap-2 p-1.5 bg-white/3 rounded-4xl border border-white/5 overflow-x-auto no-scrollbar w-full lg:w-auto shadow-inner">
                        {Object.entries(tabs).map(([id, info]) => {
                            const Icon = info.icon;
                            return (
                                <button
                                    key={id}
                                    onClick={() => {
                                        setActiveTab(id);
                                        window.scrollTo({
                                            top: 0,
                                            behavior: "smooth",
                                        });
                                    }}
                                    className={`flex items-center gap-2 px-6 py-3 rounded-3xl font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap ${
                                        activeTab === id
                                            ? `bg-linear-to-r ${info.color} text-white shadow-lg scale-105`
                                            : "text-slate-500 hover:text-pink-400 hover:bg-white/5"
                                    }`}
                                >
                                    <Icon size={16} /> {info.label}
                                </button>
                            );
                        })}
                    </nav>
                    <div className="relative w-full lg:w-96 group">
                        <Search
                            className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-pink-500 transition-colors"
                            size={18}
                        />
                        <input
                            className="w-full pl-14 pr-6 py-4 bg-black/40 border border-white/5 rounded-3xl outline-none focus:border-pink-500/30 text-sm font-bold shadow-inner transition-all placeholder:text-slate-700 text-slate-200"
                            placeholder="Filtro rápido..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Grid Animes */}
            <main className="container mx-auto px-6 mt-20 relative z-10 pb-20">
                {error && (
                    <div className="p-6 bg-red-500/10 text-red-400 rounded-3xl mb-10 border border-red-500/20 text-center font-bold">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
                    {filtered.map((a, i) => (
                        <div
                            key={`${a.mal_id}-${i}`}
                            className="group bg-slate-900/20 backdrop-blur-md border border-white/5 rounded-[2.5rem] overflow-hidden hover:bg-slate-900/40 transition-all duration-500 hover:-translate-y-3 flex flex-col shadow-xl"
                        >
                            <div className="relative h-112 w-full overflow-hidden">
                                <img
                                    src={a.images?.jpg?.large_image_url}
                                    alt={a.title}
                                    className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-110"
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 bg-linear-to-t from-background via-transparent to-black/20" />
                                <div className="absolute top-6 left-6">
                                    <div className="bg-white text-black font-black text-xl w-12 h-12 flex items-center justify-center rounded-2xl shadow-xl">
                                        {i + 1}
                                    </div>
                                </div>
                                {a.score && (
                                    <div className="absolute bottom-6 left-6 bg-black/80 backdrop-blur-md px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-black border border-white/10">
                                        <Star
                                            size={14}
                                            className="text-yellow-400 fill-yellow-400"
                                        />
                                        <span className="text-white">
                                            {a.score}
                                        </span>
                                    </div>
                                )}
                                <div className="absolute bottom-6 right-6 bg-white/10 p-2.5 rounded-xl backdrop-blur-md border border-white/10">
                                    {a.type === "Movie" ? (
                                        <Film
                                            className="text-pink-200"
                                            size={18}
                                        />
                                    ) : (
                                        <Tv
                                            className="text-indigo-200"
                                            size={18}
                                        />
                                    )}
                                </div>
                            </div>

                            <div className="p-8 grow flex flex-col">
                                <h3 className="text-xl font-black mb-3 line-clamp-2 group-hover:text-pink-500 transition-colors uppercase leading-tight text-slate-100">
                                    {a.title}
                                </h3>
                                <div className="flex flex-wrap gap-2 mb-6">
                                    {a.genres?.slice(0, 2).map((g) => (
                                        <span
                                            key={g.mal_id}
                                            className="text-[9px] font-black uppercase px-3 py-1.5 bg-white/5 rounded-lg text-slate-400 border border-white/5"
                                        >
                                            {g.name}
                                        </span>
                                    ))}
                                </div>
                                <p className="text-xs text-slate-500 leading-relaxed line-clamp-3 mb-8 group-hover:text-slate-400 transition-colors">
                                    {a.synopsis ||
                                        "Sin información disponible."}
                                </p>
                                <div className="mt-auto pt-6 border-t border-white/5 space-y-4">
                                    <button
                                        onClick={() => handleAnalyze(a)}
                                        className="w-full bg-white/2 hover:bg-pink-600 hover:text-white border border-white/10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-pink-500 flex items-center justify-center gap-2 transition-all active:scale-95 group/btn"
                                    >
                                        <Cpu
                                            size={14}
                                            className="group-hover/btn:rotate-180 transition-transform duration-500"
                                        />{" "}
                                        Análisis Pro
                                    </button>
                                    <div className="flex justify-between items-center px-1">
                                        <span className="text-[9px] font-bold uppercase text-slate-600">
                                            MAL ID: {a.mal_id}
                                        </span>
                                        <a
                                            href={a.url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-slate-600 hover:text-white transition-colors hover:scale-110"
                                        >
                                            <ExternalLink size={16} />
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Cargar Más */}
                {pages[activeTab] < 4 && !searchTerm && (
                    <div className="mt-24 text-center pb-10">
                        <button
                            onClick={() => {
                                const next = pages[activeTab] + 1;
                                setPages((p) => ({ ...p, [activeTab]: next }));
                                fetchAnime(activeTab, next);
                            }}
                            disabled={loading}
                            className="group relative bg-white text-black px-16 py-6 rounded-[2.5rem] font-black uppercase tracking-[0.2em] hover:bg-pink-600 hover:text-white transition-all shadow-2xl disabled:opacity-50 active:scale-95 overflow-hidden mx-auto flex items-center gap-4"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin" size={24} />
                            ) : (
                                <Plus
                                    size={24}
                                    className="group-hover:rotate-90 transition-transform duration-500"
                                />
                            )}
                            <span>Cargar Más</span>
                        </button>
                    </div>
                )}
            </main>

            {/* Modal Análisis */}
            {analysisTarget && (
                <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/90 backdrop-blur-2xl animate-in fade-in duration-300">
                    <div className="w-full max-w-2xl bg-[#08080c] border border-white/10 rounded-[3rem] p-10 relative shadow-2xl shadow-pink-900/20">
                        <button
                            onClick={() => setAnalysisTarget(null)}
                            className="absolute top-8 right-8 text-slate-500 hover:text-white transition-colors bg-white/5 rounded-full p-2"
                        >
                            ✕
                        </button>
                        <div className="flex items-center gap-6 mb-8">
                            <img
                                src={
                                    analysisTarget.images?.jpg?.small_image_url
                                }
                                className="w-20 h-28 object-cover rounded-2xl border border-white/10 shadow-lg"
                                alt="poster"
                            />
                            <div>
                                <h2 className="text-2xl md:text-3xl font-black italic tracking-tighter mb-2 uppercase text-white leading-none">
                                    {analysisTarget.title}
                                </h2>
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 rounded-full text-indigo-400 font-black uppercase text-[9px] tracking-widest border border-indigo-500/20">
                                    <Cpu size={12} className="animate-pulse" />{" "}
                                    Motor de Análisis v8.0
                                </div>
                            </div>
                        </div>

                        {isAnalyzing ? (
                            <div className="py-20 flex flex-col items-center gap-6 text-center">
                                <Loader2
                                    className="animate-spin text-pink-500"
                                    size={48}
                                />
                                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-pink-500 animate-pulse">
                                    Procesando Datos...
                                </p>
                            </div>
                        ) : (
                            <div className="animate-in fade-in slide-in-from-bottom-6">
                                <div className="text-slate-300 text-lg leading-relaxed font-medium mb-10 italic border-l-4 border-pink-600 pl-6 py-4 bg-white/2 rounded-r-2xl">
                                    <FormattedText text={analysisText} />
                                </div>
                                <div className="flex gap-4">
                                    <button
                                        onClick={() => speak(analysisText)}
                                        className="flex-1 bg-linear-to-r from-pink-600 to-rose-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:scale-[1.02] transition-all shadow-xl active:scale-95 text-xs"
                                    >
                                        <Volume2 size={18} />{" "}
                                        {isPlayingAudio
                                            ? "Silenciar"
                                            : "Escuchar"}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Footer */}
            <footer className="bg-black/40 pt-24 pb-16 text-center border-t border-white/5 relative overflow-hidden mt-20">
                <div className="relative z-10">
                    <div className="text-4xl font-black italic tracking-tighter mb-8 opacity-40 select-none uppercase text-white">
                        ANIME HUB
                    </div>
                    <p className="text-[10px] text-slate-600 font-bold uppercase tracking-[0.4em] mb-4">
                        © {new Date().getFullYear()} OTAKU SYSTEM •
                        FeryaelJustice
                    </p>
                </div>
            </footer>

            {showScrollTop && (
                <button
                    onClick={() =>
                        window.scrollTo({ top: 0, behavior: "smooth" })
                    }
                    className="fixed bottom-10 right-10 z-100 w-16 h-16 bg-linear-to-br from-pink-600 to-rose-600 text-white rounded-2xl flex items-center justify-center shadow-2xl active:scale-90 transition-all border border-white/20 hover:-translate-y-1"
                >
                    <ChevronUp size={30} />
                </button>
            )}
        </div>
    );
}
