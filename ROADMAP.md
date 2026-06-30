# ROADMAP — Lektorat UI

## Aktueller Stand (v1.1)

**Status:** MVP funktioniert, 218 Tests bestanden, Build grün.

### Implementiert
- 8 KI-Personas (Leo Lektor, Erik, Luna, Otto, Nora, Finn, Theo, Profiler Luna)
- Text-Editor mit Speicherung (IndexedDB)
- Persona-Panel in der Sidebar
- Skill-Import (SKILL.md Drag & Drop)
- Settings Panel mit Provider-Verwaltung (Ollama, LM Studio, Anthropic, OpenRouter)
- Model Auto-Discovery (LM Studio / Ollama)
- API-Key Verwaltung (nur für Cloud-Provider)
- Dark/Light Theme
- Command Palette (Cmd+K)
- Semantic Diff Engine
- Export (DOCX, PDF, Markdown)
- Workflow-Builder (React Flow)
- ErrorBoundary & Lazy Loading
- 5-Agenten-Lektorat (Korrektor, Stilistin, Logiker, Dramaturg, Profiler)
- Stilprofil-System (Satzlänge, Füllwörter, Perspektive, Lesbarkeit)
- Text-Chunking (nach Überschriften/Paragraphen, mit Überlappung)
- Supabase Backend (Auth, DB, Storage)
- Ergebnis-Persistenz in Supabase
- Ergebnis-Liste in Sidebar
- 218 Tests (Vitest)

---

## Architektur (Ziel)

```
Browser (React App)
    ↓
Supabase
├── Auth (Login, Registrierung)
├── Storage (Manuskripte aus Obsidian Vault)
├── PostgreSQL
│   ├── profiles (User)
│   ├── manuscripts (Manuskripte + Metadaten)
│   ├── chunks (aufgeteilte Texte)
│   ├── personas (User-Personas + importierte Skills)
│   ├── lektorat_results (Ergebnisse + Kommentare)
│   └── embeddings (optional, für RAG später)
└── Edge Functions
    ├── upload-manuscript (Datei hochladen + Chunking)
    ├── import-skill (SKILL.md parsen als Persona)
    ├── run-lektorat (Modell aufrufen)
    └── export-results (DOCX/PDF/MD generieren)
```

---

## Phase 1: Supabase Backend (Nächstes)

**Ziel:** Auth, Storage, Database aufsetzen.

### Aufgaben
- [ ] Supabase Projekt erstellen (supabase.com)
- [ ] Datenbank-Schema erstellen (SQL-Migrationen)
  - `profiles` (id, email, created_at)
  - `manuscripts` (id, user_id, name, folder_path, created_at)
  - `chunks` (id, manuscript_id, content, chapter, position)
  - `personas` (id, user_id, name, system_prompt, model_config, is_builtin)
  - `lektorat_results` (id, manuscript_id, persona_id, comments, score, created_at)
- [ ] Supabase Auth konfigurieren (Email + Google Login)
- [ ] Supabase Storage Bucket erstellen (`manuscripts`)
- [ ] Row Level Security (RLS) Policies
- [ ] Supabase Client im Frontend installieren (`@supabase/supabase-js`)
- [ ] Environment Variables (.env.local)
- [ ] Test: Login, Upload, Download

**Geschätzter Aufwand:** 4-6 Stunden

---

## Phase 2: Datei-Upload (Ordner auswählen)

**Ziel:** Obsidian Vault auswählen, Dateien in Supabase Storage hochladen.

### User-Flow
```
1. User klickt "📁 Ordner auswählen"
2. Browser öffnet Dateiauswahl (File System Access API)
3. User wählt Obsidian Vault Ordner aus
4. App liest alle .md Dateien im Ordner
5. Dateien werden einzeln in Supabase Storage hochgeladen
6. Fortschrittsanzeige im UI
7. Metadaten in PostgreSQL gespeichert
```

