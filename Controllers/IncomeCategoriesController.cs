using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BalanceBuddyWebApi.Data;
using BalanceBuddyWebApi.Models;

namespace BalanceBuddyWebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class IncomeCategoriesController : ControllerBase
{
    private readonly AppDbContext _context;

    public IncomeCategoriesController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<IncomeCategory>>> GetCategories()
    {
        return await _context.IncomeCategories.ToListAsync();
    }

    [HttpPost]
    public async Task<ActionResult<IncomeCategory>> PostCategory(IncomeCategory category)
    {
        _context.IncomeCategories.Add(category);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetCategories), new { id = category.Id }, category);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCategory(int id)
    {
        var category = await _context.IncomeCategories.FindAsync(id);
        if (category == null || category.Name == "Unreviewed")
            return BadRequest("Cannot delete default or missing category");

        _context.IncomeCategories.Remove(category);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
