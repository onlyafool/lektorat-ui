import type { ControlSkill } from '@/types'
import { generateId } from '@/lib/utils'

// ═══════════════════════════════════════════════════════════════
// Control Skills Definition (CTRL-01..04)
// ═══════════════════════════════════════════════════════════════

export const CONTROL_SKILLS: ControlSkill[] = [
  // CTRL-01: Regel-Checker (Styleguides, Regelwerke, Terminologie)
  {
    id: generateId(),
    name: 'DIN 5008 Prüfer',
    description: 'Überprüft Texte nach DIN 5008 Schreib- und Gestaltungsregeln',
    type: 'rules',
    systemPrompt: `Du bist ein Experte für die DIN 5008 Norm.
Überprüfe den Text auf Einhaltung der wichtigsten Regelwerke:

Prüfpunkte:
- Anredeformen (Sie/du)
- Datum- und Zeitformate
- Zahlen und Ziffern
- Einheiten und Maße
- Aufzählungen
- Überschriften
- Absätze und Einrückungen

Erstelle einen Bericht mit Verstößen und Korrekturvorschlägen.`,
    model: {
      provider: 'ollama',
      modelId: 'qwen2.5:7b',
      temperature: 0.1,
      maxTokens: 2048,
    },
    validationRules: [
      'Keine Doppelungen nach Präpositionen',
      'Richtige Anredeformen',
      'Konsistente Zeitformen',
      'Korrekte Zahlenformate',
    ],
    color: '#f59e0b',
    icon: 'book',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    name: 'Corporate Identity Prüfer',
    description: 'Überprüft Einhaltung der CI/CD-Richtlinien',
    type: 'rules',
    systemPrompt: `Du bist ein CI/CD-Experte.
Überprüfe den Text auf Markenkonsistenz:

Prüfpunkte:
- Markennamen korrekt geschrieben
- Terminologie wie in der Styleguide definiert
- Tonfall entspricht der Markenstimme
- Verbotene Begriffe vermieden
- Empfohlene Formulierungen verwendet

Erstelle einen CI-Compliance-Bericht.`,
    model: {
      provider: 'ollama',
      modelId: 'qwen2.5:7b',
      temperature: 0.2,
      maxTokens: 2048,
    },
    validationRules: [
      'Markennamen korrekt',
      'Terminologie einheitlich',
      'Tonfall passend',
      'Keine verbotenen Begriffe',
    ],
    color: '#f59e0b',
    icon: 'shield',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // CTRL-02: Konsistenz (Begriffe, Schreibweise, Formatierung)
  {
    id: generateId(),
    name: 'Terminologie-Konsistenz',
    description: 'Stellt einheitliche Begriffsverwendung sicher',
    type: 'consistency',
    systemPrompt: `Du bist ein Terminologie-Experte.
Analysiere den Text auf terminologische Konsistenz:

1. Identifiziere alle Fachbegriffe
2. Prüfe auf variantenreiche Schreibweise
3. Markiere Inkonsistenzen
4. Schlage Standardbegriffe vor
5. Erstelle ein Glossar der verwendeten Begriffe

Ziel: Einheitliche Terminologie durchgehend.`,
    model: {
      provider: 'ollama',
      modelId: 'qwen2.5:7b',
      temperature: 0.2,
      maxTokens: 2048,
    },
    validationRules: [
      'Gleicher Begriff = gleiche Schreibweise',
      'Keine unbegründeten Synonymwechsel',
      'Abkürzungen beim ersten Mal ausschreiben',
    ],
    color: '#f59e0b',
    icon: 'hash',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    name: 'Formatierungs-Konsistenz',
    description: 'Überprüft einheitliche Formatierung',
    type: 'consistency',
    systemPrompt: `Du bist ein Formatierungs-Experte.
Überprüfe den Text auf:

1. Einheitliche Überschriftenhierarchie
2. Konsistente Aufzählungszeichen
3. Gleiche Datum- und Zeitformate
4. Einheitliche Zahlenformate
5. Konsistente Abstände und Einrückungen

Erstelle einen Formatierungsbericht.`,
    model: {
      provider: 'ollama',
      modelId: 'qwen2.5:7b',
      temperature: 0.1,
      maxTokens: 2048,
    },
    validationRules: [
      'Überschriften hierarchisch',
      'Aufzählungen einheitlich',
      'Formate konsistent',
    ],
    color: '#f59e0b',
    icon: 'layout',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // CTRL-03: Logik (Argumentationskette, Widerspruchserkennung)
  {
    id: generateId(),
    name: 'Argumentations-Analyzer',
    description: 'Analysiert die Argumentationsstruktur',
    type: 'logic',
    systemPrompt: `Du bist ein Argumentations-Experte.
Analysiere die Struktur der Argumentation:

1. Identifiziere Hauptthese
2. Finde Supporting Arguments
3. Prüfe Evidenz für jedes Argument
4. Identifiziere logische Lücken
5. Bewerte Gesamtüberzeugungskraft

Erstelle eine Argumentationsanalyse.`,
    model: {
      provider: 'ollama',
      modelId: 'qwen2.5:7b',
      temperature: 0.3,
      maxTokens: 2048,
    },
    validationRules: [
      'These durch Argumente gestützt',
      'Argumente durch Evidenz belegt',
      'Keine logischen Lücken',
    ],
    color: '#f59e0b',
    icon: 'git-branch',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    name: 'Widerspruchs-Detektor',
    description: 'Findet inhaltliche Widersprüche',
    type: 'logic',
    systemPrompt: `Du bist ein Widerspruchs-Experte.
Analysiere den Text auf:

1. Direkte Widersprüche (Aussage X vs. Aussage Y)
2. Indirekte Widersprüche (implizite Inkonsistenzen)
3. Zeitliche Widersprüche
4. Logische Inkonsistenzen
5. Fakten vs. Interpretation

Erstelle eine Liste aller gefundenen Widersprüche.`,
    model: {
      provider: 'ollama',
      modelId: 'qwen2.5:7b',
      temperature: 0.2,
      maxTokens: 2048,
    },
    validationRules: [
      'Keine direkten Widersprüche',
      'Keine impliziten Inkonsistenzen',
      'Zeitlich konsistent',
    ],
    color: '#f59e0b',
    icon: 'alert-triangle',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // CTRL-04: Metriken (Lesbarkeit, SEO, Custom Scoring)
  {
    id: generateId(),
    name: 'Lesbarkeits-Metriken',
    description: 'Berechnet Lesbarkeitsindizes (Flesch, Wiener Sachtextformel)',
    type: 'metrics',
    systemPrompt: `Du bist ein Metriken-Experte.
Berechne verschiedene Lesbarkeitsindizes:

1. Flesch Reading Ease (deutsch)
2. Flesch-Kincaid Grade Level
3. Wiener Sachtextformel
4. Gunning Fog Index
5. Coleman-Liau Index

Zusätzlich:
- Throughschnittliche Satzlänge
- Durchschnittliche Wortlänge
- Komplexitätsgrad

Erstelle einen Metriken-Bericht.`,
    model: {
      provider: 'ollama',
      modelId: 'qwen2.5:7b',
      temperature: 0.1,
      maxTokens: 2048,
    },
    validationRules: [
      'Flesch > 60 (gut lesbar)',
      'Wiener Sachtextformel < 15 (informativ)',
      'Satzlänge < 25 Wörter (empfohlen)',
    ],
    color: '#f59e0b',
    icon: 'bar-chart',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    name: 'SEO-Checker',
    description: 'Überprüft SEO-Optimierung',
    type: 'metrics',
    systemPrompt: `Du bist ein SEO-Experte.
Analysiere den Text auf SEO-Relevanz:

1. Keyword-Dichte (1-2% empfohlen)
2. Keyword-Platzierung (Titel, Überschriften, Text)
3. Meta-Description (falls vorhanden)
4. URL-Freundlichkeit
5. Interne/Externe Verlinkung
6. Lesbarkeit für Suchmaschinen

Erstelle einen SEO-Optimierungsbericht.`,
    model: {
      provider: 'ollama',
      modelId: 'qwen2.5:7b',
      temperature: 0.3,
      maxTokens: 2048,
    },
    validationRules: [
      'Keyword-Dichte 1-2%',
      'H1 nur einmal',
      'Meta-Description 150-160 Zeichen',
    ],
    color: '#f59e0b',
    icon: 'trending-up',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

// ═══════════════════════════════════════════════════════════════
// Control Skill Categories
// ═══════════════════════════════════════════════════════════════

export const CONTROL_SKILL_CATEGORIES = [
  { id: 'rules', name: 'Regel-Checker', color: '#f59e0b', description: 'Styleguides, Normen, Regelwerke' },
  { id: 'consistency', name: 'Konsistenz', color: '#f59e0b', description: 'Terminologie, Formatierung, Stil' },
  { id: 'logic', name: 'Logik', color: '#f59e0b', description: 'Argumentation, Widersprüche' },
  { id: 'metrics', name: 'Metriken', color: '#f59e0b', description: 'Lesbarkeit, SEO, Scoring' },
] as const
