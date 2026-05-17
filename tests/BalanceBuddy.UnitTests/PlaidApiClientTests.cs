using System.Net;
using System.Text;
using BalanceBuddyWebApi.Services.Plaid;
using Xunit;

namespace BalanceBuddy.UnitTests;

public class PlaidApiClientTests
{
    [Fact]
    public async Task CreateLinkTokenAsync_ParsesSuccessfulJsonResponse()
    {
        var handler = new StubHttpMessageHandler(_ => new HttpResponseMessage(HttpStatusCode.OK)
        {
            Content = new StringContent(
                """{"link_token":"link-123","expiration":"2026-05-17T15:00:00Z","request_id":"req-123"}""",
                Encoding.UTF8,
                "application/json")
        });
        using var httpClient = new HttpClient(handler) { BaseAddress = new Uri("https://sandbox.plaid.com") };
        var sut = new PlaidApiClient(httpClient);

        var result = await sut.CreateLinkTokenAsync(new PlaidCreateLinkTokenApiRequest
        {
            ClientId = "client-id",
            Secret = "secret",
            ClientName = "BalanceBuddy",
            Products = new[] { "transactions" },
            CountryCodes = new[] { "US" },
            User = new PlaidLinkUser { ClientUserId = "user-123" }
        }, CancellationToken.None);

        Assert.Equal("link-123", result.LinkToken);
        Assert.Equal("req-123", result.RequestId);
    }

    [Fact]
    public async Task CreateLinkTokenAsync_ThrowsPlaidApiException_ForJsonErrorBody()
    {
        var handler = new StubHttpMessageHandler(_ => new HttpResponseMessage(HttpStatusCode.BadRequest)
        {
            Content = new StringContent(
                """{"error_message":"bad request","request_id":"req-err"}""",
                Encoding.UTF8,
                "application/json")
        });
        using var httpClient = new HttpClient(handler) { BaseAddress = new Uri("https://sandbox.plaid.com") };
        var sut = new PlaidApiClient(httpClient);

        var ex = await Assert.ThrowsAsync<PlaidApiException>(() =>
            sut.CreateLinkTokenAsync(new PlaidCreateLinkTokenApiRequest(), CancellationToken.None));

        Assert.Equal(400, ex.StatusCode);
        Assert.Equal("bad request", ex.Message);
        Assert.Equal("req-err", ex.RequestId);
    }

    [Fact]
    public async Task CreateLinkTokenAsync_ThrowsPlaidApiException_ForPlainTextErrorBody()
    {
        var handler = new StubHttpMessageHandler(_ => new HttpResponseMessage(HttpStatusCode.BadGateway)
        {
            Content = new StringContent("proxy failure", Encoding.UTF8, "text/plain")
        });
        using var httpClient = new HttpClient(handler) { BaseAddress = new Uri("https://sandbox.plaid.com") };
        var sut = new PlaidApiClient(httpClient);

        var ex = await Assert.ThrowsAsync<PlaidApiException>(() =>
            sut.CreateLinkTokenAsync(new PlaidCreateLinkTokenApiRequest(), CancellationToken.None));

        Assert.Equal(502, ex.StatusCode);
        Assert.Contains("proxy failure", ex.Message);
        Assert.Null(ex.RequestId);
    }

    [Fact]
    public async Task CreateLinkTokenAsync_ThrowsPlaidApiException_WhenSuccessBodyIsEmpty()
    {
        var handler = new StubHttpMessageHandler(_ => new HttpResponseMessage(HttpStatusCode.OK)
        {
            Content = new StringContent(string.Empty, Encoding.UTF8, "application/json")
        });
        using var httpClient = new HttpClient(handler) { BaseAddress = new Uri("https://sandbox.plaid.com") };
        var sut = new PlaidApiClient(httpClient);

        var ex = await Assert.ThrowsAsync<PlaidApiException>(() =>
            sut.CreateLinkTokenAsync(new PlaidCreateLinkTokenApiRequest(), CancellationToken.None));

        Assert.Equal(200, ex.StatusCode);
        Assert.Equal("Plaid API returned an invalid or empty JSON response body.", ex.Message);
    }

    private sealed class StubHttpMessageHandler : HttpMessageHandler
    {
        private readonly Func<HttpRequestMessage, HttpResponseMessage> _handler;

        public StubHttpMessageHandler(Func<HttpRequestMessage, HttpResponseMessage> handler)
        {
            _handler = handler;
        }

        protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
        {
            return Task.FromResult(_handler(request));
        }
    }
}
