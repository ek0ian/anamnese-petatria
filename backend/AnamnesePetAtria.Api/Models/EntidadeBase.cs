using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace AnamnesePetAtria.Api.Models;

public abstract class EntidadeBase
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    [BsonElement("criadoEm")]
    public DateTime CriadoEm { get; set; } = DateTime.UtcNow;

    [BsonElement("atualizadoEm")]
    public DateTime? AtualizadoEm { get; set; }
}
