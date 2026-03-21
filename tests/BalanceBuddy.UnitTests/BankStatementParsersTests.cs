using System.Text;
using BalanceBuddyWebApi.Services.Parsers;
using Xunit;

namespace BalanceBuddy.UnitTests;

public class BankStatementParsersTests
{
    [Fact]
    public void WellsFargoParser_MapsNegativeToExpense_AndPositiveToIncome()
    {
        using var scope = new TestDatabaseScope();
        var service = scope.CreateServiceWithNewDatabase();
        using var ctx = service.CreateDbContext();

        var sut = new WellsFargoParser(ctx);
        using var csv = Csv(
            "2026-01-15,-12.34,,,Coffee",
            "2026-01-16,2500,,,Payroll");

        sut.ParseStatement(csv);

        var expense = Assert.Single(ctx.Expenses);
        var income = Assert.Single(ctx.Incomes);
        Assert.Equal(12.34m, expense.Amount);
        Assert.Equal(2500m, income.Amount);
        Assert.Equal("/Images/WellsFargoLogo.png", expense.BankIconPath);
        Assert.Equal("/Images/WellsFargoLogo.png", income.BankIconPath);
    }

    [Fact]
    public void ChaseParser_MapsNegativeToExpense_AndPositiveToIncome()
    {
        using var scope = new TestDatabaseScope();
        var service = scope.CreateServiceWithNewDatabase();
        using var ctx = service.CreateDbContext();

        var sut = new ChaseParser(ctx);
        using var csv = Csv(
            "c0,c1,c2,c3,c4,c5",
            "x,2026-01-15,Coffee,x,x,-25.50",
            "x,2026-01-16,Payroll,x,x,700.00");

        sut.ParseStatement(csv);

        var expense = Assert.Single(ctx.Expenses);
        var income = Assert.Single(ctx.Incomes);
        Assert.Equal(25.50m, expense.Amount);
        Assert.Equal(700.00m, income.Amount);
        Assert.Equal("/Images/ChaseLogo.png", expense.BankIconPath);
        Assert.Equal("/Images/ChaseLogo.png", income.BankIconPath);
    }

    [Fact]
    public void AmericanExpressParser_MapsPositiveToExpense_AndNegativeToIncome()
    {
        using var scope = new TestDatabaseScope();
        var service = scope.CreateServiceWithNewDatabase();
        using var ctx = service.CreateDbContext();

        var sut = new AmericanExpressParser(ctx);
        using var csv = Csv(
            "Date,Description,Amount",
            "2026-01-15,Restaurant,40.00",
            "2026-01-16,Refund,-12.00");

        sut.ParseStatement(csv);

        var expense = Assert.Single(ctx.Expenses);
        var income = Assert.Single(ctx.Incomes);
        Assert.Equal(40.00m, expense.Amount);
        Assert.Equal(12.00m, income.Amount);
        Assert.Equal("/Images/AmericanExpressLogo.png", expense.BankIconPath);
        Assert.Equal("/Images/AmericanExpressLogo.png", income.BankIconPath);
    }

    [Fact]
    public void BankOfAmericaParser_MapsNegativeToExpense_AndPositiveToIncome()
    {
        using var scope = new TestDatabaseScope();
        var service = scope.CreateServiceWithNewDatabase();
        using var ctx = service.CreateDbContext();

        var sut = new BankOfAmericaParser(ctx);
        using var csv = Csv(
            "c0,c1,c2,c3,c4",
            "2026-01-15,x,Groceries,x,-60.25",
            "2026-01-16,x,Deposit,x,1250.00");

        sut.ParseStatement(csv);

        var expense = Assert.Single(ctx.Expenses);
        var income = Assert.Single(ctx.Incomes);
        Assert.Equal(60.25m, expense.Amount);
        Assert.Equal(1250.00m, income.Amount);
        Assert.Equal("/Images/BankOfAmericaLogo.png", expense.BankIconPath);
        Assert.Equal("/Images/BankOfAmericaLogo.png", income.BankIconPath);
    }

    [Fact]
    public void CapitalOneCreditParser_MapsDebitToExpense_AndCreditToIncome()
    {
        using var scope = new TestDatabaseScope();
        var service = scope.CreateServiceWithNewDatabase();
        using var ctx = service.CreateDbContext();

        var sut = new CapitalOneCreditParser(ctx);
        using var csv = Csv(
            "c0,c1,c2,c3,c4,c5,c6",
            "x,2026-01-15,x,Coffee,x,18.75,",
            "x,2026-01-16,x,Refund,x,,5.50");

        sut.ParseStatement(csv);

        var expense = Assert.Single(ctx.Expenses);
        var income = Assert.Single(ctx.Incomes);
        Assert.Equal(18.75m, expense.Amount);
        Assert.Equal(5.50m, income.Amount);
        Assert.Equal("/Images/CapitalOneCreditLogo.jpg", expense.BankIconPath);
        Assert.Equal("/Images/CapitalOneCreditLogo.jpg", income.BankIconPath);
    }

