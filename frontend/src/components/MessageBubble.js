import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { Zap, User, Camera } from "lucide-react";

export default function MessageBubble({ msg }) {
  const isUser = msg.role === "user";
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-start gap-3 ${isUser ? "flex-row-reverse" : ""}`}
    >
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
        isUser ? "bg-[#1e293b]" : "bg-gradient-to-br from-blue-500 to-green-500"
      }`}>
        {isUser ? (
          <User className="w-5 h-5 text-slate-400" />
        ) : (
          <Zap className="w-5 h-5 text-white" />
        )}
      </div>
      
      <div className={`max-w-[85%] md:max-w-[75%] p-4 rounded-2xl ${
        isUser
          ? "bg-blue-500/20 border border-blue-500/30 rounded-tr-none"
          : "bg-[#0f172a] border border-[#1e293b] rounded-tl-none"
      }`}>
        {msg.has_image && (
          <div className="mb-2 flex items-center gap-2 text-xs text-slate-500">
            <Camera className="w-4 h-4" />
            Imagem enviada
          </div>
        )}
        {isUser ? (
          <p className="text-[15px] text-white whitespace-pre-wrap">{msg.content}</p>
        ) : (
          <div className="prose-rh text-[15px]">
            <ReactMarkdown>{msg.content}</ReactMarkdown>
          </div>
        )}
      </div>
    </motion.div>
  );
}
