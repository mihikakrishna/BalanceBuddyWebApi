using System;
using System.Globalization;
using System.IO;
using CsvHelper;
using CsvHelper.Configuration;
using CsvHelper.Configuration.Attributes;
using BalanceBuddyWebApi.Models;

namespace BalanceBuddyWebApi.Services.Parsers;

public class ChaseStatementRecord
{
    [Index(1)]
    public DateTime Date { get; set; }

    [Index(2)]
    public string Description { get; set; }

    [Index(5)]
    public decimal Amount { get; set; }
}

public class ChaseParser : IBankStatementParser
{
    public string BankId => "Chase";
    private readonly AppDbContext _context;
    public ChaseParser(AppDbContext context) => _context = context;

    public void ParseStatement(Stream csvStream)
    {
        var records = new CsvReader(new StreamReader(csvStream), new CsvConfiguration(CultureInfo.InvariantCulture)
        {
            Delimiter = ",",
            HasHeaderRecord = true
        }).GetRecords<ChaseStatementRecord>();

        var expenseCatId = _context.ExpenseCategories.FirstOrDefault(c => c.Name == "Unreviewed")?.Id ?? 0;
        var incomeCatId = _context.IncomeCategories.FirstOrDefault(c => c.Name == "Unreviewed")?.Id ?? 0;

        foreach (var r in records)
        {
            if (r.Amount < 0)
            {
                _context.Expenses.Add(new Expense
                {
                    Amount = -r.Amount,
                    Date = r.Date,
                    Description = r.Description,
                    CategoryId = expenseCatId,
                    BankIconPath = "/images/ChaseLogo.png"
                });
            }
            else
            {
                _context.Incomes.Add(new Income
                {
                    Amount = r.Amount,
                    Date = r.Date,
                    Description = r.Description,
                    CategoryId = incomeCatId,
                    BankIconPath = "/images/ChaseLogo.png"
                });
            }
        }
        _context.SaveChanges();
    }
}
