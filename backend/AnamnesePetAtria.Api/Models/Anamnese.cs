using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace AnamnesePetAtria.Api.Models;

/// <summary>
/// Ficha de anamnese veterinaria seguindo o modelo da clinica Camila Rosa.
/// Estrutura completa: queixa principal, anamnese descritiva, exame fisico
/// por sistemas, historico clinico, parametros clinicos, conduta, tratamentos
/// e retorno.
/// </summary>
public class Anamnese : EntidadeBase
{
    [BsonElement("pacienteId")]
    [BsonRepresentation(BsonType.ObjectId)]
    public string PacienteId { get; set; } = string.Empty;

    // ========== Identificacao complementar do responsavel ==========
    [BsonElement("responsavel")]
    public string? Responsavel { get; set; }

    [BsonElement("cpfResponsavel")]
    public string? CpfResponsavel { get; set; }

    [BsonElement("enderecoResponsavel")]
    public string? EnderecoResponsavel { get; set; }

    [BsonElement("telefoneResponsavel")]
    public string? TelefoneResponsavel { get; set; }

    // ========== QUEIXA PRINCIPAL ==========
    [BsonElement("queixaPrincipal")]
    public string? QueixaPrincipal { get; set; }

    // ========== ANAMNESE descritiva ==========
    [BsonElement("anamneseTexto")]
    public string? AnamneseTexto { get; set; }

    [BsonElement("doencasPregressas")]
    public bool? DoencasPregressas { get; set; }

    [BsonElement("doencasPregressasDescricao")]
    public string? DoencasPregressasDescricao { get; set; }

    [BsonElement("doencasPresentes")]
    public bool? DoencasPresentes { get; set; }

    [BsonElement("doencasPresentesDescricao")]
    public string? DoencasPresentesDescricao { get; set; }

    // ========== EXAME FISICO ==========
    /// <summary>Vomito, Regurgitacao, Diarreia (multi).</summary>
    [BsonElement("sistemaDigestorio")]
    public List<string> SistemaDigestorio { get; set; } = new();

    [BsonElement("sistemaDigestorioOutros")]
    public string? SistemaDigestorioOutros { get; set; }

    /// <summary>Normorexia | Hiporexia | Hiperorexia | Anorexia (single).</summary>
    [BsonElement("alimentacao")]
    public string? Alimentacao { get; set; }

    [BsonElement("alimentacaoOutros")]
    public string? AlimentacaoOutros { get; set; }

    /// <summary>Normodipsia | Oligodipsia | Polidipsia | Adipsia (single).</summary>
    [BsonElement("ingestaoAgua")]
    public string? IngestaoAgua { get; set; }

    [BsonElement("ingestaoAguaOutros")]
    public string? IngestaoAguaOutros { get; set; }

    /// <summary>Urina normal, Dificuldade miccao, Secrecao vaginal, Castrado, Anuria, Disuria, Poliuria, Oliguria.</summary>
    [BsonElement("sistemaUrogenital")]
    public List<string> SistemaUrogenital { get; set; } = new();

    [BsonElement("sistemaUrogenitalOutros")]
    public string? SistemaUrogenitalOutros { get; set; }

    /// <summary>Tosse, Cansaco respiratorio, Secrecao nasal.</summary>
    [BsonElement("sistemaCardiorrespiratorio")]
    public List<string> SistemaCardiorrespiratorio { get; set; } = new();

    [BsonElement("sistemaCardiorrespiratorioOutros")]
    public string? SistemaCardiorrespiratorioOutros { get; set; }

    /// <summary>Convulsao, Inclinacao cabeca, Ataxia.</summary>
    [BsonElement("sistemaNeurologico")]
    public List<string> SistemaNeurologico { get; set; } = new();

    [BsonElement("sistemaNeurologicoOutros")]
    public string? SistemaNeurologicoOutros { get; set; }

