# Roadmap: Lektorat-Workflow-UI

**Project:** Lektorat-Workflow-UI  
**Granularity:** Standard (5 Phasen, sequenziell)  
**Model Profile:** Budget  
**Stand:** 2025-06-29

---

## Phasen-Übersicht

| Phase | Name | Fokus | Requirements | Status |
|-------|------|-------|--------------|--------|
| 1 | Foundation & Core Platform | Setup, Storage, Parsing, Model Orchestrator | PLAT-01..04, PERS-01, UX-01..02, UX-04 | ⏳ Geplant |
| 2 | Core Loop: Personas & Workflow Engine | Persona-Execution, Workflow Builder MVP, Execution Engine | PERS-02..04, WFLOW-01..02,04, EXPT-01..02 | ⏳ Geplant |
| 3 | Review & Export: Diff, Comments, Export | Diff View, Inline Comments, Export MD/DOCX/PDF | EXPT-03, WRIT-01..04, CTRL-01..04, WFLOW-02 | ⏳ Geplant |
| 4 | Advanced Skills & Workflows | Writing Skills, Control Skills, Advanced Pipeline | WFLOW-03, EXPT-04, UX-03..04 | ⏳ Geplant |
| 5 | Polish & Offline-First | History, Offline-First, Settings, Shortcuts | UX-01..04 (Polish), UX-03 (Offline) | ⏳ Geplant |

---

## Phase 1: Foundation & Core Platform

### Ziel
Lauffähige lokale Web-App mit Vite/React/TS, IndexedDB-Schema (v1 + Migrationen), Datei-Upload + Parsing (5 Formate) → UnifiedTextObject, Model Orchestrator (Local Ollama/LM Studio + Cloud Fallback mit Streaming), Projekt-Manager (Tabs, Persistenz), Theme/Shortcuts/Settings Basis.

### Requirements (mapped)
| Req-ID | Beschreibung |
|--------|--------------|
| PLAT-01 | React + Vite + TS Web-App, deploybar Vercel/Netlify |
| PLAT-02 | Serverless Functions (Edge/Node) für Datei-Processing & Model-Orchestrierung |
| PLAT-03 | Lokale Modell-Integration (Ollama/LM Studio) + Cloud-Fallback (Anthropic/OpenRouter) |
| PLAT-04 | Datei-Upload mit Parsing: .txt, .md, .docx, .pdf, .rtf → UnifiedTextObject |
| PERS-01 | Persona-Registry (CRUD UI, Zod-Schema, IndexedDB persistiert) |
| UX-01 | Dark/Light Theme, Tastatur-Shortcuts, Command Palette (Basis) |
| UX-02 | Projekt-Verwaltung (mehrere Texte parallel, Tabs/Spaces, State pro Tab) |
| UX-04 | Settings: Model-Endpoints, API-Keys, Default-Parameter, Export-Presets (Basis) |

### Success Criteria (observable)
1. `npm run dev` startet Dev-Server, `npm run build` produziert `dist/`, Deploy auf Vercel funktioniert, Health-Check `/api/health` 200
2. IndexedDB Schema v1 initialisiert, Migrationen v1→v2 funktionieren, Export/Import JSON Roundtrip ohne Datenverlust
3. 5 Dateiformate (.txt, .md, .docx, .pdf, .rtf) per Drag&Drop uploadbar → UnifiedTextObject mit `content`, `structure`, `metadata` im Store
4. Ollama Health-Check grün, Anthropic Proxy Call erfolgreich, automatischer Fallback bei lokalem Fehler (Log-Eintrag sichtbar)
5. Theme-Toggle persistiert in localStorage, Cmd+K öffnet Command Palette, Tabs für mehrere Texte, Scroll/Selection State pro Tab erhalten

### Dependencies
- Keine (Fundament-Phase)
- **Risiko-Mitigation:** IndexedDB Migration v1 von Tag 1, Web Worker für Parsing, Adapter-Pattern für Model Provider von Beginn an

---

## Phase 2: Core Loop — Persona Execution & Workflow Engine

