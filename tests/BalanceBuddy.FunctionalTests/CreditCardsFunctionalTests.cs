using System.Net;
using System.Net.Http.Json;
using BalanceBuddyWebApi.Models;
using Xunit;

namespace BalanceBuddy.FunctionalTests;

public class CreditCardsFunctionalTests
{
    [Fact]
    public async Task PostCreditCard_ThenFetchById_Works()
    {
        await using var factory = new TestWebApplicationFactory();
        var client = factory.CreateClient();

        var createPayload = BuildPayload(cardName: "Chase Sapphire", isClosed: false);

        var createResponse = await client.PostAsJsonAsync("/api/creditcards", createPayload);
        var created = await createResponse.Content.ReadFromJsonAsync<CreditCard>();

        Assert.Equal(HttpStatusCode.Created, createResponse.StatusCode);
        Assert.NotNull(created);

        var fetchResponse = await client.GetAsync($"/api/creditcards/{created!.Id}");
        Assert.Equal(HttpStatusCode.OK, fetchResponse.StatusCode);
    }

    [Fact]
    public async Task PostCreditCard_PersistsCreditLimit()
    {
        await using var factory = new TestWebApplicationFactory();
        var client = factory.CreateClient();

        var createResponse = await client.PostAsJsonAsync("/api/creditcards", new
        {
            cardName = "Credit Limit Card",
            issuer = "Chase",
            last4 = "1234",
            openedDate = new DateTime(2025, 1, 10),
            annualFee = 95m,
            creditLimit = 24000m,
            pointsBalance = 42000,
            reminderDate = new DateTime(2026, 4, 30),
            notes = "Tracker card",
            isClosed = false,
            closedDate = (DateTime?)null
        });

        var created = await createResponse.Content.ReadFromJsonAsync<CreditCard>();

        Assert.Equal(HttpStatusCode.Created, createResponse.StatusCode);
        Assert.NotNull(created);
        Assert.Equal(24000m, created!.CreditLimit);
    }

    [Fact]
    public async Task PutCreditCard_ReturnsBadRequest_WhenIdMismatch()
    {
        await using var factory = new TestWebApplicationFactory();
        var client = factory.CreateClient();

        var created = await CreateCreditCardAsync(client, "Mismatch Card");

        var response = await client.PutAsJsonAsync($"/api/creditcards/{created.Id}", new
        {
            id = created.Id + 1,
            cardName = "Mismatch Card",
            issuer = "Chase",
            last4 = "1234",
            openedDate = new DateTime(2026, 1, 8),
            annualFee = 95m,
            creditLimit = 20000m,
            pointsBalance = 10000,
            reminderDate = new DateTime(2026, 5, 1),
            notes = "updated",
            isClosed = false,
            closedDate = (DateTime?)null
        });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task DeleteCreditCard_ReturnsNotFound_WhenMissing()
    {
        await using var factory = new TestWebApplicationFactory();
        var client = factory.CreateClient();

        var response = await client.DeleteAsync("/api/creditcards/999999");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task PostCreditCard_ReturnsBadRequest_WhenClosedDateMissingForClosedCard()
    {
        await using var factory = new TestWebApplicationFactory();
        var client = factory.CreateClient();

        var payload = BuildPayload(cardName: "Closed Without Date", isClosed: true);

        var response = await client.PostAsJsonAsync("/api/creditcards", payload);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task PostCreditCard_ReturnsBadRequest_WhenOpenedDateMissing()
    {
        await using var factory = new TestWebApplicationFactory();
        var client = factory.CreateClient();

        var response = await client.PostAsJsonAsync("/api/creditcards", new
        {
            cardName = "No Open Date",
            issuer = "Chase",
            last4 = "1234",
            annualFee = 95m,
            creditLimit = 15000m,
            pointsBalance = 42000,
            reminderDate = new DateTime(2026, 4, 30),
            notes = "Tracker card",
            isClosed = false,
            closedDate = (DateTime?)null
        });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task CreditCardCreate_Delete_Undo_Redo_WorksEndToEnd()
    {
        await using var factory = new TestWebApplicationFactory();
        var client = factory.CreateClient();

        var created = await CreateCreditCardAsync(client, "Undo Card");

        var deleteResponse = await client.DeleteAsync($"/api/creditcards/{created.Id}");
        Assert.Equal(HttpStatusCode.NoContent, deleteResponse.StatusCode);

        var missingAfterDelete = await client.GetAsync($"/api/creditcards/{created.Id}");
        Assert.Equal(HttpStatusCode.NotFound, missingAfterDelete.StatusCode);

        var undoResponse = await client.PostAsync("/api/undo/undo/CreditCard", content: null);
        Assert.Equal(HttpStatusCode.OK, undoResponse.StatusCode);

        var restored = await client.GetAsync($"/api/creditcards/{created.Id}");
        Assert.Equal(HttpStatusCode.OK, restored.StatusCode);

        var redoResponse = await client.PostAsync("/api/undo/redo/CreditCard", content: null);
        Assert.Equal(HttpStatusCode.OK, redoResponse.StatusCode);

        var missingAfterRedo = await client.GetAsync($"/api/creditcards/{created.Id}");
        Assert.Equal(HttpStatusCode.NotFound, missingAfterRedo.StatusCode);
    }

    private static object BuildPayload(string cardName, bool isClosed) =>
        new
        {
            cardName,
            issuer = "Chase",
            last4 = "1234",
            openedDate = new DateTime(2025, 1, 10),
            annualFee = 95m,
            creditLimit = 18000m,
            pointsBalance = 42000,
            reminderDate = new DateTime(2026, 4, 30),
            notes = "Tracker card",
            isClosed,
            closedDate = isClosed ? (DateTime?)null : null
        };

    private static async Task<CreditCard> CreateCreditCardAsync(HttpClient client, string cardName)
    {
        var response = await client.PostAsJsonAsync("/api/creditcards", new
        {
            cardName,
            issuer = "Chase",
            last4 = "1234",
            openedDate = new DateTime(2025, 1, 10),
            annualFee = 95m,
            creditLimit = 18000m,
            pointsBalance = 42000,
            reminderDate = new DateTime(2026, 4, 30),
            notes = "Tracker card",
            isClosed = false,
            closedDate = (DateTime?)null
        });

        response.EnsureSuccessStatusCode();
        var created = await response.Content.ReadFromJsonAsync<CreditCard>();
        Assert.NotNull(created);
        return created!;
    }
}
