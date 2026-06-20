# Enquete Anônima - Baliza Papo Reto (Frontend)

Frontend da enquete informal para o grupo Baliza Papo Reto sobre a eleição suplementar estadual de 2026 em Roraima (Governador - RR).

## Backend utilizado

API online: [https://enquete-anonima-bpr.onrender.com](https://enquete-anonima-bpr.onrender.com)

- `GET /api/status` — Status da API
- `GET /api/results` — Resultados da enquete
- `POST /api/vote` — Registrar voto

## Como rodar localmente

O frontend é HTML, CSS e JavaScript puro. Basta abrir o arquivo `index.html` no navegador.

Ou usar um servidor HTTP simples:

```bash
npx http-server -p 5173 -c-1
```

Depois acessar: http://localhost:5173

## Como subir no GitHub

```bash
cd frontend
git init
git add .
git commit -m "Preparar frontend da enquete para produção"
git branch -M main
git remote add origin https://github.com/seu-usuario/seu-repositorio.git
git push -u origin main
```

## Como publicar

### Render

1. Crie um **Static Site** no [render.com](https://render.com)
2. Conecte o repositório
3. Configure:
   - **Build Command:** vazio (é HTML puro)
   - **Publish Directory:** `.`
4. O site será publicado em `https://seu-site.onrender.com`

### Vercel

1. Conecte o repositório no [vercel.com](https://vercel.com)
2. A Vercel detecta automaticamente HTML estático
3. Pronto — URL gerada automaticamente

### Netlify

1. Conecte o repositório no [netlify.com](https://netlify.com)
2. Configure:
   - **Base directory:** `frontend`
   - **Publish directory:** `.`
3. Pronto

## Estrutura

```
frontend/
├── index.html
├── style.css
├── app.js
├── .gitignore
└── README.md
```
