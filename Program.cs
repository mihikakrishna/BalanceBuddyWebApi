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

/* ───────────── domain singletons ───────────── */
builder.Services.AddSingleton<DatabaseService>();        // ① central DB manager
builder.Services.AddSingleton<UndoManager>();

/* ───────────── per-request DbContext via the service ───────────── */
builder.Services.AddScoped<AppDbContext>(sp =>
{
    var svc = sp.GetRequiredService<DatabaseService>();
    return svc.CreateDbContext();                         // throws if no DB yet
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

    // always guarantee one DB exists so API works immediately
    svc.CreateNew(Path.Combine(dataDir, "balancebuddy.db"));
}

/* ───────────── standard middleware ───────────── */
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseAuthorization();
app.MapControllers();
app.Run();
