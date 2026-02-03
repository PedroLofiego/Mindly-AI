import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Sparkles, Check, Eye, Headphones, BookOpen, Hand } from "lucide-react";

const VARK_OPTIONS = [
  { value: "visual", label: "Ver diagramas, mapas ou imagens", color: "#58A6FF" },
  { value: "auditivo", label: "Ouvir explicações ou podcasts", color: "#7EE787" },
  { value: "leitura_escrita", label: "Ler textos e resumos", color: "#F78166" },
  { value: "cinestesico", label: "Fazer atividades práticas", color: "#A371F7" }
];

const STYLE_OPTIONS = [
  { value: "curta_objetiva", label: "Curtas e objetivas" },
  { value: "detalhada_aprofundada", label: "Detalhadas e aprofundadas" },
  { value: "exemplos_praticos", label: "Com muitos exemplos práticos" },
  { value: "analogias_historias", label: "Com analogias e histórias" }
];

const APPROACH_OPTIONS = [
  { value: "pratica", label: "Por exemplos e aplicações práticas" },
  { value: "teorica", label: "Por explicações teóricas e conceitos" }
];

const SOCIAL_OPTIONS = [
  { value: "sozinho", label: "Sozinho(a)" },
  { value: "dupla", label: "Em dupla" },
  { value: "grupo", label: "Em grupo" },
  { value: "tutor", label: "Com orientação direta de um tutor" }
];

const MOTIVATION_OPTIONS = [
  { value: "desafios_metas", label: "Desafios e metas claras" },
  { value: "interesse_pessoal", label: "Explorar temas de interesse" },
  { value: "reconhecimento", label: "Reconhecimento e recompensas" },
  { value: "utilidade_pratica", label: "Utilidade prática do conteúdo" }
];

function VarkIcon({ type, className }) {
  switch (type) {
    case "visual": return <Eye className={className} />;
    case "auditivo": return <Headphones className={className} />;
    case "leitura_escrita": return <BookOpen className={className} />;
    case "cinestesico": return <Hand className={className} />;
    default: return null;
  }
}

function SelectOption({ option, selected, onClick, showIcon, field }) {
  const isSelected = selected === option.value;
  return (
    <button
      onClick={() => onClick(option.value)}
      data-testid={`onboarding-${field}-${option.value}`}
      className={`w-full p-4 rounded-xl border transition-all text-left flex items-center gap-4 ${
        isSelected
          ? "bg-[#58A6FF]/20 border-[#58A6FF] text-white"
          : "bg-[#161B22] border-[#30363D] text-[#C9D1D9] hover:border-[#8B949E]"
      }`}
    >
      {showIcon && <VarkIcon type={option.value} className="w-5 h-5" style={{ color: option.color }} />}
      <span className="flex-1 font-medium">{option.label}</span>
      {isSelected && <Check className="w-5 h-5 text-[#58A6FF]" />}
    </button>
  );
}

