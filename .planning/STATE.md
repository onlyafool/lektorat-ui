# Project State: Lektorat-Workflow-UI

**Aktuelle Phase:** 1 — Foundation & Core Platform  
**Status:** ⏳ Geplant (noch nicht gestartet)  
**Letztes Update:** 2025-06-29

---

## Phasen-Status

| Phase | Name | Status | Start | Ende | Requirements Validated |
|-------|------|--------|-------|------|------------------------|
| 1 | Foundation & Core Platform | ⏳ Geplant | — | — | — |
| 2 | Core Loop: Personas & Workflow Engine | ⏳ Geplant | — | — | — |
| 3 | Review & Export | ⏳ Geplant | — | — | — |
| 4 | Advanced Skills & Workflows | ⏳ Geplant | — | — | — |
| 5 | Polish & Offline-First | ⏳ Geplant | — | — | — |

---

## Aktuelle Phase Details (Phase 1)

### Ziel
Lauffähige lokale Web-App mit Vite/React/TS, IndexedDB-Schema (v1 + Migrationen), Datei-Upload + Parsing (5 Formate) → UnifiedTextObject, Model Orchestrator (Local Ollama/LM Studio + Cloud Fallback mit Streaming), Projekt-Manager (Tabs, Persistenz), Theme/Shortcuts/Settings Basis.

### Anforderungen in dieser Phase
- [ ] **PLAT-01**: React + Vite + TS Web-App, deploybar Vercel/Netlify
- [ ] **PLAT-02**: Serverless Functions (Edge/Node) für Datei-Processing & Model-Orchestrierung
- [ ] **PLAT-03**: Lokale Modell-Integration (Ollama/LM Studio) + Cloud-Fallback (Anthropic/OpenRouter)
- [ ] **PLAT-04**: Datei-Upload mit Parsing: .txt, .md, .docx, .pdf, .rtf → UnifiedTextObject
- [ ] **PERS-01**: Persona-Registry (CRUD UI, Zod-Schema, IndexedDB persistiert)
- [ ] **UX-01**: Dark/Light Theme, Tastatur-Shortcuts, Command Palette (Basis)
- [ ] **UX-02**: Projekt-Verwaltung (mehrere Texte parallel, Tabs/Spaces, State pro Tab)
- [ ] **UX-04**: Settings: Model-Endpoints, API-Keys, Default-Parameter, Export-Presets (Basis)

### Success Criteria (Phase 1)
- [ ] `npm run dev` startet Dev-Server, `npm run build` produziert `dist/`, Deploy auf Vercel funktioniert, Health-Check `/api/health` 200
- [ ] IndexedDB Schema v1 initialisiert, Migrationen v1→v2 funktionieren, Export/Import JSON Roundtrip ohne Datenverlust
- [ ] 5 Dateiformate (.txt, .md, .docx, .pdf, .rtf) per Drag&Drop uploadbar → UnifiedTextObject mit `content`, `structure`, `metadata` im Store
- [ ] Ollama Health-Check grün, Anthropic Proxy Call erfolgreich, automatischer Fallback bei lokalem Fehler (Log-Eintrag sichtbar)
- [ ] Theme-Toggle persistiert in localStorage, Cmd+K öffnet Command Palette, Tabs für mehrere Texte, Scroll/Selection State pro Tab erhalten

### Nächste Schritte (Phase 1 Start)
1. `/gsd-discuss-phase 1` — Kontext sammeln, Annahmen klären
2. `/gsd-plan-phase 1` — Detaillierten Plan (PLAN.md) mit Verification Loop erstellen
3. `/gsd-execute-phase 1` — Implementierung mit Wave-basierter Parallelisierung

---

## Requirements Traceability (Current Mapping)

