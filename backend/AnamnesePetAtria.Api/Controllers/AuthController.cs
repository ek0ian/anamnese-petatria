using AnamnesePetAtria.Api.DTOs;
using AnamnesePetAtria.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace AnamnesePetAtria.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _auth;

    public AuthController(IAuthService auth) => _auth = auth;

    /// <summary>Registra um novo usuario (veterinario ou admin).</summary>
    [HttpPost("registrar")]
    [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Registrar([FromBody] RegistroRequest req)
    {
        try
        {
            var resp = await _auth.RegistrarAsync(req);
            return CreatedAtAction(nameof(Registrar), resp);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { erro = ex.Message });
        }
    }

    /// <summary>Login. Retorna JWT no payload.</summary>
    [HttpPost("login")]
    [ProducesResponseType(typeof(AuthResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Login([FromBody] LoginRequest req)
    {
        var resp = await _auth.LoginAsync(req);
        if (resp is null) return Unauthorized(new { erro = "Credenciais invalidas." });
        return Ok(resp);
    }
}
