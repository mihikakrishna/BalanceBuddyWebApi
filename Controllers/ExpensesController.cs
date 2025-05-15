using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BalanceBuddyWebApi.Data;
using BalanceBuddyWebApi.Models;
using BalanceBuddyWebApi.Services;

namespace BalanceBuddyWebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ExpensesController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly UndoManager _undo;
    private readonly IDbContextFactory<AppDbContext> _contextFactory;

    public ExpensesController(AppDbContext context, UndoManager undo, IDbContextFactory<AppDbContext> contextFactory)
    {
        _context = context;
        _undo = undo;
        _contextFactory = contextFactory;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Expense>>> GetExpenses()
    {
        return await _context.Expenses
            .Include(e => e.Category)
            .OrderByDescending(e => e.Date)
            .ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Expense>> GetExpense(int id)
    {
        var expense = await _context.Expenses
            .Include(e => e.Category)
            .FirstOrDefaultAsync(e => e.Id == id);

        if (expense == null)
            return NotFound();

        return expense;
    }

    [HttpPost]
    public async Task<ActionResult<Expense>> PostExpense(Expense expense)
    {
        if (!_context.ExpenseCategories.Any(c => c.Id == expense.CategoryId))
        {
            expense.CategoryId = _context.ExpenseCategories
                .FirstOrDefault(c => c.Name == "Unreviewed")?.Id ?? 0;
        }

        _context.Expenses.Add(expense);
        await _context.SaveChangesAsync();

        int newId = expense.Id;

        _undo.Push(new TransactionOperation
        {
            Undo = () =>
            {
                using var ctx = _contextFactory.CreateDbContext();
                var existing = ctx.Expenses.Find(newId);
                if (existing != null)
                {
                    ctx.Expenses.Remove(existing);
                    ctx.SaveChanges();
                }
            },
            Redo = () =>
            {
                using var ctx = _contextFactory.CreateDbContext();
                ctx.Expenses.Add(expense);
                ctx.SaveChanges();
            }
        });

        return CreatedAtAction(nameof(GetExpense), new { id = expense.Id }, expense);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> PutExpense(int id, Expense updatedExpense)
    {
        if (id != updatedExpense.Id)
        {
            return BadRequest("Expense ID mismatch.");
        }

        var existing = await _context.Expenses.AsNoTracking().FirstOrDefaultAsync(e => e.Id == id);
        if (existing == null)
        {
            return NotFound();
        }

        var originalExpense = new Expense
        {
            Id = existing.Id,
            Amount = existing.Amount,
            Date = existing.Date,
            Description = existing.Description,
            CategoryId = existing.CategoryId,
            BankIconPath = existing.BankIconPath
        };

        _context.Entry(updatedExpense).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!_context.Expenses.Any(e => e.Id == id))
                return NotFound();
            else
                throw;
        }

        _undo.Push(new TransactionOperation
        {
            Undo = () =>
            {
                using var ctx = _contextFactory.CreateDbContext();
                ctx.Entry(originalExpense).State = EntityState.Modified;
                ctx.SaveChanges();
            },
            Redo = () =>
            {
                using var ctx = _contextFactory.CreateDbContext();
                ctx.Entry(updatedExpense).State = EntityState.Modified;
                ctx.SaveChanges();
            }
        });

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteExpense(int id)
    {
        var expense = await _context.Expenses
            .Include(e => e.Category)
            .FirstOrDefaultAsync(e => e.Id == id);

        if (expense == null)
            return NotFound();

        _context.Expenses.Remove(expense);
        await _context.SaveChangesAsync();

        _undo.Push(new TransactionOperation
        {
            Undo = () =>
            {
                using var ctx = _contextFactory.CreateDbContext();

                // Set category to null, just use FK
                expense.Category = null;

                ctx.Expenses.Add(expense);
                ctx.SaveChanges();
            },
            Redo = () =>
            {
                using var ctx = _contextFactory.CreateDbContext();
                var toDelete = ctx.Expenses.Find(id);
                if (toDelete != null)
                {
                    ctx.Expenses.Remove(toDelete);
                    ctx.SaveChanges();
                }
            }
        });

        return NoContent();
    }
}
