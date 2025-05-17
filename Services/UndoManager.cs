using BalanceBuddyWebApi.Services;

public enum TransactionType
{
    Expense,
    Income
}

public class TransactionOperation
{
    public Action Undo { get; set; } = default!;
    public Action Redo { get; set; } = default!;
}

public class UndoManager
{
    private readonly Dictionary<TransactionType, Stack<TransactionOperation>> _undoStacks = new();
    private readonly Dictionary<TransactionType, Stack<TransactionOperation>> _redoStacks = new();
    private readonly DatabaseService _dbSvc;

    public UndoManager(DatabaseService dbSvc)
    {
        _dbSvc = dbSvc;
        foreach (TransactionType type in Enum.GetValues(typeof(TransactionType)))
        {
            _undoStacks[type] = new();
            _redoStacks[type] = new();
        }
    }

    public void Push(TransactionType type, TransactionOperation op)
    {
        _undoStacks[type].Push(op);
        _redoStacks[type].Clear();
    }

    public bool Undo(TransactionType type)
    {
        if (_undoStacks.TryGetValue(type, out var stack) && stack.TryPop(out var op))
        {
            op.Undo();
            _redoStacks[type].Push(op);
            return true;
        }
        return false;
    }

    public bool Redo(TransactionType type)
    {
        if (_redoStacks.TryGetValue(type, out var stack) && stack.TryPop(out var op))
        {
            op.Redo();
            _undoStacks[type].Push(op);
            return true;
        }
        return false;
    }

    public void Clear(TransactionType type)
    {
        _undoStacks[type].Clear();
        _redoStacks[type].Clear();
    }
}
