import { motion } from "framer-motion";
import { Sparkles, Brain, BookOpen, Target, ArrowRight, MessageCircle, Image, BarChart3 } from "lucide-react";

const LandingPage = ({ onStart }) => {
  const features = [
    {
      icon: <Brain className="w-6 h-6" />,
      title: "Metodologia VARK",
      description: "Aprendizado personalizado baseado no seu estilo: Visual, Auditivo, Leitura ou Cinestésico",
      color: "text-[#58A6FF]",
      bg: "bg-[#58A6FF]/10"
    },
    {
      icon: <MessageCircle className="w-6 h-6" />,
      title: "Analogias Inteligentes",
      description: "Explicações conectadas com seus interesses: games, animes, filmes e muito mais",
      color: "text-[#7EE787]",
      bg: "bg-[#7EE787]/10"
    },
    {
      icon: <Image className="w-6 h-6" />,
      title: "Análise de Questões",
      description: "Tire foto da questão e receba explicação detalhada passo a passo",
      color: "text-[#F78166]",
      bg: "bg-[#F78166]/10"
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Acompanhe seu Progresso",
      description: "Relatórios de desempenho e histórico de estudos por matéria",
      color: "text-[#A371F7]",
      bg: "bg-[#A371F7]/10"
    }
  ];

  const subjects = [
    { name: "Matemática", color: "bg-[#58A6FF]" },
    { name: "Física", color: "bg-[#A371F7]" },
    { name: "Química", color: "bg-[#7EE787]" },
    { name: "Biologia", color: "bg-[#56D364]" },
    { name: "História", color: "bg-[#D29922]" },
    { name: "Geografia", color: "bg-[#F78166]" },
    { name: "Português", color: "bg-[#FF7B72]" },
    { name: "Filosofia", color: "bg-[#D2A8FF]" },
  ];

  return (
    <div className="min-h-screen bg-[#0D1117] text-white overflow-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#58A6FF] to-[#7EE787] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-black" />
            </div>
            <span className="text-xl font-bold">MINDLY</span>
          </div>
          <button 
            onClick={onStart}
            data-testid="header-start-btn"
            className="px-5 py-2 rounded-full bg-[#58A6FF] text-black font-semibold hover:bg-[#79B8FF] transition-all"
          >
            Começar Grátis
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#161B22] border border-[#30363D] mb-8">
              <span className="w-2 h-2 rounded-full bg-[#7EE787] animate-pulse" />
              <span className="text-sm text-[#8B949E]">Alinhado com a BNCC</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight">
              Aprenda do{" "}
              <span className="gradient-text">seu jeito</span>
              <br />com IA que te entende
            </h1>

            <p className="text-xl text-[#8B949E] mb-10 max-w-2xl mx-auto">
              Tutor de inteligência artificial que adapta as explicações ao seu estilo de aprendizagem e usa analogias dos seus interesses favoritos.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={onStart}
                data-testid="hero-start-btn"
                className="group px-8 py-4 rounded-xl bg-gradient-to-r from-[#58A6FF] to-[#7EE787] text-black font-bold text-lg hover:opacity-90 transition-all flex items-center justify-center gap-2"
              >
                Começar Agora
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <a 
                href="#features"
                className="px-8 py-4 rounded-xl border border-[#30363D] text-white font-semibold hover:bg-[#161B22] transition-all"
              >
                Como Funciona
              </a>
            </div>
          </motion.div>

          {/* Subjects Pills */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="flex flex-wrap justify-center gap-3 mt-16"
          >
            {subjects.map((subject, i) => (
              <span 
                key={subject.name}
                className="px-4 py-2 rounded-full bg-[#161B22] border border-[#30363D] text-sm font-medium flex items-center gap-2"
              >
                <span className={`w-2 h-2 rounded-full ${subject.color}`} />
                {subject.name}
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-[#010409]">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Conheça o <span className="gradient-text">Mindly</span>
            </h2>
            <p className="text-[#8B949E] text-lg max-w-2xl mx-auto">
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
                className="p-6 rounded-2xl bg-[#161B22] border border-[#30363D] hover:border-[#58A6FF]/50 transition-all group"
              >
                <div className={`w-12 h-12 rounded-xl ${feature.bg} ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-[#8B949E]">{feature.description}</p>
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
            className="rounded-3xl bg-gradient-to-br from-[#161B22] to-[#0D1117] border border-[#30363D] p-8 md:p-12"
          >
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                  Tire dúvidas como se estivesse conversando com um amigo
                </h2>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-[#7EE787]/20 text-[#7EE787] flex items-center justify-center text-sm flex-shrink-0 mt-0.5">✓</span>
                    <span className="text-[#8B949E]">Explicações com analogias de games, animes e séries que você ama</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-[#7EE787]/20 text-[#7EE787] flex items-center justify-center text-sm flex-shrink-0 mt-0.5">✓</span>
                    <span className="text-[#8B949E]">Manda foto da questão e recebe resolução detalhada</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-[#7EE787]/20 text-[#7EE787] flex items-center justify-center text-sm flex-shrink-0 mt-0.5">✓</span>
                    <span className="text-[#8B949E]">Respostas adaptadas ao seu estilo de aprendizagem VARK</span>
                  </li>
                </ul>
                <button 
                  onClick={onStart}
                  data-testid="demo-start-btn"
                  className="mt-8 px-6 py-3 rounded-xl bg-[#58A6FF] text-black font-semibold hover:bg-[#79B8FF] transition-all"
                >
                  Experimentar Grátis
                </button>
              </div>
              
              {/* Chat Preview */}
              <div className="bg-[#0D1117] rounded-2xl border border-[#30363D] p-4 shadow-2xl">
                <div className="flex items-center gap-2 pb-4 border-b border-[#30363D]">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#58A6FF] to-[#7EE787] flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-black" />
                  </div>
                  <span className="font-semibold">Mindly AI</span>
                  <span className="ml-auto w-2 h-2 rounded-full bg-[#7EE787]" />
                </div>
                <div className="py-4 space-y-4 min-h-[200px]">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#30363D] flex-shrink-0" />
                    <div className="bg-[#161B22] rounded-2xl rounded-tl-none p-4 max-w-[80%]">
                      <p className="text-sm">Não entendi por que a mitocôndria é a "usina de energia" da célula...</p>
                    </div>
                  </div>
                  <div className="flex gap-3 justify-end">
                    <div className="bg-[#58A6FF]/20 rounded-2xl rounded-tr-none p-4 max-w-[80%]">
                      <p className="text-sm">Pensa assim: se a célula fosse o <strong>Naruto</strong>, a mitocôndria seria o <strong>chakra</strong>! 🍥</p>
                      <p className="text-sm mt-2">Ela transforma os nutrientes (comida) em ATP, que é a energia que a célula usa pra fazer tudo - assim como o Naruto converte chakra em jutsus!</p>
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#58A6FF] to-[#7EE787] flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-4 h-4 text-black" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-t from-[#010409] to-transparent">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Pronto para estudar de um jeito diferente?
            </h2>
            <p className="text-[#8B949E] text-lg mb-10">
              Comece agora e descubra como é aprender com um tutor que te entende de verdade.
            </p>
            <button 
              onClick={onStart}
              data-testid="cta-start-btn"
              className="px-10 py-5 rounded-xl bg-gradient-to-r from-[#58A6FF] to-[#7EE787] text-black font-bold text-xl hover:opacity-90 transition-all animate-pulse-glow"
            >
              Começar Grátis
            </button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-[#30363D]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#58A6FF]" />
            <span className="font-semibold">MINDLY</span>
            <span className="text-[#8B949E]">© 2025</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-[#8B949E]">
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
};

export default LandingPage;
