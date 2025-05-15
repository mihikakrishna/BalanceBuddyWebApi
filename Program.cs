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
builder.Services.AddSingleton<UndoManager>();
builder.Services.AddScoped<IBankStatementParser, WellsFargoParser>();
builder.Services.AddScoped<IBankStatementParser, ChaseParser>();
builder.Services.AddScoped<IBankStatementParser, AmericanExpressParser>();
builder.Services.AddScoped<IBankStatementParser, BankOfAmericaParser>();
builder.Services.AddScoped<IBankStatementParser, CapitalOneCreditParser>();
builder.Services.AddScoped<IBankStatementParser, CapitalOneSavingsParser>();
builder.Services.AddScoped<BankStatementParserRegistry>();


// Add SQLite
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite("Data Source=balancebuddy.db")); // Use existing or new .db

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
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

    var categories = db.ExpenseCategories.ToList();
    Debug.WriteLine("=== Expense Categories in DB ===");
    foreach (var cat in categories)
    {
        Debug.WriteLine($"ID: {cat.Id}, Name: {cat.Name}, Budget: {cat.Budget}");
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
