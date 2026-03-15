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
