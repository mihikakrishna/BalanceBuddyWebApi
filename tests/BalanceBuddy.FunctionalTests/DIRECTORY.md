# Directory Guide

## Purpose
Contains backend functional tests that exercise real HTTP endpoints through `WebApplicationFactory<Program>`.

## Current scope
- `ApiSmokeTests.cs`: basic availability and create/fetch API checks.

## Extension notes
- Use these tests for end-to-end request/response behavior and integration with the configured services.
- Keep test data isolated so tests do not depend on execution order.
- Add coverage here for critical workflows such as CRUD, import, undo/redo, and database management.
