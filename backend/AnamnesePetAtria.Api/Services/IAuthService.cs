using AnamnesePetAtria.Api.Data;
using AnamnesePetAtria.Api.DTOs;
using AnamnesePetAtria.Api.Models;
using MongoDB.Driver;

namespace AnamnesePetAtria.Api.Services;

public interface IAuthService
{
    Task<AuthResponse> RegistrarAsync(RegistroRequest req);
    Task<AuthResponse?> LoginAsync(LoginRequest req);
}

public class AuthService : IAuthService
{
    private readonly IMongoDbContext _db;
    private readonly IPasswordHasher _hasher;
    private readonly IJwtTokenService _jwt;

    public AuthService(IMongoDbContext db, IPasswordHasher hasher, IJwtTokenService jwt)
    {
        _db = db;
        _hasher = hasher;
        _jwt = jwt;
    }

    public async Task<AuthResponse> RegistrarAsync(RegistroRequest req)
    {
        var existente = await _db.Usuarios.Find(u => u.Email == req.Email).FirstOrDefaultAsync();
        if (existente is not null)
            throw new InvalidOperationException("Ja existe um usuario com esse e-mail.");

        var perfil = req.Perfil switch
        {
            Perfis.Admin => Perfis.Admin,
            Perfis.Veterinario => Perfis.Veterinario,
            null or "" => Perfis.Veterinario,
            _ => throw new InvalidOperationException("Perfil invalido. Use 'admin' ou 'veterinario'.")
        };

        var usuario = new Usuario
        {
            Nome = req.Nome,
            Email = req.Email,
            SenhaHash = _hasher.Hash(req.Senha),
            Perfil = perfil
        };

        await _db.Usuarios.InsertOneAsync(usuario);

        var (token, expira) = _jwt.Gerar(usuario);
        return new AuthResponse
        {
            Token = token,
            ExpiraEm = expira,
            Nome = usuario.Nome,
            Email = usuario.Email,
            Perfil = usuario.Perfil
        };
    }

    public async Task<AuthResponse?> LoginAsync(LoginRequest req)
    {
        var usuario = await _db.Usuarios.Find(u => u.Email == req.Email).FirstOrDefaultAsync();
        if (usuario is null) return null;
        if (!_hasher.Verify(req.Senha, usuario.SenhaHash)) return null;

        var (token, expira) = _jwt.Gerar(usuario);
        return new AuthResponse
        {
            Token = token,
            ExpiraEm = expira,
            Nome = usuario.Nome,
            Email = usuario.Email,
            Perfil = usuario.Perfil
        };
    }
}
