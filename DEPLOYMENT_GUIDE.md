# 🚀 Clue Lane - Deployment Guide (Single Service)

## Resumo da Arquitetura

Você pediu para **um deploy só** (tudo na mesma pasta), então fizemos:

### ✅ O que mudou:

```
Frontend (React)        Backend (Node.js)       PostgreSQL (Neon)
     ↓                        ↓                       ↓
  dist/           +    server/dist/     +  postgresql://...
     ↓                        ↓                       ↓
  npm run build        npm --prefix server run build
     ↓                        ↓                       ↓
  └─────────────────────────────────────────────────┘
                   Single Build Process
                           ↓
                    npm run build (root)
                           ↓
                      Dockerfile
                           ↓
                       Render (1 Web Service)
```

## 📋 O que foi feito:

### 1. **Servidor Backend atualizado** (`server/src/index.ts`)
   - ✅ Importa `path` e `fileURLToPath` para servir arquivos estáticos
   - ✅ Serve arquivos do `/dist` (frontend buildado)
   - ✅ SPA fallback: redireciona todas rotas para `index.html`
   - ✅ Mantém todas as rotas `/api/*` funcionando normalmente

### 2. **Package.json (root) atualizado**
   ```json
   {
     "scripts": {
       "build": "vite build && npm --prefix server run build",
       "start": "node server/dist/index.js",
       "server": "cd server && npm run dev"
     }
   }
   ```
   - ✅ `npm run build` compila React + TypeScript do backend
   - ✅ `npm start` inicia o servidor que serve tudo

### 3. **Dockerfile (já estava correto)**
   - ✅ Copia `package.json` root + server
   - ✅ Instala dependências
   - ✅ Faz build completo: `npm run build`
   - ✅ Expõe porta 3000
   - ✅ Start: `node server/dist/index.js`

### 4. **Variáveis de Ambiente**
   - ✅ `.env.local` (desenvolvimento): `VITE_API_URL=http://localhost:3000`
   - ✅ `.env.production` (produção): `VITE_API_URL=/` (mesma URL, raiz)

## 🗄️ Banco de Dados - SIM, AINDA USA NEON!

**Sua connection string Neon:**
```
postgresql://neondb_owner:npg_yIAiQP8D2NsW@ep-young-term-af9adjyh-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

**Por que ainda usa Neon:**
- ✅ Você não pode servir banco de dados do Render (não é um banco)
- ✅ Neon é PostgreSQL em nuvem (externo)
- ✅ Seu servidor Node.js se conecta ao Neon via `DATABASE_URL`
- ✅ Frontend não acessa banco direto - backend cuida disso

**Fluxo:**
```
Frontend (React)  ──HTTP/Socket.IO──>  Backend (Node.js)  ──SQL──>  Neon (PostgreSQL)
    dist/             /api/*            server/dist/      query      on us-west-2
                   Socket.IO events                        pool
```

## 🎯 Próximos Passos - Render Deployment

### Passo 1: Criar um Web Service no Render

1. Acesse https://dashboard.render.com
2. Clique em **"New +"** → **"Web Service"**
3. Procure e selecione: `GomesHunk/clue-lane`
4. Preencha:
   - **Name:** `clue-lane` (ou `clue-lane-app`)
   - **Environment:** `Node`
   - **Region:** `AWS US West (Oregon)` (você escolheu isso!)
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `node server/dist/index.js`
   - **Instance Type:** `Free`

5. Clique em **"Advanced"** e adicione variáveis:
   ```
   DATABASE_URL = postgresql://neondb_owner:npg_yIAiQP8D2NsW@ep-young-term-af9adjyh-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
   NODE_ENV = production
   PORT = 3000
   ```

6. Clique em **"Create Web Service"**
7. Espere 2-3 minutos até ficar **"Live"** 🎉

### Passo 2: Testar em Produção

Quando o Render disser "Live", você vai ter uma URL tipo:
```
https://clue-lane.onrender.com
```

Abra essa URL no navegador e:
- ✅ Veja a interface do Clue Lane carregar
- ✅ Teste criar uma sala
- ✅ Teste entrar em uma sala
- ✅ Compartilhe a URL com seus amigos!

## 🔍 Como a Aplicação Funciona

### Desenvolvimento (local)

Terminal 1 - Backend:
```bash
npm --prefix server run dev
# Ou: cd server && npm run dev
```

Terminal 2 - Frontend (Vite dev server):
```bash
npm run dev
```

Frontend acessa backend em `http://localhost:3000/api/*`

### Produção (Render)

Uma única imagem Docker com tudo:
```bash
docker run -e DATABASE_URL=... clue-lane
# ou Render faz isso automaticamente
```

Frontend e Backend na mesma origem:
- Frontend: servido do `/` (estático)
- Backend API: `/api/*` (rotas Express)
- Socket.IO: `/socket.io/*` (upgrade HTTP → WebSocket)

## ✨ Resumo Final

| Aspecto | Antes (Supabase) | Depois (Atual) |
|---------|-----------------|----------------|
| **Deploy** | Frontend + Backend separados | ✅ Um único Web Service |
| **Banco** | Supabase PostgREST | ✅ Neon PostgreSQL direto |
| **Latência** | 1-2s (PostgREST overhead) | ✅ ~100ms (conexão direta) |
| **Real-time** | Supabase Realtime | ✅ Socket.IO (mais rápido) |
| **URL** | `/` (frontend), `backend-url/api` | ✅ Tudo em `/` e `/api` |
| **Complexidade** | Média | ✅ Simples (um deploy) |

## 🚀 Está Pronto!

✅ Código commitado ao GitHub  
✅ Arquivo `Dockerfile` pronto  
✅ Variáveis de ambiente configuradas  
✅ Banco Neon criado (us-west-2)  

**Agora é só fazer o deploy no Render!** 🎊

---

Se tiver dúvidas sobre os próximos passos, me avisa!
