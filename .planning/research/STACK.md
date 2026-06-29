# Stack Research

**Domain:** LLM-powered Text Editing Workflow Builder (Web)
**Researched:** 2025-06-29
**Confidence:** HIGH

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| React | 18.3+ | UI Framework | Concurrent features, Server Components ready, massive ecosystem |
| Vite | 5.4+ | Build Tool | Instant HMR, optimized prod builds, native TS support |
| TypeScript | 5.5+ | Type Safety | Essential for complex state machines (workflow engine) |
| Tailwind CSS | 3.4+ | Styling | Utility-first, dark mode, JIT compiler, small bundle |
| Zustand | 4.5+ | State Management | Minimal boilerplate, works with React 18, persist middleware |
| React Flow | 11.11+ | Workflow Builder | Nodes/edges, handles, viewport, selection, extensible |
| Monaco Editor | 0.48+ | Code/Diff Editor | VS Code engine, diff view, inline decorations, themes |
| @dnd-kit/core | 6.1+ | Drag & Drop | Accessible, performant, headless, works with React Flow |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| mammoth | 1.8+ | .docx → HTML/Markdown | File upload parsing |
| pdf-parse | 1.1+ | .pdf → Text | File upload parsing |
| diff | 5.2+ | Diff Algorithm | Unified/side-by-side diffs |
| diff-match-patch | 1.0+ | Fine-grained Diff | Character/word-level diffs |
| idb | 8.0+ | IndexedDB Wrapper | Offline storage, sync queue |
| zod | 3.23+ | Schema Validation | Workflow JSON, Persona config, API responses |
| @tanstack/react-query | 5.50+ | Server State | Caching, mutations, offline mutations |
| lucide-react | 0.44+ | Icons | Consistent icon system |
| clsx / tailwind-merge | 2.1+ / 2.5+ | Class Composition | Conditional Tailwind classes |
| date-fns | 4.1+ | Date Formatting | Lightweight, tree-shakeable |
| file-saver | 2.0+ | Client-side Export | Save .md/.json/.txt |
| docx | 8.5+ | .docx Generation | Track Changes export |
| @pdf-lib/pdf-lib | 1.17+ | PDF Generation | Annotated PDF export |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| ESLint + @typescript-eslint | Linting | Flat config, React/TS rules |
| Prettier | Formatting | Tailwind plugin for class sorting |
| Vitest | Unit Testing | Fast, Vite-native, React Testing Library |
| Playwright | E2E Testing | Multi-browser, visual regression |
| Storybook | Component Dev | Isolated UI development |
| Husky + lint-staged | Git Hooks | Pre-commit quality gates |

## Installation

```bash
# Core
npm install react@18.3 react-dom@18.3 zustand@4.5 @xyflow/react@11.11 @monaco-editor/react@4.6 @dnd-kit/core@6.1 @dnd-kit/sortable@8.0 @dnd-kit/utilities@3.2

# File Parsing
npm install mammoth@1.8 pdf-parse@1.1 diff@5.2 diff-match-patch@1.0

# Export
npm install docx@8.5 @pdf-lib/pdf-lib@1.17 file-saver@2.0

# Utilities
npm install zod@3.23 idb@8.0 @tanstack/react-query@5.50 lucide-react@0.44 clsx@2.1 tailwind-merge@2.5 date-fns@4.1

# Dev Dependencies
npm install -D typescript@5.5 vite@5.4 tailwindcss@3.4 postcss@8.4 autoprefixer@10.4 @types/react@18.3 @types/react-dom@18.3 @types/diff@5.0 @types/diff-match-patch@1.0 @types/file-saver@2.0 vitest@2.0 @testing-library/react@16.0 @testing-library/user-event@14.5 playwright@1.45 @types/node@20.14 eslint@9.0 prettier@3.3 @typescript-eslint/eslint-plugin@8.0 @typescript-eslint/parser@8.0 eslint-plugin-tailwindcss@0.5 husky@9.0 lint-staged@15.2
```

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| React Flow | React Diagrams / X6 | Need simpler/fewer features, or GraphQL-based backend |
| Zustand | Redux Toolkit / Jotai | Team knows Redux well, or need atoms for fine-grained reactivity |
| Monaco | CodeMirror 6 | Lighter weight, better mobile, simpler embedding |
| Tailwind | CSS Modules / Panda CSS | Team prefers CSS-in-JS, or design system already exists |
| Vite | Next.js / Astro | Need SSR/SSG, file-based routing, or island architecture |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| Create React App | Unmaintained, slow, no Vite benefits | Vite + React |
| Redux (legacy) | Boilerplate, not needed for this scale | Zustand |
| Electron (for now) | Overhead, distribution complexity | Web-first, PWA later |
| Webpack | Slower, config complexity | Vite |
| localStorage for offline | 5MB limit, synchronous, no querying | IndexedDB (idb) |
| Custom diff implementation | Edge cases, performance, maintenance | diff / diff-match-patch |

## Stack Patterns by Variant

**If local-first is priority:**
- Use IndexedDB (idb) for all persistence
- Service Worker (Workbox) for asset caching
- Background Sync API for queueing mutations

**If cloud sync needed later:**
- Add Supabase / PocketBase for auth + realtime
- Keep local-first architecture, sync as enhancement
- CRDT (Yjs / Automerge) for collaborative editing

**If heavy PDF processing:**
- Move pdf-parse to serverless function (WASM limitations)
- Use pdf-lib server-side for generation
- Client only does text extraction preview

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| React 18.3 | React Flow 11.11, Monaco 4.6 | Concurrent features work |
| Vite 5.4 | React 18.3, TS 5.5 | Requires @vitejs/plugin-react 4.3+ |
| Tailwind 3.4 | PostCSS 8.4, Autoprefixer 10.4 | JIT mode default |
| Zustand 4.5 | React 18.3 | useSyncExternalStore compatible |
| @tanstack/react-query 5.50 | React 18.3 | Requires QueryClientProvider |

## Sources

- React Flow docs — Node/Edge patterns, custom nodes
- Monaco Editor API — Diff editor, decorations, themes
- diff-match-patch Google — Character/word diff algorithms
- mammoth.js — .docx conversion fidelity
- pdf-parse / pdf-lib — PDF text extraction + generation
- Zustand v4 — Middleware patterns, persist, devtools
- IndexedDB / idb — Offline-first patterns

---
*Stack research for: Lektorat-Workflow-UI*
*Researched: 2025-06-29*