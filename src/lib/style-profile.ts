export interface StyleProfile {
  sentenceCount: number
  avgSentenceLength: number
  sentenceLengthVariance: number
  wordCount: number
  avgWordLength: number
  fillerWords: FillerWordResult[]
  narrativePerspective: NarrativePerspective
  adjectiveDensity: number
  topWords: WordFrequency[]
  uniqueWordRatio: number
  paragraphCount: number
  avgParagraphLength: number
  dialogueRatio: number
  readingTimeMinutes: number
  fleschReadingEase: number
}

export interface FillerWordResult {
  word: string
  count: number
  perThousand: number
}

export interface WordFrequency {
  word: string
  count: number
}

export type NarrativePerspective = 'ich' | 'er' | 'sie' | 'es' | 'schauplatz' | 'gemischt' | 'unbekannt'

const GERMAN_FILLER_WORDS = [
  'eigentlich', 'ziemlich', 'wirklich', 'sehr', 'ganz', 'etwas', 'einigermaßen',
  'vielleicht', 'wohl', 'fast', 'beinahe', 'ziemlich', 'recht', 'besonders',
  'eher', 'relativ', 'im Grunde', 'im Prinzip', 'sozusagen', 'gewissermaßen',
  'halt', 'mal', 'ja', 'nur', 'doch', 'eben', 'auch', 'noch', 'schon',
  'sowieso', 'auf jeden Fall', 'eigentlich', 'also', 'dann', 'nun',
  'meistens', 'oft', 'manchmal', 'immer', 'nie', 'selten',
  'viel', 'wenig', 'mehr', 'weniger', 'am meisten',
  'gut', 'schlecht', 'schnell', 'langsam', 'groß', 'klein',
  'neu', 'alt', 'jung', 'lang', 'kurz',
]

const ADJECTIVE_ENDINGS = [
  'ig', 'lich', 'sam', 'bar', 'haft', 'isch', 'en', 'em', 'er', 'es',
]

function tokenize(text: string): string[] {
  return text
    .replace(/[^\w\säöüß]/g, ' ')
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 0)
}

function getSentences(text: string): string[] {
  return text
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
}

function getParagraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0)
}

function countSyllables(word: string): number {
  const vowels = 'aeiouyäöü'
  let count = 0
  let prevVowel = false

  for (const char of word) {
    const isVowel = vowels.includes(char)
    if (isVowel && !prevVowel) count++
    prevVowel = isVowel
  }

  return Math.max(1, count)
}

function analyzeNarrativePerspective(text: string): NarrativePerspective {
  const sentences = getSentences(text)
  if (sentences.length === 0) return 'unbekannt'

  let ichCount = 0
  let erSieEsCount = 0
  let schauplatzCount = 0

  for (const sentence of sentences) {
    const words = sentence.toLowerCase().split(/\s+/)
    const firstWords = words.slice(0, 3)

    for (const w of firstWords) {
      if (w === 'ich' || w === 'mein' || w === 'meine' || w === 'meinem') ichCount++
      if (w === 'er' || w === 'sie' || w === 'es' || w === 'ihm' || w === 'ihr') erSieEsCount++
    }

    if (sentence.includes(' - ') || sentence.includes(' — ')) {
      schauplatzCount++
    }
  }

  const total = ichCount + erSieEsCount + schauplatzCount
  if (total === 0) return 'unbekannt'

  const ichRatio = ichCount / total
  const erRatio = erSieEsCount / total

  if (ichRatio > 0.6) return 'ich'
  if (erRatio > 0.6) return 'er'
  if (schauplatzCount / total > 0.4) return 'schauplatz'
  if (ichRatio > 0.25 && erRatio > 0.25) return 'gemischt'

  return 'er'
}

