import { History, Plus, BarChart3, LogOut, Flame } from "lucide-react";

export default function ChatSidebar({ 
  profile, 
  sessions, 
  currentSessionId, 
  sidebarOpen, 
  streak,
  onNewChat, 
  onLoadSession, 
  onShowStats, 
  onLogout,
  onCloseSidebar,
  subjects
}) {
  return (
    <>
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden" 
          onClick={onCloseSidebar} 
        />
      )}

      <div className={`fixed md:relative z-50 md:z-auto w-72 h-full flex flex-col bg-[#000000] border-r border-[#1e293b] transition-transform duration-300 ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      }`}>
        {/* Logo & Streak */}
        <div className="p-4 border-b border-[#1e293b]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <img src="/revisahub-logo.png" alt="RevisaHub" className="h-7 w-auto" />
              <span className="font-semibold text-white">RevisaHub</span>
            </div>
            {streak && streak.current_streak > 0 && (
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-amber-500/20 border border-amber-500/30">
                <Flame className="w-4 h-4 text-amber-400 streak-fire" />
                <span className="text-sm font-medium text-amber-400">{streak.current_streak}</span>
              </div>
            )}
          </div>
          <button
            onClick={onNewChat}
            data-testid="new-chat-btn"
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#0f172a] border border-[#1e293b] hover:border-blue-500 text-white font-medium transition-all"
          >
            <Plus className="w-5 h-5" />
            Nova Conversa
          </button>
        </div>

        {/* History */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="flex items-center gap-2 text-slate-500 text-sm font-medium mb-3">
            <History className="w-4 h-4" />
            Histórico
          </div>
          {sessions.length === 0 ? (
            <p className="text-sm text-slate-600 text-center py-4">
              Nenhuma conversa ainda
            </p>
          ) : (
            <div className="space-y-1">
              {sessions.map((session) => {
                const subj = subjects.find(s => s.label === session.subject);
                return (
                  <button
                    key={session.id}
                    onClick={() => onLoadSession(session.id, subj)}
                    data-testid={`session-${session.id}`}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      currentSessionId === session.id
                        ? "bg-[#0f172a] border border-[#1e293b]"
                        : "hover:bg-[#0f172a]"
                    }`}
                  >
                    <span className="text-xs font-medium text-blue-400">
                      {session.subject}
                    </span>
                    <p className="text-sm text-slate-300 truncate">
                      {session.title}
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Stats Button */}
        <div className="p-4 border-t border-[#1e293b]">
          <button
            onClick={onShowStats}
            data-testid="stats-btn"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[#0f172a] transition-colors"
          >
            <BarChart3 className="w-5 h-5 text-purple-400" />
            <span className="text-slate-300">Meu Progresso</span>
          </button>
        </div>

        {/* Profile */}
        <div className="p-4 border-t border-[#1e293b]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center font-bold text-white text-sm">
              {profile.name.substring(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium text-white truncate">
                {profile.name}
              </p>
              <p className="text-xs text-slate-500 capitalize">
                {profile.canal_sensorial || profile.vark_primary}
              </p>
            </div>
            <button
              onClick={onLogout}
              data-testid="logout-btn"
              className="p-2 text-slate-500 hover:text-red-400"
              title="Sair"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
