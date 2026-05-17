# Plaid Implementation Plan

## Summary
Replace hardcoded bank-specific CSV parsing with Plaid as the primary supported-bank ingestion path. Use Plaid `Transactions` as the main normalized source of transaction data, keep CSV import as fallback, and optionally add statement PDF archival later.

## Sprint 1: Plaid foundation
Goal:
- establish backend Plaid configuration and connection primitives

Implemented:
- typed Plaid settings bound from config
- Plaid API client
- Plaid service orchestration for:
  - link token creation
  - public token exchange
- backend API endpoints:
  - `POST /api/plaid/link-token`
  - `POST /api/plaid/exchange-public-token`
- focused unit and functional tests

Security and reliability updates applied:
- local Plaid credentials removed from repo-tracked config
- local setup uses .NET user secrets
- exchanged access tokens are now preserved server-side in durable database storage
- `exchange-public-token` currently keeps the `accessToken` field in its response as a temporary backward-compatibility path
- malformed `Plaid:BaseUrl` is rejected as configuration error
- non-JSON / empty Plaid error bodies are translated into Plaid API failures instead of generic 500s

Known limitation:
- `accessToken` is still present in the exchange response for compatibility and should be removed only after downstream callers migrate to server-side persistence

## Sprint 2: Persistence model for Plaid source data
Goal:
- persist Plaid connection data and synced source-of-truth records

Changes:
- add EF entities and migration for:
  - `PlaidItem`
  - `PlaidAccount`
  - `PlaidTransaction`
  - `PlaidStatement`
- move exchanged access-token storage from in-memory to durable server-side persistence
- track last sync cursor / sync status / reconnect state
- optionally link Plaid accounts to existing `BankAccount` records

## Sprint 3: Expanded backend Plaid API
Goal:
- expose the server-side API needed for linked institution management and sync

Changes:
- add endpoints for:
  - listing linked items
  - listing linked accounts
  - syncing transactions
  - listing available statements
  - downloading statements
  - webhook intake

Multi-bank consideration:
- keep internal model as one user -> many Plaid items -> many accounts
- design for future Plaid Multi-Item Link support

## Sprint 4: Projection into existing budgeting workflow
Goal:
- project Plaid transactions into current `Expenses` and `Incomes`

Changes:
- debit/spend -> expense
- credit/inflow -> income
- default category -> `Unreviewed`
- idempotent resync behavior
- preserve user edits where appropriate

## Sprint 5: Frontend connect and sync UX
Goal:
- add connect-bank workflow to the app UI

Changes:
- connect bank with Plaid Link
- show linked institutions/accounts
- trigger sync
- show sync result
- preserve CSV fallback

Multi-bank UX:
- consider Plaid Multi-Item Link as preferred UX for connecting several banks

## Sprint 6: Reliability and rollout hardening
Goal:
- make sync operationally safe

Changes:
- webhook handling
- cursor-based sync flow
- retry/error handling
- structured sync logging

## Testing Strategy
- unit tests for service logic and request building
- functional tests for controller behavior and error mapping
- manual sandbox testing for:
  - link token creation
  - sandbox public token creation
  - public token exchange
