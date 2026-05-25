using AnamnesePetAtria.Api.DTOs;
using AnamnesePetAtria.Api.Models;
using AnamnesePetAtria.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AnamnesePetAtria.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/pacientes")]
public class PacientesController : ControllerBase
{
    private readonly IPacienteService _service;

    public PacientesController(IPacienteService service) => _service = service;

    /// <summary>Lista pacientes. Aceita filtro por nome ou codigo numerico.</summary>
    [HttpGet]
    [ProducesResponseType(typeof(List<PacienteResponse>), 200)]
    public async Task<IActionResult> Listar([FromQuery] string? busca) =>
        Ok(await _service.ListarAsync(busca));

    [HttpGet("{id}")]
    [ProducesResponseType(typeof(PacienteResponse), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> Obter(string id)
    {
        var p = await _service.ObterPorIdAsync(id);
        return p is null ? NotFound() : Ok(p);
    }

    [HttpGet("codigo/{codigo:int}")]
    public async Task<IActionResult> ObterPorCodigo(int codigo)
    {
        var p = await _service.ObterPorCodigoAsync(codigo);
        return p is null ? NotFound() : Ok(p);
    }

    [HttpPost]
    [ProducesResponseType(typeof(PacienteResponse), 201)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> Criar([FromBody] PacienteRequest req)
    {
        try
        {
            var p = await _service.CriarAsync(req);
            return CreatedAtAction(nameof(Obter), new { id = p.Id }, p);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { erro = ex.Message });
        }
    }

    [HttpPut("{id}")]
    [ProducesResponseType(204)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> Atualizar(string id, [FromBody] PacienteRequest req)
    {
        var ok = await _service.AtualizarAsync(id, req);
        return ok ? NoContent() : NotFound();
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = Perfis.Admin)]
    [ProducesResponseType(204)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> Remover(string id)
    {
        var ok = await _service.RemoverAsync(id);
        return ok ? NoContent() : NotFound();
    }
}
