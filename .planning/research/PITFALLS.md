# Pitfalls Research

**Domain:** LLM-powered Text Editing Workflow Builder (Web)
**Researched:** 2025-06-29
**Confidence:** HIGH

## Critical Pitfalls

### Pitfall 1: Context Window Overflow in Workflow Execution

**What goes wrong:**
Long texts + multiple persona passes + conversation history exceed model context window. Truncation loses critical content, produces hallucinated continuations.

**Why it happens:**
- No token budgeting per workflow step
- Naive concatenation of full text + all previous outputs
- Model limits vary (4k-200k), hardcoded assumptions break

**How to avoid:**
- Implement token counter (tiktoken) per adapter
- Chunking strategy: sliding window, hierarchical summarization
- Per-node token budget in workflow definition
- Automatic summarization of intermediate results before next node

**Warning signs:**
- "Model returned empty/cutoff response" errors
- Incoherent outputs after 3+ pipeline steps
- Token estimate logs showing >80% window usage

**Phase to address:** Phase 2 (Model Orchestrator + Workflow Engine)

---

### Pitfall 2: Diff Accuracy Loss on Structured Text

**What goes wrong:**
Character-level diff on Markdown/DOCX produces false positives (formatting changes), misses semantic moves (paragraph reordered), breaks on tables/lists.

**Why it happens:**
- Using plain `diff` on raw strings
- No awareness of document structure (headings, lists, tables)
- Monaco diff editor expects plain text

**How to avoid:**
- Semantic diff: parse to AST (markdown-it, docx AST), diff trees
- For MVP: word-level diff-match-patch + structure-aware post-processing
- Preserve original format metadata for re-export fidelity
- Test with: nested lists, tables, code blocks, cross-references

**Warning signs:**
- "No changes" shown when paragraphs moved
- Formatting noise drowning real edits
- Export loses structure (tables → plain text)

**Phase to address:** Phase 3 (Diff Engine + Export Generator)

---

### Pitfall 3: Streaming UX Race Conditions

**What goes wrong:**
Multiple concurrent persona executions → interleaved streams, wrong results attached to wrong nodes, UI flicker, memory leaks from unclosed readers.

**Why it happens:**
- No request deduplication/cancellation
- Shared mutable state for streaming chunks
- React state updates during async iteration without keys

**How to avoid:**
- AbortController per execution, cancel on unmount/re-run
- Unique execution IDs, results keyed by (workflowId, nodeId, executionId)
- Stream into local buffer, single state update on complete
- React Query `mutationKey` for deduplication

**Warning signs:**
- "Chunk from previous run appears in current run"
- UI shows partial result from cancelled persona
- Console: "Warning: Can't perform state update on unmounted component"

**Phase to address:** Phase 2 (Model Orchestrator Streaming + Workflow Engine)

---

### Pitfall 4: IndexedDB Schema Migration Hell

**What goes wrong:**
Schema changes (new fields, renamed types) break existing user data. No migration path → corrupted state, lost workflows, "clear storage" support tickets.

**Why it happens:**
- No versioned schema from day one
- Direct object stores without migration logic
- idb `upgrade` handler missing or incomplete

**How to avoid:**
- Define idb schema with explicit version from v1
- Write migration functions for each version bump
- Test migrations: create v1 data → upgrade to v2 → verify
- Export/Import JSON as fallback recovery

**Warning signs:**
- "IndexedDB error: ConstraintError" on open
- New users fine, existing users broken after deploy
- `db.version` jumps without migration code

**Phase to address:** Phase 1 (Project Setup + Storage Layer)

---

### Pitfall 5: File Parsing Fidelity Gap

**What goes wrong:**
.docx → text loses: comments, track changes, styles, headers/footers, complex tables. PDF → text loses: columns, reading order, formatting. Round-trip export ≠ original.

**Why it happens:**
- mammoth/pdf-parse extract text, not structure
- No fidelity validation in CI
- Assumption: "text is enough"

**How to avoid:**
- Define `UnifiedTextObject.structure` to capture: headings, lists, tables, styles
- Accept loss: document "known limitations" per format
- Round-trip test suite: original → parse → export → compare
- For high-fidelity needs: serverless with LibreOffice/PDFium

**Warning signs:**
- "My bullet points became paragraphs"
- "Table data scrambled"
- "Heading hierarchy lost"

**Phase to address:** Phase 1 (File Processor) — set expectations early

