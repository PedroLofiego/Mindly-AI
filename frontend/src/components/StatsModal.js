import { X, BarChart3, Flame, Calendar } from "lucide-react";

export default function StatsModal({ stats, onClose }) {
  if (!stats) return null;

  const { streak } = stats;
  const daysOfWeek = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-purple-400" />
            Meu Progresso
          </h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Streak Section */}
        <div className="bg-gradient-to-br from-amber-500/20 to-orange-500/10 rounded-xl p-4 mb-6 border border-amber-500/30">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-amber-500/20 ${streak?.current_streak > 0 ? 'streak-fire animate-fire' : ''}`}>
                <Flame className="w-8 h-8 text-amber-400" />
              </div>
              <div>
                <p className="text-3xl font-bold text-white">{streak?.current_streak || 0}</p>
                <p className="text-sm text-amber-400">dias de streak</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold text-white">{streak?.longest_streak || 0}</p>
              <p className="text-xs text-slate-400">recorde</p>
            </div>
          </div>
          
          {/* Weekly Calendar */}
          <div className="flex items-center gap-1 justify-between">
            {daysOfWeek.map((day, i) => {
              const isActive = streak?.streak_calendar?.[i] && streak.streak_calendar[i] !== "";
              const isToday = i === 6;
              return (
                <div key={i} className="flex flex-col items-center gap-1">
                  <span className="text-xs text-slate-500">{day}</span>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                    isActive 
                      ? 'bg-gradient-to-br from-amber-400 to-orange-500' 
                      : isToday && !isActive
                        ? 'border-2 border-dashed border-amber-500/50 bg-[#1e293b]'
                        : 'bg-[#1e293b]'
                  }`}>
                    {isActive && <Flame className="w-4 h-4 text-white" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-[#030712] rounded-xl p-4 border border-[#1e293b]">
            <p className="text-3xl font-bold text-blue-400">{stats.total_sessions}</p>
            <p className="text-sm text-slate-500">Conversas</p>
          </div>
          <div className="bg-[#030712] rounded-xl p-4 border border-[#1e293b]">
            <p className="text-3xl font-bold text-green-400">{stats.total_messages}</p>
            <p className="text-sm text-slate-500">Perguntas</p>
          </div>
        </div>

        <div className="bg-[#030712] rounded-xl p-4 border border-[#1e293b] mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-slate-500" />
            <p className="text-sm text-slate-500">Total de dias estudados</p>
          </div>
          <p className="text-2xl font-bold text-white">{streak?.total_study_days || 0} dias</p>
        </div>

        {stats.favorite_subject && (
          <div className="bg-[#030712] rounded-xl p-4 border border-[#1e293b] mb-4">
            <p className="text-sm text-slate-500 mb-1">Matéria Favorita</p>
            <p className="text-lg font-semibold text-white">{stats.favorite_subject}</p>
          </div>
        )}

        {stats.subjects_studied && stats.subjects_studied.length > 0 && (
          <div>
            <p className="text-sm text-slate-500 mb-2">Matérias Estudadas</p>
            <div className="flex flex-wrap gap-2">
              {stats.subjects_studied.map((subj) => (
                <span key={subj} className="px-3 py-1 bg-[#030712] border border-[#1e293b] rounded-full text-sm text-slate-300">
                  {subj}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
