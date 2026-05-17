using BalanceBuddyWebApi.Models;
using Microsoft.Extensions.Options;

namespace BalanceBuddyWebApi.Services.Plaid;

public sealed class PlaidLinkService : IPlaidLinkService
{
    private readonly IPlaidApiClient _apiClient;
    private readonly PlaidSettings _options;
    private readonly IPlaidItemCredentialStore _credentialStore;
    private readonly ILogger<PlaidLinkService> _logger;

    public PlaidLinkService(
        IPlaidApiClient apiClient,
        IOptions<PlaidSettings> options,
        IPlaidItemCredentialStore credentialStore,
        ILogger<PlaidLinkService> logger)
    {
        _apiClient = apiClient;
        _options = options.Value;
        _credentialStore = credentialStore;
        _logger = logger;
    }

    public async Task<PlaidLinkTokenResult> CreateLinkTokenAsync(PlaidCreateLinkTokenCommand command, CancellationToken cancellationToken)
    {
        EnsureConfigured();

        if (string.IsNullOrWhiteSpace(command.UserId))
        {
            throw new ArgumentException("UserId is required.", nameof(command));
        }

        _logger.LogInformation(
            "Creating Plaid link token. Products=[{Products}] CountryCodes=[{CountryCodes}] UserIdProvided={UserIdProvided}",
            string.Join(", ", _options.Products),
            string.Join(", ", _options.CountryCodes),
            !string.IsNullOrWhiteSpace(command.UserId));

        var response = await _apiClient.CreateLinkTokenAsync(new PlaidCreateLinkTokenApiRequest
        {
            ClientId = _options.ClientId,
            Secret = _options.Secret,
            ClientName = _options.ClientName,
            Products = _options.Products,
            CountryCodes = _options.CountryCodes,
            Language = _options.Language,
            Webhook = NullIfWhiteSpace(_options.WebhookUrl),
            RedirectUri = NullIfWhiteSpace(_options.RedirectUri),
            User = new PlaidLinkUser
            {
                ClientUserId = command.UserId
            }
        }, cancellationToken);

        var expiration = DateTimeOffset.Parse(response.Expiration);
        return new PlaidLinkTokenResult(response.LinkToken, expiration, response.RequestId);
    }

    public async Task<PlaidExchangePublicTokenResult> ExchangePublicTokenAsync(PlaidExchangePublicTokenCommand command, CancellationToken cancellationToken)
    {
        EnsureConfigured();

        if (string.IsNullOrWhiteSpace(command.PublicToken))
        {
            throw new ArgumentException("PublicToken is required.", nameof(command));
        }

        var response = await _apiClient.ExchangePublicTokenAsync(new PlaidExchangePublicTokenApiRequest
        {
            ClientId = _options.ClientId,
            Secret = _options.Secret,
            PublicToken = command.PublicToken
        }, cancellationToken);

        try
        {
            await _credentialStore.SaveAsync(new PlaidItemCredential
            {
                ItemId = response.ItemId,
                AccessToken = response.AccessToken,
                StoredAtUtc = DateTime.UtcNow
            }, cancellationToken);
        }
        catch (Exception ex)
        {
            throw new PlaidCredentialPersistenceException(
                "Plaid exchange succeeded but local credential persistence failed.",
                response.AccessToken,
                response.ItemId,
                response.RequestId,
                ex);
        }

        return new PlaidExchangePublicTokenResult(response.AccessToken, response.ItemId, response.RequestId);
    }

    private void EnsureConfigured()
    {
        if (string.IsNullOrWhiteSpace(_options.BaseUrl))
            throw new PlaidConfigurationException("Plaid:BaseUrl is not configured.");
        if (!Uri.TryCreate(_options.BaseUrl, UriKind.Absolute, out _))
            throw new PlaidConfigurationException("Plaid:BaseUrl must be a valid absolute URI.");
        if (string.IsNullOrWhiteSpace(_options.ClientId))
            throw new PlaidConfigurationException("Plaid:ClientId is not configured.");
        if (string.IsNullOrWhiteSpace(_options.Secret))
            throw new PlaidConfigurationException("Plaid:Secret is not configured.");
        if (_options.CountryCodes.Count == 0)
            throw new PlaidConfigurationException("Plaid:CountryCodes must contain at least one country code.");
        if (_options.Products.Count == 0)
            throw new PlaidConfigurationException("Plaid:Products must contain at least one product.");
    }

    private static string? NullIfWhiteSpace(string? value)
        => string.IsNullOrWhiteSpace(value) ? null : value;
}
