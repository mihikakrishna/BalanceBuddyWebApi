using System.Net;
using System.Net.Http.Json;
using BalanceBuddyWebApi.Models;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace BalanceBuddy.FunctionalTests;

public class ExpensesAndIncomesFunctionalTests
{
    [Fact]
    public async Task PostExpense_UsesUnreviewedCategory_WhenCategoryDoesNotExist()
    {
        await using var factory = new TestWebApplicationFactory();
        var client = factory.CreateClient();
        var unreviewedId = await FunctionalSeed.GetExpenseUnreviewedIdAsync(factory);

        var payload = new
        {
            amount = 19.99m,
            date = new DateTime(2026, 1, 10),
            description = "Fallback expense",
            categoryId = 999999
        };

        var response = await client.PostAsJsonAsync("/api/expenses", payload);
        var created = await response.Content.ReadFromJsonAsync<Expense>();

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        Assert.NotNull(created);
        Assert.Equal(unreviewedId, created!.CategoryId);
    }

    [Fact]
    public async Task GetExpenses_ReturnsDescendingByDate()
    {
        await using var factory = new TestWebApplicationFactory();
        var client = factory.CreateClient();

        var categoryId = await FunctionalSeed.GetExpenseUnreviewedIdAsync(factory);
        await factory.ExecuteDbAsync(async ctx =>
        {
            ctx.Expenses.AddRange(
                new Expense { Amount = 1, Date = new DateTime(2026, 1, 1), Description = "old", CategoryId = categoryId },
                new Expense { Amount = 2, Date = new DateTime(2026, 1, 3), Description = "new", CategoryId = categoryId },
                new Expense { Amount = 3, Date = new DateTime(2026, 1, 2), Description = "middle", CategoryId = categoryId });
            await ctx.SaveChangesAsync();
        });

        var expenses = await client.GetFromJsonAsync<List<Expense>>("/api/expenses");

        Assert.NotNull(expenses);
        var firstThree = expenses!.Take(3).Select(x => x.Description).ToArray();
        Assert.Equal(new[] { "new", "middle", "old" }, firstThree);
    }

