using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace AnamnesePetAtria.Api.Models;

public enum Especie { Canino, Felino, Outro }
public enum Sexo { Macho, Femea }

public class Paciente : EntidadeBase
{
    /// <summary>Identificador externo curto exibido na UI (ex: 1073064 do Marley nos prints).</summary>
    [BsonElement("codigo")]
    public int Codigo { get; set; }

    [BsonElement("nome")]
    public string Nome { get; set; } = string.Empty;

    [BsonElement("dataNascimento")]
    public DateTime? DataNascimento { get; set; }

    [BsonElement("especie")]
    [BsonRepresentation(BsonType.String)]
    public Especie Especie { get; set; }

    [BsonElement("raca")]
    public string? Raca { get; set; }

    [BsonElement("sexo")]
    [BsonRepresentation(BsonType.String)]
    public Sexo Sexo { get; set; }

    [BsonElement("castrado")]
    public bool Castrado { get; set; }

    [BsonElement("pesoKg")]
    public double? PesoKg { get; set; }

    [BsonElement("temAcessoRua")]
    public bool TemAcessoRua { get; set; }

    [BsonElement("tutorId")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string TutorId { get; set; } = string.Empty;
}
