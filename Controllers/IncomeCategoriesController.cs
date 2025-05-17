using BalanceBuddyWebApi.Models;
using BalanceBuddyWebApi.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BalanceBuddyWebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class IncomeCategoriesController : ControllerBase
{
    private readonly DatabaseService _dbSvc;

    public IncomeCategoriesController(DatabaseService dbSvc)
    {
        _dbSvc = dbSvc;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<IncomeCategory>>> GetCategories()
    {
        await using var ctx = _dbSvc.CreateDbContext();
        return await ctx.IncomeCategories.ToListAsync();
    }

    [HttpPost]
    public async Task<ActionResult<IncomeCategory>> PostCategory(IncomeCategory category)
    {
        await using var ctx = _dbSvc.CreateDbContext();
        ctx.IncomeCategories.Add(category);
        await ctx.SaveChangesAsync();
        return CreatedAtAction(nameof(GetCategories), new { id = category.Id }, category);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> PutCategory(int id, IncomeCategory updated)
    {
        if (id != updated.Id) return BadRequest("ID mismatch");

        await using var ctx = _dbSvc.CreateDbContext();

        var exists = await ctx.IncomeCategories
            .AnyAsync(c => c.Id != id && c.Name.ToLower() == updated.Name.ToLower());
        if (exists)
            return Conflict("A category with that name already exists.");

        ctx.Entry(updated).State = EntityState.Modified;

        try
        {
            await ctx.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!ctx.IncomeCategories.Any(e => e.Id == id))
                return NotFound();
            else throw;
        }

        return NoContent();
    }


    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteCategory(int id)
    {
        await using var ctx = _dbSvc.CreateDbContext();
        var category = await ctx.IncomeCategories.FindAsync(id);
        if (category == null || category.Name == "Unreviewed")
            return BadRequest("Cannot delete default or missing category");

        ctx.IncomeCategories.Remove(category);
        await ctx.SaveChangesAsync();
        return NoContent();
    }
}
