using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace AnamnesePetAtria.Api.Models;

public class SolicitacaoExame : EntidadeBase
{
    [BsonElement("pacienteId")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string PacienteId { get; set; } = string.Empty;

    [BsonElement("data")]
    public DateTime Data { get; set; } = DateTime.UtcNow;

    /// <summary>Lista de exames solicitados, cada um com categoria e parametros.</summary>
    [BsonElement("exames")]
    public List<ItemExame> Exames { get; set; } = new();

    /// <summary>Motivos da solicitacao / suspeitas clinicas (texto livre).</summary>
    [BsonElement("motivos")]
    public string? Motivos { get; set; }
}

public class ItemExame
{
    public string Categoria { get; set; } = string.Empty; // ex: "Hematologia", "Bioquimico"
    public string Nome { get; set; } = string.Empty;      // ex: "Tipagem sanguinea gatos (A,B,AB)"
    public List<string> Parametros { get; set; } = new(); // ex: ureia, creatinina, ...
}
