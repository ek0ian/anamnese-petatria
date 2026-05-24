namespace AnamnesePetAtria.Api.Services;

/// <summary>
/// Abstracao para hash de senha. Aplicacao do principio SOLID D (Dependency Inversion):
/// AuthService depende dessa interface, nao da implementacao concreta (BCrypt).
/// </summary>
public interface IPasswordHasher
{
    string Hash(string senhaPura);
    bool Verify(string senhaPura, string hashArmazenado);
}

public class BCryptPasswordHasher : IPasswordHasher
{
    public string Hash(string senhaPura) => BCrypt.Net.BCrypt.HashPassword(senhaPura);

    public bool Verify(string senhaPura, string hashArmazenado) =>
        BCrypt.Net.BCrypt.Verify(senhaPura, hashArmazenado);
}
