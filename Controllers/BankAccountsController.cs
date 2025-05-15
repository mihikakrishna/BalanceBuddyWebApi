using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BalanceBuddyWebApi.Data;
using BalanceBuddyWebApi.Models;

namespace BalanceBuddyWebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BankAccountsController : ControllerBase
{
    private readonly AppDbContext _context;

    public BankAccountsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<BankAccount>>> GetBankAccounts()
    {
        return await _context.BankAccounts
            .OrderByDescending(b => b.Balance)
            .ToListAsync();
    }

    [HttpPost]
    public async Task<ActionResult<BankAccount>> PostBankAccount(BankAccount bankAccount)
    {
        _context.BankAccounts.Add(bankAccount);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetBankAccounts), new { id = bankAccount.Id }, bankAccount);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteBankAccount(int id)
    {
        var account = await _context.BankAccounts.FindAsync(id);
        if (account == null)
            return NotFound();

        _context.BankAccounts.Remove(account);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
