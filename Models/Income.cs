namespace BalanceBuddyWebApi.Models;

public class Income
{
    public int Id { get; set; }
    public decimal Amount { get; set; }
    public DateTime Date { get; set; }
    public string? Description { get; set; }
    public string? BankIconPath { get; set; }

    // Foreign key
    public int CategoryId { get; set; }
    public IncomeCategory? Category { get; set; }
}