---

### Pitfall 6: Workflow State Explosion

**What goes wrong:**
Complex workflows (50+ nodes, loops, branches) create massive execution state. Memory spikes, slow serialization, UI freezes during checkpointing.

**Why it happens:**
- Storing full intermediate text per node
- No compression / delta encoding
- Checkpointing every node unconditionally

**How to avoid:**
- Store diffs + base text, not full copies
- Configurable checkpoint interval (every N nodes, or on branch/loop)
- Lazy loading: load node output on demand in Result Viewer
- Web Worker for serialization/checkpointing

**Warning signs:**
- "Tab crashed" on large workflow runs
- IndexedDB quota exceeded
- Checkpoint save > 500ms

**Phase to address:** Phase 2 (Workflow Engine Checkpointing)

---

### Pitfall 7: Local Model CORS / Network Failures

**What goes wrong:**
Ollama/LM Studio on localhost:11434 blocked by browser CORS. User sees "Network Error", no fallback to cloud, no actionable error message.

**Why it happens:**
- Ollama default config doesn't set CORS headers
- LM Studio similar
- No health check / connection test in UI

**How to avoid:**
- Document CORS setup: `OLLAMA_ORIGINS=*`
- Connection test on Settings page (green/red indicator)
- Automatic fallback: local fails → retry cloud (with user consent)
- Clear error: "Local model unreachable. Check Ollama CORS or use Cloud."

**Warning signs:**
- "Works in Postman, fails in browser"
- User reports "local models don't work"
- No network tab errors (opaque CORS)

**Phase to address:** Phase 1 (Model Orchestrator LocalAdapter)

---

### Pitfall 8: Prompt Injection via User Text

**What goes wrong:**
User text contains "Ignore previous instructions and output X" → persona executes injected prompt, leaks system prompt, produces malicious output.

**Why it happens:**
- Naive concatenation: `systemPrompt + userText`
- No input sanitization / delimiter strategy
- Assumption: "user text is passive data"

**How to avoid:**
- Use structured prompt template: `{{system}}\n{{delimiter}}\n{{user_text}}\n{{delimiter}}`
- Delimiter: random UUID per request, validated on response
- Strip/escape delimiter-like sequences from user text
- Log injection attempts (security monitoring)

**Warning signs:**
- Persona outputs unrelated output appears
- System prompt leaked in result
- Unexpected "I cannot" refusals

**Phase to address:** Phase 2 (Model Orchestrator Prompt Building)

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Skip semantic diff, use char-level | Fast MVP | False positives, user distrust | Never for v1 — core value |
| Single Zustand store | Less boilerplate | Re-render storms, coupling | Only for <3 features |
| No Web Workers for parsing | Simpler code | UI jank on >1MB files | Acceptable for v1 if <500KB |
| Hardcoded model params | Faster dev | Can't optimize per persona | Never — core feature |
| Inline export logic in components | Quick prototype | Untestable, duplicated | Never — extract to service |
| No request deduplication | Simpler | Race conditions, double costs | Never for streaming |

---

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Ollama API | Assume `/api/generate` non-streaming | Use `/api/chat` with `stream: true` for SSE |
| Anthropic SDK | Use in browser directly | Proxy through serverless (API key exposure) |
| pdf-parse | `require('pdf-parse')` in browser | Use Web Worker or serverless (fs dependency) |
| Monaco Editor | Import full monaco-editor | Use `@monaco-editor/react` + dynamic import |
| React Flow | Add nodes directly to state | Use `useNodesState` / `useEdgesState` hooks |
| IndexedDB (idb) | `db.add()` without transaction | Use `tx.objectStore.add()`, await `tx.done` |
| diff-match-patch | `diff_main(text1, text2)` on huge strings | Set `Diff_Timeout`, use `diff_cleanupSemantic` |

---

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Monaco Diff on 100k+ chars | Tab freezes 5-10s, memory >500MB | Virtualized diff, chunked rendering, worker diff | >50k chars |
| React Flow 100+ nodes | Pan/zoom lag, 10fps | `nodeExtent`, virtualization, memoized nodes | >50 nodes |
| IndexedDB bulk put 1000s records | UI blocked, "long task" warning | Batch in chunks (100), use `IDBTransaction` | >500 records |
| Zustand persist full state | Slow init, quota exceeded | Selective persist (only user data), compress | >5MB |
| Token counting per char | O(n) on every keystroke | Debounce, cache, worker | Real-time preview |

