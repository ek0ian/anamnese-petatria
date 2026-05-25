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
            "Termo para Realizacao de Exames",
            "Autorizo a realizacao dos exames complementares indicados pelo medico veterinario " +
            "responsavel, estando ciente dos riscos inerentes ao procedimento e da necessidade clinica " +
            "do mesmo para a investigacao diagnostica do animal."),

        new(TipoAtestado.TermoProcedimentoRisco,
            "Termo para Realizacao de Procedimento Terapeutico de Risco",
            "Declaro estar ciente de que o procedimento terapeutico a ser realizado apresenta riscos, " +
            "que foram detalhadamente explicados pelo medico veterinario, e autorizo sua execucao."),

        new(TipoAtestado.TermoObito,
            "Termo de Obito",
            "Atesto, na qualidade de medico veterinario, o obito do animal acima identificado em " +
            "decorrencia das causas relacionadas no prontuario clinico."),

        new(TipoAtestado.TermoEutanasia,
            "Termo para Realizacao de Eutanasia",
            "Autorizo a realizacao do procedimento de eutanasia humanitaria, conforme indicacao " +
            "tecnica do medico veterinario responsavel, mediante criterios de bem-estar animal."),

        new(TipoAtestado.TermoCirurgico,
            "Termo para Realizacao de Procedimentos Cirurgicos",
            "Declaro estar ciente dos riscos inerentes ao procedimento cirurgico, a anestesia geral " +
            "e ao pos-operatorio, autorizando sua realizacao."),

        new(TipoAtestado.TermoRetiradaSemAlta,
            "Termo para Retirada de Animal sem Alta Medica",
            "Solicito a retirada do animal do servico veterinario, mesmo sem a alta medica, assumindo " +
            "integralmente a responsabilidade pelos riscos decorrentes dessa decisao."),

        new(TipoAtestado.AtestadoEncaminhamento,
            "Atestado de Encaminhamento",
            "Encaminho o paciente ao colega especialista para avaliacao complementar, conforme " +
            "necessidade clinica identificada no atendimento.")
    };

    public static Modelo? Obter(TipoAtestado tipo) => Itens.FirstOrDefault(m => m.Tipo == tipo);
}