| REQ-ID | Phase | Status | Success Criteria Ref |
|--------|-------|--------|---------------------|
| PLAT-01 | 1 | ⏳ Geplant | ROADMAP.md Phase 1 SC #1 |
| PLAT-02 | 1 | ⏳ Geplant | ROADMAP.md Phase 1 SC #1 |
| PLAT-03 | 1 | ⏳ Geplant | ROADMAP.md Phase 1 SC #4 |
| PLAT-04 | 1 | ⏳ Geplant | ROADMAP.md Phase 1 SC #3 |
| PERS-01 | 1 | ⏳ Geplant | ROADMAP.md Phase 1 SC #2 |
| PERS-02 | 2 | ⏳ Geplant | ROADMAP.md Phase 2 SC #1 |
| PERS-03 | 2 | ⏳ Geplant | ROADMAP.md Phase 2 SC #1 |
| PERS-04 | 2 | ⏳ Geplant | ROADMAP.md Phase 2 SC #2, #3 |
| WRIT-01 | 3 | ⏳ Geplant | ROADMAP.md Phase 3 SC #3 |
| WRIT-02 | 3 | ⏳ Geplant | ROADMAP.md Phase 3 SC #3 |
| WRIT-03 | 3 | ⏳ Geplant | ROADMAP.md Phase 3 SC #3 |
| WRIT-04 | 3 | ⏳ Geplant | ROADMAP.md Phase 3 SC #3 |
| CTRL-01 | 3 | ⏳ Geplant | ROADMAP.md Phase 3 SC #4 |
| CTRL-02 | 3 | ⏳ Geplant | ROADMAP.md Phase 3 SC #4 |
| CTRL-03 | 3 | ⏳ Geplant | ROADMAP.md Phase 3 SC #4 |
| CTRL-04 | 3 | ⏳ Geplant | ROADMAP.md Phase 3 SC #4 |
| WFLOW-01 | 2 | ⏳ Geplant | ROADMAP.md Phase 2 SC #4 |
| WFLOW-02 | 2/3 | ⏳ Geplant | ROADMAP.md Phase 2 SC #4, Phase 3 SC #5 |
| WFLOW-03 | 4 | ⏳ Geplant | ROADMAP.md Phase 4 SC #1 |
| WFLOW-04 | 2 | ⏳ Geplant | ROADMAP.md Phase 2 SC #4 |
| EXPT-01 | 2 | ⏳ Geplant | ROADMAP.md Phase 2 SC #2 |
| EXPT-02 | 2 | ⏳ Geplant | ROADMAP.md Phase 2 SC #3 |
| EXPT-03 | 3 | ⏳ Geplant | ROADMAP.md Phase 3 SC #1 |
| EXPT-04 | 4 | ⏳ Geplant | ROADMAP.md Phase 4 SC #3 |
| UX-01 | 1/5 | ⏳ Geplant | ROADMAP.md Phase 1 SC #5, Phase 5 SC #4 |
| UX-02 | 1/5 | ⏳ Geplant | ROADMAP.md Phase 1 SC #5, Phase 5 SC #4 |
| UX-03 | 4/5 | ⏳ Geplant | ROADMAP.md Phase 4 SC #4, Phase 5 SC #3 |
| UX-04 | 1/5 | ⏳ Geplant | ROADMAP.md Phase 1 SC #5, Phase 5 SC #4 |

---

## Offene Entscheidungen / Risiken (aus Research)

| Thema | Status | Nächster Schritt |
|-------|--------|------------------|
| Token Budgeting Algorithm (Sliding Window vs Hierarchical Summary) | Offene Entscheidung | Phase 2 Planning — empirischer Test mit Ziel-Modellen |
| Semantic Diff für DOCX (Serverless LibreOffice vs Client-only) | Offene Entscheidung | Phase 3 Planning — Trade-off Evaluation |
| Offline Sync Conflict Resolution (Yjs CRDT vs LWW vs Manual) | Offene Entscheidung | Phase 4 Research — Prototype Comparison |
| PDF Parsing Fidelity (pdf-parse vs Serverless PDFium) | Offene Entscheidung | Phase 1 Implementation — Real-Doc Testing |
| IndexedDB Quota Monitoring Strategy | Geplant | Phase 1 Implementation — Warning UI bei 80% |

---

## Artefakte & Pfade

| Artefakt | Pfad | Status |
|----------|------|--------|
| PROJECT.md | `.planning/PROJECT.md` | ✅ Current |
| REQUIREMENTS.md | `.planning/REQUIREMENTS.md` | ✅ Current |
| ROADMAP.md | `.planning/ROADMAP.md` | ✅ Current |
| STATE.md | `.planning/STATE.md` | ✅ Current |
| Research Summary | `.planning/research/SUMMARY.md` | ✅ Current |
| Config | `.planning/config.json` | ✅ Current |
| Phase 1 Plan | `.planning/phases/01-foundation/PLAN.md` | ⏳ Pending |
| Phase 1 Requirements | `.planning/phases/01-foundation/REQUIREMENTS.md` | ⏳ Pending |

---

## Nächste Actions

1. **Phase 1 Discussion** → `/gsd-discuss-phase 1` (oder `--auto` für Defaults)
2. **Phase 1 Planning** → `/gsd-plan-phase 1` (erzeugt PLAN.md mit Verification Loop)
3. **Phase 1 Execution** → `/gsd-execute-phase 1` (wave-basierte Implementierung)

---

*Automatisch aktualisiert bei Phasen-Übergängen via `/gsd-transition` und Meilensteinen via `/gsd-complete-milestone`*