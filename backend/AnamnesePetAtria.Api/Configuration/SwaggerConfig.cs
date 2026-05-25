using Microsoft.OpenApi;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace AnamnesePetAtria.Api.Configuration;

public static class SwaggerConfig
{
    public static IServiceCollection AddSwaggerComJwt(this IServiceCollection services)
    {
        services.AddEndpointsApiExplorer();
        services.AddSwaggerGen(SetupSwagger);
        return services;
    }

    private static void SetupSwagger(SwaggerGenOptions opt)
    {
        opt.SwaggerDoc("v1", new OpenApiInfo
        {
            Title = "Anamnese Pet'Atria API",
            Version = "v1",
            Description = "API REST do sistema de prontuario veterinario Anamnese Pet'Atria. " +
                          "Trabalho semestral de Arquitetura de Aplicacoes Web 2026.1."
        });

        var xmlFile = $"{System.Reflection.Assembly.GetExecutingAssembly().GetName().Name}.xml";
        var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
        if (File.Exists(xmlPath))
            opt.IncludeXmlComments(xmlPath);

        opt.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
        {
            Name = "Authorization",
            Type = SecuritySchemeType.Http,
            Scheme = "bearer",
            BearerFormat = "JWT",
            In = ParameterLocation.Header,
            Description = "Cole o token JWT (sem o prefixo 'Bearer '). Obtenha em POST /api/auth/login."
        });

        opt.AddSecurityRequirement(_ => new OpenApiSecurityRequirement
        {
            { new OpenApiSecuritySchemeReference("Bearer"), new List<string>() }
        });
    }
}
