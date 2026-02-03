import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Sparkles, Check, Eye, Headphones, BookOpen, Hand } from "lucide-react";

const Onboarding = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({
    name: "",
    vark_primary: "",
    explanation_style: "",
    approach: "",
    social_pref: "",
    motivation: "",
    cultural_interest: ""
  });

  const steps = [
    {
      id: "intro",
      type: "intro",
      title: "Vamos personalizar sua experiência!",
      description: "Responda algumas perguntas rápidas para que eu possa adaptar as explicações ao seu jeito de aprender."
    },
    {
      id: "name",
      type: "text",
      question: "Como posso te chamar?",
      field: "name",
      placeholder: "Seu nome ou apelido"
    },
    {
      id: "vark",
      type: "select",
      question: "Quando aprende algo novo, o que te ajuda mais?",
      field: "vark_primary",
      options: [
        { value: "visual", label: "Ver diagramas, mapas ou imagens", icon: <Eye className="w-5 h-5" />, color: "text-[#58A6FF]" },
        { value: "auditivo", label: "Ouvir explicações ou podcasts", icon: <Headphones className="w-5 h-5" />, color: "text-[#7EE787]" },
        { value: "leitura_escrita", label: "Ler textos e resumos", icon: <BookOpen className="w-5 h-5" />, color: "text-[#F78166]" },
        { value: "cinestesico", label: "Fazer atividades práticas", icon: <Hand className="w-5 h-5" />, color: "text-[#A371F7]" }
      ]
    },
    {
      id: "style",
      type: "select",
      question: "Como você prefere as explicações?",
      field: "explanation_style",
      options: [
        { value: "curta_objetiva", label: "Curtas e objetivas" },
        { value: "detalhada_aprofundada", label: "Detalhadas e aprofundadas" },
        { value: "exemplos_praticos", label: "Com muitos exemplos práticos" },
        { value: "analogias_historias", label: "Com analogias e histórias" }
      ]
    },
    {
      id: "approach",
      type: "select",
      question: "Como você prefere aprender?",
      field: "approach",
      options: [
        { value: "pratica", label: "Por exemplos e aplicações práticas" },
        { value: "teorica", label: "Por explicações teóricas e conceitos" }
      ]
    },
    {
      id: "social",
      type: "select",
      question: "Você estuda melhor...",
      field: "social_pref",
      options: [
        { value: "sozinho", label: "Sozinho(a)" },
        { value: "dupla", label: "Em dupla" },
        { value: "grupo", label: "Em grupo" },
        { value: "tutor", label: "Com orientação direta de um tutor" }
      ]
    },
    {
      id: "motivation",
      type: "select",
      question: "O que mais te motiva a estudar?",
      field: "motivation",
      options: [
        { value: "desafios_metas", label: "Desafios e metas claras" },
        { value: "interesse_pessoal", label: "Explorar temas de interesse" },
        { value: "reconhecimento", label: "Reconhecimento e recompensas" },
        { value: "utilidade_pratica", label: "Utilidade prática do conteúdo" }
      ]
    },
    {
      id: "cultural",
      type: "text",
      question: "Qual filme, série, anime, jogo ou música você mais curte?",
      description: "Vou usar isso para criar analogias que fazem sentido pra você!",
      field: "cultural_interest",
      placeholder: "Ex: Naruto, League of Legends, Harry Potter, Marvel..."
    }
  ];

  const currentStep = steps[step];
  const progress = ((step) / (steps.length - 1)) * 100;

  const handleAnswer = (field, value) => {
    setAnswers(prev => ({ ...prev, [field]: value }));
  };

  const canProceed = () => {
    if (currentStep.type === "intro") return true;
    if (currentStep.type === "text") return answers[currentStep.field]?.trim().length > 0;
    if (currentStep.type === "select") return answers[currentStep.field]?.length > 0;
    return false;
  };

  const handleNext = () => {
    if (step === steps.length - 1) {
      onComplete(answers);
    } else {
      setStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (step > 0) setStep(prev => prev - 1);
  };

  return (
    <div className="min-h-screen bg-[#0D1117] text-white flex flex-col">
      {/* Header with progress */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-[#0D1117]/90 backdrop-blur-lg border-b border-[#30363D]">
        <div className="max-w-2xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#58A6FF]" />
              <span className="font-semibold">MINDLY</span>
            </div>
            <span className="text-sm text-[#8B949E]">
              {step > 0 && `${step} de ${steps.length - 1}`}
            </span>
          </div>
          <div className="h-1 bg-[#30363D] rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-[#58A6FF] to-[#7EE787] rounded-full"
              initial={{ width: 0 }}
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
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-xl"
          >
            {currentStep.type === "intro" && (
              <div className="text-center">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#58A6FF] to-[#7EE787] flex items-center justify-center mx-auto mb-8">
                  <Sparkles className="w-10 h-10 text-black" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold mb-4">{currentStep.title}</h1>
                <p className="text-lg text-[#8B949E]">{currentStep.description}</p>
              </div>
            )}

            {currentStep.type === "text" && (
              <div>
                <h2 className="text-2xl md:text-3xl font-bold mb-3">{currentStep.question}</h2>
                {currentStep.description && (
                  <p className="text-[#8B949E] mb-6">{currentStep.description}</p>
                )}
                <input
                  type="text"
                  value={answers[currentStep.field] || ""}
                  onChange={(e) => handleAnswer(currentStep.field, e.target.value)}
                  placeholder={currentStep.placeholder}
                  data-testid={`onboarding-${currentStep.field}`}
                  className="w-full px-5 py-4 rounded-xl bg-[#161B22] border border-[#30363D] text-white placeholder-[#8B949E] focus:outline-none focus:border-[#58A6FF] transition-colors text-lg"
                  autoFocus
                />
              </div>
            )}

            {currentStep.type === "select" && (
              <div>
                <h2 className="text-2xl md:text-3xl font-bold mb-6">{currentStep.question}</h2>
                <div className="space-y-3">
                  {currentStep.options.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleAnswer(currentStep.field, option.value)}
                      data-testid={`onboarding-${currentStep.field}-${option.value}`}
                      className={`w-full p-4 rounded-xl border transition-all text-left flex items-center gap-4 ${
                        answers[currentStep.field] === option.value
                          ? "bg-[#58A6FF]/20 border-[#58A6FF] text-white"
                          : "bg-[#161B22] border-[#30363D] text-[#C9D1D9] hover:border-[#8B949E]"
                      }`}
                    >
                      {option.icon && (
                        <span className={option.color || "text-[#8B949E]"}>
                          {option.icon}
                        </span>
                      )}
                      <span className="flex-1 font-medium">{option.label}</span>
                      {answers[currentStep.field] === option.value && (
                        <Check className="w-5 h-5 text-[#58A6FF]" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer with navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0D1117]/90 backdrop-blur-lg border-t border-[#30363D]">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={handleBack}
            disabled={step === 0}
            data-testid="onboarding-back-btn"
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              step === 0 
                ? "text-[#30363D] cursor-not-allowed" 
                : "text-[#8B949E] hover:text-white hover:bg-[#161B22]"
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
                ? "bg-[#58A6FF] text-black hover:bg-[#79B8FF]"
                : "bg-[#30363D] text-[#8B949E] cursor-not-allowed"
            }`}
          >
            {step === steps.length - 1 ? "Começar!" : "Continuar"}
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
