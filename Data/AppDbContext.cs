using Microsoft.EntityFrameworkCore;
using BalanceBuddyWebApi.Models;
using System.Collections.Generic;
using System.Reflection.Emit;

namespace BalanceBuddyWebApi.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Expense> Expenses => Set<Expense>();
    public DbSet<Income> Incomes => Set<Income>();
    public DbSet<BankAccount> BankAccounts => Set<BankAccount>();
    public DbSet<ExpenseCategory> ExpenseCategories => Set<ExpenseCategory>();
    public DbSet<IncomeCategory> IncomeCategories => Set<IncomeCategory>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Optional: configure cascading deletes, default values, etc.
        modelBuilder.Entity<ExpenseCategory>().HasMany(c => c.Expenses).WithOne(e => e.Category).HasForeignKey(e => e.CategoryId).OnDelete(DeleteBehavior.SetNull);
        modelBuilder.Entity<IncomeCategory>().HasMany(c => c.Incomes).WithOne(i => i.Category).HasForeignKey(i => i.CategoryId).OnDelete(DeleteBehavior.SetNull);
    }
}
