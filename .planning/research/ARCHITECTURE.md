# Architecture Research

**Domain:** LLM-powered Text Editing Workflow Builder (Web)
**Researched:** 2025-06-29
**Confidence:** HIGH

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            CLIENT (Browser)                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │   Project    │  │  Workflow    │  │   Persona    │  │   Result     │    │
│  │   Manager    │  │   Builder    │  │   Registry   │  │   Viewer     │    │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘    │
│         │                 │                 │                 │             │
│         └─────────────────┼─────────────────┼─────────────────┘             │
│                           ▼                                                 │
│              ┌────────────────────────┐                                    │
│              │    Workflow Engine     │                                    │
│              │  (Execution Runtime)   │                                    │
│              └───────────┬────────────┘                                    │
│                          │                                                 │
│         ┌───────────────┼───────────────┐                                 │
│         ▼               ▼               ▼                                 │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐                         │
│  │ Model       │ │  File       │ │  Export     │                         │
│  │ Orchestrator│ │  Processor  │ │  Generator  │                         │
│  └──────┬──────┘ └──────┬──────┘ └──────┬──────┘                         │
│         │               │               │                                  │
└─────────┼───────────────┼───────────────┼─────────────────────────────────┘
          │               │               │
          ▼               ▼               ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          SERVERLESS FUNCTIONS                                │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │  Model       │  │  File        │  │  Export      │  │  Sync        │    │
│  │  Proxy       │  │  Parser      │  │  Heavy       │  │  (Future)    │    │
│  │  (Cloud)     │  │  (pdf/docx)  │  │  (PDF gen)   │  │              │    │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
          │               │               │
          ▼               ▼               ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         EXTERNAL SERVICES                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                      │
│  │  Local LLMs  │  │  Cloud LLMs  │  │  Storage     │                      │
│  │ (Ollama/LMS) │  │ (Anthropic/) │  │ (Future)     │                      │
│  └──────────────┘  │  OpenRouter) │  └──────────────┘                      │
│                    └──────────────┘                                          │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                          LOCAL STORAGE (IndexedDB)                           │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │  Texts       │  │  Workflows   │  │  Personas    │  │  History     │    │
│  │  (content,   │  │  (nodes,     │  │  (config,    │  │  (runs,      │    │
│  │   metadata)  │  │   edges)     │  │   params)    │  │   results)   │    │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| **Project Manager** | Text lifecycle: create, open, save, delete, tabs, metadata | Zustand store + IndexedDB persist |
| **Workflow Builder** | Visual DAG editor: nodes, edges, validation, templates | React Flow + custom node types |
| **Persona Registry** | CRUD for personas: config, parameters, versions | Zustand store + JSON schema (Zod) |
| **Result Viewer** | Diff, inline comments, raw text, export triggers | Monaco Diff Editor + custom decorations |
| **Workflow Engine** | Topological execution, streaming, error handling, checkpoints | Custom async iterator + React Query mutations |
| **Model Orchestrator** | Route requests: local → cloud fallback, streaming, params | Adapter pattern (LocalAdapter, CloudAdapter) |
| **File Processor** | Parse uploads → UnifiedTextObject, extract structure | mammoth/pdf-parse in Web Worker |
| **Export Generator** | Diff→TrackChanges, Comments→Annotations, multi-format | docx/pdf-lib in Web Worker |

## Recommended Project Structure

```
src/
├── app/                    # App shell, routing, providers
│   ├── App.tsx
│   ├── main.tsx
│   └── providers.tsx       # QueryClient, Theme, Zustand
├── features/               # Feature-based modules (domain-driven)
│   ├── project-manager/    # Texts, tabs, metadata
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── store.ts        # Zustand store
│   │   └── types.ts
│   ├── workflow-builder/   # Visual DAG editor
│   │   ├── components/
│   │   │   ├── nodes/      # PersonaNode, WritingNode, ControlNode
│   │   │   └── edges/
│   │   ├── hooks/
│   │   ├── engine/         # Execution runtime
│   │   ├── store.ts
│   │   └── types.ts
│   ├── persona-registry/   # Persona CRUD, parameterization
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── store.ts
│   │   └── types.ts
│   ├── result-viewer/      # Diff, comments, export
│   │   ├── components/
│   │   │   ├── DiffView.tsx
│   │   │   ├── InlineComments.tsx
│   │   │   └── ExportDialog.tsx
│   │   ├── hooks/
│   │   └── types.ts
│   ├── file-processor/     # Upload → UnifiedTextObject
│   │   ├── workers/        # Web Workers for parsing
│   │   ├── parsers/        # txt, md, docx, pdf, rtf
│   │   └── types.ts
│   ├── model-orchestrator/ # Local/Cloud routing, streaming
│   │   ├── adapters/
│   │   │   ├── LocalAdapter.ts
│   │   │   ├── CloudAdapter.ts
│   │   │   └── AdapterInterface.ts
│   │   ├── streaming.ts
│   │   └── types.ts
│   └── export-generator/   # Multi-format export
│       ├── workers/
│       ├── generators/     # Markdown, DOCX, PDF
│       └── types.ts
├── shared/                 # Cross-cutting concerns
│   ├── ui/                 # Design system components
│   │   ├── Button.tsx
│   │   ├── Modal.tsx
│   │   ├── CommandPalette.tsx
│   │   └── ...
│   ├── lib/                # Pure utilities
│   │   ├── diff.ts         # diff-match-patch wrapper
│   │   ├── storage.ts      # idb wrapper
│   │   ├── validation.ts   # Zod schemas
│   │   └── format.ts       # date-fns, file-saver
│   ├── hooks/              # Shared React hooks
│   │   ├── useIndexedDB.ts
│   │   ├── useKeyboardShortcuts.ts
│   │   └── useDebounce.ts
│   └── types/              # Shared TypeScript types
│       ├── text.ts         # UnifiedTextObject
│       ├── workflow.ts     # Workflow, Node, Edge
│       ├── persona.ts      # Persona, ModelParams
│       └── result.ts       # ExecutionResult, Diff, Comment
├── serverless/             # Vercel/Netlify Functions
│   ├── api/
│   │   ├── model-proxy.ts      # Cloud LLM calls
│   │   ├── file-parser.ts      # Heavy docx/pdf parsing
│   │   ├── export-pdf.ts       # PDF generation
│   │   └── sync.ts             # Future: cloud sync
│   └── utils/
└── styles/                 # Global styles, Tailwind
    ├── globals.css
    └── tailwind.css
```

