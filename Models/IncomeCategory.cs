namespace BalanceBuddyWebApi.Models;

public class IncomeCategory
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;

    public ICollection<Income>? Incomes { get; set; }
}