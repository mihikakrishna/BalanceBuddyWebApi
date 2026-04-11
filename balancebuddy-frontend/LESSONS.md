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
