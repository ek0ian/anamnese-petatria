using System.Linq.Expressions;
using AnamnesePetAtria.Api.Models;
using MongoDB.Driver;

namespace AnamnesePetAtria.Api.Repositories;

/// <summary>
/// Repositorio generico. Demonstracao do principio SOLID O (Open/Closed):
/// novas entidades podem reusar essa abstracao sem alterar o codigo existente.
/// </summary>
public interface IRepository<T> where T : EntidadeBase
{
    Task<List<T>> ListarAsync(Expression<Func<T, bool>>? filtro = null);
    Task<T?> ObterPorIdAsync(string id);
    Task<T> InserirAsync(T entidade);
    Task<bool> AtualizarAsync(string id, T entidade);
    Task<bool> RemoverAsync(string id);
}

public class MongoRepository<T> : IRepository<T> where T : EntidadeBase
{
    private readonly IMongoCollection<T> _col;

    public MongoRepository(IMongoCollection<T> col) => _col = col;

    public async Task<List<T>> ListarAsync(Expression<Func<T, bool>>? filtro = null)
    {
        var f = filtro is null
            ? Builders<T>.Filter.Empty
            : Builders<T>.Filter.Where(filtro);
        return await _col.Find(f).SortByDescending(x => x.CriadoEm).ToListAsync();
    }

    public Task<T?> ObterPorIdAsync(string id) =>
        _col.Find(x => x.Id == id).FirstOrDefaultAsync()!;

    public async Task<T> InserirAsync(T entidade)
    {
        entidade.CriadoEm = DateTime.UtcNow;
        await _col.InsertOneAsync(entidade);
        return entidade;
    }

    public async Task<bool> AtualizarAsync(string id, T entidade)
    {
        entidade.Id = id;
        entidade.AtualizadoEm = DateTime.UtcNow;
        var res = await _col.ReplaceOneAsync(x => x.Id == id, entidade);
        return res.ModifiedCount > 0;
    }

    public async Task<bool> RemoverAsync(string id)
    {
        var res = await _col.DeleteOneAsync(x => x.Id == id);
        return res.DeletedCount > 0;
    }
}
