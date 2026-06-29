# Project Research Summary

**Project:** Lektorat-Workflow-UI
**Domain:** LLM-powered Text Editing Workflow Builder (Web)
**Researched:** 2025-06-29
**Confidence:** HIGH

## Executive Summary

This project builds a **local-first web application** for orchestrating LLM-powered text editing workflows. Users upload documents (.txt, .md, .docx, .pdf, .rtf), configure specialized "personas" (editor roles with model parameters), chain them with writing and control skills in a visual workflow builder, and review results via diff views, inline comments, and Track Changes exports.

The recommended stack is **React 18 + Vite + TypeScript + Tailwind** for the frontend, with **React Flow** for the workflow builder, **Monaco Editor** for diff viewing, and **Zustand + IndexedDB** for offline-first state. Serverless functions (Vercel/Netlify) handle cloud LLM proxying, heavy file parsing, and PDF generation. Local models (Ollama/LM Studio) are first-class citizens with automatic cloud fallback.

Key risks: **context window management** in multi-step pipelines, **diff fidelity** on structured documents, **streaming race conditions**, and **IndexedDB migration** strategy. These are addressed by phased architecture: foundation first (storage, parsing, model routing), then execution engine, then diff/export quality.

## Key Findings

### Recommended Stack

**Core technologies:**
- **React 18 + Vite + TS**: Modern, fast HMR, type-safe, deployable anywhere
- **React Flow 11**: Purpose-built for node/edge workflows, handles viewport, selection, custom nodes
- **Monaco Editor 0.48**: VS Code's editor engine — diff view, decorations, themes out of the box
- **Zustand 4 + idb 8**: Minimal state management with typed persist middleware to IndexedDB
- **Tailwind CSS 3.4**: Utility-first, dark mode, JIT, small production bundles

**Critical supporting libs:**
- **mammoth + pdf-parse**: File parsing (Web Workers for main-thread safety)
- **diff-match-patch**: Word/char-level diffs for inline annotations
- **docx + pdf-lib**: Track Changes DOCX + Annotated PDF export
- **@tanstack/react-query**: Server state, mutations, offline queue
- **zod**: Schema validation for workflows, personas, API contracts

### Expected Features

**Must have (table stakes):**
- File upload & parsing (.txt, .md,md, .docx, .pdf, .rtf) → unified text object
- Persona registry (7+): name, system prompt, model params (temp, tokens, topP, stop)
- Click-to-run persona → streaming result → diff view (side-by-side + unified)
- Inline comments (category-colored, anchored to diff positions)
- Export: Markdown, DOCX (Track Changes), PDF (annotations)
- Visual workflow builder (3 node categories: Persona/Write/Control)
- Workflow save/load/version (JSON schema, import/export)
- Model config: local (Ollama/LM Studio) + cloud (Anthropic/OpenRouter) fallback
- Project/tabs, dark/light theme, keyboard shortcuts

**Should have (competitive):**
- Writing skills: generation, derivates, research, logic/timeline
- Control skills: rules, consistency, logic, custom metrics
- Advanced pipelines: branching, loops, conditionals
- Execution history per text (audit trail)
- Offline-first with background sync queue

**Defer (v2+):**
- Batch processing, template marketplace, MCP integration, collaboration, mobile/PWA

### Architecture Approach

**Feature-driven structure** with clear boundaries: each feature (project-manager, workflow-builder, persona-registry, result-viewer, file-processor, model-orchestrator, export-generator) owns its components, hooks, store, types. Shared UI design system, pure lib utilities, serverless functions co-located.

**Key patterns:** Adapter for model providers (local/cloud swap), UnifiedTextObject as normalized IR, Workflow execution as async iterator with checkpoints, Web Workers for heavy parsing/export.

**Data flow:** File → Processor (Worker) → UnifiedTextObject → Store → Workflow Engine → Orchestrator → Adapter → Stream → Diff → Result Store → Export Generator (Worker) → Blob.

### Critical Pitfalls

1. **Context Window Overflow** — Token budgeting per node, hierarchical summarization, automatic truncation with notice. *Phase 2*
2. **Diff Accuracy Loss** — Semantic diff (AST-aware) for structured text, word-level fallback, structure metadata preservation. *Phase 3*
3. **Streaming Race Conditions** — AbortController per execution, unique execution IDs, React Query mutation keys, buffered updates. *Phase 2*
4. **IndexedDB Migration Hell** — Versioned schema from v1, explicit migration functions, export/import fallback. *Phase 1*
5. **File Parsing Fidelity Gap** — Define structure capture, document known limits, round-trip test suite, serverless option for high fidelity. *Phase 1*

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Foundation & Core Platform
**Rationale:** Establishes storage, parsing, model routing — everything else depends on these. Addresses Pitfalls #4 (IDB migration) and #5 (parsing fidelity) immediately.
**Delivers:** Vite+React+TS setup, Tailwind design system, IndexedDB schema (v1) with migrations, file upload + parsers (workers), UnifiedTextObject, Model Orchestrator (Local/Cloud adapters with streaming, CORS handling, fallback), Project Manager (tabs, persistence).
**Addresses:** PLAT-01..04, PERS-01 (registry), UX-01..02
**Avoids:** IDB migration hell, parsing fidelity surprises, local model CORS issues

