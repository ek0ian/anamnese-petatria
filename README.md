# Anamnese Pet'Atria

Sistema web para gerenciamento de fichas de anamnese veterinária, inspirado no modelo da clínica Camila Rosa Medicina Veterinária. Trabalho Prático Semestral de **Arquitetura de Aplicações Web 2026.1**.

A aplicação permite que veterinários autenticados:

- Cadastrem **tutores** e **pacientes** (animais) com código sequencial único.
- Preencham fichas de **anamnese** completas (queixa principal, histórico clínico, inspeção geral, diagnóstico, conduta).
- Emitam **atestados e termos** a partir de modelos pré-cadastrados (Termo para Exames, Procedimento Cirúrgico, Eutanásia, Óbito, Retirada sem Alta, Encaminhamento, etc).
- Solicitem **exames** organizados por categoria (Hematologia, Bioquímico, Urinário, Parasitológico, Imagem, Sorologia).
- Gerenciem vacinas, prescrições, retornos, procedimentos, cirurgias, internações e orçamentos por paciente.

---

## Stack

| Camada    | Tecnologia                                |
| --------- | ----------------------------------------- |
| Backend   | .NET 10 (C#) — ASP.NET Core Web API       |
| Banco     | MongoDB 7 (rodando em Docker)             |
| Frontend  | HTML5 + CSS3 + JavaScript (fetch puro)    |
| Doc       | Swagger / OpenAPI (Swashbuckle 10)        |
| Auth      | JWT (HS256) com RBAC (admin, veterinário) |
| Testes    | xUnit + Moq                               |

---

## Pré-requisitos

- [.NET 10 SDK](https://dotnet.microsoft.com/download)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (para subir o MongoDB)
- Um navegador moderno (Chrome, Edge, Firefox)

Opcional: VS Code, Visual Studio 2026 ou JetBrains Rider para mexer no código.

---

## Como executar localmente

### 1. Clone o repositório

```bash
git clone https://github.com/ek0ian/anamnese-petatria.git
cd anamnese-petatria
```

### 2. Suba o MongoDB via Docker

```bash
docker compose up -d
```

Isso sobe dois containers:

- `mongodb-petatria` na porta **27018** (não usa a 27017 padrão de propósito, para conviver com outros projetos que já usam Mongo).
- `mongo-express-petatria` na porta **8082** (interface web para inspeção rápida, opcional).

Volumes nomeados (`petatria_mongo_data`) garantem que os dados não se misturem com outras instâncias.

### 3. Suba a API

```bash
dotnet run --project backend/AnamnesePetAtria.Api
```

A API ficará disponível em `http://localhost:5147`.

A primeira request demora um pouco enquanto o driver do Mongo abre conexão.

### 4. Acesse o Swagger

Com a API rodando, abra:

```
http://localhost:5147/swagger
```

O Swagger UI lista todos os endpoints, exige o token JWT no botão **Authorize** para chamadas protegidas. Endereço `/` redireciona pra `/swagger`.

### 5. Sirva o frontend

O frontend é HTML puro. Basta abrir o arquivo:

```
frontend/index.html
```

Recomendado servir via um servidor estático simples (evita problemas de CORS no fetch):

```bash
# Opção 1 — via dotnet
dotnet tool install --global dotnet-serve
cd frontend
dotnet serve -p 8080

# Opção 2 — via Python
cd frontend
python -m http.server 8080
```

Em seguida, abra `http://localhost:8080`.

### 6. Crie um usuário e teste

1. Clique em **Registrar-se** na tela de login.
2. Crie um usuário (perfil **admin** se quiser deletar registros depois).
3. Faça login → vai cair na tela principal com a sidebar de pacientes.
4. Clique no **+** do topo para cadastrar um tutor + paciente.
5. Selecione o paciente na lista → use as abas (Anamnese, Exames, Atestados, etc).

---

## Variáveis de ambiente

A API lê configurações de `backend/AnamnesePetAtria.Api/appsettings.json`. Pra produção, copie `.env.example` para `.env` e adapte:

```
MONGO_USER=petatria
MONGO_PASS=petatria123
MONGO_CONNECTION=mongodb://petatria:petatria123@localhost:27018/?authSource=admin
MONGO_DATABASE=anamnese_petatria

JWT_SECRET=troque-este-segredo-em-producao-com-pelo-menos-32-caracteres
JWT_ISSUER=anamnese-petatria
JWT_AUDIENCE=anamnese-petatria-clients
JWT_EXPIRATION_HOURS=8
```

> **Nunca commite o `.env` real.** Ele já está no `.gitignore`.

---

## Endpoints principais

| Método | Rota                                | Auth   | Descrição                                     |
| ------ | ----------------------------------- | ------ | --------------------------------------------- |
| POST   | `/api/auth/registrar`               | —      | Cria usuário (veterinário ou admin)           |
| POST   | `/api/auth/login`                   | —      | Retorna JWT + dados do usuário                |
| GET    | `/api/tutores?busca=...`            | JWT    | Lista tutores                                 |
| POST   | `/api/tutores`                      | JWT    | Cadastra tutor                                |
| DELETE | `/api/tutores/{id}`                 | admin  | Remove tutor                                  |
| GET    | `/api/pacientes?busca=...`          | JWT    | Lista pacientes (busca por nome ou código)    |
| GET    | `/api/pacientes/{id}`               | JWT    | Detalhes do paciente (inclui idade formatada) |
| POST   | `/api/pacientes`                    | JWT    | Cadastra paciente (gera código sequencial)    |
| DELETE | `/api/pacientes/{id}`               | admin  | Remove paciente                               |
| GET    | `/api/anamneses/paciente/{id}`      | JWT    | Lista anamneses do paciente                   |
| POST   | `/api/anamneses`                    | JWT    | Cria anamnese                                 |
| GET    | `/api/exames/categorias`            | JWT    | Categorias do catálogo                        |
| GET    | `/api/exames/catalogo?termo=...`    | JWT    | Autocomplete de exames                        |
| POST   | `/api/exames`                       | JWT    | Cria solicitação de exames                    |
| GET    | `/api/atestados/modelos`            | JWT    | Modelos de atestados/termos pré-cadastrados   |
| POST   | `/api/atestados`                    | JWT    | Emite atestado                                |

Todos os endpoints com `[Authorize]` exigem header `Authorization: Bearer <token>`. Os `admin`-only respondem **403 Forbidden** se chamados por usuário com perfil `veterinario`.

---

## Rodando os testes

```bash
dotnet test backend/AnamnesePetAtria.Tests/AnamnesePetAtria.Tests.csproj
```

São **21 testes** cobrindo:

- `PasswordHasherTests` — hash/verify do BCrypt (4 cenários).
- `JwtTokenServiceTests` — geração e conteúdo do token (3 cenários).
- `CatalogoExamesTests` — filtragem e categorias do catálogo (5 cenários).
- `ModelosAtestadoTests` — modelos padrão dos 7 tipos de atestado (9 cenários — Theory + Fact).

Cobre os 4 cenários (2 sucesso + 2 erro) exigidos pelo bônus C, e bem mais.

---

## Princípios SOLID aplicados

Veja [SOLID.md](SOLID.md) na raiz do repositório.

---

## Critérios atendidos

### Obrigatórios

- ✅ REST API com CRUD completo em 2+ entidades (Pacientes, Tutores, Anamneses, Atestados, Exames).
- ✅ Banco NoSQL real (MongoDB no Docker, **não** em memória).
- ✅ Swagger/OpenAPI com descrições, schemas e suporte a JWT.
- ✅ Frontend com navegação assíncrona (fetch, sem reload).
- ✅ README claro com instruções de execução.

### Bônus

- ✅ **Bônus A** — JWT + registro/login com expiração configurável.
- ✅ **Bônus B** — RBAC com perfis `admin` e `veterinario`. Apenas admin pode deletar (verificado por `[Authorize(Roles = ...)]`).
- ✅ **Bônus C** — 21 testes unitários xUnit, executáveis com `dotnet test`.
- ✅ **Bônus D** — Princípios SOLID aplicados, documentados em [SOLID.md](SOLID.md).

---

## Estrutura do repositório

```
anamnese-petatria/
├── backend/
│   ├── AnamnesePetAtria.slnx
│   ├── AnamnesePetAtria.Api/
│   │   ├── Configuration/        — settings (Mongo, JWT, Swagger)
│   │   ├── Controllers/          — endpoints REST
│   │   ├── Data/                 — contexto Mongo, catálogos seed
│   │   ├── DTOs/                 — payloads de request/response
│   │   ├── Models/               — entidades do domínio
│   │   ├── Repositories/         — repositório genérico (SOLID O)
│   │   ├── Services/             — regras de negócio (interfaces + impl)
│   │   └── Program.cs            — composition root
│   └── AnamnesePetAtria.Tests/   — testes xUnit
├── frontend/
│   ├── index.html
│   ├── css/style.css
│   └── js/                       — api.js, auth.js, abas.js, modais.js, app.js
├── docker-compose.yml
├── .env.example
├── README.md
└── SOLID.md
```

---

## Sobre o Mongo no Docker conviver com outros projetos

A configuração foi pensada para não colidir com outras instâncias:

- Porta no host: **27018** (não a 27017 padrão).
- Nome do container: `mongodb-petatria`.
- Volume nomeado: `petatria_mongo_data`.
- Database name: `anamnese_petatria`.

Você pode rodar este projeto em paralelo com qualquer outro que use a porta padrão 27017.
