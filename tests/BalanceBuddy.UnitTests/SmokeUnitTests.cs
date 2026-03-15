using BalanceBuddyWebApi.Services;
using BalanceBuddyWebApi.Services.Parsers;
using Xunit;

namespace BalanceBuddy.UnitTests;

public class UndoManagerTests
{
    [Fact]
    public void Undo_ReturnsFalse_WhenStackIsEmpty()
    {
        var sut = new UndoManager(new DatabaseService());

        var result = sut.Undo(TransactionType.Expense);

        Assert.False(result);
    }

    [Fact]
    public void PushThenUndoThenRedo_ExecutesOperationsInOrder()
    {
        var sut = new UndoManager(new DatabaseService());
        var state = 0;

        sut.Push(TransactionType.Income, new TransactionOperation
        {
            Undo = () => state = -1,
            Redo = () => state = 1
        });

        var undoResult = sut.Undo(TransactionType.Income);
        var redoResult = sut.Redo(TransactionType.Income);

        Assert.True(undoResult);
        Assert.True(redoResult);
        Assert.Equal(1, state);
    }
}

public class BankStatementParserRegistryTests
{
    [Fact]
    public void ListBanks_ReturnsSortedBankIds()
    {
        var sut = new BankStatementParserRegistry(new IBankStatementParser[]
        {
            new FakeParser("Wells Fargo"),
            new FakeParser("American Express")
        });

        var banks = sut.ListBanks().ToArray();

        Assert.Equal(new[] { "American Express", "Wells Fargo" }, banks);
    }

    [Fact]
    public void GetParser_IsCaseInsensitive()
    {
        var expected = new FakeParser("Chase");
        var sut = new BankStatementParserRegistry(new IBankStatementParser[] { expected });

        var parser = sut.GetParser("chase");

        Assert.Same(expected, parser);
    }

    private sealed class FakeParser : IBankStatementParser
    {
        public FakeParser(string bankId) => BankId = bankId;
        public string BankId { get; }
        public void ParseStatement(Stream csvStream) { }
    }
}
