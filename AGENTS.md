# Coding rules

## General
- Always read existing code patterns before changing anything.
- Make the smallest safe change that solves the problem.
- Do not introduce new dependencies unless necessary.
- Preserve current architecture and naming conventions.
- Explain tradeoffs briefly before major refactors.

## Before editing
- First summarize what files are relevant.
- For non-trivial changes, propose a short plan before coding.
- Ask before making destructive changes or deleting files.
- Before making changes, review the nearest directory-level `LESSONS.md` (and parent `LESSONS.md` files up to repo root, if present) and apply relevant lessons.

## Code quality
- Prefer clear, maintainable code over clever code.
- Keep functions small and focused.
- Add comments only where logic is non-obvious.
- Avoid duplication; reuse existing helpers when possible.

## Testing
- Run targeted tests after changes.
- If tests fail, fix the issue or explain exactly what failed.
- Never claim code works unless tests or validation were actually run.

## Learning loop
- Maintain `LESSONS.md` files at directory level (for the areas being changed), not only at repo root.
- When a task required substantial debugging or long reasoning, add a short lesson entry to the nearest relevant directory `LESSONS.md`:
- Include: issue summary, root cause, fix applied, and how to avoid it next time.
- Keep entries concise and actionable.

## Documentation hygiene
- For any major change, update the relevant `DIRECTORY.md` file(s) to reflect new structure, behavior, or workflows.

## For this repo
- Backend: follow existing C# style and dependency injection patterns.
- Frontend: match existing React/MUI patterns.
- Do not rename public API fields unless explicitly requested.
