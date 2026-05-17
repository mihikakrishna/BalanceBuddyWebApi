namespace BalanceBuddyWebApi.Services.Plaid;

public sealed class PlaidConfigurationException : Exception
{
    public PlaidConfigurationException(string message) : base(message) { }
}

public sealed class PlaidApiException : Exception
{
    public PlaidApiException(int statusCode, string message, string? requestId = null) : base(message)
    {
        StatusCode = statusCode;
        RequestId = requestId;
    }

    public int StatusCode { get; }
    public string? RequestId { get; }
}

public sealed class PlaidCredentialPersistenceException : Exception
{
    public PlaidCredentialPersistenceException(
        string message,
        string accessToken,
        string itemId,
        string requestId,
        Exception innerException) : base(message, innerException)
    {
        AccessToken = accessToken;
        ItemId = itemId;
        RequestId = requestId;
    }

    public string AccessToken { get; }
    public string ItemId { get; }
    public string RequestId { get; }
}
