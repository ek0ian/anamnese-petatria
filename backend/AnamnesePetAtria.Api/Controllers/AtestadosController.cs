using AnamnesePetAtria.Api.Models;
using AnamnesePetAtria.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AnamnesePetAtria.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/atestados")]
public class AtestadosController : ControllerBase
{
    private readonly IAtestadoService _service;

    public AtestadosController(IAtestadoService service) => _service = service;

    /// <summary>Modelos padrao de atestados/termos (Termo de Exames, Cirurgico, Obito, etc).</summary>
    [HttpGet("modelos")]
    public IActionResult Modelos() => Ok(_service.Modelos());

    [HttpGet("paciente/{pacienteId}")]
    public async Task<IActionResult> ListarPorPaciente(string pacienteId) =>
        Ok(await _service.ListarPorPacienteAsync(pacienteId));

    [HttpGet("{id}")]
    public async Task<IActionResult> Obter(string id)
    {
        var a = await _service.ObterPorIdAsync(id);
        return a is null ? NotFound() : Ok(a);
    }

    [HttpPost]
    public async Task<IActionResult> Criar([FromBody] AtestadoTermo atestado)
    {
        try
        {
            var a = await _service.CriarAsync(atestado);
            return CreatedAtAction(nameof(Obter), new { id = a.Id }, a);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { erro = ex.Message });
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Atualizar(string id, [FromBody] AtestadoTermo atestado)
    {
        var ok = await _service.AtualizarAsync(id, atestado);
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
