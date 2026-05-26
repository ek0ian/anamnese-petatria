using AnamnesePetAtria.Api.Data;
using Xunit;

namespace AnamnesePetAtria.Tests;

public class CatalogoExamesTests
{
    [Fact] // sucesso: termo encontra exames com case-insensitive
    public void Buscar_TermoExistente_DeveRetornarExames()
    {
        var resultados = CatalogoExames.Buscar("hemograma").ToList();

        Assert.NotEmpty(resultados);
        Assert.Contains(resultados, e => e.Nome.Contains("Hemograma"));
    }

    [Fact] // sucesso: categoria filtra corretamente
    public void Buscar_PorCategoria_DeveRetornarItens()
    {
        var resultados = CatalogoExames.Buscar("Hematologia").ToList();

        Assert.NotEmpty(resultados);
        Assert.All(resultados, e => Assert.Equal("Hematologia", e.Categoria));
    }

    [Fact] // erro: termo inexistente retorna lista vazia
    public void Buscar_TermoInexistente_DeveRetornarListaVazia()
    {
        var resultados = CatalogoExames.Buscar("xxx-nada-aqui").ToList();

        Assert.Empty(resultados);
    }

    [Fact] // erro/borda: termo nulo ou vazio retorna o catalogo completo
    public void Buscar_TermoNulo_DeveRetornarCatalogoCompleto()
    {
        var resultados = CatalogoExames.Buscar(null).ToList();

        Assert.Equal(CatalogoExames.Itens.Count, resultados.Count);
    }

    [Fact] // sucesso: categorias sao distintas e ordenadas
    public void Categorias_DeveRetornarValoresDistintos()
    {
        var categorias = CatalogoExames.Categorias().ToList();

        Assert.Equal(categorias.Distinct().Count(), categorias.Count);
        Assert.True(categorias.SequenceEqual(categorias.OrderBy(c => c)));
    }
}
