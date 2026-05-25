using AnamnesePetAtria.Api.Models;
using AnamnesePetAtria.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AnamnesePetAtria.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/anamneses")]
public class AnamnesesController : ControllerBase
{
    private readonly IAnamneseService _service;

    public AnamnesesController(IAnamneseService service) => _service = service;

    /// <summary>Lista anamneses de um paciente, mais recentes primeiro.</summary>
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
    public async Task<IActionResult> Criar([FromBody] Anamnese anamnese)
    {
        try
        {
            var criada = await _service.CriarAsync(anamnese);
            return CreatedAtAction(nameof(Obter), new { id = criada.Id }, criada);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { erro = ex.Message });
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Atualizar(string id, [FromBody] Anamnese anamnese)
    {
        var ok = await _service.AtualizarAsync(id, anamnese);
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
