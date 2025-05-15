using BalanceBuddyWebApi.Models;

namespace BalanceBuddyWebApi.Services;

public class TransactionOperation
{
    public Action Undo { get; set; } = default!;
    public Action Redo { get; set; } = default!;
}

public class UndoManager
{
    private readonly Stack<TransactionOperation> _undoStack = new();
    private readonly Stack<TransactionOperation> _redoStack = new();

    public void Push(TransactionOperation op)
    {
        _undoStack.Push(op);
        _redoStack.Clear();
    }

    public void Undo()
    {
        if (_undoStack.TryPop(out var op))
        {
            op.Undo();
            _redoStack.Push(op);
        }
    }

    public void Redo()
    {
        if (_redoStack.TryPop(out var op))
        {
            op.Redo();
            _undoStack.Push(op);
        }
    }

    public void Clear()
    {
        _undoStack.Clear();
        _redoStack.Clear();
    }
}
