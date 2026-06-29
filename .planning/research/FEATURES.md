# Feature Research

**Domain:** LLM-powered Text Editing Workflow Builder (Web)
**Researched:** 2025-06-29
**Confidence:** HIGH

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| File Upload (drag & drop, multiple formats) | Standard for any text tool | MEDIUM | .txt, .md, .docx, .pdf, .rtf → unified text object |
| Persona/Profile Management | Core metaphor of the product | MEDIUM | Name, description, system prompt, model params |
| Persona Execution (click → run on text) | Primary interaction | MEDIUM | Streaming response, cancel, retry |
| Diff View (side-by-side + unified) | Essential for reviewing changes | HIGH | Character/word/line granularity, syntax highlight |
| Inline Comments/Annotations | Standard review metaphor | HIGH | Category-colored, resolvable, threaded |
| Export (Markdown, DOCX, PDF) | Must share results | MEDIUM | Track Changes in DOCX, annotations in PDF |
| Workflow Builder (visual, drag-drop) | Core differentiator | HIGH | Nodes=skills, edges=data flow, parallel/sequential |
| Workflow Save/Load/Version | Reusability requirement | MEDIUM | JSON schema, import/export, templates |
| Model Configuration (local + cloud) | Privacy + cost control | MEDIUM | Ollama/LM Studio + Anthropic/OpenRouter fallback |
| Project/Tab Management | Multiple texts in flight | LOW | Tabs or spaces, persist in IndexedDB |
| Dark/Light Theme | 2025 standard | LOW | System preference + manual toggle |
| Keyboard Shortcuts / Command Palette | Power-user expectation | MEDIUM | Cmd+K palette, common actions |

### Differentiators (Competitive Advantage)

Features that set the product apart. Not required, but valuable.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Three Skill Categories (Personas, Writing, Control) | Unified mental model | MEDIUM | Color-coded nodes, category-specific UI |
| Flexible Pipeline (branch, loop, conditional) | Beyond linear chains | HIGH | If/then, for-each, parallel branches |
| Live Execution with Intermediate Inspection | Debugging complex flows | HIGH | Pause, inspect node output, resume |
| Logic/Timeline Consistency Checking | Domain-specific quality | HIGH | Custom skill type, structured output |
| Custom Scoring/Metrics per Skill | Quantifiable quality | MEDIUM | Readability, SEO, custom rubrics |
| Skill Parameterization (temp, tokens, topP) | Fine-tuned control | LOW | Per-skill override, global defaults |
| Offline-First with Sync | Works anywhere | HIGH | IndexedDB + background sync queue |
| Workflow Templates Marketplace | Community sharing | MEDIUM | Export/import .workflow.json, versioning |
| Batch Processing (multiple files, same workflow) | Scale for editors | MEDIUM | Queue, progress, combined report |
| Change History per Text (git-like) | Audit trail | MEDIUM | Timestamp, workflow, personas, metrics |

### Anti-Features (Commonly Requested, Often Problematic)

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Real-time Collaboration | "Google Docs style" | CRDT complexity, conflict resolution, backend cost | Single-user first, share via export |
| Plugin System for 3rd-party Skills | Extensibility | Security, sandboxing, versioning hell | MCP integration later, own skills only |
| Fine-tuning UI | "Train my own model" | GPU cost, data prep, expertise barrier | Prompt engineering + RAG instead |
| Voice Input/Dictation | Accessibility | Browser API limitations, accuracy | OS-level dictation sufficient |
| Mobile App | "Work on phone" | Complex text editing on mobile, different UX | Responsive PWA, desktop-first |
| Auto-save to Cloud | "Never lose work" | Privacy concerns, sync conflicts | Local-first + manual export/backup |
| Inline Editing of AI Output | "Fix AI mistakes directly" | Breaks diff tracking, unclear provenance | Accept/Reject + manual edit cycle |
| Multi-model Ensemble Voting | "Better accuracy" | Latency, cost, complexity | Single best model + good prompts |

## Feature Dependencies

```
File Parsing (PLAT-04)
    └──requires──> Unified Text Object
                       └──requires──> All downstream features

Persona Registry (PERS-01)
    └──requires──> Model Config (PLAT-03)
    └──requires──> Skill Parameter Schema

Workflow Builder (WFLOW-01)
    └──requires──> React Flow Integration
    └──requires──> Node Type System (3 categories)
    └──requires──> Execution Engine
           └──requires──> Model Orchestration (PLAT-03)
           └──requires──> Streaming + Progress

Diff View (EXPT-01)
    └──requires──> Unified Text Object
    └──requires──> diff-match-patch Integration

Inline Comments (EXPT-02)
    └──requires──> Diff View (anchors)
    └──requires──> Monaco Decorations API

Export (EXPT-03)
    └──requires──> Diff View (for Track Changes)
    └──requires──> Inline Comments (for PDF annotations)
    └──requires──> docx / pdf-lib libraries

Offline (UX-03)
    └──requires──> IndexedDB Schema (all entities)
    └──requires──> Sync Queue + Conflict Resolution
```

