# VaultPassword Project Rules

This file is IDE-agnostic and can be used by Cursor, VS Code, Windsurf, JetBrains IDEs, GitHub Copilot, Claude Code, Gemini CLI, or any AI coding assistant working on this repository.

## Project Identity

- Product: Vault - Secure Password Manager.
- Stack: React 19, Vite, TypeScript, Tailwind CSS 4, Framer Motion, Lucide React.
- Goal: polished, secure-feeling password manager UI with smooth interactions and high visual quality.

## Core Architecture

- Keep screen orchestration and closely related UI state in `src/App.tsx` unless complexity or reuse justifies extraction.
- Put pure reusable logic in `src/lib/`.
- Put reusable visual components in `src/components/`.
- Avoid broad generic files like `utils.ts` when a domain-specific module name is possible.
- Prefer small, typed functions and explicit interfaces/types.

## Styling And Motion

- Use Tailwind CSS utility classes exclusively for styling.
- Do not add ad-hoc custom CSS files unless explicitly requested.
- Preserve the modern Surface design language: high contrast, premium spacing, soft shadows, glass/surface layers, and refined states.
- Use `framer-motion` for screen transitions, modals, menus, lists, and meaningful UI state changes.
- Keep layouts responsive from mobile to desktop.

## Icons And UI Consistency

- Use `lucide-react` for icons.
- Keep icon sizes, stroke weights, and spacing visually consistent.
- Interactive controls must have visible hover, active, disabled, and focus states.
- Use accessible labels or descriptive text for icon-only actions.

## Security UX Rules

- Never log secrets to the console, including passwords, tokens, OTP codes, encryption keys, recovery codes, or Supabase session data.
- Mask sensitive values by default.
- Require an explicit reveal action for passwords or sensitive fields.
- Show clear success/error toast feedback for important auth, vault, copy, CRUD, and MFA actions.
- Never store encryption keys in `localStorage` or `sessionStorage`.
- Always encrypt sensitive vault data before sending it to Supabase.
- Decrypt vault data only on the client after fetching.

## Supabase Backend Phase Rules

- Use `@supabase/supabase-js` through `src/lib/supabaseClient.ts`.
- Read Supabase configuration from Vite environment variables:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
- Keep `.env.example` updated when environment requirements change.
- Do not hardcode Supabase URLs, anon keys, service keys, or user secrets in source code.
- Never use a Supabase service role key in frontend code.

## Authentication Rules

- Replace mock login with `supabase.auth.signInWithPassword`.
- Replace mock register with `supabase.auth.signUp`.
- Support the "This is a public computer" flow by avoiding persistent sessions when selected.
- Keep authenticated session state in React context or another explicit in-memory state layer.
- Protected screens such as Dashboard and Settings must require an authenticated session.

## Database And RLS Rules

- Use a `passwords` table for password records.
- All password rows must belong to the authenticated user via `user_id`.
- RLS must enforce `auth.uid() = user_id` for SELECT, INSERT, UPDATE, and DELETE.
- Database access helpers belong in `src/lib/passwordService.ts`.
- Required service functions:
  - `getPasswords`
  - `addPassword`
  - `updatePassword`
  - `deletePassword`

## Encryption Rules

- Put encryption helpers in `src/lib/encryption.ts`.
- Derive keys with PBKDF2 and 200,000 iterations.
- Encrypt with AES-GCM.
- Store derived encryption keys in memory only.
- Store IVs separately with encrypted fields.
- Do not send plaintext passwords or notes to Supabase.

## MFA / TOTP Rules

- Use Supabase MFA APIs for TOTP enrollment and verification.
- Add 2FA enablement from Settings.
- Show QR code enrollment UI with polished, clear instructions.
- During login, check enrolled TOTP factors and route to the existing TOTP screen when required.
- Do not log TOTP codes, factor IDs, or challenge data.

## Accessibility And Forms

- Inputs must have accessible labels, placeholders, and clear validation feedback.
- OTP inputs must support auto-focus, backspace navigation, and paste flows.
- Escape should close modals or open transient overlays where appropriate.
- Keep keyboard navigation predictable.
- Avoid trapping focus incorrectly in modals.

## Implementation Discipline

- Preserve existing animations, visual polish, and interaction patterns.
- Do not remove comments or documentation unrelated to the change.
- Keep changes scoped to the current task.
- Prefer enhancing existing components and patterns over introducing parallel implementations.
- Validate TypeScript types before considering a task complete when code is changed.
