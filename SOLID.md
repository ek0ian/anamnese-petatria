# Princípios SOLID aplicados

Este documento mapeia onde cada princípio aparece no código, atendendo ao bônus D do trabalho. Os 5 princípios estão aplicados; abaixo aponto pelo menos um exemplo concreto de cada.

---

## S — Single Responsibility Principle

**Onde:** `backend/AnamnesePetAtria.Api/Services/IPacienteService.cs` (classe `PacienteService`)

A classe `PacienteService` cuida **exclusivamente** das regras de negócio de pacientes (listar, criar, atualizar, remover, gerar código sequencial, formatar idade). Ela **não** cuida de tutores, anamneses, autenticação nem da camada HTTP. Cada um desses concerns está em um serviço próprio:

- `TutorService` — só tutores
- `AnamneseService` — só anamneses
- `AuthService` — só autenticação
- `JwtTokenService` — só geração de tokens

Isso significa que mudar a regra de exibição de idade (`FormatarIdade`) não afeta nem o serviço de tutores nem o controller. A mudança fica localizada.

```csharp
// PacienteService.cs — só lógica de paciente
public async Task<PacienteResponse> CriarAsync(PacienteRequest req) { ... }
public async Task<bool> AtualizarAsync(string id, PacienteRequest req) { ... }
private static string? FormatarIdade(DateTime? nascimento) { ... }
```

---

## O — Open/Closed Principle

**Onde:** `backend/AnamnesePetAtria.Api/Repositories/IRepository.cs`

O `IRepository<T>` define um contrato genérico de CRUD para qualquer entidade que herda de `EntidadeBase`. A implementação `MongoRepository<T>` é **fechada para modificação** — não precisa ser alterada para suportar uma nova entidade — mas **aberta para extensão** porque qualquer model novo (ex.: `Vacina`, `Cirurgia`) pode ter um repositório criado simplesmente instanciando `MongoRepository<Vacina>` sem reescrever nenhuma linha do CRUD.

```csharp
public interface IRepository<T> where T : EntidadeBase
{
    Task<List<T>> ListarAsync(Expression<Func<T, bool>>? filtro = null);
    Task<T?> ObterPorIdAsync(string id);
    Task<T> InserirAsync(T entidade);
    Task<bool> AtualizarAsync(string id, T entidade);
    Task<bool> RemoverAsync(string id);
}
```

Mesmo raciocínio aparece em `CatalogoExames`: para adicionar uma nova categoria ou exame, basta adicionar uma linha em `Itens` — nenhum código existente precisa mudar.

---

## L — Liskov Substitution Principle

**Onde:** Hierarquia `EntidadeBase` em `backend/AnamnesePetAtria.Api/Models/EntidadeBase.cs`

Toda entidade persistida herda de `EntidadeBase`, que define `Id`, `CriadoEm` e `AtualizadoEm`. Qualquer subclasse (`Paciente`, `Tutor`, `Anamnese`, etc.) pode ser usada onde `EntidadeBase` é esperada — o repositório genérico `IRepository<T> where T : EntidadeBase` depende exatamente dessa garantia para gerenciar `CriadoEm` e `AtualizadoEm` sem conhecer o tipo concreto.

```csharp
public abstract class EntidadeBase
{
    public string? Id { get; set; }
    public DateTime CriadoEm { get; set; } = DateTime.UtcNow;
    public DateTime? AtualizadoEm { get; set; }
}

public class Paciente : EntidadeBase { ... }
public class Anamnese : EntidadeBase { ... }
```

Nenhuma subclasse quebra os contratos da base — o `MongoRepository.InserirAsync` consegue setar `CriadoEm` em **qualquer** subclasse passada.

---

## I — Interface Segregation Principle

**Onde:** Serviços em `backend/AnamnesePetAtria.Api/Services/`

Cada serviço expõe **uma interface enxuta com somente os métodos relevantes ao seu domínio**, ao invés de uma mega-interface "IService" genérica. Quem usa `IAuthService` não fica acoplado a métodos de paciente; quem usa `IExameService` não vê nada de atestado.

```csharp
public interface IAuthService
{
    Task<AuthResponse> RegistrarAsync(RegistroRequest req);
    Task<AuthResponse?> LoginAsync(LoginRequest req);
}

public interface IPasswordHasher
{
    string Hash(string senhaPura);
    bool Verify(string senhaPura, string hashArmazenado);
}
```

`IPasswordHasher` é o caso mais claro — duas operações coesas, nada de criptografia genérica ou utilidades não relacionadas. Os controllers só dependem do que realmente usam.

---

## D — Dependency Inversion Principle

**Onde:** Toda a composição em `backend/AnamnesePetAtria.Api/Program.cs`

Módulos de alto nível (`AuthService`, `PacienteService`, controllers) **não dependem de implementações concretas**. Eles dependem de abstrações (`IMongoDbContext`, `IPasswordHasher`, `IJwtTokenService`, `IRepository<T>`). Quem decide a implementação concreta é o container de DI na composition root:

```csharp
// Program.cs
builder.Services.AddSingleton<IMongoDbContext, MongoDbContext>();
builder.Services.AddSingleton<IPasswordHasher, BCryptPasswordHasher>();
builder.Services.AddSingleton<IJwtTokenService, JwtTokenService>();
builder.Services.AddScoped<IAuthService, AuthService>();
```

```csharp
// AuthService.cs — recebe as abstrações via construtor
public AuthService(IMongoDbContext db, IPasswordHasher hasher, IJwtTokenService jwt)
{
    _db = db;
    _hasher = hasher;
    _jwt = jwt;
}
```

Por isso o `BCryptPasswordHasher` pode ser substituído por outro algoritmo (Argon2, scrypt, etc.) sem mudar uma linha do `AuthService`. E os testes (`PasswordHasherTests`, `JwtTokenServiceTests`) conseguem testar a lógica sem subir o MongoDB porque não dependem de implementação concreta.

---

## Resumo da rastreabilidade

| Princípio | Arquivo                                                   | Conceito                                             |
| --------- | --------------------------------------------------------- | ---------------------------------------------------- |
| **S**     | `Services/IPacienteService.cs`                            | Cada service trata de um único domínio               |
| **O**     | `Repositories/IRepository.cs`, `Data/CatalogoExames.cs`   | CRUD genérico + catálogo extensível por dado         |
| **L**     | `Models/EntidadeBase.cs`                                  | Subclasses substituíveis pela base no repositório    |
| **I**     | `Services/IAuthService.cs`, `Services/IPasswordHasher.cs` | Interfaces enxutas e coesas por papel                |
| **D**     | `Program.cs` + construtores dos services                  | DI por abstração; implementações intercambiáveis     |
