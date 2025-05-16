using System;
using System.Globalization;
using System.IO;
using CsvHelper;
using CsvHelper.Configuration;
using CsvHelper.Configuration.Attributes;
using BalanceBuddyWebApi.Models;
using BalanceBuddyWebApi.Data;

namespace BalanceBuddyWebApi.Services.Parsers;

public class BankOfAmericaStatementRecord
{
    [Index(0)]
    public DateTime Date { get; set; }

    [Index(1)]
    public string Description { get; set; }

    [Index(4)]
    public decimal Amount { get; set; }
}
public class BankOfAmericaParser : IBankStatementParser
{
    public string BankId => "American Express";

    private readonly AppDbContext _context;

    public BankOfAmericaParser(AppDbContext context)
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

        var records = csv.GetRecords<BankOfAmericaStatementRecord>();

        var defaultExpenseCategory = _context.ExpenseCategories.FirstOrDefault(c => c.Name == "Unreviewed");
        var defaultIncomeCategory = _context.IncomeCategories.FirstOrDefault(c => c.Name == "Unreviewed");

        if (defaultExpenseCategory == null)
        {
            defaultExpenseCategory = new ExpenseCategory { Name = "Unreviewed", Budget = null };
            _context.ExpenseCategories.Add(defaultExpenseCategory);
            _context.SaveChanges();
        }

        if (defaultIncomeCategory == null)
        {
            defaultIncomeCategory = new IncomeCategory { Name = "Unreviewed" };
            _context.IncomeCategories.Add(defaultIncomeCategory);
            _context.SaveChanges();
        }

        foreach (var record in records)
        {
            if (record.Amount <= 0)
            {
                var expense = new Expense
                {
                    Amount = -record.Amount,
                    Date = record.Date,
                    Description = record.Description,
                    CategoryId = defaultExpenseCategory?.Id ?? 0,
                    BankIconPath = "/images/BankOfAmericaLogo.png"
                };
                _context.Expenses.Add(expense);
            }
            else
            {
                var income = new Income
                {
                    Amount = record.Amount,
                    Date = record.Date,
                    Description = record.Description,
                    CategoryId = defaultIncomeCategory?.Id ?? 0,
                    BankIconPath = "/images/BankOfAmericaLogo.png"
                };
                _context.Incomes.Add(income);
            }
        }

        _context.SaveChanges();
    }
}


