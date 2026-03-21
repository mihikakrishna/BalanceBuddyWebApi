using BalanceBuddyWebApi.Services;
using BalanceBuddyWebApi.Services.Parsers;
using Xunit;

namespace BalanceBuddy.UnitTests;

public class UndoManagerBehaviorTests
{
    [Fact]
    public void Undo_ReturnsFalse_WhenNoOperations()
    {
        var sut = new UndoManager(new DatabaseService());

        Assert.False(sut.Undo(TransactionType.Expense));
        Assert.False(sut.Undo(TransactionType.Income));
    }

    [Fact]
    public void Redo_ReturnsFalse_WhenNoOperations()
    {
        var sut = new UndoManager(new DatabaseService());

        Assert.False(sut.Redo(TransactionType.Expense));
        Assert.False(sut.Redo(TransactionType.Income));
    }

    [Fact]
    public void Push_Undo_Redo_RunsInExpectedOrder()
    {
        var sut = new UndoManager(new DatabaseService());
        var history = new List<string>();

        sut.Push(TransactionType.Expense, new TransactionOperation
        {
            Undo = () => history.Add("undo"),
            Redo = () => history.Add("redo")
        });

        Assert.True(sut.Undo(TransactionType.Expense));
        Assert.True(sut.Redo(TransactionType.Expense));
        Assert.Equal(new[] { "undo", "redo" }, history);
    }

    [Fact]
    public void Push_ClearsRedoStack_ForThatTransactionType()
    {
        var sut = new UndoManager(new DatabaseService());

        sut.Push(TransactionType.Expense, new TransactionOperation { Undo = () => { }, Redo = () => { } });
        Assert.True(sut.Undo(TransactionType.Expense));

        sut.Push(TransactionType.Expense, new TransactionOperation { Undo = () => { }, Redo = () => { } });

        Assert.False(sut.Redo(TransactionType.Expense));
    }

    [Fact]
    public void Clear_RemovesUndoAndRedoStacks_ForGivenTypeOnly()
    {
        var sut = new UndoManager(new DatabaseService());

        sut.Push(TransactionType.Expense, new TransactionOperation { Undo = () => { }, Redo = () => { } });
        sut.Push(TransactionType.Income, new TransactionOperation { Undo = () => { }, Redo = () => { } });
        Assert.True(sut.Undo(TransactionType.Expense));

        sut.Clear(TransactionType.Expense);

        Assert.False(sut.Undo(TransactionType.Expense));
        Assert.True(sut.Undo(TransactionType.Income));
    }
}

public class BankStatementParserRegistryBehaviorTests
{
    [Fact]
    public void ListBanks_ReturnsSortedBankIds()
    {
        var sut = new BankStatementParserRegistry(new IBankStatementParser[]
        {
            new FakeParser("Wells Fargo"),
            new FakeParser("American Express")
        });

        Assert.Equal(new[] { "American Express", "Wells Fargo" }, sut.ListBanks().ToArray());
    }

    [Fact]
    public void GetParser_IsCaseInsensitive()
    {
        var expected = new FakeParser("Chase");
        var sut = new BankStatementParserRegistry(new IBankStatementParser[] { expected });

        var parser = sut.GetParser("chase");

        Assert.Same(expected, parser);
    }

    [Fact]
    public void GetParser_ThrowsForUnknownBank()
    {
        var sut = new BankStatementParserRegistry(new[] { new FakeParser("Chase") });

        Assert.Throws<ArgumentException>(() => sut.GetParser("Unknown"));
    }

    private sealed class FakeParser : IBankStatementParser
    {
        public FakeParser(string bankId) => BankId = bankId;
        public string BankId { get; }
        public void ParseStatement(Stream csvStream) { }
    }
}
