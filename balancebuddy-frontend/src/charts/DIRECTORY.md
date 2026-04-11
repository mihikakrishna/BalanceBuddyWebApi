# Directory Guide

## Purpose
Dashboard visualization components backed by `/api/charts/*` endpoints.

## Components
- `ExpenseByCategoryPie`: MUI X pie chart with month/year/category-focus controls.
- `IncomeExpenseStackedBar`: MUI X stacked bar with year and month-range controls.
- `BankBalancesPie`: MUI X bar ranking view with sort and top-account controls.
- `ExpenseBudgetHeatmap`: MUI X multi-line utilization explorer with month/category focus controls.
- `ExpandableChart`: shared card/dialog shell for interactive chart controls and expanded view.
- `Charts.test.jsx`: chart data mapping, state, and interaction tests with mocked MUI charts.

## Extension notes
- Keep chart query params (`year`, `month`) aligned with backend expectations.
- Keep interactive controls deterministic and covered by tests when changing query behavior.
- Keep the shared visual language centralized in `ExpandableChart` so stylistic updates apply consistently across all charts.
