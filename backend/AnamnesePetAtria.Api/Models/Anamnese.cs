using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace AnamnesePetAtria.Api.Models;

public class Anamnese : EntidadeBase
{
    [BsonElement("pacienteId")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string PacienteId { get; set; } = string.Empty;

    // Queixa principal
    [BsonElement("queixaPrincipal")]
    public string? QueixaPrincipal { get; set; }

    // Historico do quadro clinico atual
    [BsonElement("inicioSintomas")]
    public string? InicioSintomas { get; set; }

    [BsonElement("possivelDesencadeador")]
    public string? PossivelDesencadeador { get; set; }

    [BsonElement("jaApresentou")]
    public bool? JaApresentou { get; set; }

    [BsonElement("teveEvolucao")]
    public bool? TeveEvolucao { get; set; }

    [BsonElement("evolucao")]
    public string? Evolucao { get; set; } // "melhora" | "piora"

    [BsonElement("usouMedicamento")]
    public bool? UsouMedicamento { get; set; }

    [BsonElement("qualMedicamento")]
    public string? QualMedicamento { get; set; }

    [BsonElement("contactanteMesmoQuadro")]
    public bool? ContactanteMesmoQuadro { get; set; }

    [BsonElement("informacaoAdicional")]
    public string? InformacaoAdicional { get; set; }

    // Historico clinico geral
    [BsonElement("historicoClinico")]
    public HistoricoClinicoGeral HistoricoClinico { get; set; } = new();

    // Inspecao geral
    [BsonElement("inspecaoGeral")]
    public InspecaoGeral InspecaoGeral { get; set; } = new();

    // Local da lesao (descricao livre + pontos no mapa corporal)
    [BsonElement("localLesao")]
    public string? LocalLesao { get; set; }

    [BsonElement("diagnostico")]
    public string? Diagnostico { get; set; }

    [BsonElement("condutaClinica")]
    public string? CondutaClinica { get; set; }

    [BsonElement("procedimentosRealizados")]
    public string? ProcedimentosRealizados { get; set; }

    [BsonElement("examesSolicitados")]
    public string? ExamesSolicitadosTexto { get; set; }

    [BsonElement("extras")]
    public string? Extras { get; set; }
}

public class HistoricoClinicoGeral
{
    public List<string> Vacinacao { get; set; } = new();
    public string? VacinacaoOutra { get; set; }
    public bool? Vermifugacao { get; set; }
    public bool? ControleEctoparasitario { get; set; }
    public string? ControleEctoparasitarioQual { get; set; }
    public bool? MedicacaoConstante { get; set; }
    public string? MedicacaoConstanteQual { get; set; }
    public bool? DoencaPreExistente { get; set; }
    public string? DoencaPreExistenteQual { get; set; }
    public string? FrequenciaBanhos { get; set; }
    public string? UltimoCio { get; set; }
    public string? Contactantes { get; set; }
    public string? Alimentacao { get; set; }
    public string? IngestaoHidrica { get; set; }
    public string? TesteFivFelvLeishmaniose { get; set; }
}

public class InspecaoGeral
{
    public string? Temperatura { get; set; }
    public string? EscoreCorporalPeso { get; set; }
    public string? Atividade { get; set; } // "ativo" | "prostrado"
    public List<string> Gastrointestinal { get; set; } = new();
    public List<string> Urogenital { get; set; } = new();
    public List<string> Neurologico { get; set; } = new();
    public List<string> Olhos { get; set; } = new();
    public List<string> Ouvidos { get; set; } = new();
    public List<string> Locomotor { get; set; } = new();
    public string? Claudicacao { get; set; }
    public List<string> Nariz { get; set; } = new();
    public List<string> Pele { get; set; } = new();
    public List<string> CavidadeOral { get; set; } = new();
    public string? Fc { get; set; }
    public string? Fr { get; set; }
    public string? Ausculta { get; set; }
    public string? Tpc { get; set; }
    public string? Tc { get; set; }
    public string? Mucosas { get; set; } // "normocoradas" | "hipo"
    public string? Comportamento { get; set; }
}
