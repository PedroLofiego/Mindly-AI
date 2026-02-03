# RevisaHub - Tutor de IA para Ensino Médio

## Problem Statement Original
Construir um tutor de IA que utiliza metodologia educativa para alunos de ensino médio, com chat que tire dúvidas usando analogias PERFEITAS baseadas nos interesses culturais do aluno, alinhado com a BNCC e metodologia VARK.

## User Personas
- **Alunos do Ensino Médio**: Estudantes brasileiros de 14-18 anos
- **Perfis VARK**: Visual, Auditivo, Leitura/Escrita, Cinestésico
- **Interesses**: League of Legends, Anime, Futebol, TikTok, etc.

## Core Requirements (Static)
- [x] Chat com IA usando Gemini 3 Flash
- [x] Mapeamento completo de estilo de aprendizagem (12 questões)
- [x] **Sistema de Analogias Otimizado** - aparece nas PRIMEIRAS 2 LINHAS
- [x] Metodologia VARK + BNCC
- [x] Upload de imagens de questões (CORRIGIDO)
- [x] Persistência no MongoDB
- [x] Sistema de Streaks diários
- [x] Relatórios de progresso

## Architecture

### Backend (FastAPI + Python)
- `/api/profiles` - CRUD de perfis com mapeamento completo
- `/api/chat` - Chat com IA usando **NOVO PROMPT DE ANALOGIAS**
- `/api/sessions` - Histórico de sessões
- `/api/streak` - Sistema de streaks diários
- `/api/progress` - Estatísticas com streak integrado

### Sistema de Prompts (ATUALIZADO)
O prompt otimizado segue estrutura:
1. **[ANALOGIA]** - Nas primeiras 2 linhas, específica ao interesse do aluno
2. **[EXPLICAÇÃO]** - Por que a analogia funciona
3. **[VOLTA AO CONCEITO]** - Aplica ao problema/questão
4. **[LEMBRE]** - Resumo memorável

### Banco de Analogias por Interesse
- **League of Legends**: CS=PA, HP exponencial, Derivada=MS
- **Anime**: Poder exponencial, Mutação=novo poder, Energia=Chi
- **Futebol**: Velocidade, Ângulo do chute, Efeito Magnus
- **TikTok**: Viral=exponencial, Probabilidade de recomendação

## What's Been Implemented (2025-02-03)

### Iteração 1 - MVP
- Chat funcional com Gemini 3 Flash
- Onboarding básico VARK

### Iteração 2 - Layout e Streaks
- Layout futurista inspirado em RevisionDojo
- Sistema de Streaks diários completo
- Logo RevisaHub integrada

### Iteração 3 - Sistema de Analogias (ATUAL)
- **NOVO PROMPT OTIMIZADO** para analogias perfeitas
- Analogia aparece nas PRIMEIRAS 2 LINHAS
- Usa interesse cultural específico do aluno
- Estrutura: [ANALOGIA] → [EXPLICAÇÃO] → [VOLTA]
- **FIX: Upload de imagens** - Corrigido uso de FileContent

## Bug Fixes
- [x] Upload de imagens: Mudança de `ImageContent` para `FileContent` na API

## Prioritized Backlog

### P0 (Done)
- [x] Chat funcional com IA personalizada
- [x] Sistema de Analogias Otimizado
- [x] Upload de imagens funcionando
- [x] Sistema de Streaks

### P1 (Próximo)
- [ ] Feedback do aluno sobre qualidade das analogias
- [ ] Banco de analogias expandido
- [ ] Autenticação real (Google OAuth)

### P2 (Futuro)
- [ ] Dashboard com gráficos de evolução
- [ ] Badges e conquistas
- [ ] Notificações de streak em risco

## Tech Stack
- Frontend: React + TailwindCSS + Framer Motion
- Backend: FastAPI + Python
- Database: MongoDB
- AI: Gemini 3 Flash (gemini-2.0-flash)
- Image Processing: FileContent (emergentintegrations)
