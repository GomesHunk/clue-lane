# 🎮 ITO - Party Game Online

Um jogo de party online em tempo real construído com **React + TypeScript + Vite** (frontend) e **Node.js + Express + Socket.IO** (backend).

## 🚀 Arquitetura

```
Frontend (React SPA)      Backend (Node.js)      Database (PostgreSQL)
    |                           |                        |
    +------ fetch/Socket.IO ---+-------- Connection ----+
```

- **Frontend**: Render Static Site ou SPA
- **Backend**: Render Web Service (Node.js)
- **Database**: Neon PostgreSQL (ou Render Database)

## 📋 Pré-requisitos

- Node.js 18+
- npm ou yarn
- Git

## 🔧 Setup Local

### 1. Clone o repositório

```bash
git clone https://github.com/GomesHunk/clue-lane.git
cd clue-lane
```

### 2. Setup Frontend

```bash
npm install
npm run dev
# Frontend roda em http://localhost:5173
```

### 3. Setup Backend

```bash
cd server
npm install
# Criar .env baseado em .env.example
cp .env.example .env

# Editar .env com DATABASE_URL local ou Neon
# Exemplo Neon: postgresql://user:password@host:port/dbname

npm run dev
# Backend roda em http://localhost:3000
```

### 4. Rodar Migrations

```bash
cd server
npm run migrate
```

## 🌐 Deploy no Render

### Backend

1. Criar conta em [Render.com](https://render.com)
2. Criar Banco PostgreSQL:
   - Dashboard → New → PostgreSQL
   - Nome: `clue-lane-db`
   - Copiar connection string interna
3. Criar Web Service:
   - Dashboard → New → Web Service
   - Conectar repositório GitHub
   - Build Command: `npm install && npm run build`
   - Start Command: `node server/dist/index.js`
   - Environment Variables:
     - `DATABASE_URL`: connection string PostgreSQL
     - `NODE_ENV`: `production`
     - `FRONTEND_URL`: URL do frontend no Render
     - `PORT`: `3000`

### Frontend

1. Build local:

```bash
npm run build
# Gera pasta dist/
```

2. Deploy estático:
   - Dashboard → New → Static Site
   - Conectar repositório
   - Build Command: `npm run build`
   - Publish Directory: `dist`
   - Environment Variables:
     - `VITE_API_URL`: URL do backend no Render (ex: https://clue-lane-api.onrender.com)

## 📡 Variáveis de Ambiente

### Backend (.env)

```
DATABASE_URL=postgresql://...
PORT=3000
NODE_ENV=production
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env.local)

```
VITE_API_URL=http://localhost:3000
```

## 🎯 API Endpoints

### Rooms

- `POST /api/rooms` - Criar sala
- `GET /api/rooms/:code` - Obter sala e players
- `PUT /api/rooms/:id` - Atualizar sala
- `DELETE /api/rooms/:id` - Deletar sala

### Players

- `POST /api/players` - Entrar na sala
- `PUT /api/players/:id` - Atualizar player
- `DELETE /api/players/:id` - Sair da sala

### Round Results

- `POST /api/round-results` - Salvar resultado da rodada

## 🔌 Socket.IO Events

**Client → Server:**

- `room:join` - Entrar em uma sala
- `room:leave` - Sair da sala
- `room:update` - Atualizar estado da sala
- `player:ready` - Player pronto
- `game:phase` - Mudar fase do jogo

**Server → Client:**

- `room:player-joined` - Novo player entrou
- `room:player-left` - Player saiu
- `room:updated` - Sala foi atualizada
- `player:status-changed` - Status do player mudou
- `game:phase-changed` - Fase do jogo mudou

## 🛠️ Scripts

### Frontend

```bash
npm run dev      # Desenvolvimento
npm run build    # Build produção
npm run preview  # Preview da build
npm run lint     # ESLint
```

### Backend

```bash
npm run dev       # Desenvolvimento com ts-node
npm run build     # Compilar TypeScript
npm run start     # Produção
npm run migrate   # Rodar migrations
```

## 📦 Estrutura do Projeto

```
clue-lane/
├── src/                    # Frontend React
│   ├── pages/             # Páginas
│   ├── components/        # Componentes
│   ├── hooks/             # Custom hooks
│   └── lib/               # Utilidades
├── server/                # Backend Node.js
│   ├── src/
│   │   ├── index.ts       # Entry point
│   │   ├── db/            # Database client, queries, migrations
│   │   ├── routes/        # Express routes
│   │   └── sockets/       # Socket.IO handlers
│   ├── package.json
│   └── tsconfig.json
├── Dockerfile             # Docker image
├── render.yaml            # Render deployment config
└── package.json
```

## 🚢 Deployment Checklist

- [ ] Database criado (Neon ou Render PostgreSQL)
- [ ] Backend buildando localmente
- [ ] Frontend buildando localmente
- [ ] Migrations rodadas no banco
- [ ] Variáveis de ambiente configuradas no Render
- [ ] Backend deployado (teste /health)
- [ ] Frontend deployado (teste conexão ao backend)

## 🐛 Troubleshooting

**Backend não conecta ao banco:**

```bash
# Verificar DATABASE_URL no .env
# Testar conexão: npm run migrate
```

**Frontend não encontra API:**

```bash
# Verificar VITE_API_URL em .env.local
# Verificar FRONTEND_URL no backend
```

**Socket.IO não conecta:**

```bash
# Verificar CORS no servidor
# Confirmar porta 3000 está aberta
# Verificar logs: node server/dist/index.js
```

## 📝 Licença

MIT

## 👤 Autor

[GomesHunk](https://github.com/GomesHunk)