### Ziel
Core Value Loop: Persona-Klick → Streaming-Response → Diff-View. Workflow Builder MVP (Nodes/Edges, 3 Kategorien, Save/Load JSON). Execution Engine (topologisch, Checkpoints, Async Iterator, Token Budgeting, Streaming Race Protection).

### Requirements (mapped)
| Req-ID | Beschreibung |
|--------|--------------|
| PERS-02 | 7+ vordefinierte Personas (Korrektor, Stilist, Faktenchecker, Logikprüfer, Terminologie, Struktur, Lesbarkeit) mit distinct System-Prompts + Model-Params |
| PERS-03 | Klick auf Persona-Card → Streaming-Response in ResultViewer |
| PERS-04 | DiffView rendert (Side-by-Side + Unified), Inline-Kommentare anklickbar, Raw-Text kopierbar |
| WFLOW-01 | React Flow Canvas: Nodes hinzufügen, verbinden, löschen, validieren |
| WFLOW-02 | 3 Node-Typen visuell unterscheidbar (Personas, Schreiben, Kontrollieren), Kategorie-Filter in Palette |
| WFLOW-04 | Export `.workflow.json`, Import validiert Schema, Version-Feld vorhanden |
| EXPT-01 | Monaco DiffEditor zeigt Side-by-Side + Unified, Wort/Zeichen/Zeile umschaltbar |
| EXPT-02 | Inline Decorations an Diff-Ankern, Kategorien farbig, Hover → Tooltip |

### Success Criteria (observable)
1. 7 Persona-Cards im Registry, Klick → Streaming-Chunks erscheinen im ResultViewer, Abbruch via X möglich
2. DiffView: Side-by-Side + Unified Toggle, Wort/Zeichen/Zeile Granularität umschaltbar, Scroll-Sync funktioniert
3. Inline-Kommentare: Kategorien (Rechtschreibung, Stil, Logik, Fakten) farblich codiert, Hover zeigt Tooltip mit Detail
4. Workflow Canvas: Mindestens 3 Nodes (1 pro Kategorie) hinzufügbar, verbindbar, JSON Export/Import roundtrip ohne Fehler
5. Execution Engine: Workflow mit 3 sequentiellen Nodes läuft durch, Checkpoints pro Node speicherbar, Token-Budget pro Node einstellbar, AbortController bricht sauber ab

### Dependencies
- **Phase 1** (UnifiedTextObject, Model Orchestrator, IndexedDB, Project Manager)
- **Risiko-Mitigation:** Token Budgeting (Sliding Window + Hierarchical Summary), AbortController pro Execution ID, React Query Mutation Keys für Race Protection

---

## Phase 3: Review & Export — Diff Quality, Writing/Control Skills, Export

### Ziel
Produktionsreife Exports (MD/DOCX/PDF), Semantic Diff Engine, Writing Skills (4 Kategorien) + Control Skills (4 Kategorien) als Node-Typen, Skill-Parameter UI.

### Requirements (mapped)
| Req-ID | Beschreibung |
|--------|--------------|
| EXPT-03 | Export als .md (Diff-Marker), .docx (Track Changes), .pdf (Annotationen) |
| WRIT-01 | Skill-Typ Generierung: Gliederung, Entwurf, Weiterführung, Umschreiben |
| WRIT-02 | Skill-Typ Derivate: Titel, Zusammenfassungen, Social-Media-Posts |
| WRIT-03 | Skill-Typ Research: Recherche-Assistent, Faktencheck, Quellen-Suche |
| WRIT-04 | Skill-Typ Logik/Struktur: Logikprüfung, Konsistenzprüfung, Timeline-Erstellung/-Validierung |
| CTRL-01 | Skill-Typ Regel-Checker: Styleguides, Regelwerke, Terminologie-Prüfung |
| CTRL-02 | Skill-Typ Konsistenz: Begriffe, Schreibweise, Formatierung, zeitlicher Ablauf |
| CTRL-03 | Skill-Typ Logik: Argumentationskette, Widerspruchserkennung, Kausalität |
| CTRL-04 | Skill-Typ Metriken: Lesbarkeit (Flesch, Wiener Sachtextformel), SEO-Score, Custom Scoring |
| WFLOW-02 | Drei Node-Kategorien vollständig (alle Skills als Nodes verfügbar) |

