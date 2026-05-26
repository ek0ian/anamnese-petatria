using AnamnesePetAtria.Api.Services;
using Xunit;

namespace AnamnesePetAtria.Tests;

public class PasswordHasherTests
{
    private readonly IPasswordHasher _hasher = new BCryptPasswordHasher();

    [Fact] // sucesso 1: hash gera valor diferente do original
    public void Hash_DeveGerarValorDiferenteDaSenhaOriginal()
    {
        var senha = "senha-segura-123";
        var hash = _hasher.Hash(senha);

        Assert.NotEqual(senha, hash);
        Assert.False(string.IsNullOrWhiteSpace(hash));
    }

    [Fact] // sucesso 2: verify retorna true para a senha correta
    public void Verify_DeveRetornarTrueParaSenhaCorreta()
    {
        var senha = "minhaSenha456";
        var hash = _hasher.Hash(senha);

        Assert.True(_hasher.Verify(senha, hash));
    }

    [Fact] // erro 1: verify retorna false para senha errada
    public void Verify_DeveRetornarFalseParaSenhaErrada()
    {
        var hash = _hasher.Hash("certa");

        Assert.False(_hasher.Verify("errada", hash));
    }

    [Fact] // erro 2: dois hashes da mesma senha sao diferentes (salt randomico)
    public void Hash_DeveGerarHashesDiferentesParaMesmaSenha()
    {
        var senha = "senha-test";
        var h1 = _hasher.Hash(senha);
        var h2 = _hasher.Hash(senha);

        Assert.NotEqual(h1, h2);
        // Mas ambos validam contra a senha original
        Assert.True(_hasher.Verify(senha, h1));
        Assert.True(_hasher.Verify(senha, h2));
    }
}