### Aufgaben
- [ ] File System Access API implementieren
- [ ] "Ordner auswählen" Button im Sidebar (Texte-Tab)
- [ ] Dateien im Browser lesen
- [ ] Upload zu Supabase Storage (pro Datei)
- [ ] Fortschrittsanzeige (Hochladen 3/12 Dateien...)
- [ ] Metadaten in `manuscripts` Tabelle speichern
- [ ] Fehlerbehandlung (Datei zu groß, Netzwerkfehler)
- [ ] Drag & Drop als Fallback für Chromium-schwache Browser
- [ ] Test: Ordner auswählen → Upload → Dateien erscheinen in Supabase

**Geschätzter Aufwand:** 3-4 Stunden

---

## Phase 3: Skill-Import

**Ziel:** Claude Code Skills als Personas importieren können.

### User-Flow
```
1. User klickt "Skill importieren" im PersonaEditor
2. User wählt SKILL.md Datei aus (oder Ordner)
3. App parst den System-Prompt
4. User kann Name, Beschreibung, Modell-Parameter anpassen
5. Persona wird gespeichert
```

### Aufgaben
- [x] Skill-Parser bauen (liest SKILL.md, extrahiert System-Prompt)
- [x] UI: "Skill importieren" Button im PersonaEditor
- [x] Skill-Vorschau (Name, Prompt, Vorschau)
- [ ] Importierte Skills als Persona speichern (PostgreSQL)
- [ ] Skill-Verzeichnis als Kontext mitladen (optionale Dateien)
- [x] Test: SKILL.md importieren → Persona erscheint in Liste

**Geschätzter Aufwand:** 2-3 Stunden

---

## Phase 4: Stilprofil + Lektorat

**Ziel:** Autoren-Stil analysieren, dann gezielt lektorieren.

### Konzept (von Lektorat.ai übernommen)
Bevor wir lektorieren, analysieren wir den Schreibstil des Autors:
- Durchschnittliche Satzlänge
- Wortwahl (eigenartige Formulierungen)
- Erzählperspektive
- Typische Fehler des Autors
- Stimmung/Tonfall

Dann geben wir nur Vorschläge, die zum Stil passen — nicht generisches KI-Deutsch.

### 5-Agenten-System (parallele Analyse)
| Agent | Aufgabe | Persona |
|-------|---------|---------|
| Korrektor | Rechtschreibung, Grammatik, Kommas | Erik |
| Stilistin | Lesbarkeit, Satzlänge, Füllwörter | Luna |
| Logiker | Widersprüche, Timeline, Konsistenz | Nora |
| Dramaturg | Spannung, Roter Faden, Show Don't Tell | Leo Lektor |
| Profiler | Zielgruppen-Analyse, Genre-Konventionen | Profiler Luna |

### Aufgaben
- [x] Stilprofil-Algorithmus implementieren
  - [x] Satzlänge (Durchschnitt, Varianz)
  - [x] Füllwörter (Häufigkeit pro 1000 Wörter)
  - [x] Wortwahl (Top-Wörter, einzigartige Formulierungen)
  - [x] Erzählperspektive (Ich/Er/Schauplatz)
  - [x] Adjektiv-Dichte
  - [x] Lesbarkeit (Flesch)
  - [x] Dialog-Anteil
- [x] Stilprofil-Store (IndexedDB)
- [x] Stilprofil-UI (Sidebar: Liste + Editor + Import .md)
- [x] Profiler Luna als 8. Built-in Persona
- [ ] Stilprofil in PostgreSQL speichern
- [x] Lektorat-Eingabe: Text + Stilprofil
- [x] 5 Agenten parallel ausführen (lokal)
- [x] Ergebnisse zusammenführen (keine Duplikate)
- [x] Gesamtbewertung (1-10) nach Kategorie
- [x] Test: Stilprofil wird korrekt analysiert (14 Tests)
- [x] Test: Lektorat-Runner (6 Tests)

**Phase 4 abgeschlossen.**

**Geschätzter Aufwand:** 6-8 Stunden

---

## Phase 5: Chunking + Ausführung

**Ziel:** Manuskripte in Chunks aufteilen und Lektorat ausführen.

### Strategie
| Modell-Typ | Chunking | Konsistenz-Check |
|------------|----------|------------------|
| Lokal (Ollama/LM Studio) | Pro Kapitel | Nicht möglich (Context zu klein) |
| Cloud (Claude via Supabase Edge Fn) | Pro Kapitel mit Überlappung | Möglich (größerer Context) |

