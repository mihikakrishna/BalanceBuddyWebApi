using System.Text.Json.Serialization;
namespace BalanceBuddyWebApi.Models;

public class IncomeCategory
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;

    [JsonIgnore]
    public ICollection<Income>? Incomes { get; set; }
}
