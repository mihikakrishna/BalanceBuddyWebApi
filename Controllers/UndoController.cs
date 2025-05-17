using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
public class UndoController : ControllerBase
{
    private readonly UndoManager _undo;

    public UndoController(UndoManager undo)
    {
        _undo = undo;
    }

    [HttpPost("undo/{type}")]
    public IActionResult Undo(TransactionType type)
    {
        bool success = _undo.Undo(type);
        return success ? Ok("Undo complete.") : NoContent();
    }

    [HttpPost("redo/{type}")]
    public IActionResult Redo(TransactionType type)
    {
        bool success = _undo.Redo(type);
        return success ? Ok("Redo complete.") : NoContent();
    }
}
