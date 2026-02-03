# MINDLY - Tutor de IA para Ensino Médio

## Problem Statement Original
Construir e melhorar uma aplicação de tutor de IA que utiliza metodologia educativa para alunos de ensino médio, com chat que tire dúvidas usando analogias para ajudar, alinhado com a BNCC e metodologia VARK para feedback.

## User Personas
- **Alunos do Ensino Médio**: Estudantes brasileiros de 14-18 anos que buscam ajuda para estudar
- **Perfis VARK**: Visual, Auditivo, Leitura/Escrita, Cinestésico

## Core Requirements (Static)
- [x] Chat com IA usando Gemini 3 Flash
- [x] Metodologia VARK para personalização
- [x] Alinhamento com BNCC
- [x] Analogias baseadas em interesses culturais (games, animes, filmes)
- [x] Upload de imagens de questões para análise
- [x] Persistência no MongoDB (perfis, sessões, mensagens)
- [x] Relatórios de progresso

## Architecture
### Backend (FastAPI + Python)
- `/api/profiles` - CRUD de perfis de usuário
- `/api/chat` - Chat com IA (Gemini 3 Flash)
- `/api/sessions` - Histórico de sessões
- `/api/progress` - Estatísticas de progresso

### Frontend (React)
- Landing Page
- Onboarding (8 etapas VARK)
- Chat Interface com sidebar e histórico
- Stats Modal

### Integrations
- **Gemini 3 Flash** (gemini-2.0-flash) - Geração de respostas
- **MongoDB** - Persistência de dados

## What's Been Implemented (2025-02-03)
### MVP Complete
- Landing page inspirada no RevisionDojo
- Onboarding completo com 8 etapas para perfil VARK
- Chat com IA personalizado usando Gemini 3 Flash
- Sistema de prompts adaptativo baseado em VARK
- Analogias usando interesses culturais do usuário
- Upload de imagens para análise de questões
- Persistência completa no MongoDB
- Histórico de conversas
- Estatísticas de progresso
- 8 matérias suportadas (Matemática, Física, Química, Biologia, História, Geografia, Português, Filosofia)

## Prioritized Backlog
### P0 (Done)
- [x] Chat funcional com IA
- [x] Onboarding VARK
- [x] Persistência de dados

### P1 (Próximo)
- [ ] Autenticação real (Google OAuth ou JWT)
- [ ] Histórico de imagens analisadas
- [ ] Feedback do aluno sobre explicações

### P2 (Futuro)
- [ ] Dashboard com gráficos de evolução
- [ ] Gamificação (badges, streaks)
- [ ] Modo estudo colaborativo
- [ ] Notificações de lembrete de estudo

## Next Tasks
1. Implementar autenticação persistente
2. Adicionar mais detalhes ao relatório de progresso
3. Melhorar UX do upload de imagens
4. Adicionar temas de estudo sugeridos por IA
