using AnamnesePetAtria.Api.Data;
using AnamnesePetAtria.Api.Models;
using MongoDB.Driver;

namespace AnamnesePetAtria.Api.Services;

public interface IAtestadoService
{
    IEnumerable<ModelosAtestado.Modelo> Modelos();
    Task<List<AtestadoTermo>> ListarPorPacienteAsync(string pacienteId);
    Task<AtestadoTermo?> ObterPorIdAsync(string id);
    Task<AtestadoTermo> CriarAsync(AtestadoTermo atestado);
    Task<bool> AtualizarAsync(string id, AtestadoTermo atestado);
    Task<bool> RemoverAsync(string id);
}

public class AtestadoService : IAtestadoService
{
    private readonly IMongoDbContext _db;

    public AtestadoService(IMongoDbContext db) => _db = db;

    public IEnumerable<ModelosAtestado.Modelo> Modelos() => ModelosAtestado.Itens;

    public Task<List<AtestadoTermo>> ListarPorPacienteAsync(string pacienteId) =>
        _db.Atestados.Find(a => a.PacienteId == pacienteId)
            .SortByDescending(a => a.DataEmissao).ToListAsync();

    public Task<AtestadoTermo?> ObterPorIdAsync(string id) =>
        _db.Atestados.Find(a => a.Id == id).FirstOrDefaultAsync()!;

    public async Task<AtestadoTermo> CriarAsync(AtestadoTermo atestado)
    {
        if (string.IsNullOrWhiteSpace(atestado.PacienteId))
            throw new InvalidOperationException("PacienteId eh obrigatorio.");
        if (string.IsNullOrWhiteSpace(atestado.Conteudo))
        {
            // Se nao veio conteudo, usa o modelo padrao do tipo.
            var modelo = ModelosAtestado.Obter(atestado.Tipo);
            atestado.Conteudo = modelo?.Conteudo ?? string.Empty;
        }
        atestado.CriadoEm = DateTime.UtcNow;
        await _db.Atestados.InsertOneAsync(atestado);
        return atestado;
    }

    public async Task<bool> AtualizarAsync(string id, AtestadoTermo atestado)
    {
        atestado.Id = id;
        atestado.AtualizadoEm = DateTime.UtcNow;
        var res = await _db.Atestados.ReplaceOneAsync(a => a.Id == id, atestado);
        return res.ModifiedCount > 0;
    }

    public async Task<bool> RemoverAsync(string id)
    {
        var res = await _db.Atestados.DeleteOneAsync(a => a.Id == id);
        return res.DeletedCount > 0;
    }
}
