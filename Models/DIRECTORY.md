# Directory Guide

## Purpose
Domain/entity models shared across persistence and API responses.

## Current model groups
- Transactions: `Expense`, `Income`
- Categories: `ExpenseCategory`, `IncomeCategory`
- Accounts: `BankAccount`

## Extension notes
- Keep model changes backward-compatible with existing API contracts when possible.
- Update migrations and affected frontend payloads when modifying fields.