    [Fact]
    public async Task PutExpense_ReturnsBadRequest_WhenIdMismatch()
    {
        await using var factory = new TestWebApplicationFactory();
        var client = factory.CreateClient();

        var categoryId = await FunctionalSeed.GetExpenseUnreviewedIdAsync(factory);
        var created = await CreateExpenseAsync(client, categoryId, 10m, "to-update");

        var response = await client.PutAsJsonAsync($"/api/expenses/{created.Id}", new
        {
            id = created.Id + 1,
            amount = 20m,
            date = created.Date,
            description = "changed",
            categoryId
        });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task PutExpense_ReturnsNotFound_WhenMissing()
    {
        await using var factory = new TestWebApplicationFactory();
        var client = factory.CreateClient();
        var categoryId = await FunctionalSeed.GetExpenseUnreviewedIdAsync(factory);

        var response = await client.PutAsJsonAsync("/api/expenses/123456", new
        {
            id = 123456,
            amount = 20m,
            date = new DateTime(2026, 1, 1),
            description = "missing",
            categoryId
        });

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task DeleteExpense_ReturnsNotFound_WhenMissing()
    {
        await using var factory = new TestWebApplicationFactory();
        var client = factory.CreateClient();

        var response = await client.DeleteAsync("/api/expenses/999999");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task ExpenseCreate_Delete_Undo_Redo_WorksEndToEnd()
    {
        await using var factory = new TestWebApplicationFactory();
        var client = factory.CreateClient();
        var categoryId = await FunctionalSeed.GetExpenseUnreviewedIdAsync(factory);

        var created = await CreateExpenseAsync(client, categoryId, 77.77m, "undo-expense");

        var deleteResponse = await client.DeleteAsync($"/api/expenses/{created.Id}");
        Assert.Equal(HttpStatusCode.NoContent, deleteResponse.StatusCode);

        var missingAfterDelete = await client.GetAsync($"/api/expenses/{created.Id}");
        Assert.Equal(HttpStatusCode.NotFound, missingAfterDelete.StatusCode);

        var undoResponse = await client.PostAsync("/api/undo/undo/Expense", content: null);
        Assert.Equal(HttpStatusCode.OK, undoResponse.StatusCode);

        var restored = await client.GetAsync($"/api/expenses/{created.Id}");
        Assert.Equal(HttpStatusCode.OK, restored.StatusCode);

        var redoResponse = await client.PostAsync("/api/undo/redo/Expense", content: null);
        Assert.Equal(HttpStatusCode.OK, redoResponse.StatusCode);

        var missingAfterRedo = await client.GetAsync($"/api/expenses/{created.Id}");
        Assert.Equal(HttpStatusCode.NotFound, missingAfterRedo.StatusCode);
    }

    [Fact]
    public async Task PostIncome_UsesUnreviewedCategory_WhenCategoryDoesNotExist()
    {
        await using var factory = new TestWebApplicationFactory();
        var client = factory.CreateClient();
        var unreviewedId = await FunctionalSeed.GetIncomeUnreviewedIdAsync(factory);

        var payload = new
        {
            amount = 500m,
            date = new DateTime(2026, 1, 11),
            description = "Fallback income",
            categoryId = 999999
        };

        var response = await client.PostAsJsonAsync("/api/incomes", payload);
        var created = await response.Content.ReadFromJsonAsync<Income>();

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        Assert.NotNull(created);
        Assert.Equal(unreviewedId, created!.CategoryId);
    }

    [Fact]
    public async Task GetIncomes_ReturnsDescendingByDate()
    {
        await using var factory = new TestWebApplicationFactory();
        var client = factory.CreateClient();

        var categoryId = await FunctionalSeed.GetIncomeUnreviewedIdAsync(factory);
        await factory.ExecuteDbAsync(async ctx =>
        {
            ctx.Incomes.AddRange(
                new Income { Amount = 1, Date = new DateTime(2026, 1, 1), Description = "old", CategoryId = categoryId },
                new Income { Amount = 2, Date = new DateTime(2026, 1, 3), Description = "new", CategoryId = categoryId },
                new Income { Amount = 3, Date = new DateTime(2026, 1, 2), Description = "middle", CategoryId = categoryId });
            await ctx.SaveChangesAsync();
        });

        var incomes = await client.GetFromJsonAsync<List<Income>>("/api/incomes");

        Assert.NotNull(incomes);
        var firstThree = incomes!.Take(3).Select(x => x.Description).ToArray();
        Assert.Equal(new[] { "new", "middle", "old" }, firstThree);
    }

    [Fact]
    public async Task PutIncome_ReturnsBadRequest_WhenIdMismatch()
    {
        await using var factory = new TestWebApplicationFactory();
        var client = factory.CreateClient();

        var categoryId = await FunctionalSeed.GetIncomeUnreviewedIdAsync(factory);
        var created = await CreateIncomeAsync(client, categoryId, 10m, "to-update");

        var response = await client.PutAsJsonAsync($"/api/incomes/{created.Id}", new
        {
            id = created.Id + 1,
            amount = 20m,
            date = created.Date,
            description = "changed",
            categoryId
        });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task PutIncome_ReturnsNotFound_WhenMissing()
    {
        await using var factory = new TestWebApplicationFactory();
        var client = factory.CreateClient();
        var categoryId = await FunctionalSeed.GetIncomeUnreviewedIdAsync(factory);

        var response = await client.PutAsJsonAsync("/api/incomes/123456", new
        {
            id = 123456,
            amount = 20m,
            date = new DateTime(2026, 1, 1),
            description = "missing",
            categoryId
        });

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task DeleteIncome_ReturnsNotFound_WhenMissing()
    {
        await using var factory = new TestWebApplicationFactory();
        var client = factory.CreateClient();

        var response = await client.DeleteAsync("/api/incomes/999999");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task IncomeCreate_Delete_Undo_Redo_WorksEndToEnd()
    {
        await using var factory = new TestWebApplicationFactory();
        var client = factory.CreateClient();
        var categoryId = await FunctionalSeed.GetIncomeUnreviewedIdAsync(factory);

        var created = await CreateIncomeAsync(client, categoryId, 88.88m, "undo-income");

        var deleteResponse = await client.DeleteAsync($"/api/incomes/{created.Id}");
        Assert.Equal(HttpStatusCode.NoContent, deleteResponse.StatusCode);

        var missingAfterDelete = await client.GetAsync($"/api/incomes/{created.Id}");
        Assert.Equal(HttpStatusCode.NotFound, missingAfterDelete.StatusCode);

        var undoResponse = await client.PostAsync("/api/undo/undo/Income", content: null);
        Assert.Equal(HttpStatusCode.OK, undoResponse.StatusCode);

        var restored = await client.GetAsync($"/api/incomes/{created.Id}");
        Assert.Equal(HttpStatusCode.OK, restored.StatusCode);

        var redoResponse = await client.PostAsync("/api/undo/redo/Income", content: null);
        Assert.Equal(HttpStatusCode.OK, redoResponse.StatusCode);

        var missingAfterRedo = await client.GetAsync($"/api/incomes/{created.Id}");
        Assert.Equal(HttpStatusCode.NotFound, missingAfterRedo.StatusCode);
    }

    [Fact]
    public async Task UndoEndpoints_ReturnNoContent_WhenStacksEmpty()
    {
        await using var factory = new TestWebApplicationFactory();
        var client = factory.CreateClient();

        var expenseUndo = await client.PostAsync("/api/undo/undo/Expense", content: null);
        var incomeRedo = await client.PostAsync("/api/undo/redo/Income", content: null);

        Assert.Equal(HttpStatusCode.NoContent, expenseUndo.StatusCode);
        Assert.Equal(HttpStatusCode.NoContent, incomeRedo.StatusCode);
    }

    private static async Task<Expense> CreateExpenseAsync(HttpClient client, int categoryId, decimal amount, string description)
    {
        var response = await client.PostAsJsonAsync("/api/expenses", new
        {
            amount,
            date = new DateTime(2026, 1, 8),
            description,
            categoryId
        });

        response.EnsureSuccessStatusCode();
        var created = await response.Content.ReadFromJsonAsync<Expense>();
        Assert.NotNull(created);
        return created!;
    }

    private static async Task<Income> CreateIncomeAsync(HttpClient client, int categoryId, decimal amount, string description)
    {
        var response = await client.PostAsJsonAsync("/api/incomes", new
        {
            amount,
            date = new DateTime(2026, 1, 8),
            description,
            categoryId
        });

        response.EnsureSuccessStatusCode();
        var created = await response.Content.ReadFromJsonAsync<Income>();
        Assert.NotNull(created);
        return created!;
    }
}