    /// <summary>Dificuldade locomocao, Alteracoes posturais, Fraturas.</summary>
    [BsonElement("sistemaLocomotor")]
    public List<string> SistemaLocomotor { get; set; } = new();

    [BsonElement("sistemaLocomotorOutros")]
    public string? SistemaLocomotorOutros { get; set; }

    /// <summary>Prurido, Ectoparasitas, Queda de pelo, Alopecia.</summary>
    [BsonElement("pele")]
    public List<string> Pele { get; set; } = new();

    [BsonElement("peleOutros")]
    public string? PeleOutros { get; set; }

    /// <summary>Secrecao ocular, Deficit visual, Prurido.</summary>
    [BsonElement("olhos")]
    public List<string> Olhos { get; set; } = new();

    [BsonElement("olhosOutros")]
    public string? OlhosOutros { get; set; }

    /// <summary>Prurido, Secrecao.</summary>
    [BsonElement("ouvido")]
    public List<string> Ouvido { get; set; } = new();

    [BsonElement("ouvidoOutros")]
    public string? OuvidoOutros { get; set; }

    /// <summary>Rural, Urbano, Acesso a rua.</summary>
    [BsonElement("ambiente")]
    public List<string> Ambiente { get; set; } = new();

    [BsonElement("ambienteOutros")]
    public string? AmbienteOutros { get; set; }

    // ========== HISTORICO CLINICO ==========
    [BsonElement("historicoClinico")]
    public HistoricoClinico HistoricoClinico { get; set; } = new();

    // ========== PARAMETROS CLINICOS ==========
    /// <summary>
    /// Cada parametro tem Status (Normal/Alterada) e Descricao opcional.
    /// Chaves usadas pelo frontend: hidratacao, temperatura, glicemia,
    /// pressaoArterial, mucosa, linfonodos, pelagem, deambulacao,
    /// frequenciaCardiaca, propriocepcao, frequenciaRespiratoria,
    /// palpacaoAbdominal, cavidadeOral, cavidadeNasal, condutosAuditivos,
    /// oftalmologicos.
    /// </summary>
    [BsonElement("parametrosClinicos")]
    public Dictionary<string, ParametroClinico> ParametrosClinicos { get; set; } = new();

    // ========== CONDUTA ==========
    [BsonElement("condutaClinica")]
    public string? CondutaClinica { get; set; }

    [BsonElement("tratamentosExamesSolicitados")]
    public string? TratamentosExamesSolicitados { get; set; }

    [BsonElement("retorno")]
    public string? Retorno { get; set; }
}

public class HistoricoClinico
{
    public bool? Vacinacao { get; set; }
    public string? VacinacaoData { get; set; }
    public string? VacinacaoQuais { get; set; }

    public bool? ControleEndoparasitoses { get; set; }
    public string? ControleEndoparasitosesData { get; set; }
    public string? ControleEndoparasitosesQuais { get; set; }

    public bool? ControleEctoparasitoses { get; set; }
    public string? ControleEctoparasitosesData { get; set; }
    public string? ControleEctoparasitosesQuais { get; set; }

    public bool? UsoMedicacao { get; set; }
    public string? UsoMedicacaoDescricao { get; set; }

    public bool? UsoSuplementacao { get; set; }
    public string? UsoSuplementacaoDescricao { get; set; }

    public bool? RealizouCirurgias { get; set; }
    public string? RealizouCirurgiasDescricao { get; set; }

    public bool? PossuiExameRecente { get; set; }
    public string? PossuiExameRecenteDescricao { get; set; }

    /// <summary>Aplicavel apenas a felinos.</summary>
    public bool? TestadoFivFelv { get; set; }
    public string? TestadoFivFelvDescricao { get; set; }

    public bool? AlergiaMedicamentos { get; set; }
    public string? AlergiaMedicamentosDescricao { get; set; }
}

public class ParametroClinico
{
    /// <summary>"Normal" | "Alterada" | null se nao avaliado.</summary>
    public string? Status { get; set; }
    public string? Descricao { get; set; }
}