### Aufgaben
- [x] Chunking-Logik
  - [x] Text nach Kapiteln/Überschriften aufteilen
  - [x] Überlappung (1-2 Absätze) für Kontext
  - [x] Automatisches Chunking im Lektorat-Runner
- [x] Lektorat-Runner mit Chunking
  - [x] Chunk + System-Prompt an Modell senden
  - [x] Ergebnis parsen (Kommentare mit Position, Kategorie, Vorschlag)
  - [x] Kommentar-Positionen auf Originaltext projizieren
- [x] Fortschrittsanzeige (Lektorat: Kapitel 3/12...)
- [x] Ergebnisse zusammenführen (pro Chunk → gesamt)
- [ ] Konsistenz-Check (nur bei Cloud-Modellen):
  - Figuren-Namen über alle Chunks
  - Zeitformen
  - Plot-Details
- [x] Test: Chunking (11 Tests)
- [x] Test: Lektorat-Runner (6 Tests)

**Phase 5 abgeschlossen.**

**Geschätzter Aufwand:** 6-8 Stunden

---

## Phase 6: Ergebnisse anzeigen + Export

**Ziel:** Lektorat-Ergebnisse in Supabase speichern, in Sidebar-Liste anzeigen, als DOCX exportieren.

### Aufgaben
- [x] Supabase Tabelle `lektorat_results` + RLS
- [x] Ergebnisse in Supabase speichern (nach Lektorat-Lauf)
- [x] Ergebnis-Liste in Sidebar (unter Text-Auswahl)
- [x] Einzel-Export: DOCX mit Track Changes
- [x] Einzel-Export: Markdown mit Diff-Markern (besteht bereits)
- [x] Test: Supabase Persistenz + Export

**Phase 6 abgeschlossen.**

---

## Phase 7: Agentic Loop (Zukunft)

**Ziel:** Skills mit Tool-Zugriff (Dateien lesen/schreiben, Bash ausführen).

### Einschränkungen
- Nur mit Supabase Edge Functions möglich
- Komplexe Architektur (Agent + Tools + Sicherheit)
- Sicherheitsbeschränkungen nötig

### Aufgaben
- [ ] Tool-Interface definieren (Read, Write, Bash, Grep)
- [ ] Agent-Loop implementieren (Prompt → Tool-Call → Ergebnis → Prompt)
- [ ] Sicherheitsbeschränkungen (nur erlaubte Pfade)
- [ ] UI für Tool-Aufrufe (sichtbar machen was passiert)

**Geschätzter Aufwand:** 15-20 Stunden

---

## Technische Schulden

- [x] LazySettingsPanel aus LazyComponents.tsx entfernen (nicht mehr verwendet)
- [ ] Monaco Editor für Diff View (optional, aktuell eigene Diff-Komponente)
- [ ] Writing Skills & Control Skills (Ordnerstruktur vorhanden, keine Logik)

---

## Priorisierung

| Phase | Wert | Aufwand | Priorität |
|-------|------|---------|-----------|
| 1. Supabase Backend | Hoch | Mittel | 🔴 |
| 2. Datei-Upload | Hoch | Mittel | 🔴 |
| 3. Skill-Import | Hoch | Niedrig | 🔴 |
| 4. Stilprofil + Lektorat | Hoch | Hoch | 🔴 |
| 5. Chunking + Ausführung | Hoch | Hoch | 🔴 |
| 6. Ergebnisse + Export | Mittel | Mittel | 🟡 |
| 7. Agentic Loop | Niedrig | Sehr hoch | 🟢 |

---

## Kosten-Schätzung

| Dienst | Free Tier | Pro ($25/Mon) |
|--------|-----------|---------------|
| Supabase DB | 500MB | 8GB |
| Supabase Storage | 1GB | 100GB |
| Supabase Auth | 50k Users | 100k Users |
| Supabase Edge Fn | 500k Aufrufe | 2M Aufrufe |
| **Claude API** | — | ~$3-10 pro 8000 Wörter |

**Hinweis:** Claude-Kosten sind variabel. Chunking hält die Kosten niedrig (nur relevante Abschnitte senden).
