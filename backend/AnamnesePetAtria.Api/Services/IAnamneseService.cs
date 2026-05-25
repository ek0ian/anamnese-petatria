using AnamnesePetAtria.Api.Data;
using AnamnesePetAtria.Api.Models;
using MongoDB.Driver;

namespace AnamnesePetAtria.Api.Services;

public interface IAnamneseService
{
    Task<List<Anamnese>> ListarPorPacienteAsync(string pacienteId);
    Task<Anamnese?> ObterPorIdAsync(string id);
    Task<Anamnese> CriarAsync(Anamnese anamnese);
    Task<bool> AtualizarAsync(string id, Anamnese anamnese);
    Task<bool> RemoverAsync(string id);
}

public class AnamneseService : IAnamneseService
{
    private readonly IMongoDbContext _db;

    public AnamneseService(IMongoDbContext db) => _db = db;

    public Task<List<Anamnese>> ListarPorPacienteAsync(string pacienteId) =>
        _db.Anamneses.Find(a => a.PacienteId == pacienteId)
            .SortByDescending(a => a.CriadoEm).ToListAsync();

    public Task<Anamnese?> ObterPorIdAsync(string id) =>
        _db.Anamneses.Find(a => a.Id == id).FirstOrDefaultAsync()!;

    public async Task<Anamnese> CriarAsync(Anamnese anamnese)
    {
        await ValidarPacienteAsync(anamnese.PacienteId);
        anamnese.CriadoEm = DateTime.UtcNow;
        await _db.Anamneses.InsertOneAsync(anamnese);
        return anamnese;
    }

    public async Task<bool> AtualizarAsync(string id, Anamnese anamnese)
    {
        anamnese.Id = id;
        anamnese.AtualizadoEm = DateTime.UtcNow;
        var res = await _db.Anamneses.ReplaceOneAsync(a => a.Id == id, anamnese);
        return res.ModifiedCount > 0;
    }

    public async Task<bool> RemoverAsync(string id)
    {
        var res = await _db.Anamneses.DeleteOneAsync(a => a.Id == id);
        return res.DeletedCount > 0;
    }

    private async Task ValidarPacienteAsync(string pacienteId)
    {
        var existe = await _db.Pacientes.Find(p => p.Id == pacienteId).AnyAsync();
        if (!existe) throw new InvalidOperationException("Paciente nao encontrado.");
    }
}