### Structure Rationale

- **features/**: Domain-driven, each feature owns its components, hooks, store, types. Enables parallel work, clear boundaries.
- **shared/ui**: Design system — single source of truth for look & feel.
- **shared/lib**: Pure functions, no React deps, easily testable, reusable.
- **serverless/**: Co-located with client, same repo, TypeScript end-to-end.
- **workers/**: Heavy parsing/generation off main thread, prevents UI jank.

## Architectural Patterns

### Pattern 1: Adapter Pattern for Model Providers

**What:** Unified interface for local (Ollama/LM Studio) and cloud (Anthropic/OpenRouter) models.

**When to use:** Multiple model backends with different APIs, need seamless fallback.

**Trade-offs:** +Swap providers without UI changes, +Test with mocks, -Abstraction overhead.

**Example:**
```typescript
// shared/types/model.ts
interface ModelAdapter {
  complete(params: CompletionParams): AsyncIterable<string>;
  getModels(): Promise<ModelInfo[]>;
}

// features/model-orchestrator/adapters/LocalAdapter.ts
class LocalAdapter implements ModelAdapter {
  constructor(private baseUrl: string) {}
  async *complete(params) { /* SSE to Ollama */ }
  async getModels() { /* /api/tags */ }
}

// features/model-orchestrator/adapters/CloudAdapter.ts
class CloudAdapter implements ModelAdapter {
  constructor(private apiKey: string, private provider: 'anthropic' | 'openrouter') {}
  async *complete(params) { /* Anthropic SDK streaming */ }
  async getModels() { /* static list or /models */ }
}
```

### Pattern 2: Unified Text Object (Normalized IR)

**What:** Single source of truth for text content across all features.

**When to use:** Multiple input formats, multiple output formats, need structure metadata.

**Trade-offs:** +Decouples parsers from consumers, +Enables diff/annotations on structure, -Extra transformation step.

**Example:**
```typescript
// shared/types/text.ts
interface UnifiedTextObject {
  id: string;
  originalFormat: 'txt' | 'md' | 'docx' | 'pdf' | 'rtf';
  originalFile: File;           // for re-export
  content: string;              // plain text (Markdown-normalized)
  structure: TextStructure;     // headings, paragraphs, lists, tables
  metadata: {
    wordCount: number;
    charCount: number;
    language?: string;
    createdAt: Date;
    updatedAt: Date;
  };
}
```

### Pattern 3: Workflow Execution as Async Iterator with Checkpoints

**What:** Execute DAG node-by-node, yield intermediate results, persist state for resume.

**When to use:** Long-running pipelines, need inspection/debugging, support pause/resume.

**Trade-offs:** +Observable progress, +Recoverable, +Intermediate results for UI, -Complex state machine.

**Example:**
```typescript
// features/workflow-builder/engine/execute.ts
async function* executeWorkflow(
  workflow: Workflow,
  input: UnifiedTextObject,
  context: ExecutionContext
): AsyncGenerator<NodeResult, FinalResult, void> {
  const sorted = topologicalSort(workflow.nodes, workflow.edges);
  const nodeOutputs = new Map<string, NodeResult>();

  for (const node of sorted) {
    const inputs = gatherInputs(node, nodeOutputs, input);
    const result = await executeNode(node, inputs, context);
    nodeOutputs.set(node.id, result);
    yield { nodeId: node.id, result, progress: index / sorted.length };
    
    // Checkpoint for resume
    await context.saveCheckpoint({ nodeOutputs, currentNode: node.id });
  }
  return aggregateResults(nodeOutputs);
}
```

## Data Flow

### Request Flow: Persona Execution

```
[User clicks Persona]
       ↓
