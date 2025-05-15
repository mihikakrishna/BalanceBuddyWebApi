using System.Text.Json.Serialization;
using BalanceBuddyWebApi.Models;

public class ExpenseCategory
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal? Budget { get; set; }

    [JsonIgnore]
    public ICollection<Expense>? Expenses { get; set; }
}
