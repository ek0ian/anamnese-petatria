using AnamnesePetAtria.Api.Models;
using AnamnesePetAtria.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AnamnesePetAtria.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/exames")]
public class ExamesController : ControllerBase
{
    private readonly IExameService _service;

    public ExamesController(IExameService service) => _service = service;

    /// <summary>Categorias de exames disponiveis (Hematologia, Bioquimico, etc).</summary>
    [HttpGet("categorias")]
    public IActionResult Categorias() => Ok(_service.Categorias());

    /// <summary>Catalogo de exames com busca opcional (autocomplete).</summary>
    [HttpGet("catalogo")]
    public IActionResult Catalogo([FromQuery] string? termo) =>
        Ok(_service.BuscarCatalogo(termo));

    [HttpGet("paciente/{pacienteId}")]
    public async Task<IActionResult> ListarPorPaciente(string pacienteId) =>
        Ok(await _service.ListarPorPacienteAsync(pacienteId));

    [HttpGet("{id}")]
    public async Task<IActionResult> Obter(string id)
    {
        var e = await _service.ObterPorIdAsync(id);
        return e is null ? NotFound() : Ok(e);
    }

    [HttpPost]
    public async Task<IActionResult> Criar([FromBody] SolicitacaoExame solicitacao)
    {
        try
        {
            var s = await _service.CriarAsync(solicitacao);
            return CreatedAtAction(nameof(Obter), new { id = s.Id }, s);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { erro = ex.Message });
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Atualizar(string id, [FromBody] SolicitacaoExame solicitacao)
    {
        var ok = await _service.AtualizarAsync(id, solicitacao);
        return ok ? NoContent() : NotFound();
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = Perfis.Admin)]
    public async Task<IActionResult> Remover(string id)
    {
        var ok = await _service.RemoverAsync(id);
        return ok ? NoContent() : NotFound();
    }
}