[PersonaRegistry.get(personaId)] → PersonaConfig
       ↓
[ModelOrchestrator.selectAdapter()] → LocalAdapter | CloudAdapter
       ↓
[Adapter.complete({ prompt: persona.systemPrompt + text.content, params: persona.params })]
       ↓ (streaming chunks)
[UI: Streaming display in ResultViewer]
       ↓
[Complete] → DiffEngine.diff(text.content, result)
       ↓
[ResultViewer: DiffView + InlineComments]
       ↓
[User: Accept/Reject/Export] → ExportGenerator.generate(format)
```

### State Management

```
[Zustand Stores (per feature)]
       ↓ (persist middleware)
[IndexedDB (idb)]
       ↓ (subscribe)
[React Components] ←→ [Actions] → [Store Setters] → [IndexedDB]
```

- **Project Store**: texts[], activeTextId, tabs[]
- **Workflow Store**: workflows[], activeWorkflowId, executionState
- **Persona Store**: personas[], activePersonaId
- **History Store**: runs[] (textId, workflowId, timestamp, results)

### Key Data Flows

1. **Text Ingestion:** File → FileProcessor (Worker) → UnifiedTextObject → Project Store → IndexedDB
2. **Workflow Execution:** Workflow DAG → Engine → Model Orchestrator → Adapter → Stream → Diff → Result Store
3. **Export:** Result + Diff + Comments → Export Generator (Worker) → Blob → FileSaver.saveAs()

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| Single user (local) | Current architecture works — all client-side, serverless only for cloud LLMs |
| Power user (100s texts, complex workflows) | Add virtualized lists, lazy-load workflows, Web Worker for engine |
| Team (future) | Add Supabase/PocketBase for auth + realtime, CRDT (Yjs) for collab, shared IndexedDB sync |

### Scaling Priorities

1. **First bottleneck:** Large file parsing (pdf-parse blocks main thread) → **Fix:** Move to Web Worker / Serverless Function
2. **Second bottleneck:** Monaco Editor with huge texts (>100k chars) → **Fix:** Virtualized diff, lazy decoration rendering
3. **Third bottleneck:** Workflow execution state explosion → **Fix:** Checkpoint compression, lazy node loading

## Anti-Patterns

### Anti-Pattern 1: God Store

**What people do:** Single Zustand store for entire app state.

**Why it's wrong:** Re-renders everything on any change, couples unrelated features, hard to test.

**Do this instead:** One store per feature (project, workflow, persona, history), compose via React context if needed.

### Anti-Pattern 2: Blocking Main Thread for Parsing/Export

**What people do:** `await mammoth.convertToHtml(file)` in event handler.

**Why it's wrong:** Freezes UI, drops frames, bad UX on large files.

**Do this instead:** Web Worker (`workerize-loader` or Comlink) or Serverless Function for heavy formats.

### Anti-Pattern 3: Tight Coupling Between Workflow Nodes and Persona Types

**What people do:** `if (node.type === 'persona') { ... }` scattered in engine.

**Why it's wrong:** Adding new skill categories requires engine changes, violates OCP.

**Do this instead:** Node executor registry — `executors[node.category](node, inputs)`.

### Anti-Pattern 4: Embedding Model Logic in UI Components

**What people do:** `fetch('/api/anthropic', { body: JSON.stringify({ prompt }) })` in onClick.

**Why it's wrong:** Untestable, no streaming, no fallback, no param management.

**Do this instead:** Model Orchestrator service with Adapter pattern, called via React Query mutation.

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Ollama / LM Studio | REST + SSE (local network) | CORS config needed, health check endpoint |
| Anthropic API | Official SDK (serverless) | Streaming via SSE, proxy through function |
| OpenRouter | REST (serverless) | Unified interface for 100+ models |
| IndexedDB | idb wrapper (client) | Versioned schema, migration on upgrade |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| UI ↔ Workflow Engine | React Query Mutations + Async Iterators | Engine is pure TS, no React deps |
| Engine ↔ Model Orchestrator | Function calls (Adapter Interface) | Sync/async boundary, testable |
| Orchestrator ↔ Adapters | Interface implementation | Swap without engine changes |
| File Processor ↔ Parsers | Strategy Pattern (per format) | Workers for heavy formats |
| Export Generator ↔ Formats | Strategy Pattern (per format) | Workers for PDF/DOCX generation |

## Sources

- React Flow Architecture — Node/Edge types, custom nodes, state management
- Monaco Editor Architecture — Diff Editor, Decorations, Web Workers
- Zustand v4 Patterns — Middleware, persist, devtools, slice pattern
- Web Worker Patterns — Comlink, workerize, transferable objects
- Serverless Function Patterns — Vercel Edge/Node, streaming responses
- IndexedDB / idb — Schema versioning, cursors, bulk operations
- diff-match-patch — Character/word/line diff algorithms
- docx / pdf-lib — Track Changes XML, PDF Annotations

---
*Architecture research for: Lektorat-Workflow-UI*
*Researched: 2025-06-29*