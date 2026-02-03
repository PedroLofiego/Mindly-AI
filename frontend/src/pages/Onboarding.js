import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Check, Eye, Headphones, BookOpen, Hand, Zap } from "lucide-react";

const BLOCKS = {
  intro: {
    title: "Vamos personalizar sua experiência!",
    description: "Responda algumas perguntas rápidas para mapear seu estilo de aprendizagem e adaptar as explicações ao seu jeito."
  },
  A: {
    title: "Como você aprende melhor",
    questions: [
      {
        id: "canal_sensorial",
        label: "Quando aprende algo novo, o que te ajuda mais?",
        options: [
          { value: "visual", label: "Ver diagramas, mapas ou imagens", icon: Eye, color: "text-blue-400" },
          { value: "auditivo", label: "Ouvir explicações ou podcasts", icon: Headphones, color: "text-green-400" },
          { value: "leitura_escrita", label: "Ler textos e resumos", icon: BookOpen, color: "text-orange-400" },
          { value: "cinestesico", label: "Fazer atividades práticas", icon: Hand, color: "text-purple-400" }
        ]
      },
      {
        id: "formato_explicacao",
        label: "Você prefere explicações...",
        options: [
          { value: "curta_objetiva", label: "Curtas e objetivas" },
          { value: "detalhada_aprofundada", label: "Detalhadas e aprofundadas" },
          { value: "exemplos_praticos", label: "Com muitos exemplos práticos" },
          { value: "analogias_historias", label: "Com analogias e storytelling" }
        ]
      },
      {
        id: "abordagem",
        label: "Você prefere aprender...",
        options: [
          { value: "pratica", label: "Por exemplos e aplicações práticas primeiro" },
          { value: "teorica", label: "Pela teoria e conceitos primeiro" }
        ]
      }
    ]
  },
  B: {
    title: "Seu jeito de estudar",
    questions: [
      {
        id: "interacao_social",
        label: "Você estuda melhor...",
        options: [
          { value: "sozinho", label: "Sozinho(a)" },
          { value: "dupla", label: "Em dupla" },
          { value: "grupo", label: "Em grupo" },
          { value: "tutor", label: "Com orientação de tutor" }
        ]
      },
      {
        id: "estrutura_estudo",
        label: "Ao estudar, você prefere...",
        options: [
          { value: "estruturado", label: "Seguir um roteiro estruturado" },
          { value: "livre", label: "Ter liberdade total" },
          { value: "equilibrado", label: "Equilíbrio entre os dois" }
        ]
      },
      {
        id: "duracao_sessao",
        label: "Tempo ideal de sessão de estudo",
        options: [
          { value: "menos_15", label: "Menos de 15 min" },
          { value: "15_30", label: "15 a 30 min" },
          { value: "30_60", label: "30 a 60 min" },
          { value: "mais_60", label: "Mais de 1 hora" }
        ]
      },
      {
        id: "ambiente_estudo",
        label: "Onde você rende mais?",
        options: [
          { value: "silencio", label: "Silêncio total" },
          { value: "musica", label: "Com música de fundo" },
          { value: "movimento", label: "Lugares com movimento" },
          { value: "depende", label: "Depende do dia" }
        ]
      }
    ]
  },
  C: {
    title: "Motivação e estratégias",
    questions: [
      {
        id: "motivador_principal",
        label: "O que mais te motiva?",
        options: [
          { value: "desafios_metas", label: "Desafios e metas claras" },
          { value: "interesse_pessoal", label: "Explorar temas de interesse" },
          { value: "reconhecimento", label: "Reconhecimento e recompensas" },
          { value: "utilidade_pratica", label: "Utilidade prática do conteúdo" }
        ]
      },
      {
        id: "estrategia_dificuldade",
        label: "Quando não entende algo, você...",
        options: [
          { value: "procura_sozinho", label: "Procura sozinho(a) uma solução" },
          { value: "pede_ajuda", label: "Pede ajuda" },
          { value: "autoexplica", label: "Explica para si mesmo(a)" },
          { value: "busca_exemplos", label: "Busca exemplos ou analogias" }
        ]
      },
      {
        id: "planejamento_estudos",
        label: "Você planeja seus estudos?",
        options: [
          { value: "sempre", label: "Sempre" },
          { value: "as_vezes", label: "Às vezes" },
          { value: "raramente", label: "Raramente" },
          { value: "nunca", label: "Nunca" }
        ]
      }
    ]
  },
  E: {
    title: "Personalização",
    questions: [
      {
        id: "interesse_cultural",
        type: "text",
        label: "Qual filme, jogo, série, anime ou desenho você mais gosta e conhece bem?",
        description: "Vou usar isso para criar analogias que fazem sentido pra você!",
        placeholder: "Ex: League of Legends, Naruto, Harry Potter, Marvel..."
      }
    ]
  },
  name: {
    title: "Quase lá!",
    questions: [
      {
        id: "name",
        type: "text",
        label: "Como posso te chamar?",
        placeholder: "Seu nome ou apelido"
      }
    ]
  }
};

const STEP_ORDER = ["intro", "A", "B", "C", "E", "name"];

