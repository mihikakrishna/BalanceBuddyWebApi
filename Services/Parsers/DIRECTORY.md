# Directory Guide

## Purpose
Bank statement CSV parser implementations and parser registry.

## Key files
- `IBankStatementParser.cs`: parser contract.
- `BankStatementParserRegistry.cs`: maps `bankId` to parser implementation.
- `*Parser.cs`: bank-specific parse rules.

## Extension notes
- New bank support requires a new parser + DI registration in `Program.cs`.
- Keep parser output behavior consistent with existing income/expense import patterns.