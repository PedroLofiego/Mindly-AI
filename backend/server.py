from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict
import uuid
from datetime import datetime, timezone, timedelta
from emergentintegrations.llm.chat import LlmChat, UserMessage, ImageContent

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
    # Bloco A - Como você aprende melhor
    canal_sensorial: str  # visual, auditivo, leitura_escrita, cinestesico
    formato_explicacao: str  # curta_objetiva, detalhada_aprofundada, exemplos_praticos, analogias_historias
    abordagem: str  # pratica, teorica
    # Bloco B - Seu jeito de estudar
    interacao_social: str  # sozinho, dupla, grupo, tutor
    estrutura_estudo: str  # estruturado, livre, equilibrado
    duracao_sessao: str  # menos_15, 15_30, 30_60, mais_60
    ambiente_estudo: str  # silencio, musica, movimento, depende
    # Bloco C - Motivação
    motivador_principal: str  # desafios_metas, interesse_pessoal, reconhecimento, utilidade_pratica
    estrategia_dificuldade: str  # procura_sozinho, pede_ajuda, autoexplica, busca_exemplos
    planejamento_estudos: str  # sempre, as_vezes, raramente, nunca
    # Bloco E - Personalização
    interesse_cultural: str
    # Streak data
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
    streak_calendar: List[str]  # Last 7 days activity

class ProgressStats(BaseModel):
    total_sessions: int
    total_messages: int
    subjects_studied: List[str]
    favorite_subject: Optional[str]
    last_activity: Optional[datetime]
    streak: StreakInfo

# ------------ System Prompt Builder ------------

def build_system_prompt(profile: dict) -> str:
    canal_instructions = {
        "visual": "Use diagramas mentais, descrições visuais detalhadas, cores e formas para explicar conceitos. Sugira que o aluno desenhe ou visualize. Inclua referências a gráficos e imagens mentais.",
        "auditivo": "Explique como se estivesse conversando naturalmente, use ritmo e repetição. Sugira podcasts ou que o aluno explique em voz alta. Use onomatopeias e sons quando apropriado.",
        "leitura_escrita": "Forneça explicações textuais bem estruturadas com listas, definições claras e resumos organizados. Sugira anotações e fichamentos.",
        "cinestesico": "Use exemplos práticos, experimentos mentais e aplicações do dia a dia. Conecte com ações, movimentos e experiências físicas. Sugira atividades hands-on."
    }
    
    formato_instructions = {
        "curta_objetiva": "Seja direto e conciso. Respostas curtas com bullet points e o essencial. Máximo 3-4 parágrafos.",
        "detalhada_aprofundada": "Forneça explicações completas e aprofundadas com contexto histórico e teórico quando relevante.",
        "exemplos_praticos": "Use muitos exemplos práticos e aplicações reais do cotidiano. Mostre como usar na prática.",
        "analogias_historias": "Use analogias criativas e storytelling para explicar conceitos. Crie narrativas envolventes."
    }
    
    abordagem_instructions = {
        "pratica": "Comece sempre com exemplos práticos e aplicações, depois explique a teoria por trás.",
        "teorica": "Comece pela teoria e conceitos fundamentais, depois mostre aplicações práticas."
    }
    
    motivacao_instructions = {
        "desafios_metas": "Proponha desafios e metas claras. Use linguagem competitiva e mostre o progresso.",
        "interesse_pessoal": "Conecte o conteúdo com curiosidades e fatos interessantes. Explore tangentes fascinantes.",
        "reconhecimento": "Elogie esforços e conquistas. Celebre pequenas vitórias no entendimento.",
        "utilidade_pratica": "Sempre mostre onde e como esse conhecimento será útil na vida real, vestibular, carreira."
    }
    
    estrategia_instructions = {
        "procura_sozinho": "Dê dicas de como pesquisar mais sobre o tema. Sugira fontes confiáveis.",
        "pede_ajuda": "Seja acolhedor e disponível. Pergunte se ficou claro e ofereça mais explicações.",
        "autoexplica": "Sugira que o aluno tente explicar com suas palavras. Use perguntas socráticas.",
        "busca_exemplos": "Sempre forneça múltiplos exemplos e analogias variadas."
    }
    
    interacao_instructions = {
        "sozinho": "Respeite a autonomia, seja objetivo e não prolongue demais.",
        "dupla": "Sugira atividades que podem ser feitas com um colega.",
        "grupo": "Proponha discussões e debates sobre o tema.",
        "tutor": "Seja mais guiado, passo a passo, como um mentor próximo."
    }
    
    canal = profile.get('canal_sensorial', 'visual')
    formato = profile.get('formato_explicacao', 'analogias_historias')
    abordagem = profile.get('abordagem', 'pratica')
    motivacao = profile.get('motivador_principal', 'desafios_metas')
    estrategia = profile.get('estrategia_dificuldade', 'busca_exemplos')
    interacao = profile.get('interacao_social', 'tutor')
    cultural_ref = profile.get('interesse_cultural', 'cultura pop')
    name = profile.get('name', 'Estudante')
    
    return f"""Você é REVISAHUB, um tutor de IA especializado em ajudar alunos do ensino médio brasileiro.

## PERFIL DO ALUNO: {name}
- Canal sensorial dominante: {canal} (VARK)
- Formato de explicação preferido: {formato}
- Abordagem: {abordagem}
- Motivação principal: {motivacao}
- Interesse cultural para analogias: {cultural_ref}

## INSTRUÇÕES DE PERSONALIZAÇÃO

### Canal Sensorial ({canal.upper()})
{canal_instructions.get(canal, canal_instructions['visual'])}

### Formato de Explicação
{formato_instructions.get(formato, formato_instructions['analogias_historias'])}

### Abordagem
{abordagem_instructions.get(abordagem, abordagem_instructions['pratica'])}

### Motivação
{motivacao_instructions.get(motivacao, motivacao_instructions['desafios_metas'])}

### Estratégia de Apoio
{estrategia_instructions.get(estrategia, estrategia_instructions['busca_exemplos'])}

### Interação
{interacao_instructions.get(interacao, interacao_instructions['tutor'])}

## REGRAS OBRIGATÓRIAS

1. **BNCC**: Todas as explicações devem estar alinhadas com a Base Nacional Comum Curricular (BNCC)
2. **ANALOGIAS CULTURAIS**: Use referências a "{cultural_ref}" sempre que possível para conectar conceitos
3. **LINGUAGEM**: Acessível para adolescentes, mas sem ser infantil ou condescendente
4. **ENCORAJAMENTO**: Seja motivador e positivo, celebre o esforço
5. **FEEDBACK VARK**: Ao final, sugira atividades específicas para o estilo {canal}

## ESTRUTURA DAS RESPOSTAS
- Use **negrito** para conceitos importantes
- Use listas quando apropriado
- Inclua emojis relevantes com moderação
- Se o aluno enviar imagem, analise cuidadosamente e explique passo a passo
- Termine com uma pergunta ou sugestão de próximo passo

## EXEMPLO DE ANALOGIA
Se o aluno perguntar sobre mitocôndria e gostar de {cultural_ref}:
Crie uma analogia conectando o conceito biológico com elementos de {cultural_ref} que o aluno conhece bem.

Seja criativo, empático e eficaz!"""

