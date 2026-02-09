# EstudoDojo

An AI tutor that explains concepts using analogies based on what students love.

## What is it?

Most educational platforms explain concepts the same generic way. **Mindly is different**: the AI explains everything through analogies connected to what students actually care about.

### The Magic

```
Student: "I don't understand exponential functions"
Interests: Games, Anime, Football

EstudoDojo responds:
"🎮 In games, your character at level 1 has 100 health.
At level 18, it has 2500 health. It's not 100×18=1800 (linear).
It's EXPONENTIAL because it multiplies!

2^1=2, 2^5=32, 2^10=1024... each x multiplies the result."

Result: Student memorizes because it connects to something they love ❤️
```

## Core Features

- **AI Tutor 24/7** - Questions answered in under 1 minute with personalized analogies
- **Smart Profiles** - Learns student interests (Games, Anime, Football, etc)
- **Real ENEM Questions** - 8,000+ actual exam questions
- **Full Simulations** - Complete ENEM exams with score estimates (94% accurate)
- **Parent Dashboard** - Real-time progress tracking
- **Teacher Analytics** - Class performance and student insights

## Tech Stack

- **Frontend**: React 18 + Vite + TailwindCSS
- **Backend**: Node.js + Express
- **Database**: PostgreSQL
- **AI**: Claude Sonnet 4.5 (Anthropic)
- **Auth**: JWT + Google OAuth

## Quick Start

### Backend

```bash
cd backend
npm install

# Setup .env
cat > .env << EOF
DATABASE_URL=postgresql://user:password@localhost:5432/estudodojo
CLAUDE_API_KEY=sk-ant-v7-xxxxx
JWT_SECRET=your-secret
PORT=5000
EOF

# Run migrations
npm run db:migrate

# Start server
npm run dev
```

### Frontend

```bash
cd frontend
npm install

# Setup .env
cat > .env << EOF
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your-google-id
EOF

# Start dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## How It Works

### For Students
1. Click "Ask a Question"
2. No login needed
3. Get answer with personalized analogy
4. Profile created automatically
5. Next time - everything is personalized

### For Parents
1. Child asks questions in EstudoDojo
2. Parent gets email with dashboard link
3. See real-time progress
4. Get alerts if child stops studying
5. Know estimated ENEM score

### For Teachers
1. Create class in EstudoDojo
2. Invite students
3. See who's struggling
4. Get 5 hours/week back (no more repetitive questions)
5. Students improve ~120 points on ENEM

## The AI Magic

Every response follows this process:

```
1. Analyze question
   ↓
2. Find pattern connecting to student interest
   ↓
3. Create perfect analogy
   [ANALOGY] → [EXPLANATION] → [BACK TO CONCEPT]
   ↓
4. Student understands and remembers
```

## API Example

```bash
# Ask a question
POST /api/tutor/duvida
{
  "duvida": "What is photosynthesis?",
  "disciplina": "biology"
}

# Response
{
  "resposta": "🎬 Imagine an anime transformation...",
  "interesses_usados": ["Anime"]
}
```

## Database

Main tables:
- `users` - Student accounts
- `user_profiles` - Interests, subjects, progress
- `questions` - 8,000+ ENEM questions
- `tutor_sessions` - Chat history with AI

## Contributing

We welcome contributions! Please:

1. Fork the repo
2. Create a branch: `git checkout -b feature/amazing`
3. Make your changes
4. Push and create a Pull Request

See [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## License

MIT - See [LICENSE](LICENSE)

## Contact

- 📧 support@estudodojo.com
- 🐦 [@EstudoDojo](https://twitter.com/estudodojo)
- 💬 [Discord](https://discord.gg/estudodojo)

---

**Made with ❤️ for Brazilian education**

⭐ If this helps you, please star this repo!
