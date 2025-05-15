namespace BalanceBuddyWebApi.Models;

public class BankAccount
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal Balance { get; set; }
    public string? Description { get; set; }
}