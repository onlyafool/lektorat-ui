# Requirements

## Validated

(None yet — ship to validate)

## Active

### Platform Core

- [ ] **PLAT-01**: React + Vite + TypeScript Web-App, deploybar auf Vercel/Netlify
- [ ] **PLAT-02**: Serverless Functions (Edge/Node) für Datei-Processing & Model-Orchestrierung
- [ ] **PLAT-03**: Lokale Modell-Integration (Ollama/LM Studio API) + Cloud-Fallback (Anthropic/OpenRouter)
- [ ] **PLAT-04**: Datei-Upload mit Parsing: .txt, .md, .docx, .pdf, .rtf → UnifiedTextObject

### Editor-Personas

- [ ] **PERS-01**: Persona-Registry (Name, Beschreibung, System-Prompt, Model-Parameter: temp, maxTokens, topP, stopSequences)
- [ ] **PERS-02**: 7+ vordefinierte Personas (z.B. Korrektor, Stilist, Faktenchecker, Logikprüfer, Terminologie, Struktur, Lesbarkeit)
- [ ] **PERS-03**: Persona-Auswahl per Klick → führt Prompt auf aktuellem Text aus
- [ ] **PERS-04**: Persona-Ergebnis: Diff-Anzeige (Original vs. Bearbeitet), Inline-Kommentare, Rohtext

### Schreib-Skills

- [ ] **WRIT-01**: Skill-Typ "Generierung": Gliederung, Entwurf, Weiterführung, Umschreiben
- [ ] **WRIT-02**: Skill-Typ "Derivate": Titel, Zusammenfassungen, Social-Media-Posts
- [ ] **WRIT-03**: Skill-Typ "Research": Recherche-Assistent, Faktencheck, Quellen-Suche
- [ ] **WRIT-04**: Skill-Typ "Logik/Struktur": Logikprüfung, Konsistenzprüfung, Timeline-Erstellung/-Validierung

### Kontroll-Skills

- [ ] **CTRL-01**: Skill-Typ "Regel-Checker": Styleguides, Regelwerke, Terminologie-Prüfung
- [ ] **CTRL-02**: Skill-Typ "Konsistenz": Begriffe, Schreibweise, Formatierung, zeitlicher Ablauf
- [ ] **CTRL-03**: Skill-Typ "Logik": Argumentationskette, Widerspruchserkennung, Kausalität
- [ ] **CTRL-04**: Skill-Typ "Metriken": Lesbarkeit (Flesch, Wiener Sachtextformel), SEO-Score, Custom Scoring

### Workflow-Builder

- [ ] **WFLOW-01**: Visueller Builder (Nodes = Skills, Edges = Datenfluss), Drag & Drop
- [ ] **WFLOW-02**: Drei Node-Kategorien farblich getrennt (Personas, Schreiben, Kontrollieren)
- [ ] **WFLOW-03**: Parallele & sequentielle Ausführung, Verzweigung (Wenn-Dann), Schleifen
- [ ] **WFLOW-04**: Workflow speichern/laden/versionieren (JSON), Export als wiederverwendbares Template

### Ergebnisse & Export

- [ ] **EXPT-01**: Diff-View (Side-by-Side & Unified), zeichen/word/zeilen-granular
- [ ] **EXPT-02**: Inline-Kommentare im Text (ähnlich Word Korrekturmodus), kategorienspezifisch gefärbt
- [ ] **EXPT-03**: Export als .md (mit Diff-Markern), .docx (Track Changes), .pdf (Annotationen)
- [ ] **EXPT-04**: Historie aller Läufe pro Text (Timestamp, Workflow, Personas, Metriken)

### UX / Infrastruktur

- [ ] **UX-01**: Dark/Light Theme, Tastatur-Shortcuts, Command Palette
- [ ] **UX-02**: Projekt-Verwaltung (mehrere Texte parallel, Tabs/Spaces)
- [ ] **UX-03**: Offline-Capability (IndexedDB für Texte, Workflows, Personas), Sync bei Online
- [ ] **UX-04**: Settings: Model-Endpoints, API-Keys, Default-Parameter, Export-Presets

