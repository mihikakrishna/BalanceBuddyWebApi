using System;
using System.Globalization;
using System.IO;
using CsvHelper;
using CsvHelper.Configuration;
using CsvHelper.Configuration.Attributes;
using BalanceBuddyWebApi.Models;
using BalanceBuddyWebApi.Data;

namespace BalanceBuddyWebApi.Services.Parsers;

public class CapitalOneSavingsStatementRecord
{
    [Index(1)]
    public string Description { get; set; }

    [Index(2)]
    public DateTime Date { get; set; }

    [Index(3)]
    public string TransactionType { get; set; }

    [Index(4)]
    public decimal Amount { get; set; }
}

public class CapitalOneSavingsParser : IBankStatementParser
{
    public string BankId => "Capital One Debit/Savings Account";
    private readonly AppDbContext _context;

    public CapitalOneSavingsParser(AppDbContext context) => _context = context;

    public void ParseStatement(Stream csvStream)
    {
        using var reader = new StreamReader(csvStream);
        using var csv = new CsvReader(reader, new CsvConfiguration(CultureInfo.InvariantCulture)
        {
            HasHeaderRecord = true,
            IgnoreBlankLines = true
        });

        var defaultExpenseCatId = _context.ExpenseCategories.FirstOrDefault(c => c.Name == "Unreviewed")?.Id ?? 0;
        var defaultIncomeCatId = _context.IncomeCategories.FirstOrDefault(c => c.Name == "Unreviewed")?.Id ?? 0;

        foreach (var record in csv.GetRecords<CapitalOneSavingsStatementRecord>())
        {
            if (record.TransactionType.Equals("Debit", StringComparison.OrdinalIgnoreCase))
            {
                _context.Expenses.Add(new Expense
                {
                    Amount = record.Amount,
                    Date = record.Date,
                    Description = record.Description,
                    CategoryId = defaultExpenseCatId,
                    BankIconPath = "/images/CapitalOneSavingsLogo.jpg"
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
                    BankIconPath = "/images/CapitalOneSavingsLogo.jpg"
                });
            }
        }

        _context.SaveChanges();
    }
}