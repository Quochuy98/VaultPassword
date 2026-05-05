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


## 🗄️ Backend Integration (Supabase) - NEXT PHASE

Project UI is complete. Now integrate Supabase for backend, auth, and database.

### Current Status
- ✅ UI complete (all screens, modals, animations)
- ✅ Mock data in Dashboard
- ⬜ Supabase connection needed
- ⬜ Real authentication needed
- ⬜ Database CRUD needed
- ⬜ Client-side encryption needed

### Task Priority (Do in order)

Coding Rules for Backend Phase
NEVER store encryption key in localStorage/sessionStorage

NEVER log passwords to console

Always encrypt before sending to Supabase

Always show toast notifications for success/error

Keep existing animations and UI polish from Phase 1

**Phase 1: Setup**
- Install @supabase/supabase-js
- Create src/lib/supabaseClient.ts
- add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.example
- Environment Variables Required: 
    VITE_SUPABASE_URL=your_supabase_project_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

**Phase 2: Authentication**
- Replace mock login in App.tsx with supabase.auth.signInWithPassword
- Replace mock register with supabase.auth.signUp
- Add "This is a public computer" checkbox logic (persistSession: false)
- Add ProtectedRoute component for /dashboard and /settings
- Store session state in React context or Zustand

**Phase 3: Database**
- Create 'passwords' table in Supabase (using SQL in dashboard)
  - Fields: id, user_id, website, username, encrypted_password, iv_password, encrypted_notes, iv_notes, created_at, updated_at
- Enable RLS with policy: auth.uid() = user_id
- Create passwordService.ts (getPasswords, addPassword, updatePassword, deletePassword)

**Phase 4: Client-side Encryption (Zero-Knowledge)**
- Create src/lib/encryption.ts
  - deriveKeyFromPassword (PBKDF2, 200k iterations)
  - encrypt (AES-256-GCM)
  - decrypt (AES-256-GCM)
- On login: derive key from password, store in memory (not localStorage)
- On dashboard load: decrypt data after fetching, encrypt before saving

**Phase 5: TOTP 2FA**
- Add "Enable 2FA" button in Settings screen
- Call supabase.auth.mfa.enroll to get QR code
- Display QR code for user to scan
- Call verify to activate
- On login: check mfa.listFactors, if TOTP exists -> show TOTP screen

**Phase 6: Public Computer Mode**
- When checkbox "Public computer" is checked on login:
  - Set persistSession: false
  - Auto logout after 30 minutes
  - Clear encryption key immediately on logout/tab close

### Database Schema (Run in Supabase SQL Editor)

```sql
CREATE TABLE passwords (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  website TEXT NOT NULL,
  username TEXT NOT NULL,
  encrypted_password TEXT NOT NULL,
  iv_password TEXT NOT NULL,
  encrypted_notes TEXT,
  iv_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE passwords ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own passwords" ON passwords
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own passwords" ON passwords
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own passwords" ON passwords
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own passwords" ON passwords
  FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_passwords_user_id ON passwords(user_id);