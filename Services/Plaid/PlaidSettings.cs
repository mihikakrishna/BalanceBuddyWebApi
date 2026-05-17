namespace BalanceBuddyWebApi.Services.Plaid;

public sealed class PlaidSettings
{
    public const string SectionName = "Plaid";

    public string BaseUrl { get; set; } = "https://sandbox.plaid.com";
    public string Environment { get; set; } = "sandbox";
    public string ClientId { get; set; } = string.Empty;
    public string Secret { get; set; } = string.Empty;
    public string ClientName { get; set; } = "BalanceBuddy";
    public string Language { get; set; } = "en";
    public string? WebhookUrl { get; set; }
    public string? RedirectUri { get; set; }
    public List<string> CountryCodes { get; set; } = new();
    public List<string> Products { get; set; } = new();
}
