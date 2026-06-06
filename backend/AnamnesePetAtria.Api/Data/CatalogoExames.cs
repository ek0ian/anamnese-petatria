using AnamnesePetAtria.Api.Models;

namespace AnamnesePetAtria.Api.Data;

/// <summary>
/// Catalogo estatico de exames disponiveis para solicitacao, baseado nos prints da UI:
/// Hematologia, Bioquimico (perfil renal etc), Parasitologico, Microbiologia, etc.
/// </summary>
public static class CatalogoExames
{
    public static readonly List<ItemExame> Itens = new()
    {
        new() { Categoria = "Hematologia", Nome = "Hemograma completo" },
        new() { Categoria = "Hematologia", Nome = "Tipagem sanguinea gatos (A,B,AB)" },
        new() { Categoria = "Hematologia", Nome = "Tipagem sanguinea caes (DEA 1.1)" },
        new() { Categoria = "Hematologia", Nome = "Contagem de reticulocitos" },

        new()
        {
            Categoria = "Bioquimico",
            Nome = "Perfil Renal 1",
            Parametros = new() { "Ureia", "Creatinina", "Eletrolitos" }
        },
        new()
        {
            Categoria = "Bioquimico",
            Nome = "Perfil Bioquimico completo",
            Parametros = new()
            {
                "Ureia", "Creatinina", "Calcio", "Fosforo", "Sodio", "Potassio",
                "Cloreto", "Glicose", "Colesterol", "Triglicerides",
                "ALT", "AST", "FA", "GGT", "Albumina", "Proteinas totais"
            }
        },
        new() { Categoria = "Bioquimico", Nome = "ALT (TGP)" },
        new() { Categoria = "Bioquimico", Nome = "AST (TGO)" },

        new() { Categoria = "Urinario", Nome = "Urinalise (EAS)" },
        new() { Categoria = "Urinario", Nome = "Relacao proteina/creatinina urinaria" },

        new() { Categoria = "Parasitologico", Nome = "Exame de fezes - 3 amostras" },
        new() { Categoria = "Parasitologico", Nome = "Pesquisa de Giardia" },

        new() { Categoria = "Imagem", Nome = "Radiografia simples" },
        new() { Categoria = "Imagem", Nome = "Ultrassonografia abdominal" },

        new() { Categoria = "Sorologia", Nome = "Teste FIV/FeLV" },
        new() { Categoria = "Sorologia", Nome = "Sorologia para Leishmaniose" }
    };

    public static IEnumerable<string> Categorias() =>
        Itens.Select(i => i.Categoria).Distinct().OrderBy(c => c);

    public static IEnumerable<ItemExame> Buscar(string? termo)
    {
        if (string.IsNullOrWhiteSpace(termo)) return Itens;
        var t = termo.Trim();
        return Itens.Where(i =>
            i.Nome.Contains(t, StringComparison.OrdinalIgnoreCase) ||
            i.Categoria.Contains(t, StringComparison.OrdinalIgnoreCase));
    }
}
