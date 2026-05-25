using AnamnesePetAtria.Api.Configuration;
using AnamnesePetAtria.Api.Models;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace AnamnesePetAtria.Api.Data;

public interface IMongoDbContext
{
    IMongoCollection<Usuario> Usuarios { get; }
    IMongoCollection<Tutor> Tutores { get; }
    IMongoCollection<Paciente> Pacientes { get; }
    IMongoCollection<Anamnese> Anamneses { get; }
    IMongoCollection<Vacina> Vacinas { get; }
    IMongoCollection<SolicitacaoExame> Exames { get; }
    IMongoCollection<AtestadoTermo> Atestados { get; }
    IMongoCollection<Prescricao> Prescricoes { get; }
    IMongoCollection<Retorno> Retornos { get; }
    IMongoCollection<Procedimento> Procedimentos { get; }
    IMongoCollection<Cirurgia> Cirurgias { get; }
    IMongoCollection<Internacao> Internacoes { get; }
    IMongoCollection<Orcamento> Orcamentos { get; }
}

public class MongoDbContext : IMongoDbContext
{
    private readonly IMongoDatabase _db;

    public MongoDbContext(IOptions<MongoDbSettings> options)
    {
        var settings = options.Value;
        var client = new MongoClient(settings.ConnectionString);
        _db = client.GetDatabase(settings.DatabaseName);
    }

    public IMongoCollection<Usuario> Usuarios => _db.GetCollection<Usuario>("usuarios");
    public IMongoCollection<Tutor> Tutores => _db.GetCollection<Tutor>("tutores");
    public IMongoCollection<Paciente> Pacientes => _db.GetCollection<Paciente>("pacientes");
    public IMongoCollection<Anamnese> Anamneses => _db.GetCollection<Anamnese>("anamneses");
    public IMongoCollection<Vacina> Vacinas => _db.GetCollection<Vacina>("vacinas");
    public IMongoCollection<SolicitacaoExame> Exames => _db.GetCollection<SolicitacaoExame>("exames");
    public IMongoCollection<AtestadoTermo> Atestados => _db.GetCollection<AtestadoTermo>("atestados");
    public IMongoCollection<Prescricao> Prescricoes => _db.GetCollection<Prescricao>("prescricoes");
    public IMongoCollection<Retorno> Retornos => _db.GetCollection<Retorno>("retornos");
    public IMongoCollection<Procedimento> Procedimentos => _db.GetCollection<Procedimento>("procedimentos");
    public IMongoCollection<Cirurgia> Cirurgias => _db.GetCollection<Cirurgia>("cirurgias");
    public IMongoCollection<Internacao> Internacoes => _db.GetCollection<Internacao>("internacoes");
    public IMongoCollection<Orcamento> Orcamentos => _db.GetCollection<Orcamento>("orcamentos");
}
