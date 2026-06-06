using AnamnesePetAtria.Api.Data;
using AnamnesePetAtria.Api.DTOs;
using AnamnesePetAtria.Api.Models;
using AnamnesePetAtria.Api.Services;
using MongoDB.Driver;
using Moq;
using Xunit;

namespace AnamnesePetAtria.Tests;

/// <summary>
/// Testes unitarios da camada de servico do CRUD de pacientes (Bonus C).
/// O <see cref="PacienteService"/> depende de <see cref="IMongoDbContext"/>, entao
/// mockamos as colecoes do Mongo com Moq — nenhum banco real sobe durante os testes.
/// Cobre cenarios de SUCESSO e de ERRO para criar, buscar por id, atualizar e remover.
/// </summary>
public class PacienteServiceTests
{
    private readonly Mock<IMongoDbContext> _db = new();
    private readonly Mock<IMongoCollection<Paciente>> _pacientes = new();
    private readonly Mock<IMongoCollection<Tutor>> _tutores = new();

    public PacienteServiceTests()
    {
        _db.SetupGet(d => d.Pacientes).Returns(_pacientes.Object);
        _db.SetupGet(d => d.Tutores).Returns(_tutores.Object);
    }

    private PacienteService Service() => new(_db.Object);

    private static PacienteRequest RequestValido(string tutorId = "tutor-1") => new()
    {
        Nome = "Marley",
        Especie = Especie.Canino,
        Sexo = Sexo.Macho,
        TutorId = tutorId
    };

    // Cria um IAsyncCursor falso. O FindFluent do driver, ao executar
    // FirstOrDefaultAsync()/ToListAsync(), delega para IMongoCollection.FindAsync,
    // que aqui retorna este cursor. MoveNextAsync devolve true uma vez (com o lote)
    // quando ha itens, depois false; ToListAsync/FirstOrDefaultAsync leem Current.
    private static IAsyncCursor<T> Cursor<T>(params T[] itens)
    {
        var cursor = new Mock<IAsyncCursor<T>>();
        cursor.SetupGet(c => c.Current).Returns(itens);
        var seq = cursor.SetupSequence(c => c.MoveNextAsync(It.IsAny<CancellationToken>()));
        if (itens.Length > 0) seq.ReturnsAsync(true).ReturnsAsync(false);
        else seq.ReturnsAsync(false);
        return cursor.Object;
    }

