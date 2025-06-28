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

        var exists = await ctx.IncomeCategories
            .AnyAsync(c => c.Name.ToLower() == category.Name.ToLower());
        if (exists)
            return Conflict("A category with that name already exists.");

        ctx.IncomeCategories.Add(category);
        await ctx.SaveChangesAsync();
        return CreatedAtAction(nameof(GetCategories), new { id = category.Id }, category);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> PutCategory(int id, IncomeCategory updated)
    {
        if (id != updated.Id)
            return BadRequest("ID mismatch");

        await using var ctx = _dbSvc.CreateDbContext();

        var existing = await ctx.IncomeCategories.FindAsync(id);
        if (existing == null)
            return NotFound();

        if (existing.Name == "Unreviewed")
            return BadRequest("Cannot edit the default 'Unreviewed' category.");

        var conflict = await ctx.IncomeCategories
            .AnyAsync(c => c.Id != id && c.Name.ToLower() == updated.Name.ToLower());
        if (conflict)
            return Conflict("A category with that name already exists.");

        existing.Name = updated.Name;

        await ctx.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteCategory(int id)
    {
        await using var ctx = _dbSvc.CreateDbContext();
        var category = await ctx.IncomeCategories.FindAsync(id);

        if (category == null || category.Name == "Unreviewed")
            return BadRequest("Cannot delete default or missing category");

        var isUsed = await ctx.Incomes.AnyAsync(i => i.CategoryId == id);
        if (isUsed)
            return Conflict("Cannot delete category because it is in use.");

        ctx.IncomeCategories.Remove(category);
        await ctx.SaveChangesAsync();
        return NoContent();
    }
}
