import { motion } from "framer-motion";
import { X, BarChart3 } from "lucide-react";

export default function StatsModal({ stats, onClose }) {
  if (!stats) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
        className="bg-[#161B22] border border-[#30363D] rounded-2xl p-6 max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-[#A371F7]" />
            Meu Progresso
          </h2>
          <button
            onClick={onClose}
            className="text-[#8B949E] hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-[#0D1117] rounded-xl p-4 border border-[#30363D]">
            <p className="text-3xl font-bold text-[#58A6FF]">
              {stats.total_sessions}
            </p>
            <p className="text-sm text-[#8B949E]">Conversas</p>
          </div>
          <div className="bg-[#0D1117] rounded-xl p-4 border border-[#30363D]">
            <p className="text-3xl font-bold text-[#7EE787]">
              {stats.total_messages}
            </p>
            <p className="text-sm text-[#8B949E]">Perguntas</p>
          </div>
        </div>

        {stats.favorite_subject && (
          <div className="bg-[#0D1117] rounded-xl p-4 border border-[#30363D] mb-4">
            <p className="text-sm text-[#8B949E] mb-1">Matéria Favorita</p>
            <p className="text-lg font-semibold text-white">
              {stats.favorite_subject}
            </p>
          </div>
        )}

        {stats.subjects_studied && stats.subjects_studied.length > 0 && (
          <div>
            <p className="text-sm text-[#8B949E] mb-2">Matérias Estudadas</p>
            <div className="flex flex-wrap gap-2">
              {stats.subjects_studied.map((subj) => (
                <span
                  key={subj}
                  className="px-3 py-1 bg-[#0D1117] border border-[#30363D] rounded-full text-sm text-[#C9D1D9]"
                >
                  {subj}
                </span>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
