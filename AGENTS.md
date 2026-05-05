# Project Documentation for AI Coding Assistants

This project is a modern, high-fidelity Password Manager web application. It is designed with a focus on smooth user experience, polished aesthetics, and secure-feeling interactions.

## 🚀 Project Overview

- **Name:** Vault - Secure Password Manager
- **Framework:** React 19 (Vite)
- **Styling:** Tailwind CSS 4.0
- **Animations:** Framer Motion (`framer-motion`)
- **Icons:** Lucide React (`lucide-react`)
- **Theme:** Modern, clean "Surface" design with high contrast and smooth transitions.

## 📂 Directory Structure

```text
/
├── src/
│   ├── App.tsx         # Main application logic, routing, and screens
│   ├── main.tsx        # React entry point
│   └── index.css       # Global styles and Tailwind configuration
├── metadata.json       # App name and permissions
├── package.json        # Dependencies and scripts
└── vite.config.ts      # Vite build configuration
```

## 🛠 Core Components & Logic (App.tsx)

The application uses a state-driven "Screen" architecture to manage the flow:

1.  **Welcome Screen:** Initial landing page.
2.  **Login Screen:** Email/Password authentication UI.
3.  **TOTP Screen:** Multi-factor authentication with auto-focusing inputs and backspace handling.
4.  **Dashboard Screen:** The main workspace.
    -   **Navbar:** Contains the global search bar.
    -   **Sidebar:** Navigation between Categories (Passwords, Cards, etc.).
    -   **Vault Grid:** Displays items in a responsive grid.
    -   **Context Menus:** Individual item management (Edit/Delete) via a "More" (three dots) menu.
5.  **Settings Screen:** User profile and security settings.

## 🔍 Key Features

-   **Global Search:** Real-time filtering across all vault items (titles, emails, card numbers).
-   **Modal System:** Integrated modal for adding and editing vault entries (passwords or credit cards).
-   **Animations:** Staggered list animations and smooth screen transitions using `AnimatePresence` and `motion`.
-   **OTP Inputs:** A custom 6-digit input component with paste support and automatic focus shifting.
-   **Keyboard Shortcuts:** Pressing `Escape` automatically closes open modals.

## 📝 Coding Guidelines for AI

1.  **State Management:** Keep logic inside `App.tsx` for now unless it grows significantly. Use `useState` and `useEffect` appropriately.
2.  **Styling:** Use Tailwind CSS utility classes exclusively. Avoid custom CSS files.
3.  **Icons:** Always use `lucide-react`.
4.  **Transitions:** Use `framer-motion` for all UI state changes to maintain the premium feel.
5.  **Responsiveness:** Ensure all layouts work from mobile (sm) to desktop (lg).
6.  **Inputs:** Ensure inputs are accessible and have proper focus states.

## 🔒 Security UX
Even though this is a frontend-centric app, the UI should reflect security best practices (masked passwords, "copied to clipboard" feedback, and distinct visual cues for locked vs. unlocked states).
