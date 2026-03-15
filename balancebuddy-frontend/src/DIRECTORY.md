# Directory Guide

## Purpose
Frontend source code.

## Structure
- `App.js`: routes + global layout.
- `pages/`: route-level screens.
- `features/`: feature-centric reusable UI.
- `charts/`: dashboard chart components.
- `api/`: backend API wrappers.

## Extension notes
- Put server calls in `api/` modules, not directly inside many components.
- Keep route wiring centralized in `App.js`.