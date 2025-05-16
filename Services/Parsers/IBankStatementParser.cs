using System.IO;

namespace BalanceBuddyWebApi.Services.Parsers;

public interface IBankStatementParser
{
    string BankId { get; }
    void ParseStatement(Stream csvStream);
}