# SI Soluções Imobiliárias — Backend

API REST desenvolvida em **NestJS** para gerenciamento de leads imobiliários, com autenticação JWT, regras de negócio e comunicação com o microsserviço de IA.

## 🛠 Tecnologias

| Tecnologia | Versão |
|---|---|
| Node.js | >= 20.x |
| NestJS | ^10.0 |
| Prisma ORM | ^5.0 |
| MySQL | 8.x |
| JWT | via @nestjs/jwt |
| Swagger | via @nestjs/swagger |

## 📁 Estrutura

```
src/
├── auth/          # Autenticação JWT + bcrypt
├── leads/         # CRUD de leads, Kanban, exportação CSV
├── users/         # Gerenciamento de usuários
├── dashboard/     # Métricas e estatísticas
├── ai/            # Proxy para o microsserviço de IA
└── prisma/        # Conexão com banco de dados
```

## 🚀 Como rodar

### Opção A — Docker (recomendado)

> Os 3 repositórios devem estar na mesma pasta pai:
> ```
> GitHub/
> ├── si-leads-backend/   ← docker-compose.yml está aqui
> ├── si-leads-frontend/
> └── si-leads-ai/
> ```

```bash
# 1. Configure as variáveis de ambiente
cp .env.example .env
# Edite o .env e preencha sua GROQ_API_KEY

# 2. Suba todos os serviços
docker-compose up --build

# 3. (Apenas na primeira vez) Crie as tabelas e popule o banco
docker exec si_backend npx prisma db push
docker exec si_backend npx ts-node prisma/seed.ts
```

Acesse **http://localhost:3000** no navegador.

**Credenciais de demo:**
- `admin@si.com.br` / `admin123`
- `agente@si.com.br` / `admin123`

### Opção B — Manual (sem Docker)

**Pré-requisitos:** Node.js 20+, MySQL 8 rodando localmente

```bash
# 1. Instale as dependências
npm install

# 2. Configure o ambiente
cp .env.example .env
# Edite DATABASE_URL com suas credenciais locais do MySQL

# 3. Crie as tabelas
npx prisma db push

# 4. (Opcional) Popule com dados de exemplo
npm run prisma:seed

# 5. Inicie o servidor
npm run start:dev
```

API disponível em `http://localhost:3001`

## 🌐 Endpoints principais

| Método | Rota | Descrição |
|---|---|---|
| POST | /auth/register | Cadastrar usuário |
| POST | /auth/login | Login |
| GET | /auth/me | Usuário autenticado |
| GET | /leads | Listar leads (filtros + paginação) |
| GET | /leads/kanban | Leads agrupados por status |
| GET | /leads/export/csv | Exportar CSV |
| POST | /leads | Criar lead |
| PATCH | /leads/:id | Atualizar lead |
| DELETE | /leads/:id | Deletar lead |
| GET | /dashboard/metrics | Métricas gerais |
| POST | /ai/chat | Enviar mensagem ao ChatBot |

📚 **Swagger:** `http://localhost:3001/api/docs`

## 🔐 Variáveis de ambiente

| Variável | Descrição |
|---|---|
| `DATABASE_URL` | String de conexão MySQL |
| `MYSQL_ROOT_PASSWORD` | Senha root do MySQL (Docker) |
| `MYSQL_DATABASE` | Nome do banco (Docker) |
| `MYSQL_USER` | Usuário do banco (Docker) |
| `MYSQL_PASSWORD` | Senha do usuário (Docker) |
| `JWT_SECRET` | Chave secreta para tokens JWT |
| `JWT_EXPIRES_IN` | Tempo de expiração do token (ex: `7d`) |
| `PORT` | Porta do servidor (padrão: `3001`) |
| `FRONTEND_URL` | URL do frontend para CORS |
| `AI_SERVICE_URL` | URL do microsserviço de IA |
| `GROQ_API_KEY` | Chave da API Groq |

## 🔗 Integração com outros serviços

- **Frontend** (`si-leads-frontend`): consome esta API em `http://localhost:3001`
- **Microsserviço de IA** (`si-leads-ai`): esta API faz proxy em `POST /ai/chat`