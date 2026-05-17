using System.Net.Http.Json;
using System.Text.Json;

namespace BalanceBuddyWebApi.Services.Plaid;

public sealed class PlaidApiClient : IPlaidApiClient
{
    private static readonly JsonSerializerOptions SerializerOptions = new(JsonSerializerDefaults.Web);
    private readonly HttpClient _httpClient;

    public PlaidApiClient(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    public Task<PlaidLinkTokenApiResponse> CreateLinkTokenAsync(PlaidCreateLinkTokenApiRequest request, CancellationToken cancellationToken)
        => PostAsync<PlaidLinkTokenApiResponse>("/link/token/create", request, cancellationToken);

    public Task<PlaidExchangePublicTokenApiResponse> ExchangePublicTokenAsync(PlaidExchangePublicTokenApiRequest request, CancellationToken cancellationToken)
        => PostAsync<PlaidExchangePublicTokenApiResponse>("/item/public_token/exchange", request, cancellationToken);

    private async Task<TResponse> PostAsync<TResponse>(string path, object body, CancellationToken cancellationToken)
    {
        using var response = await _httpClient.PostAsJsonAsync(path, body, SerializerOptions, cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            var rawContent = await response.Content.ReadAsStringAsync(cancellationToken);
            PlaidErrorResponse? error = null;

            if (!string.IsNullOrWhiteSpace(rawContent))
            {
                try
                {
                    error = JsonSerializer.Deserialize<PlaidErrorResponse>(rawContent, SerializerOptions);
                }
                catch (JsonException)
                {
                    error = null;
                }
            }

            var message = error?.ErrorMessage;
            if (string.IsNullOrWhiteSpace(message))
            {
                message = !string.IsNullOrWhiteSpace(rawContent)
                    ? $"Plaid API call failed with status {(int)response.StatusCode}. Body: {rawContent}"
                    : $"Plaid API call failed with status {(int)response.StatusCode}.";
            }

            throw new PlaidApiException((int)response.StatusCode, message, error?.RequestId);
        }

        TResponse? payload;
        try
        {
            payload = await response.Content.ReadFromJsonAsync<TResponse>(SerializerOptions, cancellationToken);
        }
        catch (JsonException)
        {
            throw new PlaidApiException((int)response.StatusCode, "Plaid API returned an invalid or empty JSON response body.");
        }

        if (payload is null)
        {
            throw new PlaidApiException((int)response.StatusCode, "Plaid API returned an empty response body.");
        }

        return payload;
    }
}
