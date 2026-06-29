# Projekt: Lektorat-Workflow-UI

## Was das ist

Eine **Web-basierte Workflow-Oberfläche** für Claude Code Lektorat-Skills, die drei Skill-Kategorien in einem flexiblen Workflow-Builder vereint:

1. **Editor-Personas** (7+) — spezialisierte Lektor-Rollen mit Modell-Parametern
2. **Schreib-Skills** — Generierung, Derivate, Research, Logik/Timeline-Prüfung
3. **Kontroll-Skills** — Regelwerke, Konsistenz, Logik, Metriken

Ziel: Texte per Datei-Upload laden, beliebig kombinierte Skill-Pipelines darauf anwenden, Ergebnisse als Diff/Inline-Kommentare/Track-Changes-Export ausgeben.

## Kernwert

**Ein einziger Ort, um alle textbezogenen KI-Workflows (Schreiben → Lektorieren → Kontrollieren) visuell zu bauen, auszuführen und zu versionieren — ohne Code, nur durch Konfiguration.**

## Kontext

- **User**: Einzelner Power-User (Autor/Redakteur), nutzt Claude Code intensiv
- **Bestehende Assets**: Sammlung von Claude Code Skills (Prompts, Parameter, Logik)
- **Pain Point**: Skills liegen verstreut vor, keine UI zum Kombinieren, kein visueller Diff, kein Export
- **Technische Präferenz**: Local-First (Ollama/LM Studio), Cloud als Fallback, Serverless für Heavy-Lifting

## Anforderungen

### Validated
(None yet — ship to validate)

### Active

#### Core Platform
- [ ] **PLAT-01**: React + Vite + TypeScript Web-App, deploybar auf Vercel/Netlify
- [ ] **PLAT-02**: Serverless Functions (Edge/Node) für Datei-Processing & Model-Orchestrierung
- [ ] **PLAT-03**: Lokale Modell-Integration (Ollama/LM Studio API) + Cloud-Fallback (Anthropic/OpenRouter)
- [ ] **PLAT-04**: Datei-Upload mit Parsing: .txt, .md, .docx, .pdf, .rtf → einheitliches Text-Objekt

#### Editor-Personas
- [ ] **PERS-01**: Persona-Registry (Name, Beschreibung, System-Prompt, Model-Parameter: temp, maxTokens, topP, stopSequences)
- [ ] **PERS-02**: 7+ vordefinierte Personas (z.B. Korrektor, Stilist, Faktenchecker, Logikprüfer, Terminologie, Struktur, Lesbarkeit)
- [ ] **PERS-03**: Persona-Auswahl per Klick → führt Prompt auf aktuellem Text aus
- [ ] **PERS-04**: Persona-Ergebnis: Diff-Anzeige (Original vs. Bearbeitet), Inline-Kommentare, Rohtext

#### Schreib-Skills
- [ ] **WRIT-01**: Skill-Typ "Generierung": Gliederung, Entwurf, Weiterführung, Umschreiben
- [ ] **WRIT-02**: Skill-Typ "Derivate": Titel, Zusammenfassungen, Social-Media-Posts
- [ ] **WRIT-03**: Skill-Typ "Research": Recherche-Assistent, Faktencheck, Quellen-Suche
- [ ] **WRIT-04**: Skill-Typ "Logik/Struktur": Logikprüfung, Konsistenzprüfung, Timeline-Erstellung/-Validierung

#### Kontroll-Skills
- [ ] **CTRL-01**: Skill-Typ "Regel-Checker": Styleguides, Regelwerke, Terminologie-Prüfung
- [ ] **CTRL-02**: Skill-Typ "Konsistenz": Begriffe, Schreibweise, Formatierung, zeitlicher Ablauf
- [ ] **CTRL-03**: Skill-Typ "Logik": Argumentationskette, Widerspruchserkennung, Kausalität
- [ ] **CTRL-04**: Skill-Typ "Metriken": Lesbarkeit (Flesch, Wiener Sachtextformel), SEO-Score, Custom Scoring

