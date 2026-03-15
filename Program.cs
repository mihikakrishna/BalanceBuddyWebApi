using BalanceBuddyWebApi.Data;
using BalanceBuddyWebApi.Models;
using BalanceBuddyWebApi.Services;
using BalanceBuddyWebApi.Services.Parsers;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

/* ───────────── core ASP.NET services ───────────── */
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddSingleton<DatabaseService>();
builder.Services.AddSingleton<UndoManager>();
builder.Services.AddScoped<AppDbContext>(sp =>
{
    var svc = sp.GetRequiredService<DatabaseService>();
    return svc.CreateDbContext();
});

/* ───────────── parsers & registry ───────────── */
builder.Services.AddScoped<IBankStatementParser, WellsFargoParser>();
builder.Services.AddScoped<IBankStatementParser, ChaseParser>();
builder.Services.AddScoped<IBankStatementParser, AmericanExpressParser>();
builder.Services.AddScoped<IBankStatementParser, BankOfAmericaParser>();
builder.Services.AddScoped<IBankStatementParser, CapitalOneCreditParser>();
builder.Services.AddScoped<IBankStatementParser, CapitalOneSavingsParser>();
builder.Services.AddScoped<BankStatementParserRegistry>();

/* ───────────── build & seed default DB once ───────────── */
var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var svc = scope.ServiceProvider.GetRequiredService<DatabaseService>();
    var dataDir = Path.Combine(app.Environment.ContentRootPath, "Data");
    Directory.CreateDirectory(dataDir);
    svc.CreateNew(Path.Combine(dataDir, "balancebuddy.db"));
}

/* ───────────── Swagger (only dev) ───────────── */
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

/* ───────────── Serve React build ───────────── */
app.UseDefaultFiles(); // looks for index.html by default
app.UseStaticFiles();  // enables serving static files (React build)

/* ───────────── APIs ───────────── */
app.UseAuthorization();
app.MapControllers();

/* ───────────── React fallback ───────────── */
app.MapFallbackToFile("index.html"); // serve React index.html for unknown routes

app.Run();

public partial class Program { }
