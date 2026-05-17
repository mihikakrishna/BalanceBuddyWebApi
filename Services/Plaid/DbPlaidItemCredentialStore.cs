using BalanceBuddyWebApi.Data;
using BalanceBuddyWebApi.Models;
using Microsoft.EntityFrameworkCore;

namespace BalanceBuddyWebApi.Services.Plaid;

public sealed class DbPlaidItemCredentialStore : IPlaidItemCredentialStore
{
    private readonly AppDbContext _context;

    public DbPlaidItemCredentialStore(AppDbContext context)
    {
        _context = context;
    }

    public async Task SaveAsync(PlaidItemCredential credential, CancellationToken cancellationToken)
    {
        var existing = await _context.PlaidItemCredentials
            .SingleOrDefaultAsync(x => x.ItemId == credential.ItemId, cancellationToken);

        if (existing is null)
        {
            _context.PlaidItemCredentials.Add(credential);
        }
        else
        {
            existing.AccessToken = credential.AccessToken;
            existing.StoredAtUtc = credential.StoredAtUtc;
        }

        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task<PlaidItemCredential?> GetByItemIdAsync(string itemId, CancellationToken cancellationToken)
    {
        return await _context.PlaidItemCredentials
            .SingleOrDefaultAsync(x => x.ItemId == itemId, cancellationToken);
    }
}
