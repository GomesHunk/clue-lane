# 📋 Checklist: Próximos Passos

## ✅ Fase 1: Setup Banco de Dados (5 min)

- [ ] Criar conta em [Neon.tech](https://neon.tech) (free tier)
- [ ] Criar projeto: `clue-lane`
- [ ] Copiar Connection String:
  ```
  postgresql://user:password@ep-xxx.region.neon.tech/dbname?sslmode=require
  ```
- [ ] Guardar em arquivo temporário (vai usar no Render)

## ✅ Fase 2: Teste Local (10 min)

### Terminal 1: Frontend

```bash
npm install
npm run dev
# Deve rodar em http://localhost:5173
```

### Terminal 2: Backend

```bash
cd server
npm install

# Copiar .env.example para .env
cp .env.example .env

# Editar .env com:
# DATABASE_URL=<sua connection string Neon>
# FRONTEND_URL=http://localhost:5173

npm run dev
# Deve rodar em http://localhost:3000
# Se der erro: npm run migrate (rodar migrations)
```

### Teste rápido

- Abrir http://localhost:5173
- Clicar "Criar Sala"
- Se conseguir criar: ✅ Sucesso!
- Se der erro: Verificar console (F12) e logs do backend

## ✅ Fase 3: Commit & Push (2 min)

```bash
git add .
git commit -m "Migração completa: Supabase → Backend Node.js"
git push origin main
```

## ✅ Fase 4: Deploy Backend (10 min)

1. Acessar [Render.com](https://render.com)
2. Fazer login com GitHub
3. Novo → Web Service
4. Conectar repositório `clue-lane`
5. Configurar:
   - **Name**: `clue-lane-api`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `node server/dist/index.js`
   - **Environment Variables**:
     ```
     DATABASE_URL = <sua connection string Neon>
     NODE_ENV = production
     FRONTEND_URL = https://SEU-FRONTEND.onrender.com
     PORT = 3000
     ```
6. Deploy
7. Aguardar ~2-3 min até ficar "Live"
8. Copiar URL do backend (ex: `https://clue-lane-api.onrender.com`)

## ✅ Fase 5: Deploy Frontend (5 min)

1. Render Dashboard → Novo → Static Site
2. Conectar repositório `clue-lane`
3. Configurar:
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`
   - **Environment Variables**:
     ```
     VITE_API_URL = https://SEU-BACKEND.onrender.com
     ```
4. Deploy
5. Aguardar deploy completar

## ✅ Fase 6: Testar em Produção (5 min)

1. Acessar URL do frontend (em Render)
2. Testar criar sala
3. Copiar link e entrar em outra aba
4. Verificar:
   - [ ] Sala criada com sucesso
   - [ ] Players aparecem em tempo real
   - [ ] Clique em "Entrar na Sala" é rápido
   - [ ] Sem erros 404 ou timeout

## 🆘 Se Der Erro

### Backend não inicia

```bash
# 1. Verificar logs no Render
# 2. Verificar DATABASE_URL
# 3. Testar localmente:
cd server
npm install
npm run migrate
npm run dev
```

### Frontend não encontra backend

```bash
# 1. Verificar VITE_API_URL em Render
# 2. Deve ser a URL completa do backend (com https://)
# 3. Verificar CORS: Backend permite frontend URL
```

### Banco não conecta

```bash
# 1. Connection string correta?
# 2. Neon permite conexões? (Settings → Allowed IPs)
# 3. Testar localmente com connection string Neon
```

---

## 📞 Timeline Esperado

| Fase            | Tempo                  | Status  |
| --------------- | ---------------------- | ------- |
| Setup Neon      | 5 min                  | ⏳ TODO |
| Teste Local     | 10 min                 | ⏳ TODO |
| Commit          | 2 min                  | ⏳ TODO |
| Deploy Backend  | 10 min + 2-3 min build | ⏳ TODO |
| Deploy Frontend | 5 min + 2-3 min build  | ⏳ TODO |
| Teste Produção  | 5 min                  | ⏳ TODO |
| **TOTAL**       | **~45 min**            | 🚀      |

---

**Salve este arquivo e siga passo a passo!**

Quando terminar tudo, o app estará 100% online com backend próprio. 🎉
