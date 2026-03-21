# Directory Guide

## Purpose
Contains isolated backend unit tests.

## Current scope
- `UndoAndRegistryTests.cs`: undo stack behavior and parser registry behavior.
- `DatabaseServiceTests.cs`: create/open/export/seed/error-path coverage.
- `BankStatementParsersTests.cs`: per-bank CSV mapping and parser error behavior.
- `TestDatabaseScope.cs`: isolated SQLite test helper.

## Extension notes
- Prefer testing one class or rule at a time.
- Mock or fake dependencies instead of booting the full ASP.NET application.
- Add new test files by feature or service area as coverage grows.
