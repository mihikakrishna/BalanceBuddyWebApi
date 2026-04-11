using BalanceBuddyWebApi.Data;
using BalanceBuddyWebApi.Models;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Storage;

namespace BalanceBuddyWebApi.Services;

public sealed class DatabaseService
{
    private readonly object _gate = new();
    private string? _dbPath;
    private string ConnStr => $"Data Source={_dbPath};Cache=Shared";

    public DatabaseService() { }

    public bool HasOpenDatabase =>
        _dbPath is { Length: > 0 } && File.Exists(_dbPath);

    public string CurrentFileName =>
        HasOpenDatabase ? Path.GetFileName(_dbPath) : "[No Database Open]";


    public void CreateNew(string path)
    {
        _dbPath = path;
        if (!File.Exists(path))
        {
            Directory.CreateDirectory(Path.GetDirectoryName(path)!);
            using (File.Create(path)) { }
        }
        EnsureSchemaAndDefaults();
    }

    public void OpenExisting(string path)
    {
        if (!File.Exists(path))
            throw new FileNotFoundException("Database file not found.", path);

        _dbPath = path;
        EnsureSchemaAndDefaults();
    }

    public void ExportTo(string dest)
    {
        if (!HasOpenDatabase) throw new InvalidOperationException("No DB open.");
        File.Copy(_dbPath!, dest, overwrite: true);
    }

    /* ------------- DbContext factory ------------- */

    public AppDbContext CreateDbContext()
    {
        if (!HasOpenDatabase)
            throw new InvalidOperationException("No database is open.");

        var opts = new DbContextOptionsBuilder<AppDbContext>()
                   .UseSqlite(ConnStr)
                   .Options;
        return new AppDbContext(opts);
    }

    /* ------------- migrate & seed ------------- */

    private void EnsureSchemaAndDefaults()
    {
        using var ctx = CreateDbContext();

        if (!ctx.Database.GetService<IRelationalDatabaseCreator>().Exists())
        {
            ctx.Database.Migrate();
        }
        else
        {
            var hasHistory =
                ctx.Database.ExecuteSqlRaw(
                    "SELECT name FROM sqlite_master WHERE type='table' AND name='__EFMigrationsHistory';") > 0;

            if (hasHistory)
            {
                if (ctx.Database.GetPendingMigrations().Any())
                    ctx.Database.Migrate();
            }
            else
            {
                ctx.Database.EnsureCreated();
            }
        }

        if (!ctx.ExpenseCategories.Any())
        {
            ctx.ExpenseCategories.AddRange(
                new ExpenseCategory { Name = "Unreviewed" },
                new ExpenseCategory { Name = "Miscellaneous" },
                new ExpenseCategory { Name = "Housing" },
                new ExpenseCategory { Name = "Food" },
                new ExpenseCategory { Name = "Travel" },
                new ExpenseCategory { Name = "Utilities" },
                new ExpenseCategory { Name = "Healthcare" },
                new ExpenseCategory { Name = "Entertainment" });

            ctx.IncomeCategories.AddRange(
                new IncomeCategory { Name = "Unreviewed" },
                new IncomeCategory { Name = "Other" },
                new IncomeCategory { Name = "Job" });

            ctx.SaveChanges();
        }

        ctx.Database.ExecuteSqlRaw(
            """
            CREATE TABLE IF NOT EXISTS CreditCards (
                Id INTEGER NOT NULL CONSTRAINT PK_CreditCards PRIMARY KEY AUTOINCREMENT,
                CardName TEXT NOT NULL,
                Issuer TEXT NOT NULL,
                Last4 TEXT NULL,
                OpenedDate TEXT NOT NULL,
                AnnualFee TEXT NOT NULL,
                CreditLimit TEXT NOT NULL DEFAULT 0,
                PointsBalance INTEGER NOT NULL,
                ReminderDate TEXT NULL,
                Notes TEXT NULL,
                IsClosed INTEGER NOT NULL,
                ClosedDate TEXT NULL
            );
            """);

        EnsureCreditCardsColumnExists("CreditLimit", "TEXT NOT NULL DEFAULT 0");
    }

    private void EnsureCreditCardsColumnExists(string columnName, string columnDefinition)
    {
        using var connection = new SqliteConnection(ConnStr);
        connection.Open();

        using var pragma = connection.CreateCommand();
        pragma.CommandText = "PRAGMA table_info(CreditCards);";

        var exists = false;
        using (var reader = pragma.ExecuteReader())
        {
            while (reader.Read())
            {
                if (string.Equals(reader.GetString(1), columnName, StringComparison.OrdinalIgnoreCase))
                {
                    exists = true;
                    break;
                }
            }
        }

        if (exists) return;

        using var alter = connection.CreateCommand();
        alter.CommandText = $"ALTER TABLE CreditCards ADD COLUMN {columnName} {columnDefinition};";
        alter.ExecuteNonQuery();
    }
}
