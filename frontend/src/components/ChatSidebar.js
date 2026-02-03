import { History, Plus, BarChart3, LogOut } from "lucide-react";

export default function ChatSidebar({ 
  profile, 
  sessions, 
  currentSessionId, 
  sidebarOpen, 
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

      <div className={`fixed md:relative z-50 md:z-auto w-72 h-full flex flex-col bg-[#010409] border-r border-[#30363D] transition-transform duration-300 ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      }`}>
        <div className="p-4 border-b border-[#30363D]">
          <button
            onClick={onNewChat}
            data-testid="new-chat-btn"
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#161B22] border border-[#30363D] hover:border-[#58A6FF] text-white font-medium transition-all"
          >
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
            <p className="text-sm text-[#8B949E] text-center py-4">
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
                        ? "bg-[#161B22] border border-[#30363D]"
                        : "hover:bg-[#161B22]"
                    }`}
                  >
                    <span className="text-xs font-medium text-[#58A6FF]">
                      {session.subject}
                    </span>
                    <p className="text-sm text-[#C9D1D9] truncate">
                      {session.title}
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-[#30363D]">
          <button
            onClick={onShowStats}
            data-testid="stats-btn"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[#161B22] transition-colors"
          >
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
              <p className="text-sm font-medium text-white truncate">
                {profile.name}
              </p>
              <p className="text-xs text-[#8B949E] capitalize">
                {profile.vark_primary}
              </p>
            </div>
            <button
              onClick={onLogout}
              data-testid="logout-btn"
              className="p-2 text-[#8B949E] hover:text-[#F78166]"
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
