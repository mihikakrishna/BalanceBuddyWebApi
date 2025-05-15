using System;
using System.Globalization;
using System.IO;
using CsvHelper;
using CsvHelper.Configuration;
using CsvHelper.Configuration.Attributes;
using BalanceBuddyWebApi.Models;
using System.Linq;
using BalanceBuddyWebApi.Data;

namespace BalanceBuddyWebApi.Services.Parsers;

public class AmericanExpressStatementRecord
{
    [Index(0)]
    public DateTime Date { get; set; }

    [Index(1)]
    public string Description { get; set; }

    [Index(2)]
    public decimal Amount { get; set; }
}

public class AmericanExpressParser : IBankStatementParser
{
    public string BankId => "American Express";

    private readonly AppDbContext _context;

    public AmericanExpressParser(AppDbContext context)
    {
        _context = context;
    }

    public void ParseStatement(Stream csvStream)
    {
        using var reader = new StreamReader(csvStream);
        using var csv = new CsvReader(reader, new CsvConfiguration(CultureInfo.InvariantCulture)
        {
            Delimiter = ",",
            HasHeaderRecord = true,
            IgnoreBlankLines = true
        });

        var records = csv.GetRecords<AmericanExpressStatementRecord>();

        var defaultExpenseCat = _context.ExpenseCategories.FirstOrDefault(c => c.Name == "Unreviewed");
        var defaultIncomeCat = _context.IncomeCategories.FirstOrDefault(c => c.Name == "Unreviewed");

        foreach (var record in records)
        {
            if (record.Amount >= 0)
            {
                var expense = new Expense
                {
                    Amount = record.Amount,
                    Date = record.Date,
                    Description = record.Description,
                    CategoryId = defaultExpenseCat?.Id ?? 0,
                    BankIconPath = "/images/AmericanExpressLogo.png"
                };
                _context.Expenses.Add(expense);
            }
            else
            {
                var income = new Income
                {
                    Amount = -record.Amount,
                    Date = record.Date,
                    Description = record.Description,
                    CategoryId = defaultIncomeCat?.Id ?? 0,
                    BankIconPath = "/images/AmericanExpressLogo.png"
                };
                _context.Incomes.Add(income);
            }
        }

        _context.SaveChanges();
    }
}

