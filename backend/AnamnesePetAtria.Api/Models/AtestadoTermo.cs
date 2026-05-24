using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace AnamnesePetAtria.Api.Models;

public enum TipoAtestado
{
    TermoExames,
    TermoProcedimentoRisco,
    TermoObito,
    TermoEutanasia,
    TermoCirurgico,
    TermoRetiradaSemAlta,
    AtestadoEncaminhamento
}

public class AtestadoTermo : EntidadeBase
{
    [BsonElement("pacienteId")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string PacienteId { get; set; } = string.Empty;

    [BsonElement("tipo")]
    [BsonRepresentation(BsonType.String)]
    public TipoAtestado Tipo { get; set; }

    [BsonElement("cidade")]
    public string? Cidade { get; set; }

    [BsonElement("dataEmissao")]
    public DateTime DataEmissao { get; set; } = DateTime.UtcNow;

    [BsonElement("conteudo")]
    public string Conteudo { get; set; } = string.Empty;

    [BsonElement("identificacaoComplementar")]
    public string? IdentificacaoComplementar { get; set; }
}
