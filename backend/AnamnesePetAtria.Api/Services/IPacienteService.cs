using AnamnesePetAtria.Api.Data;
using AnamnesePetAtria.Api.DTOs;
using AnamnesePetAtria.Api.Models;
using MongoDB.Driver;

namespace AnamnesePetAtria.Api.Services;

public interface IPacienteService
{
    Task<List<PacienteResponse>> ListarAsync(string? busca = null);
    Task<PacienteResponse?> ObterPorIdAsync(string id);
    Task<PacienteResponse?> ObterPorCodigoAsync(int codigo);
    Task<PacienteResponse> CriarAsync(PacienteRequest req);
    Task<bool> AtualizarAsync(string id, PacienteRequest req);
    Task<bool> RemoverAsync(string id);
}

/// <summary>
/// Servico de Pacientes. Demonstracao do principio SOLID S (Single Responsibility):
/// trata exclusivamente da regra de negocio de pacientes e nao mistura com tutores ou anamneses.
/// </summary>
public class PacienteService : IPacienteService
{
    private readonly IMongoDbContext _db;

    public PacienteService(IMongoDbContext db) => _db = db;

    public async Task<List<PacienteResponse>> ListarAsync(string? busca = null)
    {
        var filtroBase = Builders<Paciente>.Filter.Empty;

        if (!string.IsNullOrWhiteSpace(busca))
        {
            var termo = busca.Trim();
            var ehNumero = int.TryParse(termo, out var codigo);
            var filtros = new List<FilterDefinition<Paciente>>
            {
                Builders<Paciente>.Filter.Regex(p => p.Nome, new MongoDB.Bson.BsonRegularExpression(termo, "i"))
            };
            if (ehNumero)
                filtros.Add(Builders<Paciente>.Filter.Eq(p => p.Codigo, codigo));

            filtroBase = Builders<Paciente>.Filter.Or(filtros);
        }

        var pacientes = await _db.Pacientes.Find(filtroBase).SortByDescending(p => p.CriadoEm).ToListAsync();
        var resultado = new List<PacienteResponse>();
        foreach (var p in pacientes)
            resultado.Add(await MaterializarAsync(p));
        return resultado;
    }

    public async Task<PacienteResponse?> ObterPorIdAsync(string id)
    {
        var p = await _db.Pacientes.Find(x => x.Id == id).FirstOrDefaultAsync();
        return p is null ? null : await MaterializarAsync(p);
    }

    public async Task<PacienteResponse?> ObterPorCodigoAsync(int codigo)
    {
        var p = await _db.Pacientes.Find(x => x.Codigo == codigo).FirstOrDefaultAsync();
        return p is null ? null : await MaterializarAsync(p);
    }

    public async Task<PacienteResponse> CriarAsync(PacienteRequest req)
    {
        var tutor = await _db.Tutores.Find(t => t.Id == req.TutorId).FirstOrDefaultAsync()
            ?? throw new InvalidOperationException("Tutor nao encontrado.");

        var ultimoCodigo = await _db.Pacientes
            .Find(_ => true)
            .SortByDescending(p => p.Codigo)
            .Limit(1)
            .FirstOrDefaultAsync();

        var novo = new Paciente
        {
            Codigo = (ultimoCodigo?.Codigo ?? 1073063) + 1,
            Nome = req.Nome,
            DataNascimento = req.DataNascimento,
            Especie = req.Especie,
            Raca = req.Raca,
            Sexo = req.Sexo,
            Castrado = req.Castrado,
            PesoKg = req.PesoKg,
            TemAcessoRua = req.TemAcessoRua,
            TutorId = tutor.Id!
        };

        await _db.Pacientes.InsertOneAsync(novo);
        return await MaterializarAsync(novo);
    }

    public async Task<bool> AtualizarAsync(string id, PacienteRequest req)
    {
        var atual = await _db.Pacientes.Find(p => p.Id == id).FirstOrDefaultAsync();
        if (atual is null) return false;

        atual.Nome = req.Nome;
        atual.DataNascimento = req.DataNascimento;
        atual.Especie = req.Especie;
        atual.Raca = req.Raca;
        atual.Sexo = req.Sexo;
        atual.Castrado = req.Castrado;
        atual.PesoKg = req.PesoKg;
        atual.TemAcessoRua = req.TemAcessoRua;
        atual.TutorId = req.TutorId;
        atual.AtualizadoEm = DateTime.UtcNow;

        var res = await _db.Pacientes.ReplaceOneAsync(p => p.Id == id, atual);
        return res.ModifiedCount > 0;
    }

    public async Task<bool> RemoverAsync(string id)
    {
        var res = await _db.Pacientes.DeleteOneAsync(p => p.Id == id);
        return res.DeletedCount > 0;
    }

    private async Task<PacienteResponse> MaterializarAsync(Paciente p)
    {
        var tutor = await _db.Tutores.Find(t => t.Id == p.TutorId).FirstOrDefaultAsync();
        return new PacienteResponse
        {
            Id = p.Id ?? string.Empty,
            Codigo = p.Codigo,
            Nome = p.Nome,
            DataNascimento = p.DataNascimento,
            Especie = p.Especie.ToString(),
            Raca = p.Raca,
            Sexo = p.Sexo.ToString(),
            Castrado = p.Castrado,
            PesoKg = p.PesoKg,
            TemAcessoRua = p.TemAcessoRua,
            TutorId = p.TutorId,
            TutorNome = tutor?.Nome,
            IdadeFormatada = FormatarIdade(p.DataNascimento)
        };
    }

    private static string? FormatarIdade(DateTime? nascimento)
    {
        if (nascimento is null) return null;
        var hoje = DateTime.UtcNow;
        var meses = (hoje.Year - nascimento.Value.Year) * 12 + hoje.Month - nascimento.Value.Month;
        if (hoje.Day < nascimento.Value.Day) meses--;
        if (meses < 0) meses = 0;
        var anos = meses / 12;
        var mesesRest = meses % 12;
        if (anos == 0) return $"{mesesRest} {(mesesRest == 1 ? "mes" : "meses")}";
        if (mesesRest == 0) return $"{anos} {(anos == 1 ? "ano" : "anos")}";
        return $"{anos} {(anos == 1 ? "ano" : "anos")} e {mesesRest} {(mesesRest == 1 ? "mes" : "meses")}";
    }
}
