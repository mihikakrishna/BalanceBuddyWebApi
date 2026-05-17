# Lessons - tests

Use this file for lessons specific to backend unit/functional test design and execution.

## Entry template
- Date:
- Area:
- Issue:
- Root cause:
- Fix:
- Prevention:

## 2026-03-21 - Backend test expansion and coverage gates
- Date: 2026-03-21
- Area: Backend unit/functional testing and CI coverage enforcement
- Issue: Initial broad test expansion still failed hard coverage gates due mixed architecture coverage (unit tests and functional tests cover different backend surfaces).
- Root cause: Per-project 80/80 thresholds measured unrelated code paths (for example controller-heavy code in unit runs, service-heavy code in functional runs), producing false negatives.
- Fix: Added focused suites plus scoped coverlet filters per project: unit gates service/parser/data logic, functional gates controller/API behavior; both now pass 80/80 locally.
- Prevention: Define coverage scope per test layer before enabling hard thresholds, and validate thresholds locally with the exact CI command line.

## 2026-05-17 - Functional coverage scope drifted after Plaid service work
- Date: 2026-05-17
- Area: Backend functional testing and CI coverage enforcement
- Issue: Functional-test branch coverage fell below threshold after Plaid service/client/store files were added.
- Root cause: The functional coverage filter no longer matched the intended controller/API scope, so new Plaid service internals were counted against the functional gate.
- Fix: Excluded `Services/Plaid/*.cs` from the functional coverage command in CI and kept service-branch coverage in the unit-test project.
- Prevention: When adding new service areas, update the functional coverage filter if that logic is already covered by unit tests rather than endpoint tests.
