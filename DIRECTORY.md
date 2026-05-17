# Directory Guide

## Purpose
Backend ASP.NET Core API plus React frontend for BalanceBuddy.

## Key areas
- `Controllers/`: HTTP endpoints and request/response rules.
- `Services/`: runtime infrastructure (database switching, undo, CSV parsing, Plaid integration).
- `Models/`: EF entities.
- `Data/`: DbContext and local SQLite files.
- `balancebuddy-frontend/src/`: React app UI and API clients.

## Extension notes
- Prefer adding behavior behind controllers/services, not directly in `Program.cs`.
- Keep backend routes and frontend API clients in sync.
