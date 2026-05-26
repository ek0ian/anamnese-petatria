using System.Text;
using AnamnesePetAtria.Api.Configuration;
using AnamnesePetAtria.Api.Data;
using AnamnesePetAtria.Api.Models;
using AnamnesePetAtria.Api.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

// ========= Configuracao =========
builder.Services.Configure<MongoDbSettings>(builder.Configuration.GetSection("MongoDb"));
builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection("Jwt"));

// ========= Servicos =========
builder.Services.AddSingleton<IMongoDbContext, MongoDbContext>();
builder.Services.AddSingleton<IPasswordHasher, BCryptPasswordHasher>();
builder.Services.AddSingleton<IJwtTokenService, JwtTokenService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<ITutorService, TutorService>();
builder.Services.AddScoped<IPacienteService, PacienteService>();
builder.Services.AddScoped<IAnamneseService, AnamneseService>();
builder.Services.AddScoped<IExameService, ExameService>();
builder.Services.AddScoped<IAtestadoService, AtestadoService>();

// ========= Autenticacao JWT =========
var jwtSettings = builder.Configuration.GetSection("Jwt").Get<JwtSettings>()
    ?? throw new InvalidOperationException("Secao 'Jwt' nao configurada em appsettings.");

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSettings.Issuer,
            ValidAudience = jwtSettings.Audience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.Secret)),
            ClockSkew = TimeSpan.Zero
        };
    });

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("RequerAdmin", p => p.RequireRole(Perfis.Admin));
    options.AddPolicy("RequerAutenticado",
        p => p.RequireRole(Perfis.Admin, Perfis.Veterinario));
});

// ========= CORS para o frontend local =========
builder.Services.AddCors(opt =>
{
    opt.AddDefaultPolicy(policy => policy
        .AllowAnyOrigin()
        .AllowAnyHeader()
        .AllowAnyMethod());
});

builder.Services.AddControllers()
    .AddJsonOptions(opt =>
    {
        // Aceita enums como string ("Canino") nos requests, alem do numero.
        opt.JsonSerializerOptions.Converters.Add(
            new System.Text.Json.Serialization.JsonStringEnumConverter());
    });
builder.Services.AddSwaggerComJwt();

var app = builder.Build();

// Swagger sempre disponivel (inclusive em producao, conforme requisito do trabalho).
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Anamnese Pet'Atria v1");
    c.RoutePrefix = "swagger";
});

// Redireciona / para /swagger.
app.MapGet("/", () => Results.Redirect("/swagger")).ExcludeFromDescription();

app.UseCors();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();

// Tornar a classe Program visivel para o projeto de testes (WebApplicationFactory).
public partial class Program { }
