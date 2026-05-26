using AnamnesePetAtria.Api.Data;
using AnamnesePetAtria.Api.Models;
using Xunit;

namespace AnamnesePetAtria.Tests;

public class ModelosAtestadoTests
{
    [Theory] // sucesso: cada tipo enumerado tem modelo cadastrado
    [InlineData(TipoAtestado.TermoExames)]
    [InlineData(TipoAtestado.TermoProcedimentoRisco)]
    [InlineData(TipoAtestado.TermoObito)]
    [InlineData(TipoAtestado.TermoEutanasia)]
    [InlineData(TipoAtestado.TermoCirurgico)]
    [InlineData(TipoAtestado.TermoRetiradaSemAlta)]
    [InlineData(TipoAtestado.AtestadoEncaminhamento)]
    public void Obter_TodosOsTipos_DevemTerModelo(TipoAtestado tipo)
    {
        var modelo = ModelosAtestado.Obter(tipo);

        Assert.NotNull(modelo);
        Assert.False(string.IsNullOrWhiteSpace(modelo!.Titulo));
        Assert.False(string.IsNullOrWhiteSpace(modelo.Conteudo));
    }

    [Fact] // sucesso: existem 7 modelos cadastrados (um por tipo)
    public void Itens_DeveTerSeteModelos()
    {
        Assert.Equal(7, ModelosAtestado.Itens.Count);
    }

    [Fact] // erro/borda: tipo invalido (cast direto) retorna null
    public void Obter_TipoForaDoEnum_DeveRetornarNull()
    {
        var modelo = ModelosAtestado.Obter((TipoAtestado)999);

        Assert.Null(modelo);
    }
}
