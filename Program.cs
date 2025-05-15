using BalanceBuddyWebApi.Data;
using BalanceBuddyWebApi.Services;
using Microsoft.EntityFrameworkCore;
using BalanceBuddyWebApi.Services.Parsers;
using System.Diagnostics;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Add EF Core with factory support (safe for singleton)
builder.Services.AddDbContextFactory<AppDbContext>(options =>
    options.UseSqlite("Data Source=balancebuddy.db"));

builder.Services.AddSingleton<UndoManager>();

builder.Services.AddDbContextFactory<AppDbContext>();
builder.Services.AddSingleton<UndoManager>();

builder.Services.AddScoped<IBankStatementParser, WellsFargoParser>();
builder.Services.AddScoped<IBankStatementParser, ChaseParser>();
builder.Services.AddScoped<IBankStatementParser, AmericanExpressParser>();
builder.Services.AddScoped<IBankStatementParser, BankOfAmericaParser>();
builder.Services.AddScoped<IBankStatementParser, CapitalOneCreditParser>();
builder.Services.AddScoped<IBankStatementParser, CapitalOneSavingsParser>();
builder.Services.AddScoped<BankStatementParserRegistry>();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var factory = scope.ServiceProvider.GetRequiredService<IDbContextFactory<AppDbContext>>();
    using var db = factory.CreateDbContext();

    db.Database.Migrate();

    if (!db.ExpenseCategories.Any(c => c.Name == "Unreviewed"))
    {
        db.ExpenseCategories.Add(new ExpenseCategory
        {
            Name = "Unreviewed",
            Budget = null
        });
        db.SaveChanges();
    }
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseAuthorization();
app.MapControllers();
app.Run();
