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

    [HttpPut("{id}")]
    public async Task<IActionResult> PutCategory(int id, ExpenseCategory updated)
    {
        if (id != updated.Id) return BadRequest("ID mismatch");

        var exists = await _context.ExpenseCategories.AnyAsync(c =>
            c.Id != id && c.Name.ToLower() == updated.Name.ToLower());
        if (exists) return Conflict("A category with that name already exists.");

        _context.Entry(updated).State = EntityState.Modified;
        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!_context.ExpenseCategories.Any(e => e.Id == id))
                return NotFound();
            else throw;
        }

        return NoContent();
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
