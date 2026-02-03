# RevisaHub - Tutor de IA para Ensino Médio

## Problem Statement Original
Construir um tutor de IA que utiliza metodologia educativa para alunos de ensino médio, com chat que tire dúvidas usando analogias, alinhado com a BNCC e metodologia VARK para feedback. Layout futurista inspirado em revisiondojo.com, com sistema de streaks diários.

## User Personas
- **Alunos do Ensino Médio**: Estudantes brasileiros de 14-18 anos
- **Perfis VARK**: Visual, Auditivo, Leitura/Escrita, Cinestésico
- **Motivações**: Desafios, interesse pessoal, reconhecimento, utilidade prática

## Core Requirements (Static)
- [x] Chat com IA usando Gemini 3 Flash
- [x] Mapeamento completo de estilo de aprendizagem (12 questões)
- [x] Metodologia VARK + Inteligências Múltiplas
- [x] Alinhamento com BNCC
- [x] Analogias baseadas em interesses culturais
- [x] Upload de imagens de questões
- [x] Persistência no MongoDB
- [x] Sistema de Streaks diários
- [x] Relatórios de progresso com calendário de atividade

## Architecture

### Backend (FastAPI + Python)
- `/api/profiles` - CRUD de perfis com mapeamento completo
- `/api/chat` - Chat com IA (Gemini 3 Flash)
- `/api/sessions` - Histórico de sessões
- `/api/streak` - Sistema de streaks diários
- `/api/progress` - Estatísticas com streak integrado

### Frontend (React)
- Landing Page (design futurista, dark mode)
- Onboarding completo (5 blocos, 12 perguntas)
- Chat Interface com sidebar, streaks e histórico
- Stats Modal com calendário de streak

### Mapeamento de Aprendizagem
Baseado na documentação oficial:
- **Bloco A**: Canal sensorial (VARK), formato de explicação, abordagem
- **Bloco B**: Interação social, estrutura, duração, ambiente
- **Bloco C**: Motivação, estratégia de dificuldade, planejamento
- **Bloco E**: Interesse cultural para analogias
- **Nome**: Identificação do aluno

### Sistema de Streaks
- Contador de dias consecutivos
- Recorde de maior streak
- Total de dias estudados
- Calendário dos últimos 7 dias
- Atualização automática ao enviar mensagem

## What's Been Implemented (2025-02-03)

### Iteração 1 - MVP
- Chat funcional com Gemini 3 Flash
- Onboarding básico VARK
- Persistência MongoDB

### Iteração 2 - Melhorias
- Mapeamento completo de aprendizagem (12 questões)
- Layout futurista inspirado em RevisionDojo
- Logo RevisaHub integrada
- Sistema de Streaks diários completo
- Calendário de atividade semanal
- Design dark mode com gradientes sutis

## Prioritized Backlog

### P0 (Done)
- [x] Chat funcional com IA personalizada
- [x] Mapeamento completo VARK
- [x] Sistema de Streaks
- [x] Persistência de dados

### P1 (Próximo)
- [ ] Autenticação real (Google OAuth)
- [ ] Notificações de lembrete de estudo
- [ ] Badges e conquistas

### P2 (Futuro)
- [ ] Dashboard com gráficos de evolução
- [ ] Modo estudo colaborativo
- [ ] Planos de estudo personalizados
- [ ] Integração com calendário escolar

## Next Tasks
1. Implementar notificações de streak em risco
2. Adicionar badges de conquista
3. Criar sistema de metas semanais
4. Dashboard com insights de aprendizado

## Tech Stack
- Frontend: React + TailwindCSS + Framer Motion
- Backend: FastAPI + Python
- Database: MongoDB
- AI: Gemini 3 Flash (gemini-2.0-flash)
