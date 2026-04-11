# Lessons

Use this file to capture high-value lessons from tasks that required substantial debugging or reasoning.

## Entry template
- Date:
- Area:
- Issue:
- Root cause:
- Fix:
- Prevention:

## 2026-03-15 - CI and test setup
- Date: 2026-03-15
- Area: Backend/Frontend CI pipeline
- Issue: CI failed across solution test execution and frontend install/test steps.
- Root cause: Multiple factors: missing test imports, web project globbing `tests/**`, and brittle frontend/Jest environment assumptions.
- Fix: Added explicit test project scaffolding, excluded `tests/**` from web project compile/content globs, stabilized frontend test setup/mocks/polyfills, and updated CI workflow steps.
- Prevention: Keep test projects isolated from web content globs, keep frontend test surface shallow for app-shell tests, and verify workflow commands match real repo layout.

## 2026-04-11 - Generated source glob conflicts
- Date: 2026-04-11
- Area: Backend build configuration
- Issue: Build failed with duplicate assembly attributes after temporary build outputs were written under `artifacts/tmpobj`.
- Root cause: SDK default compile glob included generated `.cs` files in `artifacts/**`, duplicating auto-generated files from `obj/**`.
- Fix: Excluded `artifacts/**` via `DefaultItemExcludes` and `DefaultWebContentItemExcludes` in `BalanceBuddyWebApi.csproj`.
- Prevention: Keep generated intermediate sources outside project globs or explicitly exclude their directories in csproj.
