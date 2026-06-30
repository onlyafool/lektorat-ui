# Lektorat UI

Eine leistungsstarke Web-App für professionelles Lektorat mit KI-gestützten Personas, visuellem Workflow-Builder und Export in DOCX/PDF/Markdown.

## Features (Implementiert)

- **7 KI-Personas** mit individuellen System-Prompts und Modell-Parametern
  - **Leo Lektor** — Roman-Lektor (Show Don't Tell, Konsistenz, Spannungsbogen)
  - **Korrektor Erik** — Grammatik, Rechtschreibung, Zeichensetzung
  - **Stilistin Luna** — Tonfall, Rhythmus, sprachliche Eleganz
  - **Faktenchecker Otto** — Quellen, Daten, Behauptungen
  - **Logikprüferin Nora** — Argumentation, Struktur, Widersprüche
  - **Lesbarkeits-Experte Finn** — Lesbarkeit, Zielgruppenanpassung
  - **Terminologe Theo** — Fachbegriffe, Konsistenz
- **Visueller Workflow-Builder** mit React Flow (Nodes/Edges)
- **Semantic Diff Engine** (Side-by-Side + Unified)
- **Export** DOCX (Track Changes), PDF (Annotationen), Markdown (Diff-Marker)
- **Command Palette** (Cmd+K)
- **Offline-First** mit IndexedDB
- **Dark/Light Theme**
- **Model Adapter** (Ollama, LM Studio, Anthropic, OpenRouter)
- **Settings Panel** mit Provider-Verwaltung und Auto-Discovery

## Nächste Schritte (Geplant)

Siehe [ROADMAP.md](ROADMAP.md)

## Tech Stack

- React 19 + TypeScript
- Vite 8
- Tailwind CSS 4
- Zustand (State Management)
- React Flow (Workflow Builder)
- IndexedDB (Offline Storage)
- Vitest (Tests)

## Installation

```bash
# Dependencies installieren
npm install

# Development Server starten
npm run dev

# Build für Produktion
npm run build

# Tests ausführen
npm test

# Linting
npm run lint
```

## Projektstruktur

```
src/
├── adapters/          # Model Adapter (Ollama, LMStudio, Anthropic, OpenRouter)
├── components/        # Wiederverwendbare UI-Komponenten
│   ├── a11y/         # Accessibility Komponenten
│   ├── layout/       # Sidebar, Header
│   └── ui/           # Basis UI-Komponenten
├── features/          # Feature-Module
│   ├── command-palette/
│   ├── diff-view/
│   ├── execution-inspector/
│   ├── history-panel/
│   ├── persona-panel/
│   ├── result-viewer/
│   ├── settings-panel/
│   ├── text-editor/
│   └── workflow-builder/
├── lib/              # Utility-Funktionen
│   ├── diff/
│   ├── export/
│   └── utils.ts
├── processors/        # Datei-Parser
├── store/            # Zustand Stores
└── types/            # TypeScript Typen
```

## Keyboard Shortcuts

| Shortcut | Aktion |
|----------|--------|
| `Cmd/Ctrl + K` | Command Palette öffnen |
| `Escape` | Modal schließen |

## Supported File Formats

- `.txt` - Reiner Text
- `.md` - Markdown
- `.docx` - Word Dokument
- `.pdf` - PDF (Text-Extraktion)
- `.rtf` - Rich Text Format

## Model Integration

### Lokale Modelle
- **Ollama** - http://localhost:11434 (Auto-Discovery)
- **LM Studio** - http://localhost:1234 (Auto-Discovery)

### Cloud Modelle
- **Anthropic** - Claude API (API-Key nötig)
- **OpenRouter** - Multi-Provider Gateway (API-Key nötig)

## Development

```bash
# Tests ausführen
npm test

# Linting
npm run lint

# Build prüfen
npm run build
```

## License

MIT
