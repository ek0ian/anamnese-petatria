namespace AnamnesePetAtria.Api.Models;

/// <summary>
/// Marca entidades que pertencem a um paciente. Habilita o uso do
/// <see cref="Services.ServicoPaciente{T}"/> generico para CRUD.
/// </summary>
public interface IEntidadePaciente
{
    string PacienteId { get; set; }
}
