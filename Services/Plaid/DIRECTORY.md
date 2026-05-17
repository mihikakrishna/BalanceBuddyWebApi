# Directory Guide

## Purpose
Plaid integration primitives for backend configuration, API calls, and Link/token orchestration.

## Key files
- `PlaidSettings.cs`: typed configuration bound from `appsettings`.
- `IPlaidApiClient.cs` / `PlaidApiClient.cs`: low-level Plaid HTTP client wrapper.
- `IPlaidItemCredentialStore.cs` / `DbPlaidItemCredentialStore.cs`: server-side storage of exchanged Plaid item credentials.
- `IPlaidLinkService.cs` / `PlaidLinkService.cs`: backend orchestration for Link token creation and public-token exchange.
- `PlaidModels.cs`: request/response models for Plaid service interactions.

## Extension notes
- Keep outbound Plaid API calls inside `PlaidApiClient`.
- Keep validation and app-specific orchestration inside `PlaidLinkService`.
- Keep Plaid credentials in user secrets or environment variables, not repo-tracked config files.
- Add sync, accounts, and statements services here in later sprints rather than expanding controllers.
