using System;
using System.Collections.Generic;
using System.Linq;

namespace BalanceBuddyWebApi.Services.Parsers;

public class BankStatementParserRegistry
{
    private readonly Dictionary<string, IBankStatementParser> _parsers;

    public BankStatementParserRegistry(IEnumerable<IBankStatementParser> parsers)
    {
        _parsers = parsers.ToDictionary(p => p.BankId, StringComparer.OrdinalIgnoreCase);
    }

    public IBankStatementParser GetParser(string bankId)
    {
        if (_parsers.TryGetValue(bankId, out var parser))
            return parser;

        throw new ArgumentException($"No parser for bank: {bankId}");
    }

    public IEnumerable<string> ListBanks() => _parsers.Keys.OrderBy(x => x);
}