### Phase 2: Persona Execution & Workflow Engine
**Rationale:** Core value loop — persona click → result. Workflow engine enables chaining. Addresses Pitfalls #1 (context window), #3 (streaming races), #6 (state explosion), #8 (prompt injection).
**Delivers:** Persona execution (click → stream → diff), Result Viewer (Monaco Diff + Inline Comments), Workflow Engine (topological execution, checkpoints, async iterator), Workflow Builder UI (React Flow, 3 node types, save/load JSON), Token budgeting + summarization, Prompt delimiter injection protection.
**Addresses:** PERS-02..04, WFLOW-01..02/04, EXPT-01..02
**Uses:** React Flow, Monaco Diff, diff-match-patch, tiktoken
**Implements:** Adapter pattern, UnifiedTextObject, Async Iterator Engine

### Phase 3: Export Quality & Writing/Control Skills
**Rationale:** Export is the deliverable — must be production quality. Writing/Control skills expand the node palette. Addresses Pitfall #2 (diff accuracy).
**Delivers:** Export Generator (Markdown, DOCX Track Changes, PDF Annotations) in Workers, Semantic Diff Engine (AST-aware for MD, structure-aware for DOCX), Writing Skill Nodes (generation, derivates, research, logic), Control Skill Nodes (rules, consistency, logic, metrics), Skill Parameterization UI.
**Addresses:** EXPT-03, WRIT-01..04, CTRL-01..04, WFLOW-02 (full categories)
**Uses:** docx, pdf-lib, markdown-it, custom diff post-processing

### Phase 4: Advanced Workflows & Polish
**Rationale:** Differentiators that justify the "workflow builder" claim. Offline-hardening for reliability.
**Delivers:** Advanced Pipeline (branch, loop, conditional nodes), Live Execution Inspector (pause, inspect node output, resume), History per Text (timeline, rerun), Offline-First (Service Worker, background sync queue, conflict resolution), Batch Processing (queue multiple files), Command Palette + Shortcuts.
**Addresses:** WFLOW-03, EXPT-04, UX-03..04

### Phase Ordering Rationale

- **Dependencies:** File parsing → UnifiedTextObject → Persona Execution → Workflow Engine → Export. Each phase consumes previous phase's output types.
- **Architecture:** Adapter pattern (Phase 1) enables engine (Phase 2) without model coupling. UnifiedTextObject (Phase 1) enables semantic diff (Phase 3).
- **Pitfall avoidance:** IDB migration (Phase 1) prevents data loss before users invest. Context window (Phase 2) prevents silent degradation. Diff accuracy (Phase 3) protects core value.
- **Risk reduction:** Phase 1 validates local model integration end-to-end. Phase 2 validates streaming + execution model. Phase 3 validates export fidelity.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 2:** Token budgeting algorithms (sliding window vs. hierarchical summary) — needs empirical testing with target models
- **Phase 3:** Semantic diff for DOCX — may require serverless LibreOffice for high fidelity; evaluate trade-offs
- **Phase 4:** Offline sync conflict resolution — CRDT (Yjs) vs. last-write-wins vs. manual merge

Phases with standard patterns (skip research-phase):
- **Phase 1:** Vite/React/TS/Tailwind/Zustand/idb — well-documented, established patterns
- **Phase 2 (UI):** React Flow, Monaco Editor — mature libraries, good examples

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All libraries verified current (2025), compatible versions mapped |
| Features | HIGH | Based on competitor analysis (Notion AI, Cursor, Custom GPTs) + domain knowledge |
| Architecture | HIGH | Patterns (Adapter, Unified IR, Async Iterator) are standard for this domain |
| Pitfalls | HIGH | Sourced from LLM app post-mortems, library issue trackers, OWASP LLM Top 10 |

**Overall confidence:** HIGH

### Gaps to Address

- **Local model performance:** Ollama/LM Studio streaming latency on various hardware — validate during Phase 1 implementation
- **PDF parsing fidelity:** pdf-parse has known issues with column layout — test with real documents, evaluate serverless pdf-lib/PDFium fallback
- **DOCX Track Changes spec:** docx library Track Changes support — verify round-trip with Word/LibreOffice during Phase 3
- **IndexedDB quota:** Browser limits vary (Firefox 50MB, Chrome ~80% disk) — implement quota monitoring + user warning

## Sources

### Primary (HIGH confidence)
- React Flow v11 docs — Node/Edge architecture, custom nodes, performance
- Monaco Editor API — DiffEditor, decorations, Web Worker integration
- Zustand v4 docs — Middleware, persist, devtools, slice pattern
- Anthropic API Docs — Streaming, prompt injection mitigations, model params
- Ollama REST API — /api/chat streaming, CORS configuration, model management
- diff-match-patch (Google) — Algorithm, timeout, semantic cleanup
- docx v8 / pdf-lib v1.17 — Track Changes XML, PDF Annotations

### Secondary (MEDIUM confidence)
- Notion AI / Cursor / GitHub Copilot / Custom GPTs — Feature comparison
- IndexedDB / idb — Migration patterns, quota limits, browser variance
- pdf-parse / mammoth — Known fidelity limitations, GitHub issues

### Tertiary (LOW confidence)
- Web Worker performance for parsing/export — needs profiling on target devices
- Service Worker + Background Sync API — browser support matrix (Safari lag)

---
*Research completed: 2025-06-29*
*Ready for roadmap: yes*