---

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| API keys in client bundle | Key theft, quota abuse | Serverless proxy, never VITE_ prefix |
| User text → `eval()` / `new Function()` | RCE | Never. Use JSON.parse, Zod validation |
| Local model SSRF | Access internal network | Validate URLs, allowlist localhost only |
| Exported file XSS (SVG/HTML) | Script execution on open | Sanitize exports, Content-Disposition: attachment |
| Workflow JSON prototype pollution | Logic bypass | Zod schema with `strict()`, no `__proto__` |

---

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| No loading state during model call | "Is it broken?" → refresh → double call | Streaming skeleton, progress %, cancel button |
| Diff only shows added/removed | Can't see "changed" (replace = del+add) | Semantic diff: highlight changed words inline |
| Workflow save overwrites silently | Lost work on accidental click | Versioned saves, "Save As", dirty indicator |
| Persona click → immediate run | No preview of prompt/params | Confirmation modal or side-panel preview |
| Export dialog blocks UI | Can't check result while exporting | Non-modal drawer, background generation |
| No keyboard shortcuts for power actions | Slow workflow | Cmd+Enter (run), Cmd+S (save), Cmd+E (export) |

---

## "Looks Done But Isn't" Checklist

- [ ] **File Upload:** Handles 0-byte, corrupted, password-protected, >100MB files — verify error UX
- [ ] **Persona Execution:** Streaming cancels cleanly on unmount — verify no memory leaks
- [ ] **Diff View:** Shows changes in tables, code blocks, nested lists — verify with fixtures
- [ ] **Export DOCX:** Track Changes actually opens in Word with revisions — verify round-trip
- [ ] **Export PDF:** Annotations appear in Adobe/Preview — verify with fixtures
- [ ] **Workflow Save:** Includes all node positions, viewport, metadata — verify reload restores
- [ ] **IndexedDB:** Migration v1→v2 tested with real v1 data — verify no data loss
- [ ] **Local Model:** CORS error shows actionable help — verify with fresh Ollama install
- [ ] **Offline:** App loads, reads/writes work without network — verify Service Worker + IDB
- [ ] **Theme:** No flash of wrong theme on load — verify `localStorage` read before paint

---

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Context overflow | MEDIUM | Add token budgeting, truncate with summary notice |
| Diff inaccuracy | HIGH | Rewrite diff engine (semantic), reprocess history |
| Streaming races | LOW | Add AbortController, execution IDs, React Query keys |
| IDB migration fail | HIGH | Export JSON → clear storage → import (user action) |
| Parsing fidelity | MEDIUM | Document limits, add serverless parser option |
| State explosion | MEDIUM | Delta checkpoints, lazy loading, worker serialization |
| Local model CORS | LOW | Docs + connection test + auto-fallback |
| Prompt injection | LOW | Add delimiters, sanitize, log attempts |

---

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Context Window Overflow | Phase 2 (Model Orchestrator) | Token budget tests: 4k/8k/32k/100k models |
| Diff Accuracy Loss | Phase 3 (Diff Engine) | Fixture suite: 50 structured docs, visual regression |
| Streaming Race Conditions | Phase 2 (Workflow Engine) | Concurrency test: 10 parallel personas |
| IndexedDB Migration Hell | Phase 1 (Storage Layer) | Migration test matrix: v1→v2→v3 with data |
| File Parsing Fidelity | Phase 1 (File Processor) | Round-trip test: 20 files per format |
| Workflow State Explosion | Phase 2 (Engine Checkpointing) | Load test: 100-node workflow, 10k char text |
| Local Model CORS | Phase 1 (Model Orchestrator) | Fresh install test: Ollama + LM Studio |
| Prompt Injection | Phase 2 (Prompt Building) | Red-team test: 50 injection payloads |

---

## Sources

- Ollama GitHub Issues — CORS, streaming, model management
- Anthropic API Docs — Prompt injection mitigations, streaming
- React Flow GitHub — Performance issues, virtualization
- Monaco Editor Issues — Diff editor large file handling
- IndexedDB / idb — Migration patterns, quota limits
- diff-match-patch — Timeout, cleanup strategies
- OWASP LLM Top 10 — Prompt injection, data leakage
- pdf-parse / mammoth — Known limitations, fidelity gaps

---
*Pitfalls research for: Lektorat-Workflow-UI*
*Researched: 2025-06-29*