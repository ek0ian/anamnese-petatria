using System.ComponentModel.DataAnnotations;
using AnamnesePetAtria.Api.Models;

namespace AnamnesePetAtria.Api.DTOs;

public class TutorRequest
{
    [Required, MinLength(3)] public string Nome { get; set; } = string.Empty;
    public string? Cpf { get; set; }
    public string? Telefone { get; set; }
    [EmailAddress] public string? Email { get; set; }
    public string? Endereco { get; set; }
}

public class PacienteRequest
{
    [Required, MinLength(1)] public string Nome { get; set; } = string.Empty;
    public DateTime? DataNascimento { get; set; }
    [Required] public Especie Especie { get; set; }
    public string? Raca { get; set; }
    [Required] public Sexo Sexo { get; set; }
    public bool Castrado { get; set; }
    public double? PesoKg { get; set; }
    public bool TemAcessoRua { get; set; }
    [Required] public string TutorId { get; set; } = string.Empty;
}

public class PacienteResponse
{
    public string Id { get; set; } = string.Empty;
    public int Codigo { get; set; }
    public string Nome { get; set; } = string.Empty;
    public DateTime? DataNascimento { get; set; }
    public string Especie { get; set; } = string.Empty;
    public string? Raca { get; set; }
    public string Sexo { get; set; } = string.Empty;
    public bool Castrado { get; set; }
    public double? PesoKg { get; set; }
    public bool TemAcessoRua { get; set; }
    public string TutorId { get; set; } = string.Empty;
    public string? TutorNome { get; set; }
    public string? IdadeFormatada { get; set; }
}
