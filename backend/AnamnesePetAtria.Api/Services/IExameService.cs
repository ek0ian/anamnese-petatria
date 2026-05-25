using AnamnesePetAtria.Api.Data;
using AnamnesePetAtria.Api.Models;
using MongoDB.Driver;

namespace AnamnesePetAtria.Api.Services;

public interface IExameService
{
    IEnumerable<string> Categorias();
    IEnumerable<ItemExame> BuscarCatalogo(string? termo);
    Task<List<SolicitacaoExame>> ListarPorPacienteAsync(string pacienteId);
    Task<SolicitacaoExame?> ObterPorIdAsync(string id);
    Task<SolicitacaoExame> CriarAsync(SolicitacaoExame solicitacao);
    Task<bool> AtualizarAsync(string id, SolicitacaoExame solicitacao);
    Task<bool> RemoverAsync(string id);
}

public class ExameService : IExameService
{
    private readonly IMongoDbContext _db;

    public ExameService(IMongoDbContext db) => _db = db;

    public IEnumerable<string> Categorias() => CatalogoExames.Categorias();

    public IEnumerable<ItemExame> BuscarCatalogo(string? termo) => CatalogoExames.Buscar(termo);

    public Task<List<SolicitacaoExame>> ListarPorPacienteAsync(string pacienteId) =>
        _db.Exames.Find(e => e.PacienteId == pacienteId)
            .SortByDescending(e => e.Data).ToListAsync();

    public Task<SolicitacaoExame?> ObterPorIdAsync(string id) =>
        _db.Exames.Find(e => e.Id == id).FirstOrDefaultAsync()!;

    public async Task<SolicitacaoExame> CriarAsync(SolicitacaoExame solicitacao)
    {
        if (solicitacao.Exames.Count == 0)
            throw new InvalidOperationException("Pelo menos um exame deve ser solicitado.");

        var pacienteExiste = await _db.Pacientes.Find(p => p.Id == solicitacao.PacienteId).AnyAsync();
        if (!pacienteExiste) throw new InvalidOperationException("Paciente nao encontrado.");

        solicitacao.CriadoEm = DateTime.UtcNow;
        await _db.Exames.InsertOneAsync(solicitacao);
        return solicitacao;
    }

    public async Task<bool> AtualizarAsync(string id, SolicitacaoExame solicitacao)
    {
        solicitacao.Id = id;
        solicitacao.AtualizadoEm = DateTime.UtcNow;
        var res = await _db.Exames.ReplaceOneAsync(e => e.Id == id, solicitacao);
        return res.ModifiedCount > 0;
    }

    public async Task<bool> RemoverAsync(string id)
    {
        var res = await _db.Exames.DeleteOneAsync(e => e.Id == id);
        return res.DeletedCount > 0;
    }
}
