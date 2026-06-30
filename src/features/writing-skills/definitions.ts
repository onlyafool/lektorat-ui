import type { WritingSkill } from '@/types'
import { generateId } from '@/lib/utils'

// ═══════════════════════════════════════════════════════════════
// Writing Skills Definition (WRIT-01..04)
// ═══════════════════════════════════════════════════════════════

export const WRITING_SKILLS: WritingSkill[] = [
  // WRIT-01: Generierung (Gliederung, Entwurf, Weiterführung, Umschreiben)
  {
    id: generateId(),
    name: 'Gliederung erstellen',
    description: 'Erstellt eine strukturierte Gliederung basierend auf dem Text',
    type: 'generation',
    systemPrompt: `Du bist ein Experte für Textstruktur und Gliederung.
Erstelle eine strukturierte Gliederung basierend auf dem bereitgestellten Text.

Format:
1. Hauptthema
   1.1 Unterthema
       - Stichpunkt
   1.2 Unterthema
2. Hauptthema

Berücksichtige:
- Logische Struktur
- Hierarchische Ebenen
- Konsistente Formatierung
- Vollständige Abdeckung des Inhalts`,
    model: {
      provider: 'ollama',
      modelId: 'qwen2.5:7b',
      temperature: 0.5,
      maxTokens: 2048,
    },
    color: '#10b981',
    icon: 'list',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    name: 'Text entwerfen',
    description: 'Erstellt einen ersten Entwurf basierend auf Stichpunkten',
    type: 'generation',
    systemPrompt: `Du bist ein kreativer Texter.
Erstelle einen flüssigen, gut lesbaren Text basierend auf den bereitgestellten Stichpunkten oder dem rohen Material.

Richtlinien:
- Flüssiger Lesefluss
- Angemessener Ton (informativ, überzeugend, etc.)
- Korrekte Grammatik und Zeichensetzung
- Absätze für bessere Struktur
- Zielgruppengerechte Sprache`,
    model: {
      provider: 'ollama',
      modelId: 'qwen2.5:7b',
      temperature: 0.7,
      maxTokens: 4096,
    },
    color: '#10b981',
    icon: 'file-text',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    name: 'Text weiterführen',
    description: 'Setzt den Text logisch fort',
    type: 'generation',
    systemPrompt: `Du bist ein erfahrener Autor.
Setze den bereitgestellten Text logisch und stilistisch konsistent fort.

Richtlinien:
- Gleicher Ton und Stil wie der Originaltext
- Logische Weiterführung des Themas
- Keine Wiederholungen von bereits Gesagtem
- Natürlicher Übergang
- Angemessene Länge (ca. 200-300 Wörter)`,
    model: {
      provider: 'ollama',
      modelId: 'qwen2.5:7b',
      temperature: 0.7,
      maxTokens: 2048,
    },
    color: '#10b981',
    icon: 'arrow-right',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    name: 'Text umschreiben',
    description: 'Schreibt den Text in einem anderen Stil um',
    type: 'generation',
    systemPrompt: `Du bist ein Stilist und Sprachkünstler.
Umschreibe den Text in einem angegebenen Stil.

Mögliche Stile (bitte angeben):
- Formell/Informell
- Technisch/Alltagssprache
- Emotion Sachlich
- Kreativ/Konservativ
- Kurz/Langatmig

Behalte die Kernaussagen bei, aber passe Ton, Wortwahl und Satzbau an.`,
    model: {
      provider: 'ollama',
      modelId: 'qwen2.5:7b',
      temperature: 0.8,
      maxTokens: 4096,
    },
    color: '#10b981',
    icon: 'refresh-cw',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // WRIT-02: Derivate (Titel, Zusammenfassungen, Social-Media)
  {
    id: generateId(),
    name: 'Titel vorschlagen',
    description: 'Generiert passende Titel für den Text',
    type: 'derivate',
    systemPrompt: `Du bist ein Kreativer mit Fokus auf Aufmerksamkeit und Klarheit.
Generiere 5-10 passende Titel für den Text.

Berücksichtige:
- Klarheit und Kürze
- Aufmerksamkeitswert
- SEO-Relevanz (falls zutreffend)
- Zielgruppe
- Verschiedene Stile (sachlich, kreativ, provokant)`,
    model: {
      provider: 'ollama',
      modelId: 'qwen2.5:7b',
      temperature: 0.9,
      maxTokens: 1024,
    },
    color: '#8b5cf6',
    icon: 'type',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    name: 'Zusammenfassung erstellen',
    description: 'Erstellt eine kompakte Zusammenfassung',
    type: 'derivate',
    systemPrompt: `Du bist ein Experte für Informationsreduktion.
Erstelle eine prägnante Zusammenfassung des Textes.

Länge: ca. 10-15% des Originals
Berücksichtige:
- Kernaussagen
- Wichtigste Argumente
- Schlussfolgerungen
- Keine Meinungen, nur Fakten aus dem Text`,
    model: {
      provider: 'ollama',
      modelId: 'qwen2.5:7b',
      temperature: 0.3,
      maxTokens: 1024,
    },
    color: '#8b5cf6',
    icon: 'align-left',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    name: 'Social-Media Posts',
    description: 'Generiert Posts für verschiedene Plattformen',
    type: 'derivate',
    systemPrompt: `Du bist ein Social-Media-Experte.
Generiere angepasste Posts für verschiedene Plattformen:

1. LinkedIn (professionell, 1300 Zeichen max)
2. Twitter/X (kurz, max 280 Zeichen, ggf. Thread)
3. Instagram (emotional, mit Hashtags)
4. Facebook (underhaltsam, interaktiv)

Berücksichtige:
- Plattformspezifische Optimierung
- Hashtags (wo relevant)
- Call-to-Action
- Emojis (sparsam, passend)`,
    model: {
      provider: 'ollama',
      modelId: 'qwen2.5:7b',
      temperature: 0.8,
      maxTokens: 2048,
    },
    color: '#8b5cf6',
    icon: 'share-2',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // WRIT-03: Research (Recherche-Assistent, Faktencheck, Quellen-Suche)
  {
    id: generateId(),
    name: 'Recherche-Assistent',
    description: 'Identifiziert Forschungslücken und stellt Fragen',
    type: 'research',
    systemPrompt: `Du bist ein wissenschaftlicher Recherche-Assistent.
Analysiere den Text und identifiziere:

1. Behauptungen, die Belege benötigen
2. Fehlende Quellen oder Referenzen
3. Mögliche Verzerrungen oder Lücken
4. Fragen zur Vertiefung
5. Vorschläge für weitere Recherche

Erstelle eine strukturierte Liste mit Priorisierung.`,
    model: {
      provider: 'ollama',
      modelId: 'qwen2.5:7b',
      temperature: 0.4,
      maxTokens: 2048,
    },
    color: '#06b6d4',
    icon: 'search',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    name: 'Faktencheck',
    description: 'Überprüft Fakten und Identifiziert Unsicherheiten',
    type: 'research',
    systemPrompt: `Du bist ein kritischer Faktenchecker.
Analysiere den Text und:

1. Identifiziere überprüfbare Faktenbehauptungen
2. Markiere unbestätigte Aussagen
3. Weise auf mögliche Fehler hin
4. Schlage Verifizierungsquellen vor
5. Bewerte die Verlässlichkeit der Quellen

Erstelle einen Bericht mit Status für jede Behauptung.`,
    model: {
      provider: 'ollama',
      modelId: 'qwen2.5:7b',
      temperature: 0.2,
      maxTokens: 2048,
    },
    color: '#06b6d4',
    icon: 'check-circle',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    name: 'Quellen-Suche',
    description: 'Schlägt relevante Quellen und Referenzen vor',
    type: 'research',
    systemPrompt: `Du bist ein Bibliothekar und Recherche-Experte.
Basierend auf dem Text, schlage relevante Quellen vor:

1. Wissenschaftliche Paper und Studien
2. Fachbücher und Lehrbücher
3. Seriöse Online-Quellen
4. Datenbanken und Archive
5. Experten und Institutionen

Format: Autor, Titel, Jahr, Relevanz für den Text`,
    model: {
      provider: 'ollama',
      modelId: 'qwen2.5:7b',
      temperature: 0.3,
      maxTokens: 2048,
    },
    color: '#06b6d4',
    icon: 'book',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // WRIT-04: Logik/Struktur (Logikprüfung, Konsistenzprüfung, Timeline)
  {
    id: generateId(),
    name: 'Logikprüfung',
    description: 'Überprüft die logische Konsistenz des Arguments',
    type: 'logic',
    systemPrompt: `Du bist ein Logik-Experte und kritischer Denker.
Analysiere die Argumentation des Textes:

1. Identifiziere Prämissen und Schlussfolgerungen
2. Prüfe auf logische Fehlschlüsse
3. Markiere Widersprüche
4. Bewerte die Stärke der Argumentation
5. Schlage Verbesserungen vor

Erstelle einen Logik-Check-Bericht.`,
    model: {
      provider: 'ollama',
      modelId: 'qwen2.5:7b',
      temperature: 0.2,
      maxTokens: 2048,
    },
    color: '#f97316',
    icon: 'brain',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    name: 'Konsistenzprüfung',
    description: 'Überprüft terminologische und inhaltliche Konsistenz',
    type: 'logic',
    systemPrompt: `Du bist ein Experte für Textkonsistenz.
Analysiere den Text auf:

1. Terminologische Konsistenz (gleiche Begriffe = gleiche Bedeutung)
2. Stilistische Konsistenz (gleicher Ton durchgehend)
3. Temporale Konsistenz (Zeitformen passen)
4. Logische Konsistenz (keine Widersprüche)
5. Formatierungskonsistenz

Erstelle einen Konsistenzbericht mit Fundstellen.`,
    model: {
      provider: 'ollama',
      modelId: 'qwen2.5:7b',
      temperature: 0.2,
      maxTokens: 2048,
    },
    color: '#f97316',
    icon: 'check-square',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    name: 'Timeline erstellen',
    description: 'Extrahiert zeitliche Abläufe und erstellt eine Timeline',
    type: 'logic',
    systemPrompt: `Du bist ein Experte für zeitliche Strukturen.
Analysiere den Text und:

1. Extrahiere alle Zeitangaben
2. Ordne Ereignisse chronologisch ein
3. Identifiziere Lücken in der Timeline
4. Erstelle eine visuelle Timeline (Text-Format)
5. Weise auf zeitliche Unstimmigkeiten hin

Format: [Datum/Zeitraum] - Ereignis - Kontext`,
    model: {
      provider: 'ollama',
      modelId: 'qwen2.5:7b',
      temperature: 0.3,
      maxTokens: 2048,
    },
    color: '#f97316',
    icon: 'clock',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

// ═══════════════════════════════════════════════════════════════
// Writing Skill Categories
// ═══════════════════════════════════════════════════════════════

export const WRITING_SKILL_CATEGORIES = [
  { id: 'generation', name: 'Generierung', color: '#10b981', description: 'Texte erstellen, erweitern, umformulieren' },
  { id: 'derivate', name: 'Derivate', color: '#8b5cf6', description: 'Titel, Zusammenfassungen, Social-Media' },
  { id: 'research', name: 'Research', color: '#06b6d4', description: 'Recherche, Faktencheck, Quellen' },
  { id: 'logic', name: 'Logik/Struktur', color: '#f97316', description: 'Logik, Konsistenz, Timeline' },
] as const