#### Workflow-Builder
- [ ] **WFLOW-01**: Visueller Builder (Nodes = Skills, Edges = Datenfluss), Drag & Drop
- [ ] **WFLOW-02**: Drei Node-Kategorien farblich getrennt (Personas, Schreiben, Kontrollieren)
- [ ] **WFLOW-03**: Parallele & sequentielle Ausführung, Verzweigung (Wenn-Dann), Schleifen
- [ ] **WFLOW-04**: Workflow speichern/laden/versionieren (JSON), Export als wiederverwendbares Template
- [ ] **WFLOW-05**: Live-Ausführung mit Fortschrittsanzeige, Zwischenergebnisse inspizierbar

#### Ergebnisse & Export
- [ ] **EXPT-01**: Diff-View (Side-by-Side & Unified), zeichen/word/zeilen-granular
- [ ] **EXPT-02**: Inline-Kommentare im Text (ähnlich Word Korrekturmodus), kategorienspezifisch gefärbt
- [ ] **EXPT-03**: Export als .md (mit Diff-Markern), .docx (Track Changes), .pdf (Annotationen)
- [ ] **EXPT-04**: Historie aller Läufe pro Text (Timestamp, Workflow, Personas, Metriken)

#### UX / Infrastruktur
- [ ] **UX-01**: Dark/Light Theme, Tastatur-Shortcuts, Command Palette
- [ ] **UX-02**: Projekt-Verwaltung (mehrere Texte parallel, Tabs/Spaces)
- [ ] **UX-03**: Offline-Capability (IndexedDB für Texte, Workflows, Personas), Sync bei Online
- [ ] **UX-04**: Settings: Model-Endpoints, API-Keys, Default-Parameter, Export-Presets

### Out of Scope

- **Multi-User/Collaboration** — Single-User Tool, keine Echtzeit-Collab
- **Self-Hosted Backend** — Serverless only, kein Docker/K8s-Betrieb
- **Plugin-System für Fremd-Skills** — Erst nur eigene Skills, später evtl. via MCP
- **Mobile App** — Desktop-Web first, Responsive als Nice-to-have
- **Training/Fine-Tuning** — Nur Inference, kein Model-Training

## Schlüsselentscheidungen

| Entscheidung | Begründung | Status |
|--------------|------------|--------|
| React + Vite + TS | Ökosystem, Type-Safety, schnelle HMR, einfach deploybar | ✅ Fest |
| Serverless (Vercel/Netlify) | Kein Server-Betrieb, skaliert mit Nutzung, Edge-Funktionen für Latency | ✅ Fest |
| Local-First Models (Ollama/LM Studio) | Datenschutz, Kostenkontrolle, Offline-Fähigkeit | ✅ Fest |
| Flexibler Workflow-Builder (Nodes/Edges) | Maximale Kombinierbarkeit, deckt alle drei Skill-Kategorien ab | ✅ Fest |
| Diff + Inline-Kommentare + Track Changes Export | Deckt alle Review-Bedürfnisse ab (schnell prüfen, tief prüfen, weitergeben) | ✅ Fest |
| IndexedDB für Offline | Lokale Persistenz ohne Backend-DB, Sync später | ✅ Fest |

## Evolution

Dieses Dokument evolviert an Phasenübergängen und Meilenstein-Grenzen.

**Nach jedem Phasenübergang** (via `/gsd-transition`):
1. Anforderungen invalidiert? → Nach Out of Scope mit Grund
2. Anforderungen validiert? → Nach Validated mit Phasen-Referenz
3. Neue Anforderungen entstanden? → Zu Active hinzufügen
4. Entscheidungen zu loggen? → Zu Schlüsselentscheidungen hinzufügen
5. "Was das ist" noch akkurat? → Aktualisieren falls gedriftet

**Nach jedem Meilenstein** (via `/gsd-complete-milestone`):
1. Vollständiger Review aller Sektionen
2. Core Value Check — noch die richtige Priorität?
3. Audit Out of Scope — Gründe noch valide?
4. Context mit aktuellem Stand aktualisieren

---
*Letzte Aktualisierung: 2025-06-29 nach Initialisierung*