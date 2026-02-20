# React Email Composer

A fully interactive email composer component built with React 19, TypeScript, and Zustand. It focuses on a polished "To" field experience — editable pill-based email inputs with display-name parsing, real-time validation, contact management, and localStorage persistence.

## Features

- **Pill-based email input** — Recipients render as inline pills that can be edited in-place, removed, or added from a contact dropdown. Each pill auto-sizes to its content and toggles between a display-name view and a raw-edit view on focus.
- **Display-name parsing** — Supports the `Name<email@example.com>` format. The parser extracts the display name and address separately, showing the friendly name when the pill is blurred and the full raw value when editing.
- **Real-time validation** — Email addresses are validated on every change with visual feedback (invalid addresses are styled differently). Duplicates are allowed in the To field for flexibility and silently deduplicated when the message is sent.
- **Contact dropdown with auto-resolve** — A dropdown lists previously saved contacts. Selecting one auto-populates a pill. Typing an address that matches a known contact automatically links it, keeping IDs consistent.
- **Edit-and-detach** — Editing a contact-linked pill detaches it from the original contact so it's treated as a new address on send, preserving the original contact unchanged.
- **Persistent storage** — Contacts are persisted to `localStorage`. New valid addresses are saved automatically on send while preventing duplicate entries across sessions.
- **Sent message history** — After sending, the app transitions to a session-only history view showing all messages sent during the current session (recipients, subject, timestamp) with a "Compose New Message" button to return to a fresh composer.
- **Centralized state with Zustand** — A single store manages recipients, contacts, subject, body, sent messages, and UI flags (loading, sending, dropdown visibility). Components subscribe to only the slices they need.

## Tech Stack

| Tool | Purpose |
|------|---------|
| [React 19](https://react.dev) | UI framework |
| [TypeScript 5.9](https://www.typescriptlang.org) | Type safety |
| [Zustand](https://zustand.docs.pmnd.rs) | Lightweight state management |
| [Vite](https://vite.dev) | Dev server and bundler |
| [Vitest](https://vitest.dev) + [Testing Library](https://testing-library.com) | Unit and component tests |
| [Sass (modules)](https://sass-lang.com) | Scoped component styling |
| [Lucide React](https://lucide.dev) | Icons |

## Project Structure

```
src/
├── components/
│   ├── ContactDropdown/   # Saved-contact picker dropdown
│   ├── EmailComposer/     # Top-level composer (subject, body, send)
│   ├── EmailInput/        # To-field container with pills + add button
│   ├── EmailPill/         # Individual editable recipient pill
│   ├── IntroCard/         # Feature overview card shown on first load
│   └── MessageHistory/    # Sent messages history with compose-new flow
├── store/
│   └── email-store.ts     # Zustand store (state + actions + localStorage)
├── types/
│   └── email.ts           # Shared TypeScript interfaces
├── utils/
│   ├── email-parser.ts    # Display-name / address extraction
│   ├── email-validation.ts# Regex-based email validation
│   └── index-calculator.ts# Stable index generation for recipient list
└── test/
    └── setup.ts           # Vitest global setup
```

## Getting Started

```bash
npm install
npm run dev        # Start the dev server
npm run test       # Run tests in watch mode
npm run test:run   # Run tests once
npm run build      # Type-check and build for production
```

## What This Demonstrates

- Composing a non-trivial input component from small, focused pieces (`EmailPill`, `EmailInput`, `ContactDropdown`) rather than one monolithic component.
- Using a view state machine (`'composer' | 'history' | 'closed'`) to manage app views without a router.
- Parsing structured email strings (`Display Name<user@example.com>`) into typed objects and round-tripping them back for storage.
- Silent deduplication at send time rather than disruptive input-time warnings — a deliberate UX choice that keeps the input flexible.
- Keeping localStorage in sync with UI state through explicit read/write helpers instead of a generic sync middleware.
- Full test coverage (111 tests) across utils, store logic, and rendered components using Vitest and Testing Library.
