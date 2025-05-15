using Microsoft.AspNetCore.Mvc;
using BalanceBuddyWebApi.Services;

namespace BalanceBuddyWebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UndoController : ControllerBase
{
    private readonly UndoManager _undo;

    public UndoController(UndoManager undo)
    {
        _undo = undo;
    }

    [HttpPost("undo")]
    public IActionResult Undo()
    {
        _undo.Undo();
        return Ok("Undo complete.");
    }

    [HttpPost("redo")]
    public IActionResult Redo()
    {
        _undo.Redo();
        return Ok("Redo complete.");
    }
}