export default function Onboarding({ onComplete }) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [vark, setVark] = useState("");
  const [style, setStyle] = useState("");
  const [approach, setApproach] = useState("");
  const [social, setSocial] = useState("");
  const [motivation, setMotivation] = useState("");
  const [cultural, setCultural] = useState("");

  const totalSteps = 8;
  const progress = (step / (totalSteps - 1)) * 100;

  function canProceed() {
    if (step === 0) return true;
    if (step === 1) return name.trim().length > 0;
    if (step === 2) return vark.length > 0;
    if (step === 3) return style.length > 0;
    if (step === 4) return approach.length > 0;
    if (step === 5) return social.length > 0;
    if (step === 6) return motivation.length > 0;
    if (step === 7) return cultural.trim().length > 0;
    return false;
  }

  function handleNext() {
    if (step === totalSteps - 1) {
      onComplete({
        name,
        vark_primary: vark,
        explanation_style: style,
        approach,
        social_pref: social,
        motivation,
        cultural_interest: cultural
      });
    } else {
      setStep(step + 1);
    }
  }

  function handleBack() {
    if (step > 0) setStep(step - 1);
  }

  return (
    <div className="min-h-screen bg-[#0D1117] text-white flex flex-col">
      <div className="fixed top-0 left-0 right-0 z-50 bg-[#0D1117]/90 backdrop-blur-lg border-b border-[#30363D]">
        <div className="max-w-2xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#58A6FF]" />
              <span className="font-semibold">MINDLY</span>
            </div>
            <span className="text-sm text-[#8B949E]">
              {step > 0 ? `${step} de ${totalSteps - 1}` : ""}
            </span>
          </div>
          <div className="h-1 bg-[#30363D] rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-[#58A6FF] to-[#7EE787] rounded-full"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </div>

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
            {step === 0 && (
              <div className="text-center">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#58A6FF] to-[#7EE787] flex items-center justify-center mx-auto mb-8">
                  <Sparkles className="w-10 h-10 text-black" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold mb-4">Vamos personalizar sua experiência!</h1>
                <p className="text-lg text-[#8B949E]">Responda algumas perguntas rápidas para que eu possa adaptar as explicações ao seu jeito de aprender.</p>
              </div>
            )}

            {step === 1 && (
              <div>
                <h2 className="text-2xl md:text-3xl font-bold mb-6">Como posso te chamar?</h2>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome ou apelido"
                  data-testid="onboarding-name"
                  className="w-full px-5 py-4 rounded-xl bg-[#161B22] border border-[#30363D] text-white placeholder-[#8B949E] focus:outline-none focus:border-[#58A6FF] transition-colors text-lg"
                  autoFocus
                />
              </div>
            )}

            {step === 2 && (
              <div>
                <h2 className="text-2xl md:text-3xl font-bold mb-6">Quando aprende algo novo, o que te ajuda mais?</h2>
                <div className="space-y-3">
                  {VARK_OPTIONS.map((opt) => (
                    <SelectOption key={opt.value} option={opt} selected={vark} onClick={setVark} showIcon field="vark_primary" />
                  ))}
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <h2 className="text-2xl md:text-3xl font-bold mb-6">Como você prefere as explicações?</h2>
                <div className="space-y-3">
                  {STYLE_OPTIONS.map((opt) => (
                    <SelectOption key={opt.value} option={opt} selected={style} onClick={setStyle} field="explanation_style" />
                  ))}
                </div>
              </div>
            )}

            {step === 4 && (
              <div>
                <h2 className="text-2xl md:text-3xl font-bold mb-6">Como você prefere aprender?</h2>
                <div className="space-y-3">
                  {APPROACH_OPTIONS.map((opt) => (
                    <SelectOption key={opt.value} option={opt} selected={approach} onClick={setApproach} field="approach" />
                  ))}
                </div>
              </div>
            )}

            {step === 5 && (
              <div>
                <h2 className="text-2xl md:text-3xl font-bold mb-6">Você estuda melhor...</h2>
                <div className="space-y-3">
                  {SOCIAL_OPTIONS.map((opt) => (
                    <SelectOption key={opt.value} option={opt} selected={social} onClick={setSocial} field="social_pref" />
                  ))}
                </div>
              </div>
            )}

            {step === 6 && (
              <div>
                <h2 className="text-2xl md:text-3xl font-bold mb-6">O que mais te motiva a estudar?</h2>
                <div className="space-y-3">
                  {MOTIVATION_OPTIONS.map((opt) => (
                    <SelectOption key={opt.value} option={opt} selected={motivation} onClick={setMotivation} field="motivation" />
                  ))}
                </div>
              </div>
            )}

            {step === 7 && (
              <div>
                <h2 className="text-2xl md:text-3xl font-bold mb-3">Qual filme, série, anime, jogo ou música você mais curte?</h2>
                <p className="text-[#8B949E] mb-6">Vou usar isso para criar analogias que fazem sentido pra você!</p>
                <input
                  type="text"
                  value={cultural}
                  onChange={(e) => setCultural(e.target.value)}
                  placeholder="Ex: Naruto, League of Legends, Harry Potter, Marvel..."
                  data-testid="onboarding-cultural_interest"
                  className="w-full px-5 py-4 rounded-xl bg-[#161B22] border border-[#30363D] text-white placeholder-[#8B949E] focus:outline-none focus:border-[#58A6FF] transition-colors text-lg"
                  autoFocus
                />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-[#0D1117]/90 backdrop-blur-lg border-t border-[#30363D]">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={handleBack}
            disabled={step === 0}
            data-testid="onboarding-back-btn"
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              step === 0 ? "text-[#30363D] cursor-not-allowed" : "text-[#8B949E] hover:text-white hover:bg-[#161B22]"
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
              canProceed() ? "bg-[#58A6FF] text-black hover:bg-[#79B8FF]" : "bg-[#30363D] text-[#8B949E] cursor-not-allowed"
            }`}
          >
            {step === totalSteps - 1 ? "Começar!" : "Continuar"}
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
