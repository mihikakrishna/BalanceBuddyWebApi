using BalanceBuddyWebApi.Models;
using BalanceBuddyWebApi.Services;
using Xunit;

namespace BalanceBuddy.UnitTests;

public class DatabaseServiceTests
{
    [Fact]
    public void CreateDbContext_Throws_WhenDatabaseNotOpen()
    {
        var sut = new DatabaseService();

        var ex = Assert.Throws<InvalidOperationException>(() => sut.CreateDbContext());

        Assert.Equal("No database is open.", ex.Message);
    }

    [Fact]
    public void OpenExisting_Throws_WhenFileDoesNotExist()
    {
        using var scope = new TestDatabaseScope();
        var sut = new DatabaseService();

        Assert.Throws<FileNotFoundException>(() => sut.OpenExisting(scope.DatabasePath));
    }

    [Fact]
    public void CreateNew_CreatesDatabaseAndSeedsDefaults()
    {
        using var scope = new TestDatabaseScope();
        var sut = new DatabaseService();

        sut.CreateNew(scope.DatabasePath);

        Assert.True(File.Exists(scope.DatabasePath));
        Assert.True(sut.HasOpenDatabase);
        Assert.Equal("test.db", sut.CurrentFileName);

        using var ctx = sut.CreateDbContext();
        Assert.Contains(ctx.ExpenseCategories, c => c.Name == "Unreviewed");
        Assert.Contains(ctx.IncomeCategories, c => c.Name == "Unreviewed");
    }

    [Fact]
    public void OpenExisting_SeedsDefaults_WhenDatabaseHasNoCategories()
    {
        using var scope = new TestDatabaseScope();

        using (var raw = scope.CreateRawContext())
        {
            raw.ExpenseCategories.RemoveRange(raw.ExpenseCategories);
            raw.IncomeCategories.RemoveRange(raw.IncomeCategories);
            raw.SaveChanges();
        }

        var sut = new DatabaseService();
        sut.OpenExisting(scope.DatabasePath);

        using var ctx = sut.CreateDbContext();
        Assert.NotEmpty(ctx.ExpenseCategories);
        Assert.NotEmpty(ctx.IncomeCategories);
    }

    [Fact]
    public void ExportTo_CopiesOpenedDatabase()
    {
        using var scope = new TestDatabaseScope();
        var sut = scope.CreateServiceWithNewDatabase();

        using (var ctx = sut.CreateDbContext())
        {
            var categoryId = ctx.IncomeCategories.First(c => c.Name == "Unreviewed").Id;
            ctx.Incomes.Add(new Income
            {
                Amount = 42.5m,
                Date = new DateTime(2026, 1, 20),
                Description = "Export marker",
                CategoryId = categoryId
            });
            ctx.SaveChanges();
        }

        var exportPath = Path.Combine(Path.GetDirectoryName(scope.DatabasePath)!, "export.db");
        sut.ExportTo(exportPath);

        Assert.True(File.Exists(exportPath));
        Assert.True(new FileInfo(exportPath).Length > 0);
    }

    [Fact]
    public void ExportTo_Throws_WhenDatabaseNotOpen()
    {
        var sut = new DatabaseService();

        var ex = Assert.Throws<InvalidOperationException>(() => sut.ExportTo(Path.GetTempFileName()));

        Assert.Equal("No DB open.", ex.Message);
    }
}
