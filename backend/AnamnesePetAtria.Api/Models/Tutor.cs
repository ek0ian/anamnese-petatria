using MongoDB.Bson.Serialization.Attributes;

namespace AnamnesePetAtria.Api.Models;

public class Tutor : EntidadeBase
{
    [BsonElement("nome")]
    public string Nome { get; set; } = string.Empty;

    [BsonElement("cpf")]
    public string? Cpf { get; set; }

    [BsonElement("telefone")]
    public string? Telefone { get; set; }

    [BsonElement("email")]
    public string? Email { get; set; }

    [BsonElement("endereco")]
    public string? Endereco { get; set; }
}
