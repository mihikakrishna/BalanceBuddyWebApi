using BalanceBuddyWebApi.Data;
using BalanceBuddyWebApi.Services;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;

namespace BalanceBuddy.FunctionalTests;

internal sealed class TestWebApplicationFactory : WebApplicationFactory<Program>, IAsyncDisposable
{
    private readonly string _contentRoot;
    private readonly string _dbPath;

    public TestWebApplicationFactory()
    {
        _contentRoot = Path.Combine(Path.GetTempPath(), "bb-functional-" + Guid.NewGuid().ToString("N"));
        Directory.CreateDirectory(_contentRoot);
        Directory.CreateDirectory(Path.Combine(_contentRoot, "Data"));

        // Needed for static fallback route registration.
        File.WriteAllText(Path.Combine(_contentRoot, "index.html"), "<html><body>test</body></html>");

        _dbPath = Path.Combine(_contentRoot, "Data", "functional.db");
    }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Development");
        builder.UseSetting(WebHostDefaults.ContentRootKey, _contentRoot);

        builder.ConfigureServices(services =>
        {
            services.RemoveAll<DatabaseService>();
            services.RemoveAll<UndoManager>();

            var dbService = new DatabaseService();
            dbService.CreateNew(_dbPath);

            services.AddSingleton(dbService);
            services.AddSingleton<UndoManager>();
        });
    }

    public async Task ExecuteDbAsync(Func<AppDbContext, Task> action)
    {
        using var scope = Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<DatabaseService>();
        await using var ctx = db.CreateDbContext();
        await action(ctx);
    }

    public async Task<T> QueryDbAsync<T>(Func<AppDbContext, Task<T>> action)
    {
        using var scope = Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<DatabaseService>();
        await using var ctx = db.CreateDbContext();
        return await action(ctx);
    }

    public string DataDirectoryPath => Path.Combine(_contentRoot, "Data");

    public override async ValueTask DisposeAsync()
    {
        await base.DisposeAsync();

        try
        {
            if (Directory.Exists(_contentRoot))
            {
                Directory.Delete(_contentRoot, recursive: true);
            }
        }
        catch
        {
            // Ignore temp directory cleanup failures.
        }
    }
}

internal static class FunctionalSeed
{
    public static async Task<int> GetExpenseUnreviewedIdAsync(TestWebApplicationFactory factory)
    {
        return await factory.QueryDbAsync(async ctx =>
            await ctx.ExpenseCategories.Where(c => c.Name == "Unreviewed").Select(c => c.Id).SingleAsync());
    }

    public static async Task<int> GetIncomeUnreviewedIdAsync(TestWebApplicationFactory factory)
    {
        return await factory.QueryDbAsync(async ctx =>
            await ctx.IncomeCategories.Where(c => c.Name == "Unreviewed").Select(c => c.Id).SingleAsync());
    }
}
