# Lessons - frontend

Use this file for lessons specific to frontend build, test, and runtime behavior.

## Entry template
- Date:
- Area:
- Issue:
- Root cause:
- Fix:
- Prevention:

## 2026-04-11 - Chart visual refresh
- Date: 2026-04-11
- Area: Frontend charts
- Issue: Charts looked functional but visually flat and inconsistent.
- Root cause: Most visual treatment was local to each chart and used minimal styling defaults.
- Fix: Strengthened shared chart shell styling in `ExpandableChart` and aligned chart palette/geometry/grid settings across chart components.
- Prevention: Use shared wrapper-level styling for major visual changes, then tune per-chart geometry/colors without touching data-fetch logic.

## 2026-04-11 - Stale hashed assets on repeated publish
- Date: 2026-04-11
- Area: Frontend publish-to-wwwroot workflow
- Issue: `wwwroot/static/js` kept growing with old `main.*.js` bundles on each publish.
- Root cause: Copy step overlaid new build output without deleting prior hashed files.
- Fix: Clean target directories before copy in both `makefile` (`copy-dev`, `copy-publish`) and `scripts/publish-to-wwwroot.ps1`.
- Prevention: Always delete destination static asset folders before copying hash-named frontend builds.
## 2026-04-11 - Date payload binding for new forms
- Date: 2026-04-11
- Area: Frontend credit card tracker form/grid
- Issue: API returned 400 with `openedDate` conversion errors and "creditCard field is required".
- Root cause: Frontend sent empty string (`""`) for a required DateTime field when no date was set/valid.
- Fix: Enforced client-side opened-date requirement and changed payload mapping to avoid empty-string dates (reuse old valid date during grid edits).
- Prevention: Never serialize optional/unset dates as empty strings; send valid ISO dates or `null` only when backend type allows it.
