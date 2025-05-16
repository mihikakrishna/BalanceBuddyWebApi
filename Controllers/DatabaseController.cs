using BalanceBuddyWebApi.Services;
using Microsoft.AspNetCore.Mvc;

namespace BalanceBuddyWebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DatabaseController : ControllerBase
{
    private readonly DatabaseService _svc;
    private readonly IWebHostEnvironment _env;

    public DatabaseController(DatabaseService svc, IWebHostEnvironment env)
    {
        _svc = svc;
        _env = env;
    }

    private string DataFolder => Path.Combine(_env.ContentRootPath, "Data");

    /* ───── list current and available files ───── */
    [HttpGet("current")]
    public ActionResult<string> Current() => Ok(_svc.CurrentFileName);

    [HttpGet("list")]
    public ActionResult<IEnumerable<string>> List()
        => Ok(Directory.GetFiles(DataFolder, "*.db").Select(Path.GetFileName));

    /* ───── switch to existing file ───── */
    [HttpPost("switch")]
    public IActionResult Switch([FromBody] FileRequest req)
    {
        var path = Path.Combine(DataFolder, req.FileName);
        _svc.OpenExisting(path);                    // migrate + seed inside
        return NoContent();
    }

    /* ───── upload new file & switch ───── */
    [HttpPost("upload")]
    public async Task<IActionResult> Upload(IFormFile file)
    {
        if (file is null || Path.GetExtension(file.FileName) != ".db")
            return BadRequest("Upload a .db file");

        var savePath = Path.Combine(DataFolder, Path.GetFileName(file.FileName));
        await using (var stream = System.IO.File.Create(savePath))
            await file.CopyToAsync(stream);

        _svc.OpenExisting(savePath);
        return CreatedAtAction(nameof(Current), new { }, file.FileName);
    }

    /* ───── create brand-new db and switch ───── */
    [HttpPost("create")]
    public IActionResult Create([FromBody] FileRequest req)
    {
        var path = Path.Combine(DataFolder, req.FileName);
        _svc.CreateNew(path);
        return CreatedAtAction(nameof(Current), new { }, req.FileName);
    }

    /* ───── export current db to downloads folder ───── */
    [HttpGet("export")]
    public IActionResult Export([FromQuery] string fileName = "balancebuddy_export.db")
    {
        if (!_svc.HasOpenDatabase) return BadRequest("No DB to export.");

        var tmp = Path.Combine(Path.GetTempPath(), fileName);
        _svc.ExportTo(tmp);
        return PhysicalFile(tmp, "application/octet-stream", fileName);
    }

    public record FileRequest(string FileName);
}
