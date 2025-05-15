using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BalanceBuddyWebApi.Data;
using BalanceBuddyWebApi.Models;

namespace BalanceBuddyWebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class IncomesController : ControllerBase
{
    private readonly AppDbContext _context;

    public IncomesController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Income>>> GetIncomes()
    {
        return await _context.Incomes
            .Include(i => i.Category)
            .OrderByDescending(i => i.Date)
            .ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Income>> GetIncome(int id)
    {
        var income = await _context.Incomes
            .Include(i => i.Category)
            .FirstOrDefaultAsync(i => i.Id == id);

        if (income == null)
            return NotFound();

        return income;
    }

    [HttpPost]
    public async Task<ActionResult<Income>> PostIncome(Income income)
    {
        // Default to "Unreviewed" if CategoryId is invalid
        if (!_context.IncomeCategories.Any(c => c.Id == income.CategoryId))
        {
            income.CategoryId = _context.IncomeCategories
                .FirstOrDefault(c => c.Name == "Unreviewed")?.Id ?? 0;
        }

        _context.Incomes.Add(income);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetIncome), new { id = income.Id }, income);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteIncome(int id)
    {
        var income = await _context.Incomes.FindAsync(id);
        if (income == null)
            return NotFound();

        _context.Incomes.Remove(income);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