### Success Criteria (observable)
1. Export Buttons: 3 Formate generieren valide Dateien — Word öffnet .docx mit sichtbaren Track Changes, PDF zeigt Annotationen, Markdown enthält Diff-Marker
2. Semantic Diff: Bei Markdown bewahrt Struktur (Headings, Listen), bei DOCX structure-aware, Word-Level Fallback sonst
3. Writing Skills: 4 Generation-Nodes ausführbar, Ergebnisse im Workflow nutzbar (Output → Input next Node)
4. Control Skills: Rule-Checker lädt Styleguide (JSON), prüft Text, liefert Violations Liste; Consistency findet Varianten; Logic erkennt Zirkelschlüsse; Metrics Dashboard zeigt Flesch/Wiener/SEO/Custom
5. Skill Parameter UI: Jeder Skill-Node zeigt konfigurierbare Parameter (Model, Temp, Custom Prompt Suffix, Rules JSON)

### Dependencies
- **Phase 2** (Persona Execution, Diff Viewer, Workflow Engine, Execution Engine)
- **Risiko-Mitigation:** Web Worker für Export Generatoren, Semantic Diff AST-aware für MD (markdown-it), DOCX Track Changes Roundtrip-Test mit Word/LibreOffice in Phase 3

---

## Phase 4: Advanced Workflows & Polish

### Ziel
Differenzierungs-Features: Advanced Pipeline (Branch, Loop, Conditional), Live Execution Inspector, History pro Text, Offline-First Hardening, Batch Processing, Command Palette + Shortcuts Vollausbau.

### Requirements (mapped)
| Req-ID | Beschreibung |
|--------|--------------|
| WFLOW-03 | Parallele & sequentielle Ausführung, Verzweigung (Wenn-Dann), Schleifen |
| EXPT-04 | Historie aller Läufe pro Text (Timestamp, Workflow, Personas, Metriken) |
| UX-03 | Offline-Capability (IndexedDB für Texte, Workflows, Personas), Sync bei Online |
| UX-04 | Settings: Model-Endpoints, API-Keys, Default-Parameter, Export-Presets (Vollausbau) |

### Success Criteria (observable)
1. Branch Node (If/Else) und Loop Node (For-Each) im Builder verfügbar, ausführbar, Live-Inspector zeigt Pfad-Entscheidung
2. Live Execution Inspector: Pause bei laufendem Workflow, Node-Output inspizierbar, Resume/Step-Over funktioniert
3. History Panel: Liste aller Runs pro Text, Klick → Restore View (Diff, Kommentare, Metriken), Metriken vergleichbar
4. Offline: Neuladen ohne Netz → alle Daten da (IndexedDB), Mutationen (neuer Text, Workflow Edit) in Queue → Background Sync bei Online, Konflikt-Resolution (Last-Write-Wins + User Prompt)
5. Command Palette (Cmd+K): Alle Aktionen auffindbar, Shortcuts dokumentiert, Theme Shortcuts funktionieren

### Dependencies
- **Phase 3** (Export, Skills, Diff Engine, Execution Engine)
- **Risiko-Mitigation:** Service Worker + Background Sync API (Safari Fallback: manueller Sync Button), CRDT (Yjs) für Offline Conflict Resolution als Option, Batch Queue in IndexedDB

---

## Phase 5: Polish, Hardening & Release Prep

### Ziel
Produktionsreife: Bug-Fixing, Performance, Accessibility, Dokumentation, Onboarding, Release Pipeline, Smoke Tests.

