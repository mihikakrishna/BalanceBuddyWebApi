using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using Xunit;

namespace BalanceBuddy.FunctionalTests;

public class ApiSmokeTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;

    public ApiSmokeTests(WebApplicationFactory<Program> factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetDatabaseCurrent_ReturnsOkAndCurrentFile()
    {
        var response = await _client.GetAsync("/api/database/current");
        var body = await response.Content.ReadAsStringAsync();

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.False(string.IsNullOrWhiteSpace(body));
    }

    [Fact]
    public async Task GetImportBanks_ReturnsKnownParsers()
    {
        var banks = await _client.GetFromJsonAsync<string[]>("/api/import/banks");

        Assert.NotNull(banks);
        Assert.Contains("Chase", banks!);
        Assert.Contains("Wells Fargo", banks!);
    }

    [Fact]
    public async Task PostIncome_ThenFetchById_Works()
    {
        var createPayload = new
        {
            amount = 123.45m,
            date = DateTime.UtcNow,
            description = "Functional smoke income",
            categoryId = 999999
        };

        var createResponse = await _client.PostAsJsonAsync("/api/incomes", createPayload);
        Assert.Equal(HttpStatusCode.Created, createResponse.StatusCode);

        var created = await createResponse.Content.ReadFromJsonAsync<IdOnly>();
        Assert.NotNull(created);

        var fetchResponse = await _client.GetAsync($"/api/incomes/{created!.Id}");
        Assert.Equal(HttpStatusCode.OK, fetchResponse.StatusCode);
    }

    private sealed record IdOnly(int Id);
}