### Dependency Notes

- **File Parsing requires Unified Text Object:** All downstream features (personas, workflows, diff, export) operate on a normalized text representation with metadata (original format, structure hints).
- **Workflow Builder requires Execution Engine:** Visual builder is useless without runtime. Engine must handle streaming, errors, partial results.
- **Export requires Diff + Comments:** Track Changes needs diff data; PDF annotations need comment positions.
- **Offline requires complete Schema:** Can't sync partial state; all entities (texts, workflows, personas, history) must be serializable.

## MVP Definition

### Launch With (v1)

Minimum viable product — what's needed to validate the concept.

- [ ] **PLAT-01/02/03/04** — React+Vite+TS, Serverless, Local+Cloud Models, File Upload/Parsing — Core platform
- [ ] **PERS-01/02/03/04** — Persona Registry, 7+ Personas, Click-to-Run, Diff+Inline+Raw — Core persona loop
- [ ] **WFLOW-01/02/04** — Visual Builder (3 categories), Save/Load JSON — Core workflow loop
- [ ] **EXPT-01/02/03** — Diff View, Inline Comments, Export (MD/DOCX/PDF) — Review & Share
- [ ] **UX-01/02** — Theme, Tabs, Shortcuts — Usability baseline

### Add After Validation (v1.x)

Features to add once core is working.

- [ ] **WRIT-01..04** — Writing Skills (Generation, Derivates, Research, Logic) — Expand skill types
- [ ] **CTRL-01..04** — Control Skills (Rules, Consistency, Logic, Metrics) — Quality assurance
- [ ] **WFLOW-03** — Branching, Loops, Conditionals — Advanced pipelines
- [ ] **EXPT-04** — History per Text — Audit trail
- [ ] **UX-03** — Offline-First (IndexedDB) — Reliability

### Future Consideration (v2+)

Features to defer until product-market fit is established.

- [ ] **Batch Processing** — Scale for editors
- [ ] **Workflow Templates Marketplace** — Community
- [ ] **MCP Integration** — 3rd-party skills
- [ ] **Collaboration/Sharing** — Multi-user
- [ ] **Mobile/PWA** — Platform expansion

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| File Upload + Parsing | HIGH | MEDIUM | P1 |
| Persona Registry + Execution | HIGH | MEDIUM | P1 |
| Diff View (Side-by-Side) | HIGH | HIGH | P1 |
| Inline Comments | HIGH | HIGH | P1 |
| Export (MD + DOCX Track Changes) | HIGH | MEDIUM | P1 |
| Workflow Builder (Visual) | HIGH | HIGH | P1 |
| Workflow Save/Load | HIGH | MEDIUM | P1 |
| Model Config (Local + Cloud) | HIGH | MEDIUM | P1 |
| Project/Tabs | MEDIUM | LOW | P1 |
| Theme + Shortcuts | MEDIUM | LOW | P1 |
| Writing Skills | MEDIUM | MEDIUM | P2 |
| Control Skills | MEDIUM | MEDIUM | P2 |
| Advanced Workflow (Branch/Loop) | MEDIUM | HIGH | P2 |
| History per Text | MEDIUM | MEDIUM | P2 |
| Offline-First | MEDIUM | HIGH | P2 |
| Batch Processing | LOW | MEDIUM | P3 |
| Template Marketplace | LOW | MEDIUM | P3 |

## Competitor Feature Analysis

| Feature | Notion AI | Cursor / VS Code | Custom GPTs | Our Approach |
|---------|-----------|------------------|-------------|--------------|
| Persona Management | Limited | Via Prompts | Yes (Instructions) | First-class, parameterized |
| Visual Workflow Builder | No | No (Chat) | No | React Flow, nodes/edges |
| Diff View | Basic | Git-style | No | Side-by-side + Unified + Inline |
| Export Track Changes | No | No | No | DOCX + PDF annotations |
| Local Models | No | Via Extensions | No | Ollama/LM Studio native |
| File Upload (docx/pdf) | Yes | Limited | Via Code Interpreter | Native parsing |
| Offline-First | No | Partial | No | IndexedDB + Sync Queue |
| Skill Categories | No | No | No | 3 Categories (Persona/Write/Control) |

## Sources

- Notion AI, Cursor, GitHub Copilot, Custom GPTs — Feature comparison
- React Flow examples — Workflow builder patterns
- Monaco Editor playground — Diff editor capabilities
- docx / pdf-lib docs — Track Changes / Annotations APIs
- Ollama / LM Studio REST APIs — Local model integration
- IndexedDB / idb — Offline-first patterns

---
*Feature research for: Lektorat-Workflow-UI*
*Researched: 2025-06-29*