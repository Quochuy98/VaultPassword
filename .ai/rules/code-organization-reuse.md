---
description: Code organization by reusability level
alwaysApply: true
---

# Code Organization For Reuse

Use these placement rules for all new logic:

- Put **pure reusable business logic** in `src/lib/` (formatters, mappers, validators, display rules, crypto helpers).
- Put **shared UI building blocks** in `src/components/` (reusable visual blocks with props).
- Keep **page-specific rendering logic** inside that page component file unless it is reused in at least 2 places.
- If a function mixes UI and logic, split it:
  - pure logic -> `src/lib/`
  - UI wrapper/component -> `src/components/`

## Reuse Threshold

- 1 place only: keep local in current file.
- 2+ places or expected reuse soon: extract to `src/lib/` or `src/components/`.

## Naming Conventions

- Reusable logic files: `src/lib/<domain>.ts` (example: `secretField.ts`).
- Reusable UI files: `src/components/<FeatureName>.tsx`.
- Avoid generic names like `utils.ts` when domain-specific names are possible.

## Decision Checklist

Before writing a new function, decide:

1. Is it UI output (JSX/markup/stateful view)? -> `src/components/`
2. Is it pure logic (no JSX, minimal side effects)? -> `src/lib/`
3. Is it used only once and tightly coupled to one screen? -> keep local
4. Will changing this logic likely affect multiple screens? -> extract shared module now
