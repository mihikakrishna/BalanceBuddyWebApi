using BalanceBuddyWebApi.Data;
using BalanceBuddyWebApi.Models;
using BalanceBuddyWebApi.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BalanceBuddyWebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class IncomesController : ControllerBase
{
    private readonly DatabaseService _dbSvc;
    private readonly UndoManager _undo;

    public IncomesController(DatabaseService dbSvc, UndoManager undo)
    {
        _dbSvc = dbSvc;
        _undo = undo;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Income>>> GetIncomes()
    {
        await using var ctx = _dbSvc.CreateDbContext();
        return await ctx.Incomes.Include(i => i.Category).OrderByDescending(i => i.Date).ToListAsync();
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<Income>> GetIncome(int id)
    {
        await using var ctx = _dbSvc.CreateDbContext();
        var inc = await ctx.Incomes.Include(i => i.Category).FirstOrDefaultAsync(i => i.Id == id);
        return inc is null ? NotFound() : inc;
    }

    [HttpPost]
    public async Task<ActionResult<Income>> PostIncome(Income income)
    {
        await using var ctx = _dbSvc.CreateDbContext();
        if (!ctx.IncomeCategories.Any(c => c.Id == income.CategoryId))
        {
            income.CategoryId = ctx.IncomeCategories.First(c => c.Name == "Unreviewed").Id;
        }

        ctx.Incomes.Add(income);
        await ctx.SaveChangesAsync();
        int newId = income.Id;

        _undo.Push(TransactionType.Income, new TransactionOperation
        {
            Undo = () =>
            {
                using var uCtx = _dbSvc.CreateDbContext();
                var existing = uCtx.Incomes.Find(newId);
                if (existing != null)
                {
                    uCtx.Incomes.Remove(existing);
                    uCtx.SaveChanges();
                }
            },
            Redo = () =>
            {
                using var rCtx = _dbSvc.CreateDbContext();
                rCtx.Incomes.Add(income);
                rCtx.SaveChanges();
            }
        });

        return CreatedAtAction(nameof(GetIncome), new { id = newId }, income);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> PutIncome(int id, Income updated)
    {
        if (id != updated.Id) return BadRequest("ID mismatch");

        await using var ctx = _dbSvc.CreateDbContext();
        var original = await ctx.Incomes.AsNoTracking().FirstOrDefaultAsync(i => i.Id == id);
        if (original == null) return NotFound();

        ctx.Entry(updated).State = EntityState.Modified;
        await ctx.SaveChangesAsync();

        _undo.Push(TransactionType.Income, new TransactionOperation
        {
            Undo = () =>
            {
                using var uCtx = _dbSvc.CreateDbContext();
                uCtx.Entry(original).State = EntityState.Modified;
                uCtx.SaveChanges();
            },
            Redo = () =>
            {
                using var rCtx = _dbSvc.CreateDbContext();
                rCtx.Entry(updated).State = EntityState.Modified;
                rCtx.SaveChanges();
            }
        });

        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteIncome(int id)
    {
        await using var ctx = _dbSvc.CreateDbContext();
        var inc = await ctx.Incomes.Include(i => i.Category).FirstOrDefaultAsync(i => i.Id == id);
        if (inc == null) return NotFound();

        ctx.Incomes.Remove(inc);
        await ctx.SaveChangesAsync();

        _undo.Push(TransactionType.Income, new TransactionOperation
        {
            Undo = () =>
            {
                using var uCtx = _dbSvc.CreateDbContext();
                inc.Category = null;
                uCtx.Incomes.Add(inc);
                uCtx.SaveChanges();
            },
            Redo = () =>
            {
                using var rCtx = _dbSvc.CreateDbContext();
                var victim = rCtx.Incomes.Find(id);
                if (victim != null)
                {
                    rCtx.Incomes.Remove(victim);
                    rCtx.SaveChanges();
                }
            }
        });

        return NoContent();
    }
}
