using System.IdentityModel.Tokens.Jwt;
using AnamnesePetAtria.Api.Configuration;
using AnamnesePetAtria.Api.Models;
using AnamnesePetAtria.Api.Services;
using Microsoft.Extensions.Options;
using Xunit;

namespace AnamnesePetAtria.Tests;

public class JwtTokenServiceTests
{
    private readonly JwtSettings _settings = new()
    {
        Secret = "uma-chave-de-teste-com-pelo-menos-32-caracteres!!",
        Issuer = "test-issuer",
        Audience = "test-audience",
        ExpirationHours = 1
    };

    private IJwtTokenService NovoService() =>
        new JwtTokenService(Options.Create(_settings));

    [Fact] // sucesso: token nao vem vazio e tem expiracao no futuro
    public void Gerar_DeveRetornarTokenNaoVazio()
    {
        var usuario = new Usuario { Id = "abc", Nome = "Ian", Email = "ian@x.com", Perfil = Perfis.Veterinario };

        var (token, expira) = NovoService().Gerar(usuario);

        Assert.False(string.IsNullOrWhiteSpace(token));
        Assert.True(expira > DateTime.UtcNow);
    }

    [Fact] // sucesso: claims contem email e perfil do usuario
    public void Gerar_DeveIncluirEmailEPerfilNoToken()
    {
        var usuario = new Usuario { Id = "abc", Nome = "Ian", Email = "ian@x.com", Perfil = Perfis.Admin };

        var (token, _) = NovoService().Gerar(usuario);
        var jwt = new JwtSecurityTokenHandler().ReadJwtToken(token);

        Assert.Contains(jwt.Claims, c => c.Value == usuario.Email);
        Assert.Contains(jwt.Claims, c => c.Value == Perfis.Admin);
    }

    [Fact] // erro/borda: dois tokens gerados sao distintos (jti unico)
    public void Gerar_DoisChamadosSeguidos_DevemProduzirTokensDiferentes()
    {
        var svc = NovoService();
        var u = new Usuario { Id = "abc", Nome = "Ian", Email = "ian@x.com", Perfil = Perfis.Veterinario };

        var (t1, _) = svc.Gerar(u);
        var (t2, _) = svc.Gerar(u);

        Assert.NotEqual(t1, t2);
    }
}
