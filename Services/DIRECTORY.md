# Directory Guide

## Purpose
Cross-cutting backend services used by controllers.

## Key services
- `DatabaseService`: open/create/switch/export DB files, schema/default seeding.
- `UndoManager`: per-transaction-type undo/redo stacks.
- `Plaid/`: Plaid configuration, API client, and Link/token orchestration.

## Extension notes
- Add business infrastructure here rather than controller-level static logic.
- Keep services deterministic to simplify unit testing.
