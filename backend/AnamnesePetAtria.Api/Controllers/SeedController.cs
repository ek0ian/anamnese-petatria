using AnamnesePetAtria.Api.Data;
using AnamnesePetAtria.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;

namespace AnamnesePetAtria.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/seed")]
public class SeedController : ControllerBase
{
    private readonly IMongoDbContext _db;

    public SeedController(IMongoDbContext db) => _db = db;

    /// <summary>Popula o banco com pacientes, anamneses, vacinas, exames e atestados de exemplo.</summary>
    [HttpPost]
    public async Task<IActionResult> Popular()
    {
        var jaTem = await _db.Pacientes.Find(_ => true).AnyAsync();
        if (jaTem)
            return BadRequest(new { erro = "O banco já possui dados. Limpe-o antes de popular novamente." });

        // ===== Tutores =====
        var tCamila = new Tutor { Nome = "Camila Rosa", Telefone = "(31) 99876-5432", Email = "camila.rosa@example.com", Cpf = "111.222.333-44" };
        var tJoao = new Tutor { Nome = "Joao Pereira", Telefone = "(31) 98765-4321", Email = "joao@example.com", Cpf = "222.333.444-55" };
        var tMaria = new Tutor { Nome = "Maria Souza", Telefone = "(31) 97654-3210", Email = "maria@example.com", Cpf = "333.444.555-66" };
        await _db.Tutores.InsertManyAsync(new[] { tCamila, tJoao, tMaria });

        // ===== Pacientes =====
        var pMarley = new Paciente
        {
            Codigo = 1073064, Nome = "Marley", DataNascimento = new DateTime(2014, 8, 15),
            Especie = Especie.Canino, Raca = "Labrador Retriever", Sexo = Sexo.Macho,
            Castrado = true, PesoKg = 32.5, TemAcessoRua = false, TutorId = tCamila.Id!
        };
        var pNina = new Paciente
        {
            Codigo = 1073065, Nome = "Nina", DataNascimento = new DateTime(2021, 3, 22),
            Especie = Especie.Felino, Raca = "SRD", Sexo = Sexo.Femea,
            Castrado = true, PesoKg = 4.2, TemAcessoRua = true, TutorId = tJoao.Id!
        };
        var pThor = new Paciente
        {
            Codigo = 1073066, Nome = "Thor", DataNascimento = new DateTime(2019, 11, 30),
            Especie = Especie.Canino, Raca = "Golden Retriever", Sexo = Sexo.Macho,
            Castrado = false, PesoKg = 28.0, TemAcessoRua = false, TutorId = tMaria.Id!
        };
        await _db.Pacientes.InsertManyAsync(new[] { pMarley, pNina, pThor });

        // ===== Anamneses =====
        await _db.Anamneses.InsertManyAsync(new[]
        {
            new Anamnese
            {
                PacienteId = pMarley.Id!,
                Responsavel = tCamila.Nome,
                CpfResponsavel = tCamila.Cpf,
                TelefoneResponsavel = tCamila.Telefone,
                QueixaPrincipal = "Tutor relata episódios de vômito há 3 dias e apatia.",
                AnamneseTexto = "Animal apresentou vômito agudo após introdução de ração nova. " +
                                "Sem febre. Apatia leve e diminuição da ingestão hídrica.",
                DoencasPregressas = false,
                DoencasPresentes = true,
                DoencasPresentesDescricao = "Gastrite aguda em investigação",
                SistemaDigestorio = new() { "Vômito" },
                Alimentacao = "Hiporexia",
                IngestaoAgua = "Oligodipsia",
                Ambiente = new() { "Urbano" },
                CondutaClinica = "Dieta de eliminação + antiemético. Reavaliação em 7 dias.",
                TratamentosExamesSolicitados = "Hemograma + perfil bioquímico básico.",
                Retorno = "Em 7 dias para reavaliação.",
                HistoricoClinico = new HistoricoClinico
                {
                    Vacinacao = true, VacinacaoData = "08/2025", VacinacaoQuais = "V10 + Antirrábica",
                    ControleEndoparasitoses = true, ControleEndoparasitosesData = "01/2026", ControleEndoparasitosesQuais = "Drontal Plus",
                    ControleEctoparasitoses = true, ControleEctoparasitosesData = "04/2026", ControleEctoparasitosesQuais = "NexGard",
                    UsoMedicacao = false,
                    RealizouCirurgias = true, RealizouCirurgiasDescricao = "Castração em 2017",
                    AlergiaMedicamentos = false
                },
                ParametrosClinicos = new Dictionary<string, ParametroClinico>
                {
                    ["hidratacao"] = new() { Status = "Alterada", Descricao = "Levemente desidratado (~5%)" },
                    ["temperatura"] = new() { Status = "Normal", Descricao = "38.9 °C" },
                    ["mucosa"] = new() { Status = "Normal", Descricao = "Normocoradas" },
                    ["frequenciaCardiaca"] = new() { Status = "Normal", Descricao = "120 bpm" },
                    ["frequenciaRespiratoria"] = new() { Status = "Normal", Descricao = "24 mrpm" },
                    ["palpacaoAbdominal"] = new() { Status = "Alterada", Descricao = "Sensibilidade em epigástrio" }
                }
            },
            new Anamnese
            {
                PacienteId = pNina.Id!,
                Responsavel = tJoao.Nome,
                CpfResponsavel = tJoao.Cpf,
                TelefoneResponsavel = tJoao.Telefone,
                QueixaPrincipal = "Espirros frequentes e secreção nasal há 5 dias.",
                AnamneseTexto = "Animal com sintomas respiratórios há 5 dias. Apetite preservado.",
                DoencasPregressas = true,
                DoencasPregressasDescricao = "Quadro respiratório recorrente",
                DoencasPresentes = true,
                DoencasPresentesDescricao = "Suspeita de rinotraqueíte felina",
                SistemaCardiorrespiratorio = new() { "Secreção nasal" },
                Alimentacao = "Normorexia",
                IngestaoAgua = "Normodipsia",
                Ambiente = new() { "Urbano", "Acesso à rua" },
                CondutaClinica = "Solicitar PCR para herpesvírus felino. Suporte com nebulização.",
                TratamentosExamesSolicitados = "PCR herpesvírus felino. FIV/FeLV.",
                Retorno = "Em 10 dias com resultado do PCR.",
                HistoricoClinico = new HistoricoClinico
                {
                    Vacinacao = true, VacinacaoData = "11/2025", VacinacaoQuais = "V4 felina",
                    TestadoFivFelv = false, TestadoFivFelvDescricao = "A ser solicitado agora",
                    AlergiaMedicamentos = false
                },
                ParametrosClinicos = new Dictionary<string, ParametroClinico>
                {
                    ["temperatura"] = new() { Status = "Alterada", Descricao = "39.4 °C (febrícula)" },
                    ["frequenciaCardiaca"] = new() { Status = "Normal", Descricao = "180 bpm" },
                    ["frequenciaRespiratoria"] = new() { Status = "Normal", Descricao = "32 mrpm" },
                    ["cavidadeNasal"] = new() { Status = "Alterada", Descricao = "Secreção serosa bilateral" }
                }
            }
        });

        // ===== Vacinas =====
        await _db.Vacinas.InsertManyAsync(new[]
        {
            new Vacina { PacienteId = pMarley.Id!, Nome = "V10 (Polivalente canina)", Fabricante = "Zoetis", Lote = "L2024-A", Dose = "Reforço anual", DataAplicacao = new DateTime(2025, 8, 10), ProximaDose = new DateTime(2026, 8, 10) },
            new Vacina { PacienteId = pMarley.Id!, Nome = "Antirrábica", Fabricante = "MSD", Lote = "AR-883", Dose = "Anual", DataAplicacao = new DateTime(2025, 8, 10), ProximaDose = new DateTime(2026, 8, 10) },
            new Vacina { PacienteId = pNina.Id!, Nome = "V4 felina", Fabricante = "Zoetis", Lote = "F-221", Dose = "Reforço", DataAplicacao = new DateTime(2025, 11, 2), ProximaDose = new DateTime(2026, 11, 2) }
        });

        // ===== Exames =====
        await _db.Exames.InsertManyAsync(new[]
        {
            new SolicitacaoExame
            {
                PacienteId = pMarley.Id!,
                Data = DateTime.UtcNow.AddDays(-2),
                Motivos = "Investigar quadro gastrointestinal e descartar causas hepáticas/renais.",
                Exames = new()
                {
                    new ItemExame { Categoria = "Hematologia", Nome = "Hemograma completo" },
                    new ItemExame
                    {
                        Categoria = "Bioquímico", Nome = "Perfil Bioquímico completo",
                        Parametros = new() { "Ureia", "Creatinina", "ALT", "AST", "FA", "Glicose" }
                    }
                }
            }
        });

        // ===== Atestados =====
        await _db.Atestados.InsertManyAsync(new[]
        {
            new AtestadoTermo
            {
                PacienteId = pMarley.Id!,
                Tipo = TipoAtestado.TermoExames,
                Cidade = "Belo Horizonte",
                DataEmissao = DateTime.UtcNow.AddDays(-2),
                Conteudo = ModelosAtestado.Obter(TipoAtestado.TermoExames)?.Conteudo ?? ""
            }
        });

        // ===== Prescricoes =====
        await _db.Prescricoes.InsertManyAsync(new[]
        {
            new Prescricao
            {
                PacienteId = pMarley.Id!,
                Data = DateTime.UtcNow.AddDays(-2),
                Orientacoes = "Administrar com o estômago vazio. Retornar em 7 dias.",
                Itens = new()
                {
                    new ItemPrescricao { Medicamento = "Maropitant", Dose = "1mg/kg", Via = "Oral", Frequencia = "1x ao dia", Duracao = "5 dias" },
                    new ItemPrescricao { Medicamento = "Omeprazol", Dose = "1mg/kg", Via = "Oral", Frequencia = "12/12h", Duracao = "7 dias" }
                }
            }
        });

        // ===== Retornos =====
        await _db.Retornos.InsertManyAsync(new[]
        {
            new Retorno { PacienteId = pMarley.Id!, DataAgendada = DateTime.UtcNow.AddDays(5), Motivo = "Reavaliação após tratamento gástrico." },
            new Retorno { PacienteId = pNina.Id!, DataAgendada = DateTime.UtcNow.AddDays(7), Motivo = "Resultado de PCR herpes." }
        });

        return Ok(new
        {
            mensagem = "Dados de exemplo carregados.",
            tutores = 3,
            pacientes = 3,
            anamneses = 2,
            vacinas = 3,
            exames = 1,
            atestados = 1,
            prescricoes = 1,
            retornos = 2
        });
    }
}
