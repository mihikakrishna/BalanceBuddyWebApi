namespace BalanceBuddyWebApi.Models;

public class PlaidItemCredential
{
    public int Id { get; set; }
    public string ItemId { get; set; } = string.Empty;
    public string AccessToken { get; set; } = string.Empty;
    public DateTime StoredAtUtc { get; set; }
}
