from fastapi import FastAPI, APIRouter, HTTPException, UploadFile, File, Form
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import base64
from emergentintegrations.llm.chat import LlmChat, UserMessage, ImageContent

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL')
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME')]

# Gemini API Key
GOOGLE_AI_API_KEY = os.environ.get('GOOGLE_AI_API_KEY')

app = FastAPI()
api_router = APIRouter(prefix="/api")

# ------------ Models ------------

class UserProfile(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    vark_primary: str  # visual, auditivo, leitura_escrita, cinestesico
    explanation_style: str  # curta_objetiva, detalhada_aprofundada, exemplos_praticos, analogias_historias
    approach: str  # pratica, teorica
    social_pref: str  # sozinho, dupla, grupo, tutor
    motivation: str
    cultural_interest: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserProfileCreate(BaseModel):
    name: str
    vark_primary: str
    explanation_style: str
    approach: str
    social_pref: str
    motivation: str
    cultural_interest: str

class ChatMessage(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str
    profile_id: str
    role: str  # user, assistant
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

class ProgressStats(BaseModel):
    total_sessions: int
    total_messages: int
    subjects_studied: List[str]
    favorite_subject: Optional[str]
    last_activity: Optional[datetime]

# ------------ System Prompt Builder ------------

def build_system_prompt(profile: dict) -> str:
    vark_instructions = {
        "visual": "Use diagramas mentais, descrições visuais detalhadas, cores e formas para explicar conceitos. Sugira que o aluno desenhe ou visualize.",
        "auditivo": "Explique como se estivesse conversando, use ritmo e repetição. Sugira podcasts ou explicações em voz alta.",
        "leitura_escrita": "Forneça explicações textuais estruturadas com listas, definições claras e resumos. Sugira anotações.",
        "cinestesico": "Use exemplos práticos, experimentos mentais e aplicações do dia a dia. Conecte com ações e movimentos."
    }
    
    style_instructions = {
        "curta_objetiva": "Seja direto e conciso. Respostas curtas com o essencial.",
        "detalhada_aprofundada": "Forneça explicações completas e aprofundadas com contexto.",
        "exemplos_praticos": "Use muitos exemplos práticos e aplicações reais.",
        "analogias_historias": "Use analogias criativas e histórias para explicar conceitos."
    }
    
    approach_instructions = {
        "pratica": "Foque em aplicações práticas, exercícios e como usar o conhecimento.",
        "teorica": "Comece pela teoria, conceitos fundamentais e depois aplique."
    }
    
    cultural_ref = profile.get('cultural_interest', 'cultura pop')
    vark_type = profile.get('vark_primary', 'visual')
    explanation = profile.get('explanation_style', 'analogias_historias')
    approach = profile.get('approach', 'pratica')
    name = profile.get('name', 'Estudante')
    
    return f"""Você é MINDLY, um tutor de IA especializado em ajudar alunos do ensino médio brasileiro.

## PERFIL DO ALUNO
- Nome: {name}
- Estilo de aprendizagem VARK: {vark_type}
- Interesse cultural: {cultural_ref}

## METODOLOGIA VARK
{vark_instructions.get(vark_type, vark_instructions['visual'])}

## ESTILO DE EXPLICAÇÃO
{style_instructions.get(explanation, style_instructions['analogias_historias'])}

## ABORDAGEM
{approach_instructions.get(approach, approach_instructions['pratica'])}

## REGRAS IMPORTANTES
1. **BNCC**: Todas as explicações devem estar alinhadas com a Base Nacional Comum Curricular (BNCC) do ensino médio brasileiro
2. **ANALOGIAS**: Use analogias relacionadas a "{cultural_ref}" sempre que possível para conectar conceitos
3. **LINGUAGEM**: Use linguagem acessível para adolescentes, mas sem ser infantil
4. **ENCORAJAMENTO**: Seja motivador e positivo, celebre o esforço do aluno
5. **FEEDBACK VARK**: Ao final de explicações mais longas, sugira atividades específicas para o estilo {vark_type}

## ESTRUTURA DAS RESPOSTAS
- Use **negrito** para conceitos importantes
- Use listas quando apropriado
- Inclua emojis relevantes para tornar a explicação mais engajante
- Se o aluno enviar uma imagem de questão, analise cuidadosamente e explique passo a passo

## EXEMPLO DE RESPOSTA
Se o aluno perguntar sobre mitocôndria e gostar de Naruto:
"Pensa na mitocôndria como o chakra da célula! Assim como o Naruto precisa de chakra para fazer jutsus, a célula precisa da mitocôndria para ter energia (ATP) e fazer todas as suas funções..."

Seja criativo, empático e eficaz!"""

# ------------ Routes ------------

@api_router.get("/")
async def root():
    return {"message": "MINDLY API - Tutor de IA"}

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

# Chat routes
@api_router.post("/chat")
async def chat(request: ChatRequest):
    # Get profile
    profile = await db.profiles.find_one({"id": request.profile_id}, {"_id": 0})
    if not profile:
        raise HTTPException(status_code=404, detail="Perfil não encontrado")
    
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
    
    # Get chat history for context (last 10 messages)
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
    
    # Build message with optional image
    if request.image_base64:
        # Clean base64 if it has data URL prefix
        image_data = request.image_base64
        if ',' in image_data:
            image_data = image_data.split(',')[1]
        
        image_content = ImageContent(image_base64=image_data)
        user_message = UserMessage(
            text=f"[Matéria: {request.subject}]\n\n{request.message}",
            image_contents=[image_content]
        )
    else:
        # Add context from history
        context = ""
        for msg in history[:-1]:  # Exclude current message
            role_label = "Aluno" if msg['role'] == 'user' else "Tutor"
            context += f"{role_label}: {msg['content'][:200]}...\n" if len(msg['content']) > 200 else f"{role_label}: {msg['content']}\n"
        
        full_message = f"[Matéria: {request.subject}]\n\n"
        if context:
            full_message += f"Contexto da conversa:\n{context}\n\nNova pergunta do aluno:\n"
        full_message += request.message
        
        user_message = UserMessage(text=full_message)
    
    # Get AI response
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

# Progress/Stats routes
@api_router.get("/progress/{profile_id}", response_model=ProgressStats)
async def get_progress(profile_id: str):
    # Count sessions
    total_sessions = await db.sessions.count_documents({"profile_id": profile_id})
    
    # Count messages
    total_messages = await db.messages.count_documents({"profile_id": profile_id, "role": "user"})
    
    # Get unique subjects
    subjects_pipeline = [
        {"$match": {"profile_id": profile_id, "subject": {"$exists": True, "$ne": None}}},
        {"$group": {"_id": "$subject"}},
    ]
    subjects_result = await db.messages.aggregate(subjects_pipeline).to_list(100)
    subjects_studied = [s["_id"] for s in subjects_result if s["_id"]]
    
    # Get favorite subject
    favorite_pipeline = [
        {"$match": {"profile_id": profile_id, "role": "user", "subject": {"$exists": True, "$ne": None}}},
        {"$group": {"_id": "$subject", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 1}
    ]
    favorite_result = await db.messages.aggregate(favorite_pipeline).to_list(1)
    favorite_subject = favorite_result[0]["_id"] if favorite_result else None
    
    # Get last activity
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
    
    return ProgressStats(
        total_sessions=total_sessions,
        total_messages=total_messages,
        subjects_studied=subjects_studied,
        favorite_subject=favorite_subject,
        last_activity=last_activity
    )

# Include router
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
