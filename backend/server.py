from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
from emergentintegrations.llm.chat import LlmChat, UserMessage, FileContent

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ.get('MONGO_URL')
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME')]

GOOGLE_AI_API_KEY = os.environ.get('GOOGLE_AI_API_KEY')

app = FastAPI()
api_router = APIRouter(prefix="/api")

# ------------ Models ------------

class UserProfile(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    canal_sensorial: str
    formato_explicacao: str
    abordagem: str
    interacao_social: str
    estrutura_estudo: str
    duracao_sessao: str
    ambiente_estudo: str
    motivador_principal: str
    estrategia_dificuldade: str
    planejamento_estudos: str
    interesse_cultural: str
    current_streak: int = 0
    longest_streak: int = 0
    last_activity_date: Optional[str] = None
    total_study_days: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserProfileCreate(BaseModel):
    name: str
    canal_sensorial: str
    formato_explicacao: str
    abordagem: str
    interacao_social: str
    estrutura_estudo: str
    duracao_sessao: str
    ambiente_estudo: str
    motivador_principal: str
    estrategia_dificuldade: str
    planejamento_estudos: str
    interesse_cultural: str

class ChatMessage(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str
    profile_id: str
    role: str
    content: str
    subject: Optional[str] = None
    has_image: bool = False
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ChatRequest(BaseModel):
    session_id: str
    profile_id: str
    message: str
    subject: str
    image_base64: Optional[str] = None

class ChatSession(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    profile_id: str
    title: str
    subject: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StreakInfo(BaseModel):
    current_streak: int
    longest_streak: int
    total_study_days: int
    studied_today: bool
    streak_calendar: List[str]

class ProgressStats(BaseModel):
    total_sessions: int
    total_messages: int
    subjects_studied: List[str]
    favorite_subject: Optional[str]
    last_activity: Optional[datetime]
    streak: StreakInfo

# ------------ NOVO SISTEMA DE PROMPTS OTIMIZADO PARA ANALOGIAS ------------

def build_system_prompt(profile: dict, subject: str) -> str:
    """
    Prompt otimizado para gerar analogias perfeitas baseadas nos interesses do aluno.
    Seguindo a metodologia: [ANALOGIA] → [EXPLICAÇÃO] → [VOLTA AO CONCEITO]
    """
    
    name = profile.get('name', 'Estudante')
    interesse = profile.get('interesse_cultural', 'cultura pop')
    canal = profile.get('canal_sensorial', 'visual')
    formato = profile.get('formato_explicacao', 'analogias_historias')
    abordagem = profile.get('abordagem', 'pratica')
    motivacao = profile.get('motivador_principal', 'desafios_metas')
    estrategia = profile.get('estrategia_dificuldade', 'busca_exemplos')
    
    # Mapear canal VARK para instruções
    vark_instructions = {
        "visual": "Use descrições visuais, diagramas mentais, cores e formas. Sugira que o aluno visualize ou desenhe.",
        "auditivo": "Explique como se conversasse, use ritmo e repetição. Sugira explicar em voz alta.",
        "leitura_escrita": "Use listas, definições claras e resumos estruturados. Sugira anotações.",
        "cinestesico": "Use exemplos práticos, experimentos mentais e aplicações do dia a dia."
    }
    
    # Mapear formato para instruções
    formato_instructions = {
        "curta_objetiva": "Respostas curtas com bullet points. Máximo 3-4 parágrafos.",
        "detalhada_aprofundada": "Explicações completas com contexto.",
        "exemplos_praticos": "Muitos exemplos práticos do cotidiano.",
        "analogias_historias": "Use analogias criativas e storytelling."
    }
    
    return f"""Você é REVISAHUB, tutor de IA do ensino médio brasileiro.
Seu ÚNICO foco nesta resposta: EXPLICAR USANDO ANALOGIA PERFEITA.

## DADOS DO ALUNO
- Nome: {name}
- Interesse Cultural Principal: {interesse}
- Estilo de Aprendizado (VARK): {canal}
- Formato Preferido: {formato}
- Abordagem: {abordagem}
- Motivação: {motivacao}
- Matéria atual: {subject}

---

## SISTEMA DE ANALOGIAS (CRÍTICO - SIGA COM ATENÇÃO)

### PASSO 1: ANALISE A QUESTÃO
Identifique:
- Conceito principal que precisa ser explicado
- Por que o aluno está tendo dificuldade (é abstrato? complexo? desconectado?)
- Como o interesse "{interesse}" pode ser usado

### PASSO 2: ENCONTRE O PADRÃO COMUM
Procure pelo padrão que conecta o conceito ao interesse do aluno.

Exemplos de padrões:
- Se conceito = "Função Exponencial" + interesse = "League of Legends"
  → Padrão: "HP do campeão cresce multiplicando, não somando"
  
- Se conceito = "Fotossíntese" + interesse = "Anime"
  → Padrão: "Input (luz) → Processamento → Output (energia) como transformação de personagem"
  
- Se conceito = "Derivada" + interesse = "Futebol"
  → Padrão: "Velocidade do jogador em cada momento = derivada da posição"

### PASSO 3: CRIE A ANALOGIA (ESTRUTURA OBRIGATÓRIA)

Use esta estrutura:
**🎮 ANALOGIA** (primeiras 2 linhas - conecte com {interesse})
**📖 EXPLICAÇÃO** (por que a analogia funciona)
**🎯 VOLTA AO CONCEITO** (aplica ao problema/questão)
**💡 LEMBRE** (resumo memorável)

### PASSO 4: REGRAS RÍGIDAS

✅ FAÇA:
- Seja ESPECÍFICO ao interesse "{interesse}" (use termos, nomes, referências reais)
- Use números/dados quando possível
- Crie UMA analogia FORTE, não várias fracas
- Faça a analogia parecer ÓBVIA depois de explicada
- Use a linguagem do interesse

❌ NÃO FAÇA:
- Analogias genéricas ("Como um carro acelerando")
- Múltiplas analogias (confunde)
- Forçar se não fizer sentido
- Analogia mais complicada que o conceito original

---

## INSTRUÇÕES DE PERSONALIZAÇÃO

### Canal Sensorial ({canal.upper()})
{vark_instructions.get(canal, vark_instructions['visual'])}

### Formato de Resposta
{formato_instructions.get(formato, formato_instructions['analogias_historias'])}

---

## BANCO DE ANALOGIAS TESTADAS

### Se interesse contém "League" ou "LoL":
- Função Linear: CS (minions) = +5 por minuto (cresce igual)
- Função Exponencial: HP do campeão (multiplica % a cada nível)
- Limite: Ouro máximo que item pode dar
- Derivada: Velocidade de movimento (MS) do campeão
- Integral: Dano total acumulado durante o jogo
- Progressão Aritmética: Cooldown aumentando sempre igual

### Se interesse contém "Anime" ou "Naruto" ou "One Piece" ou "Dragon Ball":
- Exponencial: Poder que dobra a cada arco/transformação
- Mutação: Personagem ganha novo poder (DNA muda)
- Energia: Chi/Chakra que personagem acumula
- Evolução: Treino que muda o personagem ao longo do tempo
- Narrativa: Estrutura de arco (início, conflito, resolução)

### Se interesse contém "Futebol":
- Velocidade: Velocidade do jogador/passe
- Aceleração: Burst de velocidade do jogador
- Ângulo: Ângulo do chute determina trajetória
- Força: Força do chute = momentum da bola
- Efeito Magnus: Chute com efeito que curva

### Se interesse contém "TikTok" ou "Redes":
- Exponencial: Vídeo viral (10→20→40→80 views)
- Probabilidade: Chance do vídeo ser recomendado
- Algoritmo: Função que filtra e recomenda
- Trends: Padrão de Fibonacci na disseminação

---

## DICAS POR MATÉRIA

### {subject}
{"Matemática: Foco em padrões numéricos e crescimento" if "Matem" in subject else ""}
{"Física: Foco em movimento, energia e forças" if "Física" in subject else ""}
{"Química: Foco em reações e transformações" if "Química" in subject else ""}
{"Biologia: Foco em sistemas e processos" if "Biologia" in subject else ""}
{"Português: Foco em narrativa e estrutura" if "Português" in subject else ""}
{"História: Foco em causas e consequências" if "História" in subject else ""}
{"Geografia: Foco em espaço e relações" if "Geografia" in subject else ""}
{"Filosofia: Foco em conceitos e argumentação" if "Filosofia" in subject else ""}

---

## CHECKLIST ANTES DE RESPONDER

- [ ] A analogia aparece NAS PRIMEIRAS 2 LINHAS?
- [ ] É específica ao interesse "{interesse}"?
- [ ] Usa linguagem/termos do interesse?
- [ ] O conceito fica ÓBVIO depois da analogia?
- [ ] Tem a estrutura [ANALOGIA] → [EXPLICAÇÃO] → [VOLTA]?
- [ ] É MEMORÁVEL?

---

## INSTRUÇÃO FINAL

Se a questão não tiver relação clara com "{interesse}":
1. Escolha o aspecto mais relevante do interesse
2. Se não fizer sentido PERFEITO, seja criativo para encontrar conexão
3. NUNCA responda sem analogia

A analogia deve aparecer IMEDIATAMENTE nas primeiras linhas.

Alinhado com a BNCC do ensino médio brasileiro.
Seja motivador, positivo e celebre o esforço do aluno {name}!"""


# ------------ Streak Functions ------------

async def update_streak(profile_id: str) -> dict:
    profile = await db.profiles.find_one({"id": profile_id}, {"_id": 0})
    if not profile:
        return None
    
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    last_activity = profile.get('last_activity_date')
    current_streak = profile.get('current_streak', 0)
    longest_streak = profile.get('longest_streak', 0)
    total_study_days = profile.get('total_study_days', 0)
    
    if last_activity == today:
        return {
            "current_streak": current_streak,
            "longest_streak": longest_streak,
            "total_study_days": total_study_days,
            "studied_today": True
        }
    
    yesterday = (datetime.now(timezone.utc) - timedelta(days=1)).strftime("%Y-%m-%d")
    
    if last_activity == yesterday:
        current_streak += 1
    elif last_activity is None or last_activity < yesterday:
        current_streak = 1
    
    if current_streak > longest_streak:
        longest_streak = current_streak
    
    total_study_days += 1
    
    await db.profiles.update_one(
        {"id": profile_id},
        {"$set": {
            "current_streak": current_streak,
            "longest_streak": longest_streak,
            "last_activity_date": today,
            "total_study_days": total_study_days
        }}
    )
    
    return {
        "current_streak": current_streak,
        "longest_streak": longest_streak,
        "total_study_days": total_study_days,
        "studied_today": True
    }

async def get_streak_calendar(profile_id: str) -> List[str]:
    today = datetime.now(timezone.utc)
    calendar = []
    
    for i in range(6, -1, -1):
        day = (today - timedelta(days=i)).strftime("%Y-%m-%d")
        activity = await db.messages.find_one({
            "profile_id": profile_id,
            "role": "user",
            "timestamp": {"$regex": f"^{day}"}
        })
        calendar.append(day if activity else "")
    
    return calendar

# ------------ Routes ------------

@api_router.get("/")
async def root():
    return {"message": "REVISAHUB API - Tutor de IA com Analogias Personalizadas"}

@api_router.post("/profiles", response_model=UserProfile)
async def create_profile(profile: UserProfileCreate):
    profile_obj = UserProfile(**profile.model_dump())
    doc = profile_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.profiles.insert_one(doc)
    return profile_obj

@api_router.get("/profiles/{profile_id}", response_model=UserProfile)
async def get_profile(profile_id: str):
    profile = await db.profiles.find_one({"id": profile_id}, {"_id": 0})
    if not profile:
        raise HTTPException(status_code=404, detail="Perfil não encontrado")
    if isinstance(profile.get('created_at'), str):
        profile['created_at'] = datetime.fromisoformat(profile['created_at'])
    return profile

@api_router.put("/profiles/{profile_id}")
async def update_profile(profile_id: str, updates: dict):
    result = await db.profiles.update_one(
        {"id": profile_id},
        {"$set": updates}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Perfil não encontrado")
    return {"status": "updated"}

@api_router.post("/chat")
async def chat(request: ChatRequest):
    profile = await db.profiles.find_one({"id": request.profile_id}, {"_id": 0})
    if not profile:
        raise HTTPException(status_code=404, detail="Perfil não encontrado")
    
    # Update streak
    await update_streak(request.profile_id)
    
    # Save user message
    user_msg = ChatMessage(
        session_id=request.session_id,
        profile_id=request.profile_id,
        role="user",
        content=request.message,
        subject=request.subject,
        has_image=bool(request.image_base64)
    )
    user_doc = user_msg.model_dump()
    user_doc['timestamp'] = user_doc['timestamp'].isoformat()
    await db.messages.insert_one(user_doc)
    
    # Build NOVO system prompt otimizado para analogias
    system_prompt = build_system_prompt(profile, request.subject)
    
    # Get chat history
    history = await db.messages.find(
        {"session_id": request.session_id},
        {"_id": 0}
    ).sort("timestamp", -1).limit(6).to_list(6)
    history.reverse()
    
    # Initialize Gemini chat
    chat_instance = LlmChat(
        api_key=GOOGLE_AI_API_KEY,
        session_id=request.session_id,
        system_message=system_prompt
    ).with_model("gemini", "gemini-2.0-flash")
    
    # Build user message with context
    interesse = profile.get('interesse_cultural', 'cultura pop')
    
    if request.image_base64:
        image_data = request.image_base64
        if ',' in image_data:
            image_data = image_data.split(',')[1]
        
        # Detectar o tipo de imagem
        content_type = "image/jpeg"
        if image_data.startswith('/9j/'):
            content_type = "image/jpeg"
        elif image_data.startswith('iVBORw'):
            content_type = "image/png"
        elif image_data.startswith('R0lGOD'):
            content_type = "image/gif"
        elif image_data.startswith('UklGR'):
            content_type = "image/webp"
        
        file_content = FileContent(content_type=content_type, file_content_base64=image_data)
        
        user_message = UserMessage(
            text=f"""[Matéria: {request.subject}]

QUESTÃO DO ALUNO: {request.message}

INSTRUÇÃO: 
1. Analise a imagem cuidadosamente
2. COMECE com analogia de "{interesse}" nas PRIMEIRAS 2 LINHAS
3. Use estrutura: [ANALOGIA] → [EXPLICAÇÃO] → [VOLTA AO CONCEITO]
4. Seja específico e memorável!""",
            file_contents=[file_content]
        )
    else:
        # Build context from history
        context = ""
        for msg in history[:-1]:
            role_label = "Aluno" if msg['role'] == 'user' else "Tutor"
            content = msg['content'][:150] + "..." if len(msg['content']) > 150 else msg['content']
            context += f"{role_label}: {content}\n"
        
        full_message = f"""[Matéria: {request.subject}]

{"Contexto da conversa:" + chr(10) + context + chr(10) if context else ""}
QUESTÃO DO ALUNO: {request.message}

INSTRUÇÃO: 
1. COMECE com analogia de "{interesse}" nas PRIMEIRAS 2 LINHAS
2. Use estrutura: [ANALOGIA] → [EXPLICAÇÃO] → [VOLTA AO CONCEITO]
3. Seja específico e memorável!"""
        
        user_message = UserMessage(text=full_message)
    
    try:
        response = await chat_instance.send_message(user_message)
    except Exception as e:
        logging.error(f"Error calling Gemini: {e}")
        response = "Desculpe, tive um problema ao processar sua pergunta. Pode tentar novamente?"
    
    # Save assistant message
    assistant_msg = ChatMessage(
        session_id=request.session_id,
        profile_id=request.profile_id,
        role="assistant",
        content=response,
        subject=request.subject
    )
    assistant_doc = assistant_msg.model_dump()
    assistant_doc['timestamp'] = assistant_doc['timestamp'].isoformat()
    await db.messages.insert_one(assistant_doc)
    
    # Update or create session
    session = await db.sessions.find_one({"id": request.session_id})
    if not session:
        new_session = ChatSession(
            id=request.session_id,
            profile_id=request.profile_id,
            title=request.message[:50] + "..." if len(request.message) > 50 else request.message,
            subject=request.subject
        )
        session_doc = new_session.model_dump()
        session_doc['created_at'] = session_doc['created_at'].isoformat()
        session_doc['updated_at'] = session_doc['updated_at'].isoformat()
        await db.sessions.insert_one(session_doc)
    else:
        await db.sessions.update_one(
            {"id": request.session_id},
            {"$set": {"updated_at": datetime.now(timezone.utc).isoformat()}}
        )
    
    return {
        "response": response,
        "message_id": assistant_msg.id,
        "session_id": request.session_id
    }

@api_router.get("/sessions/{profile_id}")
async def get_sessions(profile_id: str):
    sessions = await db.sessions.find(
        {"profile_id": profile_id},
        {"_id": 0}
    ).sort("updated_at", -1).limit(20).to_list(20)
    
    for session in sessions:
        if isinstance(session.get('created_at'), str):
            session['created_at'] = datetime.fromisoformat(session['created_at'])
        if isinstance(session.get('updated_at'), str):
            session['updated_at'] = datetime.fromisoformat(session['updated_at'])
    
    return sessions

@api_router.get("/sessions/{profile_id}/{session_id}/messages")
async def get_session_messages(profile_id: str, session_id: str):
    messages = await db.messages.find(
        {"session_id": session_id, "profile_id": profile_id},
        {"_id": 0}
    ).sort("timestamp", 1).to_list(100)
    
    for msg in messages:
        if isinstance(msg.get('timestamp'), str):
            msg['timestamp'] = datetime.fromisoformat(msg['timestamp'])
    
    return messages

@api_router.get("/streak/{profile_id}")
async def get_streak(profile_id: str):
    profile = await db.profiles.find_one({"id": profile_id}, {"_id": 0})
    if not profile:
        raise HTTPException(status_code=404, detail="Perfil não encontrado")
    
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    last_activity = profile.get('last_activity_date')
    
    calendar = await get_streak_calendar(profile_id)
    
    return StreakInfo(
        current_streak=profile.get('current_streak', 0),
        longest_streak=profile.get('longest_streak', 0),
        total_study_days=profile.get('total_study_days', 0),
        studied_today=last_activity == today,
        streak_calendar=calendar
    )

@api_router.get("/progress/{profile_id}", response_model=ProgressStats)
async def get_progress(profile_id: str):
    profile = await db.profiles.find_one({"id": profile_id}, {"_id": 0})
    if not profile:
        raise HTTPException(status_code=404, detail="Perfil não encontrado")
    
    total_sessions = await db.sessions.count_documents({"profile_id": profile_id})
    total_messages = await db.messages.count_documents({"profile_id": profile_id, "role": "user"})
    
    subjects_pipeline = [
        {"$match": {"profile_id": profile_id, "subject": {"$exists": True, "$ne": None}}},
        {"$group": {"_id": "$subject"}},
    ]
    subjects_result = await db.messages.aggregate(subjects_pipeline).to_list(100)
    subjects_studied = [s["_id"] for s in subjects_result if s["_id"]]
    
    favorite_pipeline = [
        {"$match": {"profile_id": profile_id, "role": "user", "subject": {"$exists": True, "$ne": None}}},
        {"$group": {"_id": "$subject", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 1}
    ]
    favorite_result = await db.messages.aggregate(favorite_pipeline).to_list(1)
    favorite_subject = favorite_result[0]["_id"] if favorite_result else None
    
    last_msg = await db.messages.find_one(
        {"profile_id": profile_id},
        {"_id": 0, "timestamp": 1},
        sort=[("timestamp", -1)]
    )
    last_activity = None
    if last_msg:
        ts = last_msg.get('timestamp')
        if isinstance(ts, str):
            last_activity = datetime.fromisoformat(ts)
        else:
            last_activity = ts
    
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    last_activity_date = profile.get('last_activity_date')
    calendar = await get_streak_calendar(profile_id)
    
    streak_info = StreakInfo(
        current_streak=profile.get('current_streak', 0),
        longest_streak=profile.get('longest_streak', 0),
        total_study_days=profile.get('total_study_days', 0),
        studied_today=last_activity_date == today,
        streak_calendar=calendar
    )
    
    return ProgressStats(
        total_sessions=total_sessions,
        total_messages=total_messages,
        subjects_studied=subjects_studied,
        favorite_subject=favorite_subject,
        last_activity=last_activity,
        streak=streak_info
    )

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
