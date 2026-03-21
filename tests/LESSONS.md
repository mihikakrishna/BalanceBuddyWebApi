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
