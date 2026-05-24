using MongoDB.Bson.Serialization.Attributes;

namespace AnamnesePetAtria.Api.Models;

public static class Perfis
{
    public const string Admin = "admin";
    public const string Veterinario = "veterinario";
}

public class Usuario : EntidadeBase
{
    [BsonElement("nome")]
    public string Nome { get; set; } = string.Empty;

    [BsonElement("email")]
    public string Email { get; set; } = string.Empty;

    [BsonElement("senhaHash")]
    public string SenhaHash { get; set; } = string.Empty;

    /// <summary>Perfis: ver <see cref="Perfis"/>.</summary>
    [BsonElement("perfil")]
    public string Perfil { get; set; } = Perfis.Veterinario;
}
