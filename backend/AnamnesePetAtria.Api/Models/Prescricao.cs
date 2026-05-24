using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace AnamnesePetAtria.Api.Models;

public class Prescricao : EntidadeBase
{
    [BsonElement("pacienteId")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string PacienteId { get; set; } = string.Empty;

    [BsonElement("data")]
    public DateTime Data { get; set; } = DateTime.UtcNow;

    [BsonElement("itens")]
    public List<ItemPrescricao> Itens { get; set; } = new();

    [BsonElement("orientacoes")]
    public string? Orientacoes { get; set; }
}

public class ItemPrescricao
{
    public string Medicamento { get; set; } = string.Empty;
    public string? Dose { get; set; }
    public string? Via { get; set; }    // oral, subcutanea, etc
    public string? Frequencia { get; set; }
    public string? Duracao { get; set; }
}

public class Retorno : EntidadeBase
{
    [BsonElement("pacienteId")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string PacienteId { get; set; } = string.Empty;

    [BsonElement("dataAgendada")]
    public DateTime DataAgendada { get; set; }

    [BsonElement("motivo")]
    public string? Motivo { get; set; }

    [BsonElement("realizado")]
    public bool Realizado { get; set; }
}

public class Procedimento : EntidadeBase
{
    [BsonElement("pacienteId")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string PacienteId { get; set; } = string.Empty;

    [BsonElement("nome")]
    public string Nome { get; set; } = string.Empty;

    [BsonElement("data")]
    public DateTime Data { get; set; } = DateTime.UtcNow;

    [BsonElement("descricao")]
    public string? Descricao { get; set; }
}

public class Cirurgia : EntidadeBase
{
    [BsonElement("pacienteId")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string PacienteId { get; set; } = string.Empty;

    [BsonElement("tipo")]
    public string Tipo { get; set; } = string.Empty;

    [BsonElement("dataAgendada")]
    public DateTime DataAgendada { get; set; }

    [BsonElement("status")]
    public string Status { get; set; } = "agendada"; // agendada | realizada | cancelada

    [BsonElement("observacoes")]
    public string? Observacoes { get; set; }
}

public class Internacao : EntidadeBase
{
    [BsonElement("pacienteId")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string PacienteId { get; set; } = string.Empty;

    [BsonElement("entrada")]
    public DateTime Entrada { get; set; }

    [BsonElement("saida")]
    public DateTime? Saida { get; set; }

    [BsonElement("motivo")]
    public string? Motivo { get; set; }

    [BsonElement("evolucao")]
    public string? Evolucao { get; set; }
}

public class Orcamento : EntidadeBase
{
    [BsonElement("pacienteId")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string PacienteId { get; set; } = string.Empty;

    [BsonElement("data")]
    public DateTime Data { get; set; } = DateTime.UtcNow;

    [BsonElement("itens")]
    public List<ItemOrcamento> Itens { get; set; } = new();

    [BsonElement("total")]
    public decimal Total { get; set; }

    [BsonElement("aprovado")]
    public bool Aprovado { get; set; }
}

public class ItemOrcamento
{
    public string Descricao { get; set; } = string.Empty;
    public int Quantidade { get; set; } = 1;
    public decimal ValorUnitario { get; set; }
}
