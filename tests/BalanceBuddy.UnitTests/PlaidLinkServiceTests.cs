using BalanceBuddyWebApi.Models;
using BalanceBuddyWebApi.Services.Plaid;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;
using Xunit;

namespace BalanceBuddy.UnitTests;

public class PlaidLinkServiceTests
{
    [Fact]
    public async Task CreateLinkToken_UsesConfiguredDefaults()
    {
        var apiClient = new FakePlaidApiClient
        {
            LinkTokenResponse = new PlaidLinkTokenApiResponse
            {
                LinkToken = "link-sandbox-token",
                Expiration = "2026-05-17T15:00:00Z",
                RequestId = "req-link"
            }
        };
        var sut = BuildService(apiClient);

        var result = await sut.CreateLinkTokenAsync(new PlaidCreateLinkTokenCommand("user-123"), CancellationToken.None);

        Assert.Equal("link-sandbox-token", result.LinkToken);
        Assert.Equal("req-link", result.RequestId);
        Assert.NotNull(apiClient.LastCreateLinkTokenRequest);
        Assert.Equal("user-123", apiClient.LastCreateLinkTokenRequest!.User.ClientUserId);
        Assert.Equal(new[] { "transactions", "statements" }, apiClient.LastCreateLinkTokenRequest.Products);
        Assert.Equal(new[] { "US" }, apiClient.LastCreateLinkTokenRequest.CountryCodes);
    }

    [Fact]
    public async Task ExchangePublicToken_PassesThroughResponse()
    {
        var apiClient = new FakePlaidApiClient
        {
            ExchangeResponse = new PlaidExchangePublicTokenApiResponse
            {
                AccessToken = "access-sandbox-token",
                ItemId = "item-123",
                RequestId = "req-exchange"
            }
        };
        var store = new FakePlaidItemCredentialStore();
        var sut = BuildService(apiClient, store);

        var result = await sut.ExchangePublicTokenAsync(new PlaidExchangePublicTokenCommand("public-sandbox-token"), CancellationToken.None);

        Assert.Equal("access-sandbox-token", result.AccessToken);
        Assert.Equal("item-123", result.ItemId);
        Assert.Equal("public-sandbox-token", apiClient.LastExchangeRequest!.PublicToken);
        Assert.NotNull(store.LastSavedCredential);
        Assert.Equal("item-123", store.LastSavedCredential!.ItemId);
        Assert.Equal("access-sandbox-token", store.LastSavedCredential.AccessToken);
    }

    [Fact]
    public async Task CreateLinkToken_Throws_WhenClientIdMissing()
    {
        var sut = new PlaidLinkService(new FakePlaidApiClient(), Options.Create(new PlaidSettings
        {
            BaseUrl = "https://sandbox.plaid.com",
            Secret = "secret",
            ClientId = ""
        }), new FakePlaidItemCredentialStore(), NullLogger<PlaidLinkService>.Instance);

        var ex = await Assert.ThrowsAsync<PlaidConfigurationException>(() =>
            sut.CreateLinkTokenAsync(new PlaidCreateLinkTokenCommand("user-123"), CancellationToken.None));

        Assert.Contains("ClientId", ex.Message);
    }

    [Fact]
    public async Task CreateLinkToken_Throws_WhenBaseUrlIsMalformed()
    {
        var sut = new PlaidLinkService(new FakePlaidApiClient(), Options.Create(new PlaidSettings
        {
            BaseUrl = "not a uri",
            Secret = "secret",
            ClientId = "client-id",
            CountryCodes = new List<string> { "US" },
            Products = new List<string> { "transactions" }
        }), new FakePlaidItemCredentialStore(), NullLogger<PlaidLinkService>.Instance);

        var ex = await Assert.ThrowsAsync<PlaidConfigurationException>(() =>
            sut.CreateLinkTokenAsync(new PlaidCreateLinkTokenCommand("user-123"), CancellationToken.None));

        Assert.Contains("BaseUrl", ex.Message);
    }

    [Fact]
    public async Task ExchangePublicToken_ThrowsPersistenceException_WhenCredentialSaveFails()
    {
        var apiClient = new FakePlaidApiClient
        {
            ExchangeResponse = new PlaidExchangePublicTokenApiResponse
            {
                AccessToken = "access-sandbox-token",
                ItemId = "item-123",
                RequestId = "req-exchange"
            }
        };
        var store = new ThrowingPlaidItemCredentialStore();
        var sut = BuildService(apiClient, store);

        var ex = await Assert.ThrowsAsync<PlaidCredentialPersistenceException>(() =>
            sut.ExchangePublicTokenAsync(new PlaidExchangePublicTokenCommand("public-sandbox-token"), CancellationToken.None));

        Assert.Equal("access-sandbox-token", ex.AccessToken);
        Assert.Equal("item-123", ex.ItemId);
        Assert.Equal("req-exchange", ex.RequestId);
    }

    private static PlaidLinkService BuildService(FakePlaidApiClient apiClient, IPlaidItemCredentialStore? store = null)
    {
        return new PlaidLinkService(apiClient, Options.Create(new PlaidSettings
        {
            BaseUrl = "https://sandbox.plaid.com",
            ClientId = "client-id",
            Secret = "secret",
            ClientName = "BalanceBuddy",
            Language = "en",
            CountryCodes = new List<string> { "US" },
            Products = new List<string> { "transactions", "statements" }
        }), store ?? new FakePlaidItemCredentialStore(), NullLogger<PlaidLinkService>.Instance);
    }

    private sealed class FakePlaidApiClient : IPlaidApiClient
    {
        public PlaidCreateLinkTokenApiRequest? LastCreateLinkTokenRequest { get; private set; }
        public PlaidExchangePublicTokenApiRequest? LastExchangeRequest { get; private set; }
        public PlaidLinkTokenApiResponse LinkTokenResponse { get; set; } = new();
        public PlaidExchangePublicTokenApiResponse ExchangeResponse { get; set; } = new();

        public Task<PlaidLinkTokenApiResponse> CreateLinkTokenAsync(PlaidCreateLinkTokenApiRequest request, CancellationToken cancellationToken)
        {
            LastCreateLinkTokenRequest = request;
            return Task.FromResult(LinkTokenResponse);
        }

        public Task<PlaidExchangePublicTokenApiResponse> ExchangePublicTokenAsync(PlaidExchangePublicTokenApiRequest request, CancellationToken cancellationToken)
        {
            LastExchangeRequest = request;
            return Task.FromResult(ExchangeResponse);
        }
    }

    private sealed class FakePlaidItemCredentialStore : IPlaidItemCredentialStore
    {
        public PlaidItemCredential? LastSavedCredential { get; private set; }

        public Task SaveAsync(PlaidItemCredential credential, CancellationToken cancellationToken)
        {
            LastSavedCredential = credential;
            return Task.CompletedTask;
        }

        public Task<PlaidItemCredential?> GetByItemIdAsync(string itemId, CancellationToken cancellationToken)
        {
            return Task.FromResult(LastSavedCredential);
        }
    }

    private sealed class ThrowingPlaidItemCredentialStore : IPlaidItemCredentialStore
    {
        public Task SaveAsync(PlaidItemCredential credential, CancellationToken cancellationToken)
        {
            throw new InvalidOperationException("database locked");
        }

        public Task<PlaidItemCredential?> GetByItemIdAsync(string itemId, CancellationToken cancellationToken)
        {
            return Task.FromResult<PlaidItemCredential?>(null);
        }
    }
}
