namespace BalanceBuddyWebApi.Services.Plaid;

public interface IPlaidApiClient
{
    Task<PlaidLinkTokenApiResponse> CreateLinkTokenAsync(PlaidCreateLinkTokenApiRequest request, CancellationToken cancellationToken);
    Task<PlaidExchangePublicTokenApiResponse> ExchangePublicTokenAsync(PlaidExchangePublicTokenApiRequest request, CancellationToken cancellationToken);
}