    [Fact]
    public void CapitalOneSavingsParser_MapsDebitToExpense_OtherToIncome()
    {
        using var scope = new TestDatabaseScope();
        var service = scope.CreateServiceWithNewDatabase();
        using var ctx = service.CreateDbContext();

        var sut = new CapitalOneSavingsParser(ctx);
        using var csv = Csv(
            "c0,c1,c2,c3,c4",
            "x,Card purchase,2026-01-15,Debit,15.00",
            "x,Interest,2026-01-16,Credit,2.50");

        sut.ParseStatement(csv);

        var expense = Assert.Single(ctx.Expenses);
        var income = Assert.Single(ctx.Incomes);
        Assert.Equal(15.00m, expense.Amount);
        Assert.Equal(2.50m, income.Amount);
        Assert.Equal("/Images/CapitalOneSavingsLogo.jpg", expense.BankIconPath);
        Assert.Equal("/Images/CapitalOneSavingsLogo.jpg", income.BankIconPath);
    }

    [Theory]
    [InlineData("wells")]
    [InlineData("chase")]
    [InlineData("amex")]
    [InlineData("boa")]
    [InlineData("co-credit")]
    [InlineData("co-savings")]
    public void Parsers_CreateUnreviewedCategories_WhenMissing(string parserId)
    {
        using var scope = new TestDatabaseScope();
        var service = scope.CreateServiceWithNewDatabase();

        using (var setup = service.CreateDbContext())
        {
            setup.Expenses.RemoveRange(setup.Expenses);
            setup.Incomes.RemoveRange(setup.Incomes);
            setup.ExpenseCategories.RemoveRange(setup.ExpenseCategories);
            setup.IncomeCategories.RemoveRange(setup.IncomeCategories);
            setup.SaveChanges();
        }

        using var ctx = service.CreateDbContext();
        var parser = BuildParser(parserId, ctx);
        using var csv = CsvForParser(parserId);

        parser.ParseStatement(csv);

        Assert.Contains(ctx.ExpenseCategories, c => c.Name == "Unreviewed");
        Assert.Contains(ctx.IncomeCategories, c => c.Name == "Unreviewed");
    }

    [Fact]
    public void WellsFargoParser_Throws_OnMalformedCsv()
    {
        using var scope = new TestDatabaseScope();
        var service = scope.CreateServiceWithNewDatabase();
        using var ctx = service.CreateDbContext();

        var sut = new WellsFargoParser(ctx);
        using var csv = Csv("not-a-date,-12,,,Bad row");

        Assert.ThrowsAny<Exception>(() => sut.ParseStatement(csv));
    }

    private static IBankStatementParser BuildParser(string parserId, BalanceBuddyWebApi.Data.AppDbContext ctx)
    {
        return parserId switch
        {
            "wells" => new WellsFargoParser(ctx),
            "chase" => new ChaseParser(ctx),
            "amex" => new AmericanExpressParser(ctx),
            "boa" => new BankOfAmericaParser(ctx),
            "co-credit" => new CapitalOneCreditParser(ctx),
            "co-savings" => new CapitalOneSavingsParser(ctx),
            _ => throw new ArgumentOutOfRangeException(nameof(parserId), parserId, null)
        };
    }

    private static MemoryStream CsvForParser(string parserId)
    {
        return parserId switch
        {
            "wells" => Csv("2026-01-15,-5,,,Coffee"),
            "chase" => Csv("h1,h2,h3,h4,h5,h6", "x,2026-01-15,Coffee,x,x,-5"),
            "amex" => Csv("Date,Description,Amount", "2026-01-15,Store,10"),
            "boa" => Csv("h1,h2,h3,h4,h5", "2026-01-15,x,Store,x,-5"),
            "co-credit" => Csv("h1,h2,h3,h4,h5,h6,h7", "x,2026-01-15,x,Store,x,5,"),
            "co-savings" => Csv("h1,h2,h3,h4,h5", "x,Store,2026-01-15,Debit,5"),
            _ => throw new ArgumentOutOfRangeException(nameof(parserId), parserId, null)
        };
    }

    private static MemoryStream Csv(params string[] lines)
    {
        var content = string.Join(Environment.NewLine, lines);
        return new MemoryStream(Encoding.UTF8.GetBytes(content));
    }
}
