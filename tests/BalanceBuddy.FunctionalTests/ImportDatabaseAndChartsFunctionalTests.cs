using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using BalanceBuddyWebApi.Models;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace BalanceBuddy.FunctionalTests;

public class ImportDatabaseAndChartsFunctionalTests
{
    [Fact]
    public async Task ImportBanks_ReturnsKnownParserIds()
    {
        await using var factory = new TestWebApplicationFactory();
        var client = factory.CreateClient();

        var banks = await client.GetFromJsonAsync<string[]>("/api/import/banks");

        Assert.NotNull(banks);
        Assert.Contains("Chase", banks!);
        Assert.Contains("Wells Fargo", banks);
        Assert.Contains("Capital One Checking/Savings", banks);
    }

    [Fact]
    public async Task Import_ReturnsBadRequest_WhenFileMissing()
    {
        await using var factory = new TestWebApplicationFactory();
        var client = factory.CreateClient();

        using var content = new MultipartFormDataContent
        {
            { new StringContent("Chase"), "bankId" }
        };

        var response = await client.PostAsync("/api/import", content);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Import_ReturnsBadRequest_WhenFileIsEmpty()
    {
        await using var factory = new TestWebApplicationFactory();
        var client = factory.CreateClient();

        using var content = new MultipartFormDataContent();
        var emptyFile = new ByteArrayContent(Array.Empty<byte>());
        emptyFile.Headers.ContentType = new MediaTypeHeaderValue("text/csv");
        content.Add(emptyFile, "file", "statement.csv");
        content.Add(new StringContent("Chase"), "bankId");

        var response = await client.PostAsync("/api/import", content);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Import_ReturnsBadRequest_WhenBankIdMissing()
    {
        await using var factory = new TestWebApplicationFactory();
        var client = factory.CreateClient();

        using var content = new MultipartFormDataContent();
        var bytes = Encoding.UTF8.GetBytes("h1,h2,h3,h4,h5,h6\nx,2026-01-15,Coffee,x,x,-10");
        var file = new ByteArrayContent(bytes);
        file.Headers.ContentType = new MediaTypeHeaderValue("text/csv");
        content.Add(file, "file", "statement.csv");

        var response = await client.PostAsync("/api/import", content);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Import_ReturnsBadRequest_ForUnknownBank()
    {
        await using var factory = new TestWebApplicationFactory();
        var client = factory.CreateClient();

        using var content = new MultipartFormDataContent();
        var bytes = Encoding.UTF8.GetBytes("Date,Description,Amount\n2026-01-01,Store,10");
        var file = new ByteArrayContent(bytes);
        file.Headers.ContentType = new MediaTypeHeaderValue("text/csv");
        content.Add(file, "file", "statement.csv");
        content.Add(new StringContent("Unknown Bank"), "bankId");

        var response = await client.PostAsync("/api/import", content);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Import_ChaseCsv_PersistsExpensesAndIncome()
    {
        await using var factory = new TestWebApplicationFactory();
        var client = factory.CreateClient();

        using var content = new MultipartFormDataContent();
        var bytes = Encoding.UTF8.GetBytes(
            "h1,h2,h3,h4,h5,h6\n" +
            "x,2026-01-15,Coffee,x,x,-12.34\n" +
            "x,2026-01-16,Deposit,x,x,500.00");

        var file = new ByteArrayContent(bytes);
        file.Headers.ContentType = new MediaTypeHeaderValue("text/csv");
        content.Add(file, "file", "statement.csv");
        content.Add(new StringContent("Chase"), "bankId");

        var response = await client.PostAsync("/api/import", content);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var counts = await factory.QueryDbAsync(async ctx => new
        {
            Expenses = await ctx.Expenses.CountAsync(),
            Incomes = await ctx.Incomes.CountAsync()
        });

        Assert.True(counts.Expenses >= 1);
        Assert.True(counts.Incomes >= 1);
    }

    [Fact]
    public async Task DatabaseEndpoints_CurrentAndList_ReturnOpenDatabase()
    {
        await using var factory = new TestWebApplicationFactory();
        var client = factory.CreateClient();

        var current = await client.GetStringAsync("/api/database/current");
        var list = await client.GetFromJsonAsync<string[]>("/api/database/list");

        Assert.Equal("balancebuddy.db", current);
        Assert.NotNull(list);
        Assert.Contains("balancebuddy.db", list!);
    }

    [Fact]
    public async Task DatabaseCreate_ThenSwitch_ChangesCurrentFile()
    {
        await using var factory = new TestWebApplicationFactory();
        var client = factory.CreateClient();

        var createResponse = await client.PostAsJsonAsync("/api/database/create", new { fileName = "alt.db" });
        Assert.Equal(HttpStatusCode.Created, createResponse.StatusCode);

        var afterCreate = await client.GetStringAsync("/api/database/current");
        Assert.Equal("alt.db", afterCreate);

        var switchResponse = await client.PostAsJsonAsync("/api/database/switch", new { fileName = "balancebuddy.db" });
        Assert.Equal(HttpStatusCode.NoContent, switchResponse.StatusCode);

        var afterSwitch = await client.GetStringAsync("/api/database/current");
        Assert.Equal("balancebuddy.db", afterSwitch);
    }

    [Fact]
    public async Task DatabaseUpload_RejectsNonDbExtension()
    {
        await using var factory = new TestWebApplicationFactory();
        var client = factory.CreateClient();

        using var content = new MultipartFormDataContent();
        var file = new ByteArrayContent(Encoding.UTF8.GetBytes("not a db"));
        file.Headers.ContentType = new MediaTypeHeaderValue("application/octet-stream");
        content.Add(file, "file", "bad.txt");

        var response = await client.PostAsync("/api/database/upload", content);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task DatabaseUpload_AcceptsDbFile_AndSwitchesCurrent()
    {
        await using var factory = new TestWebApplicationFactory();
        var client = factory.CreateClient();

        var uploadPath = Path.Combine(factory.DataDirectoryPath, "upload-source.db");
        File.Copy(Path.Combine(factory.DataDirectoryPath, "balancebuddy.db"), uploadPath, overwrite: true);

        using var content = new MultipartFormDataContent();
        await using var fs = File.OpenRead(uploadPath);
        var fileContent = new StreamContent(fs);
        fileContent.Headers.ContentType = new MediaTypeHeaderValue("application/octet-stream");
        content.Add(fileContent, "file", "uploaded.db");

        var response = await client.PostAsync("/api/database/upload", content);
        var current = await client.GetStringAsync("/api/database/current");

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        Assert.Equal("uploaded.db", current);
    }

    [Fact]
    public async Task DatabaseExport_ReturnsBinaryFile()
    {
        await using var factory = new TestWebApplicationFactory();
        var client = factory.CreateClient();

        var response = await client.GetAsync("/api/database/export?fileName=my-export.db");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal("application/octet-stream", response.Content.Headers.ContentType?.MediaType);
        Assert.Equal("my-export.db", response.Content.Headers.ContentDisposition?.FileName?.Trim('"'));
    }

    [Fact]
    public async Task ChartsBankBalances_ReturnsNameAndBalance()
    {
        await using var factory = new TestWebApplicationFactory();
        var client = factory.CreateClient();

        await factory.ExecuteDbAsync(async ctx =>
        {
            ctx.BankAccounts.AddRange(
                new BankAccount { Name = "Checking", Balance = 1200m },
                new BankAccount { Name = "Savings", Balance = 3400m });
            await ctx.SaveChangesAsync();
        });

        var response = await client.GetStringAsync("/api/charts/bankbalances");
        using var json = JsonDocument.Parse(response);

        Assert.Equal(2, json.RootElement.GetArrayLength());
    }

    [Fact]
    public async Task ChartsExpenseBudget_Returns12MonthsPerCategory()
    {
        await using var factory = new TestWebApplicationFactory();
        var client = factory.CreateClient();

        await factory.ExecuteDbAsync(async ctx =>
        {
            var category = new ExpenseCategory { Name = "Budgeted", Budget = 100m };
            ctx.ExpenseCategories.Add(category);
            await ctx.SaveChangesAsync();

            ctx.Expenses.Add(new Expense
            {
                Amount = 50m,
                Date = new DateTime(2026, 1, 10),
                Description = "budget-expense",
                CategoryId = category.Id
            });
            await ctx.SaveChangesAsync();
        });

        var response = await client.GetStringAsync("/api/charts/expense-budget?year=2026");
        using var json = JsonDocument.Parse(response);

        var categories = json.RootElement.GetProperty("categories");
        var values = json.RootElement.GetProperty("values");

        Assert.True(categories.GetArrayLength() >= 1);
        Assert.True(values.GetArrayLength() >= 1);
        Assert.Equal(12, values[0].GetArrayLength());
    }

    [Fact]
    public async Task ChartsExpensesByCategory_GroupsMonthlyTotals()
    {
        await using var factory = new TestWebApplicationFactory();
        var client = factory.CreateClient();

        await factory.ExecuteDbAsync(async ctx =>
        {
            var catA = new ExpenseCategory { Name = "Food", Budget = null };
            var catB = new ExpenseCategory { Name = "Travel", Budget = null };
            ctx.ExpenseCategories.AddRange(catA, catB);
            await ctx.SaveChangesAsync();

            ctx.Expenses.AddRange(
                new Expense { Amount = 10m, Date = new DateTime(2026, 2, 2), Description = "A1", CategoryId = catA.Id },
                new Expense { Amount = 20m, Date = new DateTime(2026, 2, 3), Description = "A2", CategoryId = catA.Id },
                new Expense { Amount = 15m, Date = new DateTime(2026, 2, 4), Description = "B1", CategoryId = catB.Id });
            await ctx.SaveChangesAsync();
        });

        var response = await client.GetStringAsync("/api/charts/expenses-by-category?year=2026&month=2");
        using var json = JsonDocument.Parse(response);

        Assert.Equal(2, json.RootElement.GetArrayLength());

        var totals = json.RootElement.EnumerateArray().ToDictionary(
            x => x.GetProperty("category").GetString()!,
            x => x.GetProperty("total").GetDecimal());

        Assert.Equal(30m, totals["Food"]);
        Assert.Equal(15m, totals["Travel"]);
    }

    [Fact]
    public async Task ChartsMonthlyStack_ReturnsIncomeAndExpenseArrays()
    {
        await using var factory = new TestWebApplicationFactory();
        var client = factory.CreateClient();

        var expenseCategoryId = await FunctionalSeed.GetExpenseUnreviewedIdAsync(factory);
        var incomeCategoryId = await FunctionalSeed.GetIncomeUnreviewedIdAsync(factory);

        await factory.ExecuteDbAsync(async ctx =>
        {
            ctx.Incomes.Add(new Income
            {
                Amount = 1000m,
                Date = new DateTime(2026, 3, 15),
                Description = "salary",
                CategoryId = incomeCategoryId
            });

            ctx.Expenses.Add(new Expense
            {
                Amount = 200m,
                Date = new DateTime(2026, 3, 16),
                Description = "rent",
                CategoryId = expenseCategoryId
            });
            await ctx.SaveChangesAsync();
        });

        var response = await client.GetStringAsync("/api/charts/monthly-stack?year=2026");
        using var json = JsonDocument.Parse(response);

        var income = json.RootElement.GetProperty("income");
        var expenses = json.RootElement.GetProperty("expenses");

        Assert.Equal(12, income.GetArrayLength());
        Assert.Equal(12, expenses.GetArrayLength());
        Assert.Equal(1000d, income[2].GetDouble());
        Assert.Equal(200d, expenses[2].GetDouble());
    }
}
