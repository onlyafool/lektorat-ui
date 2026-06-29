# Phase 1: Foundation & Core Platform - Context

**Gathered:** 2025-06-29
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 1 delivers the foundational platform for the Lektorat-Workflow-UI application. This phase focuses on establishing the core technical foundation, data handling infrastructure, and platform architecture that enables all subsequent phases' persona and workflow features.

This is not a feature-complete product — it's the underlying platform that must be robust before building complexity on top.

</domain>

<decisions>
## Implementation Decisions

### Technical Stack - Core Framework
- **D-01:** React 18 + Vite + TypeScript — Preferred framework stack for development speed and type safety
- **D-02:** Tailwind CSS 3.4 + Utility-first approach — Rapid styling, consistent dark/light themes
- **D-03:** Zustand 4 for state management with idb middleware — Simple Redux alternative with native persistence
- **D-04:** Monaco Editor 0.48 for diff viewing — VS Code's editor engine out-of-the-box
- **D-05:** Vite-optimized build with HMR — Fast development feedback cycle
- **D-06:** React 18 concurrent features — For smooth streaming UX in workflow execution
- **D-07:** Luke-maintained project structure with feature-based separation — Clear boundaries, parallel development possible

### Architecture - Separation of Concerns
- **D-08:** Server-side rendering not required — Client-side first focus
- **D-09:** Component-based architecture with feature folders — Each major capability owns its components
- **D-10:** Centralized error handling with Zod validation — Type-safe API/response validation
- **D-11:** Custom error boundaries for graceful UI failure recovery
- **D-12:** Support for Web Workers for heavy parsing/generation — Main thread stays responsive

### Data Flow & File Processing
- **D-13:** UnifiedTextObject abstraction — Normalized representation for all text types
- **D-14:** mammoth + pdf-parse for format parsing — Industry standard libraries
- **D-15:** diff-match-patch for granular diff algorithms — Precise change tracking
- **D-16:** IndexedDB with idb middleware for offline storage — Persistent, fast, offline-first
- **D-17:** Server-Sent Events (SSE) for streaming model responses — Real-time UI updates
- **D-18:** Request/response serialization with structured errors — Consistent API contracts

### Model Runtime & Integration
- **D-19:** Local-first model approach — Ollama/LM Studio for privacy and cost control
- **D-20:** Cloud fallback strategy — Anthropic (Opus, Sonnet, Haiku) + OpenRouter for capacity/availability
- **D-21:** Model parameter configuration per persona — Temperature, tokens, topP, stop sequences
- **D-22:** Streaming support for all model adapters — Smooth UX with long responses
- **D-23:** Automatic fallback on local model failure — Seamless switch to cloud providers
- **D-24:** Model health checking with retry logic — Continuous availability monitoring

### Project Management & Dev Workflow
- **D-25:** Zero-config development setup — Vite defaults with TypeScript support
- **D-26:** ESLint + Prettier for consistent code formatting — Automated quality enforcement
- **D-27:** Rollup analysis excluded during this phase — Focus on platform, not optimization
- **D-28:** Local-first deployment with Vercel/Netlify edge functions — Edge compute for API needs
- **D-29:** Token budgeting per workflow execution — Prevent context window overflow
- **D-30:** Sandbox environment with isolated user data — Prevent cross-user contamination

### Requirements - What's In/Out
- **D-31:** Platform requirements (PLAT-01..04) are fully defined and locked — React+Vite+TS, Serverless, Model Integration, File Upload/Parsing
- **D-32:** UX baseline requirements (UX-01..04, UX-03 excluded) — Theme, Tabs, Settings implemented
- **D-33:** Persona registry requirement (PERS-01) established — CRUD foundation in place
- **D-34:** No new capabilities added beyond phase scope — Stay focused on platform foundation
- **D-35:** All research findings incorporated — Technology stack, architecture patterns, pitfalls addressed

### Rolling Decisions - Claude's Discretion
- **D-36:** Codebase patterns for reusable components — Researcher will identify existing patterns (Card, Editor, Workflow components, hooks, utilities)
- **D-37:** Route planning implementation options — Planner will choose folder structure, import organization
- **D-38:** Specific performance targets — Set during Phase 5 (Hardening) after platform is stable
- **D-39:** Error message wording — Will be refined during Phase 4 (UX Polish)

### Folded Todos (from cross-reference analysis)
- None - No todos folded into Phase 1 scope during cross-reference analysis

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Technical Stack & Architecture
- `PROJECT.md` — Project context and core vision
- `REQUIREMENTS.md` §4 (Platform Core) — Specific technical requirements
- `STATE.md` §21 (Current Phase 1) — Current status and requirements
- `.planning/config.json` — System configuration (granularity=standard, parallelization=false, budget model)

