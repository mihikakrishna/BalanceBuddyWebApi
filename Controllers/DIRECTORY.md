# Directory Guide

## Purpose
Defines REST API endpoints for all application features.

## Main feature controllers
- `ExpensesController`, `IncomesController`: CRUD + undo integration.
- `ExpenseCategoriesController`, `IncomeCategoriesController`: category management rules.
- `BankAccountsController`: bank account CRUD subset.
- `CreditCardsController`: credit card tracker CRUD with validation and undo integration.
- `ImportController`: CSV import entrypoint + supported-bank listing.
- `ChartsController`: dashboard aggregation endpoints.
- `DatabaseController`: database switch/upload/create/export/current/list.
- `UndoController`: undo/redo APIs by transaction type.

## Extension notes
- Keep controllers thin: validation/orchestration only.
- Reuse `DatabaseService` when database file context matters.
