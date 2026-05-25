using AnamnesePetAtria.Api.Data;
using AnamnesePetAtria.Api.DTOs;
using AnamnesePetAtria.Api.Models;
using MongoDB.Driver;

namespace AnamnesePetAtria.Api.Services;

public interface ITutorService
{
    Task<List<Tutor>> ListarAsync(string? busca = null);
    Task<Tutor?> ObterPorIdAsync(string id);
    Task<Tutor> CriarAsync(TutorRequest req);
    Task<bool> AtualizarAsync(string id, TutorRequest req);
    Task<bool> RemoverAsync(string id);
}

public class TutorService : ITutorService
{
    private readonly IMongoDbContext _db;

    public TutorService(IMongoDbContext db) => _db = db;

    public Task<List<Tutor>> ListarAsync(string? busca = null)
    {
        var filtro = string.IsNullOrWhiteSpace(busca)
            ? Builders<Tutor>.Filter.Empty
            : Builders<Tutor>.Filter.Regex(t => t.Nome, new MongoDB.Bson.BsonRegularExpression(busca, "i"));
        return _db.Tutores.Find(filtro).SortBy(t => t.Nome).ToListAsync();
    }

    public Task<Tutor?> ObterPorIdAsync(string id) =>
        _db.Tutores.Find(t => t.Id == id).FirstOrDefaultAsync()!;

    public async Task<Tutor> CriarAsync(TutorRequest req)
    {
        var tutor = new Tutor
        {
            Nome = req.Nome,
            Cpf = req.Cpf,
            Telefone = req.Telefone,
            Email = req.Email,
            Endereco = req.Endereco
        };
        await _db.Tutores.InsertOneAsync(tutor);
        return tutor;
    }

    public async Task<bool> AtualizarAsync(string id, TutorRequest req)
    {
        var atual = await _db.Tutores.Find(t => t.Id == id).FirstOrDefaultAsync();
        if (atual is null) return false;
        atual.Nome = req.Nome;
        atual.Cpf = req.Cpf;
        atual.Telefone = req.Telefone;
        atual.Email = req.Email;
        atual.Endereco = req.Endereco;
        atual.AtualizadoEm = DateTime.UtcNow;
        var res = await _db.Tutores.ReplaceOneAsync(t => t.Id == id, atual);
        return res.ModifiedCount > 0;
    }

    public async Task<bool> RemoverAsync(string id)
    {
        var res = await _db.Tutores.DeleteOneAsync(t => t.Id == id);
        return res.DeletedCount > 0;
    }
}
