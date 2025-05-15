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

    public ExpensesController(AppDbContext context, UndoManager undo)
    {
        _context = context;
        _undo = undo;
    }

    // GET: api/expenses
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Expense>>> GetExpenses()
    {
        return await _context.Expenses
            .Include(e => e.Category)
            .OrderByDescending(e => e.Date)
            .ToListAsync();
    }

    // GET: api/expenses/5
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

    // POST: api/expenses
    [HttpPost]
    public async Task<ActionResult<Expense>> PostExpense(Expense expense)
    {
        // Assign default category if invalid
        if (!_context.ExpenseCategories.Any(c => c.Id == expense.CategoryId))
        {
            expense.CategoryId = _context.ExpenseCategories
                .FirstOrDefault(c => c.Name == "Unreviewed")?.Id ?? 0;
        }

        _context.Expenses.Add(expense);
        await _context.SaveChangesAsync();

        // Capture ID to reuse for undo
        int newId = expense.Id;

        _undo.Push(new TransactionOperation
        {
            Undo = () =>
            {
                var existing = _context.Expenses.Find(newId);
                if (existing != null)
                {
                    _context.Expenses.Remove(existing);
                    _context.SaveChanges();
                }
            },
            Redo = () =>
            {
                _context.Expenses.Add(expense);
                _context.SaveChanges();
            }
        });

        return CreatedAtAction(nameof(GetExpense), new { id = expense.Id }, expense);
    }


    // DELETE: api/expenses/5
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
                _context.Expenses.Add(expense);
                _context.SaveChanges();
            },
            Redo = () =>
            {
                var toDelete = _context.Expenses.Find(id);
                if (toDelete != null)
                {
                    _context.Expenses.Remove(toDelete);
                    _context.SaveChanges();
                }
            }
        });

        return NoContent();
    }

}