### Requirements (mapped)
| Req-ID | Beschreibung |
|--------|--------------|
| UX-01 | Dark/Light Theme, Shortcuts, Command Palette (Polish, Edge Cases) |
| UX-02 | Projekt-Verwaltung (Polish: Drag-Reorder, Duplicate, Archive) |
| UX-03 | Offline-First (Finale Härtung: Quota Monitoring, Migration Tests) |
| UX-04 | Settings (Finale: Presets Import/Export, Endpoint Health Checks) |
| — | Performance: Bundle Size < 500kb gzipped, TTI < 3s, Worker Offload verifiziert |
| — | Accessibility: WCAG 2.1 AA (Focus, ARIA, Contrast, Screen Reader) |
| — | Docs: README, Architecture Decision Records, User Guide, Skill Authoring Guide |

### Success Criteria (observable)
1. Lighthouse: Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 90
2. Bundle: `npm run build` → `dist/` < 500kb gzipped (Haupt-Bundle), Worker Chunks separat
3. Offline: 100MB Text + 50 Workflows + 20 Personas in IndexedDB, Quota Warning bei 80%, Migration v1→v3 automatisiert getestet
4. Accessibility: Tab-Navigation durch alle UI, Screen Reader (NVDA/VoiceOver) liest DiffView + Inline Comments korrekt
5. Release: `npm run build` → Preview Deploy → Smoke Tests (Upload → Persona → Workflow → Export) grün → Production Deploy

### Dependencies
- **Phase 4** (alle Features implementiert)
- Keine neuen Features — nur Hardening, Polish, Docs

---

## Phasen-Übergangskriterien (Definition of Done pro Phase)

| Kriterium | Phase 1 | Phase 2 | Phase 3 | Phase 4 | Phase 5 |
|-----------|---------|---------|---------|---------|---------|
| Alle Success Criteria ✅ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Requirements in Phase → Validated | ✓ | ✓ | ✓ | ✓ | ✓ |
| Keine Blocker-Bugs (P0) | ✓ | ✓ | ✓ | ✓ | ✓ |
| Unit Tests ≥ 70% Coverage (Core Libs) | ✓ | ✓ | ✓ | ✓ | ✓ |
| E2E Smoke Test (Critical Path) | ✓ | ✓ | ✓ | ✓ | ✓ |
| ADR Updates dokumentiert | ✓ | ✓ | ✓ | ✓ | ✓ |
| STATE.md aktualisiert | ✓ | ✓ | ✓ | ✓ | ✓ |
| REQUIREMENTS.md Traceability aktualisiert | ✓ | ✓ | ✓ | ✓ | ✓ |

---

## Risiko-Register (Top 5 aus Research)

| Risiko | Phase | Mitigation |
|--------|-------|------------|
| Context Window Overflow | 2 | Token Budgeting pro Node, Hierarchical Summarization, Auto-Truncation mit Notice |
| Diff Accuracy Loss (Structured Docs) | 3 | Semantic Diff (AST-aware MD, Structure-aware DOCX), Word-Level Fallback, Structure Metadata Preservation |
| Streaming Race Conditions | 2 | AbortController per Execution ID, React Query Mutation Keys, Buffered Updates |
| IndexedDB Migration Hell | 1 | Versioned Schema v1, Explicit Migration Functions, Export/Import Fallback |
| File Parsing Fidelity Gap | 1 | Structure Capture definieren, Known Limits dokumentieren, Round-trip Test Suite, Serverless Fallback für High-Fidelity |

---

## Meilensteine & Reviews

| Meilenstein | Nach Phase | Review Typ |
|-------------|------------|------------|
| M1: Foundation Validated | 1 | `/gsd-audit-milestone` — Architecture, IDB, Parsing, Model Routing |
| M2: Core Loop Working | 2 | `/gsd-verify-work` — Persona Click → Diff → Workflow Run |
| M3: Export Quality Gate | 3 | `/gsd-verify-work` — DOCX Track Changes, PDF Annotations, Semantic Diff |
| M4: Advanced Features Complete | 4 | `/gsd-audit-milestone` — Branch/Loop, History, Offline Sync |
| M5: Release Candidate | 5 | `/gsd-complete-milestone` — Lighthouse, Bundle, A11y, Docs, Deploy |

---

*Erstellt: 2025-06-29 | Basiert auf: PROJECT.md, REQUIREMENTS.md, research/SUMMARY.md, config.json (granularity=standard, parallelization=false)*