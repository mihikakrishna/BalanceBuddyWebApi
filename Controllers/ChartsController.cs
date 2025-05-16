using BalanceBuddyWebApi.Services;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/charts")]
public class ChartsController : ControllerBase
{
    private readonly DatabaseService _db;
    public ChartsController(DatabaseService db) => _db = db;

    [HttpGet("bankbalances")]
    public IActionResult BankBalances()
    {
        using var ctx = _db.CreateDbContext();
        return Ok(ctx.BankAccounts.Select(a => new { a.Name, a.Balance }));
    }

    [HttpGet("expense-budget")]
    public IActionResult ExpenseBudget(int year)
    {
        using var ctx = _db.CreateDbContext();
        var cats = ctx.ExpenseCategories.OrderBy(c => c.Id).ToList();
        var values = cats.Select(cat =>
            Enumerable.Range(1, 12).Select(m =>
            {
                var spent = ctx.Expenses.Where(e =>
                     e.CategoryId == cat.Id &&
                     e.Date.Year == year &&
                     e.Date.Month == m).Sum(e => e.Amount);

                return cat.Budget is { } b && b > 0
                       ? Math.Min(1, (double)(spent / b))   // pct 0-1
                       : 0;
            }).ToArray()).ToArray();

        return Ok(new { categories = cats.Select(c => c.Name), values });
    }

    [HttpGet("expenses-by-category")]
    public IActionResult ExpensesByCategory(int year, int month)
    {
        using var ctx = _db.CreateDbContext();
        var data = ctx.Expenses
                      .Where(e => e.Date.Year == year && e.Date.Month == month)
                      .GroupBy(e => e.Category!.Name)
                      .Select(g => new { category = g.Key, total = g.Sum(e => e.Amount) })
                      .ToList();
        return Ok(data);
    }

    [HttpGet("monthly-stack")]
    public IActionResult MonthlyStack(int year)
    {
        using var ctx = _db.CreateDbContext();
        double[] income = new double[12];
        double[] expense = new double[12];

        foreach (var m in Enumerable.Range(1, 12))
        {
            income[m - 1] = (double)ctx.Incomes
                               .Where(i => i.Date.Year == year && i.Date.Month == m)
                               .Sum(i => i.Amount);
            expense[m - 1] = (double)ctx.Expenses
                               .Where(e => e.Date.Year == year && e.Date.Month == m)
                               .Sum(e => e.Amount);
        }
        return Ok(new { income, expenses = expense });
    }
}
