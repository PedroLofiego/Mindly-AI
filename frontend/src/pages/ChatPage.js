import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import { Send, Image as ImageIcon, X, Sparkles, User, History, LogOut, MessageSquare, Plus, BarChart3, Loader2, Camera, Menu } from "lucide-react";
import { API } from "../App";

export default function ChatPage({ profile, onLogout }) {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [showSubjectSelector, setShowSubjectSelector] = useState(false);
  const [pendingMessage, setPendingMessage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [stats, setStats] = useState(null);
  const [showStats, setShowStats] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const subjects = [
    { id: "matematica", label: "Matemática", color: "#58A6FF", emoji: "📐" },
    { id: "fisica", label: "Física", color: "#A371F7", emoji: "⚡" },
    { id: "quimica", label: "Química", color: "#7EE787", emoji: "🧪" },
    { id: "biologia", label: "Biologia", color: "#56D364", emoji: "🧬" },
    { id: "historia", label: "História", color: "#D29922", emoji: "📜" },
    { id: "geografia", label: "Geografia", color: "#F78166", emoji: "🌍" },
    { id: "portugues", label: "Português", color: "#FF7B72", emoji: "📝" },
    { id: "filosofia", label: "Filosofia", color: "#D2A8FF", emoji: "💭" },
  ];

  const generateSessionId = () => `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const startNewChat = useCallback(() => {
    const newSessionId = generateSessionId();
    setCurrentSessionId(newSessionId);
    const welcomeMsg = {
      id: "welcome",
      role: "assistant",
      content: `E aí, **${profile.name}**! 👋\n\nSou o **Mindly**, seu tutor de IA personalizado!\n\nVi que você curte **${profile.cultural_interest}** - vou usar isso pra criar analogias que fazem sentido pra você.\n\n**Escolha uma matéria** e manda sua dúvida! Pode mandar texto ou foto de uma questão. 📚`,
      timestamp: new Date()
    };
    setMessages([welcomeMsg]);
    setSelectedSubject(null);
    setSidebarOpen(false);
  }, [profile.name, profile.cultural_interest]);

  useEffect(() => {
    async function loadData() {
      try {
        const sessionsRes = await axios.get(`${API}/sessions/${profile.id}`);
        const statsRes = await axios.get(`${API}/progress/${profile.id}`);
        setSessions(sessionsRes.data);
        setStats(statsRes.data);
      } catch (error) {
        console.error("Error loading data:", error);
      }
    }
    loadData();
  }, [profile.id]);

  useEffect(() => {
    if (!currentSessionId) startNewChat();
  }, [currentSessionId, startNewChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  async function loadSession(sessionId, subject) {
    try {
      const response = await axios.get(`${API}/sessions/${profile.id}/${sessionId}/messages`);
      const loadedMessages = response.data.map(msg => ({ ...msg, timestamp: new Date(msg.timestamp) }));
      setMessages(loadedMessages);
      setCurrentSessionId(sessionId);
      setSelectedSubject(subject);
      setSidebarOpen(false);
    } catch (error) {
      console.error("Error loading session:", error);
    }
  }

  function handleImageUpload(e) {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setImagePreview(event.target.result);
      setImageBase64(event.target.result);
    };
    reader.readAsDataURL(file);
  }

  function removeImage() {
    setImagePreview(null);
    setImageBase64(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function initiateSend() {
    if (!inputValue.trim() && !imageBase64) return;
    if (!selectedSubject) {
      setPendingMessage({ text: inputValue, image: imageBase64 });
      setShowSubjectSelector(true);
    } else {
      sendMessage(inputValue, imageBase64, selectedSubject);
    }
  }

  function handleSubjectSelect(subject) {
    setSelectedSubject(subject);
    setShowSubjectSelector(false);
    if (pendingMessage) {
      sendMessage(pendingMessage.text, pendingMessage.image, subject);
      setPendingMessage(null);
    }
  }

  async function sendMessage(text, image, subject) {
    if (!text.trim() && !image) return;

    const userMsg = { id: Date.now().toString(), role: "user", content: text, has_image: !!image, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInputValue("");
    removeImage();
    setIsLoading(true);

    try {
      const response = await axios.post(`${API}/chat`, {
        session_id: currentSessionId,
        profile_id: profile.id,
        message: text || "Por favor, analise esta imagem e me ajude a entender.",
        subject: subject.label,
        image_base64: image
      });

      const assistantMsg = { id: response.data.message_id, role: "assistant", content: response.data.response, timestamp: new Date() };
      setMessages(prev => [...prev, assistantMsg]);
      
      const sessionsRes = await axios.get(`${API}/sessions/${profile.id}`);
      setSessions(sessionsRes.data);
    } catch (error) {
      const errorMsg = { id: `error-${Date.now()}`, role: "assistant", content: "Desculpe, tive um problema. Pode tentar novamente?", timestamp: new Date() };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      initiateSend();
    }
  }

  return (
    <div className="flex h-screen bg-[#0D1117] overflow-hidden">
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />}

      <div className={`fixed md:relative z-50 md:z-auto w-72 h-full flex flex-col bg-[#010409] border-r border-[#30363D] transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
        <div className="p-4 border-b border-[#30363D]">
          <button onClick={startNewChat} data-testid="new-chat-btn" className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#161B22] border border-[#30363D] hover:border-[#58A6FF] text-white font-medium transition-all">
            <Plus className="w-5 h-5" />
            Nova Conversa
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="flex items-center gap-2 text-[#8B949E] text-sm font-medium mb-3">
            <History className="w-4 h-4" />
            Histórico
          </div>
          {sessions.length === 0 ? (
            <p className="text-sm text-[#8B949E] text-center py-4">Nenhuma conversa ainda</p>
          ) : (
            <div className="space-y-1">
              {sessions.map((session) => {
                const subj = subjects.find(s => s.label === session.subject);
                return (
                  <button key={session.id} onClick={() => loadSession(session.id, subj)} data-testid={`session-${session.id}`} className={`w-full text-left p-3 rounded-lg transition-colors ${currentSessionId === session.id ? "bg-[#161B22] border border-[#30363D]" : "hover:bg-[#161B22]"}`}>
                    <span className="text-xs font-medium text-[#58A6FF]">{session.subject}</span>
                    <p className="text-sm text-[#C9D1D9] truncate">{session.title}</p>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-[#30363D]">
          <button onClick={() => setShowStats(true)} data-testid="stats-btn" className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[#161B22] transition-colors">
            <BarChart3 className="w-5 h-5 text-[#A371F7]" />
            <span className="text-[#C9D1D9]">Meu Progresso</span>
          </button>
        </div>

        <div className="p-4 border-t border-[#30363D]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#58A6FF] to-[#7EE787] flex items-center justify-center font-bold text-black text-sm">
              {profile.name.substring(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium text-white truncate">{profile.name}</p>
              <p className="text-xs text-[#8B949E] capitalize">{profile.vark_primary}</p>
            </div>
            <button onClick={onLogout} data-testid="logout-btn" className="p-2 text-[#8B949E] hover:text-[#F78166]" title="Sair">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 flex items-center justify-between px-4 md:px-6 border-b border-[#30363D] bg-[#0D1117]/80 backdrop-blur-lg">
          <div className="flex items-center gap-3">
            <button className="md:hidden p-2 text-[#8B949E] hover:text-white" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-6 h-6" />
            </button>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#58A6FF] to-[#7EE787] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-black" />
            </div>
            <div>
              <h1 className="font-bold text-white">Mindly AI</h1>
              <p className="text-xs text-[#8B949E]">Tutor Personalizado</p>
            </div>
          </div>
          {selectedSubject && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#161B22] border border-[#30363D]">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: selectedSubject.color }} />
              <span className="text-sm text-[#C9D1D9]">{selectedSubject.label}</span>
            </div>
          )}
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {messages.map((msg) => (
            <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex items-start gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${msg.role === "user" ? "bg-[#30363D]" : "bg-gradient-to-br from-[#58A6FF] to-[#7EE787]"}`}>
                {msg.role === "user" ? <User className="w-5 h-5 text-[#C9D1D9]" /> : <Sparkles className="w-5 h-5 text-black" />}
              </div>
              <div className={`max-w-[85%] md:max-w-[75%] p-4 rounded-2xl ${msg.role === "user" ? "bg-[#58A6FF]/20 border border-[#58A6FF]/30 rounded-tr-none" : "bg-[#161B22] border border-[#30363D] rounded-tl-none"}`}>
                {msg.has_image && <div className="mb-2 flex items-center gap-2 text-xs text-[#8B949E]"><Camera className="w-4 h-4" />Imagem enviada</div>}
                {msg.role === "user" ? (
                  <p className="text-[15px] text-white whitespace-pre-wrap">{msg.content}</p>
                ) : (
                  <div className="prose-mindly text-[15px]"><ReactMarkdown>{msg.content}</ReactMarkdown></div>
                )}
              </div>
            </motion.div>
          ))}

          {isLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#58A6FF] to-[#7EE787] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-black" />
              </div>
              <div className="bg-[#161B22] border border-[#30363D] rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-2">
                <Loader2 className="w-4 h-4 text-[#58A6FF] animate-spin" />
                <span className="text-sm text-[#8B949E]">Pensando...</span>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <AnimatePresence>
          {showSubjectSelector && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="absolute bottom-28 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-2xl bg-[#161B22] border border-[#30363D] rounded-2xl p-6 shadow-2xl z-20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold flex items-center gap-2"><MessageSquare className="w-5 h-5 text-[#58A6FF]" />Qual é a matéria?</h3>
                <button onClick={() => setShowSubjectSelector(false)} className="text-[#8B949E] hover:text-white"><X className="w-5 h-5" /></button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {subjects.map((s) => (
                  <button key={s.id} onClick={() => handleSubjectSelect(s)} data-testid={`subject-${s.id}`} className="flex items-center gap-3 p-3 rounded-xl bg-[#0D1117] border border-[#30363D] hover:border-[#58A6FF] transition-all">
                    <span className="text-lg">{s.emoji}</span>
                    <span className="text-sm text-[#C9D1D9] font-medium">{s.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="p-4 border-t border-[#30363D] bg-[#0D1117]">
          {imagePreview && (
            <div className="mb-3 relative inline-block">
              <img src={imagePreview} alt="Preview" className="h-20 rounded-lg border border-[#30363D]" />
              <button onClick={removeImage} className="absolute -top-2 -right-2 w-6 h-6 bg-[#F78166] rounded-full flex items-center justify-center"><X className="w-4 h-4 text-white" /></button>
            </div>
          )}
          <div className="flex items-end gap-2 bg-[#161B22] border border-[#30363D] rounded-2xl p-2 focus-within:border-[#58A6FF] transition-colors">
            <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
            <button onClick={() => fileInputRef.current?.click()} data-testid="upload-image-btn" className="p-2 text-[#8B949E] hover:text-white hover:bg-[#30363D] rounded-lg transition-colors" title="Enviar imagem"><ImageIcon className="w-5 h-5" /></button>
            <textarea value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={handleKeyDown} placeholder="Digite sua dúvida ou mande uma foto..." data-testid="chat-input" className="flex-1 bg-transparent border-none text-white resize-none max-h-32 py-2 min-h-[44px] placeholder-[#8B949E] focus:outline-none" rows={1} />
            <button onClick={initiateSend} disabled={(!inputValue.trim() && !imageBase64) || isLoading} data-testid="send-message-btn" className="p-2 bg-[#58A6FF] text-black rounded-xl hover:bg-[#79B8FF] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"><Send className="w-5 h-5" /></button>
          </div>
          <p className="text-center text-xs text-[#8B949E] mt-2">Explicações adaptadas ao seu perfil {profile.vark_primary} usando analogias de {profile.cultural_interest}</p>
        </div>
      </div>

      <AnimatePresence>
        {showStats && stats && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setShowStats(false)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-[#161B22] border border-[#30363D] rounded-2xl p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2"><BarChart3 className="w-6 h-6 text-[#A371F7]" />Meu Progresso</h2>
                <button onClick={() => setShowStats(false)} className="text-[#8B949E] hover:text-white"><X className="w-5 h-5" /></button>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-[#0D1117] rounded-xl p-4 border border-[#30363D]">
                  <p className="text-3xl font-bold text-[#58A6FF]">{stats.total_sessions}</p>
                  <p className="text-sm text-[#8B949E]">Conversas</p>
                </div>
                <div className="bg-[#0D1117] rounded-xl p-4 border border-[#30363D]">
                  <p className="text-3xl font-bold text-[#7EE787]">{stats.total_messages}</p>
                  <p className="text-sm text-[#8B949E]">Perguntas</p>
                </div>
              </div>
              {stats.favorite_subject && (
                <div className="bg-[#0D1117] rounded-xl p-4 border border-[#30363D] mb-4">
                  <p className="text-sm text-[#8B949E] mb-1">Matéria Favorita</p>
                  <p className="text-lg font-semibold text-white">{stats.favorite_subject}</p>
                </div>
              )}
              {stats.subjects_studied && stats.subjects_studied.length > 0 && (
                <div>
                  <p className="text-sm text-[#8B949E] mb-2">Matérias Estudadas</p>
                  <div className="flex flex-wrap gap-2">
                    {stats.subjects_studied.map((subj) => (
                      <span key={subj} className="px-3 py-1 bg-[#0D1117] border border-[#30363D] rounded-full text-sm text-[#C9D1D9]">{subj}</span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
