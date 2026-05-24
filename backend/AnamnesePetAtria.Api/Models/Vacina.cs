using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace AnamnesePetAtria.Api.Models;

public class Vacina : EntidadeBase
{
    [BsonElement("pacienteId")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string PacienteId { get; set; } = string.Empty;

    [BsonElement("nome")]
    public string Nome { get; set; } = string.Empty; // ex: Polivalente, Antirrabica

    [BsonElement("fabricante")]
    public string? Fabricante { get; set; }

    [BsonElement("lote")]
    public string? Lote { get; set; }

    [BsonElement("dose")]
    public string? Dose { get; set; }

    [BsonElement("dataAplicacao")]
    public DateTime DataAplicacao { get; set; }

    [BsonElement("proximaDose")]
    public DateTime? ProximaDose { get; set; }

    [BsonElement("observacoes")]
    public string? Observacoes { get; set; }
}
