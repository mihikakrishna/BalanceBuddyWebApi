namespace BalanceBuddyWebApi.Models;

public class CreditCard
{
    public int Id { get; set; }
    public string CardName { get; set; } = string.Empty;
    public string Issuer { get; set; } = string.Empty;
    public string? Last4 { get; set; }
    public DateTime OpenedDate { get; set; }
    public decimal AnnualFee { get; set; }
    public int PointsBalance { get; set; }
    public DateTime? ReminderDate { get; set; }
    public string? Notes { get; set; }
    public bool IsClosed { get; set; }
    public DateTime? ClosedDate { get; set; }
}
