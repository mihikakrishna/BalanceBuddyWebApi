using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BalanceBuddyWebApi.Data;
using BalanceBuddyWebApi.Models;

namespace BalanceBuddyWebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ExpenseCategoriesController : ControllerBase
{
    private readonly AppDbContext _context;

    public ExpenseCategoriesController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ExpenseCategory>>> GetCategories()
    {
        return await _context.ExpenseCategories.ToListAsync();
    }

    [HttpPost]
    public async Task<ActionResult<ExpenseCategory>> PostCategory(ExpenseCategory category)
    {
        _context.ExpenseCategories.Add(category);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetCategories), new { id = category.Id }, category);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCategory(int id)
    {
        var category = await _context.ExpenseCategories.FindAsync(id);
        if (category == null || category.Name == "Unreviewed")
            return BadRequest("Cannot delete default or missing category");

        _context.ExpenseCategories.Remove(category);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
