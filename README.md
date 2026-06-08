# SI Soluções Imobiliárias — Backend

API REST desenvolvida em **NestJS** para gerenciamento de leads imobiliários.

## 🛠 Tecnologias

| Tecnologia | Versão |
|---|---|
| Node.js | >= 20.x |
| NestJS | ^10.0 |
| Prisma ORM | ^5.0 |
| MySQL | 8.x |
| JWT | via @nestjs/jwt |
| Swagger | via @nestjs/swagger |

## 📋 Pré-requisitos

- Node.js 20+
- MySQL 8+ rodando localmente ou via Docker
- npm ou yarn

## ⚙️ Configuração

```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/si-leads-backend

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente
cp .env.example .env
# Edite o .env com suas credenciais

# 4. Rode as migrations do banco
npx prisma migrate dev --name init

# 5. (Opcional) Popule o banco com dados de exemplo
npm run prisma:seed

# 6. Inicie o servidor
npm run start:dev
```

## 🌐 Endpoints principais

| Método | Rota | Descrição |
|---|---|---|
| POST | /auth/register | Cadastrar usuário |
| POST | /auth/login | Login |
| GET | /auth/me | Usuário autenticado |
| GET | /leads | Listar leads (com filtros) |
| GET | /leads/kanban | Leads agrupados por status |
| POST | /leads | Criar lead |
| PATCH | /leads/:id | Atualizar lead |
| DELETE | /leads/:id | Deletar lead |
| GET | /leads/export/csv | Exportar CSV |
| GET | /dashboard/metrics | Métricas do sistema |
| POST | /ai/chat | Enviar mensagem ao ChatBot |

📚 **Documentação Swagger**: `http://localhost:3001/api/docs`

## 🔐 Variáveis de ambiente

| Variável | Descrição | Exemplo |
|---|---|---|
| `DATABASE_URL` | String de conexão MySQL | `mysql://root:root@localhost:3306/si_leads` |
| `JWT_SECRET` | Chave secreta JWT | `minha_chave_super_secreta` |
| `JWT_EXPIRES_IN` | Expiração do token | `7d` |
| `PORT` | Porta do servidor | `3001` |
| `FRONTEND_URL` | URL do frontend (CORS) | `http://localhost:3000` |
| `AI_SERVICE_URL` | URL do microsserviço de IA | `http://localhost:8000` |

## 🐳 Docker

```bash
docker build -t si-leads-backend .
docker run -p 3001:3001 --env-file .env si-leads-backend
```

Ou use o `docker-compose.yml` na raiz do projeto.

## 🔗 Integração com outros serviços

- **Frontend**: Consome esta API via HTTP em `http://localhost:3001`
- **Microsserviço de IA**: Esta API faz proxy para `AI_SERVICE_URL/chat`
