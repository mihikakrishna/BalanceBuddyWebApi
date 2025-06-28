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
        var exists = await _context.ExpenseCategories
            .AnyAsync(c => c.Name.ToLower() == category.Name.ToLower());
        if (exists)
            return Conflict("A category with that name already exists.");

        _context.ExpenseCategories.Add(category);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetCategories), new { id = category.Id }, category);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> PutCategory(int id, ExpenseCategory updated)
    {
        if (id != updated.Id) return BadRequest("ID mismatch");

        var existing = await _context.ExpenseCategories.FindAsync(id);
        if (existing == null)
            return NotFound();

        if (existing.Name == "Unreviewed")
            return BadRequest("Cannot edit the default 'Unreviewed' category.");

        var nameConflict = await _context.ExpenseCategories
            .AnyAsync(c => c.Id != id && c.Name.ToLower() == updated.Name.ToLower());
        if (nameConflict)
            return Conflict("A category with that name already exists.");

        existing.Name = updated.Name;
        existing.Budget = updated.Budget;

        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCategory(int id)
    {
        var category = await _context.ExpenseCategories.FindAsync(id);
        if (category == null || category.Name == "Unreviewed")
            return BadRequest("Cannot delete default or missing category");

        var isUsed = await _context.Expenses.AnyAsync(e => e.CategoryId == id);
        if (isUsed)
            return Conflict("Cannot delete category because it is in use.");

        _context.ExpenseCategories.Remove(category);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