    // Usa uma factory (() => Cursor(...)) para gerar um cursor NOVO a cada chamada:
    // o cursor e consumivel (MoveNextAsync e uma sequencia), entao reaproveitar a
    // mesma instancia quebraria buscas que consultam a colecao mais de uma vez
    // (ex.: CriarAsync valida o tutor e depois o le de novo ao materializar).
    private void SetupFindPacientes(params Paciente[] resultado) =>
        _pacientes
            .Setup(c => c.FindAsync(
                It.IsAny<FilterDefinition<Paciente>>(),
                It.IsAny<FindOptions<Paciente, Paciente>>(),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(() => Cursor(resultado));

    private void SetupFindTutores(params Tutor[] resultado) =>
        _tutores
            .Setup(c => c.FindAsync(
                It.IsAny<FilterDefinition<Tutor>>(),
                It.IsAny<FindOptions<Tutor, Tutor>>(),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(() => Cursor(resultado));

    [Fact] // SUCESSO: id existente devolve o paciente materializado com nome do tutor
    public async Task ObterPorIdAsync_QuandoExiste_RetornaPaciente()
    {
        var paciente = new Paciente { Id = "p-1", Codigo = 1073064, Nome = "Marley", TutorId = "tutor-1" };
        SetupFindPacientes(paciente);
        SetupFindTutores(new Tutor { Id = "tutor-1", Nome = "Camila" });

        var resultado = await Service().ObterPorIdAsync("p-1");

        Assert.NotNull(resultado);
        Assert.Equal("Marley", resultado!.Nome);
        Assert.Equal(1073064, resultado.Codigo);
        Assert.Equal("Camila", resultado.TutorNome);
    }

    [Fact] // ERRO/borda: id inexistente devolve null (nenhum paciente encontrado)
    public async Task ObterPorIdAsync_QuandoNaoExiste_RetornaNull()
    {
        SetupFindPacientes(); // cursor vazio

        var resultado = await Service().ObterPorIdAsync("nao-existe");

        Assert.Null(resultado);
    }

    [Fact] // SUCESSO: dados validos inserem o paciente e geram codigo sequencial
    public async Task CriarAsync_ComDadosValidos_InsereEGeraCodigoSequencial()
    {
        SetupFindTutores(new Tutor { Id = "tutor-1", Nome = "Camila" });
        SetupFindPacientes(); // nenhum paciente ainda -> codigo parte do valor base
        _pacientes
            .Setup(c => c.InsertOneAsync(It.IsAny<Paciente>(), It.IsAny<InsertOneOptions>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        var resultado = await Service().CriarAsync(RequestValido());

        Assert.Equal("Marley", resultado.Nome);
        Assert.Equal(1073064, resultado.Codigo); // (1073063 base) + 1
        Assert.Equal("Camila", resultado.TutorNome);
        _pacientes.Verify(
            c => c.InsertOneAsync(It.IsAny<Paciente>(), It.IsAny<InsertOneOptions>(), It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact] // ERRO: tutor inexistente impede a criacao e lanca excecao
    public async Task CriarAsync_ComTutorInexistente_LancaExcecao()
    {
        SetupFindTutores(); // nenhum tutor encontrado

        await Assert.ThrowsAsync<InvalidOperationException>(
            () => Service().CriarAsync(RequestValido("tutor-fantasma")));

        _pacientes.Verify(
            c => c.InsertOneAsync(It.IsAny<Paciente>(), It.IsAny<InsertOneOptions>(), It.IsAny<CancellationToken>()),
            Times.Never);
    }

    [Fact] // SUCESSO: paciente existente e atualizado e o servico retorna true
    public async Task AtualizarAsync_QuandoExiste_RetornaTrue()
    {
        SetupFindPacientes(new Paciente { Id = "p-1", Nome = "Marley", TutorId = "tutor-1" });
        _pacientes
            .Setup(c => c.ReplaceOneAsync(
                It.IsAny<FilterDefinition<Paciente>>(),
                It.IsAny<Paciente>(),
                It.IsAny<ReplaceOptions>(),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(new ReplaceOneResult.Acknowledged(1, 1, null));

        var ok = await Service().AtualizarAsync("p-1", RequestValido());

        Assert.True(ok);
    }

    [Fact] // ERRO/borda: id inexistente nao atualiza nada e retorna false
    public async Task AtualizarAsync_QuandoNaoExiste_RetornaFalse()
    {
        SetupFindPacientes(); // cursor vazio

        var ok = await Service().AtualizarAsync("nao-existe", RequestValido());

        Assert.False(ok);
        _pacientes.Verify(
            c => c.ReplaceOneAsync(
                It.IsAny<FilterDefinition<Paciente>>(),
                It.IsAny<Paciente>(),
                It.IsAny<ReplaceOptions>(),
                It.IsAny<CancellationToken>()),
            Times.Never);
    }

    [Theory] // SUCESSO (1 removido -> true) e ERRO/borda (0 removidos -> false)
    [InlineData(1, true)]
    [InlineData(0, false)]
    public async Task RemoverAsync_RetornaConformeDeletedCount(long deletados, bool esperado)
    {
        _pacientes
            .Setup(c => c.DeleteOneAsync(It.IsAny<FilterDefinition<Paciente>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new DeleteResult.Acknowledged(deletados));

        var ok = await Service().RemoverAsync("p-1");

        Assert.Equal(esperado, ok);
    }
}
