# 🐾 Anamnese Pet'Atria

<div align="center">

### Sistema de Prontuário e Anamnese Veterinária

Trabalho Prático Semestral da disciplina **Arquitetura de Aplicações Web — 2026.1**.

Plataforma web para clínicas veterinárias gerenciarem tutores, pacientes, fichas de anamnese, atestados e exames através de uma API REST integrada ao MongoDB.

![.NET](https://img.shields.io/badge/.NET-10-512BD4)
![C#](https://img.shields.io/badge/C%23-Language-purple)
![MongoDB](https://img.shields.io/badge/MongoDB-7-green)
![JWT](https://img.shields.io/badge/JWT-Authentication-orange)
![Swagger](https://img.shields.io/badge/Swagger-OpenAPI-brightgreen)
![xUnit](https://img.shields.io/badge/xUnit-Testing-red)
![Docker](https://img.shields.io/badge/Docker-Compose-blue)

</div>

---

## 📖 Visão Geral

O **Anamnese Pet'Atria** é uma aplicação web voltada à gestão de prontuários: cadastro de tutores e pacientes, fichas de anamnese completas, emissão de atestados/termos e solicitação de exames.

O projeto demonstra os principais conceitos de desenvolvimento web moderno:

- Design de API RESTful
- Integração com banco NoSQL (MongoDB)
- Autenticação com JWT
- Controle de acesso por perfil (RBAC)
- Documentação OpenAPI / Swagger
- Testes unitários
- Princípios SOLID
- Comunicação assíncrona no frontend

---

## ✨ Funcionalidades

### 👤 Tutores e Pacientes

- Cadastrar tutores e pacientes (animais)
- Código sequencial único por paciente
- Buscar por nome ou código
- Atualizar e remover registros
- Idade do paciente formatada automaticamente

### 📋 Anamnese

- Criar fichas de anamnese vinculadas ao paciente
- Queixa principal, histórico clínico, inspeção geral, diagnóstico e conduta
- Listar histórico de anamneses do paciente

### 📄 Atestados e Termos

- Emitir a partir de modelos pré-cadastrados
- Termo para Exames, Procedimento Cirúrgico, Eutanásia, Óbito, Retirada sem Alta, Encaminhamento, entre outros

### 🔬 Exames

- Catálogo organizado por categoria (Hematologia, Bioquímico, Urinário, Parasitológico, Imagem, Sorologia)
- Autocomplete de exames
- Solicitações vinculadas ao paciente

### 🩺 Acompanhamento do Paciente

- Vacinas, prescrições, retornos, procedimentos, cirurgias, internações e orçamentos

### 🔐 Autenticação e Autorização

- Registro e login de usuários
- Autenticação via JWT
- Controle de acesso por perfil (admin e veterinário)

---

## 🛠️ Stack Tecnológica

### Backend

- .NET 10 (C#)
- ASP.NET Core Web API

### Banco de Dados

- MongoDB 7
- MongoDB.Driver

### Segurança

- JSON Web Tokens (JWT, HS256)
- Hash de senha com BCrypt

### Testes

- xUnit
- Moq

### Documentação

- Swagger / OpenAPI (Swashbuckle)

### Frontend

- HTML5
- CSS3
- JavaScript (fetch puro)

### Containerização

- Docker Compose (MongoDB)

---

## 📂 Estrutura do Projeto

```text
backend/
├── AnamnesePetAtria.Api/
│   ├── Configuration/        # settings (Mongo, JWT, Swagger)
│   ├── Controllers/          # endpoints REST
│   ├── Data/                 # contexto Mongo, catálogos seed
│   ├── DTOs/                 # payloads de request/response
│   ├── Models/               # entidades do domínio
│   ├── Repositories/         # repositório genérico
│   ├── Services/             # regras de negócio (interfaces + impl)
│   └── Program.cs            # composition root
└── AnamnesePetAtria.Tests/   # testes xUnit

frontend/
├── css/
├── js/                       # api.js, auth.js, abas.js, modais.js, app.js
└── index.html
```

---

## 🚀 Instalação

### 📋 Pré-requisitos

- .NET 10 SDK
- Docker Desktop (para subir o MongoDB)
- Um navegador moderno (Chrome, Edge, Firefox)

### 📥 Clonar o Repositório

```bash
git clone https://github.com/ek0ian/anamnese-petatria.git
cd anamnese-petatria
```

---

## ⚙️ Variáveis de Ambiente

O arquivo `.env` (na raiz) é usado **apenas pelo Docker Compose** para subir o MongoDB. Copie o exemplo e ajuste se quiser:

```env
MONGO_USER=petatria
MONGO_PASS=petatria123
```

> A API .NET lê a configuração de `appsettings.json` (com defaults de desenvolvimento). Em produção, valores sensíveis — como `Jwt__Secret` — podem ser sobrescritos por variáveis de ambiente. O `.env` real nunca é commitado (já está no `.gitignore`).

---

## ▶️ Executando a Aplicação

### 1. Suba o MongoDB

```bash
docker compose up -d
```

Sobe o `mongodb-petatria` na porta **27018** (não a 27017 padrão, para conviver com outros projetos) e o `mongo-express-petatria` na porta **8082** (inspeção opcional).

### 2. Suba a API

```bash
dotnet run --project backend/AnamnesePetAtria.Api
```

A API fica disponível em `http://localhost:5147`. A primeira request demora um pouco enquanto o driver do Mongo abre conexão.

### 3. Sirva o frontend

```bash
cd frontend
python -m http.server 8080
```

Em seguida, abra `http://localhost:8080`, registre-se (escolha o perfil **Administrador** para poder excluir registros) e faça login.

---

## 🧪 Rodando os Testes

```bash
dotnet test backend/AnamnesePetAtria.Tests/AnamnesePetAtria.Tests.csproj
```

São **29 testes** cobrindo as regras de negócio e o CRUD da camada de serviço:

- `PasswordHasherTests` — hash/verify do BCrypt
- `JwtTokenServiceTests` — geração e conteúdo do token
- `CatalogoExamesTests` — filtragem e categorias do catálogo
- `ModelosAtestadoTests` — modelos padrão dos atestados
- `PacienteServiceTests` — CRUD de pacientes com `IMongoDbContext` mockado via Moq (sucesso e erro)

---

## 📚 Documentação da API

Com a aplicação rodando, o Swagger fica disponível em:

```text
http://localhost:5147/swagger
```

O Swagger oferece:

- Documentação dos endpoints
- Schemas de request
- Suporte a autenticação JWT (botão **Authorize**)
- Interface interativa de testes

---

## 🔗 Endpoints da API

### Autenticação

| Método | Endpoint            |
| ------ | ------------------- |
| POST   | /api/auth/registrar |
| POST   | /api/auth/login     |

### Tutores

| Método | Endpoint          |
| ------ | ----------------- |
| GET    | /api/tutores      |
| GET    | /api/tutores/{id} |
| POST   | /api/tutores      |
| PUT    | /api/tutores/{id} |
| DELETE | /api/tutores/{id} |

### Pacientes

| Método | Endpoint                  |
| ------ | ------------------------- |
| GET    | /api/pacientes            |
| GET    | /api/pacientes/{id}       |
| GET    | /api/pacientes/codigo/{n} |
| POST   | /api/pacientes            |
| PUT    | /api/pacientes/{id}       |
| DELETE | /api/pacientes/{id}       |

### Anamneses

| Método | Endpoint                     |
| ------ | ---------------------------- |
| GET    | /api/anamneses/paciente/{id} |
| GET    | /api/anamneses/{id}          |
| POST   | /api/anamneses               |
| PUT    | /api/anamneses/{id}          |
| DELETE | /api/anamneses/{id}          |

### Exames

| Método | Endpoint                  |
| ------ | ------------------------- |
| GET    | /api/exames/categorias    |
| GET    | /api/exames/catalogo      |
| GET    | /api/exames/paciente/{id} |
| POST   | /api/exames               |
| PUT    | /api/exames/{id}          |
| DELETE | /api/exames/{id}          |

### Atestados

| Método | Endpoint                     |
| ------ | ---------------------------- |
| GET    | /api/atestados/modelos       |
| GET    | /api/atestados/paciente/{id} |
| POST   | /api/atestados               |
| PUT    | /api/atestados/{id}          |
| DELETE | /api/atestados/{id}          |

---

## 🛡️ Segurança

- Autenticação via JWT (HS256) com expiração configurável
- Rotas protegidas com `[Authorize]`
- Autorização por perfil (RBAC): apenas `admin` pode excluir registros, via `[Authorize(Roles = ...)]`
- Hash de senha com BCrypt
- Perfil do usuário embutido no payload do token e validado no servidor

---

## 🎓 Objetivos Acadêmicos

Este projeto demonstra:

- Desenvolvimento de API REST
- Uso de banco de dados NoSQL
- Autenticação e autorização
- Documentação de API
- Testes unitários
- Boas práticas de arquitetura de software

Os princípios **SOLID** aplicados estão mapeados em [SOLID.md](SOLID.md), com o arquivo/classe de cada princípio e a justificativa.

---

## 👨‍💻 Autor

**Ian Oliveira**

Arquitetura de Aplicações Web — Projeto Acadêmico

2026
