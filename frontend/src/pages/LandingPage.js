import { motion } from "framer-motion";
import { ArrowRight, Brain, Image as ImageIcon, BarChart3, Zap, Flame, Sparkles, BookOpen } from "lucide-react";

export default function LandingPage({ onStart }) {
  const features = [
    {
      icon: <Brain className="w-6 h-6" />,
      title: "Aprendizado Personalizado",
      description: "Mapeamos seu estilo VARK e adaptamos cada explicação ao seu jeito de aprender",
      color: "text-blue-400",
      bg: "bg-blue-500/10"
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: "Analogias Inteligentes",
      description: "Conectamos conceitos com seus interesses: games, animes, séries e muito mais",
      color: "text-green-400",
      bg: "bg-green-500/10"
    },
    {
      icon: <ImageIcon className="w-6 h-6" />,
      title: "Análise de Questões",
      description: "Tire foto da questão e receba explicação detalhada passo a passo",
      color: "text-orange-400",
      bg: "bg-orange-500/10"
    },
    {
      icon: <Flame className="w-6 h-6" />,
      title: "Streaks Diários",
      description: "Mantenha sua sequência de estudos e acompanhe seu progresso",
      color: "text-amber-400",
      bg: "bg-amber-500/10"
    }
  ];

  const subjects = [
    { name: "Matemática", color: "bg-blue-500" },
    { name: "Física", color: "bg-purple-500" },
    { name: "Química", color: "bg-green-500" },
    { name: "Biologia", color: "bg-emerald-500" },
    { name: "História", color: "bg-yellow-500" },
    { name: "Geografia", color: "bg-orange-500" },
    { name: "Português", color: "bg-red-500" },
    { name: "Filosofia", color: "bg-fuchsia-500" },
  ];

  return (
    <div className="min-h-screen bg-[#030712] text-white overflow-hidden">
      {/* Background gradient */}
      <div className="fixed inset-0 bg-gradient-to-b from-blue-500/5 via-transparent to-green-500/5 pointer-events-none" />
      
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/revisahub-logo.png" alt="RevisaHub" className="h-9 w-auto" />
            <span className="text-xl font-bold tracking-tight">RevisaHub</span>
          </div>
          <button 
            onClick={onStart}
            data-testid="header-start-btn"
            className="px-5 py-2 rounded-full bg-blue-500 text-white font-semibold hover:bg-blue-400 transition-all"
          >
            Começar Grátis
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0f172a] border border-[#1e293b] mb-8">
              <Zap className="w-4 h-4 text-green-400" />
              <span className="text-sm text-slate-400">Alinhado com a BNCC</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight tracking-tight">
              Aprenda do{" "}
              <span className="gradient-text">seu jeito</span>
              <br />com IA que te entende
            </h1>

            <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
              Tutor de IA que mapeia seu estilo de aprendizagem e cria explicações personalizadas usando analogias dos seus interesses.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={onStart}
                data-testid="hero-start-btn"
                className="group px-8 py-4 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold text-lg hover:from-blue-400 hover:to-blue-500 transition-all flex items-center justify-center gap-2 glow-primary"
              >
                Começar Agora
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <a 
                href="#features"
                className="px-8 py-4 rounded-xl border border-[#1e293b] text-white font-semibold hover:bg-[#0f172a] transition-all"
              >
                Como Funciona
              </a>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="flex flex-wrap justify-center gap-3 mt-16"
          >
            {subjects.map((subject) => (
              <span 
                key={subject.name}
                className="px-4 py-2 rounded-full bg-[#0f172a] border border-[#1e293b] text-sm font-medium flex items-center gap-2"
              >
                <span className={`w-2 h-2 rounded-full ${subject.color}`} />
                {subject.name}
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-[#000000]">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Conheça o <span className="gradient-text">RevisaHub</span>
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Seu parceiro de estudos com inteligência artificial
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 rounded-2xl bg-[#0f172a] border border-[#1e293b] hover:border-blue-500/50 transition-all group"
              >
                <div className={`w-12 h-12 rounded-xl ${feature.bg} ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-slate-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-3xl bg-gradient-to-br from-[#0f172a] to-[#030712] border border-[#1e293b] p-8 md:p-12"
          >
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                  Tire dúvidas como se estivesse conversando com um amigo
                </h2>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center text-sm flex-shrink-0 mt-0.5">✓</span>
                    <span className="text-slate-400">Explicações personalizadas ao seu perfil VARK</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center text-sm flex-shrink-0 mt-0.5">✓</span>
                    <span className="text-slate-400">Analogias com games, animes e séries que você ama</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center text-sm flex-shrink-0 mt-0.5">✓</span>
                    <span className="text-slate-400">Streaks diários para manter a motivação</span>
                  </li>
                </ul>
                <button 
                  onClick={onStart}
                  data-testid="demo-start-btn"
                  className="mt-8 px-6 py-3 rounded-xl bg-blue-500 text-white font-semibold hover:bg-blue-400 transition-all"
                >
                  Experimentar Grátis
                </button>
              </div>
              
              {/* Chat Preview */}
              <div className="bg-[#030712] rounded-2xl border border-[#1e293b] p-4 shadow-2xl">
                <div className="flex items-center gap-2 pb-4 border-b border-[#1e293b]">
                  <img src="/revisahub-logo.png" alt="" className="h-8 w-auto" />
                  <span className="font-semibold">RevisaHub AI</span>
                  <span className="ml-auto flex items-center gap-2">
                    <Flame className="w-4 h-4 text-amber-400" />
                    <span className="text-sm text-amber-400 font-medium">7 dias</span>
                  </span>
                </div>
                <div className="py-4 space-y-4 min-h-[200px]">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#1e293b] flex-shrink-0" />
                    <div className="bg-[#0f172a] rounded-2xl rounded-tl-none p-4 max-w-[80%]">
                      <p className="text-sm">Não entendi por que a mitocôndria é a "usina de energia" da célula...</p>
                    </div>
                  </div>
                  <div className="flex gap-3 justify-end">
                    <div className="bg-blue-500/20 rounded-2xl rounded-tr-none p-4 max-w-[80%]">
                      <p className="text-sm">Pensa assim: se a célula fosse o <strong>mapa do LoL</strong>, a mitocôndria seria o <strong>Nexus</strong>! 🎮</p>
                      <p className="text-sm mt-2">Ela gera a energia (ATP) que todas as outras estruturas precisam para funcionar - assim como o Nexus é o coração que mantém todo o time vivo!</p>
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center flex-shrink-0">
                      <Zap className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-t from-[#000000] to-transparent">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Pronto para estudar de um jeito diferente?
            </h2>
            <p className="text-slate-400 text-lg mb-10">
              Comece agora e descubra como é aprender com um tutor que te entende de verdade.
            </p>
            <button 
              onClick={onStart}
              data-testid="cta-start-btn"
              className="px-10 py-5 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold text-xl hover:from-blue-400 hover:to-blue-500 transition-all glow-primary"
            >
              Começar Grátis
            </button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-[#1e293b]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src="/revisahub-logo.png" alt="RevisaHub" className="h-6 w-auto opacity-70" />
            <span className="text-slate-500">© 2025</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-slate-500">
            <span>Feito para estudantes brasileiros</span>
            <span className="flex items-center gap-1">
              <BookOpen className="w-4 h-4" />
              Alinhado com BNCC
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
