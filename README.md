# TCC Guiado

Plataforma para ajudar estudantes de graduação a descobrir o tipo ideal de Trabalho de Conclusão de Curso (TCC), encontrar um template de pesquisa compatível e se conectar com um orientador — através de um fluxo de decisão guiado e chat em tempo real.

## Visão geral

O aluno se cadastra com seu e-mail institucional, responde a um fluxo de perguntas de Sim/Não (baseado em uma árvore de decisão com 4 grandes categorias de TCC) e recebe como resultado:

- O **template de pesquisa** mais adequado ao seu perfil de trabalho, com metodologia sugerida e exemplos de tema;
- Uma lista de **professores compatíveis** com vaga disponível para aquele tipo de pesquisa;
- A opção de **vincular um orientador** e iniciar uma conversa por **chat em tempo real** diretamente pela plataforma.

## Stack

**Frontend**
- React 19 + Vite
- TypeScript
- React Router
- Axios
- Socket.io-client

**Backend**
- Node.js + Express 5
- TypeScript
- Prisma 7 (ORM) + PostgreSQL
- Socket.io (comunicação em tempo real)
- JWT (`jsonwebtoken`) para autenticação
- `bcryptjs` para hash de senha

## Estrutura do projeto

```
tcc-guidance-platform/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma      # Modelo de dados
│   │   ├── migrations/        # Histórico de alterações no banco
│   │   └── seed.ts            # Popula o banco com templates, árvore do quiz e professores de teste
│   └── src/
│       ├── controllers/       # Recebem a requisição, validam entrada e delegam ao serviço/banco
│       ├── services/          # Regras de negócio mais complexas (recomendação de professor, árvore do quiz)
│       ├── routes/            # Mapeia endpoints HTTP aos controllers
│       ├── middlewares/       # Autenticação JWT
│       ├── config/            # Instância compartilhada do Prisma Client
│       └── server.ts          # Ponto de entrada: Express, CORS, Socket.io e registro de rotas
│
└── frontend/
    └── src/
        ├── pages/             # Uma tela por arquivo (Login, Cadastro, Home, Quiz, Chat...)
        ├── components/        # UI reutilizável entre páginas (Sidebar, RotaProtegida)
        ├── contexts/          # AuthContext — estado de autenticação global
        ├── hooks/             # useAuth — acesso conveniente ao AuthContext
        ├── services/          # Instância do Axios com interceptor de JWT
        └── App.tsx            # Definição de rotas públicas e protegidas
```

## Principais funcionalidades

- **Autenticação JWT** com cadastro restrito a e-mail institucional (`@aluno.uepb.edu.br`)
- **Fluxo de decisão dinâmico**: árvore de perguntas armazenada no banco (não hardcoded no frontend), com 26 templates de pesquisa possíveis
- **Recomendação de orientador por afinidade**, considerando especialidade do professor e vagas disponíveis
- **Chat em tempo real** via Socket.io, com histórico persistido no banco
- Rotas privadas protegidas por middleware de autenticação — o backend nunca confia em IDs de usuário vindos do corpo da requisição, apenas no token verificado

## Como rodar localmente

### Pré-requisitos
- Node.js
- PostgreSQL rodando localmente (ou uma connection string de um Postgres remoto)

### Backend

```bash
cd backend
npm install
```

Crie um arquivo `.env` na pasta `backend/` com:

```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/tcc_platform?schema=public"
JWT_SECRET="uma-string-secreta-qualquer"
FRONTEND_URL="http://localhost:5173"
```

Rode as migrations e popule o banco com dados de teste:

```bash
npx prisma migrate dev
npx prisma db seed
```

Inicie o servidor de desenvolvimento (porta `3333`):

```bash
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

A aplicação sobe em `http://localhost:5173` por padrão.

## Scripts disponíveis

| Local | Comando | O que faz |
|---|---|---|
| `backend/` | `npm run dev` | Sobe o servidor com hot-reload (`tsx watch`) |
| `backend/` | `npm run build` | Verifica tipos e compila o TypeScript |
| `frontend/` | `npm run dev` | Sobe o Vite em modo desenvolvimento |
| `frontend/` | `npm run build` | Verifica tipos e gera o build de produção |
| `frontend/` | `npm run lint` | Roda o linter (`oxlint`) |

## Status do projeto

Projeto em desenvolvimento ativo, usado como ferramenta de aprendizado e portfólio. Professores atualmente são fictícios (cadastrados via seed, sem login próprio) — cadastro/login de professores reais é uma funcionalidade planejada para o futuro.