## Out of Scope

- **Multi-User/Collaboration** — Single-User Tool, keine Echtzeit-Collab
- **Self-Hosted Backend** — Serverless only, kein Docker/K8s-Betrieb
- **Plugin-System für Fremd-Skills** — Erst nur eigene Skills, später evtl. via MCP
- **Mobile App** — Desktop-Web first, Responsive als Nice-to-have
- **Training/Fine-Tuning** — Nur Inference, kein Model-Training

## Traceability

| REQ-ID | Phase | Success Criteria |
|--------|-------|------------------|
| PLAT-01 | 1 | `npm run dev` startet, `npm run build` produziert dist/, Deploy auf Vercel funktioniert |
| PLAT-02 | 1 | Serverless Function deployed, erreichbar unter `/api/*`, Logs sichtbar |
| PLAT-03 | 1 | Ollama Health-Check grün, Anthropic Proxy Call erfolgreich, Fallback bei lokalem Fehler |
| PLAT-04 | 1 | 5 Dateiformate uploadbar → UnifiedTextObject mit content, structure, metadata |
| PERS-01 | 2 | CRUD UI für Personas, Zod-Schema validiert, in IndexedDB persistiert |
| PERS-02 | 2 | 7 Personas im Default-Set, je mit distinct system prompt + params |
| PERS-03 | 2 | Klick auf Persona-Card → Streaming-Response in ResultViewer |
| PERS-04 | 2 | DiffView rendert, InlineComments anklickbar, Raw-Text kopierbar |
| WRIT-01 | 3 | 4 Generation-Skills ausführbar, Ergebnisse in Workflow nutzbar |
| WRIT-02 | 3 | 3 Derivate-Skills ausführbar |
| WRIT-03 | 3 | Research-Skill liefert strukturierte Antwort (Quellen, Claims, Confidence) |
| WRIT-04 | 3 | Logic-Skill erkennt Timeline-Inkonsistenzen, liefert Report |
| CTRL-01 | 3 | Rule-Checker lädt Styleguide (JSON), prüft Text, liefert Violations |
| CTRL-02 | 3 | Consistency-Checker findet Begriffsvarianten, Schreibweisen, Datumsformate |
| CTRL-03 | 3 | Logic-Checker identifiziert Zirkelschlüsse, fehlende Prämissen |
| CTRL-04 | 3 | Metrics berechnet Flesch/Wiener, SEO-Score, Custom, zeigt Dashboard |
| WFLOW-01 | 2 | React Flow Canvas: Nodes hinzufügen, verbinden, löschen, validieren |
| WFLOW-02 | 2 | 3 Node-Typen visuell unterscheidbar, Kategorie-Filter in Palette |
| WFLOW-03 | 2 | Branch-Node (if/else), Loop-Node (for-each), Parallel-Execution sichtbar |
| WFLOW-04 | 2 | Export .workflow.json, Import validiert Schema, Version feld vorhanden |
| EXPT-01 | 2 | Monaco DiffEditor zeigt Side-by-Side + Unified, Wort-Zeichen-Zeile umschaltbar |
| EXPT-02 | 2 | Inline Decorations an Diff-Ankern, Kategorien farbig, Hover → Tooltip |
| EXPT-03 | 3 | 3 Export-Buttons generieren valide Dateien, Word öffnet Track Changes |
| EXPT-04 | 4 | History-Panel: Liste Runs, Klick → Restore View, Metriken sichtbar |
| UX-01 | 1 | Theme Toggle persistiert, Cmd+K öffnet Palette, Shortcuts dokumentiert |
| UX-02 | 1 | Tabs für Texte, Zustand (Scroll, Selection) pro Tab erhalten |
| UX-03 | 4 | Offline: neu laden ohne Netz → Daten da, Mutation Queue → Sync bei Online |
| UX-04 | 1 | Settings Modal: Endpoints testbar, Keys maskiert, Presets export/import |

---
*Requirements defined: 2025-06-29*
*Based on: FEATURES.md MVP Definition + Research*