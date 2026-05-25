using AnamnesePetAtria.Api.DTOs;
using AnamnesePetAtria.Api.Models;
using AnamnesePetAtria.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AnamnesePetAtria.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/tutores")]
public class TutoresController : ControllerBase
{
    private readonly ITutorService _service;

    public TutoresController(ITutorService service) => _service = service;

    [HttpGet]
    public async Task<IActionResult> Listar([FromQuery] string? busca) =>
        Ok(await _service.ListarAsync(busca));

    [HttpGet("{id}")]
    public async Task<IActionResult> Obter(string id)
    {
        var t = await _service.ObterPorIdAsync(id);
        return t is null ? NotFound() : Ok(t);
    }

    [HttpPost]
    public async Task<IActionResult> Criar([FromBody] TutorRequest req)
    {
        var t = await _service.CriarAsync(req);
        return CreatedAtAction(nameof(Obter), new { id = t.Id }, t);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Atualizar(string id, [FromBody] TutorRequest req)
    {
        var ok = await _service.AtualizarAsync(id, req);
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
