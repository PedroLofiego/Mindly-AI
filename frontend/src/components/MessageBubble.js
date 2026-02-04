import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { Zap, User, Camera } from "lucide-react";

// Componentes customizados para renderização do Markdown
const MarkdownComponents = {
  // Headers
  h1: ({ children }) => <h1 className="text-xl font-bold text-white mb-3 mt-4">{children}</h1>,
  h2: ({ children }) => <h2 className="text-lg font-bold text-white mb-2 mt-3">{children}</h2>,
  h3: ({ children }) => <h3 className="text-base font-semibold text-white mb-2 mt-3">{children}</h3>,
  
  // Parágrafos
  p: ({ children }) => <p className="text-slate-200 mb-3 leading-relaxed">{children}</p>,
  
  // Strong/Bold
  strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
  
  // Emphasis/Italic
  em: ({ children }) => <em className="text-blue-300 italic">{children}</em>,
  
  // Listas
  ul: ({ children }) => <ul className="list-disc list-inside mb-3 space-y-1 ml-2">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal list-inside mb-3 space-y-1 ml-2">{children}</ol>,
  li: ({ children }) => <li className="text-slate-200">{children}</li>,
  
  // Code inline
  code: ({ inline, children }) => {
    if (inline) {
      return <code className="bg-slate-800 text-green-400 px-1.5 py-0.5 rounded text-sm font-mono">{children}</code>;
    }
    return (
      <pre className="bg-slate-900 p-3 rounded-lg overflow-x-auto my-3 border border-slate-700">
        <code className="text-green-400 text-sm font-mono">{children}</code>
      </pre>
    );
  },
  
  // Pre (code blocks)
  pre: ({ children }) => <div className="my-3">{children}</div>,
  
  // Blockquote
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-blue-500 pl-4 my-3 italic text-slate-300 bg-slate-800/50 py-2 rounded-r">
      {children}
    </blockquote>
  ),
  
  // Horizontal rule
  hr: () => <hr className="border-slate-700 my-4" />,
  
  // Links
  a: ({ href, children }) => (
    <a href={href} className="text-blue-400 hover:text-blue-300 underline" target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  ),
};

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
          <div className="mb-3 flex items-center gap-2 text-xs text-slate-500">
            <Camera className="w-4 h-4" />
            Imagem enviada
          </div>
        )}
        {isUser ? (
          <p className="text-[15px] text-white whitespace-pre-wrap">{msg.content}</p>
        ) : (
          <div className="markdown-content">
            <ReactMarkdown components={MarkdownComponents}>
              {msg.content}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </motion.div>
  );
}
