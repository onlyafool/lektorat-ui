# Leo Lektor - Vollständige Dokumentation

> **Version:** 1.0.0  
> **Stand:** Juli 2026  
> **Projekt:** Leo Lektor – KI-gestützter Lektorat-Editor für Claude Code Skills

---

## Inhaltsverzeichnis

1. [Übersicht & Philosophie](#1-übersicht--philosophie)
2. [Architektur & Technologie-Stack](#2-architektur--technologie-stack)
3. [Kern-Features](#3-kern-features)
4. [Die 8 Lektor-Personas](#4-die-8-lektor-personas)
5. [Workflow-Builder (Visuelle Pipeline)](#5-workflow-builder-visuelle-pipeline)
6. [LLM-Anbindung & Konfiguration](#6-llm-anbindung--konfiguration)
7. [Eigene Lektoren erstellen & Importieren](#7-eigene-lektoren-erstellen--importieren)
8. [Datei-Formate & Export](#8-datei-formate--export)
9. [Offline-First & Datenspeicherung](#9-offline-first--datenspeicherung)
10. [Authentifizierung & Cloud-Sync](#10-authentifizierung--cloud-sync)
11. [Entwickler-Setup & Build](#11-entwickler-setup--build)
12. [Fehlende Features & Roadmap](#12-fehlende-features--roadmap)
13. [FAQ & Troubleshooting](#13-faq--troubleshooting)

---

## 1. Übersicht & Philosophie

### Was ist Leo Lektor?

Leo Lektor ist ein **lokal-first, datenschutzfreundlicher Lektorat-Editor**, der speziell für die Arbeit mit **Claude Code Skills** entwickelt wurde. Er kombiniert:

- **Visuelle Workflow-Pipelines** für Lektorat-Schritte
- **8 spezialisierte Lektor-Personas** mit unterschiedlichen Temperaturen
- **Lokale LLM-Modelle** (Ollama, LM Studio) mit Cloud-Fallback
- **Offline-First** Architektur mit IndexedDB
- **Electron Desktop App** für Windows & macOS

### Design-Prinzipien

| Prinzip | Umsetzung |
|---------|-----------|
| **Lokal-First** | Alle Daten bleiben lokal; Cloud nur auf Wunsch |
| **Datenschutz** | Keine zwingende Cloud-Anbindung; Supabase optional |
| **Extensibilität** | Eigene Personas, Skills, Workflows per JSON importierbar |
| **Kostenkontrolle** | Chunking, Token-Limits, lokale Modelle bevorzugt |
| **Deutsche UX** | Vollständig deutsche Oberfläche & Dokumentation |

---

## 2. Architektur & Technologie-Stack

### Frontend
```
React 19 + TypeScript + Vite 8
├── Zustand (State Management)
├── React Flow (Visuelle Workflows)
├── Tailwind CSS 4 (Dark Blue Theme)
├── Monaco Editor (Code/Markdown)
├── IndexedDB (idb) für Offline-Speicherung
└── Supabase Client (Auth & Sync)
```

### Backend / Services
```
Supabase (Optional)
├── PostgreSQL (User Data, Workflows)
├── Auth (Google OAuth + Email/Password)
├── Storage (File Uploads)
└── Realtime (Collaborative Editing - geplant)

Electron 43 (Desktop Wrapper)
├── Custom Protocol: lektorat://
├── Node.js 22/24 Compatibility
└── NSIS (Windows) / DMG (macOS) Build
```

### Lokale LLM-Integration
```
Ollama (localhost:11434)
├── Auto-Discovery laufender Modelle
├── Modell-Liste via /api/tags
└── Streaming via /api/chat

LM Studio (localhost:1234)
├── OpenAI-kompatible API
├── Auto-Discovery auf Port 1234
└── Modell-Wechsel zur Laufzeit
```

---

## 3. Kern-Features

### 3.1 Visueller Workflow-Builder (React Flow)
- **Drag & Drop** Nodes für Lektorat-Schritte
- **Node-Typen:**
  - `Persona-Node` – Wählt eine der 8 Personas
  - `Skill-Node` – Fügt Writing/Control Skill hinzu
  - `Chunk-Node` – Text-Aufteilung (Kostenkontrolle)
  - `Condition-Node` – If/Else Logik
  - `Loop-Node` – Wiederholungen
  - `Output-Node` – Export-Format
- **Connections** definieren Ausführungsreihenfolge
- **Live-Preview** der Pipeline-Ausführung

### 3.2 Personen-Management
- 8 vordefinierte Personas (siehe Abschnitt 4)
- Eigene Personas per JSON importierbar
- Temperatur (0.0–2.0) pro Persona einstellbar
- System-Prompt & Few-Shot Examples pro Persona

### 3.3 Skill-System
**Writing Skills (Text erzeugen/verbessern):**
- `grammar_fix` – Grammatik & Rechtschreibung
- `style_improve` – Stilistische Aufwertung
- `tone_adjust` – Tonfall anpassen
- `summarize` – Zusammenfassung
- `expand` – Ausführung
- `translate` – Übersetzung

**Control Skills (Qualitätssicherung):**
- `consistency_check` – Konsistenzprüfung
- `fact_check` – Faktenprüfung (lokal begrenzt)
- `terminology_check` – Fachbegriff-Konsistenz
- `length_control` – Längenbegrenzung
- `format_check` – Format-Vorgaben

### 3.4 Kostenkontrolle & Chunking
```typescript
interface ChunkConfig {
  maxTokensPerChunk: 2000;      // Default
  overlapTokens: 200;           // Überlappung
  maxTotalTokens: 50000;        // Hard Limit
  preferLocalModel: true;       // Lokal first
  cloudFallbackThreshold: 0.8;  // Qualitätsschwelle
}
```

### 3.5 Datei-Verarbeitung
| Format | Import | Export |
|--------|--------|--------|
| `.md` / `.markdown` | ✅ | ✅ |
| `.txt` | ✅ | ✅ |
| `.docx` | ✅ (via mammoth) | ✅ |
| `.pdf` | ✅ (Text-Extraktion) | ❌ |
| `.json` (Workflow) | ✅ | ✅ |
| `.lektorat` (Projekt) | ✅ | ✅ |

---

## 4. Die 8 Lektor-Personas

Jede Persona hat **feste Temperatur**, **System-Prompt** und **Fokus-Bereich**:

| # | Name | Temp | Fokus | Use Case |
|---|------|------|-------|----------|
| 1 | **Strenge Korrektorin** | 0.1 | Grammatik, Rechtschreibung, Zeichensetzung | Endkontrolle vor Veröffentlichung |
| 2 | **Stilistische Feinschleiferin** | 0.3 | Satzrhythmus, Wortwahl, Eleganz | Belletristik, Essays, hochwertige Texte |
| 3 | **Fachliche Prüferin** | 0.2 | Fachbegriffe, Konsistenz, Logik | Fachartikel, Dokumentation, Technical Writing |
| 4 | **Kreative Umformerin** | 0.7 | Neue Perspektiven, Metaphern, Analogien | Marketing, kreatives Schreiben, Brainstorming |
| 5 | **Kürzungs-Expertin** | 0.3 | Redundanzen entfernen, Kernaussage stärken | Abstracts, Teaser, Social Media |
| 6 | **Erklärende Vermittlerin** | 0.5 | Komplexes einfach machen, Beispiele | Tutorials, Dokumentation, Wissensvermittlung |
| 7 | **Kritische Herausforderin** | 0.6 | Gegenargumente, Lücken, Schwachstellen | Argumentations-Check, Peer-Review |
| 8 | **Neutrale Protokollantin** | 0.0 | Exakte Wiedergabe, keine Interpretation | Protokolle, Zitate, rechtliche Texte |

### Persona-Struktur (JSON)
```json
{
  "id": "strict_corrector",
  "name": "Strenge Korrektorin",
  "temperature": 0.1,
  "systemPrompt": "Du bist eine strenge Korrektorin...",
  "focusAreas": ["grammar", "spelling", "punctuation"],
  "fewShotExamples": [
    {"input": "Das Buch ist gut.", "output": "Das Buch ist gut."}
  ],
  "icon": "✏️",
  "color": "#ef4444"
}
```

---

## 5. Workflow-Builder (Visuelle Pipeline)

### 5.1 Grundlagen
- **Canvas** mit Zoom/Pan
- **Node-Palette** links (kategorisiert)
- **Inspector** rechts (Node-Einstellungen)
- **Toolbar** oben (Speichern, Ausführen, Export)

### 5.2 Typische Pipeline-Beispiele

#### Beispiel 1: Standard-Lektorat
```
[Text Input] → [Chunk: 2000 Tokens] 
    → [Persona: Strenge Korrektorin] 
    → [Skill: grammar_fix] 
    → [Persona: Stilistische Feinschleiferin] 
    → [Skill: style_improve] 
    → [Output: Markdown]
```

#### Beispiel 2: Fachartikel mit Qualitäts-Check
```
[Text Input] → [Chunk: 3000 Tokens]
    → [Persona: Fachliche Prüferin]
    → [Skill: terminology_check]
    → [Condition: Terminologie OK?]
        ├─ Ja → [Persona: Erklärende Vermittlerin]
        └─ Nein → [Alert: Fachbegriffe prüfen] → [Persona: Fachliche Prüferin]
    → [Skill: consistency_check]
    → [Output: DOCX + Report]
```

#### Beispiel 3: Kreatives Schreiben mit Iteration
```
[Text Input] → [Persona: Kreative Umformerin] (Temp 0.7)
    → [Loop: 3 Iterationen]
        → [Skill: expand] → [Persona: Kritische Herausforderin]
    → [Persona: Stilistische Feinschleiferin]
    → [Output: Markdown + Varianten]
```

### 5.3 Pipeline-Ausführung
1. **Validierung** – Zyklen prüfen, erforderliche Felder
2. **Chunking** – Text in Überlappungs-Chunks splitten
3. **Parallelisierung** – Unabhängige Chunks parallel verarbeiten
4. **Streaming** – Ergebnisse live in UI anzeigen
5. **Aggregation** – Chunks mit Überlappung zusammenfügen
5. **Post-Processing** – Finaler Quality-Check
6. **Export** – Gewähltes Format schreiben

---

## 6. LLM-Anbindung & Konfiguration

### 6.1 Lokale Modelle (Bevorzugt)

#### Ollama
```bash
# Installation
curl -fsSL https://ollama.com/install.sh | sh

# Modelle pullen
ollama pull llama3.1:8b
ollama pull mistral:7b
ollama pull phi3:mini
```
**Auto-Discovery:** Leo Lektor scannt `http://localhost:11434/api/tags` alle 30s.

#### LM Studio
1. LM Studio herunterladen & starten
2. Modelle im „Local Server“ Tab laden
3. Server starten (Port 1234)
3. Leo Lektor erkennt automatisch via `http://localhost:1234/v1/models`

### 6.2 Cloud-Fallback (Optional)
| Anbieter | Konfiguration | Kosten |
|----------|---------------|--------|
| **OpenRouter** | API Key in Settings | Pay-per-Token |
| **Anthropic** | API Key in Settings | Pay-per-Token |
| **OpenAI** | API Key in Settings | Pay-per-Token |
| **Custom OpenAI-kompatibel** | Base URL + API Key | Variabel |

### 6.3 Modell-Auswahl pro Workflow
```yaml
# In Workflow-Node konfigurierbar
model:
  provider: "ollama"        # ollama | lmstudio | openrouter | anthropic | openai | custom
  modelName: "llama3.1:8b"  # Exakter Modell-Name
  temperature: 0.3          # Überschreibt Persona-Temp
  maxTokens: 4096
  topP: 0.9
```

### 6.4 Kosten-Dashboard
- **Token-Zähler** pro Request/Response
- **Kosten-Schätzung** (basierend auf Anbieter-Preisen)
- **Monats-Limit** konfigurierbar
- **Warnung** bei 80% Limit

---

## 7. Eigene Lektoren erstellen & Importieren

### 7.1 Eigene Persona erstellen (JSON)
```json
{
  "id": "my_custom_persona",
  "name": "Mein Spezial-Lektor",
  "description": "Fokus auf juristische Texte",
  "temperature": 0.15,
  "systemPrompt": "Du bist ein spezialisierter Jurist...",
  "focusAreas": ["legal_terminology", "contract_structure", "compliance"],
  "fewShotExamples": [
    {
      "input": "Der Vertrag ist unwirksam.",
      "output": "Der Vertrag ist gemäß § 134 BGB nichtig, da er gegen ein gesetzliches Verbot verstößt."
    }
  ],
  "icon": "⚖️",
  "color": "#3b82f6",
  "version": "1.0.0",
  "author": "Max Mustermann",
  "tags": ["legal", "contract", "german_law"]
}
```

### 7.2 Import über UI
1. **Settings** → **Personas** → **Importieren**
2. JSON-Datei auswählen
3. Validierung prüft:
   - Pflichtfelder (`id`, `name`, `temperature`, `systemPrompt`)
   - Temperatur 0.0–2.0
   - Eindeutige `id`
4. Bei Erfolg: In lokaler DB (IndexedDB) gespeichert
5. Optional: Mit Supabase syncen (Cloud)

### 7.3 Export & Teilen
- **Einzelne Persona:** Rechtsklick → „Exportieren“ → `.json`
- **Gesamte Bibliothek:** Settings → „Alle Personas exportieren“
- **Workflow + Personas:** Projekt-Export (`.lektorat`) enthält alles

### 7.5 Persona-Bibliothek importieren
Für umfassende Lektorat-Workflows stehen vorbereitete Persona-Bibliotheken bereit:

**Verfügbare Dateien:**
| Datei | Inhalt |
|-------|--------|
| `LEO_LEKTOR_PERSONAS_CORE_GENRE.json` | 11 Kern-Lektoren + 6 Genre-Spezialisten |
| `LEO_LEKTOR_PERSONAS_COAUTORS.json` | 11 Co-Autor-Perspektiven + 4 IT-Security Spezialisten |

**Import-Schritte:**
1. **Settings** → **Personas** → **Importieren**
2. JSON-Datei auswählen (z.B. `LEO_LEKTOR_PERSONAS_CORE_GENRE.json`)
3. Validierung prüft:
   - Pflichtfelder (`id`, `name`, `type`, `role`, `description`, `traits`)
   - Eindeutige `id`
   - Struktur der Persona
4. Bei Erfolg: In lokaler DB (IndexedDB) gespeichert
5. Persona ist sofort im Workflow-Knoten-Palette verfügbar

**Persona-Typen:**
- `core` – Allgemeine Lektoren mit unterschiedlichen Fokus
- `genre` – Spezialisierte Lektoren für literarische Genre
- `coautor_perspektive` – Co-Autor mit ganz spezifischer Sichtweise
- `spezial_coautor` – Fachliche Co-Autoren (z.B. IT-Security, Deepfake-Forensik)

### 7.4 Import aus Claude Code Skills
 Claude Code Skills haben ein anderes Format. Leo Lektor bietet einen **Konverter**:

```typescript
// Konverter-Logik (vereinfacht)
function convertClaudeSkillToPersona(claudeSkill: ClaudeSkill): Persona {
  return {
    id: `claude_${claudeSkill.name.toLowerCase().replace(/\s+/g, '_')}`,
    name: claudeSkill.name,
    temperature: mapClaudeTempToNumber(claudeSkill.temperature),
    systemPrompt: claudeSkill.instructions,
    focusAreas: claudeSkill.tags || [],
    fewShotExamples: claudeSkill.examples?.map(e => ({
      input: e.input,
      output: e.expected_output
    })) || [],
    icon: "🤖",
    color: "#8b5cf6",
    source: "claude_code",
    originalSkillId: claudeSkill.id
  };
}
```

**Import-Schritte:**
1. Claude Skill JSON exportieren (aus Claude Code)
2. In Leo Lektor: Settings → **Claude Skills importieren**
3. Datei auswählen → Konverter läuft automatisch
4. Ergebnis prüfen → Speichern

---

## 8. Datei-Formate & Export

### 8.1 Projekt-Datei (`.lektorat`)
```json
{
  "version": "1.0.0",
  "metadata": {
    "title": "Mein Lektorat-Projekt",
    "created": "2026-07-10T10:30:00Z",
    "author": "user@example.com",
    "tags": ["blog", "technisch"]
  },
  "sourceText": "...",
  "workflow": { /* React Flow JSON */ },
  "personas": [ /* verwendete Personas */ ],
  "results": {
    "chunks": [ /* verarbeitete Chunks */ ],
    "finalText": "...",
    "report": { /* Qualitäts-Metriken */ }
  },
  "settings": {
    "model": "ollama:llama3.1:8b",
    "chunkSize": 2000,
    "exportFormat": "markdown"
  }
}
```

### 8.2 Export-Formate

| Format | Beschreibung | Use Case |
|--------|--------------|----------|
| **Markdown** | `.md` mit Frontmatter | Blog, GitHub, Static Sites |
| **DOCX** | Word-Dokument mit Track Changes | Weitergabe an Autoren/Verlage |
| **PDF** | Druckfertig (via Print CSS) | Druck, Archiv |
| **HTML** | Semantisches HTML5 | Web-Publishing |
| **JSON** | Strukturierte Daten | Weiterverarbeitung, API |
| **Report** | Qualitäts-Report (PDF/HTML) | QA-Dokumentation |

### 8.3 Export-Einstellungen
```typescript
interface ExportConfig {
  format: 'markdown' | 'docx' | 'pdf' | 'html' | 'json';
  includeMetadata: boolean;
  includeReport: boolean;
  trackChanges: boolean;     // Nur DOCX
  template?: string;         // Custom CSS/Template
  filename: string;
}
```

---

## 9. Offline-First & Datenspeicherung

### 9.1 IndexedDB Schema (via `idb`)
```typescript
// Stores
'projects'          // .lektorat Projekte
'personas'          // Eigene + importierte Personas
'workflows'         // Gespeicherte Workflow-Templates
'settings'          // User Preferences
'llmCache'          // Modell-Listen, Token-Cache
'authTokens'        // Supabase Tokens (encrypted)
```

### 9.2 Offline-Fähigkeiten
| Feature | Offline | Online (Sync) |
|---------|---------|---------------|
| Projekte bearbeiten | ✅ | ✅ |
| Workflows bauen | ✅ | ✅ |
| Lokale LLMs nutzen | ✅ | ✅ |
| Personas verwalten | ✅ | ✅ |
| Export erstellen | ✅ | ✅ |
| Cloud-Sync | ❌ | ✅ |
| Supabase Auth | ❌ | ✅ |
| Modell-Discovery | ✅ (Cached) | ✅ |

### 9.3 Sync-Strategie (Supabase)
- **Conflict Resolution:** Last-Write-Wins + User-Prompt bei Konflikten
- **Selective Sync:** Nur markierte Projekte
- **Verschlüsselung:** Client-seitig (AES-GCM) vor Upload
- **Hintergrund-Sync:** Alle 5 Min bei Online-Status

---

## 10. Authentifizierung & Cloud-Sync

### 10.1 Supabase Setup
```env
# .env.local
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 10.2 Auth-Methoden
| Methode | Status | Details |
|---------|--------|---------|
| **Email/Password** | ✅ | Standard Registrierung/Login |
| **Google OAuth** | ✅ | Redirect: `lektorat://auth/callback` |
| **Magic Link** | 🔄 Geplant | Passwordless Login |
| **GitHub OAuth** | 🔄 Geplant | Für Developer |

### 10.3 OAuth-Konfiguration (Google)
1. **Google Cloud Console** → APIs & Services → Credentials
2. **Authorized redirect URIs:**
   - `http://localhost:3000/lektorat-ui/` (Dev)
   - `lektorat://auth/callback` (Electron)
   - `https://your-domain.com/lektorat-ui/` (Production)
3. **Client ID/Secret** in Supabase Dashboard hinterlegen

### 10.4 Daten-Modell (Supabase)
```sql
-- profiles (extends auth.users)
create table profiles (
  id uuid references auth.users primary key,
  email text unique,
  display_name text,
  avatar_url text,
  settings jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- projects
create table projects (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id),
  title text,
  data jsonb,           -- .lektorat JSON
  is_public boolean default false,
  tags text[],
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- personas (shared library)
create table personas (
  id text primary key,
  user_id uuid references profiles(id),
  name text,
  data jsonb,           -- Persona JSON
  is_public boolean default false,
  downloads int default 0,
  created_at timestamptz default now()
);
```

---

## 11. Entwickler-Setup & Build

### 11.1 Voraussetzungen
```bash
# Node.js 22+ (empfohlen: 24 LTS)
node --version  # v22.x oder v24.x

# pnpm (empfohlen) oder npm
corepack enable pnpm
```

### 11.2 Installation
```bash
# Repository klonen
git clone https://github.com/onlyafool/lektorat-ui.git
cd lektorat-ui

# Dependencies
pnpm install

# Environment
cp .env.example .env.local
# VITE_SUPABASE_URL & ANON_KEY eintragen
```

### 11.3 Development
```bash
# Web-Dev (Port 3000)
pnpm dev

# Electron-Dev (gleichzeitig Vite + Electron)
pnpm electron:dev

# Type Check
pnpm typecheck

# Lint
pnpm lint

# Tests
pnpm test:run
```

### 11.4 Production Build
```bash
# Web (für GitHub Pages / Vercel)
pnpm build

# Electron Windows
pnpm electron:build:win

# Electron macOS
pnpm electron:build:mac

# Alle Platforms
pnpm electron:build:all
```

### 11.5 CI/CD (GitHub Actions)
**Workflows:**
- `.github/workflows/ci.yml` – Tests, Lint, Typecheck bei jedem Push
- `.github/workflows/build-desktop.yml` – Electron Build bei Tags `v*`
- `.github/workflows/deploy-web.yml` – GitHub Pages Deploy

**Release erstellen:**
```bash
# Version bump
npm version patch|minor|major

# Tag pushen → CI baut automatisch
git push origin master --tags
```

---

## 12. Fehlende Features & Roadmap

### 12.1 Hoch Priorität (Q3 2026)
| Feature | Status | Aufwand |
|---------|--------|---------|
| **Collaborative Editing** | 🔄 Design | 3 Wochen |
| **Plugin-System** (Custom Nodes) | 📋 Spec | 2 Wochen |
| **Batch-Processing** (Mehrere Dateien) | 📋 Spec | 1 Woche |
| **Version History** (Pro Projekt) | 📋 Spec | 2 Wochen |
| **Team Workspaces** (Supabase) | 📋 Spec | 3 Wochen |

### 12.2 Mittel Priorität (Q4 2026)
| Feature | Status | Aufwand |
|---------|--------|---------|
| **Claude Code Skill Marketplace** | 💡 Idee | 4 Wochen |
| **Advanced Prompt Engineering UI** | 💡 Idee | 2 Wochen |
| **Multi-Language UI** (EN/FR/ES) | 💡 Idee | 2 Wochen |
| **Mobile PWA** | 💡 Idee | 3 Wochen |
| **Voice Input/Output** | 💡 Idee | 2 Wochen |

### 12.3 Nice-to-Have (2027+)
- **Fine-Tuning Interface** für eigene Modelle
- **RAG-Integration** (Wissensdatenbanken)
- **Automatische Qualitäts-Metriken** (Readability, SEO, etc.)
- **CI/CD für Text-Pipelines** (GitHub Actions Integration)
- **Enterprise SSO** (SAML/OIDC)

### 12.4 Bekannte Bugs & Limitations
| Bug | Workaround |
|-----|------------|
| Electron CI: Weißer Screen | Lokal `npm run electron:build:win` nutzen |
| LM Studio Discovery manchmal langsam | Manuell Port 1234 prüfen |
| Große Dateien (>50k Tokens) langsam | Chunk-Size reduzieren |
| PDF-Export Layout-Issues | Erst DOCX → Word → PDF |
| Supabase Sync Konflikte | Manuell auflösen (UI geplant) |

---

## 13. FAQ & Troubleshooting

### 13.1 Häufige Fragen

**Q: Warum funktioniert Google Login in Electron nicht?**
A: Prüfen Sie:
- `lektorat://` Protokoll registriert? (`main.cjs` Zeile 11)
- Supabase Redirect URLs enthalten `lektorat://auth/callback`
- In `auth-store.ts` wird `lektorat://` korrekt erkannt

**Q: Lokales Modell wird nicht gefunden?**
A: 
- Ollama: `curl http://localhost:11434/api/tags` testen
- LM Studio: Local Server läuft auf Port 1234?
- Firewall/Antivirus blockiert localhost-Ports?

**Q: Build schlägt fehl mit "ERR_NAME_NOT_RESOLVED"?**
A: OAuth Redirect nutzt `file://` statt `lektorat://`. Siehe Fix in `auth-store.ts` Zeile 77-79.

**Q: Wie setze ich Token-Limits?**
A: Settings → **Kostenkontrolle** → Monatliches Limit + Warnschwelle

**Q: Kann ich Leo Lektor ohne Internet nutzen?**
A: **Ja!** Vollständig offline mit lokalen Modellen (Ollama/LM Studio). Nur Auth & Cloud-Sync brauchen Internet.

### 13.2 Debug-Logs
```bash
# Electron Logs (Windows)
%USERPROFILE%\AppData\Roaming\Lektorat\logs\main-*.log

# Web Dev Tools
F12 → Console → Filter: [Auth], [LLM], [Workflow]

# Supabase Logs
Dashboard → Logs → Auth / Database / Realtime
```

### 13.3 Performance-Tipps
1. **Chunk-Size** auf 1500–2000 Tokens setzen
2. **Lokale Modelle** für 80% der Tasks nutzen
3. **Parallelisierung** im Workflow aktivieren (unabhängige Chunks)
4. **Cache** leeren: Settings → Erweitert → Cache löschen

---

## Anhang A: Tastenkürzel

| Aktion | Windows/Linux | macOS |
|--------|---------------|-------|
| Neues Projekt | `Ctrl+N` | `Cmd+N` |
| Projekt öffnen | `Ctrl+O` | `Cmd+O` |
| Speichern | `Ctrl+S` | `Cmd+S` |
| Workflow ausführen | `F5` | `F5` |
| Export | `Ctrl+E` | `Cmd+E` |
| Settings | `Ctrl+,` | `Cmd+,` |
| Zoom Canvas | `Ctrl+Scroll` | `Cmd+Scroll` |
| Node suchen | `Ctrl+P` | `Cmd+P` |

---

## Anhang B: Konfigurations-Dateien

### `vite.config.ts` (Auszug)
```typescript
export default defineConfig({
  base: './',                    // Wichtig für Electron
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: { /* Code Splitting */ }
      }
    }
  },
  server: { port: 3000 }
});
```

### `electron-builder.json` (package.json build section)
```json
{
  "appId": "com.lektorat.ui",
  "productName": "Lektorat",
  "files": ["dist/**/*", "electron/**/*.cjs"],
  "directories": { "output": "release" },
  "win": { "target": "nsis", "icon": "public/favicon.svg" },
  "mac": { "target": "dmg", "icon": "public/favicon.svg" },
  "nsis": { "oneClick": false, "allowToChangeInstallationDirectory": true }
}
```

---

## Lizenz & Mitwirkung

**Lizenz:** MIT License – Siehe `LICENSE` Datei

**Contributing:**
1. Fork & Branch (`feature/mein-feature`)
2. Commits: Conventional Commits (`feat:`, `fix:`, `docs:`)
3. PR erstellen → CI muss grün sein
4. Code Review → Merge

**Kontakt:**
- Issues: [GitHub Issues](https://github.com/onlyafool/lektorat-ui/issues)
- Discussions: [GitHub Discussions](https://github.com/onlyafool/lektorat-ui/discussions)

---

*Letzte Aktualisierung: 10.07.2026 – Version 1.0.0*  
*Dokumentation generiert für Leo Lektor v1.0.0*