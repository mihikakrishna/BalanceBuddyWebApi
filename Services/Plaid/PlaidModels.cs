using System.Text.Json.Serialization;

namespace BalanceBuddyWebApi.Services.Plaid;

public sealed record PlaidCreateLinkTokenCommand(string UserId);
public sealed record PlaidLinkTokenResult(
    string LinkToken,
    DateTimeOffset Expiration,
    string RequestId);

public sealed record PlaidExchangePublicTokenCommand(string PublicToken);

public sealed record PlaidExchangePublicTokenResult(
    string AccessToken,
    string ItemId,
    string RequestId);

public sealed class PlaidCreateLinkTokenApiRequest
{
    [JsonPropertyName("client_id")]
    public string ClientId { get; init; } = string.Empty;

    [JsonPropertyName("secret")]
    public string Secret { get; init; } = string.Empty;

    [JsonPropertyName("client_name")]
    public string ClientName { get; init; } = string.Empty;

    [JsonPropertyName("products")]
    public IReadOnlyList<string> Products { get; init; } = Array.Empty<string>();

    [JsonPropertyName("country_codes")]
    public IReadOnlyList<string> CountryCodes { get; init; } = Array.Empty<string>();

    [JsonPropertyName("language")]
    public string Language { get; init; } = "en";

    [JsonPropertyName("webhook")]
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public string? Webhook { get; init; }

    [JsonPropertyName("redirect_uri")]
    [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
    public string? RedirectUri { get; init; }

    [JsonPropertyName("user")]
    public PlaidLinkUser User { get; init; } = new();
}

public sealed class PlaidLinkUser
{
    [JsonPropertyName("client_user_id")]
    public string ClientUserId { get; init; } = string.Empty;
}

public sealed class PlaidLinkTokenApiResponse
{
    [JsonPropertyName("link_token")]
    public string LinkToken { get; init; } = string.Empty;

    [JsonPropertyName("expiration")]
    public string Expiration { get; init; } = string.Empty;

    [JsonPropertyName("request_id")]
    public string RequestId { get; init; } = string.Empty;
}

public sealed class PlaidExchangePublicTokenApiRequest
{
    [JsonPropertyName("client_id")]
    public string ClientId { get; init; } = string.Empty;

    [JsonPropertyName("secret")]
    public string Secret { get; init; } = string.Empty;

    [JsonPropertyName("public_token")]
    public string PublicToken { get; init; } = string.Empty;
}

public sealed class PlaidExchangePublicTokenApiResponse
{
    [JsonPropertyName("access_token")]
    public string AccessToken { get; init; } = string.Empty;

    [JsonPropertyName("item_id")]
    public string ItemId { get; init; } = string.Empty;

    [JsonPropertyName("request_id")]
    public string RequestId { get; init; } = string.Empty;
}

public sealed class PlaidErrorResponse
{
    [JsonPropertyName("error_message")]
    public string? ErrorMessage { get; init; }

    [JsonPropertyName("request_id")]
    public string? RequestId { get; init; }
}