### Existing Components & Patterns
- `README.md` in project root — Setup instructions, development workflow

### Research References
- `.planning/research/STACK.md` — Recommended technologies with versions
- `.planning/research/ARCHITECTURE.md` §35-39 — Component responsibilities and patterns
- `.planning/research/FEATURES.md` §1 Table Stakes — Core features for MVP
- `.planning/research/PITFALLS.md` §1-5 — Critical pitfalls and mitigations for Phase 1

### Deprecated / Excluded
- None - All relevant research sources captured

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **Monaco Editor** — Complete diff viewer component with annotation support
- **Zustand** — Lightweight state management with persistence middleware
- **React Flow** — Node/edge workflow builder (though not core in Phase 1)
- **Tailwind CSS** — Utility-first styling system
- **React Icons (lucide-react)** — Icon set consistent with design system

### Established Patterns
- **Directory Structure** — Feature-based organization in `src/features/`
- **Component Architecture** — Presentation components in `src/components/ui/`
- **Hook Patterns** — Custom hooks in `src/features/*/hooks/`
- **State Patterns** — Global store + feature-specific stores
- **Error Handling** — Try-catch with user-friendly error boundaries
- **Development Workflow** — Vite-powered hot reload with TypeScript support

### Integration Points
- **Model Integration** — Adapter pattern for local/cloud LLM providers
- **File Processing Pipeline** — Upload → Parser → UnifiedObject → Store
- **State Persistence** — IndexedDB with CRUD operations
- **UI Framework Integration** — React component lifecycle management
- **Service Worker Architecture** — Future offline sync integration

</code_context>

<specifics>
## Specific Ideas

### Architecture Decisions
- Platform uses a micro-frontends-inspired approach within a single React app
- State management is centralized but features can own their sub-stores
- API clients are explicitly typed for each backend service (local LLMs, cloud APIs)
- Build tooling is optimized for fast feedback (Vite with HMR)
- TypeScript is mandatory throughout the codebase
- Dark/light theme is built into Tailwind configuration

### Implementation Priorities
- Developer experience is prioritized: fast feedback, clear errors, consistent patterns
- Security is built into the platform: sandboxing, CORS handling, sanitized file processing
- Offline capability is a feature — IndexedDB for all data persistence
- Scalability is considered: edge functions for API needs, CDN for static assets
- Maintainability is emphasized: clear component boundaries, typed APIs, comprehensive tests

### References
- Issue #23 notes: User workflow expectations from earlier prototypes
- Branch `feature/feature-parsing`: Implementation of .docx support in this phase

### Platform-Specific Requirements
- GitHub Copilot integration for feature development
- PWA capabilities for offline-first experience
- Keyboard shortcuts mapping for all major operations
- Accessibility compliance (WCAG 2.1 AA) for core UI components

### Team Coordination Notes
- Backend and frontend teams coordinate via shared services
- QA testing focuses on cross-browser compatibility (Chrome, Safari, Firefox)
- Release process includes semantic versioning for platform updates
- Documentation is written alongside code (README, architecture docs)

### Risk Mitigation
- Local model failure handled by automatic cloud fallback
- File parsing errors logged and user notified with specific format errors
- UI freezes prevented by offloading work to Web Workers
- Data loss prevented by IndexedDB persistence with user-accessible exports

</specifics>

<deferred>
## Deferred Ideas

- **Multi-User Collaboration** — Real-time editing features belong in a future phase beyond Phase 1 scope
- **Self-Hosted Backend** — Docker/K8s deployment options are platform-enabling but not core to Phase 1
- **Performance Monitoring** — APM and error tracking will be added in Phase 5 hardening
- **Advanced User Management** — Enterprise features (RBAC, SSO) postponed to later phases
- **Mobile Native Build** — PWA-first approach, native app development is separate phase
- **Advanced ML Model Training** — Fine-tuning capabilities for custom models is out of scope for MVP

</deferred>

---

*Phase: 01-foundation-core-platform*
*Context gathered: 2025-06-29*

**Status ready for Phase 1 Planning:**
- Core technical foundations established
- Architecture patterns defined
- Data flow and model integration decisions made
- Platform decisions locked for Phase 1 implementation
- All phase requirements captured and traceable
- Existing reusable assets and patterns identified
- Specific implementation guidance provided for planner
- Researcher can focus on actual implementation details