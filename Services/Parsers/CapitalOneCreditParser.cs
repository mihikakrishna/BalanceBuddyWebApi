using System;
using System.Globalization;
using System.IO;
using CsvHelper;
using CsvHelper.Configuration;
using CsvHelper.Configuration.Attributes;
using BalanceBuddyWebApi.Models;
using BalanceBuddyWebApi.Data;

namespace BalanceBuddyWebApi.Services.Parsers;

public class CapitalOneCreditStatementRecord
{
    [Index(1)]
    public DateTime Date { get; set; }

    [Index(3)]
    public string Description { get; set; }

    [Index(5)]
    public decimal? Debit { get; set; }

    [Index(6)]
    public decimal? Credit { get; set; }
}

public class CapitalOneCreditParser : IBankStatementParser
{
    public string BankId => "Capital One Credit";
    private readonly AppDbContext _context;

    public CapitalOneCreditParser(AppDbContext context) => _context = context;

    public void ParseStatement(Stream csvStream)
    {
        using var reader = new StreamReader(csvStream);
        using var csv = new CsvReader(reader, new CsvConfiguration(CultureInfo.InvariantCulture)
        {
            HasHeaderRecord = true,
            IgnoreBlankLines = true
        });

        var records = csv.GetRecords<CapitalOneCreditStatementRecord>();
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
            defaultIncomeCategory = new IncomeCategory { Name = "Unreviewed"};
            _context.IncomeCategories.Add(defaultIncomeCategory);
            _context.SaveChanges();
        }

        foreach (var record in records)
        {
            if (record.Debit is >= 0)
            {
                _context.Expenses.Add(new Expense
                {
                    Amount = record.Debit.Value,
                    Date = record.Date,
                    Description = record.Description,
                    CategoryId = defaultExpenseCategory.Id,
                    BankIconPath = "/Images/CapitalOneCreditLogo.jpg"
                });
            }
            else if (record.Credit is > 0)
            {
                _context.Incomes.Add(new Income
                {
                    Amount = record.Credit.Value,
                    Date = record.Date,
                    Description = record.Description,
                    CategoryId = defaultIncomeCategory.Id,
                    BankIconPath = "/Images/CapitalOneCreditLogo.jpg"
                });
            }
        }

        _context.SaveChanges();
    }
}
