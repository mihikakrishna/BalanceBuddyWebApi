using System.Net;
using System.Net.Http.Json;
using BalanceBuddyWebApi.Models;
using Xunit;

namespace BalanceBuddy.FunctionalTests;

public class CategoryAndBankAccountsFunctionalTests
{
    [Fact]
    public async Task ExpenseCategories_DuplicateName_ReturnsConflict()
    {
        await using var factory = new TestWebApplicationFactory();
        var client = factory.CreateClient();

        var first = await client.PostAsJsonAsync("/api/expensecategories", new { name = "Leisure", budget = 100m });
        var second = await client.PostAsJsonAsync("/api/expensecategories", new { name = "leisure", budget = 200m });

        Assert.Equal(HttpStatusCode.Created, first.StatusCode);
        Assert.Equal(HttpStatusCode.Conflict, second.StatusCode);
    }

    [Fact]
    public async Task ExpenseCategories_PutUnreviewed_ReturnsBadRequest()
    {
        await using var factory = new TestWebApplicationFactory();
        var client = factory.CreateClient();

        var unreviewed = await client.GetFromJsonAsync<List<ExpenseCategory>>("/api/expensecategories");
        var id = unreviewed!.Single(x => x.Name == "Unreviewed").Id;

        var response = await client.PutAsJsonAsync($"/api/expensecategories/{id}", new { id, name = "Renamed", budget = 5m });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task ExpenseCategories_DeleteInUse_ReturnsConflict()
    {
        await using var factory = new TestWebApplicationFactory();
        var client = factory.CreateClient();

        var createCategory = await client.PostAsJsonAsync("/api/expensecategories", new { name = "Bills", budget = 200m });
        var category = await createCategory.Content.ReadFromJsonAsync<ExpenseCategory>();
        Assert.NotNull(category);

        var createdExpense = await client.PostAsJsonAsync("/api/expenses", new
        {
            amount = 15m,
            date = new DateTime(2026, 1, 10),
            description = "in-use",
            categoryId = category!.Id
        });
        Assert.Equal(HttpStatusCode.Created, createdExpense.StatusCode);

        var deleteResponse = await client.DeleteAsync($"/api/expensecategories/{category.Id}");

        Assert.Equal(HttpStatusCode.Conflict, deleteResponse.StatusCode);
    }

    [Fact]
    public async Task ExpenseCategories_DeleteMissing_ReturnsBadRequest()
    {
        await using var factory = new TestWebApplicationFactory();
        var client = factory.CreateClient();

        var response = await client.DeleteAsync("/api/expensecategories/987654");

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task IncomeCategories_DuplicateName_ReturnsConflict()
    {
        await using var factory = new TestWebApplicationFactory();
        var client = factory.CreateClient();

        var first = await client.PostAsJsonAsync("/api/incomecategories", new { name = "Bonus" });
        var second = await client.PostAsJsonAsync("/api/incomecategories", new { name = "bonus" });

        Assert.Equal(HttpStatusCode.Created, first.StatusCode);
        Assert.Equal(HttpStatusCode.Conflict, second.StatusCode);
    }

    [Fact]
    public async Task IncomeCategories_PutUnreviewed_ReturnsBadRequest()
    {
        await using var factory = new TestWebApplicationFactory();
        var client = factory.CreateClient();

        var unreviewed = await client.GetFromJsonAsync<List<IncomeCategory>>("/api/incomecategories");
        var id = unreviewed!.Single(x => x.Name == "Unreviewed").Id;

        var response = await client.PutAsJsonAsync($"/api/incomecategories/{id}", new { id, name = "Renamed" });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task IncomeCategories_DeleteInUse_ReturnsConflict()
    {
        await using var factory = new TestWebApplicationFactory();
        var client = factory.CreateClient();

        var createCategory = await client.PostAsJsonAsync("/api/incomecategories", new { name = "Salary" });
        var category = await createCategory.Content.ReadFromJsonAsync<IncomeCategory>();
        Assert.NotNull(category);

        var createdIncome = await client.PostAsJsonAsync("/api/incomes", new
        {
            amount = 1500m,
            date = new DateTime(2026, 1, 10),
            description = "in-use",
            categoryId = category!.Id
        });
        Assert.Equal(HttpStatusCode.Created, createdIncome.StatusCode);

        var deleteResponse = await client.DeleteAsync($"/api/incomecategories/{category.Id}");

        Assert.Equal(HttpStatusCode.Conflict, deleteResponse.StatusCode);
    }

    [Fact]
    public async Task IncomeCategories_DeleteMissing_ReturnsBadRequest()
    {
        await using var factory = new TestWebApplicationFactory();
        var client = factory.CreateClient();

        var response = await client.DeleteAsync("/api/incomecategories/987654");

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task BankAccounts_GetReturnsSortedByBalanceDescending()
    {
        await using var factory = new TestWebApplicationFactory();
        var client = factory.CreateClient();

        await client.PostAsJsonAsync("/api/bankaccounts", new { name = "Low", balance = 10m, description = "L" });
        await client.PostAsJsonAsync("/api/bankaccounts", new { name = "High", balance = 200m, description = "H" });
        await client.PostAsJsonAsync("/api/bankaccounts", new { name = "Mid", balance = 100m, description = "M" });

        var accounts = await client.GetFromJsonAsync<List<BankAccount>>("/api/bankaccounts");

        Assert.NotNull(accounts);
        Assert.Equal(new[] { "High", "Mid", "Low" }, accounts!.Take(3).Select(a => a.Name).ToArray());
    }

    [Fact]
    public async Task BankAccounts_DeleteMissing_ReturnsNotFound()
    {
        await using var factory = new TestWebApplicationFactory();
        var client = factory.CreateClient();

        var response = await client.DeleteAsync("/api/bankaccounts/999999");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }
}
