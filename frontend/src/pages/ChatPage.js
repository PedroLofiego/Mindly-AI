import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { Send, Image as ImageIcon, X, Sparkles, MessageSquare, Loader2, Menu } from "lucide-react";
import { API } from "../App";
import MessageBubble from "../components/MessageBubble";
import ChatSidebar from "../components/ChatSidebar";
import StatsModal from "../components/StatsModal";

const SUBJECTS = [
  { id: "matematica", label: "Matemática", color: "#58A6FF", emoji: "📐" },
  { id: "fisica", label: "Física", color: "#A371F7", emoji: "⚡" },
  { id: "quimica", label: "Química", color: "#7EE787", emoji: "🧪" },
  { id: "biologia", label: "Biologia", color: "#56D364", emoji: "🧬" },
  { id: "historia", label: "História", color: "#D29922", emoji: "📜" },
  { id: "geografia", label: "Geografia", color: "#F78166", emoji: "🌍" },
  { id: "portugues", label: "Português", color: "#FF7B72", emoji: "📝" },
  { id: "filosofia", label: "Filosofia", color: "#D2A8FF", emoji: "💭" },
];

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

  const generateSessionId = () => `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const startNewChat = useCallback(() => {
    const newSessionId = generateSessionId();
    setCurrentSessionId(newSessionId);
    setMessages([{
      id: "welcome",
      role: "assistant",
      content: `E aí, **${profile.name}**! 👋\n\nSou o **Mindly**, seu tutor de IA!\n\nVi que você curte **${profile.cultural_interest}** - vou usar isso nas explicações.\n\n**Escolha uma matéria** e manda sua dúvida! 📚`,
      timestamp: new Date()
    }]);
    setSelectedSubject(null);
    setSidebarOpen(false);
  }, [profile.name, profile.cultural_interest]);

  useEffect(() => {
    async function loadData() {
      try {
        const [sessionsRes, statsRes] = await Promise.all([
          axios.get(`${API}/sessions/${profile.id}`),
          axios.get(`${API}/progress/${profile.id}`)
        ]);
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
      setMessages(response.data.map(msg => ({ ...msg, timestamp: new Date(msg.timestamp) })));
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

      setMessages(prev => [...prev, { id: response.data.message_id, role: "assistant", content: response.data.response, timestamp: new Date() }]);
      const sessionsRes = await axios.get(`${API}/sessions/${profile.id}`);
      setSessions(sessionsRes.data);
    } catch (error) {
      setMessages(prev => [...prev, { id: `error-${Date.now()}`, role: "assistant", content: "Desculpe, tive um problema. Pode tentar novamente?", timestamp: new Date() }]);
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
      <ChatSidebar
        profile={profile}
        sessions={sessions}
        currentSessionId={currentSessionId}
        sidebarOpen={sidebarOpen}
        onNewChat={startNewChat}
        onLoadSession={loadSession}
        onShowStats={() => setShowStats(true)}
        onLogout={onLogout}
        onCloseSidebar={() => setSidebarOpen(false)}
        subjects={SUBJECTS}
      />

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
          {messages.map((msg) => <MessageBubble key={msg.id} msg={msg} />)}
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
                {SUBJECTS.map((s) => (
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
            <button onClick={() => fileInputRef.current?.click()} data-testid="upload-image-btn" className="p-2 text-[#8B949E] hover:text-white hover:bg-[#30363D] rounded-lg transition-colors"><ImageIcon className="w-5 h-5" /></button>
            <textarea value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={handleKeyDown} placeholder="Digite sua dúvida ou mande uma foto..." data-testid="chat-input" className="flex-1 bg-transparent border-none text-white resize-none max-h-32 py-2 min-h-[44px] placeholder-[#8B949E] focus:outline-none" rows={1} />
            <button onClick={initiateSend} disabled={(!inputValue.trim() && !imageBase64) || isLoading} data-testid="send-message-btn" className="p-2 bg-[#58A6FF] text-black rounded-xl hover:bg-[#79B8FF] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"><Send className="w-5 h-5" /></button>
          </div>
          <p className="text-center text-xs text-[#8B949E] mt-2">Explicações adaptadas ao seu perfil {profile.vark_primary} usando analogias de {profile.cultural_interest}</p>
        </div>
      </div>

      <AnimatePresence>
        {showStats && <StatsModal stats={stats} onClose={() => setShowStats(false)} />}
      </AnimatePresence>
    </div>
  );
}
