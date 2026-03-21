# Directory Guide

## Purpose
Holds backend automated tests for the BalanceBuddy solution.

## Structure
- `BalanceBuddy.UnitTests/`: fast isolated tests for small services and rules.
- `BalanceBuddy.FunctionalTests/`: API-level tests using an in-memory test host.

## Extension notes
- Keep unit tests deterministic and independent from filesystem/network state.
- Put endpoint and workflow coverage in functional tests, not unit tests.
- Run test projects sequentially to avoid concurrent builds of the web project.
- Coverage gates are enforced per project with scoped file filters:
- Unit tests gate service/parser/data logic.
- Functional tests gate controller/API behavior.
