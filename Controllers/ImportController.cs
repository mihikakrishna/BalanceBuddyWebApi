using Microsoft.AspNetCore.Mvc;
using BalanceBuddyWebApi.Services.Parsers;

namespace BalanceBuddyWebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ImportController : ControllerBase
{
    private readonly BankStatementParserRegistry _registry;

    public ImportController(BankStatementParserRegistry registry)
    {
        _registry = registry;
    }

    [HttpPost]
    public IActionResult Import([FromForm] IFormFile file, [FromForm] string bankId)
    {
        if (file == null || file.Length == 0)
            return BadRequest("CSV file required.");
        if (string.IsNullOrWhiteSpace(bankId))
            return BadRequest("bankId is required.");

        var parser = _registry.GetParser(bankId);
        using var stream = file.OpenReadStream();
        parser.ParseStatement(stream);

        return Ok("Statement imported.");
    }

    [HttpGet("banks")]
    public IActionResult GetSupportedBanks()
    {
        return Ok(_registry.ListBanks());
    }
}
