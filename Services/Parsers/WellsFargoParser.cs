using System;
using System.Globalization;
using System.IO;
using CsvHelper;
using CsvHelper.Configuration;
using CsvHelper.Configuration.Attributes;
using BalanceBuddyWebApi.Models;
using BalanceBuddyWebApi.Data;

namespace BalanceBuddyWebApi.Services.Parsers;

public class WellsFargoStatementRecord
{
    [Index(0)]
    public DateTime Date { get; set; }

    [Index(1)]
    public decimal Amount { get; set; }

    [Index(4)]
    public string Description { get; set; }
}

public class WellsFargoParser : IBankStatementParser
{
    public string BankId => "Wells Fargo";
    private readonly AppDbContext _context;

    public WellsFargoParser(AppDbContext context) => _context = context;

    public void ParseStatement(Stream csvStream)
    {
        using var reader = new StreamReader(csvStream);
        using var csv = new CsvReader(reader, new CsvConfiguration(CultureInfo.InvariantCulture)
        {
            HasHeaderRecord = false,
            IgnoreBlankLines = true
        });

        var defaultExpenseCatId = _context.ExpenseCategories.FirstOrDefault(c => c.Name == "Unreviewed")?.Id ?? 0;
        var defaultIncomeCatId = _context.IncomeCategories.FirstOrDefault(c => c.Name == "Unreviewed")?.Id ?? 0;

        foreach (var record in csv.GetRecords<WellsFargoStatementRecord>())
        {
            if (record.Amount <= 0)
            {
                _context.Expenses.Add(new Expense
                {
                    Amount = -record.Amount,
                    Date = record.Date,
                    Description = record.Description,
                    CategoryId = defaultExpenseCatId,
                    BankIconPath = "/images/WellsFargoLogo.png"
                });
            }
            else
            {
                _context.Incomes.Add(new Income
                {
                    Amount = record.Amount,
                    Date = record.Date,
                    Description = record.Description,
                    CategoryId = defaultIncomeCatId,
                    BankIconPath = "/images/WellsFargoLogo.png"
                });
            }
        }

        _context.SaveChanges();
    }
}
