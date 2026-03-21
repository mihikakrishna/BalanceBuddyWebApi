using BalanceBuddyWebApi.Data;
using BalanceBuddyWebApi.Services;
using Microsoft.EntityFrameworkCore;

namespace BalanceBuddy.UnitTests;

internal sealed class TestDatabaseScope : IDisposable
{
    private readonly string _root;

    public TestDatabaseScope()
    {
        _root = Path.Combine(Path.GetTempPath(), "bb-unit-" + Guid.NewGuid().ToString("N"));
        Directory.CreateDirectory(_root);
        DatabasePath = Path.Combine(_root, "test.db");
    }

    public string DatabasePath { get; }

    public DatabaseService CreateServiceWithNewDatabase()
    {
        var service = new DatabaseService();
        service.CreateNew(DatabasePath);
        return service;
    }

    public AppDbContext CreateRawContext(bool ensureCreated = true)
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseSqlite($"Data Source={DatabasePath};Cache=Shared")
            .Options;

        var context = new AppDbContext(options);
        if (ensureCreated)
        {
            context.Database.EnsureCreated();
        }

        return context;
    }

    public void Dispose()
    {
        try
        {
            if (Directory.Exists(_root))
            {
                Directory.Delete(_root, recursive: true);
            }
        }
        catch
        {
            // Ignore temp directory cleanup failures.
        }
    }
}
