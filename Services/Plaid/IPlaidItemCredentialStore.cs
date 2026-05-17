using BalanceBuddyWebApi.Models;

namespace BalanceBuddyWebApi.Services.Plaid;

public interface IPlaidItemCredentialStore
{
    Task SaveAsync(PlaidItemCredential credential, CancellationToken cancellationToken);
    Task<PlaidItemCredential?> GetByItemIdAsync(string itemId, CancellationToken cancellationToken);
}
