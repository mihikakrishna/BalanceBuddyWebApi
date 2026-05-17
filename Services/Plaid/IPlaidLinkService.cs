namespace BalanceBuddyWebApi.Services.Plaid;

public interface IPlaidLinkService
{
    Task<PlaidLinkTokenResult> CreateLinkTokenAsync(PlaidCreateLinkTokenCommand command, CancellationToken cancellationToken);
    Task<PlaidExchangePublicTokenResult> ExchangePublicTokenAsync(PlaidExchangePublicTokenCommand command, CancellationToken cancellationToken);
}
