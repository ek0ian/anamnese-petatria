using AnamnesePetAtria.Api.Models;
using AnamnesePetAtria.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AnamnesePetAtria.Api.Controllers;

/// <summary>
/// Controller base com CRUD para entidades vinculadas a paciente.
/// Subclasses apenas declaram a rota e injetam o servico generico.
/// </summary>
[ApiController]
[Authorize]
public abstract class ControllerPaciente<T> : ControllerBase
    where T : EntidadeBase, IEntidadePaciente
{
    private readonly ServicoPaciente<T> _svc;

    protected ControllerPaciente(ServicoPaciente<T> svc) => _svc = svc;

    [HttpGet("paciente/{pacienteId}")]
    public async Task<IActionResult> Listar(string pacienteId) =>
        Ok(await _svc.ListarPorPacienteAsync(pacienteId));

    [HttpGet("{id}")]
    public async Task<IActionResult> Obter(string id)
    {
        var e = await _svc.ObterPorIdAsync(id);
        return e is null ? NotFound() : Ok(e);
    }

    [HttpPost]
    public async Task<IActionResult> Criar([FromBody] T entidade)
    {
        try
        {
            var criado = await _svc.CriarAsync(entidade);
            return CreatedAtAction(nameof(Obter), new { id = criado.Id }, criado);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { erro = ex.Message });
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Atualizar(string id, [FromBody] T entidade) =>
        await _svc.AtualizarAsync(id, entidade) ? NoContent() : NotFound();

    [HttpDelete("{id}")]
    [Authorize(Roles = Perfis.Admin)]
    public async Task<IActionResult> Remover(string id) =>
        await _svc.RemoverAsync(id) ? NoContent() : NotFound();
}

[Route("api/vacinas")]
public class VacinasController : ControllerPaciente<Vacina>
{
    public VacinasController(ServicoPaciente<Vacina> svc) : base(svc) { }
}

[Route("api/prescricoes")]
public class PrescricoesController : ControllerPaciente<Prescricao>
{
    public PrescricoesController(ServicoPaciente<Prescricao> svc) : base(svc) { }
}

[Route("api/retornos")]
public class RetornosController : ControllerPaciente<Retorno>
{
    public RetornosController(ServicoPaciente<Retorno> svc) : base(svc) { }
}

[Route("api/procedimentos")]
public class ProcedimentosController : ControllerPaciente<Procedimento>
{
    public ProcedimentosController(ServicoPaciente<Procedimento> svc) : base(svc) { }
}

[Route("api/cirurgias")]
public class CirurgiasController : ControllerPaciente<Cirurgia>
{
    public CirurgiasController(ServicoPaciente<Cirurgia> svc) : base(svc) { }
}

[Route("api/internacoes")]
public class InternacoesController : ControllerPaciente<Internacao>
{
    public InternacoesController(ServicoPaciente<Internacao> svc) : base(svc) { }
}

[Route("api/orcamentos")]
public class OrcamentosController : ControllerPaciente<Orcamento>
{
    public OrcamentosController(ServicoPaciente<Orcamento> svc) : base(svc) { }
}
