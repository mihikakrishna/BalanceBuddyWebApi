# Directory Guide

## Purpose
Contains isolated backend unit tests.

## Current scope
- `SmokeUnitTests.cs`: basic tests for `UndoManager` and `BankStatementParserRegistry`.

## Extension notes
- Prefer testing one class or rule at a time.
- Mock or fake dependencies instead of booting the full ASP.NET application.
- Add new test files by feature or service area as coverage grows.