export function analyzeStyle(text: string): StyleProfile {
  const words = tokenize(text)
  const sentences = getSentences(text)
  const paragraphs = getParagraphs(text)
  const wordCount = words.length

  // Satzlänge
  const sentenceLengths = sentences.map((s) => tokenize(s).length)
  const avgSentenceLength = sentenceLengths.length > 0
    ? sentenceLengths.reduce((a, b) => a + b, 0) / sentenceLengths.length
    : 0
  const sentenceLengthVariance = sentenceLengths.length > 0
    ? sentenceLengths.reduce((sum, len) => sum + Math.pow(len - avgSentenceLength, 2), 0) / sentenceLengths.length
    : 0

  // Wortlänge
  const avgWordLength = wordCount > 0
    ? words.reduce((sum, w) => sum + w.length, 0) / wordCount
    : 0

  // Füllwörter
  const fillerResults: FillerWordResult[] = []
  for (const filler of GERMAN_FILLER_WORDS) {
    const count = words.filter((w) => w === filler).length
    if (count > 0) {
      fillerResults.push({
        word: filler,
        count,
        perThousand: wordCount > 0 ? (count / wordCount) * 1000 : 0,
      })
    }
  }
  fillerResults.sort((a, b) => b.perThousand - a.perThousand)

  // Top-Wörter (Stop-Wörter ausschließen)
  const stopWords = new Set(['der', 'die', 'das', 'den', 'dem', 'des', 'ein', 'eine', 'einer', 'einem', 'einen',
    'und', 'oder', 'aber', 'als', 'auch', 'auf', 'aus', 'bei', 'bis', 'da', 'dann', 'das', 'denn',
    'doch', 'du', 'durch', 'er', 'es', 'für', 'hat', 'hier', 'ich', 'ihr', 'in', 'ist', 'ja',
    'jede', 'jeder', 'jedes', 'kann', 'kein', 'keine', 'können', 'man', 'mehr', 'mein', 'mit',
    'nach', 'nicht', 'noch', 'nun', 'nur', 'ob', 'ohne', 'schon', 'sehr', 'sein', 'seine',
    'sich', 'sie', 'sind', 'so', 'über', 'um', 'uns', 'unter', 'was', 'wenn', 'werden', 'wie',
    'will', 'wir', 'wird', 'zu', 'zum', 'zur'])
  const wordFreq: Record<string, number> = {}
  for (const w of words) {
    if (!stopWords.has(w) && w.length > 2) {
      wordFreq[w] = (wordFreq[w] || 0) + 1
    }
  }
  const topWords = Object.entries(wordFreq)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 30)
    .map(([word, count]) => ({ word, count }))

  // Einzigartige Wörter
  const uniqueWords = new Set(words)
  const uniqueWordRatio = wordCount > 0 ? uniqueWords.size / wordCount : 0

  // Adjektiv-Dichte
  const adjectiveCount = words.filter((w) =>
    ADJECTIVE_ENDINGS.some((ending) => w.endsWith(ending) && w.length > 4)
  ).length
  const adjectiveDensity = wordCount > 0 ? (adjectiveCount / wordCount) * 100 : 0

  // Absätze
  const avgParagraphLength = paragraphs.length > 0
    ? paragraphs.reduce((sum, p) => sum + tokenize(p).length, 0) / paragraphs.length
    : 0

  // Dialoge
  const dialogueLines = text.split('\n').filter((line) =>
    line.trim().startsWith('"') || line.trim().startsWith('„') || line.trim().startsWith('"')
  ).length
  const totalLines = text.split('\n').filter((l) => l.trim().length > 0).length
  const dialogueRatio = totalLines > 0 ? dialogueLines / totalLines : 0

  // Flesch Reading Ease (Deutsch)
  const avgSyllablesPerWord = wordCount > 0
    ? words.reduce((sum, w) => sum + countSyllables(w), 0) / wordCount
    : 0
  const fleschReadingEase = Math.min(100, Math.max(0,
    180 - avgSentenceLength - 60 * avgSyllablesPerWord
  ))

  // Lesezeit (200 Wörter/Minute)
  const readingTimeMinutes = wordCount / 200

  return {
    sentenceCount: sentences.length,
    avgSentenceLength: Math.round(avgSentenceLength * 10) / 10,
    sentenceLengthVariance: Math.round(sentenceLengthVariance * 10) / 10,
    wordCount,
    avgWordLength: Math.round(avgWordLength * 10) / 10,
    fillerWords: fillerResults.slice(0, 15),
    narrativePerspective: analyzeNarrativePerspective(text),
    adjectiveDensity: Math.round(adjectiveDensity * 10) / 10,
    topWords,
    uniqueWordRatio: Math.round(uniqueWordRatio * 1000) / 1000,
    paragraphCount: paragraphs.length,
    avgParagraphLength: Math.round(avgParagraphLength * 10) / 10,
    dialogueRatio: Math.round(dialogueRatio * 1000) / 1000,
    readingTimeMinutes: Math.round(readingTimeMinutes * 10) / 10,
    fleschReadingEase: Math.round(fleschReadingEase * 10) / 10,
  }
}