# ------------ Streak Functions ------------

async def update_streak(profile_id: str) -> dict:
    """Update streak when user studies"""
    profile = await db.profiles.find_one({"id": profile_id}, {"_id": 0})
    if not profile:
        return None
    
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    last_activity = profile.get('last_activity_date')
    current_streak = profile.get('current_streak', 0)
    longest_streak = profile.get('longest_streak', 0)
    total_study_days = profile.get('total_study_days', 0)
    
    if last_activity == today:
        # Already studied today
        return {
            "current_streak": current_streak,
            "longest_streak": longest_streak,
            "total_study_days": total_study_days,
            "studied_today": True
        }
    
    yesterday = (datetime.now(timezone.utc) - timedelta(days=1)).strftime("%Y-%m-%d")
    
    if last_activity == yesterday:
        # Consecutive day - increase streak
        current_streak += 1
    elif last_activity is None or last_activity < yesterday:
        # Streak broken or first time
        current_streak = 1
    
    # Update longest streak if needed
    if current_streak > longest_streak:
        longest_streak = current_streak
    
    total_study_days += 1
    
    # Update database
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
    """Get last 7 days activity"""
    today = datetime.now(timezone.utc)
    calendar = []
    
    for i in range(6, -1, -1):
        day = (today - timedelta(days=i)).strftime("%Y-%m-%d")
        # Check if there was activity on this day
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
    return {"message": "REVISAHUB API - Tutor de IA Personalizado"}

# Profile routes
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

# Chat routes
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
    
    # Build system prompt
    system_prompt = build_system_prompt(profile)
    
    # Get chat history
    history = await db.messages.find(
        {"session_id": request.session_id},
        {"_id": 0}
    ).sort("timestamp", -1).limit(10).to_list(10)
    history.reverse()
    
    # Initialize Gemini chat
    chat_instance = LlmChat(
        api_key=GOOGLE_AI_API_KEY,
        session_id=request.session_id,
        system_message=system_prompt
    ).with_model("gemini", "gemini-2.0-flash")
    
    # Build message
    if request.image_base64:
        image_data = request.image_base64
        if ',' in image_data:
            image_data = image_data.split(',')[1]
        image_content = ImageContent(image_base64=image_data)
        user_message = UserMessage(
            text=f"[Matéria: {request.subject}]\n\n{request.message}",
            image_contents=[image_content]
        )
    else:
        context = ""
        for msg in history[:-1]:
            role_label = "Aluno" if msg['role'] == 'user' else "Tutor"
            content = msg['content'][:200] + "..." if len(msg['content']) > 200 else msg['content']
            context += f"{role_label}: {content}\n"
        
        full_message = f"[Matéria: {request.subject}]\n\n"
        if context:
            full_message += f"Contexto da conversa:\n{context}\n\nNova pergunta:\n"
        full_message += request.message
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

# Session routes
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

# Streak routes
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

# Progress/Stats routes
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
