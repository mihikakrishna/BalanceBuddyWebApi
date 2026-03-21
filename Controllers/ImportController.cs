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

        try
        {
            var parser = _registry.GetParser(bankId);
            using var stream = file.OpenReadStream();
            parser.ParseStatement(stream);
        }
        catch (Exception ex)
        {
            // Log the error
            Console.Error.WriteLine($"Parsing error: {ex.Message}");
            return BadRequest("Unable to parse the file. Please make sure you selected the correct bank format.");
        }

        return Ok("Statement imported.");
    }


    [HttpGet("banks")]
    public IActionResult GetSupportedBanks()
    {
        return Ok(_registry.ListBanks());
    }
}