export default function Onboarding({ onComplete }) {
  const [currentBlock, setCurrentBlock] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});

  const blockKey = STEP_ORDER[currentBlock];
  const block = BLOCKS[blockKey];
  const isIntro = blockKey === "intro";
  const questions = block?.questions || [];
  const question = questions[currentQuestion];

  const totalQuestions = STEP_ORDER.reduce((acc, key) => {
    if (key === "intro") return acc;
    return acc + (BLOCKS[key].questions?.length || 0);
  }, 0);

  const answeredCount = Object.keys(answers).length;
  const progress = (answeredCount / totalQuestions) * 100;

  function handleAnswer(id, value) {
    setAnswers(prev => ({ ...prev, [id]: value }));
  }

  function canProceed() {
    if (isIntro) return true;
    if (!question) return true;
    return answers[question.id]?.toString().trim().length > 0;
  }

  function handleNext() {
    if (isIntro) {
      setCurrentBlock(1);
      setCurrentQuestion(0);
      return;
    }

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else if (currentBlock < STEP_ORDER.length - 1) {
      setCurrentBlock(currentBlock + 1);
      setCurrentQuestion(0);
    } else {
      onComplete(answers);
    }
  }

  function handleBack() {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    } else if (currentBlock > 0) {
      const prevBlockKey = STEP_ORDER[currentBlock - 1];
      const prevQuestions = BLOCKS[prevBlockKey].questions || [];
      setCurrentBlock(currentBlock - 1);
      setCurrentQuestion(Math.max(0, prevQuestions.length - 1));
    }
  }

  const isLastStep = currentBlock === STEP_ORDER.length - 1 && currentQuestion === questions.length - 1;

  return (
    <div className="min-h-screen bg-[#030712] text-white flex flex-col">
      <div className="fixed inset-0 bg-gradient-to-b from-blue-500/5 via-transparent to-green-500/5 pointer-events-none" />
      
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-[#030712]/90 backdrop-blur-lg border-b border-[#1e293b]">
        <div className="max-w-2xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <img src="/revisahub-logo.png" alt="RevisaHub" className="h-8 w-auto" />
            <span className="text-sm text-slate-500">
              {!isIntro && `${answeredCount} de ${totalQuestions}`}
            </span>
          </div>
          <div className="h-1 bg-[#1e293b] rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-6 pt-28 pb-32">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${blockKey}-${currentQuestion}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-xl"
          >
            {isIntro ? (
              <div className="text-center">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center mx-auto mb-8">
                  <Zap className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold mb-4">{block.title}</h1>
                <p className="text-lg text-slate-400">{block.description}</p>
              </div>
            ) : question?.type === "text" ? (
              <div>
                <p className="text-sm text-blue-400 font-medium mb-2">{block.title}</p>
                <h2 className="text-2xl md:text-3xl font-bold mb-3">{question.label}</h2>
                {question.description && (
                  <p className="text-slate-400 mb-6">{question.description}</p>
                )}
                <input
                  type="text"
                  value={answers[question.id] || ""}
                  onChange={(e) => handleAnswer(question.id, e.target.value)}
                  placeholder={question.placeholder}
                  data-testid={`onboarding-${question.id}`}
                  className="w-full px-5 py-4 rounded-xl bg-[#0f172a] border border-[#1e293b] text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors text-lg"
                  autoFocus
                />
              </div>
            ) : (
              <div>
                <p className="text-sm text-blue-400 font-medium mb-2">{block.title}</p>
                <h2 className="text-2xl md:text-3xl font-bold mb-6">{question?.label}</h2>
                <div className="space-y-3">
                  {question?.options?.map((opt) => {
                    const Icon = opt.icon;
                    const isSelected = answers[question.id] === opt.value;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => handleAnswer(question.id, opt.value)}
                        data-testid={`onboarding-${question.id}-${opt.value}`}
                        className={`w-full p-4 rounded-xl border transition-all text-left flex items-center gap-4 ${
                          isSelected
                            ? "bg-blue-500/20 border-blue-500 text-white"
                            : "bg-[#0f172a] border-[#1e293b] text-slate-300 hover:border-slate-600"
                        }`}
                      >
                        {Icon && <Icon className={`w-5 h-5 ${opt.color || "text-slate-500"}`} />}
                        <span className="flex-1 font-medium">{opt.label}</span>
                        {isSelected && <Check className="w-5 h-5 text-blue-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#030712]/90 backdrop-blur-lg border-t border-[#1e293b]">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={handleBack}
            disabled={currentBlock === 0 && currentQuestion === 0}
            data-testid="onboarding-back-btn"
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              currentBlock === 0 && currentQuestion === 0 
                ? "text-slate-700 cursor-not-allowed" 
                : "text-slate-400 hover:text-white hover:bg-[#0f172a]"
            }`}
          >
            <ArrowLeft className="w-5 h-5" />
            Voltar
          </button>
          
          <button
            onClick={handleNext}
            disabled={!canProceed()}
            data-testid="onboarding-next-btn"
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
              canProceed() 
                ? "bg-blue-500 text-white hover:bg-blue-400" 
                : "bg-slate-800 text-slate-500 cursor-not-allowed"
            }`}
          >
            {isLastStep ? "Começar!" : "Continuar"}
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
