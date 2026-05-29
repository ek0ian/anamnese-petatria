using AnamnesePetAtria.Api.Models;
using MongoDB.Driver;

namespace AnamnesePetAtria.Api.Services;

/// <summary>
/// CRUD generico para entidades vinculadas a paciente. Reforca o principio
/// SOLID O (Open/Closed): adicionar uma nova aba (cirurgia, internacao, etc)
/// nao exige reescrever a logica de listagem/edicao/remocao.
/// </summary>
public class ServicoPaciente<T> where T : EntidadeBase, IEntidadePaciente
{
    private readonly IMongoCollection<T> _col;

    public ServicoPaciente(IMongoCollection<T> col) => _col = col;

    public Task<List<T>> ListarPorPacienteAsync(string pacienteId) =>
        _col.Find(e => e.PacienteId == pacienteId)
            .SortByDescending(e => e.CriadoEm)
            .ToListAsync();

    public Task<T?> ObterPorIdAsync(string id) =>
        _col.Find(e => e.Id == id).FirstOrDefaultAsync()!;

    public async Task<T> CriarAsync(T entidade)
    {
        if (string.IsNullOrWhiteSpace(entidade.PacienteId))
            throw new InvalidOperationException("PacienteId é obrigatório.");

        entidade.CriadoEm = DateTime.UtcNow;
        await _col.InsertOneAsync(entidade);
        return entidade;
    }

    public async Task<bool> AtualizarAsync(string id, T entidade)
    {
        entidade.Id = id;
        entidade.AtualizadoEm = DateTime.UtcNow;
        var res = await _col.ReplaceOneAsync(e => e.Id == id, entidade);
        return res.ModifiedCount > 0;
    }

    public async Task<bool> RemoverAsync(string id)
    {
        var res = await _col.DeleteOneAsync(e => e.Id == id);
        return res.DeletedCount > 0;
    }
}
