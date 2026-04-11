using BalanceBuddyWebApi.Models;
using BalanceBuddyWebApi.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BalanceBuddyWebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CreditCardsController : ControllerBase
{
    private readonly DatabaseService _dbSvc;
    private readonly UndoManager _undo;

    public CreditCardsController(DatabaseService dbSvc, UndoManager undo)
    {
        _dbSvc = dbSvc;
        _undo = undo;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<CreditCard>>> GetCreditCards()
    {
        await using var ctx = _dbSvc.CreateDbContext();
        return await ctx.CreditCards
            .OrderBy(c => c.IsClosed)
            .ThenByDescending(c => c.OpenedDate)
            .ThenBy(c => c.CardName)
            .ToListAsync();
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<CreditCard>> GetCreditCard(int id)
    {
        await using var ctx = _dbSvc.CreateDbContext();
        var card = await ctx.CreditCards.FindAsync(id);
        return card is null ? NotFound() : card;
    }

    [HttpPost]
    public async Task<ActionResult<CreditCard>> PostCreditCard(CreditCard creditCard)
    {
        if (!IsValid(creditCard, out var error))
            return BadRequest(error);

        await using var ctx = _dbSvc.CreateDbContext();
        ctx.CreditCards.Add(creditCard);
        await ctx.SaveChangesAsync();
        int newId = creditCard.Id;

        _undo.Push(TransactionType.CreditCard, new TransactionOperation
        {
            Undo = () =>
            {
                using var uCtx = _dbSvc.CreateDbContext();
                var existing = uCtx.CreditCards.Find(newId);
                if (existing != null)
                {
                    uCtx.CreditCards.Remove(existing);
                    uCtx.SaveChanges();
                }
            },
            Redo = () =>
            {
                using var rCtx = _dbSvc.CreateDbContext();
                rCtx.CreditCards.Add(creditCard);
                rCtx.SaveChanges();
            }
        });

        return CreatedAtAction(nameof(GetCreditCard), new { id = newId }, creditCard);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> PutCreditCard(int id, CreditCard updated)
    {
        if (id != updated.Id) return BadRequest("ID mismatch");
        if (!IsValid(updated, out var error))
            return BadRequest(error);

        await using var ctx = _dbSvc.CreateDbContext();
        var original = await ctx.CreditCards.AsNoTracking().FirstOrDefaultAsync(c => c.Id == id);
        if (original == null) return NotFound();

        ctx.Entry(updated).State = EntityState.Modified;
        await ctx.SaveChangesAsync();

        _undo.Push(TransactionType.CreditCard, new TransactionOperation
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
    public async Task<IActionResult> DeleteCreditCard(int id)
    {
        await using var ctx = _dbSvc.CreateDbContext();
        var card = await ctx.CreditCards.FindAsync(id);
        if (card == null) return NotFound();

        ctx.CreditCards.Remove(card);
        await ctx.SaveChangesAsync();

        _undo.Push(TransactionType.CreditCard, new TransactionOperation
        {
            Undo = () =>
            {
                using var uCtx = _dbSvc.CreateDbContext();
                uCtx.CreditCards.Add(card);
                uCtx.SaveChanges();
            },
            Redo = () =>
            {
                using var rCtx = _dbSvc.CreateDbContext();
                var victim = rCtx.CreditCards.Find(id);
                if (victim != null)
                {
                    rCtx.CreditCards.Remove(victim);
                    rCtx.SaveChanges();
                }
            }
        });

        return NoContent();
    }

    private static bool IsValid(CreditCard card, out string? error)
    {
        if (string.IsNullOrWhiteSpace(card.CardName))
        {
            error = "CardName is required.";
            return false;
        }

        if (string.IsNullOrWhiteSpace(card.Issuer))
        {
            error = "Issuer is required.";
            return false;
        }

        if (card.OpenedDate == default)
        {
            error = "OpenedDate is required.";
            return false;
        }

        if (card.IsClosed && card.ClosedDate is null)
        {
            error = "ClosedDate is required when IsClosed is true.";
            return false;
        }

        if (!card.IsClosed)
        {
            card.ClosedDate = null;
        }

        error = null;
        return true;
    }
}
