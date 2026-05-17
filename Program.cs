using BalanceBuddyWebApi.Data;
using BalanceBuddyWebApi.Models;
using BalanceBuddyWebApi.Services;
using BalanceBuddyWebApi.Services.Parsers;
using BalanceBuddyWebApi.Services.Plaid;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System.Net.Http.Headers;

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
builder.Services.Configure<PlaidSettings>(builder.Configuration.GetSection(PlaidSettings.SectionName));
builder.Services.PostConfigure<PlaidSettings>(settings =>
{
    settings.CountryCodes = settings.CountryCodes
        .Where(code => !string.IsNullOrWhiteSpace(code))
        .Select(code => code.Trim())
        .Distinct(StringComparer.OrdinalIgnoreCase)
        .ToList();

    settings.Products = settings.Products
        .Where(product => !string.IsNullOrWhiteSpace(product))
        .Select(product => product.Trim())
        .Distinct(StringComparer.OrdinalIgnoreCase)
        .ToList();

    if (settings.CountryCodes.Count == 0)
    {
        settings.CountryCodes.Add("US");
    }

    if (settings.Products.Count == 0)
    {
        settings.Products.Add("transactions");
    }
});
builder.Services.AddHttpClient<IPlaidApiClient, PlaidApiClient>((sp, client) =>
{
    var settings = sp.GetRequiredService<IOptions<PlaidSettings>>().Value;

    if (Uri.TryCreate(settings.BaseUrl, UriKind.Absolute, out var baseUri))
    {
        client.BaseAddress = baseUri;
    }

    client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
});
builder.Services.AddScoped<IPlaidLinkService, PlaidLinkService>();
builder.Services.AddScoped<IPlaidItemCredentialStore, DbPlaidItemCredentialStore>();

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
var plaidSettings = app.Services.GetRequiredService<IOptions<PlaidSettings>>().Value;
var startupLogger = app.Services.GetRequiredService<ILogger<Program>>();

startupLogger.LogInformation(
    "Plaid startup config loaded. Environment={Environment}; BaseUrl={BaseUrl}; Products=[{Products}]; CountryCodes=[{CountryCodes}]; ClientIdConfigured={ClientIdConfigured}; SecretConfigured={SecretConfigured}",
    plaidSettings.Environment,
    plaidSettings.BaseUrl,
    string.Join(", ", plaidSettings.Products),
    string.Join(", ", plaidSettings.CountryCodes),
    !string.IsNullOrWhiteSpace(plaidSettings.ClientId),
    !string.IsNullOrWhiteSpace(plaidSettings.Secret));

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
