using System.Net;
using System.Net.Http.Json;
using BalanceBuddyWebApi.Services.Plaid;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Xunit;

namespace BalanceBuddy.FunctionalTests;

public class PlaidControllerFunctionalTests
{
    [Fact]
    public async Task LinkToken_ReturnsConfiguredResponse()
    {
        await using var factory = new TestWebApplicationFactory(configureTestServices: services =>
        {
            services.RemoveAll<IPlaidLinkService>();
            services.AddSingleton<IPlaidLinkService>(new FakePlaidLinkService());
        });
        var client = factory.CreateClient();

        var response = await client.PostAsJsonAsync("/api/plaid/link-token", new { userId = "user-123" });
        var payload = await response.Content.ReadFromJsonAsync<LinkTokenPayload>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.NotNull(payload);
        Assert.Equal("link-token-123", payload!.LinkToken);
        Assert.Equal("req-link", payload.RequestId);
    }

    [Fact]
    public async Task ExchangePublicToken_ReturnsBadRequest_WhenMissingToken()
    {
        await using var factory = new TestWebApplicationFactory(configureTestServices: services =>
        {
            services.RemoveAll<IPlaidLinkService>();
            services.AddSingleton<IPlaidLinkService>(new FakePlaidLinkService());
        });
        var client = factory.CreateClient();

        var response = await client.PostAsJsonAsync("/api/plaid/exchange-public-token", new { publicToken = "" });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task ExchangePublicToken_ReturnsConfiguredResponse()
    {
        await using var factory = new TestWebApplicationFactory(configureTestServices: services =>
        {
            services.RemoveAll<IPlaidLinkService>();
            services.AddSingleton<IPlaidLinkService>(new FakePlaidLinkService());
        });
        var client = factory.CreateClient();

        var response = await client.PostAsJsonAsync("/api/plaid/exchange-public-token", new { publicToken = "public-token-123" });
        var payload = await response.Content.ReadFromJsonAsync<ExchangePayload>();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.NotNull(payload);
        Assert.Equal("access-token-123", payload!.AccessToken);
        Assert.Equal("item-123", payload!.ItemId);
        Assert.Equal("req-exchange", payload.RequestId);
    }

    [Fact]
    public async Task LinkToken_ReturnsServiceUnavailable_WhenBaseUrlIsMalformed()
    {
        await using var factory = new TestWebApplicationFactory(
            configureAppConfiguration: config =>
            {
                config.AddInMemoryCollection(new Dictionary<string, string?>
                {
                    ["Plaid:BaseUrl"] = "not a uri",
                    ["Plaid:ClientId"] = "client-id",
                    ["Plaid:Secret"] = "secret",
                    ["Plaid:Products:0"] = "transactions",
                    ["Plaid:CountryCodes:0"] = "US"
                });
            });

        var client = factory.CreateClient();
        var response = await client.PostAsJsonAsync("/api/plaid/link-token", new { userId = "user-123" });

        Assert.Equal(HttpStatusCode.ServiceUnavailable, response.StatusCode);
    }

    [Fact]
    public async Task ExchangePublicToken_ReturnsRecoveryPayload_WhenPersistenceFails()
    {
        await using var factory = new TestWebApplicationFactory(configureTestServices: services =>
        {
            services.RemoveAll<IPlaidLinkService>();
            services.AddSingleton<IPlaidLinkService>(new ThrowingPersistencePlaidLinkService());
        });
        var client = factory.CreateClient();

        var response = await client.PostAsJsonAsync("/api/plaid/exchange-public-token", new { publicToken = "public-token-123" });
        var payload = await response.Content.ReadFromJsonAsync<ExchangePersistenceFailurePayload>();

        Assert.Equal(HttpStatusCode.ServiceUnavailable, response.StatusCode);
        Assert.NotNull(payload);
        Assert.Equal("access-token-123", payload!.AccessToken);
        Assert.Equal("item-123", payload.ItemId);
        Assert.Equal("req-exchange", payload.RequestId);
    }

    private sealed class FakePlaidLinkService : IPlaidLinkService
    {
        public Task<PlaidLinkTokenResult> CreateLinkTokenAsync(PlaidCreateLinkTokenCommand command, CancellationToken cancellationToken)
        {
            return Task.FromResult(new PlaidLinkTokenResult(
                "link-token-123",
                DateTimeOffset.Parse("2026-05-17T15:00:00Z"),
                "req-link"));
        }

        public Task<PlaidExchangePublicTokenResult> ExchangePublicTokenAsync(PlaidExchangePublicTokenCommand command, CancellationToken cancellationToken)
        {
            return Task.FromResult(new PlaidExchangePublicTokenResult(
                "access-token-123",
                "item-123",
                "req-exchange"));
        }
    }

    private sealed class ThrowingPersistencePlaidLinkService : IPlaidLinkService
    {
        public Task<PlaidLinkTokenResult> CreateLinkTokenAsync(PlaidCreateLinkTokenCommand command, CancellationToken cancellationToken)
        {
            throw new NotImplementedException();
        }

        public Task<PlaidExchangePublicTokenResult> ExchangePublicTokenAsync(PlaidExchangePublicTokenCommand command, CancellationToken cancellationToken)
        {
            throw new PlaidCredentialPersistenceException(
                "Plaid exchange succeeded but local credential persistence failed.",
                "access-token-123",
                "item-123",
                "req-exchange",
                new InvalidOperationException("database locked"));
        }
    }

    private sealed record LinkTokenPayload(string LinkToken, DateTimeOffset Expiration, string RequestId);
    private sealed record ExchangePayload(string AccessToken, string ItemId, string RequestId);
    private sealed record ExchangePersistenceFailurePayload(string Title, int Status, string Detail, string AccessToken, string ItemId, string RequestId);
}
