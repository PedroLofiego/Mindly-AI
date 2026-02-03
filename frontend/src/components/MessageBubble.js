import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { Sparkles, User, Camera } from "lucide-react";

export default function MessageBubble({ msg }) {
  const isUser = msg.role === "user";
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-start gap-3 ${isUser ? "flex-row-reverse" : ""}`}
    >
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
        isUser ? "bg-[#30363D]" : "bg-gradient-to-br from-[#58A6FF] to-[#7EE787]"
      }`}>
        {isUser ? (
          <User className="w-5 h-5 text-[#C9D1D9]" />
        ) : (
          <Sparkles className="w-5 h-5 text-black" />
        )}
      </div>
      
      <div className={`max-w-[85%] md:max-w-[75%] p-4 rounded-2xl ${
        isUser
          ? "bg-[#58A6FF]/20 border border-[#58A6FF]/30 rounded-tr-none"
          : "bg-[#161B22] border border-[#30363D] rounded-tl-none"
      }`}>
        {msg.has_image && (
          <div className="mb-2 flex items-center gap-2 text-xs text-[#8B949E]">
            <Camera className="w-4 h-4" />
            Imagem enviada
          </div>
        )}
        {isUser ? (
          <p className="text-[15px] text-white whitespace-pre-wrap">{msg.content}</p>
        ) : (
          <div className="prose-mindly text-[15px]">
            <ReactMarkdown>{msg.content}</ReactMarkdown>
          </div>
        )}
      </div>
    </motion.div>
  );
}
