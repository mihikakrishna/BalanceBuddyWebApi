using System.IO;

namespace BalanceBuddyWebApi.Services.Parsers;

public interface IBankStatementParser
{
    string BankId { get; } // <- Add this
    void ParseStatement(Stream csvStream);
}