---
description: React VaultPassword UI and security conventions
alwaysApply: true
---

# React VaultPassword Conventions

## Core Implementation

- Keep UI orchestration state in `src/App.tsx` unless extraction clearly improves readability.
- Use functional React components and hooks; avoid class components.
- Use Tailwind utility classes for styling; do not introduce ad-hoc CSS files.
- Use `framer-motion` for transitions to preserve the product's premium motion style.
- Use `lucide-react` for icons to keep visual consistency.

## UX and Accessibility

- Build responsive layouts that work from mobile through desktop.
- Ensure interactive elements are keyboard-accessible and have visible focus states.
- Keep forms explicit with clear labels/placeholders and predictable validation feedback.

## Security UX Rules

- Never log secrets (passwords, keys, tokens, OTP values) to the console.
- Mask sensitive values by default and require explicit reveal actions.
- Show user-facing success/error toast feedback for important actions.
- Never persist encryption keys in `localStorage` or `sessionStorage`.

## Good vs Bad Examples

```tsx
// ❌ BAD: Custom CSS + secret logging
console.log('Password:', password);
```

```tsx
// ✅ GOOD: Secure UX and consistent stack
<button className="rounded-lg px-3 py-2 focus-visible:outline-none focus-visible:ring-2">
  Copy password
</button>
```
