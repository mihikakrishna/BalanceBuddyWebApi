# Directory Guide

## Purpose
Contains backend functional tests that exercise real HTTP endpoints through `WebApplicationFactory<Program>`.

## Current scope
- `ExpensesAndIncomesFunctionalTests.cs`: full expense/income CRUD and undo/redo workflows.
- `CreditCardsFunctionalTests.cs`: credit card CRUD, validation, and undo/redo workflows.
- `CategoryAndBankAccountsFunctionalTests.cs`: category rules and bank account behaviors.
- `ImportDatabaseAndChartsFunctionalTests.cs`: import, database, and chart endpoint coverage.
- `PlaidControllerFunctionalTests.cs`: Plaid controller endpoint coverage with stubbed services.
- `TestWebApplicationFactory.cs`: isolated temp-content-root test host and DB helpers.

## Extension notes
- Use these tests for end-to-end request/response behavior and integration with the configured services.
- Keep test data isolated so tests do not depend on execution order.
- Add coverage here for critical workflows such as CRUD, import, undo/redo, and database management.
