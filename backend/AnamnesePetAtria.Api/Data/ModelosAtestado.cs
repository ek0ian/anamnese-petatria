using AnamnesePetAtria.Api.Models;

namespace AnamnesePetAtria.Api.Data;

/// <summary>
/// Modelos padrao de atestados/termos exibidos no dropdown da UI.
/// Conteudo textual base que pode ser editado antes da emissao.
/// </summary>
public static class ModelosAtestado
{
    public record Modelo(TipoAtestado Tipo, string Titulo, string Conteudo, bool Padrao = true);

    public static readonly List<Modelo> Itens = new()
    {
        new(TipoAtestado.TermoExames,
            "Termo para Realização de Exames",
            "Autorizo a realização dos exames complementares indicados pelo médico veterinário " +
            "responsável, estando ciente dos riscos inerentes ao procedimento e da necessidade clínica " +
            "do mesmo para a investigação diagnóstica do animal."),

        new(TipoAtestado.TermoProcedimentoRisco,
            "Termo para Realização de Procedimento Terapêutico de Risco",
            "Declaro estar ciente de que o procedimento terapêutico a ser realizado apresenta riscos, " +
            "que foram detalhadamente explicados pelo médico veterinário, e autorizo sua execução."),

        new(TipoAtestado.TermoObito,
            "Termo de Óbito",
            "Atesto, na qualidade de médico veterinário, o óbito do animal acima identificado em " +
            "decorrência das causas relacionadas no prontuário clínico."),

        new(TipoAtestado.TermoEutanasia,
            "Termo para Realização de Eutanásia",
            "Autorizo a realização do procedimento de eutanásia humanitária, conforme indicação " +
            "técnica do médico veterinário responsável, mediante critérios de bem-estar animal."),

        new(TipoAtestado.TermoCirurgico,
            "Termo para Realização de Procedimentos Cirúrgicos",
            "Declaro estar ciente dos riscos inerentes ao procedimento cirúrgico, à anestesia geral " +
            "e ao pós-operatório, autorizando sua realização."),

        new(TipoAtestado.TermoRetiradaSemAlta,
            "Termo para Retirada de Animal sem Alta Médica",
            "Solicito a retirada do animal do serviço veterinário, mesmo sem a alta médica, assumindo " +
            "integralmente a responsabilidade pelos riscos decorrentes dessa decisão."),

        new(TipoAtestado.AtestadoEncaminhamento,
            "Atestado de Encaminhamento",
            "Encaminho o paciente ao colega especialista para avaliação complementar, conforme " +
            "necessidade clínica identificada no atendimento.")
    };

    public static Modelo? Obter(TipoAtestado tipo) => Itens.FirstOrDefault(m => m.Tipo == tipo);
}
