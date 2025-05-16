using BalanceBuddyWebApi.Data;
using BalanceBuddyWebApi.Models;
using BalanceBuddyWebApi.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BalanceBuddyWebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ExpensesController : ControllerBase
{
    private readonly DatabaseService _dbSvc;
    private readonly UndoManager _undo;

    public ExpensesController(DatabaseService dbSvc, UndoManager undo)
    {
        _dbSvc = dbSvc;
        _undo = undo;
    }

    /* ───────────────────────── READ ───────────────────────── */

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Expense>>> GetExpenses()
    {
        await using var ctx = _dbSvc.CreateDbContext();
        var list = await ctx.Expenses
                            .Include(e => e.Category)
                            .OrderByDescending(e => e.Date)
                            .ToListAsync();
        return list;
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<Expense>> GetExpense(int id)
    {
        await using var ctx = _dbSvc.CreateDbContext();
        var exp = await ctx.Expenses.Include(e => e.Category)
                                    .FirstOrDefaultAsync(e => e.Id == id);
        return exp is null ? NotFound() : exp;
    }

    /* ───────────────────────── CREATE ───────────────────────── */

    [HttpPost]
    public async Task<ActionResult<Expense>> PostExpense(Expense expense)
    {
        await using var ctx = _dbSvc.CreateDbContext();

        if (!ctx.ExpenseCategories.Any(c => c.Id == expense.CategoryId))
        {
            expense.CategoryId = ctx.ExpenseCategories
                                    .First(c => c.Name == "Unreviewed").Id;
        }

        ctx.Expenses.Add(expense);
        await ctx.SaveChangesAsync();
        int newId = expense.Id;

        _undo.Push(new TransactionOperation
        {
            Undo = () =>
            {
                using var uCtx = _dbSvc.CreateDbContext();
                var existing = uCtx.Expenses.Find(newId);
                if (existing != null)
                {
                    uCtx.Expenses.Remove(existing);
                    uCtx.SaveChanges();
                }
            },
            Redo = () =>
            {
                using var rCtx = _dbSvc.CreateDbContext();
                rCtx.Expenses.Add(expense);
                rCtx.SaveChanges();
            }
        });

        return CreatedAtAction(nameof(GetExpense), new { id = newId }, expense);
    }

    /* ───────────────────────── UPDATE ───────────────────────── */

    [HttpPut("{id:int}")]
    public async Task<IActionResult> PutExpense(int id, Expense updated)
    {
        if (id != updated.Id) return BadRequest("ID mismatch");

        await using var ctx = _dbSvc.CreateDbContext();
        var original = await ctx.Expenses.AsNoTracking()
                                         .FirstOrDefaultAsync(e => e.Id == id);
        if (original == null) return NotFound();

        ctx.Entry(updated).State = EntityState.Modified;
        await ctx.SaveChangesAsync();

        _undo.Push(new TransactionOperation
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

    /* ───────────────────────── DELETE ───────────────────────── */

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteExpense(int id)
    {
        await using var ctx = _dbSvc.CreateDbContext();
        var exp = await ctx.Expenses.Include(e => e.Category)
                                    .FirstOrDefaultAsync(e => e.Id == id);
        if (exp == null) return NotFound();

        ctx.Expenses.Remove(exp);
        await ctx.SaveChangesAsync();

        _undo.Push(new TransactionOperation
        {
            Undo = () =>
            {
                using var uCtx = _dbSvc.CreateDbContext();
                exp.Category = null;
                uCtx.Expenses.Add(exp);
                uCtx.SaveChanges();
            },
            Redo = () =>
            {
                using var rCtx = _dbSvc.CreateDbContext();
                var victim = rCtx.Expenses.Find(id);
                if (victim != null)
                {
                    rCtx.Expenses.Remove(victim);
                    rCtx.SaveChanges();
                }
            }
        });

        return NoContent();
    }
}
